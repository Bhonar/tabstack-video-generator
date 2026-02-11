import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { SolutionSceneData, ColorTheme } from "../types.js";
import { SLAM_SPRING, FAST_SPRING, BOUNCE_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import {
  themeGradient,
  isLightTheme,
  themeShadow,
  themeCardBg,
  themeTextGlow,
} from "../lib/colors.js";

type Props = SolutionSceneData & { colorTheme: ColorTheme };

export const SolutionScene: React.FC<Props> = ({
  headline,
  features,
  screenshotUrl,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const light = isLightTheme(colorTheme);

  // Bright shift — flash of primary color at entrance
  const brightFlash = interpolate(frame, [0, 5, 12], [0.5, 0.3, 0], {
    extrapolateRight: "clamp",
  });

  // Headline — slam
  const headlineProgress = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: SLAM_SPRING,
  });
  const headlineScale = interpolate(headlineProgress, [0, 1], [1.3, 1]);

  const hasScreenshot = screenshotUrl && screenshotUrl.startsWith("http");
  // Max 3 features for readability; with screenshot, max 2
  const maxFeatures = hasScreenshot ? 2 : 3;

  // Feature cards — rapid-fire stagger
  const featureElements = features.slice(0, maxFeatures).map((feature, i) => {
    const cardProgress = spring({
      frame: Math.max(0, frame - 12 - i * 5),
      fps,
      config: FAST_SPRING,
    });
    const direction = i % 2 === 0 ? -1 : 1;
    const cardX = interpolate(cardProgress, [0, 1], [50 * direction, 0]);
    const cardScale = interpolate(cardProgress, [0, 1], [0.85, 1]);

    // Icon bounce separately
    const iconProgress = spring({
      frame: Math.max(0, frame - 15 - i * 5),
      fps,
      config: BOUNCE_SPRING,
    });
    const iconScale = interpolate(iconProgress, [0, 1], [0.3, 1]);

    return (
      <div
        key={i}
        style={{
          opacity: cardProgress,
          transform: `translateX(${cardX}px) scale(${cardScale})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 22px",
          borderRadius: 16,
          background: themeCardBg(colorTheme, light ? 0.8 : 0.35),
          border: `1px solid ${light ? "rgba(0,0,0,0.06)" : `${colorTheme.primary}20`}`,
          boxShadow: themeShadow(colorTheme, "md"),
        }}
      >
        {feature.icon && (
          <span
            style={{
              fontSize: 28,
              transform: `scale(${iconScale})`,
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            {feature.icon}
          </span>
        )}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 21,
            fontWeight: 600,
            color: colorTheme.text,
            lineHeight: 1.2,
          }}
        >
          {feature.title}
        </div>
      </div>
    );
  });

  // Screenshot entrance — rise with perspective
  const screenshotProgress = hasScreenshot
    ? spring({
        frame: Math.max(0, frame - 10),
        fps,
        config: FAST_SPRING,
      })
    : 0;
  const screenshotY = interpolate(screenshotProgress, [0, 1], [40, 0]);
  const screenshotRotateX = interpolate(screenshotProgress, [0, 1], [8, 0]);
  const screenshotZoom = interpolate(frame, [0, durationInFrames], [1, 1.04], {
    extrapolateRight: "clamp",
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
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        gap: 28,
      }}
    >
      {/* Bright flash overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colorTheme.primary,
          opacity: brightFlash * (light ? 0.15 : 0.3),
          pointerEvents: "none",
        }}
      />

      {/* Primary glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorTheme.primary}${light ? "10" : "20"} 0%, transparent 55%)`,
          pointerEvents: "none",
        }}
      />

      {/* Headline */}
      <div
        style={{
          opacity: headlineProgress,
          transform: `scale(${headlineScale})`,
          fontFamily: FONTS.heading,
          fontSize: 52,
          fontWeight: 800,
          color: colorTheme.text,
          letterSpacing: -2,
          textAlign: "center",
          lineHeight: 1.1,
          textShadow: themeTextGlow(colorTheme),
        }}
      >
        {headline}
      </div>

      {/* Content layout — features + optional screenshot */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 40,
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 1400,
          width: "100%",
        }}
      >
        {/* Features — title only, no description for readability */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: hasScreenshot ? "0 0 480px" : "0 0 700px",
          }}
        >
          {featureElements}
        </div>

        {/* Screenshot */}
        {hasScreenshot && (
          <div
            style={{
              opacity: screenshotProgress,
              transform: `translateY(${screenshotY}px) perspective(800px) rotateX(${screenshotRotateX}deg) scale(${screenshotZoom})`,
              flex: "0 0 550px",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: themeShadow(colorTheme, "lg"),
              border: `1px solid ${light ? "rgba(0,0,0,0.08)" : `${colorTheme.textSecondary}20`}`,
            }}
          >
            <Img
              src={screenshotUrl!}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
