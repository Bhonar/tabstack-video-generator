# Tabstack Video Generator — Claude Code Skill

## When to Use

Use the `generate_video` MCP tool when the user asks to:
- Create a product launch video
- Generate a video from a website/URL
- Turn a landing page into a video
- Make a promo/marketing video for a product

## How to Use

Call the `generate_video` tool with:

```json
{
  "url": "https://example.com",
  "outputPath": "./out/video.mp4",
  "audioMood": "tech"
}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `url` | Yes | The landing page URL to create a video for |
| `outputPath` | No | Output MP4 path (default: `./out/video.mp4`) |
| `audioMood` | No | Background music mood (auto-detected if omitted) |

### Audio Mood Selection Guide

Choose the mood based on the product type:

| Product Type | Mood | Example |
|-------------|------|---------|
| SaaS, API, DevTool | `tech` | Stripe, Vercel, GitHub |
| Design, Creative, Luxury | `elegant` | Figma, Squarespace, Apple |
| Enterprise, B2B, Finance | `corporate` | Salesforce, Bloomberg |
| Consumer, Social, Startup | `energetic` | TikTok, Discord, Notion |
| Infrastructure, Minimal, OSS | `minimal` | Linux, Cloudflare |

If unsure, omit `audioMood` — the AI will auto-detect the best fit.

## What It Does

The tool runs a 5-step pipeline (all API keys are built in, zero config needed):
1. **Extract** — Pulls structured data from the URL (title, features, pricing, colors)
2. **Screenshot** — Captures a hero screenshot of the page
3. **Plan** — AI creates a video storyboard with scenes, transitions, and timing
4. **Audio** — AI generates a unique background music track matching the product
5. **Render** — Remotion renders the storyboard into an HD MP4 video (1920x1080)

## Example Conversations

**User:** "Generate a video for https://linear.app"
**You:** Call `generate_video` with `url: "https://linear.app"`

**User:** "Create an elegant promo video for stripe.com"
**You:** Call `generate_video` with `url: "https://stripe.com"` and `audioMood: "elegant"`

**User:** "Make a video for my site at https://myapp.io and save it as myapp-video.mp4"
**You:** Call `generate_video` with `url: "https://myapp.io"` and `outputPath: "./myapp-video.mp4"`

## After Generation

When the tool returns successfully, tell the user:
- Where the video was saved
- Video duration and number of scenes
- The audio mood that was used (and whether it was AI-generated or static)
- They can open it with their default video player

## Troubleshooting

| Error | Solution |
|-------|----------|
| `FFmpeg not installed` | Run `brew install ffmpeg` (macOS) |
| `Tabstack extract failed` | Check the URL is accessible and try again |
| `Scene planning failed` | Retry — the AI occasionally produces invalid JSON |
| `Audio generation failed` | Falls back to static audio automatically |
