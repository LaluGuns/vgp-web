import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COPY, LOCAL_AUDIO, TIMING, type FlowPromoProps } from "./constants";
import { AgitationScene, AtmosphereScene, EndCardScene, FlowRevealScene, FocusScene, HookScene, ProductPayoffScene, TasksScene } from "./scenes";

const audioClamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const FlowPromoPortrait: React.FC<FlowPromoProps> = ({ hookVariant = "playlist", musicEnabled = true, showFrictionLine = true }) => {
  const frame = useCurrentFrame();
  const musicVolume = musicEnabled
    ? interpolate(frame, [0, 102, 135, 175, 510, 560, 600], [0, 0, 0.12, 0.16, 0.15, 0.07, 0], audioClamp)
    : 0;

  return (
    <AbsoluteFill>
      <Audio src={staticFile(LOCAL_AUDIO.soundtrack)} volume={musicVolume} startFrom={0} />
      <Sequence from={TIMING.hook.from} durationInFrames={TIMING.hook.duration} premountFor={8}>
        <HookScene hookVariant={hookVariant} showFrictionLine={showFrictionLine} />
      </Sequence>
      <Sequence from={TIMING.agitation.from} durationInFrames={TIMING.agitation.duration} premountFor={8}>
        <AgitationScene />
      </Sequence>
      <Sequence from={TIMING.reveal.from} durationInFrames={TIMING.reveal.duration} premountFor={8}>
        <FlowRevealScene />
      </Sequence>
      <Sequence from={TIMING.focus.from} durationInFrames={TIMING.focus.duration} premountFor={8}>
        <FocusScene />
      </Sequence>
      <Sequence from={TIMING.tasks.from} durationInFrames={TIMING.tasks.duration} premountFor={8}>
        <TasksScene />
      </Sequence>
      <Sequence from={TIMING.atmosphere.from} durationInFrames={TIMING.atmosphere.duration} premountFor={8}>
        <AtmosphereScene />
      </Sequence>
      <Sequence from={TIMING.payoff.from} durationInFrames={TIMING.payoff.duration} premountFor={8}>
        <ProductPayoffScene />
      </Sequence>
      <Sequence from={TIMING.endCard.from} durationInFrames={TIMING.endCard.duration} premountFor={8}>
        <EndCardScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DEFAULT_PROPS: FlowPromoProps = {
  hookVariant: "playlist",
  musicEnabled: true,
  showFrictionLine: true,
};

export const compositionTitle = `${COPY.url} · ${COPY.descriptor}`;

