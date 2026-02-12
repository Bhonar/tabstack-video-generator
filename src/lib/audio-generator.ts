import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { logDetail } from "./progress.js";
import { getPackageRoot } from "./preflight.js";
import { getWaveSpeedKey as getWaveSpeedKeyDefault, hasWaveSpeedKey } from "./defaults.js";
import MusicTempo from "music-tempo";

// ── Constants ──

const WAVESPEED_BASE = "https://api.wavespeed.ai/api/v3";
const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 300_000; // 5 minutes — WaveSpeed queue can be slow

// ── Helpers ──

function getWaveSpeedKey(): string {
  const key = getWaveSpeedKeyDefault();
  if (!key) {
    throw new Error(
      "WAVESPEED_API_KEY not set. Get your key at https://wavespeed.ai",
    );
  }
  return key;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Types ──

interface SubmitResponse {
  code?: number;
  data: {
    id: string;
    status: string;
  };
}

interface PollResponse {
  data: {
    id: string;
    status: "processing" | "completed" | "failed";
    outputs?: string[];
    timings?: Record<string, number>;
    error?: string;
  };
}

export interface GenerateAudioOptions {
  prompt: string;
  lyrics: string;
  bitrate?: number;
  sampleRate?: number;
}

export interface GenerateAudioResult {
  filePath: string;
  fileName: string;
  durationMs: number;
  bpm?: number;
  beatTimes?: number[]; // beat timestamps in milliseconds
  beatFrames?: number[]; // beat frame numbers @ 30fps
}

// ── Beat Analysis ──

/**
 * Analyze beat pattern from MP3 file.
 * Uses FFmpeg to decode → music-tempo to detect BPM and beat times.
 */
async function analyzeBeatPattern(mp3Path: string): Promise<{
  bpm: number;
  beatTimes: number[];
  beatFrames: number[];
} | null> {
  try {
    // 1. Decode MP3 to raw PCM using FFmpeg
    const tempPcmPath = mp3Path.replace(".mp3", ".pcm");

    execSync(
      `ffmpeg -i "${mp3Path}" -f f32le -acodec pcm_f32le -ac 1 -ar 44100 "${tempPcmPath}" -y`,
      { stdio: "pipe" }
    );

    // 2. Read PCM data as Float32Array
    const pcmBuffer = fs.readFileSync(tempPcmPath);
    const audioData = new Float32Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.length / 4
    );

    // 3. Analyze with music-tempo
    const tempo = MusicTempo(audioData);

    if (!tempo || !tempo.tempo || !tempo.beats) {
      logDetail("Beat detection returned no results");
      // Clean up temp file
      try {
        fs.unlinkSync(tempPcmPath);
      } catch {}
      return null;
    }

    const bpm = Math.round(tempo.tempo);
    const beatTimes = tempo.beats.map((beat: number) => Math.round(beat * 1000)); // seconds → ms

    // Convert to frame numbers @ 30fps
    const beatFrames = beatTimes.map((ms: number) => Math.round((ms / 1000) * 30));

    // Clean up temp file
    try {
      fs.unlinkSync(tempPcmPath);
    } catch {}

    return { bpm, beatTimes, beatFrames };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logDetail(`Beat analysis failed: ${msg}`);
    return null;
  }
}

// ── Main function ──

/**
 * Generate background music using WaveSpeed Minimax Music 2.5.
 * Submits a job, polls for completion, downloads the MP3 to public/audio/.
 * Analyzes beat pattern for animation synchronization.
 */
