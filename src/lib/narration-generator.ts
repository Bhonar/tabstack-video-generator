import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { GoogleGenAI } from "@google/genai";
import { logDetail } from "./progress.js";
import { getPackageRoot } from "./preflight.js";
import { getGeminiKey as getGeminiKeyDefault } from "./defaults.js";

// ── Types ──

export interface GenerateNarrationOptions {
  script: string;
}

export interface GenerateNarrationResult {
  filePath: string;
  fileName: string;
  durationMs: number;
}

// ── Helpers ──

function getGeminiKey(): string {
  const key = getGeminiKeyDefault();
  if (!key) {
    throw new Error("GEMINI_API_KEY not set for TTS narration generation.");
  }
  return key;
}

/**
 * Generate TTS narration audio using Gemini 2.5 Flash Preview TTS.
 * Returns a WAV file in public/audio/.
 */
export async function generateNarration(
  options: GenerateNarrationOptions,
): Promise<GenerateNarrationResult> {
  const startTime = Date.now();
  const apiKey = getGeminiKey();

  logDetail("Generating TTS narration with Gemini...");

  const ai = new GoogleGenAI({ apiKey });

  // Use Gemini TTS model
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: options.script,
    config: {
      responseModalities: ["audio"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore", // Confident, professional voice
          },
        },
      },
    },
  });

  // Extract audio data from response
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;

  if (!audioData || !audioData.data) {
    throw new Error("No audio data in Gemini TTS response");
  }

  // Gemini TTS returns PCM audio data (base64 encoded)
  const pcmBuffer = Buffer.from(audioData.data, "base64");
  const mimeType = audioData.mimeType || "audio/L16;rate=24000";

  logDetail(`TTS response: ${pcmBuffer.length} bytes, mime: ${mimeType}`);

  // Parse sample rate from mime type
  const rateMatch = mimeType.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;

  // Save raw PCM to temp file
  const audioDir = path.resolve(getPackageRoot(), "public/audio");
  fs.mkdirSync(audioDir, { recursive: true });

  const timestamp = Date.now();
  const rawPath = path.resolve(audioDir, `narration-raw-${timestamp}.pcm`);
  const wavPath = path.resolve(audioDir, `narration-${timestamp}.wav`);
  const fileName = `narration-${timestamp}.wav`;

  fs.writeFileSync(rawPath, pcmBuffer);

  // Convert PCM to WAV using ffmpeg
  try {
    execSync(
      `ffmpeg -y -f s16le -ar ${sampleRate} -ac 1 -i "${rawPath}" "${wavPath}"`,
      { stdio: "pipe", timeout: 15000 },
    );
    logDetail(`Narration WAV created: ${fileName}`);
  } catch (error) {
    // Clean up
    try { fs.unlinkSync(rawPath); } catch {}
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to convert PCM to WAV: ${msg}`);
  }

  // Clean up raw PCM
  try { fs.unlinkSync(rawPath); } catch {}

  const durationMs = Date.now() - startTime;
  const stats = fs.statSync(wavPath);
  logDetail(
    `Narration saved: ${fileName} (${(stats.size / 1024).toFixed(0)} KB, generated in ${(durationMs / 1000).toFixed(1)}s)`,
  );

  return { filePath: wavPath, fileName, durationMs };
}

// ── Cleanup ──

export function cleanupGeneratedNarration(): void {
  const audioDir = path.resolve(getPackageRoot(), "public/audio");
  try {
    const files = fs
      .readdirSync(audioDir)
      .filter((f) => f.startsWith("narration-") && (f.endsWith(".wav") || f.endsWith(".pcm")));
    for (const file of files) {
      fs.unlinkSync(path.resolve(audioDir, file));
    }
    if (files.length > 0) {
      logDetail(
        `Cleaned up ${files.length} previously generated narration file(s)`,
      );
    }
  } catch {
    // Ignore cleanup errors
  }
}
