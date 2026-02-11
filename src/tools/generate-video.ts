import type { GenerateVideoOptions, GenerateVideoResult } from "../types.js";
import { extractStructured, captureScreenshot } from "../lib/tabstack-client.js";
import { renderVideo } from "../lib/renderer.js";
import { logProgress, logDetail } from "../lib/progress.js";
import { runPreflight } from "../lib/preflight.js";
import {
  generateAudio,
  isAudioGenerationAvailable,
  cleanupGeneratedAudio,
} from "../lib/audio-generator.js";
import {
  generateNarration,
  cleanupGeneratedNarration,
} from "../lib/narration-generator.js";
import { resolveAiProvider } from "../lib/defaults.js";
import { createAiProvider } from "../lib/ai-provider.js";

const TOTAL_STEPS = 6;

/**
 * Main pipeline: URL → extract → plan → generate audio → generate narration → render → MP4.
 */
export async function generateVideo(
  options: GenerateVideoOptions,
): Promise<GenerateVideoResult> {
  const { url, outputPath, audioMoodOverride, skipAiAudio } = options;
  let { skipNarration } = options;

  // ── Pre-flight checks ──
  const preflight = await runPreflight(options.aiProvider);
  if (!preflight.ok) {
    const report = preflight.errors.map((e) => `  - ${e}`).join("\n");
    throw new Error(
      `Pre-flight checks failed:\n${report}\n\nRun "npx @tabstack/video-generator --setup" to fix these issues.`,
    );
  }
  for (const warning of preflight.warnings) {
    logDetail(`Warning: ${warning}`);
  }

  // ── Resolve AI provider ──
  const providerName = resolveAiProvider(options.aiProvider);
  const provider = await createAiProvider(providerName);
  logDetail(`Using AI provider: ${providerName}`);

  // Auto-skip narration if provider doesn't support TTS
  if (!skipNarration && !provider.supportsTts) {
    logDetail(`TTS narration not available with ${providerName} provider, skipping`);
    skipNarration = true;
  }

  // ── Step 1: Extract page data ──
  logProgress(1, TOTAL_STEPS, "Extracting page data from URL...");

  const pageData = await extractStructured(url);

  // Fix relative logoUrl → absolute URL so Remotion can fetch it
  if (pageData.logoUrl && !pageData.logoUrl.startsWith("http")) {
    try {
      const origin = new URL(url).origin;
      pageData.logoUrl = new URL(pageData.logoUrl, origin).href;
      logDetail(`Resolved logo URL: ${pageData.logoUrl}`);
    } catch {
      logDetail("Could not resolve logo URL, skipping logo.");
      pageData.logoUrl = "";
    }
  }

  // ── Step 2: Capture screenshot (non-blocking failure) ──
  logProgress(2, TOTAL_STEPS, "Capturing page screenshot...");

  const screenshotUrl = await captureScreenshot(url);

  // ── Step 3: Plan storyboard via AI ──
  logProgress(3, TOTAL_STEPS, `Planning narrative storyboard with ${providerName}...`);

  const storyboard = await provider.planStoryboard(
    pageData,
    screenshotUrl,
    url,
    audioMoodOverride,
  );

  // ── Step 4: Generate AI background music ──
  logProgress(4, TOTAL_STEPS, "Generating AI background music...");

  let audioGenerated = false;

  if (!skipAiAudio && isAudioGenerationAvailable()) {
    try {
      // Clean up old generated files first
      cleanupGeneratedAudio();

      const audioResult = await generateAudio({
        prompt: storyboard.audioPrompt,
        lyrics: storyboard.audioLyrics,
      });

      // Attach the generated filename to the storyboard props for Remotion
      storyboard.audioTrackFile = audioResult.fileName;
      audioGenerated = true;

      logDetail(
        `AI audio generated in ${(audioResult.durationMs / 1000).toFixed(1)}s`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logDetail(`AI audio generation failed, using static fallback: ${msg}`);
      // audioTrackFile remains undefined → AudioTrack falls back to static file
    }
  } else if (skipAiAudio) {
    logDetail("AI audio generation skipped (--no-ai-audio)");
  } else {
    logDetail(
      "WAVESPEED_API_KEY not set, using static audio fallback",
    );
  }

  // ── Step 5: Generate TTS narration (optional) ──
  logProgress(5, TOTAL_STEPS, "Generating TTS narration...");

  let narrationGenerated = false;

  if (!skipNarration && storyboard.narrationScript && storyboard.narrationScript.length > 10) {
    try {
      cleanupGeneratedNarration();

      const narrationResult = await generateNarration({
        script: storyboard.narrationScript,
      });

      storyboard.narrationTrackFile = narrationResult.fileName;
      narrationGenerated = true;

      logDetail(
        `TTS narration generated in ${(narrationResult.durationMs / 1000).toFixed(1)}s`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logDetail(`TTS narration generation failed (video will use music only): ${msg}`);
    }
  } else if (skipNarration) {
    logDetail("TTS narration skipped (--no-narration)");
  } else {
    logDetail("No narration script available, skipping TTS");
  }

  // ── Step 6: Render video ──
  logProgress(6, TOTAL_STEPS, "Rendering video with Remotion...");

  const { durationSeconds } = await renderVideo(storyboard, outputPath);

  // ── Build summary ──
  const sceneTypes = storyboard.scenes.map((s) => s.type);

  const summary = [
    `Product: ${pageData.title}`,
    `AI Provider: ${providerName}`,
    `Tagline: ${pageData.tagline}`,
    `Narrative: ${sceneTypes.join(" → ")}`,
    `Theme: ${storyboard.colorTheme.primary} on ${storyboard.colorTheme.background}`,
    `Audio: ${storyboard.audioMood}${audioGenerated ? " (AI-generated)" : " (static)"}`,
    narrationGenerated ? `Narration: AI voiceover` : `Narration: none`,
  ].join("\n");

  logDetail("Pipeline complete!");

  return {
    outputPath,
    durationSeconds,
    sceneCount: storyboard.scenes.length,
    audioMood: storyboard.audioMood,
    audioGenerated,
    narrationGenerated,
    storyboardSummary: summary,
    aiProvider: providerName,
  };
}
