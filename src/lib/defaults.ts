/**
 * Centralized API key accessors for MCP mode.
 *
 * All keys come from environment variables. Users provide their own keys
 * via env vars or by passing -e flags when adding the MCP server.
 *
 * NOTE: This is an MCP + Skill tool. Claude Code generates video code directly,
 * so no external AI provider API keys (Gemini, Claude) are needed.
 */

// ── Accessors (read from environment) ──

export function getTabstackKey(): string {
  return process.env.TABSTACK_API_KEY || "";
}

export function getWaveSpeedKey(): string | null {
  return process.env.WAVESPEED_API_KEY || null;
}

// ── Key availability checks ──

export function hasWaveSpeedKey(): boolean {
  return !!getWaveSpeedKey();
}
