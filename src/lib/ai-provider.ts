import type { ExtractedPageData } from "../types.js";
import type { StoryboardResult } from "./scene-planner.js";
import type { AiProvider } from "./defaults.js";

/**
 * Interface that all AI storyboard providers implement.
 */
export interface AiProviderInterface {
  readonly name: AiProvider;
  readonly supportsTts: boolean;
  planStoryboard(
    pageData: ExtractedPageData,
    screenshotUrl: string | null,
    productUrl: string,
    audioMoodOverride?: string,
  ): Promise<StoryboardResult>;
}

/**
 * Factory — dynamically imports the right provider to avoid loading unused SDKs.
 */
export async function createAiProvider(provider: AiProvider): Promise<AiProviderInterface> {
  if (provider === "claude") {
    const { ClaudeProvider } = await import("./providers/claude-provider.js");
    return new ClaudeProvider();
  }
  const { GeminiProvider } = await import("./providers/gemini-provider.js");
  return new GeminiProvider();
}
