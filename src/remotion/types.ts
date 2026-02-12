// ── Video configuration ──
export const VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

// ── Color theme extracted/generated from the landing page ──
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
}

// ── Audio mood — dramatic/exciting/upbeat styles with clear beats ──
export type AudioMood =
  | "cinematic-pop"
  | "cinematic-epic"
  | "cinematic-dark";

// ── Narrative scene types ──

export interface HookSceneData {
  type: "hook";
  durationInFrames: number;
  brandName: string;
  tagline: string;
  logoUrl?: string;
  claim?: string;
}

export interface ProblemSceneData {
  type: "problem";
  durationInFrames: number;
  headline: string;
  painPoints: string[];
}

export interface SolutionSceneData {
  type: "solution";
  durationInFrames: number;
  headline: string;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  screenshotUrl?: string;
}

export interface UseCasesSceneData {
  type: "use-cases";
  durationInFrames: number;
  headline: string;
  cases: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface ResultsSceneData {
  type: "results";
  durationInFrames: number;
  headline?: string;
  stats: Array<{
    value: number;
    suffix: string;
    label: string;
  }>;
}

export interface CTASceneData {
  type: "cta";
  durationInFrames: number;
  headline: string;
  subheadline?: string;
  buttonText: string;
  url: string;
}

export interface TransitionSceneData {
  type: "transition";
  durationInFrames: number;
  style: "fade" | "wipe" | "zoom" | "slide";
}

// ── Content scenes only (no transitions) ──
export type ContentSceneData =
  | HookSceneData
  | ProblemSceneData
  | SolutionSceneData
  | UseCasesSceneData
  | ResultsSceneData
  | CTASceneData;

// ── Union type for all scenes (including legacy transition) ──
export type SceneData =
  | ContentSceneData
  | TransitionSceneData;

// ── The top-level props passed to ProductLaunchVideo via inputProps ──
export type ProductLaunchProps = {
  scenes: SceneData[];
  colorTheme: ColorTheme;
  audioMood: AudioMood;
  productUrl: string;
  audioBpm?: number; // BPM of the generated audio for beat-synced transitions
  audioTrackFile?: string; // Generated audio filename in public/audio/, e.g. "generated-1707400000.mp3"
  narrationTrackFile?: string; // Generated TTS narration filename in public/audio/, e.g. "narration-1707400000.wav"
};
