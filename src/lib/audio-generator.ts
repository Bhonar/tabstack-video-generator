import fs from "fs";
import path from "path";
import { logDetail } from "./progress.js";
import { getPackageRoot } from "./preflight.js";
import { getWaveSpeedKey as getWaveSpeedKeyDefault, hasWaveSpeedKey } from "./defaults.js";

// ── Constants ──

const WAVESPEED_BASE = "https://api.wavespeed.ai/api/v3";
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;

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
}

// ── Main function ──

/**
 * Generate background music using WaveSpeed Minimax Music 2.5.
 * Submits a job, polls for completion, downloads the MP3 to public/audio/.
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

  while (Date.now() < pollDeadline) {
    await sleep(POLL_INTERVAL_MS);

    const pollResponse = await fetch(
      `${WAVESPEED_BASE}/predictions/${requestId}/result`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!pollResponse.ok) {
      logDetail(`Poll returned ${pollResponse.status}, retrying...`);
      continue;
    }

    const pollData = (await pollResponse.json()) as PollResponse;

    if (pollData.data?.status === "completed") {
      audioUrl = pollData.data.outputs?.[0] ?? null;
      break;
    }

    if (pollData.data?.status === "failed") {
      const errorMsg = pollData.data.error || "Unknown error";
      throw new Error(`WaveSpeed audio generation failed: ${errorMsg}`);
    }

    logDetail("Audio generation in progress...");
  }

  if (!audioUrl) {
    throw new Error("Audio generation timed out after 120s");
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

  const durationMs = Date.now() - startTime;
  logDetail(
    `Audio saved: ${fileName} (${(audioBuffer.length / 1024).toFixed(0)} KB, generated in ${(durationMs / 1000).toFixed(1)}s)`,
  );

  return { filePath, fileName, durationMs };
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
