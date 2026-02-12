# TabStack Video Generator — MCP + Skill Architecture

Turn any landing page URL into a premium product launch video using **Claude Code + MCP tools**.

## Goal

An **MCP + Skill** tool where Claude Code orchestrates video generation by calling MCP tools and generating React/Remotion code itself. No external AI APIs needed for code generation.

User says *"Generate a video for https://stripe.com"* → Claude Code extracts data, generates React code, and renders a premium HD video with AI music.

## Architecture: MCP + Skill Pattern

**MCP (Model Context Protocol)** = Server exposes atomic tools
**Skill** = Markdown guide teaching Claude Code how to use those tools
**Claude Code** = AI assistant that orchestrates everything + generates React code

```
┌──────────────────────────────────────────────────────────────┐
│ User in Claude Code                                          │
│ "Generate a video for https://stripe.com"                    │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│ Claude Code (AI Assistant)                                   │
│ - Reads .skills/generate-video.md for workflow              │
│ - Calls MCP tools for data extraction                       │
│ - Generates React/Remotion code itself (creative work)      │
│ - Syncs animations to music beats                           │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴────────┐
         │                │
    ┌────▼─────┐    ┌─────▼────┐    ┌────────────┐
    │ extract  │    │ generate │    │   render   │
    │   page   │    │  audio   │    │   video    │
    │   data   │    │ (optional)│   │            │
    └────┬─────┘    └─────┬────┘    └─────┬──────┘
         │                │                │
         │                │                │
    ┌────▼─────┐    ┌─────▼────┐    ┌─────▼──────┐
    │ TabStack │    │WaveSpeed │    │  Remotion  │
    │    +     │    │ Minimax  │    │  Renderer  │
    │Playwright│    │ Music    │    │  + FFmpeg  │
    └──────────┘    └──────────┘    └────────────┘
```

## Pipeline (4 Steps)

```
URL → "https://stripe.com"
 ↓
Step 1: extract_page_data (MCP Tool)
        ├─ TabStack /extract/json → { title, features, pricing }
        ├─ Playwright browser automation → { colors, fonts }
        └─ TabStack /automate (optional) → screenshot

        Returns: {
          title: "Stripe",
          tagline: "Payment infrastructure for the internet",
          features: [{ title: "Payments", desc: "..." }],
          colors: { primary: "#635BFF", secondary: "#0A2540", ... },
          fonts: { heading: "Söhne", body: "Helvetica" }
        }
 ↓
Step 2: generate_audio (MCP Tool - OPTIONAL)
        WaveSpeed Minimax Music 2.5 → AI-generated music
        ├─ POST /v1/music/generate (prompt + lyrics)
        ├─ Poll task status
        ├─ Download MP3 → public/audio/generated-xxx.mp3
        └─ Analyze beats (aubio) → beat times in ms

        Returns: {
          audioFile: "generated-1707523200.mp3",
          durationMs: 12000,
          bpm: 128,
          beatTimes: [0, 468, 937, 1406, ...] // ms timestamps
        }
 ↓
Step 3: CLAUDE CODE GENERATES REACT CODE
        Using data from Steps 1 & 2:
        ├─ Hardcode colors, fonts, content into component
        ├─ Convert beat times to frame numbers (ms → frames @ 30fps)
        ├─ Design 4-6 scenes with modern UI (glassmorphism, gradients)
        ├─ Sync animations to beat frames
        └─ Output complete React/Remotion component code

        Example:
        ```tsx
        const colors = { primary: "#635BFF", ... }; // from extraction
        const beatFrames = [0, 14, 28, 42, ...]; // from audio analysis

        // Pulse on beat
        transform: `scale(${beatFrames.includes(frame) ? 1.1 : 1})`
        ```
 ↓
Step 4: render_video (MCP Tool)
        Takes React code → MP4
        ├─ Save code to src/remotion/compositions/GeneratedVideo.tsx
        ├─ Build TypeScript (npm run build)
        ├─ Bundle with Remotion (Webpack)
        ├─ Render frames (headless browser → PNGs)
        ├─ Encode with FFmpeg (PNGs + audio → H.264 MP4)
        └─ Output: ./out/stripe-video.mp4 (1920x1080, 30fps)
```

## Tech Stack

| Tech | Role | Why |
|------|------|-----|
| **TabStack API** | Page content extraction | Extracts structured JSON (title, features, pricing) from any URL using AI. Saves scraping hassle. |
| **Playwright** | Brand color/font extraction | Launches headless Chrome, executes JS to get computed CSS colors/fonts. More reliable than TabStack for branding. |
| **Claude Code** | React code generation | The AI assistant (you!) that generates premium React/Remotion components. No external AI API needed! |
| **WaveSpeed API** | AI music generation | REST wrapper for Minimax Music 2.5. Submit prompt → poll → get MP3 + beat analysis. |
| **Minimax Music 2.5** | Music model | Generates full songs with lyrics. Perfect for branded background tracks. Accessed via WaveSpeed. |
| **aubio** | Beat detection | Audio analysis library. Detects tempo (BPM) and beat timestamps from generated MP3. |
| **Remotion** | Video rendering | React-based video engine. Scenes are React components, renders to MP4 via FFmpeg. Programmatic, deterministic. |
| **MCP** | Tool protocol | STDIO server exposes tools to Claude Code. `claude mcp add` to install. |
| **FFmpeg** | Video encoding | Required by Remotion. Encodes final H.264 MP4 from rendered frames + audio. |

