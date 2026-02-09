// ── Output modes ──

type OutputMode = "mcp" | "cli";
let currentMode: OutputMode = "mcp";

export function setOutputMode(mode: OutputMode): void {
  currentMode = mode;
}

// ── ANSI helpers ──

const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// ── Logging ──

/**
 * Logs a step in progress.
 * - MCP mode: writes to stderr (STDIO servers must never write to stdout)
 * - CLI mode: writes to stdout with color
 */
export function logProgress(step: number, total: number, message: string): void {
  if (currentMode === "cli") {
    process.stdout.write(`${CYAN}[${step}/${total}]${RESET} ${message}\n`);
  } else {
    console.error(`[${step}/${total}] ${message}`);
  }
}

/**
 * Logs an indented detail line.
 */
export function logDetail(message: string): void {
  if (currentMode === "cli") {
    process.stdout.write(`${DIM}      ${message}${RESET}\n`);
  } else {
    console.error(`    ${message}`);
  }
}

/**
 * Logs step completion with a checkmark (CLI only).
 */
export function logStepDone(step: number, total: number, message: string): void {
  if (currentMode === "cli") {
    process.stdout.write(
      `${CYAN}[${step}/${total}]${RESET} ${message} ${GREEN}✓${RESET}\n`,
    );
  }
}
