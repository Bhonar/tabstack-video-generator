import { logDetail } from "./progress.js";
import { getTabstackKey } from "./defaults.js";
import { extractColorsViaPlaywright } from "./playwright-extractor.js";

const TABSTACK_BASE = "https://api.tabstack.ai/v1";

interface ExtractedColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
}

/**
 * Extract brand colors from a webpage.
 * Strategy:
 * 1. Playwright (primary) - Own browser automation, most reliable
 * 2. HTML extraction (fallback) - TabStack /extract for simple pages
 */
export async function extractColors(url: string): Promise<ExtractedColors> {
  // Try Playwright first (most reliable - our own browser)
  try {
    return await extractColorsViaPlaywright(url);
  } catch (playwrightError) {
    logDetail(`Playwright extraction failed: ${playwrightError instanceof Error ? playwrightError.message : String(playwrightError)}`);

    // Try HTML extraction as fallback
    const key = getTabstackKey();
    if (!key) {
      throw new Error("TABSTACK_API_KEY not set and Playwright failed");
    }

    try {
      return await extractColorsViaHTML(url, key);
    } catch (htmlError) {
      // Both methods failed
      logDetail(`HTML extraction also failed: ${htmlError instanceof Error ? htmlError.message : String(htmlError)}`);
      return getFallbackColors(url);
    }
  }
}

/**
 * Extract colors using browser automation (primary method)
 */
