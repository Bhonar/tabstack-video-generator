# Generate Product Video Skill

**Trigger**: User asks to generate a video for a URL (e.g., "Generate a video for https://stripe.com", "Make a launch video for tabstack.ai")

**Description**: Generate professional product videos from landing page URLs using complete Remotion best practices. Extract brand context via TabStack + Playwright, generate AI music, then create beat-synced videos with modern animations.

---

## Workflow Overview

### Step 1: Extract Page Context (MANDATORY)

Call `extract_page_data` MCP tool:

```typescript
const pageData = await extract_page_data({ url: "https://example.com" });

// Returns:
// {
//   title, tagline, features[], pricing[], stats[],
//   colors: { primary, secondary, tertiary, background }, // via Playwright
//   fonts: { heading, body },                             // via Playwright
//   logoUrl, screenshotUrl
// }
```

**How it works:**
- **TabStack API**: Extracts structured content (title, features, pricing, stats)
- **Playwright**: Launches headless Chrome, executes `window.getComputedStyle()` for exact CSS colors/fonts

### Step 2: Generate AI Music (MANDATORY)

Call `generate_audio` - **REQUIRED**, not optional:

```typescript
const audio = await generate_audio({
  prompt: "Instrumental epic dramatic trailer, 128 BPM, STRONG kick drum on every beat, cinematic build",
  lyrics: `[Intro]\n${pageData.title}\n\n[Verse 1]\n${pageData.tagline}...`
});

// Returns: { audioFile, fileName, durationMs, bpm, beatTimes[], beatFrames[] }
```

**If `WAVESPEED_API_KEY` not set → FAIL with error**

### Step 3: Generate React/Remotion Code

Generate complete React component using:
- Exact brand colors/fonts from `pageData`
- Page content (title, tagline, features, stats, pricing)
- Beat frames for synchronization
- ALL Remotion best practices below

### Step 4: Render Video

```typescript
await render_video({
  reactCode: generatedCode,
  durationInFrames: 900,
  audioFile: audio.fileName,
  outputPath: "./out/video.mp4"
});
```

---

# Complete Remotion Reference

## 1. Core Concepts

### 1.1 Compositions

Define video settings in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { MyComponent } from "./MyComponent";

export const RemotionRoot = () => {
  return (
    <Composition
      id="GeneratedVideo"
      component={MyComponent}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ title: "Hello" }}
    />
  );
};
```

**Default Props:**

```tsx
<Composition
  id="MyComp"
  component={MyComp}
  durationInFrames={100}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{
    title: "Hello World",
    color: "#ff0000",
  } satisfies MyCompositionProps}
/>
```

Use `type` (not `interface`) for props to ensure type safety.

**Folders:** Organize compositions in sidebar:

```tsx
import { Folder, Composition } from "remotion";

<Folder name="Marketing">
  <Composition id="Promo" /* ... */ />
  <Composition id="Ad" /* ... */ />
</Folder>
```

**Stills:** Single-frame images (no `durationInFrames` or `fps`):

```tsx
import { Still } from "remotion";

<Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
```

### 1.2 Calculate Metadata

Dynamically set duration/dimensions/props:

```tsx
import { CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props, abortSignal }) => {
  const data = await fetch(`https://api.example.com/${props.id}`, { signal: abortSignal });
  const json = await data.json();

  return {
    durationInFrames: Math.ceil(json.duration * 30),
    width: json.width,
    height: json.height,
    props: { ...props, fetchedData: json },
  };
};

<Composition
  id="MyComp"
  component={MyComp}
  durationInFrames={300} // Placeholder, will be overridden
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ id: "abc123" }}
  calculateMetadata={calculateMetadata}
/>
```

Returns: `durationInFrames`, `width`, `height`, `fps`, `props`, `defaultOutName`, `defaultCodec`

---

## 2. Animations & Timing

### 2.1 Basic Animations

**ALL animations MUST use `useCurrentFrame()`. CSS transitions/animations are FORBIDDEN.**

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Write durations in seconds, multiply by fps
const opacity = interpolate(frame, [0, 2 * fps], [0, 1], {
  extrapolateRight: "clamp",
});
```