## API Keys

| Key | Source | Required | Cost | Purpose |
|-----|--------|----------|------|---------|
| `TABSTACK_API_KEY` | tabstack.ai | ✅ Yes | Free tier | Page data extraction |
| `WAVESPEED_API_KEY` | wavespeed.ai | ⚠️ Optional | Free tier | AI music generation |

**No AI provider keys needed!** Claude Code generates React code directly (no Gemini/Claude API calls).

Users set keys via env vars or MCP `-e` flags.

## Beat Synchronization 🎵

**Problem**: Animations must hit on music beats for professional feel.

**Solution**: 3-step beat sync process:

### 1. Beat Detection (aubio library)
```typescript
import aubio from 'aubio';

// After downloading MP3 from WaveSpeed:
const beatDetector = new aubio.Tempo(1024, 512, sampleRate);
const beatTimes = []; // milliseconds

audioBuffer.forEach((sample, time) => {
  if (beatDetector.do(sample)) {
    beatTimes.push(time * 1000); // convert to ms
  }
});

// Result: [0, 468, 937, 1406, 1875, 2343, ...] ms
//          ^    ^    ^     ^     ^     ^
//         beat beat beat  beat  beat  beat
// @ 128 BPM = 468ms per beat
```

### 2. Convert to Frame Numbers (30fps)
```typescript
const fps = 30;
const beatFrames = beatTimes.map(ms => Math.round((ms / 1000) * fps));

// beatTimes:  [0, 468, 937, 1406, 1875, ...]  ms
// beatFrames: [0,  14,  28,   42,   56, ...]  frames
```

### 3. Bake into React Code
```typescript
export default function GeneratedVideo() {
  const frame = useCurrentFrame();

  // Hardcoded beat frames from audio analysis
  const beatFrames = [0, 14, 28, 42, 56, 70, 84, 98, ...];

  // Method 1: Snap to beat (instant)
  const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);

  // Method 2: Smooth pulse between beats
  const nearestBeat = beatFrames.reduce((prev, curr) =>
    Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev
  );
  const beatProgress = (frame - nearestBeat) / 14; // 0-1 cycle
  const pulseScale = 1 + Math.sin(beatProgress * Math.PI * 2) * 0.05;

  return (
    <div style={{
      // Instant beat hit
      transform: `scale(${isBeat ? 1.1 : 1})`,

      // OR smooth pulse wave
      transform: `scale(${pulseScale})`,

      // Transition for smoothness
      transition: "transform 0.1s ease-out"
    }}>
      Content
    </div>
  );
}
```

### Synchronization Strategies

**1. Scene Transitions on Beats**
```typescript
// Start new scenes on major beats
<Sequence from={beatFrames[0]} durationInFrames={90}>  {/* Scene 1 */}
<Sequence from={beatFrames[6]} durationInFrames={90}>  {/* Scene 2 */}
<Sequence from={beatFrames[12]} durationInFrames={90}> {/* Scene 3 */}
```

**2. Stagger Feature Cards on Beats**
```typescript
features.map((feature, i) => {
  const startBeat = beatFrames[2 + i]; // Start at 3rd beat, one per feature
  return (
    <div style={{
      opacity: interpolate(frame, [startBeat, startBeat + 5], [0, 1]),
      transform: `translateY(${interpolate(frame, [startBeat, startBeat + 10], [50, 0])}px)`
    }}>
      {feature.title}
    </div>
  );
})
```

**3. Button Pulse on Every Beat**
```typescript
<div style={{
  transform: `scale(${isBeat ? 1.08 : 1})`,
  boxShadow: isBeat ? `0 0 60px ${colors.primary}` : `0 0 20px ${colors.primary}40`,
  transition: "all 0.15s ease-out"
}}>
  Get Started →
</div>
```

**4. Background Elements Drift on Beat**
```typescript
// Orbs/particles change direction on beat
const driftX = beatFrames.filter(b => b <= frame).length * 30; // 30px per beat
transform: `translateX(${driftX}px)`,
```

## Architecture Decisions

**MCP + Skill (not CLI + AI API)** — Claude Code generates React code directly, seeing full context and skill guidelines. No code truncation, no external API keys, better quality than Gemini/Claude API calls.

**Playwright for branding** — TabStack's browser automation was unreliable for color extraction. Running our own headless Chrome gives precise CSS computed colors and fonts.

**Beat sync is critical** — Amateur videos ignore music rhythm. Professional ones hit beats. We analyze beats and bake frame numbers into code for perfect sync.

**Self-contained components** — All data (colors, fonts, content, beats) is hardcoded into the generated React code. Remotion renders without external dependencies.

**Graceful audio fallback** — WaveSpeed key is optional. If missing, videos render with static placeholder audio or silently. Production videos should always have AI music for best results.

**Users bring keys** — Keeps billing clean. TabStack and WaveSpeed have generous free tiers.

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
