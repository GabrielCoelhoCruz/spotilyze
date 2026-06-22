import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { IntroScene } from "./scenes/Intro";
import { DashboardScene } from "./scenes/Dashboard";
import { WrappedScene } from "./scenes/Wrapped";
import { OutroScene } from "./scenes/Outro";

export const SpotilyzeDemo = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Intro - 3 seconds */}
      <Sequence from={0} durationInFrames={3 * fps}>
        <IntroScene />
      </Sequence>

      {/* Dashboard - 5 seconds */}
      <Sequence from={3 * fps} durationInFrames={5 * fps}>
        <DashboardScene />
      </Sequence>

      {/* Wrapped - 4 seconds */}
      <Sequence from={8 * fps} durationInFrames={4 * fps}>
        <WrappedScene />
      </Sequence>

      {/* Outro - 3 seconds */}
      <Sequence from={12 * fps} durationInFrames={3 * fps}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
