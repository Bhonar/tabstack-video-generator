import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { CTASceneData, ColorTheme } from "../types.js";
import { SLAM_SPRING, SPRING_CONFIG, BOUNCE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient, isLightTheme, themeTextGlow } from "../lib/colors.js";

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
  const light = isLightTheme(colorTheme);

  // Background zoom
  const bgScale = interpolate(frame, [0, durationInFrames], [1.05, 1], {
    extrapolateRight: "clamp",
  });

  // Headline — dramatic slam from large
  const headlineProgress = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: SLAM_SPRING,
  });
  const headlineScale = interpolate(headlineProgress, [0, 1], [1.5, 1]);

  // Subheadline — fast
  const subProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: SPRING_CONFIG,
  });

  // Button — bounce in (uses brand primary color)
  const buttonProgress = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: BOUNCE_SPRING,
  });
  const buttonScale = interpolate(buttonProgress, [0, 1], [0.4, 1]);
  const buttonY = interpolate(buttonProgress, [0, 1], [30, 0]);

  // Button glow — fast pulse
  const glowPulse = (Math.sin(frame * 0.2) + 1) / 2;
  const glowIntensity = interpolate(glowPulse, [0, 1], [0.3, 1]);

  // Pulsing glow ring
  const ringScale = interpolate(frame, [0, durationInFrames], [0.8, 1.3], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(frame, [0, durationInFrames], [0.4, 0], {
    extrapolateRight: "clamp",
  });

  // URL fade
  const urlProgress = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: SPRING_CONFIG,
  });

  // Button text color — ensure contrast against brand primary
  const buttonTextColor = light ? "#FFFFFF" : colorTheme.background;

  return (
    <AbsoluteFill
      style={{
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 100,
        transform: `scale(${bgScale})`,
      }}
    >
      {/* Expanding glow ring */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `3px solid ${colorTheme.primary}`,
          opacity: ringOpacity * (light ? 0.3 : 1),
          transform: `scale(${ringScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Pulsing radial glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorTheme.primary}${light ? "10" : "20"} 0%, transparent 55%)`,
          transform: `scale(${0.9 + glowPulse * 0.2})`,
          pointerEvents: "none",
        }}
      />

      {/* Headline — short, punchy */}
      <div
        style={{
          opacity: headlineProgress,
          transform: `scale(${headlineScale})`,
          fontFamily: FONTS.heading,
          fontSize: 68,
          fontWeight: 800,
          color: colorTheme.text,
          textAlign: "center",
          letterSpacing: -2.5,
          lineHeight: 1.05,
          maxWidth: 900,
          textShadow: themeTextGlow(colorTheme, 1.5),
        }}
      >
        {headline}
      </div>

      {/* Subheadline */}
      {subheadline && (
        <div
          style={{
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
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

      {/* CTA Button — brand primary colors */}
      <div
        style={{
          opacity: buttonProgress,
          transform: `translateY(${buttonY}px) scale(${buttonScale})`,
          marginTop: 8,
          position: "relative",
        }}
      >
        {/* Glow behind button — only on dark themes */}
        {!light && (
          <div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: 22,
              background: colorTheme.primary,
              opacity: glowIntensity * 0.35,
              filter: "blur(24px)",
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            fontFamily: FONTS.body,
            fontSize: 24,
            fontWeight: 700,
            color: buttonTextColor,
            background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.accent || colorTheme.primary})`,
            padding: "18px 56px",
            borderRadius: 16,
            letterSpacing: 0.5,
            boxShadow: light
              ? `0 4px 16px rgba(0,0,0,0.12)`
              : `0 4px 20px ${colorTheme.primary}40`,
          }}
        >
          {buttonText}
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlProgress * 0.5,
          fontFamily: FONTS.mono,
          fontSize: 15,
          color: colorTheme.textSecondary,
          marginTop: 4,
        }}
      >
        {url}
      </div>
    </AbsoluteFill>
  );
};
