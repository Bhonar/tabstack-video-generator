/**
 * Centralized API key accessors.
 *
 * All keys come from environment variables. Users provide their own keys
 * via env vars or by passing -e flags when adding the MCP server.
 */

// ── Accessors (read from environment) ──

export function getTabstackKey(): string {
  return process.env.TABSTACK_API_KEY || "";
}

export function getGeminiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

export function getWaveSpeedKey(): string | null {
  return process.env.WAVESPEED_API_KEY || null;
}

/**
 * Returns true if all required keys are available.
 */
export function hasRequiredKeys(): boolean {
  return !!getTabstackKey() && !!getGeminiKey();
}

/**
 * Returns true if WaveSpeed is available for AI-generated audio.
 */
export function hasWaveSpeedKey(): boolean {
  return !!getWaveSpeedKey();
}