### 2.2 Interpolation

**Linear:**

```tsx
const opacity = interpolate(frame, [0, 100], [0, 1]);
```

**With clamping:**

```tsx
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

**With easing:**

```tsx
const value = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateRight: "clamp",
});
```

**Easing curves:**
- `Easing.in` / `Easing.out` / `Easing.inOut`
- `Easing.quad`, `Easing.sin`, `Easing.exp`, `Easing.circle`

**Cubic bezier:**

```tsx
const value = interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateRight: "clamp",
});
```

### 2.3 Spring Animations

Natural motion with physics:

```tsx
const scale = spring({
  frame,
  fps,
  config: { damping: 200 }, // Smooth, no bounce
});
```

**Common configs:**

```tsx
const smooth = { damping: 200 }; // Subtle reveals
const snappy = { damping: 20, stiffness: 200 }; // UI elements
const bouncy = { damping: 8 }; // Playful animations
const heavy = { damping: 15, stiffness: 80, mass: 2 }; // Slow, small bounce
```

**With delay:**

```tsx
const entrance = spring({
  frame: frame - DELAY,
  fps,
  delay: 20,
});
```

**Fixed duration:**

```tsx
const progress = spring({
  frame,
  fps,
  durationInFrames: 40,
});
```

**Combined with interpolate:**

```tsx
const springProgress = spring({ frame, fps });
const rotation = interpolate(springProgress, [0, 1], [0, 360]);

<div style={{ rotate: rotation + "deg" }} />
```

**Adding springs (fade in + out):**

```tsx
const inAnimation = spring({ frame, fps });
const outAnimation = spring({
  frame,
  fps,
  durationInFrames: 1 * fps,
  delay: durationInFrames - 1 * fps,
});
const scale = inAnimation - outAnimation;
```

### 2.4 Text Animations

**Typewriter Effect:**

Use string slicing (NOT per-character opacity):

```tsx
const frame = useCurrentFrame();
const text = "Hello World";
const charsToShow = Math.floor(interpolate(frame, [0, 60], [0, text.length]));
const displayText = text.slice(0, charsToShow);

<div>{displayText}</div>
```

**Word Highlighting:**

See [text-animations asset files](assets/text-animations-word-highlight.tsx) in Remotion best practices.

---

## 3. Sequencing & Transitions

### 3.1 Sequence Component

Delay when elements appear:

```tsx
import { Sequence } from "remotion";

const { fps } = useVideoConfig();

