// ============================================================================
// ARCHIVED: Animation Types - Removed from active codebase
// Date: 2026-02-11
// Reason: Don't constrain LLM with strict types - let it be fully creative
// ============================================================================

// This was removed to allow LLM full creative freedom in specifying animations.
// LLM can now output any animation properties it wants without type constraints.

export interface AnimationSpec {
  entrance?: "slide" | "scale" | "rotate" | "fade" | "zoom";
  direction?: "up" | "down" | "left" | "right";
  distance?: number; // pixels for slides
  scale?: [number, number]; // [start, end] e.g. [0.8, 1] or [1.5, 1]
  rotation?: [number, number]; // [start, end] degrees e.g. [-15, 0]
  delay?: number; // frames to wait before starting
  spring?: "slam" | "bounce" | "gentle" | "fast"; // spring preset
  opacity?: [number, number]; // [start, end] e.g. [0, 1]
}

// Future: If we need type hints, use Record<string, any> instead of strict interfaces
