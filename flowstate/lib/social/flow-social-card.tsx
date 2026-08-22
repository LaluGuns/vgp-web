import { ImageResponse } from "next/og";

export const alt = "Flow by Virzy Guns — Deep Work Music & Pomodoro Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLOW_LOGO = "https://flow.virzyguns.com/icons/flowstate-logo.png";
const CYAN = "#58c4ff";

type IconName =
  | "music"
  | "volume"
  | "palette"
  | "disc"
  | "shuffle"
  | "back"
  | "play"
  | "next"
  | "repeat"
  | "search";

function Icon({ name, size = 18, color = "currentColor" }: { name: IconName; size?: number; color?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "music") {
    return <svg {...common}><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>;
  }
  if (name === "volume") {
    return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a8.5 8.5 0 0 1 0 12"/></svg>;
  }
  if (name === "palette") {
    return <svg {...common}><path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a7 7 0 0 0-2-9Z"/><circle cx="7.5" cy="10" r=".8" fill={color} stroke="none"/><circle cx="10" cy="6.5" r=".8" fill={color} stroke="none"/><circle cx="15" cy="7" r=".8" fill={color} stroke="none"/></svg>;
  }
  if (name === "disc") {
    return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/><path d="M12 3a9 9 0 0 1 7.5 4"/><path d="M4.5 17A9 9 0 0 0 12 21"/></svg>;
  }
  if (name === "shuffle") {
    return <svg {...common}><path d="M16 3h5v5"/><path d="m21 3-7 7"/><path d="M4 6h3l10 12h4"/><path d="M16 18h5v-5"/><path d="M4 18h3l3-3.5"/></svg>;
  }
  if (name === "back") {
    return <svg {...common}><path d="M19 20 9 12l10-8v16Z"/><path d="M5 19V5"/></svg>;
  }
  if (name === "play") {
    return <svg {...common}><path d="m8 5 11 7-11 7V5Z" fill={color} stroke={color}/></svg>;
  }
  if (name === "next") {
    return <svg {...common}><path d="m5 4 10 8-10 8V4Z"/><path d="M19 5v14"/></svg>;
  }
  if (name === "repeat") {
    return <svg {...common}><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>;
  }
  return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

function SmallControl({ name }: { name: IconName }) {
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.48)",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <Icon name={name} size={16} color="rgba(255,255,255,0.54)" />
    </div>
  );
}

