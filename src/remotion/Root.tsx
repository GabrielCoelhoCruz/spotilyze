import { Composition } from "remotion";
import { SpotilyzeDemo } from "./DemoVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="SpotilyzeDemo"
      component={SpotilyzeDemo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
