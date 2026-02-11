import React from "react";
import { Composition } from "remotion";
import { ProductLaunchVideo } from "./compositions/ProductLaunchVideo.js";
import type { ProductLaunchProps } from "./types.js";
import { VIDEO_CONFIG } from "./types.js";

// ── Default props for Remotion Studio preview ──
const defaultProps: ProductLaunchProps = {
  productUrl: "https://tabstack.ai",
  audioMood: "cinematic-classical",
  audioBpm: 128,
  colorTheme: {
    primary: "#FF97EA",
    secondary: "#1A1A1A",
    accent: "#A5D6FF",
    background: "#0A0A0A",
    text: "#FAFAFA",
    textSecondary: "#A1A1AA",
  },
  scenes: [
    {
      type: "hook",
      durationInFrames: 65,
      brandName: "Tabstack",
      tagline: "Web Browsing for AI",
      claim: "50K+ Credits Free",
    },
    {
      type: "problem",
      durationInFrames: 65,
      headline: "Web Data Is a Mess",
      painPoints: [
        "Scraping breaks often",
        "No structured output",
        "Dynamic pages fail",
      ],
    },
    {
      type: "solution",
      durationInFrames: 80,
      headline: "Meet Tabstack",
      features: [
        { title: "Extract JSON", description: "", icon: "📄" },
        { title: "Automate Browsers", description: "", icon: "⚡" },
        { title: "AI Research", description: "", icon: "🔍" },
      ],
    },
    {
      type: "results",
      durationInFrames: 65,
      headline: "Proven Results",
      stats: [
        { value: 50000, suffix: "+", label: "Free Credits" },
        { value: 99, suffix: "%", label: "Uptime" },
        { value: 200, suffix: "ms", label: "Avg Latency" },
      ],
    },
    {
      type: "cta",
      durationInFrames: 55,
      headline: "Start Building",
      subheadline: "50K free credits. No card needed.",
      buttonText: "Get Started",
      url: "console.tabstack.ai",
    },
  ],
};

// ── Calculate total duration accounting for transition overlaps ──
function calculateTotalFrames(props: ProductLaunchProps): number {
  const contentScenes = props.scenes.filter((s) => s.type !== "transition");
  const totalContent = contentScenes.reduce((acc, s) => acc + s.durationInFrames, 0);

  // Each transition between scenes overlaps by ~half a beat
  const bpm = props.audioBpm ?? 128;
  const framesPerBeat = (60 / bpm) * VIDEO_CONFIG.fps;
  const transitionFrames = Math.max(8, Math.min(18, Math.round(framesPerBeat / 2)));
  const numTransitions = Math.max(0, contentScenes.length - 1);

  return totalContent - numTransitions * transitionFrames;
}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductLaunchVideo"
      component={ProductLaunchVideo}
      durationInFrames={calculateTotalFrames(defaultProps)}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: calculateTotalFrames(props),
      })}
    />
  );
};
