#!/usr/bin/env node

/**
 * Test the complete MCP + Skill workflow
 * This simulates what happens when Claude Code generates a video
 */

import { extractStructured } from './dist/lib/tabstack-client.js';
import { extractColorsAndFontsViaPlaywright } from './dist/lib/playwright-extractor.js';
import { generateAudio, isAudioGenerationAvailable } from './dist/lib/audio-generator.js';
import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testWorkflow() {
  const url = "https://tabstack.ai";
  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║       Testing MCP + Skill Workflow for tabstack.ai          ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  try {
    // Step 1: Extract page data
    console.log("📊 [Step 1/4] extract_page_data");
    console.log("  → Calling TabStack API for content...");
    const pageData = await extractStructured(url);
    console.log(`  ✅ Extracted: "${pageData.title}"`);
    console.log(`     Tagline: "${pageData.tagline}"`);
    console.log(`     Features: ${pageData.features?.length || 0} features`);

    console.log("\n  → Calling Playwright for colors/fonts...");
    const { colors, fonts } = await extractColorsAndFontsViaPlaywright(url);
    console.log(`  ✅ Colors: primary=${colors.primary}, secondary=${colors.secondary}`);
    console.log(`     Fonts: heading="${fonts.heading}", body="${fonts.body}"`);

    // Step 2: Generate AI music (optional)
    let audio = null;
    if (isAudioGenerationAvailable()) {
      console.log("\n🎵 [Step 2/4] generate_audio");
      console.log("  → Generating AI music with beat detection...");

      const prompt = "Instrumental epic tech, 128 BPM, precise kick on every beat, dramatic build, modern synths";
      const lyrics = `[Verse 1]
${pageData.title}
${pageData.tagline}

[Chorus]
Web browsing for AI
Autonomous and powerful`;

      audio = await generateAudio({ prompt, lyrics });
      console.log(`  ✅ Audio generated: ${audio.fileName}`);
      console.log(`     BPM: ${audio.bpm}, Beats: ${audio.beatFrames?.length || 0} frames`);
    } else {
      console.log("\n🎵 [Step 2/4] generate_audio - SKIPPED");
      console.log("  ⚠️  WAVESPEED_API_KEY not set - skipping audio generation");
    }

    // Step 3: Generate React code (Claude Code does this)
    console.log("\n⚛️  [Step 3/4] Claude Code generates React/Remotion code");
    console.log("  → Writing premium UI component...");

    // This is what Claude Code would generate
    const reactCode = `import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring } from "remotion";

export default function GeneratedVideo() {
  const frame = useCurrentFrame();

  const colors = {
    primary: "${colors.primary}",
    secondary: "${colors.secondary}",
    tertiary: "${colors.tertiary}",
    background: "${colors.background}",
  };

  const fonts = {
    heading: "${fonts.heading}, system-ui, sans-serif",
    body: "${fonts.body}, system-ui, sans-serif",
  };

  ${audio?.beatFrames ? `const beatFrames = [${audio.beatFrames.slice(0, 20).join(', ')}];
  const isBeat = beatFrames.some(b => Math.abs(frame - b) < 2);` : ''}

  return (
    <AbsoluteFill style={{ background: colors.background }}>
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
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
            ${pageData.title}
          </div>
          <div style={{
            fontSize: 42,
            fontFamily: fonts.body,
            color: colors.secondary,
            marginTop: 30,
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" })
          }}>
            ${pageData.tagline}
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 8%" }}>
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: fonts.heading,
            color: colors.primary,
            marginBottom: 80
          }}>
            What You Can Do
          </div>
          {[
            { title: "Web Tasks, Handled", emoji: "⚡" },
            { title: "Get Answers", emoji: "💡" },
            { title: "Turn the Web Into Data", emoji: "📊" }
          ].map((feature, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              margin: "20px 0",
              padding: "30px 50px",
              background: \`\${colors.primary}08\`,
              backdropFilter: "blur(10px)",
              borderRadius: 24,
              opacity: interpolate(frame - 90, [15 + i * 15, 30 + i * 15], [0, 1], { extrapolateRight: "clamp" })
              ${audio?.beatFrames ? `,
              transform: \`scale(\${isBeat ? 1.05 : 1})\`,
              transition: "transform 0.15s ease-out"` : ''}
            }}>
              <span style={{ fontSize: 60 }}>{feature.emoji}</span>
              <span style={{ fontSize: 36, fontFamily: fonts.heading, color: colors.secondary, fontWeight: 700 }}>
                {feature.title}
              </span>
            </div>
          ))}
        </AbsoluteFill>
      </Sequence>

      <Sequence from={180} durationInFrames={60}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{
            fontSize: 96,
            fontWeight: 900,
            fontFamily: fonts.heading,
            color: colors.primary
          }}>
            Start Building
          </div>
          <div style={{
            marginTop: 60,
            padding: "25px 80px",
            background: \`linear-gradient(135deg, \${colors.primary}, \${colors.tertiary})\`,
            color: "#ffffff",
            fontSize: 42,
            fontWeight: 700,
            fontFamily: fonts.body,
            borderRadius: 60
            ${audio?.beatFrames ? `,
            transform: \`scale(\${isBeat ? 1.08 : 1})\`,
            transition: "transform 0.15s ease-out"` : ''}
          }}>
            Get Started →
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
}`;

    const compositionPath = path.resolve(__dirname, "src/remotion/compositions/GeneratedVideo.tsx");
    await writeFile(compositionPath, reactCode, "utf-8");
    console.log("  ✅ React code generated with:");
    console.log(`     - Exact brand colors (${colors.primary})`);
    console.log(`     - Exact brand fonts (${fonts.heading})`);
    console.log(`     - Glassmorphism UI components`);
    console.log(`     - Animated gradients and glows`);
    if (audio?.beatFrames) {
      console.log(`     - Beat-synced animations (${audio.beatFrames.length} beats)`);
    }

    // Rebuild TypeScript
    console.log("\n  → Rebuilding TypeScript...");
    execSync("npm run build", { cwd: __dirname, stdio: "pipe" });
    console.log("  ✅ Build complete");

    // Step 4: Render video
    console.log("\n🎬 [Step 4/4] render_video");
    console.log("  → Rendering with Remotion (this may take 1-2 minutes)...");

    const outputPath = path.resolve(__dirname, "out/tabstack-test.mp4");
    const renderCmd = `npx remotion render dist/remotion/index.js GeneratedVideo ${outputPath} --overwrite`;

    execSync(renderCmd, { cwd: __dirname, stdio: "inherit" });

    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║                  ✅ WORKFLOW TEST COMPLETE!                  ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log(`\n📹 Video saved to: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   • Extracted: ${pageData.title}`);
    console.log(`   • Colors: ${colors.primary} (primary)`);
    console.log(`   • Fonts: ${fonts.heading}`);
    if (audio) {
      console.log(`   • Music: ${audio.bpm} BPM, ${audio.beatFrames?.length} beats`);
    }
    console.log(`   • Duration: 8 seconds (240 frames @ 30fps)`);
    console.log(`   • Resolution: 1920x1080`);

    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

testWorkflow();
