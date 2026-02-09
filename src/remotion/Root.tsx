import React from "react";
import { Composition } from "remotion";
import { ProductLaunchVideo } from "./compositions/ProductLaunchVideo.js";
import type { ProductLaunchProps } from "./types.js";
import { VIDEO_CONFIG } from "./types.js";

// ── Default props for Remotion Studio preview ──
const defaultProps: ProductLaunchProps = {
  productUrl: "https://tabstack.ai",
  audioMood: "tech",
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
      type: "intro",
      durationInFrames: 120,
      brandName: "Tabstack",
      tagline: "Web Browsing for AI Systems",
    },
    {
      type: "transition",
      durationInFrames: 15,
      style: "fade",
    },
    {
      type: "features",
      durationInFrames: 180,
      sectionTitle: "Everything You Need",
      features: [
        {
          title: "Extract",
          description: "Turn websites into structured data",
          icon: "📄",
        },
        {
          title: "Automate",
          description: "Run browser-like automations",
          icon: "⚡",
        },
        {
          title: "Research",
          description: "AI-powered web research",
          icon: "🔍",
        },
        {
          title: "Generate",
          description: "Transform web data into outputs",
          icon: "✨",
        },
      ],
    },
    {
      type: "transition",
      durationInFrames: 15,
      style: "wipe",
    },
    {
      type: "stats",
      durationInFrames: 120,
      stats: [
        { value: 50000, suffix: "+", label: "Free Credits" },
        { value: 99, suffix: "%", label: "Uptime" },
        { value: 200, suffix: "ms", label: "Avg Latency" },
      ],
    },
    {
      type: "transition",
      durationInFrames: 15,
      style: "fade",
    },
    {
      type: "pricing",
      durationInFrames: 150,
      tiers: [
        {
          name: "Starter",
          price: "Free",
          highlighted: false,
          features: ["50K credits/mo", "Community support"],
        },
        {
          name: "Explorer",
          price: "Pay-as-you-go",
          highlighted: true,
          features: ["All endpoints", "Priority support", "Team management"],
        },
        {
          name: "Enterprise",
          price: "Custom",
          highlighted: false,
          features: ["Dedicated SLAs", "SSO & security"],
        },
      ],
    },
    {
      type: "transition",
      durationInFrames: 15,
      style: "fade",
    },
    {
      type: "cta",
      durationInFrames: 90,
      headline: "Start Building Today",
      subheadline: "50,000 free credits. No credit card required.",
      buttonText: "Get Started",
      url: "console.tabstack.ai",
    },
  ],
};

// ── Calculate total duration from scenes ──
function calculateTotalFrames(props: ProductLaunchProps): number {
  return props.scenes.reduce((acc, scene) => acc + scene.durationInFrames, 0);
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
