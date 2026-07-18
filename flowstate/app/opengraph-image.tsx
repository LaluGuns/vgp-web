import { ImageResponse } from "next/og";

export const alt = "Flow by Virzy Guns — Deep Work Music & Pomodoro Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(120% 120% at 30% 20%, #0b1f4d 0%, #0a0730 55%, #06122e 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Cyan glow accent */}
        <div
          style={{
            position: "absolute",
            top: 140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,255,0.22) 0%, rgba(0,229,255,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -3,
            background: "linear-gradient(135deg, #9fe9ff 0%, #00e5ff 50%, #00a3ff 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          flow
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            marginTop: 4,
          }}
        >
          by Virzy Guns
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "rgba(255,255,255,0.7)",
            marginTop: 16,
          }}
        >
          Get in the zone — deep work music &amp; focus timer
        </div>
      </div>
    ),
    { ...size }
  );
}
