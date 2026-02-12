import { logDetail } from "./progress.js";
import { captureScreenshot } from "./tabstack-client.js";

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

interface VisionExtractionResult {
  colors: ExtractedColors;
  fonts: ExtractedFonts;
}

/**
 * Extract brand colors and fonts from a webpage using vision AI.
 * Uses screenshot + Gemini Vision to identify branding elements.
 */
export async function extractColorsAndFontsViaVision(
  url: string
): Promise<VisionExtractionResult> {
  logDetail("Extracting colors and fonts via vision AI...");

  // Get API key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }

  // Step 1: Capture screenshot
  logDetail("Capturing screenshot for vision analysis...");
  const screenshotUrl = await captureScreenshot(url);

  if (!screenshotUrl) {
    throw new Error("Failed to capture screenshot for vision analysis");
  }

  // Step 2: Fetch screenshot as base64
  let screenshotBase64: string;
  if (screenshotUrl.startsWith("data:image")) {
    // Already base64
    screenshotBase64 = screenshotUrl.split(",")[1];
  } else {
    // Fetch from URL
    const response = await fetch(screenshotUrl);
    const buffer = await response.arrayBuffer();
    screenshotBase64 = Buffer.from(buffer).toString("base64");
  }

  // Step 3: Send to Gemini Vision
  logDetail("Analyzing screenshot with Gemini Vision...");

  const visionResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this landing page screenshot and extract the brand design system.

COLORS: Identify the 4 primary brand colors as HEX codes:
1. PRIMARY - The main brand color (usually on buttons, CTAs, links, or logo)
2. SECONDARY - The secondary brand color (hover states, accents, secondary buttons)
3. TERTIARY - The tertiary/accent color (badges, highlights, success states)
4. BACKGROUND - The main page background color

FONTS: Identify the 2 primary fonts:
1. HEADING - The font used for headings/titles (look at h1, h2 elements)
2. BODY - The font used for body text/paragraphs

Return ONLY a JSON object with this exact structure:
{
  "colors": {
    "primary": "#HEXCODE",
    "secondary": "#HEXCODE",
    "tertiary": "#HEXCODE",
    "background": "#HEXCODE"
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name"
  }
}

IMPORTANT:
- Return ONLY the JSON, no other text
- Use exact 6-digit hex codes (#RRGGBB format)
- Use standard font names (e.g., "Inter", "Roboto", "SF Pro Display")
- If you can't identify a color/font, use your best guess based on the design`,
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: screenshotBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!visionResponse.ok) {
    const errorText = await visionResponse.text();
    throw new Error(`Gemini Vision API failed (${visionResponse.status}): ${errorText}`);
  }

  const visionData = await visionResponse.json();

  // Extract the text response
  const responseText =
    visionData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!responseText) {
    throw new Error("No response from Gemini Vision");
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  const result: VisionExtractionResult = JSON.parse(jsonText);

  // Validate colors
  const colors = result.colors;
  if (
    !isValidHex(colors.primary) ||
    !isValidHex(colors.secondary) ||
    !isValidHex(colors.tertiary) ||
    !isValidHex(colors.background)
  ) {
    throw new Error("Invalid hex colors returned from vision AI");
  }

  // Validate fonts
  if (!result.fonts.heading || !result.fonts.body) {
    throw new Error("Missing font information from vision AI");
  }

  logDetail(
    `Vision extraction complete: primary=${colors.primary}, fonts=${result.fonts.heading}/${result.fonts.body}`
  );

  return result;
}

/**
 * Extract only colors via vision (for backward compatibility)
 */
export async function extractColorsViaVision(url: string): Promise<ExtractedColors> {
  const result = await extractColorsAndFontsViaVision(url);
  return result.colors;
}

/**
 * Validate if a string is a valid hex color code
 */
function isValidHex(color: string): boolean {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color);
}
