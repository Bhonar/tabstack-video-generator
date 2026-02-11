# TabStack Video Generator — Architecture & Overview

Turn any landing page URL into a polished product launch video. One command.

## Goal

A dead-simple MCP + CLI tool that lets founders, marketers, and anyone turn a landing page URL into a professional product launch video — the kind an agency charges thousands to produce. Type a URL, get an HD video with motion graphics and AI-generated music.

Any founder using Claude Code can just say *"Generate a video for my site"* and get back a launch video in minutes.

## Pipeline (5 Steps)

```
URL
 ↓
Step 1 → TabStack API extracts structured data
         (title, tagline, features, pricing, stats, brand colors, CTA)
 ↓
Step 2 → TabStack API captures a hero screenshot
 ↓
Step 3 → Gemini 2.5 Flash plans the storyboard
         (scene order, timing, transitions, color theme, audio mood,
          audio prompt & lyrics for music generation)
 ↓
Step 4 → WaveSpeed Minimax Music 2.5 generates unique background music
         (submit job → poll every 3s → download MP3)
         Falls back to static audio if key missing or API fails
 ↓
Step 5 → Remotion renders final 1920×1080 MP4
         (React components → motion graphics + transitions + audio → H.264)
 ↓
video.mp4 (20–35 seconds, auto-opens)
```

## Tech Stack

| Tech | Role | Why |
|------|------|-----|
| **TabStack API** | Page data extraction + screenshot | Extracts structured JSON from any URL with a schema, plus automated screenshots. No scraping headaches. |
| **Gemini 2.5 Flash** | AI storyboard planner | Fast, cheap, great at structured JSON output. Plans scene order, timing, colors. Also writes audio prompt + lyrics. Free tier. |
| **WaveSpeed API** | Audio generation proxy | Cheaper than calling Minimax directly. Simple REST wrapper around Minimax Music 2.5. Async job model (submit → poll → download). |
| **Minimax Music 2.5** | Music model | Generates full songs with lyrics support. Perfect for branded background tracks. Accessed through WaveSpeed for cost. |
| **Remotion** | Video rendering engine | React-based — scenes are React components, renders to MP4 via FFmpeg. Programmatic, deterministic, no video editor needed. |
| **MCP** | Claude Code integration | STDIO server so Claude calls `generate_video` as a tool. One `claude mcp add` command to set up. |
| **FFmpeg** | Video encoding | Required by Remotion. Encodes the final H.264 MP4. |

## API Keys

| Key | Source | Required | Cost |
|-----|--------|----------|------|
| `TABSTACK_API_KEY` | console.tabstack.ai | Yes | Free tier |
| `GEMINI_API_KEY` | aistudio.google.com | Yes | Free tier |
| `WAVESPEED_API_KEY` | wavespeed.ai | No | Free tier — enables AI music |

Users bring their own keys via env vars or `-e` flags.

## Architecture Decisions

**Dynamic per-video audio** — The 5 static placeholder MP3s are identical 75,900-byte files (placeholders, not real music). Gemini now writes a custom audio prompt and lyrics tailored to each product, so every video gets unique music matching its brand.

**Graceful fallback** — WaveSpeed key is optional. If missing or API fails, the pipeline doesn't break — uses static placeholder audio. The `audioGenerated` boolean in the result tells you which path was taken.

**Users bring their own keys** — Initially explored baking keys into the package (zero-config), but that bills every user's usage to one account. All 3 services have free tiers and the one-liner setup makes it painless.

**Bundle cache invalidation** — Remotion bundles `public/` on first render and caches it. When a new AI-generated MP3 downloads to `public/audio/`, the renderer invalidates that cache so the new file gets included.

**Audio duration mismatch** — Minimax generates full songs (60s+), videos are 20–35s. The `AudioTrack` component's volume envelope (1s fade-in to 0.3, hold, 2s fade-out to 0) plus Remotion only playing for the video's duration handles this naturally — no trimming needed.

## Video Scenes (Remotion Components)

| Scene | What it shows |
|-------|-------------|
| **IntroScene** | Brand name + tagline, animated entrance |
| **HeroScreenshotScene** | Page screenshot with parallax effect |
| **FeaturesScene** | Key features with staggered animations |
| **StatsScene** | Metrics with counting animations |
| **PricingScene** | Pricing tiers with highlights |
| **CTAScene** | Call to action finale |
| **TransitionScene** | Between major scenes |

Gemini decides which scenes to include and in what order based on what data the page actually has.

## File Structure

```
src/
├── bin/cli.ts                  # CLI entry point (--url, --no-ai-audio, etc.)
├── server.ts                   # MCP server (STDIO transport)
├── types.ts                    # Shared types + page extraction schema
├── tools/
│   └── generate-video.ts       # 5-step pipeline orchestrator
├── lib/
│   ├── defaults.ts             # Centralized API key accessors
│   ├── audio-generator.ts      # WaveSpeed Minimax Music 2.5 client
│   ├── scene-planner.ts        # Gemini storyboard planner
│   ├── tabstack-client.ts      # TabStack API client (extract + screenshot)
│   ├── renderer.ts             # Remotion render wrapper
│   ├── preflight.ts            # Pre-flight checks (keys, FFmpeg, audio files)
│   ├── setup.ts                # Interactive setup wizard
│   └── progress.ts             # Terminal progress logging
├── remotion/
│   ├── Root.tsx                # Remotion root composition
│   ├── index.ts                # Remotion entry
│   ├── types.ts                # Scene/composition types
│   ├── audio/
│   │   └── AudioTrack.tsx      # Audio with fade envelope
│   ├── compositions/
│   │   └── ProductLaunchVideo.tsx  # Main composition
│   ├── lib/
│   │   ├── animations.ts       # Shared animation helpers
│   │   ├── colors.ts           # Color utilities
│   │   ├── fonts.tsx           # Font loading
│   │   └── layout.ts          # Layout constants
│   └── scenes/
│       ├── IntroScene.tsx
│       ├── HeroScreenshotScene.tsx
│       ├── FeaturesScene.tsx
│       ├── StatsScene.tsx
│       ├── PricingScene.tsx
│       ├── CTAScene.tsx
│       └── TransitionScene.tsx
├── public/
│   ├── audio/                  # Static fallback MP3s + generated audio
│   └── fonts/                  # Brand fonts
└── skill/
    └── generate-video.md       # Claude Code skill instructions
```

## Distribution

- **NPM**: `@tabstack/video-generator` — runs via `npx`
- **MCP**: One command to add to Claude Code
- **CLI**: Direct usage with `--url` flag
- **Skill**: `skill/generate-video.md` teaches Claude how to use the tool

## Repo

https://github.com/Bhonar/tabstack-video-generator
