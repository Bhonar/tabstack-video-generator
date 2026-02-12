import React from "react";
import { Composition } from "remotion";
import { VIDEO_CONFIG } from "./types.js";
import GeneratedVideo from "./compositions/GeneratedVideo.js";

/**
 * Remotion Root - registers AI-generated video composition
 * GeneratedVideo is created dynamically by AI during video generation
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* AI-generated composition - created during video generation */}
      <Composition
        id="GeneratedVideo"
        component={GeneratedVideo}
        durationInFrames={360}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
        defaultProps={{}}
      />
    </>
  );
};
