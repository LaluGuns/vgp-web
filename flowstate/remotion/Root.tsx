import React from "react";
import { Composition } from "remotion";
import { FlowPromoPortrait, DEFAULT_PROPS } from "./FlowPromoPortrait";
import { VIDEO } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FlowPromoPortrait"
        component={FlowPromoPortrait}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={DEFAULT_PROPS}
      />
    </>
  );
};

