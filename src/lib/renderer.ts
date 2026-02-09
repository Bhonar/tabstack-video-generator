import path from "path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { ProductLaunchProps } from "../remotion/types.js";
import { logDetail } from "./progress.js";

// ── Package root resolution (works from dist/lib/renderer.js) ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, "../..");

let cachedBundleLocation: string | null = null;

/**
 * Bundle the Remotion project. Caches the result for subsequent renders.
 */
async function ensureBundle(): Promise<string> {
  if (cachedBundleLocation) {
    logDetail("Using cached Remotion bundle.");
    return cachedBundleLocation;
  }

  logDetail("Bundling Remotion project (first time, may take ~10s)...");

  const entryPoint = path.resolve(PACKAGE_ROOT, "dist/remotion/index.js");
  const publicDir = path.resolve(PACKAGE_ROOT, "public");

  cachedBundleLocation = await bundle({
    entryPoint,
    publicDir,
  });

  logDetail("Bundle complete.");
  return cachedBundleLocation;
}

/**
 * Render a video using Remotion.
 */
export async function renderVideo(
  inputProps: ProductLaunchProps,
  outputPath: string,
  onProgress?: (percent: number) => void,
): Promise<{ durationSeconds: number }> {
  // If using a generated audio track, we must re-bundle to include the new file
  if (inputProps.audioTrackFile) {
    cachedBundleLocation = null;
  }

  const bundleLocation = await ensureBundle();

  // Resolve output path relative to cwd if not absolute
  const resolvedOutput = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);

  // Ensure output directory exists
  const { mkdir } = await import("fs/promises");
  await mkdir(path.dirname(resolvedOutput), { recursive: true });

  logDetail("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ProductLaunchVideo",
    inputProps,
  });

  const durationSeconds = composition.durationInFrames / composition.fps;
  logDetail(
    `Rendering ${composition.durationInFrames} frames (${durationSeconds.toFixed(1)}s) at ${composition.width}x${composition.height}...`,
  );

  let lastReportedPercent = 0;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: resolvedOutput,
    inputProps,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      // Report every 10%
      if (percent >= lastReportedPercent + 10) {
        lastReportedPercent = percent;
        logDetail(`Render progress: ${percent}%`);
        if (onProgress) onProgress(percent);
      }
    },
  });

  logDetail(`Render complete: ${resolvedOutput}`);
  return { durationSeconds };
}
