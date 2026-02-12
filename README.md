# @tabstack/video-generator

**MCP Server + Skill** for Claude Code: Turn any landing page into a dramatic product launch video with AI-generated creative direction.

> **URL in, HD video out.** Claude Code's AI designs unique animations, custom music, and professional motion graphics — in minutes.

## How it works

This tool is both an **MCP server** and a **Skill** for Claude Code:

1. **MCP Server** provides tools for:
   - 📊 **extract_page_data** - TabStack extracts branding, features, colors
   - 🎵 **generate_audio** - WaveSpeed creates AI music with precise beats
   - 🎬 **render_video** - Remotion renders React code to HD video

2. **Skill** teaches Claude Code's AI to:
   - Design creative, varied animations (never repetitive!)
   - Write executable React/TypeScript video code
   - Sync transitions to musical beats
   - Use exact brand colors

**The result:** 10-15 second videos with explosive zooms, dramatic slams, varied animations — each video unique.

```
https://tabstack.ai → Claude Code designs creative animations → video.mp4
```

## What makes this different

- **✨ Creative freedom**: Claude Code's AI designs unique animations for each video
- **🎯 Exact branding**: Uses colors extracted directly from the landing page
- **🎵 Beat-synced**: Transitions land perfectly on musical beats
- **🚀 No coding**: Just describe what you want, Claude Code writes the React
- **💰 No AI API keys**: Uses Claude Code's built-in AI (no Gemini/Claude keys needed!)

---

## Quick Start (5 minutes)

### Step 1: Install prerequisites

**Node.js v18+** (check if you have it):
```bash
node --version   # Should show v18 or higher
```
Don't have it? Download from [nodejs.org](https://nodejs.org)

**FFmpeg** (required for video rendering):
```bash
ffmpeg -version   # Check if installed
```

Install FFmpeg:
| Your OS | Command |
|---------|---------|
| **macOS** | `brew install ffmpeg` |
| **Ubuntu/Debian** | `sudo apt install ffmpeg` |
| **Windows** | `winget install ffmpeg` |
| **Fedora** | `sudo dnf install ffmpeg` |

**Claude Code CLI** (recommended):
```bash
claude --version   # Check if installed
```
Don't have it? Download from [claude.ai/download](https://claude.ai/download)

---

### Step 2: Get your free API keys

All services have **free tiers** — no credit card required.

**Required:**

