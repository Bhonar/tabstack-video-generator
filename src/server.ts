import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateVideo } from "./tools/generate-video.js";
import { runPreflight } from "./lib/preflight.js";

/**
 * Creates and configures the MCP server.
 */
function createServer(): McpServer {
  const server = new McpServer({
    name: "tabstack-video-generator",
    version: "1.0.0",
  });

  // ── Main tool: generate a product launch video from a URL ──
  const paramsSchema = {
    url: z.string().url().describe("The landing page URL to create a video for"),
    outputPath: z
      .string()
      .optional()
      .describe("Output file path for the MP4. Defaults to ./out/video.mp4"),
    audioMood: z
      .enum(["tech", "elegant", "corporate", "energetic", "minimal"])
      .optional()
      .describe(
        "Background music mood. Auto-detected from page content if not specified.",
      ),
  };

  // @ts-expect-error — zod 3.22.3 types don't perfectly match ZodRawShapeCompat but work at runtime
  server.tool(
    "generate_video",
    "Generate a premium product launch video from any landing page URL. Extracts page content using Tabstack API, plans a storyboard with Gemini AI, and renders an HD MP4 video using Remotion.",
    paramsSchema,
    async ({ url, outputPath, audioMood }: { url: string; outputPath?: string; audioMood?: string }) => {
      try {
        const result = await generateVideo({
          url,
          outputPath: outputPath || "./out/video.mp4",
          audioMoodOverride: audioMood,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: [
                "Video generated successfully!",
                "",
                `Output: ${result.outputPath}`,
                `Duration: ${result.durationSeconds.toFixed(1)}s`,
                `Scenes: ${result.sceneCount}`,
                `Audio: ${result.audioMood}${result.audioGenerated ? " (AI-generated)" : " (static)"}`,
                "",
                "Storyboard:",
                result.storyboardSummary,
              ].join("\n"),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] ${message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: `Video generation failed: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
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
