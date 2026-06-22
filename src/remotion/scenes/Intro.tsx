import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const IntroScene = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#1DB954",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          🎵 Spotilyze
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a3a3a3",
            marginTop: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Your Spotify analytics, self-hosted
        </div>
      </div>
    </AbsoluteFill>
  );
};
