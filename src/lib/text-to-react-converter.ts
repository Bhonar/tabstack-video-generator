import { GoogleGenAI } from "@google/genai";
import { getGeminiKey } from "./defaults.js";
import { logDetail } from "./progress.js";
import type { ColorTheme } from "../remotion/types.js";

/**
 * Converts a text description of a video into executable React/TSX code
 * that Remotion can render.
 */
export async function convertTextToReact(
  textDescription: string,
  colorTheme: ColorTheme,
  durationInFrames: number,
  audioBpm: number,
): Promise<string> {
  const key = getGeminiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const systemPrompt = `You are an expert React/Remotion developer. You convert video descriptions into executable React/TSX code for Remotion.

Given a detailed text description of a video, you output a SINGLE React component that renders the entire video.

REQUIREMENTS:
- Import from "remotion": AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, Img
- Export a default component that takes props: { colorTheme: ColorTheme, audioBpm: number }
- Use the exact frame timings and animations from the description
- Implement ALL the creative animations described (zooms, rotations, slides, bounces, etc.)
- Use spring animations with appropriate configs for the described effects
- Use the colorTheme props for all colors
- The component must be self-contained and executable

IMPORTANT:
- Output ONLY the React code, no markdown fences, no explanations
- Start with imports, end with the component
- Use TypeScript with proper types
- Make animations match EXACTLY what's described in the text

EXAMPLE OUTPUT FORMAT:
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence, Img } from "remotion";

interface Props {
  colorTheme: { primary: string; secondary: string; accent: string; background: string; text: string; textSecondary: string };
  audioBpm: number;
}

export default function GeneratedVideo({ colorTheme }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene timings from description
  const hookStart = 0;
  const hookEnd = 60;

  // Animations matching description
  const logoProgress = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  return (
    <AbsoluteFill style={{ background: colorTheme.background }}>
      {/* Implement all scenes and animations from description */}
    </AbsoluteFill>
  );
}`;

  const userPrompt = `Convert this video description into executable React/TSX code:

VIDEO DESCRIPTION:
${textDescription}

COLOR THEME:
${JSON.stringify(colorTheme, null, 2)}

TOTAL DURATION: ${durationInFrames} frames
AUDIO BPM: ${audioBpm}

Output ONLY the React/TSX code that implements this exact video description.`;

  logDetail("Converting text description to React code...");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.3, // Lower temperature for more precise code generation
    },
  });

  let code = response.text;
  if (!code) {
    throw new Error("No code generated from text description");
  }

  // Strip markdown fences if present
  code = code.trim();
  if (code.startsWith("```")) {
    code = code.replace(/^```(?:typescript|tsx|ts|javascript|jsx|js)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  logDetail(`Generated React code: ${code.length} characters`);

  return code;
}
