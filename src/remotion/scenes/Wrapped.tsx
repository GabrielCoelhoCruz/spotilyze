import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const WrappedScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 20], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          opacity: fadeIn,
          transform: `scale(${scale})`,
          textAlign: "center",
          width: 800,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1DB954",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Your Snapshot
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#ffffff",
            marginTop: 16,
          }}
        >
          Wrapped
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#1DB954",
            marginTop: 32,
            fontFamily: "monospace",
          }}
        >
          1,247
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#a3a3a3",
            marginTop: 16,
          }}
        >
          total plays in your library
        </div>
      </div>
    </AbsoluteFill>
  );
};