<Sequence from={1 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Title />
</Sequence>
```

**Always premount sequences:**

```tsx
<Sequence from={2 * fps} premountFor={1 * fps}>
  <Subtitle />
</Sequence>
```

**Layout prop:**

```tsx
<Sequence layout="none">
  <Title />
</Sequence>
```

**Inside Sequence, `useCurrentFrame()` returns local frame (starts at 0):**

```tsx
<Sequence from={60} durationInFrames={30}>
  <MyComponent /> {/* useCurrentFrame() returns 0-29, not 60-89 */}
</Sequence>
```

**Nested sequences:**

```tsx
<Sequence from={0} durationInFrames={120}>
  <Background />
  <Sequence from={15} durationInFrames={90} layout="none">
    <Title />
  </Sequence>
  <Sequence from={45} durationInFrames={60} layout="none">
    <Subtitle />
  </Sequence>
</Sequence>
```

### 3.2 Series Component

Sequential playback without overlap:

```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={45}>
    <Intro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={60}>
    <MainContent />
  </Series.Sequence>
  <Series.Sequence durationInFrames={30}>
    <Outro />
  </Series.Sequence>
</Series>
```

**With overlaps (negative offset):**

```tsx
<Series>
  <Series.Sequence durationInFrames={60}>
    <SceneA />
  </Series.Sequence>
  <Series.Sequence offset={-15} durationInFrames={60}>
    <SceneB /> {/* Starts 15 frames before SceneA ends */}
  </Series.Sequence>
</Series>
```

### 3.3 TransitionSeries

Professional scene transitions:

```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>

  {/* Fade transition */}
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />

  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>

  {/* Slide transition */}
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={springTiming({ config: { damping: 200 } })}
  />

  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneC />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Directions:** `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`

**Overlays (light leaks):**

```tsx
import { LightLeak } from "@remotion/light-leaks";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Overlay durationInFrames={30}>
    <LightLeak seed={5} hueShift={240} />
  </TransitionSeries.Overlay>
  <TransitionSeries.Sequence durationInFrames={60}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Duration calculation:** Transitions overlap scenes, shortening total:
- Without: `60 + 60 = 120` frames
- With 15-frame transition: `60 + 60 - 15 = 105` frames

### 3.4 Trimming

**Trim beginning (negative `from`):**

```tsx
<Sequence from={-0.5 * fps}>
  <MyAnimation /> {/* First 15 frames trimmed */}
</Sequence>
```

**Trim end (`durationInFrames`):**

```tsx
<Sequence durationInFrames={1.5 * fps}>
  <MyAnimation /> {/* Plays 45 frames, then unmounts */}
</Sequence>
```

**Trim and delay:**

```tsx
<Sequence from={30}>
  <Sequence from={-15}>
    <MyAnimation />
  </Sequence>
</Sequence>
```

---

## 4. Media

### 4.1 Images

**ALWAYS use `<Img>` from `remotion`:**

```tsx
import { Img, staticFile } from "remotion";

<Img src={staticFile("photo.png")} />
<Img src="https://example.com/image.png" /> {/* Remote URLs */}
```

**FORBIDDEN:**
- Native HTML `<img>`
- Next.js `<Image>`
- CSS `background-image`

**Sizing:**

```tsx
<Img
  src={staticFile("photo.png")}
  style={{
    width: 500,
    height: 300,
    objectFit: "cover",
    position: "absolute",
    top: 100,
    left: 50,
  }}
/>
```

**Dynamic paths:**

```tsx
const frame = useCurrentFrame();

<Img src={staticFile(`frames/frame${frame}.png`)} /> {/* Image sequence */}
<Img src={staticFile(`avatars/${props.userId}.png`)} />
<Img src={staticFile(`icons/${isActive ? "active" : "inactive"}.svg`)} />
```

**Get dimensions:**

```tsx
import { getImageDimensions, staticFile } from "remotion";

const { width, height } = await getImageDimensions(staticFile("photo.png"));
```

### 4.2 Audio

**Prerequisites:** `npx remotion add @remotion/media`

```tsx
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

<Audio src={staticFile("audio.mp3")} />
<Audio src="https://remotion.media/audio.mp3" /> {/* Remote */}
```

**Volume (static):**

```tsx
<Audio src={staticFile("audio.mp3")} volume={0.5} />
```

**Volume (dynamic):**

```tsx
<Audio
  src={staticFile("audio.mp3")}
  volume={(f) => interpolate(f, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" })}
/>
```

**Trimming:**

```tsx
<Audio
  src={staticFile("audio.mp3")}
  trimBefore={2 * fps} // Skip first 2 seconds
  trimAfter={10 * fps} // End at 10 second mark
/>
```

**Delaying:**

```tsx
<Sequence from={1 * fps}>
  <Audio src={staticFile("audio.mp3")} />
</Sequence>
```

**Muting:**

```tsx
<Audio src={staticFile("audio.mp3")} muted={frame >= 2 * fps && frame <= 4 * fps} />
```

**Speed:**

```tsx
<Audio src={staticFile("audio.mp3")} playbackRate={2} /> {/* 2x speed */}
<Audio src={staticFile("audio.mp3")} playbackRate={0.5} /> {/* Half speed */}
```

**Looping:**

```tsx
<Audio src={staticFile("audio.mp3")} loop />
<Audio
  src={staticFile("audio.mp3")}
  loop
  loopVolumeCurveBehavior="extend"
  volume={(f) => interpolate(f, [0, 300], [1, 0])}
/>
```

**Pitch:**

```tsx
<Audio src={staticFile("audio.mp3")} toneFrequency={1.5} /> {/* Higher pitch */}
<Audio src={staticFile("audio.mp3")} toneFrequency={0.8} /> {/* Lower pitch */}
```

### 4.3 Videos

**Prerequisites:** `npx remotion add @remotion/media`

```tsx
import { Video } from "@remotion/media";
import { staticFile } from "remotion";

<Video src={staticFile("video.mp4")} />
<Video src="https://remotion.media/video.mp4" /> {/* Remote */}
```

**All props same as Audio:** `volume`, `trimBefore`, `trimAfter`, `playbackRate`, `loop`, `muted`, `toneFrequency`

**Sizing:**

```tsx
<Video
  src={staticFile("video.mp4")}
  style={{
    width: 500,
    height: 300,
    objectFit: "cover",
  }}
/>
```

### 4.4 GIFs & Animated Images

**Animated images (GIF, APNG, AVIF, WebP):**

```tsx
import { AnimatedImage, staticFile } from "remotion";

<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} />
```

**Fit options:**

```tsx
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="cover" />
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="contain" />
<AnimatedImage src={staticFile("animation.gif")} width={500} height={300} fit="fill" />
```

**Speed:**

```tsx
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} playbackRate={2} />
```

**Loop behavior:**

```tsx
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="loop" />
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="pause-after-finish" />
<AnimatedImage src={staticFile("animation.gif")} width={500} height={500} loopBehavior="clear-after-finish" />
```

**Alternative (GIF only):**

```tsx
import { Gif } from "@remotion/gif"; // npx remotion add @remotion/gif

<Gif src={staticFile("animation.gif")} width={500} height={500} />
```

**Get GIF duration:**

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";

const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
```

### 4.5 Lottie Animations

**Prerequisites:** `npx remotion add @remotion/lottie`

```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie";
import { useState, useEffect } from "react";
import { delayRender, continueRender, cancelRender } from "remotion";

const [handle] = useState(() => delayRender("Loading Lottie"));
const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

useEffect(() => {
  fetch("https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json")
    .then((data) => data.json())
    .then((json) => {
      setAnimationData(json);
      continueRender(handle);
    })
    .catch((err) => cancelRender(err));
}, [handle]);

if (!animationData) return null;

return <Lottie animationData={animationData} style={{ width: 400, height: 400 }} />;
```

---

## 5. Fonts

### 5.1 Google Fonts

**Prerequisites:** `npx remotion add @remotion/google-fonts`

```tsx
import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

<div style={{ fontFamily }}>Hello World</div>
```

**Wait for font:**

```tsx
const { fontFamily, waitUntilDone } = loadFont();
await waitUntilDone();
```

### 5.2 Local Fonts

**Prerequisites:** `npx remotion add @remotion/fonts`

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await loadFont({
  family: "MyFont",
  url: staticFile("MyFont-Regular.woff2"),
  weight: "400",
});

<div style={{ fontFamily: "MyFont" }}>Hello World</div>
```

**Multiple weights:**

```tsx
await Promise.all([
  loadFont({ family: "Inter", url: staticFile("Inter-Regular.woff2"), weight: "400" }),
  loadFont({ family: "Inter", url: staticFile("Inter-Bold.woff2"), weight: "700" }),
]);
```

---

## 6. Styling

### 6.1 Tailwind CSS

You can use Tailwind if it's installed. **NEVER use:**
- `transition-*` classes
- `animate-*` classes

Always animate with `useCurrentFrame()`.

```tsx
<div className="flex items-center justify-center">
  <h1 className="text-6xl font-bold" style={{
    color: colors.primary,
    opacity: interpolate(frame, [0, 30], [0, 1]),
  }}>
    {pageData.title}
  </h1>
</div>
```

### 6.2 Assets

Place assets in `public/` folder. **MUST use `staticFile()`:**

```tsx
import { Img, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Video } from "@remotion/media";

<Img src={staticFile("logo.png")} />
<Audio src={staticFile("music.mp3")} />
<Video src={staticFile("clip.mp4")} />
```

### 6.3 Transparent Videos

**ProRes (for video editing software):**

CLI:
```bash
npx remotion render --image-format=png --pixel-format=yuva444p10le --codec=prores --prores-profile=4444 MyComp out.mov
```

Config:
```ts
// remotion.config.ts
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuva444p10le");
Config.setCodec("prores");
Config.setProResProfile("4444");
```

**WebM (for web):**

```bash
npx remotion render --codec=vp9 --image-format=png MyComp out.webm
```

---

## 7. Advanced Features

### 7.1 3D with Three.js

**Prerequisites:** `npx remotion add @remotion/three`

```tsx
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig, useCurrentFrame } from "remotion";

