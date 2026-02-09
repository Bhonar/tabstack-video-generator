import {
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";

// ── Spring configs ──

export const SPRING_CONFIG = {
  damping: 12,
  stiffness: 170,
  mass: 0.8,
};

export const FAST_SPRING = {
  damping: 15,
  stiffness: 200,
  mass: 0.6,
};

export const GENTLE_SPRING = {
  damping: 18,
  stiffness: 120,
  mass: 1,
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
  durationFrames = 45,
) {
  const frame = useCurrentFrame();
  const progress = Math.min(
    Math.max((frame - startFrame) / durationFrames, 0),
    1,
  );
  // Ease-out cubic
  const eased = 1 - Math.pow(1 - progress, 3);
  return Math.round(targetValue * eased);
}

/** Fade-out helper for the last N frames of a scene. */
export function useFadeOut(fadeFrames = 15): number {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeStart = durationInFrames - fadeFrames;
  return interpolate(frame, [fadeStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}
