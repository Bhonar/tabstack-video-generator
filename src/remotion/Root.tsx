import React from "react";
import { Composition } from "remotion";
import { VIDEO_CONFIG } from "./types.js";

/**
 * Remotion Root - registers compositions dynamically
 * No hardcoded values - all compositions are AI-generated
 */
export const RemotionRoot: React.FC = () => {
  // Try to dynamically import GeneratedVideo if it exists and has been AI-generated
  let GeneratedVideo: React.ComponentType<any> | null = null;
  try {
    // This will only succeed if the file has been replaced by AI-generated code
    const module = require("./compositions/GeneratedVideo.js");
    GeneratedVideo = module.default;
  } catch {
    // File doesn't exist or hasn't been generated yet - skip registration
  }

  return (
    <>
      {/* AI-generated composition - only registered after render_video MCP tool creates it */}
      {GeneratedVideo && (
        <Composition
          id="GeneratedVideo"
          component={GeneratedVideo}
          durationInFrames={360}
          fps={VIDEO_CONFIG.fps}
          width={VIDEO_CONFIG.width}
          height={VIDEO_CONFIG.height}
          defaultProps={{}}
        />
      )}
    </>
  );
};