const { width, height } = useVideoConfig();
const frame = useCurrentFrame();
const rotationY = frame * 0.02;

<ThreeCanvas width={width} height={height}>
  <ambientLight intensity={0.4} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <mesh rotation={[0, rotationY, 0]}>
    <boxGeometry args={[2, 2, 2]} />
    <meshStandardMaterial color="#4a9eff" />
  </mesh>
</ThreeCanvas>
```

**FORBIDDEN:** `useFrame()` from `@react-three/fiber` - causes flickering

**Sequence inside ThreeCanvas:**

```tsx
<ThreeCanvas width={width} height={height}>
  <Sequence layout="none">
    <mesh>...</mesh>
  </Sequence>
</ThreeCanvas>
```

### 7.2 Audio Visualization

**Prerequisites:** `npx remotion add @remotion/media-utils`

**Spectrum bars:**

```tsx
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";

const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
  src: staticFile("music.mp3"),
  frame,
  fps,
  windowInSeconds: 30,
});

if (!audioData) return null;

const frequencies = visualizeAudio({
  fps,
  frame,
  audioData,
  numberOfSamples: 256, // Must be power of 2
  optimizeFor: "speed",
  dataOffsetInSeconds,
});

return (
  <div style={{ display: "flex", alignItems: "flex-end", height: 200 }}>
    {frequencies.map((v, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: `${v * 100}%`,
          backgroundColor: "#0b84f3",
          margin: "0 1px",
        }}
      />
    ))}
  </div>
);
```

**Waveform:**

```tsx
import { visualizeAudioWaveform, createSmoothSvgPath } from "@remotion/media-utils";

