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

// ── Theme-aware helpers ──

/**
 * Detect if a theme has a light background.
 * Uses relative luminance calculation from hex color.
 */
export function isLightTheme(theme: ColorTheme): boolean {
  return hexLuminance(theme.background) > 0.5;
}

/** Parse hex (#RRGGBB or #RGB) to relative luminance (0 = black, 1 = white). */
function hexLuminance(hex: string): number {
  const cleaned = hex.replace("#", "");
  const r = cleaned.length === 3
    ? parseInt(cleaned[0] + cleaned[0], 16) / 255
    : parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = cleaned.length === 3
    ? parseInt(cleaned[1] + cleaned[1], 16) / 255
    : parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = cleaned.length === 3
    ? parseInt(cleaned[2] + cleaned[2], 16) / 255
    : parseInt(cleaned.slice(4, 6), 16) / 255;
  // sRGB relative luminance
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Returns a CSS linear-gradient string using the theme's background
 * with a subtle radial accent glow.
 */
export function themeGradient(theme: ColorTheme): string {
  return `radial-gradient(ellipse at 50% 0%, ${theme.primary}15 0%, ${theme.background} 60%)`;
}

/** Theme-aware shadow — darker on light backgrounds, lighter/glowy on dark backgrounds. */
export function themeShadow(theme: ColorTheme, size: "sm" | "md" | "lg" = "md"): string {
  const light = isLightTheme(theme);
  const shadows: Record<typeof size, string> = light
    ? {
        sm: "0 1px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        lg: "0 8px 32px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)",
      }
    : {
        sm: `0 1px 6px rgba(0,0,0,0.3), 0 0 8px ${theme.primary}08`,
        md: `0 4px 20px rgba(0,0,0,0.4), 0 0 16px ${theme.primary}10`,
        lg: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.primary}15`,
      };
  return shadows[size];
}

/** Theme-aware card background — glass-like on dark, solid on light. */
export function themeCardBg(theme: ColorTheme, opacity?: number): string {
  const light = isLightTheme(theme);
  if (light) {
    const op = opacity ?? 0.85;
    return `rgba(255,255,255,${op})`;
  }
  // Dark: use secondary with transparency
  const op = Math.round((opacity ?? 0.35) * 255).toString(16).padStart(2, "0");
  return `${theme.secondary}${op}`;
}

/** Theme-aware border color — subtle grey on light, primary-tinted on dark. */
export function themeBorder(theme: ColorTheme, emphasisLevel: number = 1): string {
  const light = isLightTheme(theme);
  if (light) {
    const alpha = Math.round(0.08 * emphasisLevel * 255).toString(16).padStart(2, "0");
    return `rgba(0,0,0,0.${alpha.slice(0, 2)})`;
  }
  const alpha = Math.round(0.15 * emphasisLevel * 255).toString(16).padStart(2, "0");
  return `${theme.primary}${alpha}`;
}

/** Theme-aware text glow for headings — on dark backgrounds. */
export function themeTextGlow(theme: ColorTheme, intensity: number = 1): string {
  if (isLightTheme(theme)) return "none";
  const alpha = Math.round(0.3 * intensity * 255).toString(16).padStart(2, "0");
  return `0 0 40px ${theme.primary}${alpha}`;
}

/** Derive a warning/danger color from the theme — red on dark, darker red on light. */
export function themeWarningColor(theme: ColorTheme): string {
  return isLightTheme(theme) ? "#DC2626" : "#FF6B6B";
}

/** Derive a warning glow for problem scene flash effects. */
export function themeWarningGlow(theme: ColorTheme, opacity: number): string {
  const color = isLightTheme(theme) ? "220,38,38" : "255,80,80";
  return `rgba(${color},${opacity})`;
}

/** Darker version of background for problem scene mood. */
export function themeDarkBg(theme: ColorTheme): string {
  if (isLightTheme(theme)) {
    // Light theme: darken slightly with cool tint
    return `radial-gradient(ellipse at 50% 30%, ${theme.background} 0%, #E2E0E8 100%)`;
  }
  return `radial-gradient(ellipse at 50% 30%, ${theme.background} 0%, #000000 100%)`;
}

/** Mood overlay for problem scene — inverted: darkens light, lightens dark. */
export function themeMoodOverlay(theme: ColorTheme, intensity: number): string {
  if (isLightTheme(theme)) {
    return `linear-gradient(180deg, rgba(0,0,0,${intensity * 0.05}) 0%, rgba(0,0,0,${intensity * 0.1}) 100%)`;
  }
  return `linear-gradient(180deg, rgba(0,0,0,${intensity * 0.3}) 0%, rgba(0,0,0,${intensity * 0.5}) 100%)`;
}
