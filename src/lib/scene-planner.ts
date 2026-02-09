import { GoogleGenAI } from "@google/genai";
import type { ExtractedPageData, AudioGenerationPlan } from "../types.js";
import type { ProductLaunchProps, AudioMood } from "../remotion/types.js";
import { logDetail } from "./progress.js";
import { getGeminiKey as getGeminiKeyDefault } from "./defaults.js";

// ── Extended storyboard result with audio generation plan ──

export interface StoryboardResult extends ProductLaunchProps, AudioGenerationPlan {}

// ── Default audio prompts by mood (fallback when Gemini omits them) ──

function getDefaultAudioPrompt(mood: AudioMood): string {
  const defaults: Record<AudioMood, string> = {
    tech: "modern electronic ambient, soft synth pads, subtle bass pulse, clean digital textures, 110 BPM, futuristic and professional",
    elegant: "refined piano-led cinematic piece, gentle strings, warm sophisticated atmosphere, 90 BPM, graceful and polished",
    corporate: "professional orchestral underscore, confident brass accents, polished and trustworthy, 100 BPM, authoritative",
    energetic: "upbeat indie electronic, driving drums, bright synths, optimistic energy, 128 BPM, exciting and dynamic",
    minimal: "minimal ambient textures, sparse piano notes, gentle pad swells, contemplative space, 80 BPM, calm and clean",
  };
  return defaults[mood];
}

const DEFAULT_AUDIO_LYRICS = `[Intro]
(gentle opening, build atmosphere)

[Build]
(gradually increase energy)

[Main Theme]
(full arrangement, confident and upbeat)

[Outro]
(gentle resolution, fade)`;

function getGeminiKey(): string {
  const key = getGeminiKeyDefault();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY not set. Run: npx @tabstack/video-generator --setup",
    );
  }
  return key;
}

const SYSTEM_PROMPT = `You are a video storyboard planner for product launch videos. You receive structured data extracted from a landing page and output a JSON storyboard.

Rules:
1. Always start with an "intro" scene (brand name + tagline).
2. If a screenshot URL is available, include a "hero-screenshot" scene after intro.
3. If features are available (2+), include a "features" scene.
4. If stats/numbers are available (2+), include a "stats" scene.
5. If pricing tiers are available, include a "pricing" scene.
6. Always end with a "cta" scene.
7. Insert "transition" scenes (type: "transition") between major content scenes. Use style "fade", "wipe", "zoom", or "slide".
8. Total video duration should be 20-35 seconds (600-1050 frames at 30fps).
9. Standard scene durations in frames at 30fps:
   - intro: 90-120 (3-4s)
   - hero-screenshot: 120-150 (4-5s)
   - features: 150-210 (5-7s, longer if more features)
   - stats: 90-120 (3-4s)
   - pricing: 120-150 (4-5s)
   - cta: 75-90 (2.5-3s)
   - transition: 12-18 (0.4-0.6s)
10. Adjust durations down if there are many scenes (keep total under 35s / 1050 frames).
11. Select colorTheme based on the page's actual extracted colors. Fill in all 6 fields:
    - primary: main brand color
    - secondary: card/surface background color
    - accent: highlight/link color
    - background: page background color (often dark #0A0A0A or light #FFFFFF)
    - text: main text color
    - textSecondary: muted/secondary text color
12. Select audioMood based on the product type:
    - SaaS/API/DevTool -> "tech"
    - Design/Creative/Luxury -> "elegant"
    - Enterprise/B2B/Finance -> "corporate"
    - Consumer/Social/Startup -> "energetic"
    - Infrastructure/Minimal/Open-source -> "minimal"
13. Generate audio production instructions for AI music generation:
    - audioPrompt: A detailed music style description (50-200 chars) tailored to this specific product. Include genre, mood, instruments, tempo. Examples:
      - tech SaaS: "modern electronic ambient, soft synth pads, subtle bass pulse, 110 BPM, futuristic and clean"
      - design tool: "refined piano-led cinematic piece, gentle strings, warm and sophisticated, 90 BPM"
      - enterprise B2B: "professional orchestral underscore, confident brass accents, polished and trustworthy, 100 BPM"
      - consumer app: "upbeat indie electronic, driving drums, bright synths, optimistic energy, 128 BPM"
      - infra/OSS: "minimal ambient textures, sparse piano notes, gentle pad swells, contemplative, 80 BPM"
    - audioLyrics: Instrumental structure markers for the background music. Use this format with parenthetical descriptions:
      [Intro]
      (gentle opening, build atmosphere)

      [Build]
      (gradually increase energy)

      [Main Theme]
      (full arrangement, confident)

      [Outro]
      (gentle resolution, fade)

Scene data schemas:

intro: { type: "intro", durationInFrames: number, brandName: string, tagline: string, logoUrl?: string }
hero-screenshot: { type: "hero-screenshot", durationInFrames: number, screenshotUrl: string, headline?: string, subheadline?: string }
features: { type: "features", durationInFrames: number, sectionTitle: string, features: [{ title: string, description: string, icon?: string }] }
  - icon should be an emoji that represents the feature
stats: { type: "stats", durationInFrames: number, stats: [{ value: number, suffix: string, label: string }] }
  - value must be a NUMBER (not string). Parse "50,000" as 50000.
  - suffix is "+", "%", "ms", "x", "K", "M", etc.
pricing: { type: "pricing", durationInFrames: number, tiers: [{ name: string, price: string, highlighted: boolean, features: string[] }] }
cta: { type: "cta", durationInFrames: number, headline: string, subheadline?: string, buttonText: string, url: string }
transition: { type: "transition", durationInFrames: number, style: "fade" | "wipe" | "zoom" | "slide" }

Output ONLY valid JSON matching this exact shape (no markdown, no explanation, no code fences):
{
  "scenes": [...],
  "colorTheme": { "primary": "...", "secondary": "...", "accent": "...", "background": "...", "text": "...", "textSecondary": "..." },
  "audioMood": "tech" | "elegant" | "corporate" | "energetic" | "minimal",
  "audioPrompt": "detailed music style description for this product...",
  "audioLyrics": "[Intro]\\n(description)\\n\\n[Build]\\n(description)\\n\\n[Main Theme]\\n(description)\\n\\n[Outro]\\n(description)",
  "productUrl": "the original URL"
}`;

