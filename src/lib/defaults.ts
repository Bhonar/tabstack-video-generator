/**
 * Centralized API key accessors and AI provider resolution.
 *
 * All keys come from environment variables. Users provide their own keys
 * via env vars or by passing -e flags when adding the MCP server.
 */

// ── AI provider type ──

export type AiProvider = "gemini" | "claude";

// ── Accessors (read from environment) ──

export function getTabstackKey(): string {
  return process.env.TABSTACK_API_KEY || "";
}

export function getGeminiKey(): string {
  return process.env.GEMINI_API_KEY || "";
}

export function getAnthropicKey(): string {
  return process.env.ANTHROPIC_API_KEY || "";
}

export function getWaveSpeedKey(): string | null {
  return process.env.WAVESPEED_API_KEY || null;
}

// ── Key availability checks ──

export function hasAnthropicKey(): boolean {
  return !!getAnthropicKey();
}

export function hasWaveSpeedKey(): boolean {
  return !!getWaveSpeedKey();
}

/**
 * Returns true if required keys are available for the given provider.
 * TabStack key is always required. AI key depends on provider.
 */
export function hasRequiredKeys(provider?: AiProvider): boolean {
  const tabstackOk = !!getTabstackKey();
  if (provider === "claude") return tabstackOk && hasAnthropicKey();
  if (provider === "gemini") return tabstackOk && !!getGeminiKey();
  // No provider specified: at least one AI key must be present
  return tabstackOk && (!!getGeminiKey() || hasAnthropicKey());
}

/**
 * Resolve which AI provider to use.
 * Priority: explicit arg → VIDEOGEN_AI_PROVIDER env → auto-detect from keys → fallback gemini
 */
export function resolveAiProvider(explicit?: string): AiProvider {
  // 1. Explicit flag/parameter wins
  if (explicit === "claude") return "claude";
  if (explicit === "gemini") return "gemini";

  // 2. Env var override
  const envProvider = process.env.VIDEOGEN_AI_PROVIDER?.toLowerCase();
  if (envProvider === "claude") return "claude";
  if (envProvider === "gemini") return "gemini";

  // 3. Auto-detect: prefer claude if key is set, then gemini
  if (hasAnthropicKey()) return "claude";
  if (getGeminiKey()) return "gemini";

  // 4. Default fallback
  return "gemini";
}