const waveform = visualizeAudioWaveform({
  fps,
  frame,
  audioData,
  numberOfSamples: 256,
  windowInSeconds: 0.5,
  dataOffsetInSeconds,
});

const path = createSmoothSvgPath({
  points: waveform.map((y, i) => ({
    x: (i / (waveform.length - 1)) * width,
    y: HEIGHT / 2 + (y * HEIGHT) / 2,
  })),
});

<svg width={width} height={HEIGHT}>
  <path d={path} fill="none" stroke="#0b84f3" strokeWidth={2} />
</svg>
```

**Bass-reactive:**

```tsx
const frequencies = visualizeAudio({ ...config });
const lowFrequencies = frequencies.slice(0, 32);
const bassIntensity = lowFrequencies.reduce((sum, v) => sum + v, 0) / lowFrequencies.length;

const scale = 1 + bassIntensity * 0.5;
```

### 7.3 Charts

**Bar chart:**

```tsx
const bars = data.map((item, i) => {
  const height = spring({
    frame,
    fps,
    delay: i * 5, // Stagger
    config: { damping: 200 },
  });
  return <div style={{ height: height * item.value }} />;
});
```

**Pie chart:**

```tsx
const progress = interpolate(frame, [0, 100], [0, 1]);
const circumference = 2 * Math.PI * radius;
const segmentLength = (value / total) * circumference;
const offset = interpolate(progress, [0, 1], [segmentLength, 0]);

