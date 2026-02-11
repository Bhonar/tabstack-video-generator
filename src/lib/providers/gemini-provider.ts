import { GoogleGenAI } from "@google/genai";
import type { ExtractedPageData } from "../../types.js";
import type { AiProviderInterface } from "../ai-provider.js";
import {
  SYSTEM_PROMPT,
  validateAndNormalizeStoryboard,
  buildUserMessage,
  stripMarkdownFences,
  type StoryboardResult,
} from "../scene-planner.js";
import { getGeminiKey } from "../defaults.js";
import { logDetail } from "../progress.js";

export class GeminiProvider implements AiProviderInterface {
  readonly name = "gemini" as const;
  readonly supportsTts = true;

  async planStoryboard(
    pageData: ExtractedPageData,
    screenshotUrl: string | null,
    productUrl: string,
    audioMoodOverride?: string,
  ): Promise<StoryboardResult> {
    const key = getGeminiKey();
    if (!key) {
      throw new Error(
        "GEMINI_API_KEY not set. Run: npx @tabstack/video-generator --setup",
      );
    }

    const ai = new GoogleGenAI({ apiKey: key });
    const userMessage = buildUserMessage(pageData, screenshotUrl, productUrl, audioMoodOverride);

    logDetail("Calling Gemini API for narrative storyboard planning...");

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      let prompt = userMessage;

      if (attempt > 0 && lastError) {
        prompt = `${userMessage}\n\nIMPORTANT: Your previous output was invalid JSON. Error: ${lastError.message}. Please output ONLY valid JSON with no markdown fences or extra text.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      const text = response.text;
      if (!text) {
        lastError = new Error("No text in Gemini response");
        continue;
      }

      try {
        const rawJson = stripMarkdownFences(text);
        const parsed = JSON.parse(rawJson);
        return validateAndNormalizeStoryboard(parsed, productUrl, audioMoodOverride);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        logDetail(`Gemini attempt ${attempt + 1} failed: ${lastError.message}`);
      }
    }

    throw new Error(`Gemini scene planning failed after 2 attempts: ${lastError?.message}`);
  }
}
