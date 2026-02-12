# TabStack Video Generator Skill

Generate professional product launch videos from landing page URLs using AI-powered creative direction.

## Overview

This skill combines TabStack's web extraction, WaveSpeed's AI music generation, and Remotion's video rendering to create dramatic 10-15 second product videos from any landing page URL.

## Available Tools

The MCP server provides these tools:

### 1. `extract_page_data`
Extracts structured data from a landing page URL.

**Input:**
```json
{
  "url": "https://example.com"
}
```

**Output:**
```json
{
  "title": "Product Name",
  "tagline": "Product tagline",
  "description": "Product description",
  "features": ["Feature 1", "Feature 2"],
  "colors": {
    "primary": "#4F46E5",
    "secondary": "#E0E7FF",
    "background": "#FFFFFF"
  },
  "logoUrl": "https://...",
  "productUrl": "https://..."
}
```

### 2. `generate_audio`
Creates AI-generated background music.

**Input:**
```json
{
  "prompt": "Instrumental epic trailer, 128 BPM, precise kick every beat, dramatic energy",
  "lyrics": "[Verse 1]\\nProduct-specific lyrics...\\n\\n[Chorus]\\nCatchy line...",
  "duration": 12
}
```

**Output:**
```json
{
  "audioFile": "path/to/generated-audio.mp3",
  "duration": 12.5
}
```

### 3. `render_video`
Renders a Remotion video from React code.

**Input:**
```json
{
  "reactCode": "import { AbsoluteFill, useCurrentFrame } from 'remotion'; export default function Video() { ... }",
  "durationInFrames": 360,
  "audioFile": "path/to/audio.mp3",
  "outputPath": "./out/video.mp4"
}
```

**Output:**
```json
{
  "videoPath": "./out/video.mp4",
  "duration": 12.0
}
```

## Workflow

When a user asks to generate a video from a URL, follow these steps:

### Step 1: Extract Page Data
```
Use extract_page_data to get structured data from the URL.
Analyze the colors, features, and branding.
```

### Step 2: Design Creative Vision
Based on the extracted data, design a dramatic video narrative:

**Video Structure (10-15 seconds total):**
1. **Hook (2-2.5s):** Brand logo + name with explosive entrance
2. **Problem (2-2.5s):** The pain point the product solves
3. **Solution (2.5-3s):** Key features with varied animations
4. **Results (2s, optional):** Stats/metrics if available
5. **CTA (1.5-2s):** Call to action

**Animation Principles:**
- VARIED: Never repeat the same animation pattern
- BEAT-SYNCED: Transitions land on musical beats (128 BPM = every ~15 frames)
- DRAMATIC: Explosive zooms, slams, bounces, rotates, slides
- EXACT COLORS: Use the extracted brand colors precisely

**Example animations:**
- Logo: Explosive zoom from 30% to 100% with elastic bounce
- Brand name: Slam down from top with overshoot
- Features: First slides from left, second rotates in, third bounces from bottom
- Stats: Counter animation from 0 to final value
- Transitions: Diagonal wipes, radial blurs, grid reveals, splits

### Step 3: Generate Music Prompt
Create a music prompt emphasizing PRECISE BEATS for transition sync:

**Format:** "Instrumental [style], 128 BPM, precise kick drum every beat, [energy]"

**Example:** "Instrumental epic trailer, 128 BPM, precise kick every beat, heavy bass hits, dramatic energy"

Write product-specific lyrics with [Verse 1], [Chorus] structure.

### Step 4: Generate Audio (if WaveSpeed available)
```
Use generate_audio with the music prompt and lyrics.
Duration should match video length (10-15 seconds).
```

### Step 5: Write React Video Code
Generate a SELF-CONTAINED Remotion component with ALL data baked in - NO PROPS!

**CRITICAL: The component must be completely self-contained:**
- NO props or interfaces
- ALL colors hardcoded from the extracted data
- ALL text content embedded directly in the code
- Audio file path (if any) hardcoded from Step 4

**Required structure:**
```typescript
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
  Img,
  Audio
} from "remotion";

export default function ProductLaunchVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // All colors from extracted data - EXACT hex codes
  const BRAND_PRIMARY = "#4F46E5";  // From extract_page_data
  const BRAND_SECONDARY = "#E0E7FF";
  const BRAND_BACKGROUND = "#FFFFFF";
  const BRAND_TEXT = "#0F172A";

  // Scene timings (beat-synced at 128 BPM = ~15 frames per beat)
  const HOOK_START = 0;
  const HOOK_END = 60;
  const PROBLEM_START = 60;
  const PROBLEM_END = 135;
  // ... etc

  // All content from extracted data - baked in
  const BRAND_NAME = "Tabstack";
  const TAGLINE = "Web Browsing for AI Systems";
  const LOGO_URL = "https://tabstack.ai/images/icons/logo.svg";

  // Animations with spring configs
  const logoProgress = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200 }
  });

  const logoScale = interpolate(logoProgress, [0, 1], [0.3, 1]);

  return (
    <AbsoluteFill style={{ background: BRAND_BACKGROUND }}>
      <Audio src="public/audio/generated-123.mp3" />  {/* Hardcode from Step 4 */}

      {/* Hook Scene */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_END - HOOK_START}>
        {/* Logo with explosive zoom */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${logoScale})`
        }}>
          {/* Logo and brand elements */}
        </div>
      </Sequence>

      {/* Problem Scene */}
      <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_END - PROBLEM_START}>
        {/* Problem headline and pain points */}
      </Sequence>

      {/* ... more scenes */}
    </AbsoluteFill>
  );
}
```

**Critical requirements:**
- Use EXACT brand colors from extracted data
- Implement VARIED animations (no repetition)
- Time transitions to beats (every ~15 frames at 128 BPM)
- Make it DRAMATIC and EXCITING
- Total duration: 300-450 frames (10-15 seconds)

### Step 6: Render Video
```
Use render_video with:
- The React code you generated
- Total duration in frames
- Audio file path (if generated)
- Output path for the MP4
```

### Step 7: Return Result
Tell the user the video is ready and provide the path.

## Example Conversation

**User:** "Generate a video for https://tabstack.ai"

**You:**
1. Call `extract_page_data` with the URL
2. Analyze the data (brand: Tabstack, colors: indigo, features: Extract, Automate, Research)
3. Design creative vision with varied animations
4. Call `generate_audio` with epic trailer music + product-specific lyrics
5. Write complete React code implementing the creative vision
6. Call `render_video` with the React code and audio
7. Return: "✅ Video generated! Saved to ./out/video.mp4"

## Tips

- **Be creative!** Each video should feel unique with varied animations
- **Use exact colors** from the extracted data
- **Sync to beats** - transitions every ~15 frames (128 BPM)
- **Keep it short** - 10-15 seconds total
- **Make it dramatic** - explosive zooms, slams, bounces
- **Product-specific** - use actual product name and features in animations and lyrics