async function extractColorsViaBrowser(url: string, key: string): Promise<ExtractedColors> {
  logDetail("Extracting brand colors via browser automation...");

  const response = await fetch(`${TABSTACK_BASE}/automate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        url,
        task: `Extract brand colors as hex codes. Return JSON: {"primary": "#HEX", "secondary": "#HEX", "tertiary": "#HEX", "background": "#HEX"}`,
        maxIterations: 5,
      }),
      signal: AbortSignal.timeout(120_000), // 2 minutes
    });

    if (!response.ok) {
      logDetail(`Color extraction failed (${response.status}), using fallback`);
      return getFallbackColors(url);
    }

    // TabStack /automate returns SSE (Server-Sent Events) stream
    // We need to parse the stream to get the final result
    const text = await response.text();

    // Parse SSE format: TabStack /automate returns events like:
    // event: complete
    // data: {"answer": "...result..."}
    // OR
    // event: error
    // data: {"success": false, "error": {...}}
    const lines = text.split('\n');
    let currentEvent = '';
    let resultData = null;
    let errorData = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('event:')) {
        currentEvent = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        try {
          const jsonStr = line.substring(5).trim();
          const parsed = JSON.parse(jsonStr);

          // Check for error events
          if (currentEvent === 'error' || parsed.error || parsed.success === false) {
            errorData = parsed;
          }

          // Check for result events (complete, answer, result, etc.)
          if (currentEvent === 'complete' || currentEvent === 'answer' || currentEvent === 'result') {
            resultData = parsed;
          } else if (parsed.answer || parsed.result) {
            resultData = parsed;
          }
        } catch {
          // Not valid JSON, skip
        }
      }
    }

    // If we got an error, log it and throw
    if (errorData) {
      const errorMsg = errorData.error?.message || JSON.stringify(errorData);
      logDetail(`TabStack automation error: ${errorMsg}`);
      return getFallbackColors(url);
    }

    if (!resultData) {
      logDetail("Could not find result in SSE stream");
      return getFallbackColors(url);
    }

    // TabStack /automate returns the result in result.data or result.answer
    const colorsData = resultData.answer ?? resultData.result ?? resultData.data ?? resultData;

    // Try to parse if it's a string
    let colors: ExtractedColors;
    if (typeof colorsData === 'string') {
      // TabStack might return JSON as a string
      try {
        colors = JSON.parse(colorsData);
      } catch {
        logDetail("Could not parse color data, using fallback");
        return getFallbackColors(url);
      }
    } else {
      colors = colorsData;
    }

    // Validate all colors are present and valid hex codes
    if (!isValidHex(colors.primary) ||
        !isValidHex(colors.secondary) ||
        !isValidHex(colors.tertiary) ||
        !isValidHex(colors.background)) {
      logDetail("Invalid color values extracted, using fallback");
      return getFallbackColors(url);
    }

    logDetail(`Colors extracted: primary=${colors.primary}, secondary=${colors.secondary}, tertiary=${colors.tertiary}`);
    return colors;
}

/**
 * Extract colors from HTML/CSS without browser automation (fallback method)
 * Uses TabStack's /extract endpoint with specific schema for color values
 */
async function extractColorsViaHTML(url: string, key: string): Promise<ExtractedColors> {
  logDetail("Extracting colors from HTML/CSS...");

  const response = await fetch(`${TABSTACK_BASE}/extract/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      url,
      json_schema: {
        type: "object",
        properties: {
          primary: {
            type: "string",
            description: `PRIMARY BRAND COLOR as hex code (#RRGGBB). YOU MUST extract this from:
1. style="background: #HEXCODE" or style="background-color: #HEXCODE" attributes in HTML elements
2. style="color: #HEXCODE" for text/link colors
3. <style> tags containing: .button{background:#HEXCODE}, a{color:#HEXCODE}, etc.
4. CSS custom properties like --primary-color: #HEXCODE
5. SVG fill="#HEXCODE" or stroke="#HEXCODE" in logo elements
6. ANY #HEXCODE pattern that appears 3+ times (most likely the primary brand color)
Look for buttons, CTAs, links. Extract the ACTUAL hex code from the HTML source, not just describe it.
IMPORTANT: Return "#HEXCODE" format (e.g., "#4F46E5"). If you find rgb() convert to hex. Empty string only if truly no colors found.`,
          },
          secondary: {
            type: "string",
            description: `SECONDARY BRAND COLOR as hex code. Extract from style attributes, <style> tags, or SVG elements. Look for the second most common non-black/white color. Must be #HEXCODE format.`,
          },
          tertiary: {
            type: "string",
            description: `TERTIARY ACCENT COLOR as hex code. Extract from HTML/CSS. Third most common color. Must be #HEXCODE format.`,
          },
          background: {
            type: "string",
            description: `PAGE BACKGROUND COLOR as hex code. Look for: <body style="background:#HEXCODE">, body{background:#HEXCODE} in <style> tags, or most common background hex. Default to #FFFFFF if not found.`,
          },
        },
        required: ["primary", "secondary", "tertiary", "background"],
      },
      extractMetadata: false,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const result = await response.json();

  const colors: ExtractedColors = {
    primary: result.primary || "",
    secondary: result.secondary || "",
    tertiary: result.tertiary || "",
    background: result.background || "",
  };

  // Validate all colors are present and valid hex codes
  if (!isValidHex(colors.primary) ||
      !isValidHex(colors.secondary) ||
      !isValidHex(colors.tertiary) ||
      !isValidHex(colors.background)) {
    logDetail(`Extracted: primary=${colors.primary}, secondary=${colors.secondary}, tertiary=${colors.tertiary}, bg=${colors.background}`);
    throw new Error("Invalid or missing color values from HTML extraction");
  }

  logDetail(`Colors from HTML: primary=${colors.primary}, secondary=${colors.secondary}, tertiary=${colors.tertiary}`);
  return colors;
}

/**
 * Validate if a string is a valid hex color code
 */
function isValidHex(color: string): boolean {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
}

/**
 * Fallback when color extraction fails - throw error instead of using hardcoded colors
 */
function getFallbackColors(url: string): ExtractedColors {
  throw new Error(
    `Failed to extract brand colors from ${url}.\n\n` +
    `All extraction methods failed:\n` +
    `1. Playwright browser automation - Check Playwright is installed\n` +
    `2. HTML extraction (TabStack /extract) - Cannot find colors in external CSS\n\n` +
    `SOLUTIONS:\n` +
    `1. Ensure Playwright browser binaries are installed: npx playwright install chromium\n` +
    `2. Check that the URL is accessible\n` +
    `3. Try a different URL with clearer brand colors\n` +
    `4. Check if the site requires JavaScript to render (Playwright should handle this)`
  );
}
