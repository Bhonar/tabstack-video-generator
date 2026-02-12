import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { extractStructured, captureScreenshot } from "./lib/tabstack-client.js";
import { generateAudio, isAudioGenerationAvailable } from "./lib/audio-generator.js";
import { runPreflight } from "./lib/preflight.js";
import { writeFile } from "fs/promises";
import path from "path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { bundle } from "@remotion/bundler";

/**
 * Creates and configures the MCP server with granular tools
 * for Claude Code + Skills to orchestrate video generation.
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: "tabstack-video-generator",
    version: "2.0.0",
  });

  // ── Tool 1: Extract page data via TabStack ──
  const extractPageDataSchema = {
    url: z.string().url().describe("The landing page URL to extract data from"),
  };

  // @ts-expect-error — zod type compatibility
  server.tool(
    "extract_page_data",
    "Extract structured data from a landing page URL using TabStack API. Returns title, description, features, colors, logo, and other metadata for video generation.",
    extractPageDataSchema,
    async ({ url }: { url: string }) => {
      try {
        const pageData = await extractStructured(url);

        // Fix relative logoUrl → absolute URL
        if (pageData.logoUrl && !pageData.logoUrl.startsWith("http")) {
          try {
            const origin = new URL(url).origin;
            pageData.logoUrl = new URL(pageData.logoUrl, origin).href;
          } catch {
            pageData.logoUrl = "";
          }
        }

        // Capture screenshot (non-blocking)
        let screenshotUrl = null;
        try {
          screenshotUrl = await captureScreenshot(url);
        } catch {
          // Screenshot is optional
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  ...pageData,
                  screenshotUrl,
                  productUrl: url,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Extraction failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // ── Tool 2: Generate AI music ──
  const generateAudioSchema = {
    prompt: z
      .string()
      .describe(
        "Music generation prompt. Format: 'Instrumental [style], [BPM] BPM, [beat description], [energy]'. Example: 'Instrumental epic trailer, 128 BPM, precise kick every beat, dramatic energy'"
      ),
    lyrics: z
      .string()
      .optional()
      .describe(
        "Product-specific lyrics with [Verse 1], [Chorus] structure. Example: '[Verse 1]\\nProduct line here\\n\\n[Chorus]\\nCatchy line'"
      ),
  };

  // @ts-expect-error — zod type compatibility
  server.tool(
    "generate_audio",
    "Generate AI background music using WaveSpeed Minimax Music 2.5. Creates dramatic, beat-synced music for product videos. Requires WAVESPEED_API_KEY environment variable.",
    generateAudioSchema,
    async ({ prompt, lyrics }: { prompt: string; lyrics?: string }) => {
      try {
        if (!isAudioGenerationAvailable()) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Audio generation unavailable: WAVESPEED_API_KEY not set. Use fallback audio or skip this step.",
              },
            ],
            isError: true,
          };
        }

        const result = await generateAudio({ prompt, lyrics: lyrics || "" });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  audioFile: `public/audio/${result.fileName}`,
                  durationMs: result.durationMs,
                  fileName: result.fileName,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Audio generation failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  // ── Tool 3: Render video from React code ──
  const renderVideoSchema = {
    reactCode: z
      .string()
      .describe(
        "Complete React/TypeScript component code for Remotion. Must import from 'remotion' and export a default component."
      ),
    durationInFrames: z
      .number()
      .min(90)
      .max(900)
      .describe("Total video duration in frames (30 fps). 300-450 frames = 10-15 seconds."),
    audioFile: z
      .string()
      .optional()
      .describe("Path to audio file (relative to public/audio/). Example: 'generated-123.mp3'"),
    outputPath: z
      .string()
      .optional()
      .describe("Output MP4 path. Defaults to ./out/video.mp4"),
  };

  // @ts-expect-error — zod type compatibility
  server.tool(
    "render_video",
    "Render a video from React/TypeScript code using Remotion. Takes the React component code, duration, optional audio, and outputs an HD MP4 (1920x1080, 30fps).",
    renderVideoSchema,
    async ({
      reactCode,
      durationInFrames,
      audioFile,
      outputPath,
    }: {
      reactCode: string;
      durationInFrames: number;
      audioFile?: string;
      outputPath?: string;
    }) => {
      try {
        // Save React code to a temporary composition file
        const compositionPath = path.resolve(
          process.cwd(),
          "src/remotion/compositions/GeneratedVideo.tsx"
        );
        await writeFile(compositionPath, reactCode, "utf-8");

        // Bundle Remotion project
        const entryPoint = path.resolve(process.cwd(), "dist/remotion/index.js");
        const publicDir = path.resolve(process.cwd(), "public");

        const bundleLocation = await bundle({
          entryPoint,
          publicDir,
        });

        // Render video
        const resolvedOutput = path.isAbsolute(outputPath || "./out/video.mp4")
          ? outputPath || "./out/video.mp4"
          : path.resolve(process.cwd(), outputPath || "./out/video.mp4");

        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: "GeneratedVideo",
          inputProps: {
            colorTheme: { primary: "#000", secondary: "#fff", background: "#fff", text: "#000" },
            audioFile: audioFile ? `public/audio/${audioFile}` : undefined,
          },
        });

        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          codec: "h264",
          outputLocation: resolvedOutput,
          inputProps: {
            colorTheme: { primary: "#000", secondary: "#fff", background: "#fff", text: "#000" },
            audioFile: audioFile ? `public/audio/${audioFile}` : undefined,
          },
        });

        const durationSeconds = durationInFrames / 30;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  videoPath: resolvedOutput,
                  duration: durationSeconds,
                  resolution: "1920x1080",
                  fps: 30,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Rendering failed: ${message}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}

/**
 * Start the MCP server on STDIO transport.
 */
export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  // Run preflight checks on startup (warn-only, don't block)
  const preflight = await runPreflight();
  if (!preflight.ok) {
    console.error("Warning: Pre-flight checks found issues:");
    for (const err of preflight.errors) {
      console.error(`  [!] ${err}`);
    }
  }
  for (const warning of preflight.warnings) {
    console.error(`  [~] ${warning}`);
  }

  await server.connect(transport);
  console.error("Tabstack Video Generator MCP Server running on stdio");
}
