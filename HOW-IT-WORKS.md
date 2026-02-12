# How MCP + Skill Video Generation Works

## Quick Answer

**User says**: "Generate a video for https://stripe.com"

**Claude Code**:
1. Calls `extract_page_data` → gets colors, fonts, content from TabStack + Playwright
2. Calls `generate_audio` → gets AI music with beat times from WaveSpeed
3. **Generates React code itself** with all data hardcoded + beat-synced animations
4. Calls `render_video` → Remotion renders to MP4

**Result**: Premium product video with accurate branding and beat-synchronized animations!

---

## Detailed Flow

### Step 1: Extract Page Data (MCP Tool)

**What it does**:
- Calls TabStack API `/extract/json` to get page content
- Launches Playwright headless Chrome to extract brand colors/fonts
- Optionally captures a screenshot

**How TabStack works**:
```typescript
POST https://api.tabstack.ai/v1/extract/json
Headers: { Authorization: "Bearer ts_xxx" }
Body: {
  url: "https://stripe.com",
  json_schema: {
    title: "string",
    tagline: "string",
    features: [{ title: "string", description: "string" }],
    pricing: [{ name: "string", price: "string" }],
    stats: [{ label: "string", value: "string" }]
  }
}

Response: {
  title: "Stripe",
  tagline: "Payment infrastructure for the internet",
  features: [
    { title: "Payments", description: "Accept payments globally..." },
    { title: "Billing", description: "Recurring revenue made simple..." }
  ],
  pricing: [
    { name: "Starter", price: "$0" },
    { name: "Scale", price: "Custom" }
  ]
}
```

TabStack's browser automation:
1. Navigates to the URL
2. Extracts all visible text
3. Uses AI to structure it according to the schema
4. Returns clean JSON

**How Playwright extracts colors/fonts**:
```typescript
// Launch local headless Chrome
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://stripe.com");

// Execute JavaScript in the browser context
const { colors, fonts } = await page.evaluate(() => {
  // Find CTA button
  const button = document.querySelector('button[class*="cta"]') ||
                 document.querySelector('a[href*="get-started"]');

  // Get computed CSS background color
  const bgColor = window.getComputedStyle(button).backgroundColor;
  // Result: "rgb(99, 91, 255)"

  // Convert RGB to hex
  function rgbToHex(rgb) {
    const match = rgb.match(/rgb\\((\\d+), (\\d+), (\\d+)\\)/);
    const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
    return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
  }

  const primary = rgbToHex(bgColor); // "#635BFF"

  // Extract heading font
  const h1 = document.querySelector("h1");
  const headingFont = window.getComputedStyle(h1).fontFamily;
  // Result: "Söhne, sans-serif"

  return {
    colors: { primary, secondary, tertiary, background },
    fonts: { heading: headingFont, body: bodyFont }
  };
});

// Returns: {
//   colors: { primary: "#635BFF", secondary: "#0A2540", ... },
//   fonts: { heading: "Söhne", body: "Helvetica" }
// }
```

**Why Playwright instead of TabStack for colors?**
- TabStack's browser automation was unreliable
- Running our own Chrome gives exact computed CSS values
- More control over selector strategies

---

### Step 2: Generate AI Music (MCP Tool - Optional)

**What it does**:
- Calls WaveSpeed Minimax Music 2.5 to generate custom music
- Analyzes beat pattern using music-tempo library
- Returns audio file path + beat times

**How WaveSpeed works**:
```typescript
// 1. Submit generation job
POST https://api.wavespeed.ai/api/v3/minimax/music-2.5
Headers: { Authorization: "Bearer ws_xxx" }
Body: {
  prompt: "Instrumental epic corporate trailer, 128 BPM, kick on every beat, dramatic build",
  lyrics: "[Verse 1]\\nStripe\\nPayment infrastructure\\n\\n[Chorus]\\nAccept payments globally",
  bitrate: 256000,
  sample_rate: 44100
}

Response: {
  data: { id: "request-abc123", status: "processing" }
}

// 2. Poll for completion (every 5 seconds)
GET https://api.wavespeed.ai/api/v3/predictions/request-abc123/result
Response: {
  data: {
    status: "completed",
    outputs: ["https://cdn.wavespeed.ai/audio/abc123.mp3"]
  }
}

// 3. Download MP3
GET https://cdn.wavespeed.ai/audio/abc123.mp3
Save to: public/audio/generated-1707523200.mp3
```

