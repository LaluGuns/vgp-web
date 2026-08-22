import { ImageResponse } from "next/og";

export const alt = "Flow by Virzy Guns — Deep Work Music & Pomodoro Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLOW_LOGO = "https://flow.virzyguns.com/icons/flowstate-logo.png";

function Control({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <div
      style={{
        width: primary ? 70 : 48,
        height: primary ? 70 : 48,
        borderRadius: primary ? 35 : 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary
          ? "1px solid rgba(162,244,255,0.58)"
          : "1px solid rgba(255,255,255,0.11)",
        background: primary
          ? "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.34) 0%, rgba(90,216,255,0.21) 34%, rgba(18,96,185,0.11) 100%)"
          : "rgba(255,255,255,0.025)",
        boxShadow: primary
          ? "0 0 30px rgba(0,210,255,0.22), inset 0 1px 0 rgba(255,255,255,0.28)"
          : "inset 0 1px 0 rgba(255,255,255,0.07)",
        color: primary ? "#e9fcff" : "rgba(255,255,255,0.58)",
        fontSize: primary ? 25 : 19,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

export default function FlowSocialCard() {
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
          padding: "42px 58px 48px",
          background:
            "radial-gradient(780px 390px at 32% 18%, rgba(27,93,228,0.14) 0%, rgba(27,93,228,0) 62%), radial-gradient(760px 430px at 78% 92%, rgba(0,193,255,0.10) 0%, rgba(0,193,255,0) 62%), linear-gradient(180deg, #03050a 0%, #050812 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 58,
          }}
        >
          <div
            style={{
              width: 196,
              height: 58,
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={FLOW_LOGO}
              alt="Flow"
              width={196}
              height={58}
              style={{
                width: 196,
                height: 58,
                objectFit: "contain",
                objectPosition: "left center",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "rgba(255,255,255,0.34)",
              letterSpacing: 0.2,
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
            paddingTop: 18,
          }}
        >
          <div
            style={{
              width: 1084,
              height: 436,
              borderRadius: 32,
              display: "flex",
              alignItems: "stretch",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "linear-gradient(135deg, rgba(10,15,27,0.95) 0%, rgba(4,8,16,0.90) 55%, rgba(5,11,22,0.92) 100%)",
              boxShadow:
                "0 34px 90px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                background:
                  "radial-gradient(circle at 48% 51%, rgba(0,221,255,0.09) 0%, rgba(0,221,255,0) 52%)",
              }}
            >
              <div
                style={{
                  width: 248,
                  height: 248,
                  borderRadius: 124,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  background:
                    "radial-gradient(circle at 33% 23%, #d9fbff 0%, #82eaff 13%, #36c9ff 31%, #1286d8 54%, #0a4c97 72%, #071f4a 88%, #061329 100%)",
                  border: "1px solid rgba(175,244,255,0.52)",
                  boxShadow:
                    "0 0 22px rgba(0,211,255,0.42), 0 0 70px rgba(0,184,255,0.25), inset -28px -34px 60px rgba(0,15,59,0.48), inset 18px 18px 34px rgba(255,255,255,0.22)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 172,
                    height: 172,
                    left: 24,
                    top: 17,
                    borderRadius: 86,
                    display: "flex",
                    border: "1px solid rgba(238,253,255,0.24)",
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.34) 0%, rgba(160,239,255,0.08) 47%, rgba(18,73,150,0.02) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    width: 66,
                    height: 40,
                    left: 52,
                    top: 31,
                    borderRadius: 36,
                    display: "flex",
                    background: "rgba(255,255,255,0.34)",
                    filter: "blur(8px)",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "58px 66px 42px 26px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 800,
                    letterSpacing: -0.7,
                    color: "#f5f7fb",
                  }}
                >
                  Deep Focus
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 7,
                    fontSize: 17,
                    color: "rgba(255,255,255,0.39)",
                  }}
                >
                  Soothe
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 52,
                }}
              >
                <div
                  style={{
                    width: 42,
                    display: "flex",
                    justifyContent: "flex-start",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.30)",
                  }}
                >
                  0:00
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    display: "flex",
                    background: "rgba(255,255,255,0.16)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      display: "flex",
                      background: "#92efff",
                      boxShadow: "0 0 10px rgba(110,232,255,0.65)",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 42,
                    display: "flex",
                    justifyContent: "flex-end",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.30)",
                  }}
                >
                  5:30
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 36,
                }}
              >
                <Control>⤨</Control>
                <Control>◀</Control>
                <Control primary>▶</Control>
                <Control>▶</Control>
                <Control>↻</Control>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 34,
                }}
              >
                <div
                  style={{
                    width: 26,
                    display: "flex",
                    fontSize: 15,
                    color: "rgba(255,255,255,0.34)",
                  }}
                >
                  ◖
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 999,
                    display: "flex",
                    background: "rgba(255,255,255,0.14)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "46%",
                      height: "100%",
                      borderRadius: 999,
                      display: "flex",
                      background:
                        "linear-gradient(90deg, rgba(116,233,255,0.95), rgba(84,196,255,0.88))",
                      boxShadow: "0 0 12px rgba(0,211,255,0.28)",
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
