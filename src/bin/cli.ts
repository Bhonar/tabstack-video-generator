#!/usr/bin/env node

/**
 * @tabstack/video-generator — MCP Server for AI Video Generation
 *
 * Usage modes:
 *   tabstack-video                       → MCP server (STDIO) — used by `claude mcp add`
 *   tabstack-video --setup               → Interactive setup wizard
 *   tabstack-video --help                → Show usage
 *
 * Note: This is an MCP + Skill tool. Use Claude Code to generate videos.
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

  // --url flag → Show deprecation message
  if (hasFlag("--url")) {
    console.error(`${RED}${BOLD}CLI mode has been removed.${RESET}\n`);
    console.error(`This is now an ${BOLD}MCP + Skill${RESET} tool for Claude Code.\n`);
    console.error(`${BOLD}How to use:${RESET}`);
    console.error(`  1. Add MCP server: ${CYAN}claude mcp add tabstack-video -e TABSTACK_API_KEY=...${RESET}`);
    console.error(`  2. In Claude Code, ask: ${CYAN}"Generate a video for https://example.com"${RESET}\n`);
    process.exit(1);
  }

  // No flags → MCP server mode (what `claude mcp add` expects)
  const { startServer } = await import("../server.js");
  await startServer();
}

// CLI mode has been removed - MCP + Skill only

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
${CYAN}MCP + Skill${RESET} tool for Claude Code to turn landing pages into videos.

${BOLD}Installation:${RESET}
  ${CYAN}claude mcp add tabstack-video${RESET} \\
    ${DIM}-e TABSTACK_API_KEY=sk-...${RESET} \\
    ${DIM}-e WAVESPEED_API_KEY=... ${RESET}${DIM}(optional, for AI music)${RESET} \\
    ${DIM}-- npx @tabstack/video-generator${RESET}

${BOLD}Usage:${RESET}
  npx @tabstack/video-generator ${DIM}# Start MCP server (STDIO)${RESET}
  npx @tabstack/video-generator --setup ${DIM}# Interactive API key setup${RESET}
  npx @tabstack/video-generator --help ${DIM}# Show this help${RESET}

${BOLD}How It Works:${RESET}
  ${BOLD}1.${RESET} MCP server provides tools:
     • ${CYAN}extract_page_data${RESET} - Extract content, colors, fonts from URL
     • ${CYAN}generate_audio${RESET} - Generate AI background music
     • ${CYAN}render_video${RESET} - Render React/Remotion code to MP4

  ${BOLD}2.${RESET} Claude Code orchestrates the workflow:
     • Calls extract_page_data to get brand info
     • ${BOLD}Generates React/Remotion video code itself${RESET}
     • Calls render_video to create the final MP4

  ${BOLD}3.${RESET} No external AI APIs needed - Claude Code does the creative work!

${BOLD}Example Usage in Claude Code:${RESET}
  ${CYAN}"Generate a video for https://stripe.com"${RESET}
  ${CYAN}"Make a product video for https://linear.app with AI music"${RESET}
  ${CYAN}"Create a launch video for tabstack.ai"${RESET}

${BOLD}Required Keys:${RESET}
  ${BOLD}TABSTACK_API_KEY${RESET} - Get at https://tabstack.ai
  ${BOLD}WAVESPEED_API_KEY${RESET} - Optional, for AI music generation

${BOLD}Learn More:${RESET}
  Documentation: ${CYAN}https://github.com/tabstack/video-generator${RESET}
  TabStack API: ${CYAN}https://tabstack.ai${RESET}
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