<circle
  r={radius}
  cx={center}
  cy={center}
  fill="none"
  stroke={color}
  strokeWidth={strokeWidth}
  strokeDasharray={`${segmentLength} ${circumference}`}
  strokeDashoffset={offset}
  transform={`rotate(-90 ${center} ${center})`}
/>
```

**Line chart (animated path):**

**Prerequisites:** `npx remotion add @remotion/paths`

```tsx
import { evolvePath } from "@remotion/paths";

const path = "M 100 200 L 200 150 L 300 180 L 400 100";
const progress = interpolate(frame, [0, 2 * fps], [0, 1], { extrapolateRight: "clamp" });

const { strokeDasharray, strokeDashoffset } = evolvePath(progress, path);

<path
  d={path}
  fill="none"
  stroke="#FF3232"
  strokeWidth={4}
  strokeDasharray={strokeDasharray}
  strokeDashoffset={strokeDashoffset}
/>
```

---

## 8. Utilities & Measurement

### 8.1 Measuring Text

**Prerequisites:** `npx remotion add @remotion/layout-utils`

**Get dimensions:**

```tsx
import { measureText } from "@remotion/layout-utils";

const { width, height } = measureText({
  text: "Hello World",
  fontFamily: "Arial",
  fontSize: 32,
  fontWeight: "bold",
});
```

**Fit text to width:**

```tsx
import { fitText } from "@remotion/layout-utils";

const { fontSize } = fitText({
  text: "Hello World",
  withinWidth: 600,
  fontFamily: "Inter",
  fontWeight: "bold",
});

<div style={{ fontSize: Math.min(fontSize, 80), fontFamily: "Inter", fontWeight: "bold" }}>
  Hello World
</div>
```

**Check overflow:**

```tsx
import { fillTextBox } from "@remotion/layout-utils";

const box = fillTextBox({ maxBoxWidth: 400, maxLines: 3 });

for (const word of words) {
  const { exceedsBox } = box.add({
    text: word + " ",
    fontFamily: "Arial",
    fontSize: 24,
  });
  if (exceedsBox) break;
}
```

### 8.2 Measuring DOM Nodes

```tsx
import { useCurrentScale } from "remotion";

const ref = useRef<HTMLDivElement>(null);
const scale = useCurrentScale();

useEffect(() => {
  if (!ref.current) return;
  const rect = ref.current.getBoundingClientRect();
  const actualWidth = rect.width / scale;
  const actualHeight = rect.height / scale;
}, [scale]);
```

### 8.3 FFmpeg

No install needed - use via CLI:

```bash
bunx remotion ffmpeg -i input.mp4 output.mp3
bunx remotion ffprobe input.mp4
```

**Trim videos:**

```bash
bunx remotion ffmpeg -ss 00:00:05 -i input.mp4 -to 00:00:10 -c:v libx264 -c:a aac output.mp4
```

Or use `<Video trimBefore={5 * fps} trimAfter={10 * fps} />`

### 8.4 Get Media Duration/Dimensions

**Mediabunny (works in browser, Node, Bun):**

```tsx
import { Input, ALL_FORMATS, UrlSource } from "mediabunny";

// Audio duration
const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("https://remotion.media/audio.mp3"),
});
const durationInSeconds = await input.computeDuration();

// Video dimensions
const videoTrack = await input.getPrimaryVideoTrack();
const width = videoTrack.displayWidth;
const height = videoTrack.displayHeight;

// Check if decodable
const canDecode = await videoTrack.canDecode();
```

### 8.5 Extract Frames

```tsx
import { ALL_FORMATS, Input, UrlSource, VideoSample } from "mediabunny";

