/**
 * DEPRECATED: This CLI tool has been removed.
 *
 * This is now an MCP + Skill tool for Claude Code.
 *
 * How to use:
 * 1. Add MCP server: claude mcp add tabstack-video -e TABSTACK_API_KEY=...
 * 2. In Claude Code, ask: "Generate a video for https://example.com"
 *
 * Claude Code will:
 * - Call extract_page_data tool to get page content, colors, fonts
 * - Generate React/Remotion video code itself (no external AI API needed)
 * - Call render_video tool to create the final MP4
 */

export function generateVideo() {
  throw new Error(
    "CLI mode has been removed. This is now an MCP + Skill tool. " +
    "Use: claude mcp add tabstack-video, then ask Claude Code to generate videos."
  );
}
