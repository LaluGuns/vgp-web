import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };
const FLOW_LOGO = "https://flow.virzyguns.com/icons/flowstate-logo.png";

type ControlIcon = "reset" | "pause" | "skip";

function ThemePill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        borderRadius: 999,
        border: active ? "1px solid rgba(88,196,255,0.72)" : "1px solid rgba(255,255,255,0.11)",
        background: active ? "#58c4ff" : "rgba(255,255,255,0.025)",
        color: active ? "#06101a" : "rgba(255,255,255,0.48)",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1.5,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

function IconShape({ icon, primary }: { icon: ControlIcon; primary: boolean }) {
  const color = primary ? "#67d7ff" : "rgba(255,255,255,0.46)";

  if (icon === "pause") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
        <div style={{ display: "flex", width: 4, height: 18, borderRadius: 2, background: color }} />
        <div style={{ display: "flex", width: 4, height: 18, borderRadius: 2, background: color }} />
      </div>
    );
  }

  if (icon === "reset") {
    return (
      <div style={{ width: 19, height: 19, position: "relative", display: "flex" }}>
        <div
          style={{
            position: "absolute",
            inset: 2,
            borderRadius: 9,
            display: "flex",
            border: `2px solid ${color}`,
            borderRightColor: "transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 1,
            top: 2,
            width: 6,
            height: 6,
            display: "flex",
            borderTop: `2px solid ${color}`,
            borderRight: `2px solid ${color}`,
            transform: "rotate(20deg)",
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ width: 20, height: 18, position: "relative", display: "flex", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          left: 3,
          width: 10,
          height: 10,
          display: "flex",
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
          transform: "rotate(45deg)",
        }}
      />
      <div style={{ position: "absolute", right: 2, width: 2, height: 15, display: "flex", borderRadius: 1, background: color }} />
    </div>
  );
}

function SmallButton({ icon, primary = false }: { icon: ControlIcon; primary?: boolean }) {
  return (
    <div
      style={{
        width: primary ? 62 : 46,
        height: primary ? 62 : 46,
        borderRadius: primary ? 31 : 23,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary ? "2px solid rgba(88,196,255,0.95)" : "1px solid rgba(255,255,255,0.08)",
        background: primary
          ? "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.20) 0%, rgba(88,196,255,0.10) 52%, rgba(5,8,20,0.15) 100%)"
          : "rgba(255,255,255,0.015)",
        boxShadow: primary
          ? "0 0 20px rgba(88,196,255,0.38), inset 0 1px 0 rgba(255,255,255,0.20)"
          : "none",
      }}
    >
      <IconShape icon={icon} primary={primary} />
    </div>
  );
}

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "28px 48px 30px",
          color: "white",
          fontFamily: "sans-serif",
          background:
            "radial-gradient(760px 470px at 18% 5%, rgba(24,86,190,0.30) 0%, rgba(24,86,190,0) 68%), radial-gradient(680px 500px at 82% 18%, rgba(57,44,180,0.26) 0%, rgba(57,44,180,0) 70%), linear-gradient(135deg, #09162d 0%, #15103d 52%, #071733 100%)",
        }}
      >
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <img
            src={FLOW_LOGO}
            alt="Flow"
            width={164}
            height={58}
            style={{ width: 164, height: 58, objectFit: "contain", objectPosition: "left center" }}
          />
          <div style={{ display: "flex", fontSize: 12, color: "rgba(255,255,255,0.30)", letterSpacing: 0.3 }}>
            flow.virzyguns.com
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 48 }}>
          <ThemePill label="Dynamic Glass" active />
          <ThemePill label="Analog Studio" />
          <ThemePill label="Instrument Panel" />
          <ThemePill label="Editorial" />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 930,
              height: 450,
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "radial-gradient(120% 100% at 50% 0%, hsl(250 45% 12%) 0%, hsl(258 60% 5%) 55%, hsl(260 55% 3%) 100%)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 286,
                  height: 286,
                  borderRadius: 143,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background:
                    "radial-gradient(circle at 33% 24%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 18%, rgba(88,196,255,0.05) 46%, rgba(8,14,42,0.20) 70%, rgba(4,5,18,0.50) 100%)",
                  boxShadow:
                    "0 0 32px rgba(88,196,255,0.16), 0 0 78px rgba(0,174,255,0.10), inset 0 16px 26px rgba(255,255,255,0.11), inset 0 -20px 30px rgba(0,0,0,0.30)",
                }}
              >
                <div
                  style={{
                    width: 254,
                    height: 254,
                    borderRadius: 127,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid rgba(185,241,255,0.28)",
                    background:
                      "radial-gradient(circle at 34% 24%, #d7fbff 0%, #76e8ff 11%, #2ad3ec 26%, #20b9d2 40%, #178bb3 58%, #12618f 72%, #0d365f 86%, #081a35 100%)",
                    boxShadow:
                      "0 0 28px rgba(0,220,255,0.40), 0 0 64px rgba(0,190,255,0.25), inset 22px 20px 34px rgba(255,255,255,0.12), inset -30px -34px 50px rgba(0,18,70,0.40)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 22,
                      top: 18,
                      width: 152,
                      height: 96,
                      borderRadius: 76,
                      display: "flex",
                      background: "radial-gradient(circle at 45% 35%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 75%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 22,
                      bottom: 26,
                      width: 126,
                      height: 92,
                      borderRadius: 64,
                      display: "flex",
                      background: "radial-gradient(circle, rgba(14,74,173,0.30) 0%, rgba(14,74,173,0) 75%)",
                    }}
                  />
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 143,
                    display: "flex",
                    border: "10px solid rgba(255,255,255,0.035)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 143,
                    display: "flex",
                    borderTop: "10px solid #00e5ff",
                    borderRight: "10px solid #0b8dff",
                    borderBottom: "10px solid transparent",
                    borderLeft: "10px solid transparent",
                    transform: "rotate(-45deg)",
                    opacity: 0.95,
                    boxShadow: "0 0 18px rgba(0,213,255,0.15)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: 48,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(88,196,255,0.24)",
                    background: "rgba(0,0,0,0.34)",
                    color: "#58c4ff",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 2,
                  }}
                >
                  <div style={{ display: "flex", width: 6, height: 6, borderRadius: 3, background: "#58c4ff", boxShadow: "0 0 8px rgba(88,196,255,0.9)" }} />
                  WORK
                </div>

                <div
                  style={{
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 78,
                    fontWeight: 700,
                    letterSpacing: -3,
                    color: "white",
                    textShadow: "0 4px 20px rgba(88,196,255,0.35)",
                  }}
                >
                  08:08
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 48,
                    display: "flex",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.46)",
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                  }}
                >
                  interactive product preview
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.20)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 100%)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <SmallButton icon="reset" />
                <SmallButton icon="pause" primary />
                <SmallButton icon="skip" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
