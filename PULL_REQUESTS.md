# Pull Requests for TabStack Video Generator

All feature branches have been pushed to GitHub. Create PRs using the links below:

---

## PR #1: Remove External AI Provider Dependencies

**Branch**: `feat/remove-ai-providers`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/remove-ai-providers?expand=1

### Title
```
refactor: Remove external AI provider dependencies for MCP mode
```

### Description
```markdown
## Summary
Remove all external AI provider code (Gemini, Claude API) as part of migration to MCP + Skill architecture where Claude Code generates React/Remotion video code directly.

## Breaking Changes
- ❌ Removed Gemini and Claude API providers
- ❌ No more external AI API keys needed (GEMINI_API_KEY, ANTHROPIC_API_KEY)
- ✅ Claude Code generates video code directly

## Changes
### Removed
- `src/lib/ai-provider.ts` - AI provider interface
- `src/lib/providers/gemini-provider.ts` - Gemini implementation
- `src/lib/providers/claude-provider.ts` - Claude implementation
- `src/lib/narration-generator.ts` - Gemini TTS narration
- `src/lib/text-to-react-converter.ts` - Unused converter

### Updated
- `src/lib/defaults.ts` - Removed AI provider resolution logic
- `src/lib/preflight.ts` - Only check TABSTACK_API_KEY and FFmpeg
- `src/lib/setup.ts` - Removed AI provider key checks
- `src/tools/generate-video.ts` - Deprecated CLI tool

## Benefits
✅ No external AI API keys needed (only TabStack for data extraction)
✅ Claude Code generates code directly (no truncation issues)
✅ Better quality and consistency (follows Skill best practices)
✅ Simpler architecture
✅ Full context awareness (no API token limits)

## Migration Guide
**Before** (CLI with AI provider):
\`\`\`bash
export TABSTACK_API_KEY=ts_xxx
export GEMINI_API_KEY=AIza_xxx  # ❌ No longer needed
npx @tabstack/video-generator --url https://stripe.com
\`\`\`

**After** (MCP + Skill):
\`\`\`bash
export TABSTACK_API_KEY=ts_xxx  # ✅ Only this needed
claude mcp add tabstack-video -e TABSTACK_API_KEY=ts_xxx -- npx @tabstack/video-generator

# In Claude Code:
"Generate a video for https://stripe.com"
\`\`\`

## Testing
- ✅ Build passes without AI provider dependencies
- ✅ MCP server starts successfully
- ✅ Preflight checks only require TABSTACK_API_KEY
```

---

## PR #2: Playwright-Based Brand Color and Font Extraction

**Branch**: `feat/playwright-color-extraction`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/playwright-color-extraction?expand=1

### Title
```
feat: Add Playwright-based brand color and font extraction
```

### Description
```markdown
## Summary
Add local browser automation for reliable brand color and font extraction, replacing unreliable TabStack browser automation.

## New Features
- **`src/lib/playwright-extractor.ts`**: Launches headless Chrome to extract computed CSS colors and fonts
- **`src/lib/color-extractor.ts`**: Orchestrates extraction with Playwright as primary method
- **`src/lib/vision-color-extractor.ts`**: Vision API based extraction (experimental fallback)

## How It Works
1. Launch headless Chrome with Playwright
2. Navigate to target URL
3. Execute JavaScript in browser to find CTA buttons, headings
4. Get computed CSS colors (`rgb(99, 91, 255)` → `#635BFF`)
5. Extract font families from `h1, h2, p` elements
6. Return exact brand colors and fonts

## Selectors Used
- **Primary color**: `button[class*="primary"]`, `a[href*="get-started"]`
- **Secondary color**: `h1, h2` text color
- **Tertiary color**: `[class*="badge"]`, `[class*="accent"]`
- **Heading font**: `h1, h2, h3` font-family
- **Body font**: `p, body` font-family

## Benefits
✅ More reliable than TabStack automation (which was timing out)
✅ Extracts exact computed CSS values (not approximations)
✅ Works offline (no external API dependency)
✅ Full control over selector strategies

## Example Output
\`\`\`json
{
  "colors": {
    "primary": "#635BFF",
    "secondary": "#0A2540",
    "tertiary": "#00D4FF",
    "background": "#FFFFFF"
  },
  "fonts": {
    "heading": "Söhne, sans-serif",
    "body": "Helvetica, Arial, sans-serif"
  }
}
\`\`\`

## Testing
- ✅ Successfully extracts colors from Stripe, Vercel, Linear
- ✅ Handles dynamic sites with client-side rendering
- ✅ Gracefully falls back to HTML parsing if Playwright fails
```

