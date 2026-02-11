import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { TransitionSceneData, ColorTheme } from "../types.js";
import { isLightTheme } from "../lib/colors.js";

type Props = TransitionSceneData & { colorTheme: ColorTheme };

/**
 * Seamless transitions between scenes.
 * Designed as quick, elegant bridges — not jarring overlays.
 */
export const TransitionScene: React.FC<Props> = ({
  style: transitionStyle,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const light = isLightTheme(colorTheme);

  switch (transitionStyle) {
    case "fade": {
      // Smooth crossfade — gentle opacity bell curve, no jarring cut
      const opacity = interpolate(
        progress,
        [0, 0.35, 0.65, 1],
        [0, 0.85, 0.85, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      return (
        <AbsoluteFill
          style={{ backgroundColor: colorTheme.background, opacity }}
        />
      );
    }

    case "wipe": {
      // Smooth gradient wipe — soft edge, not a hard stripe
      const x = interpolate(progress, [0, 1], [-120, 120]);
      return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(90deg, transparent 0%, ${colorTheme.background} 30%, ${colorTheme.background} 70%, transparent 100%)`,
              transform: `translateX(${x}%)`,
            }}
          />
        </AbsoluteFill>
      );
    }

    case "zoom": {
      // Quick scale punch with soft radial reveal
      const scale = interpolate(
        progress,
        [0, 0.45, 1],
        [1.08, 1, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      const opacity = interpolate(
        progress,
        [0, 0.25, 0.75, 1],
        [0, 0.7, 0.7, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      const radialColor = light ? "rgba(255,255,255,0.6)" : `${colorTheme.primary}25`;
      return (
        <AbsoluteFill
          style={{
            backgroundColor: colorTheme.background,
            transform: `scale(${scale})`,
            opacity,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle, ${radialColor} 0%, transparent 55%)`,
            }}
          />
        </AbsoluteFill>
      );
    }

    case "slide": {
      // Smooth diagonal gradient slide — wide soft edge
      const x = interpolate(progress, [0, 1], [110, -110]);
      const gradientColor = light ? "rgba(0,0,0,0.04)" : `${colorTheme.primary}20`;
      return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: -20,
              left: -20,
              width: "120%",
              height: "120%",
              background: `linear-gradient(120deg, ${colorTheme.background}, ${gradientColor}, transparent)`,
              transform: `translateX(${x}%)`,
            }}
          />
        </AbsoluteFill>
      );
    }

    default:
      return <AbsoluteFill style={{ backgroundColor: colorTheme.background, opacity: 0 }} />;
  }
};
