import React from "react";
import { Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { AudioMood } from "../types.js";

interface AudioTrackProps {
  mood: AudioMood;
  totalDuration: number;
  audioTrackFile?: string;
  hasNarration?: boolean;
}

/**
 * Background music track with quick fade-in, full volume, and fade-out.
 * Uses AI-generated audio when audioTrackFile is provided,
 * otherwise falls back to static mood files in public/audio/{mood}.mp3.
 *
 * When narration is active, drops volume to background level (0.25).
 */
export const AudioTrack: React.FC<AudioTrackProps> = ({
  mood,
  totalDuration,
  audioTrackFile,
  hasNarration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInFrames = Math.round(fps * 0.5); // 0.5s fast fade in
  const fadeOutFrames = fps * 1; // 1s fade out
  const fadeOutStart = totalDuration - fadeOutFrames;

  // When narration is present, music is background (0.25); otherwise full (0.8)
  const peakVolume = hasNarration ? 0.25 : 0.8;

  const volume = interpolate(
    frame,
    [0, fadeInFrames, Math.max(fadeInFrames + 1, fadeOutStart), totalDuration],
    [0, peakVolume, peakVolume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Use generated track if available, otherwise fall back to static placeholder
  const audioSrc = audioTrackFile
    ? staticFile(`audio/${audioTrackFile}`)
    : staticFile(`audio/fallback.mp3`);

  return (
    <Audio
      src={audioSrc}
      volume={volume}
      startFrom={0}
    />
  );
};