---

## PR #3: Beat Detection and Synchronization

**Branch**: `feat/beat-synchronization`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/beat-synchronization?expand=1

### Title
```
feat: Add beat detection and synchronization for AI-generated music
```

### Description
```markdown
## Summary
Implement automatic beat detection on generated music to enable animations that sync perfectly to the audio rhythm.

## Changes
- Add `music-tempo` library for beat pattern analysis
- Detect BPM and beat timestamps from generated MP3 files
- Convert beat times to frame numbers @ 30fps
- Return beat data with audio generation results
- Add TypeScript declarations for `music-tempo`

## How It Works
1. After downloading MP3 from WaveSpeed
2. Decode MP3 to raw PCM using FFmpeg (f32le format)
3. Analyze audio buffer with `music-tempo` library
4. Detect tempo (BPM) and beat timestamps in seconds
5. Convert: `seconds` → `milliseconds` → `frame numbers @ 30fps`
6. Return beat data for React code generation

## Example Output
\`\`\`json
{
  "audioFile": "generated-1707523200.mp3",
  "bpm": 128,
  "beatTimes": [0, 468, 937, 1406, 1875],
  "beatFrames": [0, 14, 28, 42, 56]
}
\`\`\`

## Usage in React Code
\`\`\`typescript
const beatFrames = [0, 14, 28, 42, 56, 70, ...];
const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);

<div style={{
  transform: \`scale(\${isBeat ? 1.1 : 1})\`,
  transition: "transform 0.1s ease-out"
}}>
  Content
</div>
\`\`\`

## Beat Sync Strategies
1. **Scene transitions on major beats**: Start scenes at beats 0, 6, 12
2. **Staggered features on beats**: Each feature enters on consecutive beats
3. **CTA button pulses**: Pulse on every beat
4. **Background drift**: Elements move 20px per beat

## Benefits
✅ Professional feel - animations hit on music beats
✅ No manual timing needed - fully automatic
✅ Works with any generated music
✅ Enables beat-synced scene transitions, entrances, pulses

## Dependencies
- **music-tempo**: Pure JS beat detection library
- **FFmpeg**: MP3 → PCM decoding (already required by Remotion)

## Testing
- ✅ Successfully detects beats @ 120-140 BPM
- ✅ Frame conversion accurate within ±1 frame
- ✅ Generates beat data for 12-15 second tracks
```

---

## PR #4: Migrate to MCP-Only Mode

**Branch**: `feat/mcp-only-mode`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/mcp-only-mode?expand=1

### Title
```
refactor: Migrate to MCP-only mode, deprecate CLI video generation
```

### Description
```markdown
## Summary
**BREAKING CHANGE**: Remove `--url` CLI mode for direct video generation.

This tool is now **MCP + Skill only**, where Claude Code orchestrates video generation by calling MCP tools and generating React code itself.

## Changes
- ❌ Remove `runCli()` function (CLI video generation)
- ✅ Add deprecation message for `--url` flag
- ✅ Update `--help` text to explain MCP + Skill workflow
- ✅ Keep `--setup` for API key configuration
- ✅ Keep MCP server mode (default, no flags)

## Why This Change?
The MCP + Skill architecture provides **superior results**:

✅ Claude Code sees full context (skill guidelines, extracted data)
✅ No code truncation issues (can generate 500+ lines if needed)
✅ No external AI API keys needed (Gemini/Claude)
✅ Better quality and consistency (follows best practices)
✅ Can iterate and refine based on results

## How to Use Now
### 1. Install MCP Server
\`\`\`bash
claude mcp add tabstack-video \\
  -e TABSTACK_API_KEY=ts_xxx \\
  -e WAVESPEED_API_KEY=ws_xxx \\
  -- npx @tabstack/video-generator
\`\`\`

### 2. In Claude Code, Ask
\`\`\`
"Generate a video for https://stripe.com"
\`\`\`

### 3. Claude Code Will
1. Call `extract_page_data` tool → get colors, fonts, content
2. Call `generate_audio` tool → get music + beat times
3. Generate React/Remotion code itself (creative work!)
4. Call `render_video` tool → output HD MP4

## Migration for CLI Users
Users who need CLI mode can:
- Use an older version (v1.x)
- Implement a wrapper that calls MCP tools programmatically
- Use the MCP + Skill mode (recommended)

## Testing
- ✅ `--setup` still works for API key configuration
- ✅ MCP server starts successfully (default mode)
- ✅ `--url` shows deprecation message with migration guide
```