export async function extractFrames({
  src,
  timestampsInSeconds,
  onVideoSample,
}: {
  src: string;
  timestampsInSeconds: number[];
  onVideoSample: (sample: VideoSample) => void;
}) {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(src),
  });
  // ... implementation
}
```

---

## 9. Captions & Subtitles

### 9.1 Caption Type

All captions use `Caption` type from `@remotion/captions`:

```tsx
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};
```

### 9.2 Transcribe Audio

**Prerequisites:** `npx remotion add @remotion/install-whisper-cpp`

```ts
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const to = path.join(process.cwd(), "whisper.cpp");

await installWhisperCpp({ to, version: "1.5.5" });
await downloadWhisperModel({ model: "medium.en", folder: to });

const { transcription } = await transcribe({
  inputPath: "/path/to/audio.wav",
  whisperPath: to,
  model: "medium.en",
});

const captions = toCaptions({ transcription });
```

### 9.3 Import SRT Files

**Prerequisites:** `npx remotion add @remotion/captions`

```tsx
import { parseSrt } from "@remotion/captions";

const response = await fetch(staticFile("subtitles.srt"));
const text = await response.text();
const { captions } = parseSrt({ input: text });
```

### 9.4 Display Captions

```tsx
import { useDelayRender } from "remotion";
import type { Caption } from "@remotion/captions";

const [captions, setCaptions] = useState<Caption[] | null>(null);
const [handle] = useState(() => delayRender("Loading captions"));

useEffect(() => {
  fetch(staticFile("captions.json"))
    .then((r) => r.json())
    .then((data) => {
      setCaptions(data);
      continueRender(handle);
    })
    .catch((e) => cancelRender(e));
}, [handle]);
```

---

## 10. Parameters (Zod Schemas)

Make videos parametrizable:

**Install Zod (MUST be version 3.22.3):**

```bash
npm i zod@3.22.3
```

**Define schema:**

```tsx
import { z } from "zod";

export const MyCompositionSchema = z.object({
  title: z.string(),
  color: z.string(),
});

type MyCompositionProps = z.infer<typeof MyCompositionSchema>;

const MyComponent: React.FC<MyCompositionProps> = ({ title, color }) => {
  return <div style={{ color }}>{title}</div>;
};
```

---

## 11. Maps (Mapbox)

**Prerequisites:**

```bash
npm i mapbox-gl @turf/turf @types/mapbox-gl
```

Get token at https://console.mapbox.com/account/access-tokens/

Add to `.env`:
```
REMOTION_MAPBOX_TOKEN=pk.your-token
```

Usage: Follow [Mapbox GL JS documentation](https://docs.mapbox.com/mapbox-gl-js/api/)

---

## 12. Beat Synchronization

**Use `beatFrames` from audio generation to sync animations:**

```tsx
const beatFrames = [0, 14, 28, 42, 56, 70, ...]; // from generate_audio

// Method 1: Instant beat hit
const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);

// Method 2: Smooth pulse
const nearestBeat = beatFrames.reduce((prev, curr) =>
  Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev
);
const beatProgress = (frame - nearestBeat) / 14;
const pulseScale = 1 + Math.sin(beatProgress * Math.PI * 2) * 0.05;

// Apply
<div style={{
  transform: `scale(${isBeat ? 1.1 : 1})`,
  transition: "transform 0.1s ease-out"
}}>Content</div>
```

**Sync scene starts:**

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence from={beatFrames[0]} durationInFrames={90}>
    <Scene1 />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition ... />
  <TransitionSeries.Sequence from={beatFrames[6]} durationInFrames={90}>
    <Scene2 />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

**Stagger features on beats:**

```tsx
{pageData.features.map((feature, i) => {
  const startBeat = beatFrames[2 + i];
  return (
    <div style={{
      opacity: interpolate(frame, [startBeat, startBeat + 15], [0, 1]),
      transform: `translateY(${interpolate(frame, [startBeat, startBeat + 15], [50, 0])}px)`
    }}>
      {feature.title}
    </div>
  );
})}
```

---

## 13. Using Extracted Context

### Colors

```tsx
const colors = {
  primary: pageData.colors.primary,
  secondary: pageData.colors.secondary,
  tertiary: pageData.colors.tertiary,
  background: pageData.colors.background,
};

