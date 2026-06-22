import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export const DashboardScene = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const slideUp = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 60,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ opacity: fadeIn, transform: `translateY(${slideUp}px)` }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#1DB954",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Overview
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              marginTop: 8,
            }}
          >
            Dashboard
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
          {[
            { label: "Total Listens", value: "1,247", color: "#1DB954" },
            { label: "Unique Tracks", value: "342", color: "#a3a3a3" },
            { label: "Minutes Listened", value: "4,891", color: "#a3a3a3" },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: "#141414",
                borderRadius: 16,
                padding: 24,
                border: i === 0 ? "1px solid #1DB95440" : "1px solid #333",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#737373",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: stat.color,
                  marginTop: 8,
                  fontFamily: "monospace",
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div
          style={{
            backgroundColor: "#141414",
            borderRadius: 16,
            padding: 32,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #333",
          }}
        >
          <div style={{ textAlign: "center", color: "#525252" }}>
            <div style={{ fontSize: 48 }}>📊</div>
            <div style={{ marginTop: 16 }}>Genre Distribution & Listening Heatmap</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
