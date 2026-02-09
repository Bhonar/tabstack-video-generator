import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { IntroSceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, GENTLE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = IntroSceneData & { colorTheme: ColorTheme };

export const IntroScene: React.FC<Props> = ({
  brandName,
  tagline,
  logoUrl,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Brand name spring slide-up
  const brandProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: SPRING_CONFIG,
  });
  const brandY = interpolate(brandProgress, [0, 1], [60, 0]);

  // Tagline fade in
  const taglineProgress = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: GENTLE_SPRING,
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [30, 0]);

  // Logo scale in
  const logoProgress = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { ...SPRING_CONFIG, stiffness: 140 },
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Decorative glow pulse
  const glowScale = interpolate(
    frame,
    [0, durationInFrames],
    [1, 1.15],
  );

  return (
    <AbsoluteFill
      style={{
        opacity: bgOpacity * fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {/* Decorative glow circle */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorTheme.primary}20 0%, transparent 70%)`,
          transform: `scale(${glowScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            opacity: logoProgress,
            transform: `scale(${interpolate(logoProgress, [0, 1], [0.5, 1])})`,
            marginBottom: 16,
          }}
        >
          <Img
            src={logoUrl}
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Brand name */}
      <div
        style={{
          opacity: brandProgress,
          transform: `translateY(${brandY}px)`,
          fontFamily: FONTS.heading,
          fontSize: 80,
          fontWeight: 800,
          color: colorTheme.text,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {brandName}
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineProgress,
          transform: `translateY(${taglineY}px)`,
          fontFamily: FONTS.body,
          fontSize: 32,
          fontWeight: 400,
          color: colorTheme.textSecondary,
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        {tagline}
      </div>

      {/* Accent line */}
      <div
        style={{
          width: interpolate(taglineProgress, [0, 1], [0, 120]),
          height: 3,
          background: colorTheme.primary,
          borderRadius: 2,
          marginTop: 8,
        }}
      />
    </AbsoluteFill>
  );
};
