import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { PricingSceneData, ColorTheme } from "../types.js";
import { SPRING_CONFIG, FAST_SPRING } from "../lib/animations.js";
import { FONTS } from "../lib/fonts.js";
import { themeGradient } from "../lib/colors.js";

type Props = PricingSceneData & { colorTheme: ColorTheme };

const PricingCard: React.FC<{
  tier: PricingSceneData["tiers"][number];
  index: number;
  colorTheme: ColorTheme;
}> = ({ tier, index, colorTheme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardProgress = spring({
    frame: Math.max(0, frame - 20 - index * 10),
    fps,
    config: FAST_SPRING,
  });
  const cardY = interpolate(cardProgress, [0, 1], [50, 0]);
  const cardScale = interpolate(cardProgress, [0, 1], [0.95, 1]);

  // Glow pulse for highlighted card
  const glowIntensity = tier.highlighted
    ? interpolate(
        Math.sin(frame * 0.06),
        [-1, 1],
        [0.4, 0.8],
      )
    : 0;

  return (
    <div
      style={{
        opacity: cardProgress,
        transform: `translateY(${cardY}px) scale(${tier.highlighted ? cardScale * 1.02 : cardScale})`,
        display: "flex",
        flexDirection: "column",
        padding: 36,
        borderRadius: 20,
        background: tier.highlighted
          ? `linear-gradient(135deg, ${colorTheme.secondary}, ${colorTheme.primary}15)`
          : `${colorTheme.secondary}60`,
        border: tier.highlighted
          ? `2px solid ${colorTheme.primary}80`
          : `1px solid ${colorTheme.textSecondary}15`,
        boxShadow: tier.highlighted
          ? `0 0 40px ${colorTheme.primary}${Math.round(glowIntensity * 255).toString(16).padStart(2, "0")}`
          : "none",
        width: 340,
        gap: 16,
      }}
    >
      {/* Badge */}
      {tier.highlighted && (
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: FONTS.body,
            fontSize: 13,
            fontWeight: 600,
            color: colorTheme.background,
            background: colorTheme.primary,
            padding: "4px 14px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Popular
        </div>
      )}

      {/* Tier name */}
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 22,
          fontWeight: 600,
          color: colorTheme.textSecondary,
        }}
      >
        {tier.name}
      </div>

      {/* Price */}
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 44,
          fontWeight: 800,
          color: colorTheme.text,
          letterSpacing: -1,
          lineHeight: 1.1,
        }}
      >
        {tier.price}
      </div>

      {/* Features list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {tier.features.slice(0, 4).map((feature, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: FONTS.body,
              fontSize: 16,
              color: colorTheme.textSecondary,
            }}
          >
            <span style={{ color: colorTheme.primary, fontSize: 18 }}>&#10003;</span>
            {feature}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PricingScene: React.FC<Props> = ({ tiers, colorTheme }) => {
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
        gap: 48,
      }}
    >
      {/* Title */}
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
        Pricing
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 28,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {tiers.slice(0, 3).map((tier, index) => (
          <PricingCard
            key={index}
            tier={tier}
            index={index}
            colorTheme={colorTheme}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
