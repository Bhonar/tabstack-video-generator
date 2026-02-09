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

// ── Audio mood ──
export type AudioMood =
  | "tech"
  | "elegant"
  | "corporate"
  | "energetic"
  | "minimal";

// ── Scene type discriminated union ──

export interface IntroSceneData {
  type: "intro";
  durationInFrames: number;
  brandName: string;
  tagline: string;
  logoUrl?: string;
}

export interface HeroScreenshotSceneData {
  type: "hero-screenshot";
  durationInFrames: number;
  screenshotUrl: string;
  headline?: string;
  subheadline?: string;
}

export interface FeaturesSceneData {
  type: "features";
  durationInFrames: number;
  sectionTitle: string;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export interface StatsSceneData {
  type: "stats";
  durationInFrames: number;
  stats: Array<{
    value: number;
    suffix: string;
    label: string;
  }>;
}

export interface PricingSceneData {
  type: "pricing";
  durationInFrames: number;
  tiers: Array<{
    name: string;
    price: string;
    highlighted: boolean;
    features: string[];
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

// ── Union type for all scenes ──
export type SceneData =
  | IntroSceneData
  | HeroScreenshotSceneData
  | FeaturesSceneData
  | StatsSceneData
  | PricingSceneData
  | CTASceneData
  | TransitionSceneData;

// ── The top-level props passed to ProductLaunchVideo via inputProps ──
export type ProductLaunchProps = {
  scenes: SceneData[];
  colorTheme: ColorTheme;
  audioMood: AudioMood;
  productUrl: string;
  audioTrackFile?: string; // Generated audio filename in public/audio/, e.g. "generated-1707400000.mp3"
};
