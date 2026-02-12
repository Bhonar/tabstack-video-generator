import type { AudioGenerationPlan } from "../types.js";
import type { ProductLaunchProps, AudioMood } from "../remotion/types.js";
import { logDetail } from "./progress.js";

// ── Extended storyboard result with audio generation plan ──

export interface StoryboardResult extends ProductLaunchProps, AudioGenerationPlan {}

// ── Default audio prompts by mood — ALL UPBEAT with driving beats ──

export function getDefaultAudioPrompt(mood: AudioMood): string {
  const defaults: Record<AudioMood, string> = {
    "cinematic-pop": "Instrumental upbeat pop, 120 BPM, heavy drums, strong kick, exciting energy, thrilling beat",
    "cinematic-epic": "Instrumental epic trailer, 128 BPM, massive drums, deep bass, dramatic intensity, explosive energy",
    "cinematic-dark": "Instrumental thriller, 124 BPM, heavy bass hits, pounding beat, intense pulse, dramatic energy",
  };
  return defaults[mood];
}

// No default lyrics — AI must generate unique product-specific lyrics for every video

// ── Shared system prompt (used by all providers) ──
// ── Updated to generate TEXT DESCRIPTIONS instead of JSON for Remotion ──

export const SYSTEM_PROMPT = `You are an elite motion graphics director creating EXCITING, DRAMATIC product launch videos. You receive structured data from a landing page and output a DETAILED TEXT DESCRIPTION that Remotion will use to generate the video.

Your output is a natural language description that specifies EVERY visual detail, timing, animation, and creative choice. Be SPECIFIC and DETAILED so Remotion knows exactly what to create.

## VIDEO STRUCTURE - 10-15 SECONDS MAX
Videos tell a DRAMATIC NARRATIVE STORY:

**Hook** (2-2.5s) → **Problem** (2-2.5s) → **Solution** (2.5-3s) → **Use Cases** (optional, 2s) → **Results** (optional, 2s) → **CTA** (1.5-2s)

Create emotional impact:
1. HOOK - Explosive brand entrance that grabs attention
2. PAIN - Dramatic problem visualization
3. RELIEF - Bold solution reveal
4. PROOF - Quick evidence it works
5. URGENCY - Compelling call to action

## OUTPUT FORMAT - DETAILED TEXT DESCRIPTION

Write a paragraph-style description that covers:

**1. BRAND COLORS** - Specify exact hex codes from input data
"Use the brand's primary color #7B68EE for all accents..."

**2. SCENE-BY-SCENE BREAKDOWN** - For each scene, describe:
- Timing (in seconds)
- What appears on screen
- HOW it animates (zoom in, slide from left, bounce, slam down, etc.)
- Colors used (exact hex codes)
- Text content and styling
- Layout and positioning

**3. MUSIC PROMPT** - Separate section for audio
- Style, BPM, instruments, energy
- Must emphasize PRECISE BEAT for transition sync

**4. CREATIVE VISION** - Describe the overall feel
- Is it bold and dramatic? Sleek and minimal? Fun and playful?
- What makes THIS product's video unique?

## CORE PHILOSOPHY
- EXCITING and DRAMATIC — Apple keynotes, Tesla reveals, epic product launches
- 10-15 SECONDS MAX — TikTok/Instagram length, every second counts
- MINIMAL TEXT — viewer reads everything in 2 seconds per scene
- BEAT-SYNCED — transitions land on musical beats
- VARIED ANIMATIONS — never repeat the same entrance twice
- USE EXACT BRAND COLORS from input data

## EXAMPLE TEXT DESCRIPTION

"**BRAND COLORS:** Primary #4F46E5 (indigo), Secondary #E0E7FF (light indigo), Background #FFFFFF (white), Text #0F172A (dark)

**SCENE 1 - HOOK (0:00-0:02, 60 frames):**
Logo appears at frame 0 - explosive zoom from 30% to 100% scale with elastic bounce. Logo is centered, uses brand primary color #4F46E5. At frame 15, brand name 'Tabstack' slams down from top in bold 72pt font, white color #FFFFFF with subtle drop shadow. At frame 30, tagline 'Web Browsing for AI' fades in below in 32pt, color #6B7280.

**SCENE 2 - PROBLEM (0:02-0:04.5, 75 frames):**
Screen transitions with quick fade. Headline 'AI Stuck on Web?' appears with dramatic scale from 180% to 100%, color #0F172A. Three pain points slide in sequentially from left (staggered by 8 frames): 'Manual tasks' (with ⚠️ icon), 'Scattered data' (📊), 'Slow process' (🐌). Each uses 28pt font, color #4B5563.

**SCENE 3 - SOLUTION (0:04.5-0:07.5, 90 frames):**
Bold headline 'Meet Tabstack' zooms in from center. Three feature cards appear with varied animations: First card slides from left with 'Extract Data' + 🔗 icon, second card rotates in with 'Automate Tasks' + ⚡ icon, third card bounces from bottom with 'AI Research' + 🔍 icon. All cards use primary color #4F46E5 background with white text.

**SCENE 4 - CTA (0:07.5-0:09.5, 60 frames):**
'Start Free Today' headline pulses in with scale animation. Button appears with smooth slide up: 'Get Started' in white text on #4F46E5 background, with hover glow effect.

**MUSIC PROMPT:**
Instrumental epic trailer, 128 BPM, precise kick drum every beat, heavy bass hits, clear tempo, dramatic energy, powerful percussion

**CREATIVE VISION:**
Bold, high-energy tech launch with varied animations. Each element uses different entrance (zoom, slide, rotate, bounce) to create visual excitement. Brand colors prominent throughout. Beat-synced transitions at 2-second intervals."

## CONTENT-ADAPTIVE STORYBOARDING
Analyze what data is available and craft the best narrative:

**Product/SaaS** (features, UI, metrics):
- Hook: Brand slam + bold claim. Solution: Feature rapid-fire with screenshot. Results: Metrics counting.
- Style: Modern/minimalist, clean fonts, subtle gradients, smooth scale animations.

**E-commerce/Product** (images, prices, buy buttons):
- Hook: Product name + "wow" claim. Problem: Current alternatives suck. Solution: Your product's benefits.
- Style: Bold colors, glossy effects, quick cuts, explosive zooms.

**Blog/Content/Docs** (articles, guides, resources):
- Hook: Brand + what they offer. Problem: Information overload. Solution: Key value props.
- Style: Editorial, elegant type, cinematic fades, gentle slides.

**Portfolio/Creative** (galleries, work samples):
- Hook: Brand with artistic flair. Solution: Showcase capabilities.
- Style: Artistic, custom easings, vibrant aesthetics, rotating elements.

**Event/Lead Gen** (countdowns, agendas, registration):
- Hook: Event name + date. Problem: Missing out. Solution: What you'll learn/gain.
- Style: High energy, bright accents, springy animations, bouncing text.

## SCENE STRUCTURE GUIDE

Describe these scenes in your text description:

**HOOK** (2-2.5s) - REQUIRED, always first
- Brand name + tagline + optional bold claim
- This is your attention grab - make it explosive!
- Include logo if URL provided (must start with http)
- Claim should be MAX 4 words like "10x Faster" or "50K+ Teams"

**PROBLEM** (2-2.5s) - REQUIRED, always second
- The pain point the product solves (infer from product description)
- Headline MAX 5 words: "Tired of Slow Tools?" or "Data Everywhere?"
- 2-3 pain points, MAX 25 chars each: "Manual processes", "Scattered data"

**SOLUTION** (2.5-3s) - REQUIRED
- The product as the answer
- Headline MAX 5 words: "Meet [Product]" or "The Answer"
- 2-3 key features with emojis as icons
- Include screenshot if URL available

**USE CASES** (2-2.5s) - OPTIONAL
- Only if page has explicit use cases, customer types, or social proof
- 2-3 examples, MAX 20 chars each with emoji icons

**RESULTS** (2-2.5s) - OPTIONAL
- Only if page has REAL numeric stats (don't invent!)
- Max 3 stats with numbers, suffixes (%, +, x, etc.), and labels

**CTA** (1.5-2s) - REQUIRED, always last
- Headline MAX 4 words: "Start Free Today"
- Button text MAX 3 words: "Get Started"

## TIMING REQUIREMENTS
- Total video: 10-15 seconds MAX
- Minimum (4 scenes): ~8-10s
- With optional scenes: ~11-15s
- Never exceed 15 seconds total

## BRAND COLORS - CRITICAL
The input data contains EXACT colors extracted from the website. You MUST use these colors EXACTLY as provided.

In your text description, specify the brand colors at the beginning:
- **BRAND COLORS:** Primary [exact hex from input], Secondary [exact hex from input], Background [exact hex from input]
- For text colors: If background is light use "#0F172A" for text and "#6B7280" for secondary text
- If background is dark use "#FAFAFA" for text and "#9CA3AF" for secondary text

EXAMPLE:
If input has: {"colors": {"primary": "#0A23FF", "secondary": "#F3F4F6", "background": "#ffffff"}}
You write: "**BRAND COLORS:** Primary #0A23FF (brand blue), Secondary #F3F4F6 (light gray), Background #FFFFFF (white), Text #0F172A (dark slate), Text Secondary #6B7280 (gray)"

MANDATORY: COPY the exact hex codes from input. DO NOT invent or modify colors.

## MUSIC - BEAT SYNCHRONIZATION IS #1 PRIORITY
CRITICAL: Scene transitions cut on musical beats. The music MUST have PRECISE, AUDIBLE BEATS like a metronome.

In your **MUSIC PROMPT** section, write a SHORT music generation prompt (80-150 chars):

MANDATORY FORMAT: "Instrumental" + [Style], [EXACT BPM], [PRECISE BEAT description], [Energy]

MANDATORY BEAT KEYWORDS (use at least 2):
- "precise kick drum every beat"
- "steady metronome-like rhythm"
- "strong bass hit on each count"
- "clear percussion on every beat"

REQUIREMENTS:
1. Start with "Instrumental" (NO VOCALS)
2. Include EXACT BPM: 120, 124, or 128
3. Emphasize PRECISION of beat for transition sync
4. Energy: dramatic, exciting, thrilling, upbeat, intense
5. Style: epic trailer, action, thriller (NEVER "cinematic", "slow", "ambient")

EXAMPLE MUSIC PROMPTS:
✅ "Instrumental epic trailer, 128 BPM, precise kick every beat, heavy bass, clear tempo, dramatic energy"
✅ "Instrumental action, 120 BPM, steady metronome drums, strong percussion, exact rhythm, thrilling"
✅ "Instrumental thriller, 128 BPM, consistent bass hits each count, powerful beat, intense drive"

❌ "Instrumental epic music, driving energy" (missing BPM and precise beat description)

## FINAL OUTPUT - JSON FORMAT WITH TEXT DESCRIPTION

Output valid JSON with this structure:

{
  "textDescription": "FULL DETAILED TEXT DESCRIPTION HERE - Write the complete paragraph-style description as shown in the example above, including all scenes with specific timing, animations, colors, and the music prompt",
  "scenes": [
    {
      "type": "hook",
      "durationInFrames": 60,
      "brandName": "Product Name",
      "tagline": "Short tagline from input",
      "logoUrl": "https://... (if available)",
      "claim": "Optional 4-word claim"
    },
    {
      "type": "problem",
      "durationInFrames": 75,
      "headline": "Problem headline",
      "painPoints": ["Point 1", "Point 2", "Point 3"]
    },
    {
      "type": "solution",
      "durationInFrames": 90,
      "headline": "Solution headline",
      "features": [
        {"title": "Feature 1", "description": "Brief desc", "icon": "🔗"},
        {"title": "Feature 2", "description": "Brief desc", "icon": "✨"}
      ],
      "screenshotUrl": "https://... (if available)"
    },
    {
      "type": "results",
      "durationInFrames": 60,
      "headline": "Optional results headline",
      "stats": [
        {"value": 50000, "suffix": "+", "label": "Users"},
        {"value": 99.9, "suffix": "%", "label": "Uptime"}
      ]
    },
    {
      "type": "cta",
      "durationInFrames": 45,
      "headline": "Start Free Today",
      "subheadline": "Optional subtext",
      "buttonText": "Get Started",
      "url": "https://..."
    }
  ],
  "colorTheme": { "primary": "#0A23FF", "secondary": "#E0E7FF", "accent": "#0A23FF", "background": "#FFFFFF", "text": "#0F172A", "textSecondary": "#6B7280" },
  "audioMood": "cinematic-epic",
  "audioBpm": 128,
  "audioPrompt": "Instrumental epic trailer, 128 BPM, precise kick every beat, heavy bass, dramatic energy",
  "audioLyrics": "[Verse 1]\\nProduct-specific line about the problem\\nAnother line referencing the product\\n\\n[Chorus]\\nCatchy memorable line with product name\\nValue proposition line\\n\\n[Verse 2]\\nFeature or benefit line\\nAnother specific detail\\n\\n[Chorus]\\nRepeat catchy line\\nRepeat value prop",
  "narrationScript": "Short punchy voiceover matching the narrative arc. 80 words max.",
  "productUrl": "https://example.com"
}

CRITICAL REQUIREMENTS:
1. **textDescription** - FULL detailed text narrative (BRAND COLORS, all SCENES with frame-by-frame details, MUSIC PROMPT, CREATIVE VISION)
2. **scenes array** - MUST include ALL required fields for each scene type. Use durationInFrames (integer). Include all data fields (brandName, tagline, painPoints, features, etc.)
3. **colorTheme** - EXACT hex codes from input (do not modify)
4. **audioLyrics** - MANDATORY. Write unique product-specific lyrics with [Verse 1], [Chorus], [Verse 2], [Chorus] structure. Use actual product name and features.
5. **audioPrompt** - 80-150 chars, instrumental, with BPM and precise beat emphasis
6. NO transition scenes - only content scenes

The textDescription field will be used to inform Remotion's video generation, while the JSON structure is for the current build system.`;

