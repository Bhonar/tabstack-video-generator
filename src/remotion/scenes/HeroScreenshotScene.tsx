import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { HeroScreenshotSceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, GENTLE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = HeroScreenshotSceneData & { colorTheme: ColorTheme };

export const HeroScreenshotScene: React.FC<Props> = ({
  screenshotUrl,
  headline,
  subheadline,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Headline entrance
  const headlineProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  // Subheadline entrance
  const subProgress = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: GENTLE_SPRING,
  });

  // Screenshot entrance (scale + shadow)
  const screenshotProgress = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 14, stiffness: 100, mass: 1 },
  });
  const screenshotScale = interpolate(screenshotProgress, [0, 1], [0.92, 1]);
  const screenshotY = interpolate(screenshotProgress, [0, 1], [30, 0]);

  // Subtle parallax drift
  const parallaxY = interpolate(frame, [0, durationInFrames], [0, -15]);

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
        opacity: fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        gap: 32,
      }}
    >
      {/* Headline */}
      {headline && (
        <div
          style={{
            opacity: headlineProgress,
            transform: `translateY(${interpolate(headlineProgress, [0, 1], [30, 0])}px)`,
            fontFamily: FONTS.heading,
            fontSize: 48,
            fontWeight: 700,
            color: colorTheme.text,
            textAlign: "center",
            letterSpacing: -1,
            lineHeight: 1.2,
            maxWidth: 1000,
          }}
        >
          {headline}
        </div>
      )}

      {/* Subheadline */}
      {subheadline && (
        <div
          style={{
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 400,
            color: colorTheme.textSecondary,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {subheadline}
        </div>
      )}

      {/* Browser chrome frame */}
      <div
        style={{
          opacity: screenshotProgress,
          transform: `scale(${screenshotScale}) translateY(${screenshotY + parallaxY}px)`,
          width: "85%",
          maxWidth: 1400,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 25px 80px ${colorTheme.primary}30, 0 8px 32px rgba(0,0,0,0.5)`,
          border: `1px solid ${colorTheme.textSecondary}20`,
        }}
      >
        {/* Browser top bar */}
        <div
          style={{
            background: `${colorTheme.secondary}`,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBD2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          <div
            style={{
              marginLeft: 12,
              flex: 1,
              background: `${colorTheme.background}80`,
              borderRadius: 6,
              padding: "4px 12px",
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: colorTheme.textSecondary,
            }}
          />
        </div>

        {/* Screenshot */}
        <Img
          src={screenshotUrl}
          style={{
            width: "100%",
            display: "block",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