**Beat Detection Process**:
```typescript
// 1. Decode MP3 to raw PCM using FFmpeg
execSync('ffmpeg -i generated-xxx.mp3 -f f32le -acodec pcm_f32le -ac 1 -ar 44100 output.pcm');

// 2. Read PCM data as Float32Array
const pcmBuffer = fs.readFileSync('output.pcm');
const audioData = new Float32Array(pcmBuffer.buffer);

// 3. Analyze with music-tempo library
import MusicTempo from 'music-tempo';
const analysis = MusicTempo(audioData);

// Result: {
//   tempo: 128,  // BPM
//   beats: [0, 0.468, 0.937, 1.406, 1.875, ...]  // timestamps in seconds
// }

// 4. Convert to milliseconds and frame numbers
const beatTimes = analysis.beats.map(sec => Math.round(sec * 1000));
// [0, 468, 937, 1406, 1875, ...] ms

const beatFrames = beatTimes.map(ms => Math.round((ms / 1000) * 30));
// [0, 14, 28, 42, 56, ...] frames @ 30fps

// Return all beat data
return {
  audioFile: "generated-1707523200.mp3",
  durationMs: 12000,
  bpm: 128,
  beatTimes: [0, 468, 937, 1406, ...],
  beatFrames: [0, 14, 28, 42, ...]
};
```

**Why beat detection is critical**:
- Amateur videos ignore music rhythm
- Professional ones hit beats with animations
- Syncing to beats makes videos feel polished and intentional

---

### Step 3: Claude Code Generates React Code

**This is the creative work** - Claude Code (the AI assistant) generates a complete React/Remotion component.

**Input data** (from Steps 1 & 2):
```typescript
{
  // From extract_page_data:
  title: "Stripe",
  tagline: "Payment infrastructure for the internet",
  features: [{ title: "Payments", desc: "..." }],
  colors: { primary: "#635BFF", secondary: "#0A2540", ... },
  fonts: { heading: "Söhne", body: "Helvetica" },

  // From generate_audio:
  audioFile: "generated-1707523200.mp3",
  bpm: 128,
  beatFrames: [0, 14, 28, 42, 56, 70, ...]
}
```

