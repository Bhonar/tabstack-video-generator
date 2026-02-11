import type { AudioGenerationPlan } from "../types.js";
import type { ProductLaunchProps, AudioMood } from "../remotion/types.js";
import { logDetail } from "./progress.js";

// ── Extended storyboard result with audio generation plan ──

export interface StoryboardResult extends ProductLaunchProps, AudioGenerationPlan {}

// ── Default audio prompts by mood — ALL UPBEAT with driving beats ──

export function getDefaultAudioPrompt(mood: AudioMood): string {
  const defaults: Record<AudioMood, string> = {
    "cinematic-classical": "upbeat orchestral anthem, driving staccato strings, punchy timpani hits on every beat, fast tempo 130 BPM, triumphant brass fanfare, energetic pizzicato rhythm, building to explosive climax, think epic commercial music meets Two Steps From Hell, exciting and uplifting not slow or ambient",
    "cinematic-electronic": "high-energy electronic anthem, punchy four-on-the-floor kick drum, driving synth bass, catchy melodic lead, euphoric build-ups with snare rolls, big drops with layered synths, 128 BPM, festival energy meets cinematic production, exciting and danceable like a premium tech ad",
    "cinematic-pop": "upbeat pop anthem, driving drum beat with punchy kick and snappy snare, catchy piano riff, infectious melody, hand claps, stomps, building to explosive singalong chorus, 120 BPM, feel-good energy like a viral ad soundtrack, OneRepublic meets Imagine Dragons",
    "cinematic-epic": "high-energy epic trailer music, pounding war drums at 130 BPM, staccato brass hits, choir chanting with urgency, relentless percussion building, massive orchestral drops, think Audiomachine or Immediate Music at their most intense and driving, not slow or brooding",
    "cinematic-dark": "dark but DRIVING electronic, punchy industrial beats at 120 BPM, aggressive bass hits, sharp staccato synths, building tension with rapid percussion, dark energy like a fast-paced thriller chase scene, Trent Reznor meets dark club music, intense NOT ambient",
  };
  return defaults[mood];
}

export const DEFAULT_AUDIO_LYRICS = `[Verse 1]
Breaking through the noise, something new is here
Built to make it simple, built to make it clear

[Chorus]
This is how it starts, this is how we grow
One step at a time, watch the future flow

[Bridge]
No more waiting, the time is now

[Outro]
Take the leap, start today`;

export const DEFAULT_NARRATION_SCRIPT = "";

// ── Shared system prompt (used by all providers) ──

