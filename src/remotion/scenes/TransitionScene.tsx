import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { TransitionSceneData, ColorTheme } from "../types.js";

type Props = TransitionSceneData & { colorTheme: ColorTheme };

export const TransitionScene: React.FC<Props> = ({
  style: transitionStyle,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const mid = durationInFrames / 2;

  switch (transitionStyle) {
    case "fade": {
      const opacity = interpolate(
        frame,
        [0, mid, durationInFrames],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      return (
        <AbsoluteFill
          style={{ backgroundColor: colorTheme.background, opacity }}
        />
      );
    }

    case "wipe": {
      const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <AbsoluteFill style={{ backgroundColor: colorTheme.background }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: colorTheme.primary,
              transform: `translateX(${interpolate(progress, [0, 0.5, 1], [-100, 0, 100])}%)`,
            }}
          />
        </AbsoluteFill>
      );
    }

    case "zoom": {
      const scale = interpolate(
        frame,
        [0, mid, durationInFrames],
        [1, 1.08, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      const opacity = interpolate(
        frame,
        [0, mid, durationInFrames],
        [0, 0.3, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      return (
        <AbsoluteFill
          style={{
            backgroundColor: colorTheme.background,
            transform: `scale(${scale})`,
            opacity,
          }}
        />
      );
    }

    case "slide": {
      const x = interpolate(frame, [0, durationInFrames], [100, -100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      return (
        <AbsoluteFill style={{ backgroundColor: colorTheme.background }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(90deg, ${colorTheme.primary}40, transparent)`,
              transform: `translateX(${x}%)`,
            }}
          />
        </AbsoluteFill>
      );
    }

    default:
      return <AbsoluteFill style={{ backgroundColor: colorTheme.background }} />;
  }
};
