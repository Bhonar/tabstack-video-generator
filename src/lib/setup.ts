import readline from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { runPreflight, formatPreflightReport, getPackageRoot } from "./preflight.js";
import { getTabstackKey, hasWaveSpeedKey } from "./defaults.js";

// ── ANSI ──

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// ── Helpers ──

function print(msg: string) {
  process.stdout.write(msg + "\n");
}

function stepOk(step: number, total: number, msg: string) {
  print(`${CYAN}[${step}/${total}]${RESET} ${msg} ${GREEN}✓${RESET}`);
}

function stepFail(step: number, total: number, msg: string) {
  print(`${CYAN}[${step}/${total}]${RESET} ${msg} ${RED}✗${RESET}`);
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// ── Main ──

export async function runSetup(): Promise<void> {
  const TOTAL_STEPS = 4;

  print("");
  print(`${BOLD}@tabstack/video-generator — Setup${RESET}`);
  print("=".repeat(40));
  print("");

  // ── Step 1: Node.js ──
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0], 10);
  if (major < 18) {
    stepFail(1, TOTAL_STEPS, `Node.js ${nodeVersion} — requires v18+`);
    print(`\n${RED}Please upgrade Node.js to v18 or later.${RESET}`);
    process.exit(1);
  }
  stepOk(1, TOTAL_STEPS, `Node.js ${nodeVersion}`);

  // ── Step 2: FFmpeg ──
  try {
    const ffmpegOut = execSync("ffmpeg -version", { stdio: "pipe" })
      .toString()
      .split("\n")[0];
    const version = ffmpegOut.match(/ffmpeg version (\S+)/)?.[1] ?? "installed";
    stepOk(2, TOTAL_STEPS, `FFmpeg ${version}`);
  } catch {
    stepFail(2, TOTAL_STEPS, "FFmpeg not found");
    print("");
    print(`${YELLOW}FFmpeg is required for video rendering.${RESET}`);
    if (process.platform === "darwin") {
      print(`Install it with: ${BOLD}brew install ffmpeg${RESET}`);
    } else if (process.platform === "linux") {
      print(`Install it with: ${BOLD}sudo apt install ffmpeg${RESET}`);
    } else {
      print(`Download it from: ${BOLD}https://ffmpeg.org/download.html${RESET}`);
    }
    print("");
    process.exit(1);
  }

  // ── Step 3: API keys ──
  print(`${CYAN}[3/${TOTAL_STEPS}]${RESET} Checking API keys...`);
  print("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Required: TabStack API key
  if (getTabstackKey()) {
    print(`      TabStack API key ${GREEN}ready${RESET}`);
  } else {
    print(`      ${YELLOW}TABSTACK_API_KEY is not set (REQUIRED)${RESET}`);
    print(`      ${DIM}Get your free key at: https://tabstack.ai${RESET}`);
    print(`        ${BOLD}export TABSTACK_API_KEY=ts_xxx${RESET}`);
    print("");
  }

  // Optional: WaveSpeed for AI music
  print("");
  if (hasWaveSpeedKey()) {
    print(`      WaveSpeed API key ${GREEN}ready${RESET} — AI-generated music enabled`);
  } else {
    print(`      ${DIM}WAVESPEED_API_KEY not set (optional) — using static placeholder audio${RESET}`);
    print(`      ${DIM}To enable AI music generation: export WAVESPEED_API_KEY=ws_xxx${RESET}`);
    print(`      ${DIM}Get your key at: https://wavespeed.ai${RESET}`);
  }

  print("");
  print(`      ${BOLD}Note:${RESET} ${DIM}This is an MCP + Skill tool.${RESET}`);
  print(`      ${DIM}Claude Code generates video code directly - no external AI API needed!${RESET}`);
  print("");

  rl.close();

  // ── Step 4: Verify ──
  print(`${CYAN}[4/${TOTAL_STEPS}]${RESET} Verifying setup...`);
  const result = await runPreflight();
  print(formatPreflightReport(result));

  // ── Done ──
  print("");
  if (result.ok) {
    print(`${GREEN}${BOLD}Setup complete! Ready to generate videos with Claude Code.${RESET}`);
  } else {
    print(`${YELLOW}${BOLD}Setup finished with issues (see above).${RESET}`);
    print(`${DIM}Set the missing keys and install FFmpeg, then try again.${RESET}`);
  }
  print("");
  print(`${BOLD}How to Use (MCP + Skill mode):${RESET}`);
  print(`  ${CYAN}1. Install MCP server:${RESET}`);
  print(`     claude mcp add tabstack-video \\`);
  print(`       -e TABSTACK_API_KEY=${getTabstackKey() || "ts_xxx"} \\`);
  if (hasWaveSpeedKey()) {
    print(`       -e WAVESPEED_API_KEY=ws_xxx \\`);
  }
  print(`       -- npx @tabstack/video-generator`);
  print("");
  print(`  ${CYAN}2. Ask Claude Code:${RESET}`);
  print(`     "Generate a video for https://stripe.com"`);
  print(`     "Create a product video for https://linear.app with AI music"`);
  print("");
  print(`  ${DIM}Claude Code will extract page data, generate React code, and render the video!${RESET}`);
  print("");
}
