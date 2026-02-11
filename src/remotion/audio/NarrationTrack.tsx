import React from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface NarrationTrackProps {
  narrationTrackFile: string;
  totalDuration: number;
}

/**
 * TTS narration voiceover layer.
 * Plays the Gemini-generated speech audio at high volume with quick fade-in/out.
 */
export const NarrationTrack: React.FC<NarrationTrackProps> = ({
  narrationTrackFile,
  totalDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInFrames = Math.round(fps * 0.3); // 0.3s quick fade in
  const fadeOutFrames = Math.round(fps * 0.5); // 0.5s fade out
  const fadeOutStart = totalDuration - fadeOutFrames;

  const volume = interpolate(
    frame,
    [0, fadeInFrames, Math.max(fadeInFrames + 1, fadeOutStart), totalDuration],
    [0, 0.9, 0.9, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const audioSrc = staticFile(`audio/${narrationTrackFile}`);

  return (
    <Audio
      src={audioSrc}
      volume={volume}
      startFrom={0}
    />
  );
};
