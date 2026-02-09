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

/** Standard durations in frames (at 30fps) */
export const DURATIONS = {
  intro: 120, // 4 seconds
  heroScreenshot: 150, // 5 seconds
  features: 180, // 6 seconds
  stats: 120, // 4 seconds
  pricing: 150, // 5 seconds
  cta: 90, // 3 seconds
  transition: 15, // 0.5 seconds
} as const;
