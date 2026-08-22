import { ImageResponse } from "next/og";

export const alt = "Flow by Virzy Guns — Deep Work Music & Pomodoro Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLOW_LOGO = "https://flow.virzyguns.com/icons/flowstate-logo.png";
const CYAN = "#58c4ff";

function Control({ label, primary = false }: { label: string; primary?: boolean }) {
  return (
    <div
      style={{
        width: primary ? 56 : 40,
        height: primary ? 56 : 40,
        borderRadius: primary ? 28 : 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.08)",
        background: primary
          ? "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 52%, rgba(255,255,255,0.01) 100%)"
          : "rgba(255,255,255,0.025)",
        boxShadow: primary
          ? "inset 0 10px 14px rgba(255,255,255,0.14), inset 0 -5px 9px rgba(0,0,0,0.18), 0 4px 15px rgba(0,0,0,0.26)"
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
        color: primary ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.50)",
        fontSize: primary ? 20 : 14,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}

function Slider({ width, fill }: { width: number; fill: number }) {
  return (
    <div style={{ display: "flex", width, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          width: Math.round(width * fill),
          height: 4,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${CYAN}, #00e5ff)`,
          boxShadow: "0 0 10px rgba(0,229,255,0.28)",
        }}
      />
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
          overflow: "hidden",
          padding: "28px 46px 34px",
          background:
            "radial-gradient(760px 470px at 18% 14%, rgba(30,70,190,0.26) 0%, rgba(30,70,190,0) 66%), radial-gradient(650px 520px at 87% 87%, rgba(0,229,255,0.16) 0%, rgba(0,229,255,0) 63%), #060216",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 46, alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          <img
            src={FLOW_LOGO}
            alt="Flow"
            width={142}
            height={42}
            style={{ width: 142, height: 42, objectFit: "contain", objectPosition: "left center" }}
          />
          <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.28)" }}>flow.virzyguns.com</div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
          <div
            style={{
              width: 1040,
              height: 500,
              display: "flex",
              flexDirection: "column",
              borderRadius: 28,
              padding: "24px 28px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.24)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.045)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2.1, color: "rgba(255,255,255,0.30)" }}>ATMOSPHERE</div>
                <div style={{ display: "flex", marginTop: 5, fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>Environmental Controls</div>
              </div>
              <div style={{ display: "flex", fontSize: 11, fontFamily: "monospace", color: "rgba(88,196,255,0.70)" }}>Unified</div>
            </div>

            <div style={{ display: "flex", height: 44, marginTop: 15, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.035)", padding: 4 }}>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", borderRadius: 10, background: "rgba(255,255,255,0.085)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>Music</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.56)" }}>Ambient</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.56)" }}>Theme</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.45)" }}>NOW PLAYING</div>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "rgba(88,196,255,0.70)" }}>ORIGINALS</div>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                borderRadius: 22,
                padding: "20px 26px 18px",
                background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 60%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 4px 18px rgba(0,0,0,0.14)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012))", border: "1px solid rgba(88,196,255,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 15px rgba(88,196,255,0.14)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${CYAN}`, boxShadow: "0 0 10px rgba(88,196,255,0.20)" }}>
                    <div style={{ width: 7, height: 7, borderRadius: 4, display: "flex", background: CYAN }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.97)" }}>Neon Drive</div>
                  <div style={{ display: "flex", marginTop: 5, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.40)" }}>Virzy Guns Production / Virzy Guns · City Pop</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: 16 }}>
                <Slider width={884} fill={0.28} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                  <div style={{ display: "flex" }}>0:38</div>
                  <div style={{ display: "flex" }}>2:15</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
                <Control label="↝" />
                <Control label="◀" />
                <Control label="▶" primary />
                <Control label="▶" />
                <Control label="↻" />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 11, padding: "0 4px" }}>
                <div style={{ display: "flex", width: 18, fontSize: 14, color: "rgba(255,255,255,0.42)" }}>◖</div>
                <Slider width={850} fill={0.58} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: 9, padding: "0 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.40)" }}>
                  <div style={{ display: "flex" }}>CROSSFADE</div>
                  <div style={{ display: "flex", color: "rgba(88,196,255,0.9)" }}>6s</div>
                </div>
                <div style={{ display: "flex", marginTop: 5 }}><Slider width={884} fill={0.5} /></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", height: 34, borderRadius: 17, marginTop: 9, padding: "0 13px", background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div style={{ display: "flex", width: 24, fontSize: 15, color: "rgba(255,255,255,0.38)" }}>⌕</div>
                <div style={{ display: "flex", flex: 1, fontSize: 11, color: "rgba(255,255,255,0.34)" }}>Search City Pop...</div>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.42)" }}>24</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
