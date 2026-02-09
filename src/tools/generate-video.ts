import type { GenerateVideoOptions, GenerateVideoResult } from "../types.js";
import { extractStructured, captureScreenshot } from "../lib/tabstack-client.js";
import { planScenes } from "../lib/scene-planner.js";
import { renderVideo } from "../lib/renderer.js";
import { logProgress, logDetail } from "../lib/progress.js";
import { runPreflight } from "../lib/preflight.js";
import {
  generateAudio,
  isAudioGenerationAvailable,
  cleanupGeneratedAudio,
} from "../lib/audio-generator.js";

const TOTAL_STEPS = 5;

/**
 * Main pipeline: URL → extract → plan → generate audio → render → MP4.
 */
export async function generateVideo(
  options: GenerateVideoOptions,
): Promise<GenerateVideoResult> {
  const { url, outputPath, audioMoodOverride, skipAiAudio } = options;

  // ── Pre-flight checks ──
  const preflight = await runPreflight();
  if (!preflight.ok) {
    const report = preflight.errors.map((e) => `  - ${e}`).join("\n");
    throw new Error(
      `Pre-flight checks failed:\n${report}\n\nRun "npx @tabstack/video-generator --setup" to fix these issues.`,
    );
  }
  for (const warning of preflight.warnings) {
    logDetail(`Warning: ${warning}`);
  }

  // ── Step 1: Extract page data ──
  logProgress(1, TOTAL_STEPS, "Extracting page data from URL...");

  const pageData = await extractStructured(url);

  // ── Step 2: Capture screenshot (non-blocking failure) ──
  logProgress(2, TOTAL_STEPS, "Capturing page screenshot...");

  const screenshotUrl = await captureScreenshot(url);

  // ── Step 3: Plan storyboard via AI ──
  logProgress(3, TOTAL_STEPS, "Planning video storyboard with AI...");

  const storyboard = await planScenes(
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

  // ── Step 5: Render video ──
  logProgress(5, TOTAL_STEPS, "Rendering video with Remotion...");

  const { durationSeconds } = await renderVideo(storyboard, outputPath);

  // ── Build summary ──
  const sceneTypes = storyboard.scenes
    .filter((s) => s.type !== "transition")
    .map((s) => s.type);

  const summary = [
    `Product: ${pageData.title}`,
    `Tagline: ${pageData.tagline}`,
    `Scenes: ${sceneTypes.join(" → ")}`,
    `Theme: ${storyboard.colorTheme.primary} on ${storyboard.colorTheme.background}`,
    `Audio: ${storyboard.audioMood}${audioGenerated ? " (AI-generated)" : " (static)"}`,
  ].join("\n");

  logDetail("Pipeline complete!");

  return {
    outputPath,
    durationSeconds,
    sceneCount: storyboard.scenes.length,
    audioMood: storyboard.audioMood,
    audioGenerated,
    storyboardSummary: summary,
  };
}
