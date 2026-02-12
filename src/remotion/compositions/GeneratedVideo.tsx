import { AbsoluteFill } from "remotion";

/**
 * Placeholder composition that will be overwritten by AI-generated React code.
 * This file gets replaced when render_video MCP tool is called.
 */

interface Props {
  colorTheme?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  audioFile?: string;
}

export default function GeneratedVideo({ colorTheme }: Props) {
  const theme = colorTheme || {
    primary: "#4F46E5",
    secondary: "#E0E7FF",
    background: "#FFFFFF",
    text: "#0F172A",
  };
  return (
    <AbsoluteFill
      style={{
        background: theme.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.text,
        fontSize: 48,
        fontWeight: "bold",
      }}
    >
      AI-Generated Video Placeholder
    </AbsoluteFill>
  );
}
