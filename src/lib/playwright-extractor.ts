import { chromium, Browser, Page } from "playwright";
import { logDetail } from "./progress.js";

interface ExtractedColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
}

interface ExtractedFonts {
  heading: string;
  body: string;
}

interface PlaywrightExtractionResult {
  colors: ExtractedColors;
  fonts: ExtractedFonts;
}

/**
 * Extract brand colors and fonts using Playwright browser automation.
 * This runs our own headless browser to:
 * 1. Navigate to the page
 * 2. Extract computed CSS colors from key elements
 * 3. Extract font families from headings and body text
 */
export async function extractColorsAndFontsViaPlaywright(
  url: string
): Promise<PlaywrightExtractionResult> {
  logDetail("Extracting colors and fonts via Playwright...");

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch headless browser
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    page = await browser.newPage();

    // Navigate to URL with timeout
    logDetail(`Loading ${url}...`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);

    // Extract colors and fonts via JavaScript in the browser
    const result = await page.evaluate(() => {
      // Helper to convert RGB to hex
      function rgbToHex(rgb: string): string {
        if (!rgb) return "";

        // Handle hex colors that are already in hex format
        if (rgb.startsWith("#")) return rgb;

        // Handle rgba/rgb
        const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (!match) return "";

        const hex = (x: string) => ("0" + parseInt(x).toString(16)).slice(-2);
        return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
      }

      // Helper to check if color is grayscale/neutral
      function isNeutralColor(hex: string): boolean {
        if (!hex || hex.length !== 7) return true;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        // Check if it's grayscale (all channels similar)
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        return maxDiff < 15; // Allow small variations
      }

      // Extract PRIMARY color - from CTA buttons, links, or prominent elements
      let primary = "";
      const ctaSelectors = [
        'button[class*="primary"]',
        'button[class*="cta"]',
        'a[class*="button"]',
        'a[class*="cta"]',
        'button',
        'a[href*="sign-up"]',
        'a[href*="get-started"]',
        'a[href*="try"]',
      ];

      for (const selector of ctaSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const bg = window.getComputedStyle(el).backgroundColor;
          const hex = rgbToHex(bg);
          if (hex && !isNeutralColor(hex)) {
            primary = hex;
            break;
          }
        }
      }

      // Fallback: check all links for color
      if (!primary) {
        const links = document.querySelectorAll("a");
        for (const link of Array.from(links)) {
          const color = window.getComputedStyle(link).color;
          const hex = rgbToHex(color);
          if (hex && !isNeutralColor(hex)) {
            primary = hex;
            break;
          }
        }
      }

      // Extract SECONDARY color - from secondary buttons or hover states
      let secondary = "";
      const secondarySelectors = [
        'button[class*="secondary"]',
        'button[class*="outline"]',
        'a[class*="secondary"]',
      ];

      for (const selector of secondarySelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const color = window.getComputedStyle(el).color;
          const hex = rgbToHex(color);
          if (hex && !isNeutralColor(hex) && hex !== primary) {
            secondary = hex;
            break;
          }
        }
      }

      // Fallback: use heading color
      if (!secondary) {
        const heading = document.querySelector("h1, h2");
        if (heading) {
          const color = window.getComputedStyle(heading).color;
          const hex = rgbToHex(color);
          if (hex && hex !== primary) {
            secondary = hex;
          }
        }
      }

      // Extract TERTIARY color - from badges, highlights, or accents
      let tertiary = "";
      const tertiarySelectors = [
        '[class*="badge"]',
        '[class*="pill"]',
        '[class*="tag"]',
        '[class*="highlight"]',
        '[class*="accent"]',
      ];

      for (const selector of tertiarySelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const bg = window.getComputedStyle(el).backgroundColor;
          const hex = rgbToHex(bg);
          if (hex && !isNeutralColor(hex) && hex !== primary && hex !== secondary) {
            tertiary = hex;
            break;
          }
        }
      }

      // Fallback: use a lighter/darker variant of primary
      if (!tertiary && primary) {
        // Create a tertiary color by adjusting primary
        tertiary = primary; // Will be adjusted later if needed
      }

      // Extract BACKGROUND color
      const background = rgbToHex(
        window.getComputedStyle(document.body).backgroundColor
      ) || "#FFFFFF";

      // Extract FONTS
      const headingFont =
        window.getComputedStyle(document.querySelector("h1, h2, h3") || document.body)
          .fontFamily.split(",")[0]
          .replace(/["']/g, "")
          .trim() || "Inter";

      const bodyFont =
        window.getComputedStyle(document.querySelector("p, body") || document.body)
          .fontFamily.split(",")[0]
          .replace(/["']/g, "")
          .trim() || "Inter";

      return {
        colors: {
          primary: primary || "#4F46E5", // Fallback to indigo if not found
          secondary: secondary || "#10B981", // Fallback to green
          tertiary: tertiary || "#F59E0B", // Fallback to amber
          background,
        },
        fonts: {
          heading: headingFont,
          body: bodyFont,
        },
      };
    });

    logDetail(
      `Extracted: primary=${result.colors.primary}, heading font=${result.fonts.heading}`
    );

    return result;
  } catch (error) {
    throw new Error(
      `Playwright extraction failed: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    // Clean up
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

/**
 * Extract only colors (for backward compatibility)
 */
export async function extractColorsViaPlaywright(url: string): Promise<ExtractedColors> {
  const result = await extractColorsAndFontsViaPlaywright(url);
  return result.colors;
}
