// ── Data extracted from a landing page via Tabstack ──

export interface ExtractedPageData {
  title: string;
  tagline: string;
  description: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  pricing: Array<{
    name: string;
    price: string;
    features: string[];
    highlighted: boolean;
  }>;
  ctaText: string;
  ctaUrl: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  socialProof: string;
  logoUrl: string;
}

// ── Input options for the generate_video pipeline ──

export interface GenerateVideoOptions {
  url: string;
  outputPath: string;
  audioMoodOverride?: string;
  skipAiAudio?: boolean;
  skipNarration?: boolean;
  aiProvider?: string; // "gemini" | "claude" — auto-detected if not set
  debug?: boolean; // Print full storyboard JSON for debugging
}

// ── Result returned after video generation ──

export interface GenerateVideoResult {
  outputPath: string;
  durationSeconds: number;
  sceneCount: number;
  audioMood: string;
  audioGenerated: boolean;
  narrationGenerated: boolean;
  storyboardSummary: string;
  aiProvider: string;
}

// ── Audio generation plan from Gemini storyboard ──

export interface AudioGenerationPlan {
  audioPrompt: string;
  audioLyrics: string;
  narrationScript?: string;
}

// ── The JSON schema sent to Tabstack /extract/json ──

export const PAGE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The main brand/product name",
    },
    tagline: {
      type: "string",
      description: "The primary tagline or hero headline",
    },
    description: {
      type: "string",
      description: "A brief description of what the product does",
    },
    features: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
      description: "Key product features or benefits",
    },
    stats: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "string", description: "The numeric value as a string, e.g. '50000', '99.9'" },
          label: { type: "string", description: "What the stat measures, e.g. 'Users', 'Uptime'" },
        },
        required: ["value", "label"],
      },
      description: "Key statistics or metrics shown on the page",
    },
    pricing: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          highlighted: { type: "boolean", description: "Whether this is the recommended/popular tier" },
        },
        required: ["name", "price", "features", "highlighted"],
      },
      description: "Pricing tiers if visible on the page",
    },
    ctaText: {
      type: "string",
      description: "The primary call-to-action button text",
    },
    ctaUrl: {
      type: "string",
      description: "The URL the main CTA links to",
    },
    colors: {
      type: "object",
      properties: {
        primary: { type: "string", description: "Primary brand color as hex, e.g. '#FF97EA'" },
        secondary: { type: "string", description: "Secondary color as hex" },
        background: { type: "string", description: "Main background color as hex" },
      },
      required: ["primary", "secondary", "background"],
      description: "The dominant colors from the page design",
    },
    socialProof: {
      type: "string",
      description: "Any social proof text like 'Trusted by 10,000+ teams' or 'Backed by Mozilla'",
    },
    logoUrl: {
      type: "string",
      description: "URL of the brand/product logo image if found",
    },
  },
  required: ["title", "tagline", "description", "features", "ctaText", "ctaUrl", "colors"],
  additionalProperties: false,
} as const;
