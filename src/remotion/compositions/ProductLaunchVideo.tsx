import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { HookScene } from "../scenes/HookScene.js";
import { ProblemScene } from "../scenes/ProblemScene.js";
import { SolutionScene } from "../scenes/SolutionScene.js";
import { UseCasesScene } from "../scenes/UseCasesScene.js";
import { ResultsScene } from "../scenes/ResultsScene.js";
import { CTAScene } from "../scenes/CTAScene.js";
import { AudioTrack } from "../audio/AudioTrack.js";
import { NarrationTrack } from "../audio/NarrationTrack.js";
import { FontStyles } from "../lib/fonts.js";
import type { ProductLaunchProps, ContentSceneData } from "../types.js";
import { VIDEO_CONFIG } from "../types.js";

// ── Scene component registry (content scenes only) ──

const SCENE_COMPONENTS: Record<
  ContentSceneData["type"],
  React.FC<any>
> = {
  hook: HookScene,
  problem: ProblemScene,
  solution: SolutionScene,
  "use-cases": UseCasesScene,
  results: ResultsScene,
  cta: CTAScene,
};

// ── Transition style selection based on scene pair ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTransitionForPair(
  _from: ContentSceneData["type"],
  to: ContentSceneData["type"],
): any {
  // Choose transition style based on what scene is coming next
  switch (to) {
    case "problem":
      // Hook → Problem: dramatic wipe from right
      return wipe({ direction: "from-right" });
    case "solution":
      // Problem → Solution: clean slide from bottom (uplift)
      return slide({ direction: "from-bottom" });
    case "use-cases":
      // Solution → Use Cases: slide from right
      return slide({ direction: "from-right" });
    case "results":
      // → Results: slide from right (sequential flow)
      return slide({ direction: "from-right" });
    case "cta":
      // → CTA: smooth fade (emotional buildup)
      return fade();
    default:
      return fade();
  }
}

// ── Beat-sync: snap transition duration to nearest beat ──

function getTransitionFrames(bpm: number, fps: number): number {
  if (!bpm || bpm <= 0) {
    // Default: ~10 frames (~0.33s at 30fps)
    return 10;
  }

  // Calculate frames per beat
  const framesPerBeat = (60 / bpm) * fps;

  // Transition should be ~0.5 beats for a punchy cut-on-beat feel
  // Minimum 8 frames, maximum 18 frames
  const halfBeat = Math.round(framesPerBeat / 2);
  return Math.max(8, Math.min(18, halfBeat));
}

// ── Main composition ──

export const ProductLaunchVideo: React.FC<ProductLaunchProps> = ({
  scenes,
  colorTheme,
  audioMood,
  audioBpm,
  audioTrackFile,
  narrationTrackFile,
}) => {
  // Filter out legacy transition scenes — we now handle transitions automatically
  const contentScenes = scenes.filter(
    (s): s is ContentSceneData => s.type !== "transition",
  );

  // Calculate beat-synced transition duration
  const transitionFrames = getTransitionFrames(audioBpm ?? 0, VIDEO_CONFIG.fps);

  // Calculate total duration accounting for transition overlaps
  // TransitionSeries: each transition OVERLAPS adjacent scenes, reducing total duration
  const totalContentFrames = contentScenes.reduce((acc, s) => acc + s.durationInFrames, 0);
  const totalTransitions = Math.max(0, contentScenes.length - 1);
  const totalDuration = totalContentFrames - (totalTransitions * transitionFrames);

  const hasNarration = !!narrationTrackFile;

  return (
    <AbsoluteFill style={{ backgroundColor: colorTheme.background }}>
      {/* Load fonts */}
      <FontStyles />

      {/* Render scenes with crossfade transitions via TransitionSeries */}
      <TransitionSeries>
        {contentScenes.map((scene, index) => {
          const Component = SCENE_COMPONENTS[scene.type];
          if (!Component) return null;

          const elements: React.ReactNode[] = [];

          // Add the scene
          elements.push(
            <TransitionSeries.Sequence
              key={`scene-${scene.type}-${index}`}
              durationInFrames={scene.durationInFrames}
            >
              <Component {...scene} colorTheme={colorTheme} />
            </TransitionSeries.Sequence>,
          );

          // Add transition AFTER this scene (except for the last one)
          if (index < contentScenes.length - 1) {
            const nextScene = contentScenes[index + 1];
            const presentation = getTransitionForPair(scene.type, nextScene.type);

            elements.push(
              <TransitionSeries.Transition
                key={`transition-${index}`}
                presentation={presentation}
                timing={linearTiming({ durationInFrames: transitionFrames })}
              />,
            );
          }

          return elements;
        })}
      </TransitionSeries>

      {/* Background music layer — uses AI-generated track when available */}
      <AudioTrack
        mood={audioMood}
        totalDuration={totalDuration}
        audioTrackFile={audioTrackFile}
        hasNarration={hasNarration}
      />

      {/* TTS narration layer — when available */}
      {narrationTrackFile && (
        <NarrationTrack
          narrationTrackFile={narrationTrackFile}
          totalDuration={totalDuration}
        />
      )}
    </AbsoluteFill>
  );
};
