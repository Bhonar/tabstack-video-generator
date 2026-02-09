import { PAGE_EXTRACTION_SCHEMA } from "../types.js";
import type { ExtractedPageData } from "../types.js";
import { logDetail } from "./progress.js";
import { getTabstackKey } from "./defaults.js";

const TABSTACK_BASE = "https://api.tabstack.ai/v1";

function getApiKey(): string {
  const key = getTabstackKey();
  if (!key) {
    throw new Error(
      "TABSTACK_API_KEY not set. Run: npx @tabstack/video-generator --setup",
    );
  }
  return key;
}

/**
 * Extract structured JSON data from a URL using Tabstack's /extract/json endpoint.
 */
export async function extractStructured(url: string): Promise<ExtractedPageData> {
  logDetail(`Calling Tabstack /extract/json for ${url}`);

  const response = await fetch(`${TABSTACK_BASE}/extract/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      url,
      json_schema: PAGE_EXTRACTION_SCHEMA,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Tabstack extract/json failed (${response.status}): ${text}`,
    );
  }

  const result = await response.json();

  // The API returns { data: { ... } } or just the data directly
  const data = result.data ?? result;
  logDetail(`Extracted: "${data.title}" — ${data.features?.length ?? 0} features`);

  return data as ExtractedPageData;
}

/**
 * Extract markdown content from a URL (fallback if JSON extraction fails).
 */
export async function extractMarkdown(
  url: string,
): Promise<{ markdown: string; title: string; description: string }> {
  logDetail(`Calling Tabstack /extract/markdown for ${url}`);

  const response = await fetch(`${TABSTACK_BASE}/extract/markdown`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({ url, metadata: true }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Tabstack extract/markdown failed (${response.status}): ${text}`,
    );
  }

  const result = await response.json();
  return {
    markdown: result.markdown ?? result.data?.markdown ?? "",
    title: result.metadata?.title ?? result.title ?? "",
    description: result.metadata?.description ?? result.description ?? "",
  };
}

/**
 * Capture a screenshot of a URL using Tabstack's /automate endpoint.
 * Returns the screenshot URL or base64 data.
 */
export async function captureScreenshot(
  url: string,
): Promise<string | null> {
  logDetail(`Capturing screenshot of ${url}`);

  try {
    const response = await fetch(`${TABSTACK_BASE}/automate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        url,
        task: "Take a screenshot of the full page above the fold (the hero section).",
        maxIterations: 5,
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (!response.ok) {
      logDetail("Screenshot capture failed, skipping hero scene.");
      return null;
    }

    const result = await response.json();

    // Look for screenshot in the automation result
    const screenshot =
      result.screenshot ??
      result.data?.screenshot ??
      result.steps?.find((s: any) => s.screenshot)?.screenshot ??
      null;

    if (screenshot) {
      logDetail("Screenshot captured successfully.");
    } else {
      logDetail("No screenshot in response, skipping hero scene.");
    }

    return screenshot;
  } catch {
    logDetail("Screenshot capture timed out, skipping hero scene.");
    return null;
  }
}