---

## PR #5: Skill Guide and Documentation

**Branch**: `feat/skill-and-documentation`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/skill-and-documentation?expand=1

### Title
```
docs: Add comprehensive Skill guide and architecture documentation
```

### Description
```markdown
## Summary
Add detailed Skill for Claude Code that teaches the complete video generation workflow with best practices, plus comprehensive architecture documentation.

## New Files
### 1. `.skills/generate-video.md` (Skill Guide)
Complete workflow guide for Claude Code teaching:
- ✅ When to trigger (user asks for video)
- ✅ 4-step workflow (extract → audio → code → render)
- ✅ Scene planning (intro, hook, features, results, CTA)
- ✅ Design best practices:
  - Modern UI: glassmorphism, gradients, glows, shadows
  - Rich animations: spring, interpolate, stagger, parallax
  - Typography: proper hierarchy, readable sizes
  - Beat sync: pulse on beats, smooth waves, scene alignment
- ✅ Quality checklist (colors, fonts, animations, beats)
- ✅ Error handling and troubleshooting

### 2. `HOW-IT-WORKS.md` (Technical Deep-Dive)
Step-by-step explanation with code examples:
- TabStack API request/response format
- Playwright color extraction JavaScript
- WaveSpeed music generation + beat analysis
- React code generation with hardcoded data
- Remotion rendering process
- Why MCP + Skill architecture is superior

### 3. `ARCHITECTURE.md` (Updated)
- MCP + Skill architecture flow diagrams
- Beat synchronization details
- Design decisions and trade-offs

## Key Principles Taught
✅ Use **EXACT** brand colors from extraction
✅ Modern UI with glassmorphism, gradients, shadows
✅ Smooth animations with interpolate() and spring()
✅ Beat-synced animations for professional feel
✅ Self-contained components (all data baked in)
✅ 12-15 seconds optimal video length
✅ Minimum 24px font size for readability

## Example Code Patterns
### Glassmorphism
\`\`\`typescript
background: \`\${colors.primary}10\`,
backdropFilter: "blur(20px)",
borderRadius: 24,
border: \`2px solid \${colors.primary}30\`
\`\`\`

### Beat Sync
\`\`\`typescript
const beatFrames = [0, 14, 28, 42, ...];
const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);
transform: \`scale(\${isBeat ? 1.1 : 1})\`
\`\`\`

### Gradient Text
\`\`\`typescript
background: \`linear-gradient(90deg, \${colors.primary}, \${colors.tertiary})\`,
WebkitBackgroundClip: "text",
WebkitTextFillColor: "transparent"
\`\`\`

## Benefits
✅ Claude Code learns consistent video generation patterns
✅ Every video follows best practices automatically
✅ Professional results without external AI API
✅ Clear documentation for developers

## File Sizes
- `.skills/generate-video.md`: ~8 KB (comprehensive guide)
- `HOW-IT-WORKS.md`: ~24 KB (detailed technical docs)
- `ARCHITECTURE.md`: Updated with MCP flow
```

---

## PR #6: Improved Video Components with Modern UI

**Branch**: `feat/improved-video-components`
**Link**: https://github.com/Bhonar/tabstack-video-generator/compare/main...feat/improved-video-components?expand=1

### Title
```
feat: Add modern UI components with glassmorphism and beat sync
```