**Generated React code** (self-contained, all data baked in):
```typescript
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring } from "remotion";

export default function GeneratedVideo() {
  const frame = useCurrentFrame();

  // HARDCODED DATA from extraction (no runtime fetching!)
  const colors = {
    primary: "#635BFF",
    secondary: "#0A2540",
    tertiary: "#FF6B6B",
    background: "#FFFFFF"
  };

  const fonts = {
    heading: "Söhne, sans-serif",
    body: "Helvetica, sans-serif"
  };

  // HARDCODED BEAT FRAMES from audio analysis
  const beatFrames = [0, 14, 28, 42, 56, 70, 84, 98, 112, 126, 140];

  // Beat detection helpers
  const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);
  const nearestBeat = beatFrames.reduce((prev, curr) =>
    Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev
  );
  const beatProgress = (frame - nearestBeat) / 14; // 0-1 between beats
  const pulseScale = 1 + Math.sin(beatProgress * Math.PI * 2) * 0.05;

  return (
    <AbsoluteFill style={{ background: colors.background }}>

      {/* Scene 1: Intro - starts at beat 0 */}
      <Sequence from={beatFrames[0]} durationInFrames={90}>
        <AbsoluteFill style={{
          justifyContent: "center",
          alignItems: "center",
          background: \`linear-gradient(135deg, \${colors.background}, \${colors.primary}10)\`
        }}>
          {/* Background orb with beat pulse */}
          <div style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: \`radial-gradient(circle, \${colors.primary}40, transparent)\`,
            transform: \`scale(\${pulseScale})\`,
            filter: "blur(60px)"
          }} />

          {/* Product title with gradient */}
          <div style={{
            fontSize: 140,
            fontWeight: 900,
            fontFamily: fonts.heading,
            background: \`linear-gradient(90deg, \${colors.primary}, \${colors.tertiary})\`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: \`scale(\${spring({ frame, fps: 30, config: { damping: 200 } })})\`,
            textShadow: \`0 0 80px \${colors.primary}60\`
          }}>
            Stripe
          </div>

          {/* Tagline in glassmorphism container */}
          <div style={{
            marginTop: 40,
            padding: "20px 50px",
            background: \`\${colors.primary}10\`,
            backdropFilter: "blur(20px)",
            borderRadius: 20,
            border: \`2px solid \${colors.primary}30\`,
            opacity: interpolate(frame, [30, 50], [0, 1]),
            transform: \`translateY(\${interpolate(frame, [30, 50], [30, 0])}px)\`
          }}>
            <div style={{
              fontSize: 42,
              fontFamily: fonts.body,
              color: colors.secondary,
              fontWeight: 600
            }}>
              Payment infrastructure for the internet
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Features - starts at beat 6 */}
      <Sequence from={beatFrames[6]} durationInFrames={120}>
        <AbsoluteFill style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 8%"
        }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: fonts.heading,
            color: colors.primary,
            marginBottom: 80,
            textShadow: \`0 0 40px \${colors.primary}40\`
          }}>
            What You Can Do
          </div>

          {/* Feature cards with staggered beat entrances */}
          {[
            { title: "Payments", emoji: "💳", desc: "Accept payments globally" },
            { title: "Billing", emoji: "📊", desc: "Recurring revenue made simple" },
            { title: "Connect", emoji: "🔗", desc: "Build a marketplace" }
          ].map((feature, i) => {
            const startBeat = beatFrames[7 + i]; // Beat 7, 8, 9
            const localFrame = frame - beatFrames[6];
            const isFeatureBeat = Math.abs(frame - startBeat) < 2;

            return (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 50px",
                margin: "15px 0",
                background: \`\${colors.primary}08\`,
                backdropFilter: "blur(10px)",
                borderRadius: 24,
                border: \`2px solid \${colors.primary}20\`,
                boxShadow: \`0 10px 40px \${colors.primary}15\`,
                opacity: interpolate(localFrame, [startBeat - beatFrames[6], startBeat - beatFrames[6] + 10], [0, 1]),
                transform: \`
                  translateX(\${interpolate(localFrame, [startBeat - beatFrames[6], startBeat - beatFrames[6] + 10], [-100, 0])}px)
                  scale(\${isFeatureBeat ? 1.05 : 1})
                \`,
                transition: "transform 0.15s ease-out"
              }}>
                <span style={{ fontSize: 60 }}>{feature.emoji}</span>
                <div>
                  <div style={{
                    fontSize: 36,
                    fontFamily: fonts.heading,
                    color: colors.secondary,
                    fontWeight: 700
                  }}>
                    {feature.title}
                  </div>
                  <div style={{
                    fontSize: 24,
                    fontFamily: fonts.body,
                    color: colors.secondary,
                    opacity: 0.7
                  }}>
                    {feature.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: CTA - starts at beat 10 */}
      <Sequence from={beatFrames[10]} durationInFrames={60}>
        <AbsoluteFill style={{
          justifyContent: "center",
          alignItems: "center",
          background: \`radial-gradient(circle, \${colors.primary}05, \${colors.background})\`
        }}>
          <div style={{
            fontSize: 96,
            fontWeight: 900,
            fontFamily: fonts.heading,
            color: colors.primary,
            textShadow: \`0 0 60px \${colors.primary}60\`
          }}>
            Start Building
          </div>

          {/* CTA button with beat pulse */}
          <div style={{
            marginTop: 60,
            padding: "25px 80px",
            background: \`linear-gradient(135deg, \${colors.primary}, \${colors.tertiary})\`,
            color: "#ffffff",
            fontSize: 42,
            fontWeight: 700,
            fontFamily: fonts.body,
            borderRadius: 60,
            transform: \`scale(\${isBeat ? 1.08 : 1})\`,
            boxShadow: \`0 20px 60px \${colors.primary}60, 0 0 100px \${colors.tertiary}40\`,
            filter: \`brightness(\${isBeat ? 1.2 : 1})\`,
            transition: "all 0.15s ease-out"
          }}>
            Get Started →
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}
```

