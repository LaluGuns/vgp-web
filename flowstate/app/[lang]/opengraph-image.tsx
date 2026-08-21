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
          position: "relative",
          overflow: "hidden",
          padding: "52px 64px",
          background:
            "radial-gradient(900px 520px at 18% 0%, rgba(25,113,255,0.30) 0%, rgba(25,113,255,0) 58%), radial-gradient(760px 460px at 88% 95%, rgba(0,222,255,0.20) 0%, rgba(0,222,255,0) 56%), linear-gradient(135deg, #040814 0%, #071226 54%, #071a3d 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "linear-gradient(145deg, rgba(143,234,255,0.25), rgba(30,112,255,0.10))",
                fontSize: 26,
                fontWeight: 800,
                color: "#9beeff",
              }}
            >
              f
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: -1.5,
                color: "#eafaff",
              }}
            >
              flow
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 17,
              color: "rgba(255,255,255,0.46)",
            }}
          >
            flow.virzyguns.com
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 1010,
              height: 396,
              borderRadius: 34,
              display: "flex",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.115) 0%, rgba(255,255,255,0.035) 100%)",
              boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
            }}
          >
            <div
              style={{
                width: 326,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                background: "radial-gradient(circle at 50% 43%, rgba(0,210,255,0.17), rgba(255,255,255,0.015) 60%)",
              }}
            >
              <div
                style={{
                  width: 188,
                  height: 188,
                  borderRadius: 94,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(164,241,255,0.34)",
                  background: "radial-gradient(circle at 35% 28%, #8df0ff 0%, #28c3ff 23%, #126ed0 43%, #0a3475 67%, #07152e 100%)",
                  boxShadow: "0 0 60px rgba(0,210,255,0.28)",
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 31,
                    display: "flex",
                    border: "1px solid rgba(255,255,255,0.34)",
                    background: "linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08))",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 32,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2.1,
                  textTransform: "uppercase",
                  color: "rgba(154,235,255,0.72)",
                }}
              >
                Deep work soundtrack
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "42px 48px 34px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2.4,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.40)",
                }}
              >
                Now playing
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 13,
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: -1.2,
                  color: "#f4fbff",
                }}
              >
                Focus music
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 17,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Virzy Guns Production
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 42,
                }}
              >
                <div
                  style={{
                    width: 430,
                    height: 8,
                    display: "flex",
                    borderRadius: 999,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.10)",
                  }}
                >
                  <div
                    style={{
                      width: 278,
                      height: "100%",
                      display: "flex",
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #72e9ff 0%, #00d8ff 56%, #438cff 100%)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.42)" }}>
                  24:18
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 18,
                  marginTop: 34,
                }}
              >
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.055)",
                    color: "rgba(255,255,255,0.70)",
                    fontSize: 20,
                  }}
                >
                  ◀
                </div>

                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(98,225,255,0.55)",
                    background: "linear-gradient(180deg, rgba(126,232,255,0.28) 0%, rgba(0,168,255,0.13) 100%)",
                    boxShadow: "0 0 34px rgba(0,213,255,0.28)",
                    color: "#dffaff",
                    fontSize: 25,
                  }}
                >
                  ▶
                </div>

                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.055)",
                    color: "rgba(255,255,255,0.70)",
                    fontSize: 20,
                  }}
                >
                  ▶
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 30,
                }}
              >
                <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.34)" }}>VOL</div>
                <div
                  style={{
                    width: 220,
                    height: 5,
                    display: "flex",
                    borderRadius: 999,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.09)",
                  }}
                >
                  <div
                    style={{
                      width: 154,
                      height: "100%",
                      display: "flex",
                      borderRadius: 999,
                      background: "rgba(139,235,255,0.72)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
