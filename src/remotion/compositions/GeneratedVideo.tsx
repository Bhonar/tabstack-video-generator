import { AbsoluteFill } from "remotion";

/**
 * Placeholder composition that will be overwritten by AI-generated React code.
 * This file gets replaced when render_video MCP tool is called.
 */

interface Props {
  colorTheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  audioFile?: string;
}

export default function GeneratedVideo({ colorTheme }: Props) {
  return (
    <AbsoluteFill
      style={{
        background: colorTheme.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colorTheme.text,
        fontSize: 48,
        fontWeight: "bold",
      }}
    >
      AI-Generated Video Placeholder
    </AbsoluteFill>
  );
}
