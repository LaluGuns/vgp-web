import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

function Control({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <div
      style={{
        width: primary ? 58 : 42,
        height: primary ? 58 : 42,
        borderRadius: primary ? 29 : 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary ? "1px solid rgba(180,244,255,0.34)" : "1px solid rgba(255,255,255,0.09)",
        background: primary
          ? "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.26) 0%, rgba(88,196,255,0.12) 48%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.025)",
        boxShadow: primary
          ? "0 0 22px rgba(88,196,255,0.15), inset 0 1px 0 rgba(255,255,255,0.24)"
          : "inset 0 1px 0 rgba(255,255,255,0.06)",
        color: primary ? "#f3fdff" : "rgba(255,255,255,0.52)",
        fontSize: primary ? 19 : 14,
        fontWeight: 700,
      }}
    >
      {children}
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
          padding: "34px 52px 38px",
          background:
            "radial-gradient(760px 440px at 20% 10%, rgba(29,74,202,0.23) 0%, rgba(29,74,202,0) 66%), radial-gradient(680px 460px at 86% 92%, rgba(0,208,255,0.13) 0%, rgba(0,208,255,0) 65%), linear-gradient(180deg, #060216 0%, #050411 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 29, fontWeight: 800, fontStyle: "italic", letterSpacing: -1, color: "#55d9ff" }}>flow</div>
          <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.28)" }}>flow.virzyguns.com</div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 12 }}>
          <div
            style={{
              width: 1030,
              height: 490,
              borderRadius: 28,
              display: "flex",
              flexDirection: "column",
              padding: "23px 28px 26px",
              border: "1px solid rgba(255,255,255,0.11)",
              background: "rgba(255,255,255,0.05)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.16)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.32)" }}>ATMOSPHERE</div>
                <div style={{ display: "flex", marginTop: 5, fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>Environmental Controls</div>
              </div>
              <div style={{ display: "flex", fontSize: 11, color: "rgba(88,196,255,0.72)" }}>Unified</div>
            </div>

            <div style={{ display: "flex", height: 43, marginTop: 14, padding: 4, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 700 }}>Music</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", fontSize: 13, color: "rgba(255,255,255,0.52)" }}>Ambient</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", fontSize: 13, color: "rgba(255,255,255,0.52)" }}>Theme</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 15, marginBottom: 8 }}>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.44)" }}>NOW PLAYING</div>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, color: "rgba(88,196,255,0.72)" }}>ORIGINALS</div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "18px 24px",
                borderRadius: 21,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.022) 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.13)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(88,196,255,0.27)", background: "rgba(255,255,255,0.025)", boxShadow: "0 0 14px rgba(88,196,255,0.11), inset 0 1px 0 rgba(255,255,255,0.11)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #58c4ff" }}>
                    <div style={{ width: 7, height: 7, borderRadius: 4, display: "flex", background: "#58c4ff" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 17, fontWeight: 700 }}>Neon Drive</div>
                  <div style={{ display: "flex", marginTop: 5, fontSize: 11, color: "rgba(255,255,255,0.39)" }}>Virzy Guns Production / Virzy Guns · City Pop</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                <div style={{ display: "flex", width: 38, fontSize: 10, color: "rgba(255,255,255,0.34)" }}>0:38</div>
                <div style={{ flex: 1, height: 4, borderRadius: 999, display: "flex", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                  <div style={{ width: "28%", height: 4, borderRadius: 999, display: "flex", background: "linear-gradient(90deg, #58c4ff, #00e5ff)" }} />
                </div>
                <div style={{ display: "flex", width: 38, justifyContent: "flex-end", fontSize: 10, color: "rgba(255,255,255,0.34)" }}>2:15</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 13 }}>
                <Control>↝</Control>
                <Control>◀</Control>
                <Control primary>▶</Control>
                <Control>▶</Control>
                <Control>↻</Control>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 13 }}>
                <div style={{ display: "flex", width: 22, fontSize: 14, color: "rgba(255,255,255,0.39)" }}>◖</div>
                <div style={{ flex: 1, height: 4, borderRadius: 999, display: "flex", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                  <div style={{ width: "58%", height: 4, display: "flex", borderRadius: 999, background: "linear-gradient(90deg, #58c4ff, #00e5ff)" }} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", fontSize: 9, fontWeight: 700, letterSpacing: 1.4, color: "rgba(255,255,255,0.38)" }}>CROSSFADE</div>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, color: "rgba(88,196,255,0.86)" }}>6s</div>
              </div>
              <div style={{ display: "flex", height: 4, borderRadius: 999, marginTop: 5, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                <div style={{ width: "50%", height: 4, borderRadius: 999, display: "flex", background: "linear-gradient(90deg, #58c4ff, #00e5ff)" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", height: 34, borderRadius: 17, marginTop: 10, padding: "0 13px", border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", flex: 1, fontSize: 11, color: "rgba(255,255,255,0.32)" }}>Search City Pop...</div>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.40)" }}>24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
