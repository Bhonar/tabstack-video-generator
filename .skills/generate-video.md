# Generate Product Video Skill

**Trigger**: User asks to generate a video for a URL (e.g., "Generate a video for https://stripe.com", "Make a launch video for tabstack.ai")

**Description**: Generate a premium product launch video from any landing page using TabStack MCP tools + your React/Remotion code generation skills.

---

## Workflow

### Step 1: Extract Page Data
Call the `extract_page_data` MCP tool to get:
- Page content (title, tagline, features, pricing, stats)
- Brand colors (primary, secondary, tertiary, background)
- Brand fonts (heading, body)
- Logo URL
- Screenshot (optional)

```typescript
// MCP tool call
extract_page_data({ url: "https://example.com" })
```

**Output**: JSON with all extracted data

---

### Step 2: Generate React/Remotion Video Code

**This is where YOU (Claude Code) do the creative work!**

Generate a complete React/Remotion component with:

#### Required Structure:
```typescript
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring } from "remotion";

export default function GeneratedVideo() {
  const frame = useCurrentFrame();

  // Use EXACT brand colors from extraction
  const colors = {
    primary: "#extracted-primary",
    secondary: "#extracted-secondary",
    tertiary: "#extracted-tertiary",
    background: "#extracted-background",
  };

  const fonts = {
    heading: "Extracted Heading Font, system-ui, sans-serif",
    body: "Extracted Body Font, system-ui, sans-serif",
  };

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      {/* 4-6 scenes using Sequence */}
    </AbsoluteFill>
  );
}
```

#### Scene Planning (Total: 12-15 seconds = 360-450 frames at 30fps)

**Scene 1: Intro (0-90 frames, 3 seconds)**
- Product title with dramatic entrance
- Tagline fade-in below
- Use spring() for bounce effect
- Large, bold typography

**Scene 2: Hook/Problem (90-180 frames, 3 seconds)**
- Value proposition or problem statement
- Fade in with slide animation
- Center-aligned, impactful text

**Scene 3: Features (180-300 frames, 4 seconds)**
- Feature cards or list with icons/emojis
- Staggered animations (each feature enters 10-15 frames apart)
- Use interpolate() for smooth transitions

**Scene 4: Results/Benefits (300-360 frames, 2 seconds)**
- Stats, social proof, or results
- Animated numbers or highlights

**Scene 5: CTA (360-450 frames, 3 seconds)**
- Clear call-to-action
- Button with hover/pulse effect
- Product URL or "Get Started" message

---

### Step 3: Design Best Practices

#### ✅ DO:

**Modern UI Components:**
```typescript
// Glassmorphism card
<div style={{
  background: `${colors.primary}20`,
  backdropFilter: "blur(20px)",
  borderRadius: 24,
  border: `2px solid ${colors.primary}40`,
  padding: "40px 60px",
  boxShadow: `0 20px 60px ${colors.primary}30`,
}}>

// Gradient background
background: `linear-gradient(135deg, ${colors.primary}, ${colors.tertiary})`,

// Animated gradient
background: `linear-gradient(
  ${interpolate(frame, [0, 90], [0, 360])}deg,
  ${colors.primary},
  ${colors.tertiary}
)`,

// Text gradient
background: `linear-gradient(90deg, ${colors.primary}, ${colors.tertiary})`,
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent",

// Glow effect
boxShadow: `0 0 80px ${colors.primary}, 0 0 40px ${colors.tertiary}`,
textShadow: `0 0 40px ${colors.primary}, 0 4px 20px ${colors.tertiary}80`,
```

**Rich Animations:**
```typescript
// Smooth fade + slide
opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
transform: `translateY(${interpolate(frame, [0, 30], [50, 0], { extrapolateRight: "clamp" })}px)`,

// Spring bounce
transform: `scale(${spring({ frame, fps: 30, config: { damping: 200, stiffness: 100 } })})`,

// Stagger effect for lists
const delay = baseDelay + index * 15;
const localFrame = frame - delay;
opacity: interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp" }),

// Parallax
transform: `translateY(${interpolate(frame, [0, 360], [0, -100])}px)`,

// Rotation
transform: `rotate(${interpolate(frame, [0, 90], [0, 360])}deg)`,

// Pulse effect
transform: `scale(${1 + Math.sin(frame * 0.1) * 0.05})`,
```

**Typography Hierarchy:**
```typescript
// Hero title
fontSize: 120,
fontWeight: 900,
lineHeight: 1.1,

// Section headings
fontSize: 64,
fontWeight: 700,
letterSpacing: "-0.02em",

// Body text
fontSize: 32,
fontWeight: 400,
lineHeight: 1.5,

// Small text
fontSize: 24,
opacity: 0.8,
```

#### ❌ DON'T:

- Don't use generic colors like "#4F46E5" - use EXACT extracted brand colors
- Don't create plain centered text - add backgrounds, containers, effects
- Don't use static layouts - everything should animate
- Don't skip glassmorphism, gradients, shadows - these make it premium
- Don't make scenes too long (max 4 seconds each)
- Don't use tiny fonts (minimum 24px)
- Don't forget to use extracted fonts

---

### Step 4: Call render_video Tool

```typescript
render_video({
  reactCode: generatedCode,
  durationInFrames: 360, // 12 seconds
  audioFile: "generated-music.mp3", // if audio was generated
  outputPath: "./out/product-name-video.mp4"
})
```

---

## Optional: Generate AI Music (HIGHLY RECOMMENDED)

Call `generate_audio` to create beat-synced background music:

```typescript
const audio = await generate_audio({
  prompt: "Instrumental epic corporate trailer, 128 BPM, precise kick on every beat, dramatic build, modern synths, clean production",
  lyrics: `[Verse 1]
${product.title}
${product.tagline}

[Chorus]
${mainFeature}
${valueProposition}

[Bridge]
Transform your workflow`
});

// Returns: {
//   audioFile: "generated-1707523200.mp3",
//   durationMs: 12000,
//   bpm: 128,
//   beatTimes: [0, 468, 937, 1406, 1875, ...], // ms
//   beatFrames: [0, 14, 28, 42, 56, ...]        // frames @ 30fps
// }
```

**Beat Synchronization is CRITICAL** - Use `beatFrames` to sync animations to music:

```typescript
// In your React code:
const beatFrames = [0, 14, 28, 42, 56, 70, 84, 98, ...]; // from audio analysis

// Method 1: Instant beat hit
const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);

// Method 2: Smooth pulse between beats
const nearestBeat = beatFrames.reduce((prev, curr) =>
  Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev
);
const framesSinceLastBeat = frame - nearestBeat;
const framesPerBeat = 14; // @ 128 BPM, 30fps
const beatProgress = framesSinceLastBeat / framesPerBeat; // 0-1
const pulseScale = 1 + Math.sin(beatProgress * Math.PI * 2) * 0.05;

// Apply to elements:
<div style={{
  // Snap to beat (instant)
  transform: `scale(${isBeat ? 1.1 : 1})`,
  boxShadow: isBeat ? `0 0 60px ${colors.primary}` : `0 0 20px ${colors.primary}40`,

  // OR smooth pulse wave
  transform: `scale(${pulseScale})`,

  transition: "transform 0.1s ease-out"
}}>
```

### Beat Sync Strategies:

**1. Start scenes on major beats:**
```typescript
<Sequence from={beatFrames[0]} durationInFrames={90}>Scene 1</Sequence>
<Sequence from={beatFrames[6]} durationInFrames={90}>Scene 2</Sequence>
<Sequence from={beatFrames[12]} durationInFrames={90}>Scene 3</Sequence>
```

**2. Stagger features on beats:**
```typescript
features.map((feature, i) => {
  const startBeat = beatFrames[2 + i]; // Beat 3, 4, 5, 6...
  return (
    <div style={{
      opacity: interpolate(frame, [startBeat, startBeat + 8], [0, 1]),
      transform: `scale(${Math.abs(frame - startBeat) < 2 ? 1.1 : 1})` // Hit on entrance
    }}>
      {feature.title}
    </div>
  );
})
```

**3. CTA button pulses on every beat:**
```typescript
<div style={{
  transform: `scale(${isBeat ? 1.08 : 1})`,
  filter: `brightness(${isBeat ? 1.2 : 1})`,
  transition: "all 0.15s ease-out"
}}>
  Get Started →
</div>
```

**4. Background elements drift on beat:**
```typescript
// Orb moves 20px on every beat
const beatCount = beatFrames.filter(b => b <= frame).length;
transform: `translateX(${beatCount * 20}px)`,
```

**Note**: Requires WAVESPEED_API_KEY. If not available, video renders with static audio or silently. **Always use AI music for production videos** - the beat sync makes them feel professional.

---

## Example Output

For a URL like https://stripe.com, you should generate:

1. **Scene 1**: "Stripe" title with purple gradient glow, spring animation
2. **Scene 2**: "Payment infrastructure for the internet" with slide-in
3. **Scene 3**: Feature cards (Payments, Billing, Connect, etc.) staggered
4. **Scene 4**: Revenue stats with animated numbers
5. **Scene 5**: "Get Started" CTA button with glow effect

**Total**: 12-15 seconds, 1920x1080, 30fps, modern UI, smooth animations

---

## Quality Checklist

Before calling render_video, verify your code has:
- ✅ Exact brand colors (not hardcoded defaults)
- ✅ Extracted fonts used throughout
- ✅ At least 4 scenes with clear purpose
- ✅ Glassmorphism or gradient backgrounds
- ✅ Smooth animations with interpolate() and spring()
- ✅ Staggered entrance effects for lists
- ✅ Text shadows and glow effects
- ✅ Large, readable typography (minimum 24px)
- ✅ Professional spacing and layout
- ✅ Total duration 12-15 seconds (360-450 frames)

---

## Error Handling

If extract_page_data fails:
- Try extracting again with retry
- If still fails, ask user for manual data

If render_video fails:
- Check TypeScript syntax
- Verify all Remotion imports
- Ensure "export default function GeneratedVideo()"
- Check for common errors (extrapolate vs extrapolateRight)

---

## Tips

1. **Start with the data**: Always look at what features, benefits, stats were extracted
2. **Match the brand**: Use their exact colors and fonts - this makes it feel authentic
3. **Tell a story**: Intro → Problem → Solution → CTA
4. **Make it dynamic**: Every element should move or fade in
5. **Use the space**: 1920x1080 is huge - don't just center small text
6. **Think premium**: Gradients, glass effects, shadows, glows - these make it look expensive
7. **Test the timing**: 3 seconds per scene is a good baseline
8. **Less text, more impact**: Keep each scene focused on one message

---

## Success Criteria

The video should:
- Look like it was made by a professional designer
- Use the brand's actual colors and fonts
- Have smooth, premium animations
- Tell a clear story about the product
- Be 12-15 seconds long
- Export as 1920x1080 MP4 at 30fps

**Remember**: You're generating React code that creates a premium product video. Make it stunning!