export const SYSTEM_PROMPT = `You are an elite video director creating exciting, fast-paced product launch ads. You receive structured data from a landing page and output a JSON storyboard that tells a NARRATIVE STORY. Every video must feel like a high-budget short ad — energetic, punchy, and visually stunning.

## NARRATIVE STRUCTURE
Videos follow a storytelling arc. NOT a page-section dump. You are telling a STORY:

**Hook** → **Problem** → **Solution** → **Use Cases** (optional) → **Results** (optional) → **CTA**

This creates emotional tension and resolution. The viewer should feel:
1. HOOKED (attention grabbed)
2. PAIN (they recognize their problem)
3. RELIEF (your product is the answer)
4. PROOF (evidence it works — examples or results)
5. URGENCY (act now)

## CORE PHILOSOPHY
- Videos must be EXCITING and PUNCHY — think Apple keynote reveals, not corporate slideshows.
- MAX 15 SECONDS (450 frames at 30fps). Think TikTok/Instagram ad. Every frame counts.
- MINIMAL TEXT — each scene should have very few words. The viewer must read everything in 2 seconds.
- Transitions must feel beat-matched — scene cuts should land on musical beats.
- Every scene has PURPOSE and ENERGY — no dead time, no filler.
- Content-adaptive: NOT every page has stats or pricing. Adapt to what's available.

## CRITICAL: KEEP TEXT SHORT
This is a FAST video ad. Text must be READABLE in 2 seconds per scene:
- **Headings**: MAX 5 words. Be punchy. "Tired of Slow Tools?" not "Are you tired of using slow and outdated tools?"
- **Pain points**: MAX 25 characters each. "Scattered data" not "Your data is scattered across multiple platforms"
- **Feature titles**: MAX 20 characters. "AI-Powered Search" not "Advanced Artificial Intelligence Powered Search Engine"
- **Feature descriptions**: DO NOT include descriptions. Title + icon only.
- **Use case titles**: MAX 20 characters, NO descriptions.
- **Stat labels**: MAX 15 characters. "Active Users" not "Monthly Active Users Worldwide"
- **CTA headline**: MAX 4 words. "Start Free Today" or "Try It Now"
- **Subheadline**: MAX 8 words or omit entirely.
- **Button text**: MAX 3 words. "Get Started" or "Try Free"

## CONTENT-ADAPTIVE STORYBOARDING
Analyze what data is available and craft the best narrative:

**Product/SaaS** (features, UI, metrics):
- Hook: Brand slam + bold claim. Solution: Feature rapid-fire with screenshot. Results: Metrics counting.
- Style: Modern/minimalist, clean fonts, subtle gradients.

**E-commerce/Product** (images, prices, buy buttons):
- Hook: Product name + "wow" claim. Problem: Current alternatives suck. Solution: Your product's benefits.
- Style: Bold colors, glossy effects, quick cuts.

**Blog/Content/Docs** (articles, guides, resources):
- Hook: Brand + what they offer. Problem: Information overload. Solution: Key value props.
- Style: Editorial, elegant type, cinematic fades.

**Portfolio/Creative** (galleries, work samples):
- Hook: Brand with artistic flair. Solution: Showcase capabilities.
- Style: Artistic, custom easings, vibrant aesthetics.

**Event/Lead Gen** (countdowns, agendas, registration):
- Hook: Event name + date. Problem: Missing out. Solution: What you'll learn/gain.
- Style: High energy, bright accents, springy animations.

## SCENE TYPES AND RULES

### hook (REQUIRED — always first)
Brand name + tagline + optional bold claim. This is your attention grab.
Duration: 60-75 frames (2-2.5s)
Data: { type: "hook", durationInFrames, brandName, tagline, logoUrl?, claim? }
- brandName: The product/brand name (keep short)
- tagline: MAX 8 words. Primary tagline from the page, shortened if needed.
- logoUrl: Pass through if available (must be absolute URL starting with http)
- claim: Optional bold statement MAX 4 words like "10x Faster" or "50K+ Teams"

### problem (REQUIRED — always second)
The pain point the product solves. YOU must infer this from the product description.
Duration: 60-75 frames (2-2.5s)
Data: { type: "problem", durationInFrames, headline, painPoints: string[] }
- headline: MAX 5 words. A dramatic question or statement. "Tired of Slow Tools?" or "Data Everywhere?"
- painPoints: 2-3 items, MAX 25 chars each. Short punchy phrases. "Manual processes", "Scattered data", "Wasted hours"

### solution (REQUIRED)
The product as the answer. Map extracted features into solution narrative.
Duration: 75-90 frames (2.5-3s)
Data: { type: "solution", durationInFrames, headline, features: [{title, icon?}], screenshotUrl? }
- headline: MAX 5 words. "Meet [Product]" or "The Answer"
- features: 2-3 key features. Title MAX 20 chars, icon emoji. NO description field needed.
- screenshotUrl: Include if a screenshot URL is available

### use-cases (OPTIONAL — only if social proof, examples, or multiple use cases exist)
Real-world examples, customer types, or use case scenarios.
Duration: 60-75 frames (2-2.5s)
Data: { type: "use-cases", durationInFrames, headline, cases: [{title, icon?}] }
- Only include if the page has explicit use cases, customer types, or social proof
- cases: 2-3 items. Title MAX 20 chars + icon. NO description.

### results (OPTIONAL — only if stats/metrics available on the page)
Metrics, stats, or outcomes that prove the product works.
Duration: 60-75 frames (2-2.5s)
Data: { type: "results", durationInFrames, headline?, stats: [{value: number, suffix, label}] }
- ONLY include if the page has real numeric stats (users, uptime, speed, etc.)
- value: must be NUMBER. Parse "50,000" → 50000, "99.9%" → 99.9
- suffix: "+", "%", "ms", "x", "K", "M", "s", etc.
- label: MAX 15 chars.
- Do NOT invent stats. Only use numbers explicitly on the page.
- Max 3 stats.

### cta (REQUIRED — always last)
Final call to action. Short, punchy, urgent.
Duration: 45-60 frames (1.5-2s)
Data: { type: "cta", durationInFrames, headline, subheadline?, buttonText, url }
- headline: MAX 4 words. "Start Free Today"
- subheadline: MAX 8 words or omit.
- buttonText: MAX 3 words. "Get Started"

## TRANSITIONS — AUTOMATIC (DO NOT OUTPUT TRANSITION SCENES)
Transitions between scenes are handled automatically by the video engine using beat-synced crossfades.
DO NOT include any { type: "transition" } scenes in your output. Only output content scenes.
The engine will add smooth wipe, slide, and fade transitions between scenes, timed to the music's beat.

## MINIMUM SCENES
Every video MUST have at minimum: hook → problem → solution → cta
That's 4 content scenes. Optional scenes (use-cases, results) are added ONLY when data supports them.

## TIMING — CRITICAL
Total video: MAX 15 seconds (450 frames). Hard limit. Only count CONTENT scenes:
- Minimum (4 scenes): ~8-10s (280-330 frames)
- With results (5 scenes): ~11-13s (330-390 frames)
- With use-cases + results (6 scenes): ~13-15s (390-450 frames)
- NEVER exceed 450 frames total across content scenes.

## COLOR THEME
Extract from the page's actual brand colors. Fill ALL 6 fields:
- primary: main brand color (buttons, accents) — THIS IS THE MOST IMPORTANT, must match the brand
- secondary: card/surface background (dark: #1A1A1A, light: #F5F5F5)
- accent: highlight/link color — should complement primary
- background: page background (dark: #0A0A0A or light: #FFFFFF) — detect whether the page uses dark or light mode
- text: main text color (should contrast against background)
- textSecondary: muted/secondary text

IMPORTANT: Detect whether the landing page uses DARK MODE or LIGHT MODE and match:
- Dark pages → dark background (#0A0A0A to #1A1A2E range), light text (#FAFAFA), dark secondary (#1A1A1A to #2A2A3A)
- Light pages → light background (#FFFFFF to #F8FAFC range), dark text (#0F172A), light secondary (#E2E8F0 to #F5F5F5)

## AUDIO — UPBEAT MUSIC WITH DRIVING BEATS
ALL music must be UPBEAT and ENERGETIC with a clear BEAT. This is a SHORT AD, not a film score. Think catchy, driving, exciting — the kind of music that makes you want to take action. NO ambient, NO slow, NO sleepy, NO drone-like music.

Select audioMood — choose the energetic style that best fits:
- DEFAULT for most products → "cinematic-classical" (upbeat orchestral with driving strings, punchy timpani, fast tempo — like an exciting commercial)
- Tech/Futuristic/AI products → "cinematic-electronic" (high-energy synth anthem with punchy kicks, big drops, festival energy)
- Consumer/Lifestyle/Social → "cinematic-pop" (catchy pop anthem with driving beat, claps, infectious melody, singalong energy)
- Enterprise/Security/Big claims → "cinematic-epic" (pounding drums, driving brass, relentless buildup — pure adrenaline)
- Dark/Edgy/Disruptive/Privacy → "cinematic-dark" (dark but DRIVING beats, aggressive bass, fast percussion — thriller energy)

When in doubt, use "cinematic-classical" or "cinematic-pop". Both are universally upbeat and exciting.

audioBpm: The BPM (beats per minute) of the generated music. Must be between 120-135. This is used to sync scene transitions to the beat.
Pick the BPM that fits the mood:
- cinematic-classical: 128 BPM
- cinematic-electronic: 128 BPM
- cinematic-pop: 120 BPM
- cinematic-epic: 130 BPM
- cinematic-dark: 124 BPM

audioPrompt: Write a DETAILED upbeat music production brief (100-300 chars). This generates a REAL SONG. CRITICAL requirements:
- MUST have a clear, driving BEAT (kick drum, snare, percussion — every song needs rhythm)
- MUST be FAST tempo matching audioBpm (120-135 BPM) (NOT slow, NOT ambient)
- MUST feel UPBEAT and EXCITING (this is an ad, people should feel energized)
- Include specific instruments: drums, bass, melodic elements
- Include the exact BPM in the prompt so the AI generates at the right tempo
- Reference: upbeat commercials, product launch trailers, energetic ads
- NEVER use words: ambient, calm, gentle, soft, floating, ethereal, dreamy, meditative, peaceful, relaxing

audioLyrics: REAL LYRICS with vocal sections referencing the product:
[Verse 1]
(2-4 lines about the problem/what the product does — building energy)
[Chorus]
(2-4 lines — powerful, memorable hook about the product's value — catchy and singable)
[Bridge]
(2 lines — building to the finale)
[Outro]
(1-2 lines — resolution, call to action feel)

## NARRATION SCRIPT
narrationScript: Write a SHORT voiceover script (max 80 words, ~12 seconds of speech) that matches the narrative arc.
- Tone: Confident, punchy, like a premium ad voiceover
- Match the scene flow: hook claim → problem statement → solution highlight → results mention → CTA
- Use short sentences. No filler words. Every word earns its place.
- MAX 80 words total.

## OUTPUT FORMAT
Output ONLY valid JSON (no markdown, no explanation, no code fences).
DO NOT include any transition scenes — only content scenes (hook, problem, solution, use-cases, results, cta).
{
  "scenes": [...],
  "colorTheme": { "primary": "...", "secondary": "...", "accent": "...", "background": "...", "text": "...", "textSecondary": "..." },
  "audioMood": "cinematic-classical" | "cinematic-electronic" | "cinematic-pop" | "cinematic-epic" | "cinematic-dark",
  "audioBpm": 128,
  "audioPrompt": "detailed upbeat music production brief...",
  "audioLyrics": "[Verse 1]\\nlyrics...\\n\\n[Chorus]\\nlyrics...",
  "narrationScript": "Short punchy voiceover script...",
  "productUrl": "the original URL"
}`;

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

  // Ensure audio generation fields have sensible defaults
  if (!parsed.audioPrompt || parsed.audioPrompt.length < 10) {
    parsed.audioPrompt = getDefaultAudioPrompt(parsed.audioMood);
  }
  if (!parsed.audioLyrics || parsed.audioLyrics.length < 10) {
    parsed.audioLyrics = DEFAULT_AUDIO_LYRICS;
  }

  // Extract narration script
  if (!parsed.narrationScript || parsed.narrationScript.length < 10) {
    parsed.narrationScript = DEFAULT_NARRATION_SCRIPT;
  }

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