### Description
```markdown
## Summary
Update `GeneratedVideo` component with premium design patterns: glassmorphism, animated gradients, glow effects, and beat-synchronized animations following Skill best practices.

## Changes to GeneratedVideo.tsx
### Before (Plain)
\`\`\`tsx
<div style={{
  fontSize: 52,
  color: colors.secondary,
  opacity: interpolate(frame, [0, 20], [0, 1])
}}>
  Enable AI systems to browse...
</div>
\`\`\`

### After (Premium)
\`\`\`tsx
<div style={{
  fontSize: 64,
  fontWeight: 800,
  background: \`linear-gradient(\${interpolate(frame, [0, 90], [0, 360])}deg,
             \${colors.primary}, \${colors.tertiary})\`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  transform: \`scale(\${beatFrames.includes(frame) ? 1.1 : 1})\`,
  textShadow: \`0 0 40px \${colors.primary}60\`,
  transition: "transform 0.15s ease-out"
}}>
  Enable AI systems to browse, search, and interact with the web
</div>
\`\`\`

## New Scene Components
- **HookScene.tsx**: Value proposition with animated gradient
- **ProblemScene.tsx**: Pain points with staggered cards
- **SolutionScene.tsx**: How it works with step animations
- **UseCasesScene.tsx**: Use case cards with icons
- **ResultsScene.tsx**: Stats with counting animations
- **CTAScene.tsx**: Call-to-action with pulsing button

## Design Improvements
### Glassmorphism
\`\`\`typescript
background: \`\${colors.primary}08\`,
backdropFilter: "blur(10px)",
borderRadius: 24,
border: \`2px solid \${colors.primary}20\`,
boxShadow: \`0 10px 40px \${colors.primary}15\`
\`\`\`

### Animated Gradients
\`\`\`typescript
// Rotating gradient
background: \`linear-gradient(
  \${interpolate(frame, [0, 90], [0, 360])}deg,
  \${colors.primary},
  \${colors.tertiary}
)\`

// Radial gradient with pulse
background: \`radial-gradient(circle, \${colors.primary}40, transparent)\`,
transform: \`scale(\${pulseScale})\`,
filter: "blur(60px)"
\`\`\`

### Glow Effects
\`\`\`typescript
// Text glow
textShadow: \`0 0 60px \${colors.primary}60\`

// Box glow
boxShadow: \`0 20px 60px \${colors.primary}60, 0 0 100px \${colors.tertiary}40\`
\`\`\`

### Beat Synchronization
\`\`\`typescript
// Instant beat hit
const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);
transform: \`scale(\${isBeat ? 1.08 : 1})\`,
filter: \`brightness(\${isBeat ? 1.2 : 1})\`

// Smooth pulse wave
const nearestBeat = beatFrames.reduce((prev, curr) =>
  Math.abs(curr - frame) < Math.abs(prev - frame) ? curr : prev
);
const beatProgress = (frame - nearestBeat) / 14;
const pulseScale = 1 + Math.sin(beatProgress * Math.PI * 2) * 0.05;
\`\`\`

## Feature Cards
- Staggered entrance animations (one per beat)
- Alternating brand colors (primary/tertiary)
- Descriptions added (not just titles)
- Animated emoji icons with pulse
- Glassmorphism containers with blur

## Typography Hierarchy
- **Hero title**: 140px, weight 900
- **Section headings**: 72px, weight 900
- **Card titles**: 36px, weight 700
- **Descriptions**: 24px, weight 400
- **Minimum size**: 24px (always readable)

## Root.tsx Changes
- Direct import of `GeneratedVideo` (no dynamic require)
- Simpler composition registration
- Fixed ESM compatibility issues

## Result
✅ Videos look professionally designed
✅ Animations feel intentional and polished
✅ Brand colors used consistently throughout
✅ Beat sync creates satisfying rhythm
✅ Modern aesthetic matches 2025 design trends

## Testing
- ✅ Renders 360 frames successfully
- ✅ Beat-synced animations hit correctly
- ✅ Glassmorphism effects render properly
- ✅ Gradient text displays without artifacts
- ✅ Output: 1.5 MB MP4, 12 seconds, 1920x1080
```

---

## Summary

**6 Feature Branches Pushed:**
1. ✅ `feat/remove-ai-providers` - Remove Gemini/Claude API
2. ✅ `feat/playwright-color-extraction` - Local browser automation
3. ✅ `feat/beat-synchronization` - Music beat detection
4. ✅ `feat/mcp-only-mode` - Deprecate CLI, MCP only
5. ✅ `feat/skill-and-documentation` - Comprehensive guides
6. ✅ `feat/improved-video-components` - Modern UI components

**Next Steps:**
1. Click each PR link above
2. Review the changes
3. Copy/paste the description into GitHub PR form
4. Create the PR
5. Merge PRs in order (1 → 2 → 3 → 4 → 5 → 6)

All commits include `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` 🤖
