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
    aiProvider: z
      .enum(["gemini", "claude"])
      .optional()
      .describe(
        "AI provider for storyboard planning. 'gemini' (Google Gemini 2.5 Flash) or 'claude' (Anthropic Claude Sonnet). Auto-detected from available API keys if not specified.",
      ),
    audioMood: z
      .enum(["cinematic-classical", "cinematic-electronic", "cinematic-pop", "cinematic-epic", "cinematic-dark"])
      .optional()
      .describe(
        "Dramatic music style. Default: cinematic-classical (orchestral). Auto-detected from page content if not specified.",
      ),
    narration: z
      .boolean()
      .optional()
      .describe(
        "Enable AI voiceover narration using Gemini TTS. Only available with Gemini provider. Default: false.",
      ),
  };

  // @ts-expect-error — zod 3.22.3 types don't perfectly match ZodRawShapeCompat but work at runtime
  server.tool(
    "generate_video",
    "Generate a premium product launch video from any landing page URL. Uses a narrative storytelling structure (Hook → Problem → Solution → Results → CTA). Extracts page content using Tabstack API, plans a narrative storyboard with AI (Gemini or Claude — configurable), generates AI music with WaveSpeed, optional TTS voiceover (Gemini only), and renders an HD MP4 video. Max 15 seconds.",
    paramsSchema,
    async ({ url, outputPath, aiProvider, audioMood, narration }: { url: string; outputPath?: string; aiProvider?: string; audioMood?: string; narration?: boolean }) => {
      try {
        const result = await generateVideo({
          url,
          outputPath: outputPath || "./out/video.mp4",
          aiProvider,
          audioMoodOverride: audioMood,
          skipNarration: !narration,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: [
                "Video generated successfully!",
                "",
                `Output: ${result.outputPath}`,
                `AI Provider: ${result.aiProvider}`,
                `Duration: ${result.durationSeconds.toFixed(1)}s`,
                `Scenes: ${result.sceneCount}`,
                `Audio: ${result.audioMood}${result.audioGenerated ? " (AI-generated)" : " (static)"}`,
                result.narrationGenerated ? "Narration: AI voiceover" : "",
                "",
                "Storyboard:",
                result.storyboardSummary,
              ].filter(Boolean).join("\n"),
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