/**
 * Call Gemini API to plan the video storyboard from extracted page data.
 * Returns the storyboard plus audio generation instructions.
 */
export async function planScenes(
  pageData: ExtractedPageData,
  screenshotUrl: string | null,
  productUrl: string,
  audioMoodOverride?: string,
): Promise<StoryboardResult> {
  const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

  const userMessage = JSON.stringify(
    {
      ...pageData,
      screenshotUrl,
      productUrl,
      ...(audioMoodOverride ? { audioMoodOverride } : {}),
    },
    null,
    2,
  );

  logDetail("Calling Gemini API for storyboard planning...");

  let lastError: Error | null = null;

  // Try up to 2 times (retry once on parse failure)
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

    let rawJson = text.trim();

    // Strip markdown code fences if present
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    try {
      const parsed = JSON.parse(rawJson) as StoryboardResult;

      // Basic validation
      if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
        throw new Error("scenes array is missing or empty");
      }
      if (!parsed.colorTheme || !parsed.colorTheme.primary) {
        throw new Error("colorTheme is missing or incomplete");
      }
      if (!parsed.audioMood) {
        throw new Error("audioMood is missing");
      }

      // Apply override
      if (audioMoodOverride) {
        parsed.audioMood = audioMoodOverride as ProductLaunchProps["audioMood"];
      }

      // Ensure productUrl is set
      parsed.productUrl = productUrl;

      // Ensure audio generation fields have sensible defaults
      if (!parsed.audioPrompt || parsed.audioPrompt.length < 10) {
        parsed.audioPrompt = getDefaultAudioPrompt(parsed.audioMood);
      }
      if (!parsed.audioLyrics || parsed.audioLyrics.length < 10) {
        parsed.audioLyrics = DEFAULT_AUDIO_LYRICS;
      }

      const totalFrames = parsed.scenes.reduce(
        (acc, s) => acc + s.durationInFrames,
        0,
      );
      logDetail(
        `Storyboard: ${parsed.scenes.length} scenes, ${totalFrames} frames (${(totalFrames / 30).toFixed(1)}s), audio: ${parsed.audioMood}`,
      );

      return parsed;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      logDetail(`Attempt ${attempt + 1} failed: ${lastError.message}`);
    }
  }

  throw new Error(`Scene planning failed after 2 attempts: ${lastError?.message}`);
}
