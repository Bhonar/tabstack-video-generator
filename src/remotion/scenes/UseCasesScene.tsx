import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { UseCasesSceneData, ColorTheme } from "../types.js";
import { FAST_SPRING, BOUNCE_SPRING, SLAM_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import {
  themeGradient,
  isLightTheme,
  themeShadow,
  themeCardBg,
  themeTextGlow,
} from "../lib/colors.js";

type Props = UseCasesSceneData & { colorTheme: ColorTheme };

export const UseCasesScene: React.FC<Props> = ({
  headline,
  cases,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const light = isLightTheme(colorTheme);

  // Headline — slam
  const headlineProgress = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: SLAM_SPRING,
  });
  const headlineScale = interpolate(headlineProgress, [0, 1], [1.3, 1]);

  // Case cards — max 3 for readability, bounce in
  const caseElements = cases.slice(0, 3).map((useCase, i) => {
    const cardProgress = spring({
      frame: Math.max(0, frame - 10 - i * 7),
      fps,
      config: BOUNCE_SPRING,
    });
    const cardY = interpolate(cardProgress, [0, 1], [60, 0]);
    const cardScale = interpolate(cardProgress, [0, 1], [0.7, 1]);

    // Icon bounce
    const iconProgress = spring({
      frame: Math.max(0, frame - 14 - i * 7),
      fps,
      config: BOUNCE_SPRING,
    });
    const iconScale = interpolate(iconProgress, [0, 1], [0.2, 1]);
    const iconRotate = interpolate(iconProgress, [0, 1], [-15, 0]);

    // Subtle glow pulse per card
    const glowPhase = (Math.sin((frame - i * 5) * 0.12) + 1) / 2;

    return (
      <div
        key={i}
        style={{
          opacity: cardProgress,
          transform: `translateY(${cardY}px) scale(${cardScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "24px 22px",
          borderRadius: 18,
          background: themeCardBg(colorTheme, light ? 0.85 : 0.3),
          border: `1px solid ${light ? "rgba(0,0,0,0.06)" : `${colorTheme.primary}15`}`,
          boxShadow: light
            ? themeShadow(colorTheme, "md")
            : `0 0 ${20 + glowPhase * 15}px ${colorTheme.primary}${Math.round(glowPhase * 20).toString(16).padStart(2, "0")}, ${themeShadow(colorTheme, "sm")}`,
          width: 260,
          textAlign: "center",
        }}
      >
        {useCase.icon && (
          <span
            style={{
              fontSize: 36,
              transform: `scale(${iconScale}) rotate(${iconRotate}deg)`,
              display: "inline-block",
            }}
          >
            {useCase.icon}
          </span>
        )}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 20,
            fontWeight: 700,
            color: colorTheme.text,
            lineHeight: 1.2,
          }}
        >
          {useCase.title}
        </div>
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
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        padding: 80,
      }}
    >
      {/* Headline */}
      <div
        style={{
          opacity: headlineProgress,
          transform: `scale(${headlineScale})`,
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

      {/* Cases grid — title + icon only, no description */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 24,
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        {caseElements}
      </div>
    </AbsoluteFill>
  );
};
