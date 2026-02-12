import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { ResultsSceneData, ColorTheme } from "../types.js";
import { FAST_SPRING, BOUNCE_SPRING, SLAM_SPRING, useAnimatedCounter } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import {
  themeGradient,
  isLightTheme,
  themeShadow,
  themeCardBg,
  themeTextGlow,
} from "../lib/colors.js";

type Props = ResultsSceneData & { colorTheme: ColorTheme };

const StatCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  index: number;
  colorTheme: ColorTheme;
}> = ({ value, suffix, label, index, colorTheme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = isLightTheme(colorTheme);

  // Fast stagger — cards slam in from below
  const cardProgress = spring({
    frame: Math.max(0, frame - 4 - index * 6),
    fps,
    config: FAST_SPRING,
  });
  const cardY = interpolate(cardProgress, [0, 1], [60, 0]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.8, 1]);

  // Counter — fast animation
  const displayValue = useAnimatedCounter(value, 8 + index * 6, 30);

  // Suffix bounce in
  const suffixProgress = spring({
    frame: Math.max(0, frame - 20 - index * 6),
    fps,
    config: BOUNCE_SPRING,
  });
  const suffixScale = interpolate(suffixProgress, [0, 1], [0.3, 1]);

  // Glow when counter finishes
  const counterDone = frame > 8 + index * 6 + 30;
  const glowIntensity = counterDone
    ? interpolate(
        Math.sin((frame - (38 + index * 6)) * 0.15),
        [-1, 1],
        [0.3, 0.7],
      )
    : 0;

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translateY(${cardY}px) scale(${cardScale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "32px 40px",
        borderRadius: 20,
        background: themeCardBg(colorTheme, light ? 0.85 : 0.35),
        border: `1px solid ${light ? "rgba(0,0,0,0.06)" : `${colorTheme.textSecondary}15`}`,
        boxShadow: counterDone && !light
          ? `0 0 30px ${colorTheme.primary}${Math.round(glowIntensity * 60).toString(16).padStart(2, "0")}`
          : themeShadow(colorTheme, "md"),
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 68,
          fontWeight: 800,
          color: colorTheme.primary,
          letterSpacing: -2,
          lineHeight: 1,
          textShadow: counterDone && !light ? `0 0 20px ${colorTheme.primary}40` : "none",
        }}
      >
        {displayValue.toLocaleString()}
        <span
          style={{
            fontSize: 44,
            color: colorTheme.accent,
            display: "inline-block",
            transform: `scale(${suffixScale})`,
          }}
        >
          {suffix}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 16,
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

export const ResultsScene: React.FC<Props> = ({
  headline,
  stats,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title slam (if headline provided)
  const titleProgress = headline
    ? spring({ frame, fps, config: SLAM_SPRING })
    : 0;
  const titleScale = interpolate(titleProgress, [0, 1], [1.3, 1]);

  // Container entrance
  const containerProgress = spring({ frame, fps, config: FAST_SPRING });

  // Fast cut
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity: containerProgress * fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        gap: 36,
      }}
    >
      {/* Optional headline */}
      {headline && (
        <div
          style={{
            opacity: titleProgress,
            transform: `scale(${titleScale})`,
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: colorTheme.text,
            letterSpacing: -1.5,
            textShadow: themeTextGlow(colorTheme),
          }}
        >
          {headline}
        </div>
      )}

      {/* Stat cards — max 3 for readability */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 32,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {stats.slice(0, 3).map((stat, index) => (
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
