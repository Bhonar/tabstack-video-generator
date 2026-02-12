import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring } from "remotion";

export default function GeneratedVideo() {
  const frame = useCurrentFrame();

  // Brand colors and fonts from Playwright extraction
  const colors = {
    primary: "#0000ee",
    secondary: "#10100f",
    tertiary: "#541bff",
    background: "#ffffff",
  };

  const fonts = {
    heading: "Mozilla Headline Variable, system-ui, sans-serif",
    body: "Geist, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill style={{ background: colors.background }}>

      {/* Scene 1: Hero Intro (0-90 frames, 3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.primary}10 100%)`,
          }}
        >
          {/* Animated gradient background orb */}
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${colors.tertiary}40, transparent 70%)`,
              opacity: interpolate(frame, [0, 30], [0, 0.6], { extrapolateRight: "clamp" }),
              transform: `scale(${interpolate(frame, [0, 60], [0.5, 1.2], { extrapolateRight: "clamp" })})`,
              filter: "blur(60px)",
            }}
          />

          {/* Product title with gradient text */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              fontFamily: fonts.heading,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.tertiary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transform: `scale(${spring({ frame, fps: 30, config: { damping: 200, stiffness: 100 } })})`,
              textShadow: `0 0 80px ${colors.primary}60`,
            }}
          >
            Tabstack
          </div>

          {/* Tagline with glassmorphism container */}
          <div
            style={{
              marginTop: 40,
              padding: "20px 50px",
              background: `${colors.primary}10`,
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              border: `2px solid ${colors.primary}30`,
              opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [30, 50], [30, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontFamily: fonts.body,
                color: colors.secondary,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Web Browsing for AI Systems
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Problem/Hook (90-180 frames, 3 seconds) */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 10%",
            background: `linear-gradient(180deg, ${colors.background}, ${colors.tertiary}05)`,
          }}
        >
          {/* Main value prop with glow effect */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              fontFamily: fonts.heading,
              color: colors.secondary,
              textAlign: "center",
              lineHeight: 1.2,
              opacity: interpolate(frame - 90, [0, 25], [0, 1], { extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame - 90, [0, 25], [-40, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            Enable AI systems to browse, search, and interact with the web
          </div>

          {/* Emphasis word with animated gradient */}
          <div
            style={{
              marginTop: 50,
              fontSize: 56,
              fontWeight: 900,
              fontFamily: fonts.heading,
              background: `linear-gradient(${interpolate(frame - 90, [30, 90], [0, 360])}deg, ${colors.primary}, ${colors.tertiary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: interpolate(frame - 90, [35, 55], [0, 1], { extrapolateRight: "clamp" }),
              transform: `scale(${interpolate(frame - 90, [35, 55], [0.8, 1], { extrapolateRight: "clamp" })})`,
            }}
          >
            Autonomously
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Features Grid (180-300 frames, 4 seconds) */}
      <Sequence from={180} durationInFrames={120}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 8%",
            background: colors.background,
          }}
        >
          {/* Section header */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              fontFamily: fonts.heading,
              color: colors.primary,
              marginBottom: 80,
              opacity: interpolate(frame - 180, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
              textShadow: `0 0 40px ${colors.primary}40`,
            }}
          >
            What You Can Do
          </div>

          {/* Feature cards grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            {[
              { title: "Web Tasks, Handled", emoji: "⚡", desc: "Automate browsing workflows" },
              { title: "Get Answers", emoji: "💡", desc: "Extract data from any page" },
              { title: "Turn the Web Into Data", emoji: "📊", desc: "Structured extraction" },
              { title: "Transform Anything", emoji: "🔄", desc: "Convert and process content" },
            ].map((feature, i) => {
              const delay = 25 + i * 18;
              const localFrame = frame - 180 - delay;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 30,
                    padding: "30px 50px",
                    background: `${i % 2 === 0 ? colors.primary : colors.tertiary}08`,
                    backdropFilter: "blur(10px)",
                    borderRadius: 24,
                    border: `2px solid ${i % 2 === 0 ? colors.primary : colors.tertiary}20`,
                    boxShadow: `0 10px 40px ${i % 2 === 0 ? colors.primary : colors.tertiary}15`,
                    opacity: interpolate(frame - 180, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp" }),
                    transform: `translateX(${interpolate(frame - 180, [delay, delay + 20], [i % 2 === 0 ? -100 : 100, 0], { extrapolateRight: "clamp" })}px) scale(${spring({ frame: Math.max(0, localFrame), fps: 30, config: { damping: 200 }, durationInFrames: 20 })})`,
                  }}
                >
                  {/* Emoji with pulse animation */}
                  <span
                    style={{
                      fontSize: 60,
                      transform: `scale(${1 + Math.sin(Math.max(0, frame - 180 - delay) * 0.15) * 0.1})`,
                    }}
                  >
                    {feature.emoji}
                  </span>

                  <div>
                    <div
                      style={{
                        fontSize: 36,
                        fontFamily: fonts.heading,
                        color: colors.secondary,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      {feature.title}
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontFamily: fonts.body,
                        color: colors.secondary,
                        opacity: 0.7,
                      }}
                    >
                      {feature.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA with Glow (300-360 frames, 2 seconds) */}
      <Sequence from={300} durationInFrames={60}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            background: `radial-gradient(circle at center, ${colors.primary}05, ${colors.background})`,
          }}
        >
          {/* Main CTA text */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: fonts.heading,
              color: colors.primary,
              opacity: interpolate(frame - 300, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
              transform: `scale(${interpolate(frame - 300, [0, 20], [0.9, 1], { extrapolateRight: "clamp" })})`,
              textShadow: `0 0 60px ${colors.primary}60`,
            }}
          >
            Start Building
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 48,
              fontFamily: fonts.body,
              color: colors.secondary,
              marginTop: 40,
              opacity: interpolate(frame - 300, [15, 30], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            tabstack.ai
          </div>

          {/* CTA Button with animated glow */}
          <div
            style={{
              marginTop: 60,
              padding: "25px 80px",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary})`,
              color: "#ffffff",
              fontSize: 42,
              fontWeight: 700,
              fontFamily: fonts.body,
              borderRadius: 60,
              opacity: interpolate(frame - 300, [30, 45], [0, 1], { extrapolateRight: "clamp" }),
              transform: `scale(${spring({ frame: Math.max(0, frame - 330), fps: 30, config: { damping: 200, stiffness: 100 } })}) scale(${1 + Math.sin(Math.max(0, frame - 345) * 0.2) * 0.03})`,
              boxShadow: `0 20px 60px ${colors.primary}60, 0 0 100px ${colors.tertiary}40`,
            }}
          >
            Get Started →
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