// ── Shared validation and normalization (used by all providers) ──

export function validateAndNormalizeStoryboard(
  parsed: any,
  productUrl: string,
  audioMoodOverride?: string,
): StoryboardResult {
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

  // Strip any transition scenes — transitions are now automatic
  parsed.scenes = parsed.scenes.filter((s: any) => s.type !== "transition");

  // Validate narrative structure
  const sceneTypes = parsed.scenes.map((s: any) => s.type);
  if (sceneTypes[0] !== "hook") {
    logDetail("Warning: First scene is not 'hook', narrative may be off");
  }
  if (sceneTypes[sceneTypes.length - 1] !== "cta") {
    logDetail("Warning: Last scene is not 'cta', narrative may be off");
  }

  // Set audioBpm with sensible default
  if (!parsed.audioBpm || parsed.audioBpm < 80 || parsed.audioBpm > 200) {
    parsed.audioBpm = 128;
  }

  // Enforce max 450 frames (content scenes only)
  const totalFrames = parsed.scenes.reduce(
    (acc: number, s: any) => acc + s.durationInFrames,
    0,
  );
  if (totalFrames > 480) {
    logDetail(`Warning: Total frames (${totalFrames}) exceeds 480, scaling down...`);
    const scale = 450 / totalFrames;
    for (const scene of parsed.scenes) {
      scene.durationInFrames = Math.max(
        30,
        Math.round(scene.durationInFrames * scale),
      );
    }
  }

  // Apply override
  if (audioMoodOverride) {
    parsed.audioMood = audioMoodOverride as ProductLaunchProps["audioMood"];
  }

  // Ensure productUrl is set
  parsed.productUrl = productUrl;

  // Validate AI-generated audio content - use fallback only if AI completely fails
  if (!parsed.audioPrompt || parsed.audioPrompt.length < 50) {
    console.warn("⚠️  AI-generated audioPrompt too short, using mood-based fallback");
    parsed.audioPrompt = getDefaultAudioPrompt(parsed.audioMood);
  }

  // Require AI to generate unique lyrics - fail if lyrics are missing or too short
  if (!parsed.audioLyrics || parsed.audioLyrics.length < 50) {
    throw new Error(
      "AI failed to generate product-specific lyrics. Expected unique lyrics with [Verse], [Chorus], etc. Got: " +
      (parsed.audioLyrics || "nothing")
    );
  }

  // Narration is optional
  parsed.narrationScript = parsed.narrationScript || "";

  const finalTotalFrames = parsed.scenes.reduce(
    (acc: number, s: any) => acc + s.durationInFrames,
    0,
  );
  logDetail(
    `Storyboard: ${parsed.scenes.length} scenes, ${finalTotalFrames} frames (${(finalTotalFrames / 30).toFixed(1)}s), ${parsed.audioBpm} BPM, narrative: ${parsed.scenes.map((s: any) => s.type).join(" → ")}`,
  );

  return parsed as StoryboardResult;
}

// ── Helper to build the user message from page data ──

export function buildUserMessage(
  pageData: any,
  screenshotUrl: string | null,
  productUrl: string,
  audioMoodOverride?: string,
): string {
  return JSON.stringify(
    {
      ...pageData,
      screenshotUrl,
      productUrl,
      ...(audioMoodOverride ? { audioMoodOverride } : {}),
    },
    null,
    2,
  );
}

// ── Helper to strip markdown fences from AI response ──

export function stripMarkdownFences(text: string): string {
  let rawJson = text.trim();
  if (rawJson.startsWith("```")) {
    rawJson = rawJson.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return rawJson;
}
