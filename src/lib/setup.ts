import readline from "readline";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { runPreflight, formatPreflightReport, getPackageRoot } from "./preflight.js";
import { hasRequiredKeys, hasWaveSpeedKey } from "./defaults.js";

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

  if (hasRequiredKeys()) {
    print(`      TabStack + Gemini keys ${GREEN}ready${RESET}`);
  } else {
    if (!process.env.TABSTACK_API_KEY) {
      print(`      ${YELLOW}TABSTACK_API_KEY is not set${RESET}`);
      print(`      ${DIM}Get your free key at: https://console.tabstack.ai${RESET}`);
      print(`        ${BOLD}export TABSTACK_API_KEY=ts_xxx${RESET}`);
      print("");
    }
    if (!process.env.GEMINI_API_KEY) {
      print(`      ${YELLOW}GEMINI_API_KEY is not set${RESET}`);
      print(`      ${DIM}Get your free key at: https://aistudio.google.com/apikey${RESET}`);
      print(`        ${BOLD}export GEMINI_API_KEY=AIza...${RESET}`);
      print("");
    }
  }

  if (hasWaveSpeedKey()) {
    print(`      WaveSpeed key ${GREEN}ready${RESET} — AI-generated music enabled`);
  } else {
    print(`      ${DIM}WaveSpeed key not available — using static placeholder audio${RESET}`);
    print(`      ${DIM}To enable AI music: export WAVESPEED_API_KEY=ws_xxx${RESET}`);
    print("");
  }

  rl.close();

  // ── Step 4: Verify ──
  print(`${CYAN}[4/${TOTAL_STEPS}]${RESET} Verifying setup...`);
  const result = await runPreflight();
  print(formatPreflightReport(result));

  // ── Done ──
  print("");
  if (result.ok) {
    print(`${GREEN}${BOLD}Setup complete! Ready to generate videos.${RESET}`);
  } else {
    print(`${YELLOW}${BOLD}Setup finished with issues (see above).${RESET}`);
    print(`${DIM}Set the missing keys and install FFmpeg, then try again.${RESET}`);
  }
  print("");
  print(`${BOLD}Usage:${RESET}`);
  print(`  ${CYAN}CLI:${RESET}        npx @tabstack/video-generator --url https://example.com`);
  print(`  ${CYAN}Claude:${RESET}     claude mcp add tabstack-video \\`);
  print(`                -e TABSTACK_API_KEY=... \\`);
  print(`                -e GEMINI_API_KEY=... \\`);
  print(`                -- npx @tabstack/video-generator`);
  print(`  ${CYAN}Ask Claude:${RESET} "Generate a video for https://example.com"`);
  print("");
}