**Key principles**:
1. ✅ All data is BAKED IN (colors, fonts, content, beats) - no runtime fetching
2. ✅ Beat frames hardcoded from audio analysis
3. ✅ Animations synchronized to beats (pulse, entrance, transitions)
4. ✅ Modern UI: glassmorphism, gradients, glows, shadows
5. ✅ Smooth animations with interpolate() and spring()
6. ✅ Self-contained - Remotion can render without external dependencies

---

### Step 4: Render Video (MCP Tool)

**What it does**:
- Saves React code to `src/remotion/compositions/GeneratedVideo.tsx`
- Rebuilds TypeScript (`npm run build`)
- Bundles with Remotion (Webpack)
- Renders frames in headless browser
- Encodes to MP4 with FFmpeg

**Rendering process**:
```typescript
// 1. Save React code
fs.writeFileSync("src/remotion/compositions/GeneratedVideo.tsx", reactCode);

// 2. Rebuild TypeScript
execSync("npm run build");

// 3. Bundle Remotion project
const bundleLocation = await bundle({
  entryPoint: "dist/remotion/index.js",
  publicDir: "public"
});

// 4. Select composition
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "GeneratedVideo",
  inputProps: {}
});

// 5. Render frames
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "./out/stripe-video.mp4",
  inputProps: {},
  audioFile: "public/audio/generated-1707523200.mp3"
});

// FFmpeg encodes:
// - 360 frames (PNG images) @ 30fps
// + Audio track (generated-xxx.mp3)
// → H.264 MP4, 1920x1080, 12 seconds
```

**Output**: `./out/stripe-video.mp4`
- 1920x1080 HD resolution
- 30fps
- 12-15 seconds duration
- AI-generated music with beat-synced animations
- Accurate brand colors and fonts from real website

---

## Why This Architecture Works

### Traditional Approach (Doesn't Scale):
```
User → External AI API (Gemini/Claude) → React code → Render
```
**Problems**:
- AI APIs truncate long code
- Miss context and best practices
- Require expensive API keys
- Inconsistent quality

### MCP + Skill Approach (Superior):
```
User → Claude Code → MCP tools + Self-generated code → Render
```
**Benefits**:
- ✅ Claude Code sees FULL context (skill guidelines, extracted data, beat analysis)
- ✅ No code truncation (can generate 500+ lines if needed)
- ✅ No external AI API keys needed (only TabStack + WaveSpeed)
- ✅ Consistent quality (follows skill best practices every time)
- ✅ Can iterate and refine based on results
- ✅ Perfect beat synchronization (audio analysis → hardcoded beat frames)

---

## Beat Synchronization Magic

**The secret to professional videos**: Everything hits on the beat.

```
Audio timeline:
|───────|───────|───────|───────|───────|───────|
0ms    468ms   937ms  1406ms  1875ms  2343ms  ...
Beat 1  Beat 2  Beat 3  Beat 4  Beat 5  Beat 6

Video timeline @ 30fps:
|────|────|────|────|────|────|
0     14    28    42    56    70    ... frames

Scene starts:    Beat 1 (frame 0)
Feature 1 enters: Beat 3 (frame 28)
Feature 2 enters: Beat 4 (frame 42)
Feature 3 enters: Beat 5 (frame 56)
Scene transition: Beat 6 (frame 70)
CTA button pulses: Every beat
```

**Result**: Animations feel intentional, professional, and satisfying - like they were hand-crafted by a video editor.

---

## Summary

1. **TabStack** extracts page content using AI
2. **Playwright** extracts exact brand colors/fonts from CSS
3. **WaveSpeed** generates AI music with beat analysis
4. **Claude Code** generates React code with all data baked in + beat sync
5. **Remotion** renders frames and encodes to MP4

**No external AI APIs for code generation** - Claude Code does it all!

**Result**: Premium product videos with:
- ✅ Accurate brand colors and fonts
- ✅ Modern UI (glassmorphism, gradients, glows)
- ✅ Professional animations synced to music beats
- ✅ 12-15 seconds, 1920x1080, 30fps
- ✅ Generated in minutes, not days
