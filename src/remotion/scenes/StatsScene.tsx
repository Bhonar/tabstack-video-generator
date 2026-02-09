import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { StatsSceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, useAnimatedCounter } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = StatsSceneData & { colorTheme: ColorTheme };

const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  index: number;
  colorTheme: ColorTheme;
}> = ({ value, suffix, label, index, colorTheme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Staggered card entrance
  const cardProgress = spring({
    frame: Math.max(0, frame - 10 - index * 10),
    fps,
    config: SPRING_CONFIG,
  });
  const cardY = interpolate(cardProgress, [0, 1], [40, 0]);

  // Animated counter
  const displayValue = useAnimatedCounter(value, 15 + index * 10, 50);

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translateY(${cardY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "40px 48px",
        borderRadius: 20,
        background: `${colorTheme.secondary}50`,
        border: `1px solid ${colorTheme.textSecondary}15`,
        minWidth: 220,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 72,
          fontWeight: 800,
          color: colorTheme.primary,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        {displayValue.toLocaleString()}
        <span style={{ fontSize: 48, color: colorTheme.accent }}>
          {suffix}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 20,
          fontWeight: 500,
          color: colorTheme.textSecondary,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const StatsScene: React.FC<Props> = ({ stats, colorTheme }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Container entrance
  const containerProgress = spring({ frame, fps, config: SPRING_CONFIG });

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity: containerProgress * fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 40,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {stats.slice(0, 4).map((stat, index) => (
          <StatCard
            key={index}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            index={index}
            colorTheme={colorTheme}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
