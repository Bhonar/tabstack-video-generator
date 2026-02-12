import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { ProblemSceneData, ColorTheme } from "../types.js";
import { SLAM_SPRING, FAST_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import {
  isLightTheme,
  themeShadow,
  themeWarningColor,
  themeWarningGlow,
  themeDarkBg,
  themeMoodOverlay,
  themeCardBg,
} from "../lib/colors.js";

type Props = ProblemSceneData & { colorTheme: ColorTheme };

export const ProblemScene: React.FC<Props> = ({
  headline,
  painPoints,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const light = isLightTheme(colorTheme);
  const warningColor = themeWarningColor(colorTheme);

  // Mood shift — darkens slightly over time
  const moodShift = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Headline — slam in with shake effect
  const headlineProgress = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: SLAM_SPRING,
  });
  const headlineScale = interpolate(headlineProgress, [0, 1], [1.4, 1]);
  const shakeX =
    frame >= 4 && frame < 12
      ? Math.sin(frame * 2.5) * interpolate(frame, [4, 12], [6, 0], { extrapolateRight: "clamp" })
      : 0;

  // Pain points — show max 3 for readability, short text
  const pointElements = painPoints.slice(0, 3).map((point, i) => {
    const pointProgress = spring({
      frame: Math.max(0, frame - 14 - i * 8),
      fps,
      config: FAST_SPRING,
    });
    const pointX = interpolate(pointProgress, [0, 1], [-60, 0]);
    const pointScale = interpolate(pointProgress, [0, 1], [0.9, 1]);

    // Warning flash on each point entrance
    const flashProgress =
      frame >= 14 + i * 8 && frame < 18 + i * 8
        ? interpolate(frame, [14 + i * 8, 18 + i * 8], [0.4, 0], {
            extrapolateRight: "clamp",
          })
        : 0;

    return (
      <div
        key={i}
        style={{
          opacity: pointProgress,
          transform: `translateX(${pointX}px) scale(${pointScale})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "14px 28px",
          borderRadius: 14,
          background: themeCardBg(colorTheme, light ? 0.7 : 0.3),
          border: `1px solid ${themeWarningGlow(colorTheme, 0.15 + flashProgress)}`,
          boxShadow: flashProgress > 0
            ? `0 0 30px ${themeWarningGlow(colorTheme, flashProgress)}`
            : themeShadow(colorTheme, "sm"),
        }}
      >
        <span
          style={{
            fontSize: 22,
            color: warningColor,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          &#x2717;
        </span>
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 500,
            color: colorTheme.text,
            lineHeight: 1.3,
          }}
        >
          {point}
        </span>
      </div>
    );
  });

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
        opacity: fadeOut,
        background: themeDarkBg(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 100,
      }}
    >
      {/* Mood overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: themeMoodOverlay(colorTheme, moodShift),
          pointerEvents: "none",
        }}
      />

      {/* Warning glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${themeWarningGlow(colorTheme, light ? 0.04 : 0.08)} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Headline */}
      <div
        style={{
          opacity: headlineProgress,
          transform: `scale(${headlineScale}) translateX(${shakeX}px)`,
          fontFamily: FONTS.heading,
          fontSize: 56,
          fontWeight: 800,
          color: colorTheme.text,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
          maxWidth: 900,
          textShadow: light ? "none" : `0 0 40px ${themeWarningGlow(colorTheme, 0.2)}`,
        }}
      >
        {headline}
      </div>

      {/* Pain points list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 700,
          width: "100%",
        }}
      >
        {pointElements}
      </div>
    </AbsoluteFill>
  );
};