1. **TabStack API Key** (extracts landing page data + brand colors)
   - Go to [console.tabstack.ai](https://console.tabstack.ai)
   - Sign up → Copy your API key
   - Save it for Step 3

**Optional (recommended for better videos):**

2. **WaveSpeed API Key** (generates custom AI music with precise beats)
   - Go to [wavespeed.ai](https://wavespeed.ai)
   - Sign up → Get your API key
   - Without this, videos won't have music

**✨ No AI API keys needed!** Claude Code's built-in AI handles all the creative work (designing animations, writing React code). You don't need Gemini or Claude API keys.

---

### Step 3: Setup with Claude Code

**3a.** Add the MCP server:
```bash
claude mcp add tabstack-video \
  -e TABSTACK_API_KEY=your_tabstack_key_here \
  -e WAVESPEED_API_KEY=your_wavespeed_key_here \
  -- npx -y @tabstack/video-generator
```

Replace `your_tabstack_key_here` and `your_wavespeed_key_here` with your actual API keys.

**3b.** Install the Skill:
```bash
npx skills add @tabstack/video-generator
```

This teaches Claude Code's AI how to design creative videos using the MCP tools.

**3c.** Restart Claude Code:
- Close your current Claude Code window completely
- Open a new Claude Code session
- (MCP servers and Skills only load on startup)

**3d.** Generate your first video:

Just say to Claude:
```
Generate a video for https://yoursite.com
```

Done! Claude handles everything and shows you the video.

---

#### **Option B: Use CLI directly** (for automation/scripts)

Run this command (replace the API keys with yours):

```bash
TABSTACK_API_KEY=your_tabstack_key \
GEMINI_API_KEY=your_gemini_key \
WAVESPEED_API_KEY=your_wavespeed_key \
npx -y @tabstack/video-generator --url https://yoursite.com
```

Video saves to `./out/video.mp4` and opens automatically.

---

### Step 4: Verify everything works

Run the setup wizard to check your installation:

```bash
npx -y @tabstack/video-generator --setup
```

This checks for Node.js, FFmpeg, and validates your API keys.

---

## Advanced Usage

### Customize music mood

```bash
npx @tabstack/video-generator --url https://vercel.com --audio-mood elegant
```

**Available moods:** `tech` • `elegant` • `corporate` • `energetic` • `minimal`

### Skip AI music generation (faster)

If you don't have a WaveSpeed API key or want faster rendering:

```bash
npx @tabstack/video-generator --url https://notion.so --no-ai-audio
```

### Custom output location

```bash
npx @tabstack/video-generator \
  --url https://linear.app \
  --output ./my-video.mp4 \
  --no-open
```

---

## All CLI Options

| Flag | Description | Example |
|------|-------------|---------|
| `--url <url>` | Landing page to convert | `--url https://stripe.com` |
| `--audio-mood <mood>` | Music style | `--audio-mood elegant` |
| `--no-ai-audio` | Skip AI music, use placeholder | `--no-ai-audio` |
| `--output <path>` | Save location | `--output ./video.mp4` |
| `--no-open` | Don't auto-open after render | `--no-open` |
| `--setup` | Run setup wizard | `--setup` |

---

## How It Works (Behind the Scenes)

When you provide a URL, here's what happens:

1. **Extract** → TabStack reads your landing page
   - Pulls product name, tagline, features, pricing
   - Captures a high-quality screenshot
   - Analyzes brand colors

2. **Plan** → Gemini AI creates your video storyboard
   - Determines best scenes (Hook, Problem, Solution, etc.)
   - Plans timing and transitions
   - Writes narration script
   - Generates song lyrics

3. **Generate Audio** → WaveSpeed creates custom music
   - Generates AI music matching your brand mood
   - Synthesizes AI narration voiceover
   - Syncs timing with video scenes

4. **Render** → Remotion builds your video
   - Creates 1920×1080 HD video
   - Adds animations and motion graphics
   - Combines all scenes with audio
   - Exports final MP4 (20–35 seconds)

**Total time:** Usually 2–4 minutes from URL to video.

---

## Troubleshooting

### `ffmpeg: command not found`

**Fix:** Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
winget install ffmpeg
```

Then try again.

---

### MCP server not showing up in Claude Code

**Fix:** Restart Claude Code completely
1. Close all Claude Code windows
2. Quit the application
3. Open Claude Code again
4. Try asking Claude to generate a video

---

### Video has no music or uses placeholder audio

**Fix:** Add your WaveSpeed API key

If you skipped the WaveSpeed key, videos will have placeholder music. To get AI-generated music:

1. Get a free API key at [wavespeed.ai](https://wavespeed.ai)
2. Re-add the MCP server with the key:
   ```bash
   claude mcp add tabstack-video \
     -e TABSTACK_API_KEY=your_key \
     -e GEMINI_API_KEY=your_key \
     -e WAVESPEED_API_KEY=your_new_wavespeed_key \
     -- npx -y @tabstack/video-generator
   ```
3. Restart Claude Code

---

### `TABSTACK_API_KEY missing` or `GEMINI_API_KEY missing`

**Fix:** Get the required API keys

- **TabStack:** [console.tabstack.ai](https://console.tabstack.ai)
- **Gemini:** [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

Then add them to your MCP server config (see Step 3 above).

---

### First render is slow

**This is normal!** First render needs to:
- Download dependencies
- Bundle code
- Cache assets

**Next renders will be much faster** (usually under 1 minute).

---

### Video quality issues

Make sure you're using:
- A clean, professional landing page URL
- A page with clear product information
- Good contrast and readable text

The AI works best with well-designed landing pages.

---

## FAQ

### How much does this cost?

**$0 to start!** All three services have generous free tiers:
- **TabStack:** Free tier available
- **Gemini API:** Free up to 60 requests/minute
- **WaveSpeed:** Free tier for AI music generation

You can generate dozens of videos before hitting any limits.

### Can I use this for commercial projects?

Yes! The generated videos are yours to use however you want. Just make sure you have the rights to use the landing page content you're converting.

### What video format does it output?

1920×1080 MP4 (Full HD), perfect for:
- Social media posts (LinkedIn, Twitter, Instagram)
- Product launches
- Website embeds
- Email campaigns

### Can I edit the video afterwards?

Yes! The MP4 output can be edited in any video editor (Final Cut, Premiere, iMovie, etc.).

### Does it work with any website?

It works best with:
- Product landing pages
- SaaS homepages
- Marketing websites with clear value propositions

May not work well with:
- E-commerce sites with many products
- Complex multi-page sites
- Sites with poor structure or missing content

### Can I customize the scenes?

Currently, the AI determines the best scenes automatically. Future versions will support custom scene templates and manual overrides.

### How long are the generated videos?

20–35 seconds, optimized for social media attention spans.

---

## What's Next?

After generating your first video:

1. **Try different URLs** to see how the AI adapts to different products
2. **Experiment with audio moods** to match your brand voice
3. **Integrate into your workflow** using the CLI for batch processing
4. **Share your videos** on social media and track engagement

---

## Support

- **Issues?** Open an issue on [GitHub](https://github.com/Bhonar/tabstack-video-generator/issues)
- **Questions?** Check the troubleshooting section above
- **Feature requests?** We'd love to hear them!

---

## License

MIT
