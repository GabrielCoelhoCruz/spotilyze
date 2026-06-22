import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const OutroScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
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
      <div style={{ opacity: fadeIn, textAlign: "center" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#ffffff",
          }}
        >
          Self-host in one command
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#1DB954",
            marginTop: 24,
            fontFamily: "monospace",
            backgroundColor: "#141414",
            padding: "16px 32px",
            borderRadius: 12,
            display: "inline-block",
          }}
        >
          docker compose up
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#737373",
            marginTop: 40,
          }}
        >
          github.com/GabrielCoelhoCruz/spotilyze
        </div>
      </div>
    </AbsoluteFill>
  );
};
