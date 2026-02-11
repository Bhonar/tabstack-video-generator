export const CANVAS = {
  width: 1920,
  height: 1080,
  padding: 120,
} as const;

export const SAFE_AREA = {
  left: CANVAS.padding,
  right: CANVAS.width - CANVAS.padding,
  top: CANVAS.padding,
  bottom: CANVAS.height - CANVAS.padding,
  width: CANVAS.width - CANVAS.padding * 2,
  height: CANVAS.height - CANVAS.padding * 2,
} as const;

/** Standard durations in frames (at 30fps) — narrative structure */
export const DURATIONS = {
  hook: 65, // ~2.2 seconds
  problem: 65, // ~2.2 seconds
  solution: 80, // ~2.7 seconds
  useCases: 65, // ~2.2 seconds
  results: 65, // ~2.2 seconds
  cta: 55, // ~1.8 seconds
} as const;

/** Calculate beat-synced transition duration from BPM */
export function getTransitionDuration(bpm: number, fps: number = 30): number {
  const framesPerBeat = (60 / bpm) * fps;
  return Math.max(8, Math.min(18, Math.round(framesPerBeat / 2)));
}
