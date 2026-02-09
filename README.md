# @tabstack/video-generator

Turn any landing page into a product launch video. One command.

> URL in, HD video out.

## Setup

### Claude Code (recommended)

```bash
brew install ffmpeg && claude mcp add tabstack-video -e TABSTACK_API_KEY=ts_xxx -e GEMINI_API_KEY=AIza_xxx -e WAVESPEED_API_KEY=ws_xxx -- npx @tabstack/video-generator
```

Then just ask Claude:

```
Generate a video for https://stripe.com
```

### CLI

```bash
brew install ffmpeg && TABSTACK_API_KEY=ts_xxx GEMINI_API_KEY=AIza_xxx npx @tabstack/video-generator --url https://stripe.com
```

Video saves to `./out/video.mp4` and opens automatically.

> **Linux?** Replace `brew install ffmpeg` with `sudo apt install ffmpeg`

### API keys (all have free tiers)

| Key | Get it | Required |
|-----|--------|----------|
| `TABSTACK_API_KEY` | [console.tabstack.ai](https://console.tabstack.ai) | Yes |
| `GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | Yes |
| `WAVESPEED_API_KEY` | [wavespeed.ai](https://wavespeed.ai) | No — enables AI music |

## More examples

```bash
# Custom music mood
npx @tabstack/video-generator --url https://vercel.com --audio-mood elegant

# Skip AI music (faster)
npx @tabstack/video-generator --url https://notion.so --no-ai-audio

# Custom output path
npx @tabstack/video-generator --url https://linear.app --output ./linear.mp4 --no-open
```

## CLI flags

| Flag | What it does |
|------|-------------|
| `--url <url>` | Page to turn into a video |
| `--audio-mood <mood>` | `tech` `elegant` `corporate` `energetic` `minimal` |
| `--no-ai-audio` | Use static audio instead of AI-generated |
| `--output <path>` | Where to save (default: `./out/video.mp4`) |
| `--no-open` | Don't auto-open after rendering |
| `--setup` | Check if everything is installed correctly |

## License

MIT
