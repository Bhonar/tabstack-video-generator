import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { HookSceneData, ColorTheme } from "../types.js";
import { SLAM_SPRING, SPRING_CONFIG, BOUNCE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient, isLightTheme, themeShadow, themeTextGlow } from "../lib/colors.js";

type Props = HookSceneData & { colorTheme: ColorTheme };

export const HookScene: React.FC<Props> = ({
  brandName,
  tagline,
  logoUrl,
  claim,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const light = isLightTheme(colorTheme);

  // Flash-in: hot flash at frame 0, rapidly fading
  const flashOpacity = interpolate(frame, [0, 3, 8], [1, 0.6, 0], {
    extrapolateRight: "clamp",
  });

  // Background kinetic zoom
  const bgScale = interpolate(frame, [0, durationInFrames], [1.15, 1], {
    extrapolateRight: "clamp",
  });

  // Logo — elastic bounce with rotation
  const logoProgress = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: BOUNCE_SPRING,
  });
  const logoScale = interpolate(logoProgress, [0, 1], [0.2, 1]);
  const logoRotation = interpolate(logoProgress, [0, 1], [-12, 0]);

  // Brand name — dramatic slam from oversized
  const brandProgress = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: SLAM_SPRING,
  });
  const brandScale = interpolate(brandProgress, [0, 1], [1.6, 1]);
  const brandY = interpolate(brandProgress, [0, 1], [100, 0]);

  // Tagline — fast slide up (truncated for readability)
  const taglineProgress = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: SPRING_CONFIG,
  });
  const taglineY = interpolate(taglineProgress, [0, 1], [50, 0]);

  // Claim text — punch in if present
  const claimProgress = claim
    ? spring({
        frame: Math.max(0, frame - 20),
        fps,
        config: BOUNCE_SPRING,
      })
    : 0;
  const claimScale = interpolate(claimProgress, [0, 1], [0.5, 1]);

  // Accent line — expand from center
  const lineProgress = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: SPRING_CONFIG,
  });

  // Pulsing radial glow
  const glowPulse = (Math.sin(frame * 0.15) + 1) / 2;
  const glowScale = interpolate(glowPulse, [0, 1], [0.85, 1.3]);

  // Fast cut out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 5, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Theme-aware flash color
  const flashBg = light
    ? `linear-gradient(135deg, ${colorTheme.primary}, rgba(255,255,255,0.8))`
    : `linear-gradient(135deg, ${colorTheme.primary}, white)`;

  // Theme-aware glow color
  const glowAlpha = light ? "10" : "30";

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transform: `scale(${bgScale})`,
      }}
    >
      {/* Flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: flashBg,
          opacity: flashOpacity * (light ? 0.25 : 0.4),
          pointerEvents: "none",
        }}
      />

      {/* Pulsing glow orb */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorTheme.primary}${glowAlpha} 0%, transparent 60%)`,
          transform: `scale(${glowScale})`,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      {logoUrl && logoUrl.startsWith("http") && (
        <div
          style={{
            opacity: logoProgress,
            transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
            marginBottom: 8,
          }}
        >
          <Img
            src={logoUrl}
            style={{ width: 80, height: 80, objectFit: "contain" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Brand name — dramatic slam */}
      <div
        style={{
          opacity: brandProgress,
          transform: `scale(${brandScale}) translateY(${brandY}px)`,
          fontFamily: FONTS.heading,
          fontSize: 96,
          fontWeight: 800,
          color: colorTheme.text,
          letterSpacing: -4,
          textAlign: "center",
          lineHeight: 1,
          textShadow: themeTextGlow(colorTheme, 1.5),
        }}
      >
        {brandName}
      </div>

      {/* Accent line */}
      <div
        style={{
          width: interpolate(lineProgress, [0, 1], [0, 180]),
          height: 4,
          background: `linear-gradient(90deg, transparent, ${colorTheme.primary}, ${colorTheme.accent || colorTheme.primary}, transparent)`,
          borderRadius: 2,
        }}
      />

      {/* Tagline — short text only */}
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
          lineHeight: 1.3,
        }}
      >
        {tagline}
      </div>

      {/* Claim badge — uses brand primary */}
      {claim && (
        <div
          style={{
            opacity: claimProgress,
            transform: `scale(${claimScale})`,
            fontFamily: FONTS.body,
            fontSize: 18,
            fontWeight: 600,
            color: light ? "#FFFFFF" : colorTheme.background,
            background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.accent || colorTheme.primary})`,
            padding: "8px 24px",
            borderRadius: 24,
            marginTop: 4,
            boxShadow: `0 4px 20px ${colorTheme.primary}40`,
          }}
        >
          {claim}
        </div>
      )}
    </AbsoluteFill>
  );
};
