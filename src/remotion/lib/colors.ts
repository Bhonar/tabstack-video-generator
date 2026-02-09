import type { ColorTheme } from "../types.js";

/** Default dark theme (matches Tabstack brand). */
export const DEFAULT_THEME: ColorTheme = {
  primary: "#FF97EA",
  secondary: "#1A1A1A",
  accent: "#A5D6FF",
  background: "#0A0A0A",
  text: "#FAFAFA",
  textSecondary: "#A1A1AA",
};

/** Preset themes the AI scene planner can reference. */
export const PRESET_THEMES: Record<string, ColorTheme> = {
  dark: DEFAULT_THEME,
  light: {
    primary: "#6366F1",
    secondary: "#E2E8F0",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#64748B",
  },
  ocean: {
    primary: "#06B6D4",
    secondary: "#0E7490",
    accent: "#22D3EE",
    background: "#0C1222",
    text: "#F0FDFA",
    textSecondary: "#94A3B8",
  },
  forest: {
    primary: "#22C55E",
    secondary: "#166534",
    accent: "#86EFAC",
    background: "#052E16",
    text: "#F0FDF4",
    textSecondary: "#86EFAC",
  },
};

/**
 * Returns a CSS linear-gradient string using the theme's background
 * with a subtle radial accent glow.
 */
export function themeGradient(theme: ColorTheme): string {
  return `radial-gradient(ellipse at 50% 0%, ${theme.primary}15 0%, ${theme.background} 60%)`;
}
