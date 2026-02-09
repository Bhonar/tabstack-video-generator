import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { FeaturesSceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, FAST_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = FeaturesSceneData & { colorTheme: ColorTheme };

export const FeaturesScene: React.FC<Props> = ({
  sectionTitle,
  features,
  colorTheme,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title entrance
  const titleProgress = spring({ frame, fps, config: SPRING_CONFIG });
  const titleY = interpolate(titleProgress, [0, 1], [40, 0]);

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Grid layout: 2 columns if 4+ features, else single column
  const columns = features.length >= 4 ? 2 : 1;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        background: themeGradient(colorTheme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 100,
        gap: 48,
      }}
    >
      {/* Section title */}
      <div
        style={{
          opacity: titleProgress,
          transform: `translateY(${titleY}px)`,
          fontFamily: FONTS.heading,
          fontSize: 52,
          fontWeight: 700,
          color: colorTheme.text,
          letterSpacing: -1,
        }}
      >
        {sectionTitle}
      </div>

      {/* Features grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 32,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {features.slice(0, 6).map((feature, index) => {
          const itemProgress = spring({
            frame: Math.max(0, frame - 20 - index * 8),
            fps,
            config: FAST_SPRING,
          });
          const itemY = interpolate(itemProgress, [0, 1], [30, 0]);

          return (
            <div
              key={index}
              style={{
                opacity: itemProgress,
                transform: `translateY(${itemY}px)`,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 20,
                padding: 28,
                borderRadius: 16,
                background: `${colorTheme.secondary}60`,
                border: `1px solid ${colorTheme.textSecondary}15`,
              }}
            >
              {/* Icon / emoji */}
              {feature.icon && (
                <div
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    background: `${colorTheme.primary}15`,
                  }}
                >
                  {feature.icon}
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 24,
                    fontWeight: 600,
                    color: colorTheme.text,
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 18,
                    fontWeight: 400,
                    color: colorTheme.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
