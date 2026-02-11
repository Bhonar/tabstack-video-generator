import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedPageData } from "../../types.js";
import type { AiProviderInterface } from "../ai-provider.js";
import {
  SYSTEM_PROMPT,
  validateAndNormalizeStoryboard,
  buildUserMessage,
  stripMarkdownFences,
  type StoryboardResult,
} from "../scene-planner.js";
import { getAnthropicKey } from "../defaults.js";
import { logDetail } from "../progress.js";

export class ClaudeProvider implements AiProviderInterface {
  readonly name = "claude" as const;
  readonly supportsTts = false; // Claude has no built-in TTS

  async planStoryboard(
    pageData: ExtractedPageData,
    screenshotUrl: string | null,
    productUrl: string,
    audioMoodOverride?: string,
  ): Promise<StoryboardResult> {
    const key = getAnthropicKey();
    if (!key) {
      throw new Error(
        "ANTHROPIC_API_KEY not set. Set it or switch to --ai gemini.",
      );
    }

    const client = new Anthropic({ apiKey: key });
    const userMessage = buildUserMessage(pageData, screenshotUrl, productUrl, audioMoodOverride);

    logDetail("Calling Claude API for narrative storyboard planning...");

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      let content = userMessage;

      if (attempt > 0 && lastError) {
        content = `${userMessage}\n\nIMPORTANT: Your previous output was invalid JSON. Error: ${lastError.message}. Please output ONLY valid JSON with no markdown fences or extra text.`;
      }

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }],
      });

      // Extract text from response content blocks
      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );
      const text = textBlock?.text;
      if (!text) {
        lastError = new Error("No text in Claude response");
        continue;
      }

      try {
        const rawJson = stripMarkdownFences(text);
        const parsed = JSON.parse(rawJson);
        return validateAndNormalizeStoryboard(parsed, productUrl, audioMoodOverride);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        logDetail(`Claude attempt ${attempt + 1} failed: ${lastError.message}`);
      }
    }

    throw new Error(`Claude scene planning failed after 2 attempts: ${lastError?.message}`);
  }
}
