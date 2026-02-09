import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { IntroScene } from "../scenes/IntroScene.js";
import { HeroScreenshotScene } from "../scenes/HeroScreenshotScene.js";
import { FeaturesScene } from "../scenes/FeaturesScene.js";
import { StatsScene } from "../scenes/StatsScene.js";
import { PricingScene } from "../scenes/PricingScene.js";
import { CTAScene } from "../scenes/CTAScene.js";
import { TransitionScene } from "../scenes/TransitionScene.js";
import { AudioTrack } from "../audio/AudioTrack.js";
import { FontStyles } from "../lib/fonts.js";
import type { ProductLaunchProps, SceneData, ColorTheme } from "../types.js";

// ── Scene component registry ──

const SCENE_COMPONENTS: Record<
  SceneData["type"],
  React.FC<any>
> = {
  intro: IntroScene,
  "hero-screenshot": HeroScreenshotScene,
  features: FeaturesScene,
  stats: StatsScene,
  pricing: PricingScene,
  cta: CTAScene,
  transition: TransitionScene,
};

// ── Main composition ──

export const ProductLaunchVideo: React.FC<ProductLaunchProps> = ({
  scenes,
  colorTheme,
  audioMood,
  audioTrackFile,
}) => {
  // Calculate frame offsets for each scene
  let currentFrame = 0;
  const sceneEntries = scenes.map((scene) => {
    const entry = { scene, startFrame: currentFrame };
    currentFrame += scene.durationInFrames;
    return entry;
  });
  const totalDuration = currentFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: colorTheme.background }}>
      {/* Load fonts */}
      <FontStyles />

      {/* Render each scene as a Sequence */}
      {sceneEntries.map(({ scene, startFrame }, index) => {
        const Component = SCENE_COMPONENTS[scene.type];
        if (!Component) return null;

        return (
          <Sequence
            key={`${scene.type}-${index}`}
            from={startFrame}
            durationInFrames={scene.durationInFrames}
            name={`${scene.type}-${index}`}
          >
            <Component {...scene} colorTheme={colorTheme} />
          </Sequence>
        );
      })}

      {/* Background music layer — uses AI-generated track when available */}
      <AudioTrack mood={audioMood} totalDuration={totalDuration} audioTrackFile={audioTrackFile} />
    </AbsoluteFill>
  );
};