export async function generateAudio(
  options: GenerateAudioOptions,
): Promise<GenerateAudioResult> {
  const startTime = Date.now();
  const apiKey = getWaveSpeedKey();

  // 1. Submit generation job
  logDetail("Submitting audio generation to WaveSpeed Minimax Music 2.5...");

  const submitResponse = await fetch(`${WAVESPEED_BASE}/minimax/music-2.5`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: options.prompt,
      lyrics: options.lyrics,
      bitrate: options.bitrate ?? 256000,
      sample_rate: options.sampleRate ?? 44100,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!submitResponse.ok) {
    const text = await submitResponse.text().catch(() => "");
    throw new Error(
      `WaveSpeed submit failed (${submitResponse.status}): ${text}`,
    );
  }

  const submitData = (await submitResponse.json()) as SubmitResponse;
  const submitAny = submitData as unknown as Record<string, unknown>;
  const requestId =
    submitData.data?.id ??
    (submitAny.id as string) ??
    (submitAny.requestId as string);

  if (!requestId) {
    throw new Error(
      `No request ID in WaveSpeed response: ${JSON.stringify(submitData)}`,
    );
  }

  logDetail(`Audio generation submitted: ${requestId}`);

  // 2. Poll for completion
  const pollDeadline = Date.now() + POLL_TIMEOUT_MS;
  let audioUrl: string | null = null;
  let pollCount = 0;

  while (Date.now() < pollDeadline) {
    await sleep(POLL_INTERVAL_MS);
    pollCount++;

    let pollResponse: Response;
    try {
      pollResponse = await fetch(
        `${WAVESPEED_BASE}/predictions/${requestId}/result`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(15_000),
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logDetail(`Poll fetch error: ${msg}, retrying...`);
      continue;
    }

    if (!pollResponse.ok) {
      logDetail(`Poll returned ${pollResponse.status}, retrying...`);
      continue;
    }

    const rawText = await pollResponse.text();
    let pollData: PollResponse;
    try {
      pollData = JSON.parse(rawText) as PollResponse;
    } catch {
      logDetail(`Poll returned non-JSON, retrying...`);
      continue;
    }

    // Log first poll response for debugging
    if (pollCount === 1) {
      logDetail(`First poll response: ${rawText.slice(0, 300)}`);
    }

    const status = pollData.data?.status;

    if (status === "completed") {
      audioUrl = pollData.data.outputs?.[0] ?? null;
      logDetail(`Audio generation completed!`);
      break;
    }

    if (status === "failed") {
      const errorMsg = pollData.data.error || "Unknown error";
      throw new Error(`WaveSpeed audio generation failed: ${errorMsg}`);
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    // Only log every 4th poll to reduce noise (every ~20s)
    if (pollCount % 4 === 0 || pollCount <= 2) {
      logDetail(`Audio generation in progress... (${elapsed}s elapsed, status: ${status || "unknown"})`);
    }
  }

  if (!audioUrl) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    throw new Error(`Audio generation timed out after ${elapsed}s`);
  }

  logDetail("Audio generation complete, downloading MP3...");

  // 3. Download MP3 to public/audio/
  const fileName = `generated-${Date.now()}.mp3`;
  const audioDir = path.resolve(getPackageRoot(), "public/audio");
  const filePath = path.resolve(audioDir, fileName);

  // Ensure directory exists
  fs.mkdirSync(audioDir, { recursive: true });

  const audioResponse = await fetch(audioUrl, {
    signal: AbortSignal.timeout(30_000),
  });

  if (!audioResponse.ok) {
    throw new Error(
      `Failed to download generated audio: ${audioResponse.status}`,
    );
  }

  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
  fs.writeFileSync(filePath, audioBuffer);

  const generationDurationMs = Date.now() - startTime;
  logDetail(
    `Audio saved: ${fileName} (${(audioBuffer.length / 1024).toFixed(0)} KB, generated in ${(generationDurationMs / 1000).toFixed(1)}s)`,
  );

  // 4. Analyze beats using music-tempo
  logDetail("Analyzing beat pattern...");
  const beatAnalysis = await analyzeBeatPattern(filePath);

  if (beatAnalysis) {
    logDetail(`Detected ${beatAnalysis.bpm} BPM, ${beatAnalysis.beatTimes.length} beats`);
  }

  return {
    filePath,
    fileName,
    durationMs: generationDurationMs,
    bpm: beatAnalysis?.bpm,
    beatTimes: beatAnalysis?.beatTimes,
    beatFrames: beatAnalysis?.beatFrames,
  };
}

// ── Check if audio generation is available ──

export function isAudioGenerationAvailable(): boolean {
  return hasWaveSpeedKey();
}

// ── Clean up previously generated audio files ──

export function cleanupGeneratedAudio(): void {
  const audioDir = path.resolve(getPackageRoot(), "public/audio");
  try {
    const files = fs
      .readdirSync(audioDir)
      .filter((f) => f.startsWith("generated-") && f.endsWith(".mp3"));
    for (const file of files) {
      fs.unlinkSync(path.resolve(audioDir, file));
    }
    if (files.length > 0) {
      logDetail(
        `Cleaned up ${files.length} previously generated audio file(s)`,
      );
    }
  } catch {
    // Ignore cleanup errors
  }
}