function SliderLine({ value = 0.42, knob = false }: { value?: number; knob?: boolean }) {
  const pct = `${Math.round(value * 100)}%`;
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", height: 14, position: "relative" }}>
      <div style={{ display: "flex", width: "100%", height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ display: "flex", width: pct, height: 4, borderRadius: 999, background: `linear-gradient(90deg, ${CYAN}, #00e5ff)`, boxShadow: "0 0 10px rgba(0,229,255,0.35)" }} />
      </div>
      {knob ? (
        <div style={{ display: "flex", position: "absolute", left: `calc(${pct} - 6px)`, width: 12, height: 12, borderRadius: 6, background: "#dffbff", border: "2px solid rgba(88,196,255,0.9)", boxShadow: "0 0 10px rgba(88,196,255,0.45)" }} />
      ) : null}
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
          padding: "28px 46px 34px",
          background:
            "radial-gradient(760px 470px at 18% 14%, rgba(30,70,190,0.26) 0%, rgba(30,70,190,0) 66%), radial-gradient(650px 520px at 87% 87%, rgba(0,229,255,0.16) 0%, rgba(0,229,255,0) 63%), radial-gradient(560px 420px at 63% 13%, rgba(114,55,255,0.12) 0%, rgba(114,55,255,0) 70%), #060216",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 48, alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          <img src={FLOW_LOGO} alt="Flow" width={142} height={42} style={{ width: 142, height: 42, objectFit: "contain", objectPosition: "left center" }} />
          <div style={{ display: "flex", fontSize: 13, color: "rgba(255,255,255,0.28)", letterSpacing: 0.2 }}>flow.virzyguns.com</div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
          <div
            style={{
              width: 1040,
              height: 500,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              borderRadius: 28,
              padding: "24px 28px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 18px 48px rgba(0,0,0,0.28), 0 0 30px rgba(88,196,255,0.06), inset 0 1px 0 rgba(255,255,255,0.24)",
            }}
          >
            <div style={{ display: "flex", position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.025) 28%, transparent 58%)" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 15, borderBottom: "1px solid rgba(255,255,255,0.045)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2.1, color: "rgba(255,255,255,0.30)" }}>ATMOSPHERE</div>
                <div style={{ display: "flex", marginTop: 5, fontSize: 17, fontWeight: 700, letterSpacing: -0.2, color: "rgba(255,255,255,0.96)" }}>Environmental Controls</div>
              </div>
              <div style={{ display: "flex", fontSize: 11, fontFamily: "monospace", color: "rgba(88,196,255,0.70)" }}>Unified</div>
            </div>

            <div style={{ display: "flex", height: 44, marginTop: 15, borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.035)", padding: 4, position: "relative" }}>
              <div style={{ display: "flex", position: "absolute", left: 4, top: 4, bottom: 4, width: "32.5%", borderRadius: 11, background: "rgba(255,255,255,0.085)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.19)" }} />
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "white", zIndex: 2 }}><Icon name="music" size={15} color="white" />Music</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.56)", zIndex: 2 }}><Icon name="volume" size={15} color="rgba(255,255,255,0.56)" />Ambient</div>
              <div style={{ display: "flex", width: "33.333%", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.56)", zIndex: 2 }}><Icon name="palette" size={15} color="rgba(255,255,255,0.56)" />Theme</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 2.0, color: "rgba(255,255,255,0.45)" }}>NOW PLAYING</div>
              <div style={{ display: "flex", fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "rgba(88,196,255,0.70)" }}>ORIGINALS</div>
            </div>

            <div
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                position: "relative",
                borderRadius: 22,
                padding: "22px 26px 20px",
                background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 60%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 4px 18px rgba(0,0,0,0.14)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 58, height: 58, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012))", border: "1px solid rgba(88,196,255,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 15px rgba(88,196,255,0.14)" }}>
                  <div style={{ display: "flex", position: "absolute", inset: 2, borderRadius: 11, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0))" }} />
                  <Icon name="disc" size={30} color={CYAN} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <div style={{ display: "flex", fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.97)" }}>Neon Drive</div>
                  <div style={{ display: "flex", marginTop: 5, fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.40)" }}>Virzy Guns Production / Virzy Guns · City Pop</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: 16 }}>
                <SliderLine value={0.28} knob />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", marginTop: 2 }}><span>0:38</span><span>2:15</span></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 10 }}>
                <SmallControl name="shuffle" />
                <SmallControl name="back" />
                <div style={{ width: 58, height: 58, borderRadius: 29, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "1px solid rgba(255,255,255,0.22)", background: "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.01) 100%)", boxShadow: "inset 0 12px 16px rgba(255,255,255,0.16), inset 0 -6px 10px rgba(0,0,0,0.20), inset 0 0 18px rgba(88,196,255,0.16), 0 4px 16px rgba(0,0,0,0.30)" }}>
                  <div style={{ display: "flex", position: "absolute", inset: 2, borderRadius: 28, background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))" }} />
                  <Icon name="play" size={21} color="rgba(255,255,255,0.92)" />
                </div>
                <SmallControl name="next" />
                <SmallControl name="repeat" />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 12, padding: "0 4px" }}>
                <Icon name="volume" size={15} color="rgba(255,255,255,0.44)" />
                <SliderLine value={0.58} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: 10, padding: "0 4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.40)" }}><span>CROSSFADE</span><span style={{ color: "rgba(88,196,255,0.9)" }}>6s</span></div>
                <div style={{ display: "flex", marginTop: 5 }}><SliderLine value={0.5} /></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 9, height: 34, borderRadius: 17, marginTop: 9, padding: "0 13px", background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <Icon name="search" size={14} color="rgba(255,255,255,0.40)" />
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