<div style={{ color: colors.primary, backgroundColor: colors.background }}>
```

### Fonts

```tsx
const fonts = {
  heading: pageData.fonts.heading,
  body: pageData.fonts.body,
};

<h1 style={{ fontFamily: fonts.heading }}>Title</h1>
<p style={{ fontFamily: fonts.body }}>Body</p>
```

### Content

```tsx
<h1>{pageData.title}</h1>
<p>{pageData.tagline}</p>

{pageData.features.map((feature, i) => (
  <div key={i}>
    <h3>{feature.title}</h3>
    <p>{feature.description}</p>
  </div>
))}

{pageData.stats.map((stat, i) => (
  <div key={i}>
    <div>{stat.value}</div>
    <div>{stat.label}</div>
  </div>
))}

{pageData.pricing.map((plan, i) => (
  <div key={i}>
    <h4>{plan.name}</h4>
    <p>{plan.price}</p>
  </div>
))}
```

### Assets

```tsx
{pageData.logoUrl && <Img src={pageData.logoUrl} style={{ width: 180, height: 180 }} />}
{pageData.screenshotUrl && <Img src={pageData.screenshotUrl} style={{ width: 800, height: 600 }} />}
```

---

## Quality Checklist

Before rendering:

- ✅ Audio component included
- ✅ Extracted colors used throughout
- ✅ Extracted fonts used
- ✅ Content integrated (title, tagline, features, stats, pricing)
- ✅ Logo displayed if available
- ✅ Beat synchronization implemented
- ✅ TransitionSeries used for scene transitions
- ✅ 10-12+ scenes (no artificial limits)
- ✅ Spring animations with varied configs
- ✅ Easing functions used
- ✅ Images use `<Img>` component
- ✅ Sequences premounted
- ✅ No CSS transitions/animations
- ✅ Minimum 24px fonts
- ✅ All animations use `useCurrentFrame()`

---

## Scene Structure Example

For 30-second video (900 frames @ 30fps):

```tsx
<TransitionSeries>
  {/* Scene 1: Brand Intro (0-90) */}
  <TransitionSeries.Sequence durationInFrames={90}>
    <IntroScene {...pageData} colors={colors} fonts={fonts} />
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

  {/* Scene 2-12: Dynamic based on content */}
  {/* Add as many scenes as needed - no limits! */}
</TransitionSeries>
```

**Minimum 10-12 scenes. Add more based on content available.**

---

## Example Complete Component

```tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Audio } from "@remotion/media";
import { Img, staticFile } from "remotion";

export default function GeneratedVideo() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Extracted data
  const colors = {
    primary: "#635BFF",
    secondary: "#0A2540",
    tertiary: "#FF6B6B",
    background: "#FFFFFF",
  };

  const fonts = {
    heading: "Söhne, sans-serif",
    body: "Helvetica, sans-serif",
  };

  const beatFrames = [0, 14, 28, 42, 56, 70, 84, 98];

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <Audio src={staticFile("audio/generated-xxx.mp3")} volume={0.7} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <IntroScene colors={colors} fonts={fonts} beatFrames={beatFrames} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Add more scenes... */}
      </TransitionSeries>
    </AbsoluteFill>
  );
}

const IntroScene: React.FC<{ colors: any; fonts: any; beatFrames: number[] }> = ({
  colors,
  fonts,
  beatFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 200 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <h1 style={{
        fontFamily: fonts.heading,
        fontSize: 96,
        color: colors.primary,
        opacity: titleOpacity,
      }}>
        Hello World
      </h1>
    </AbsoluteFill>
  );
};
```

---

**Remember: This is the COMPLETE Remotion reference + context extraction. Use ALL features as needed!**
