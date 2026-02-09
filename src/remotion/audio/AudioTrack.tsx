import React from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { AudioMood } from "../types.js";

interface AudioTrackProps {
  mood: AudioMood;
  totalDuration: number;
  audioTrackFile?: string;
}

/**
 * Background music track with fade-in / fade-out volume envelope.
 * Uses AI-generated audio when audioTrackFile is provided,
 * otherwise falls back to static mood files in public/audio/{mood}.mp3.
 */
export const AudioTrack: React.FC<AudioTrackProps> = ({ mood, totalDuration, audioTrackFile }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInFrames = fps * 1; // 1 second fade in
  const fadeOutFrames = fps * 2; // 2 second fade out
  const fadeOutStart = totalDuration - fadeOutFrames;

  const volume = interpolate(
    frame,
    [0, fadeInFrames, Math.max(fadeInFrames + 1, fadeOutStart), totalDuration],
    [0, 0.3, 0.3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Use generated track if available, otherwise fall back to static mood file
  const audioSrc = audioTrackFile
    ? staticFile(`audio/${audioTrackFile}`)
    : staticFile(`audio/${mood}.mp3`);

  return (
    <Audio
      src={audioSrc}
      volume={volume}
      startFrom={0}
    />
  );
};
