import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { CTASceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, GENTLE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = CTASceneData & { colorTheme: ColorTheme };

export const CTAScene: React.FC<Props> = ({
  headline,
  subheadline,
  buttonText,
  url,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Headline scale-in
  const headlineProgress = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: SPRING_CONFIG,
  });
  const headlineScale = interpolate(headlineProgress, [0, 1], [0.9, 1]);

  // Subheadline fade
  const subProgress = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: GENTLE_SPRING,
  });

  // Button slide-up
  const buttonProgress = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: SPRING_CONFIG,
  });
  const buttonY = interpolate(buttonProgress, [0, 1], [30, 0]);

  // Button glow pulse (after entrance)
  const glowPhase = Math.max(0, frame - 50);
  const glowScale = interpolate(
    Math.sin(glowPhase * 0.08),
    [-1, 1],
    [0.6, 1],
  );

  // URL fade in
  const urlProgress = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: GENTLE_SPRING,
  });

  return (
    <AbsoluteFill
      style={{
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: 120,
      }}
    >
      {/* Decorative radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorTheme.primary}12 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Headline */}
      <div
        style={{
          opacity: headlineProgress,
          transform: `scale(${headlineScale})`,
          fontFamily: FONTS.heading,
          fontSize: 64,
          fontWeight: 800,
          color: colorTheme.text,
          textAlign: "center",
          letterSpacing: -2,
          lineHeight: 1.1,
          maxWidth: 900,
        }}
      >
        {headline}
      </div>

      {/* Subheadline */}
      {subheadline && (
        <div
          style={{
            opacity: subProgress,
            fontFamily: FONTS.body,
            fontSize: 26,
            fontWeight: 400,
            color: colorTheme.textSecondary,
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          {subheadline}
        </div>
      )}

      {/* CTA Button */}
      <div
        style={{
          opacity: buttonProgress,
          transform: `translateY(${buttonY}px)`,
          marginTop: 12,
          position: "relative",
        }}
      >
        {/* Glow behind button */}
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 20,
            background: colorTheme.primary,
            opacity: glowScale * 0.25,
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: FONTS.body,
            fontSize: 22,
            fontWeight: 600,
            color: colorTheme.background,
            background: colorTheme.primary,
            padding: "16px 48px",
            borderRadius: 14,
            letterSpacing: 0.5,
          }}
        >
          {buttonText}
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlProgress * 0.6,
          fontFamily: FONTS.mono,
          fontSize: 16,
          color: colorTheme.textSecondary,
          marginTop: 8,
        }}
      >
        {url}
      </div>
    </AbsoluteFill>
  );
};
