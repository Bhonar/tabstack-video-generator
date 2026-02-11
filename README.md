# @tabstack/video-generator

Turn any landing page into a product launch video. One command.

> URL in, HD video out. AI-generated music, motion graphics, and professional scenes — in minutes.

## What it does

Give it a URL → it extracts your product info, plans a storyboard, generates a custom song, and renders a polished 20–35 second launch video.

```
https://stripe.com → video.mp4
```

## Prerequisites

Before you start, make sure you have these installed:

### Node.js (v18+)

```bash
node --version   # Should show v18 or higher
```

Don't have it? → [nodejs.org](https://nodejs.org)

### FFmpeg

FFmpeg is required for video rendering. Check if it's installed:

```bash
ffmpeg -version
```

Not installed? Pick your platform:

| Platform | Install command |
|----------|----------------|
| macOS (Homebrew) | `brew install ffmpeg` |
| macOS (no Homebrew) | Download from [evermeet.cx/ffmpeg](https://evermeet.cx/ffmpeg/) |
| Ubuntu / Debian | `sudo apt install ffmpeg` |
| Fedora | `sudo dnf install ffmpeg` |
| Windows | `winget install ffmpeg` |

### Claude Code CLI

```bash
claude --version
```

Don't have it? → [claude.ai/download](https://claude.ai/download)

## Get your API keys

All services have **free tiers** — no credit card needed.

| # | Key | Where to get it | Required? |
|---|-----|-----------------|-----------|
| 1 | `TABSTACK_API_KEY` | [console.tabstack.ai](https://console.tabstack.ai) | Yes |
| 2 | `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Yes |
| 3 | `WAVESPEED_API_KEY` | [wavespeed.ai](https://wavespeed.ai) | No — enables AI music |

> Without the WaveSpeed key, videos still work but use placeholder audio instead of a custom AI-generated song.

## Setup

### Option A: Claude Code (recommended)

**Step 1** — Add the MCP server:

```bash
claude mcp add tabstack-video \
  -e TABSTACK_API_KEY=your_tabstack_key \
  -e GEMINI_API_KEY=your_gemini_key \
  -e WAVESPEED_API_KEY=your_wavespeed_key \
  -- npx -y @tabstack/video-generator
```

**Step 2** — Restart Claude Code:

> **Important:** Close your current Claude Code session and open a new one. The MCP server only loads on startup, so your current session won't see it until you restart.

**Step 3** — Ask Claude to make a video:

```
Generate a video for https://yoursite.com
```

That's it. Claude handles the rest.

### Option B: CLI (direct)

```bash
TABSTACK_API_KEY=your_key \
GEMINI_API_KEY=your_key \
WAVESPEED_API_KEY=your_key \
npx -y @tabstack/video-generator --url https://yoursite.com
```

Video saves to `./out/video.mp4` and auto-opens.

### Verify your setup

Run the built-in setup wizard to check everything is configured correctly:

```bash
npx -y @tabstack/video-generator --setup
```

## Examples

```bash
# Custom music mood
npx @tabstack/video-generator --url https://vercel.com --audio-mood elegant

# Skip AI music (faster, no WaveSpeed key needed)
npx @tabstack/video-generator --url https://notion.so --no-ai-audio

# Custom output path, don't auto-open
npx @tabstack/video-generator --url https://linear.app --output ./linear.mp4 --no-open
```

## CLI flags

| Flag | What it does |
|------|-------------|
| `--url <url>` | Landing page to turn into a video |
| `--audio-mood <mood>` | `tech` · `elegant` · `corporate` · `energetic` · `minimal` |
| `--no-ai-audio` | Use static audio instead of AI-generated |
| `--output <path>` | Where to save (default: `./out/video.mp4`) |
| `--no-open` | Don't auto-open after rendering |
| `--setup` | Check if everything is installed correctly |

## How it works

```
URL
 ↓
Step 1 → TabStack extracts product data (title, features, pricing, colors)
 ↓
Step 2 → TabStack captures a hero screenshot
 ↓
Step 3 → Gemini plans the storyboard (scenes, timing, colors, lyrics)
 ↓
Step 4 → WaveSpeed generates a custom song with AI
 ↓
Step 5 → Remotion renders the final 1920×1080 MP4
 ↓
video.mp4 (20–35 seconds)
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ffmpeg: command not found` | Install FFmpeg — see [prerequisites](#ffmpeg) above |
| `MCP server not showing up` | Restart Claude Code (close and reopen) |
| Video has no music | Set `WAVESPEED_API_KEY` or it falls back to placeholder audio |
| `TABSTACK_API_KEY missing` | Get a free key at [console.tabstack.ai](https://console.tabstack.ai) |
| `GEMINI_API_KEY missing` | Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Rendering is slow | First render is slower (bundling). Subsequent renders are cached |

## License

MIT
