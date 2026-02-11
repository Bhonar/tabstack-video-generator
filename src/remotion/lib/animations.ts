import {
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";

// ── Spring configs ──

/** Standard entrance — snappy with slight overshoot */
export const SPRING_CONFIG = {
  damping: 10,
  stiffness: 200,
  mass: 0.6,
};

/** Fast snap — for staggered items, punchy reveals */
export const FAST_SPRING = {
  damping: 12,
  stiffness: 280,
  mass: 0.4,
};

/** Gentle float — for secondary text, subtle elements */
export const GENTLE_SPRING = {
  damping: 16,
  stiffness: 120,
  mass: 0.8,
};

/** Dramatic slam — for headlines, hero moments */
export const SLAM_SPRING = {
  damping: 8,
  stiffness: 300,
  mass: 0.5,
};

/** Elastic bounce — for icons, badges, buttons */
export const BOUNCE_SPRING = {
  damping: 6,
  stiffness: 180,
  mass: 0.7,
};

// ── Hooks ──

/** Returns a spring value 0→1 starting at the given frame. */
export function useEntrance(startFrame = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRING_CONFIG,
  });
}

/** Fade + slide-up entrance – returns a CSSProperties object. */
export function useFadeSlideUp(
  startFrame = 0,
  distance = 40,
): CSSProperties {
  const progress = useEntrance(startFrame);
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`,
  };
}

/** Scale-in entrance – returns a CSSProperties object. */
export function useScaleIn(startFrame = 0): CSSProperties {
  const progress = useEntrance(startFrame);
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
  };
}

/** Staggered entrance for list items. Returns CSSProperties for the item at `index`. */
export function useStaggeredEntrance(
  index: number,
  staggerFrames = 6,
): CSSProperties {
  return useFadeSlideUp(index * staggerFrames);
}

/** Animated counter that counts from 0 to `targetValue`. */
export function useAnimatedCounter(
  targetValue: number,
  startFrame = 0,
  durationFrames = 35,
) {
  const frame = useCurrentFrame();
  const progress = Math.min(
    Math.max((frame - startFrame) / durationFrames, 0),
    1,
  );
  // Ease-out quartic — faster start, dramatic snap to final value
  const eased = 1 - Math.pow(1 - progress, 4);
  return Math.round(targetValue * eased);
}

/** Fade-out helper for the last N frames of a scene — fast cut, not slow fade */
export function useFadeOut(fadeFrames = 8): number {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeStart = durationInFrames - fadeFrames;
  return interpolate(frame, [fadeStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Pulsing glow intensity — use for buttons, badges, highlights */
export function usePulse(frequency = 0.15, startFrame = 0): number {
  const frame = useCurrentFrame();
  const phase = Math.max(0, frame - startFrame);
  return (Math.sin(phase * frequency) + 1) / 2; // 0→1
}
