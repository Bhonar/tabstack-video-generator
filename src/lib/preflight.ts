import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { getTabstackKey, hasWaveSpeedKey } from "./defaults.js";

// ── Types ──

export interface PreflightResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

// ── ANSI colors ──

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// ── Package root (works from dist/lib/preflight.js in installed package) ──

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = path.dirname(__filename_local);

export function getPackageRoot(): string {
  return path.resolve(__dirname_local, "../..");
}

// ── Pre-flight checks ──

export async function runPreflight(aiProvider?: string): Promise<PreflightResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: TABSTACK_API_KEY (required for page extraction)
  if (!getTabstackKey()) {
    errors.push(
      "TABSTACK_API_KEY is not set. Get your key at https://tabstack.ai and run: npx @tabstack/video-generator --setup",
    );
  }

  // Check 2: FFmpeg
  try {
    execSync("which ffmpeg", { stdio: "pipe" });
  } catch {
    const platform = process.platform;
    const installHint =
      platform === "darwin"
        ? "Install with: brew install ffmpeg  (or download from https://evermeet.cx/ffmpeg/)"
        : platform === "linux"
          ? "Install with: sudo apt install ffmpeg"
          : "Install from: https://ffmpeg.org/download.html  (or: winget install ffmpeg)";
    errors.push(`FFmpeg is not installed. ${installHint}`);
  }

  // Check 3: WAVESPEED_API_KEY (optional — for AI-generated music)
  if (!hasWaveSpeedKey()) {
    warnings.push(
      "WAVESPEED_API_KEY is not set. Videos will use static placeholder music. Set it for AI-generated background music via https://wavespeed.ai",
    );
  }

  // Check 4: Audio files
  const audioDir = path.resolve(getPackageRoot(), "public/audio");
  try {
    const files = fs.readdirSync(audioDir).filter((f) => f.endsWith(".mp3"));
    if (files.length === 0) {
      warnings.push(
        "No audio files found. Videos will render silently. Run: npx @tabstack/video-generator --setup",
      );
    }
  } catch {
    warnings.push(
      "Audio directory not found. Run: npx @tabstack/video-generator --setup",
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

// ── Formatted report for terminal ──

export function formatPreflightReport(result: PreflightResult): string {
  const lines: string[] = [];

  if (result.ok && result.warnings.length === 0) {
    lines.push(`${GREEN}All pre-flight checks passed.${RESET}`);
    return lines.join("\n");
  }

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      lines.push(`${RED}  ✗ ${err}${RESET}`);
    }
  }

  for (const warn of result.warnings) {
    lines.push(`${YELLOW}  ⚠ ${warn}${RESET}`);
  }

  if (!result.ok) {
    lines.push("");
    lines.push(`${DIM}Run "npx @tabstack/video-generator --setup" to fix these issues.${RESET}`);
  }

  return lines.join("\n");
}
