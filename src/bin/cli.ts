#!/usr/bin/env node

/**
 * @tabstack/video-generator — Unified entry point
 *
 * Usage modes:
 *   tabstack-video                       → MCP server (STDIO) — used by `claude mcp add`
 *   tabstack-video --setup               → Interactive setup wizard
 *   tabstack-video --url <url> [opts]    → CLI mode, generates video directly
 *   tabstack-video --help                → Show usage
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ── ANSI ──

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

// ── Arg detection ──

const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(flag);
const getFlagValue = (flag: string): string | undefined => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
};

// ── Route to the right mode ──

async function main() {
  // Always try to load .env.local from cwd (for --setup, --url, and MCP modes)
  loadEnvLocal();

  // --help / -h
  if (hasFlag("--help") || hasFlag("-h")) {
    printUsage();
    process.exit(0);
  }

  // --setup
  if (hasFlag("--setup")) {
    const { runSetup } = await import("../lib/setup.js");
    await runSetup();
    return;
  }

  // --url <url> → CLI mode
  const url = getFlagValue("--url");
  if (url) {
    await runCli(url);
    return;
  }

  // No flags → MCP server mode (what `claude mcp add` expects)
  const { startServer } = await import("../server.js");
  await startServer();
}

// ── CLI video generation mode ──

async function runCli(url: string) {
  // Validate URL
  try {
    new URL(url);
  } catch {
    console.error(`${RED}Error: Invalid URL "${url}"${RESET}`);
    process.exit(1);
  }

  // Validate audio mood
  const VALID_MOODS = ["tech", "elegant", "corporate", "energetic", "minimal"];
  const audioMood = getFlagValue("--audio-mood");
  if (audioMood && !VALID_MOODS.includes(audioMood)) {
    console.error(
      `${RED}Error: Invalid audio mood "${audioMood}". Must be one of: ${VALID_MOODS.join(", ")}${RESET}`,
    );
    process.exit(1);
  }

  const outputPath = getFlagValue("--output") || "./out/video.mp4";
  const noOpen = hasFlag("--no-open");
  const noAiAudio = hasFlag("--no-ai-audio");

  // Pre-flight
  console.log(`\n${BOLD}Pre-flight checks${RESET}`);
  const { runPreflight, formatPreflightReport } = await import("../lib/preflight.js");
  const preflight = await runPreflight();
  console.log(formatPreflightReport(preflight));

  if (!preflight.ok) {
    console.error(
      `\n${RED}Cannot continue. Run "npx @tabstack/video-generator --setup" first.${RESET}\n`,
    );
    process.exit(1);
  }

  // Generate
  console.log(`\n${BOLD}Generating video for ${url}${RESET}`);
  console.log("-".repeat(50));

  const { setOutputMode } = await import("../lib/progress.js");
  setOutputMode("cli");

  const { generateVideo } = await import("../tools/generate-video.js");
  const startTime = Date.now();

  const result = await generateVideo({
    url,
    outputPath,
    audioMoodOverride: audioMood,
    skipAiAudio: noAiAudio,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Done
  console.log("");
  console.log(
    `${GREEN}${BOLD}Done!${RESET} Video saved to: ${BOLD}${result.outputPath}${RESET}`,
  );
  console.log(
    `${DIM}  Duration: ${result.durationSeconds.toFixed(1)}s | Scenes: ${result.sceneCount} | Audio: ${result.audioMood}${result.audioGenerated ? " (AI)" : ""} | Rendered in ${elapsed}s${RESET}`,
  );

  // Auto-open
  if (!noOpen) {
    console.log(`\nOpening video...`);
    openFile(result.outputPath);
  }

  console.log("");
}

// ── Load .env.local ──

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  try {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env.local — preflight will catch missing keys
  }
}

// ── Auto-open ──

function openFile(filepath: string): void {
  const resolved = path.resolve(filepath);
  try {
    if (process.platform === "darwin") {
      execSync(`open "${resolved}"`, { stdio: "pipe" });
    } else if (process.platform === "linux") {
      execSync(`xdg-open "${resolved}"`, { stdio: "pipe" });
    }
  } catch {
    // Silently fail if opener not available
  }
}

// ── Usage ──

function printUsage(): void {
  console.log(`
${BOLD}@tabstack/video-generator${RESET}
Turn any landing page into a premium product launch video.

${BOLD}Install:${RESET}
  ${CYAN}claude mcp add tabstack-video${RESET} \\
    ${DIM}-e TABSTACK_API_KEY=...${RESET} \\
    ${DIM}-e GEMINI_API_KEY=...${RESET} \\
    ${DIM}-e WAVESPEED_API_KEY=... ${RESET}${DIM}(optional, for AI music)${RESET} \\
    ${DIM}-- npx @tabstack/video-generator${RESET}

${BOLD}Usage:${RESET}
  npx @tabstack/video-generator --setup               Interactive setup wizard
  npx @tabstack/video-generator --url <url> [options]  Generate a video
  npx @tabstack/video-generator                        Start MCP server (STDIO)

${BOLD}CLI Options:${RESET}
  --url <url>           Landing page URL ${DIM}(required for CLI mode)${RESET}
  --output <path>       Output file path ${DIM}(default: ./out/video.mp4)${RESET}
  --audio-mood <mood>   ${DIM}tech | elegant | corporate | energetic | minimal${RESET}
  --no-ai-audio         Skip AI music generation, use static audio files
  --no-open             Don't auto-open the video after rendering
  --help                Show this help message

${BOLD}Examples:${RESET}
  npx @tabstack/video-generator --url https://stripe.com
  npx @tabstack/video-generator --url https://vercel.com --audio-mood elegant
  npx @tabstack/video-generator --url https://linear.app --output ./linear.mp4 --no-open

${BOLD}Claude Code:${RESET}
  Just ask: "Generate a video for https://example.com"
`);
}

// ── Run ──

main().catch((err) => {
  console.error(`\n${RED}Error: ${err.message}${RESET}`);
  if (
    err.message.includes("API_KEY") ||
    err.message.includes("FFmpeg") ||
    err.message.includes("setup")
  ) {
    console.error(`${DIM}Run "npx @tabstack/video-generator --setup" to fix this.${RESET}`);
  }
  process.exit(1);
});
