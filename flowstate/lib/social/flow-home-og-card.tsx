import { ImageResponse } from "next/og";

const SIZE = { width: 1200, height: 630 };
const FLOW_LOGO = "https://flow.virzyguns.com/icons/flowstate-logo.png";

type ControlIcon = "reset" | "pause" | "skip";

function ThemePill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 16px",
        borderRadius: 999,
        border: active ? "1px solid rgba(0,229,255,0.92)" : "1px solid rgba(255,255,255,0.14)",
        background: active ? "rgba(0,229,255,0.16)" : "rgba(255,255,255,0.025)",
        color: active ? "#dffcff" : "rgba(255,255,255,0.58)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        boxShadow: active ? "0 0 24px rgba(0,229,255,0.20), inset 0 1px 0 rgba(255,255,255,0.16)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {label}
    </div>
  );
}

function IconShape({ icon, primary = false }: { icon: ControlIcon; primary?: boolean }) {
  const color = primary ? "#dcfbff" : "rgba(255,255,255,0.74)";

  if (icon === "pause") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ display: "flex", width: 5, height: 22, borderRadius: 3, background: color }} />
        <div style={{ display: "flex", width: 5, height: 22, borderRadius: 3, background: color }} />
      </div>
    );
  }

  if (icon === "reset") {
    return (
      <div style={{ width: 22, height: 22, position: "relative", display: "flex" }}>
        <div style={{ position: "absolute", inset: 3, borderRadius: 9, display: "flex", border: `2px solid ${color}`, borderRightColor: "transparent" }} />
        <div style={{ position: "absolute", right: 1, top: 2, width: 7, height: 7, display: "flex", borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, transform: "rotate(20deg)" }} />
      </div>
    );
  }

  return (
    <div style={{ width: 24, height: 22, position: "relative", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 3, width: 12, height: 12, display: "flex", borderTop: `3px solid ${color}`, borderRight: `3px solid ${color}`, transform: "rotate(45deg)" }} />
      <div style={{ position: "absolute", right: 2, width: 3, height: 18, display: "flex", borderRadius: 2, background: color }} />
    </div>
  );
}

function ControlButton({ icon, primary = false }: { icon: ControlIcon; primary?: boolean }) {
  return (
    <div
      style={{
        width: primary ? 64 : 54,
        height: primary ? 64 : 54,
        borderRadius: primary ? 20 : 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary ? "1px solid rgba(0,229,255,0.92)" : "1px solid rgba(255,255,255,0.13)",
        background: primary ? "radial-gradient(circle at 36% 22%, rgba(255,255,255,0.20), rgba(0,229,255,0.10) 55%, rgba(5,12,34,0.18) 100%)" : "rgba(255,255,255,0.025)",
        boxShadow: primary ? "0 0 26px rgba(0,229,255,0.28), inset 0 1px 0 rgba(255,255,255,0.20)" : "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <IconShape icon={icon} primary={primary} />
    </div>
  );
}

function CtaGlyph() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 35% 30%, #9ff7ff 0%, #32c9ff 48%, #2867d9 100%)", boxShadow: "0 0 18px rgba(0,229,255,0.35)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <div style={{ display: "flex", width: 2, height: 8, borderRadius: 1, background: "#07234a" }} />
        <div style={{ display: "flex", width: 2, height: 15, borderRadius: 1, background: "#07234a" }} />
        <div style={{ display: "flex", width: 2, height: 11, borderRadius: 1, background: "#07234a" }} />
        <div style={{ display: "flex", width: 2, height: 17, borderRadius: 1, background: "#07234a" }} />
        <div style={{ display: "flex", width: 2, height: 9, borderRadius: 1, background: "#07234a" }} />
      </div>
    </div>
  );
}

export function renderFlowHomeOgCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "36px 58px 42px",
          color: "white",
          fontFamily: "sans-serif",
          background: "radial-gradient(620px 500px at 51% 56%, rgba(0,154,255,0.34) 0%, rgba(0,154,255,0.08) 45%, rgba(0,154,255,0) 72%), radial-gradient(620px 470px at 85% 12%, rgba(68,40,196,0.32) 0%, rgba(68,40,196,0) 72%), radial-gradient(560px 420px at 8% 18%, rgba(0,112,255,0.22) 0%, rgba(0,112,255,0) 72%), linear-gradient(135deg, #06132d 0%, #101644 46%, #180b43 72%, #06142d 100%)",
        }}
      >
        <div style={{ position: "absolute", left: 380, top: 120, width: 440, height: 440, borderRadius: 220, display: "flex", background: "radial-gradient(circle, rgba(0,213,255,0.18) 0%, rgba(0,140,255,0.08) 42%, rgba(0,100,255,0) 72%)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
          <img src={FLOW_LOGO} alt="Flow" width={182} height={62} style={{ width: 182, height: 62, objectFit: "contain", objectPosition: "left center" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemePill label="Dynamic Glass" active />
            <ThemePill label="Analog Studio" />
            <ThemePill label="Instrument Panel" />
            <ThemePill label="Editorial" />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", position: "relative" }}>
          <div style={{ width: 390, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 38, lineHeight: 1.12, fontWeight: 500, letterSpacing: -0.8, color: "rgba(255,255,255,0.96)" }}>
              <div style={{ display: "flex" }}>Deep work music</div>
              <div style={{ display: "flex" }}>and focus timer</div>
            </div>
            <div style={{ display: "flex", marginTop: 22, width: 290, height: 66, borderRadius: 20, alignItems: "center", padding: "0 20px", gap: 14, border: "1px solid rgba(0,229,255,0.95)", background: "linear-gradient(180deg, rgba(18,88,160,0.40) 0%, rgba(6,36,94,0.34) 100%)", boxShadow: "0 0 30px rgba(0,229,255,0.20), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              <CtaGlyph />
              <div style={{ display: "flex", fontSize: 19, fontWeight: 700, color: "white" }}>Start Focusing Free</div>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
            <div style={{ width: 318, height: 318, borderRadius: 159, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.18)", background: "radial-gradient(circle at 34% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 18%, rgba(0,229,255,0.07) 46%, rgba(8,15,44,0.23) 72%, rgba(5,8,28,0.44) 100%)", boxShadow: "0 0 40px rgba(0,229,255,0.18), 0 0 90px rgba(0,132,255,0.16), inset 0 18px 30px rgba(255,255,255,0.13), inset 0 -24px 38px rgba(0,0,0,0.30)" }}>
              <div style={{ width: 286, height: 286, borderRadius: 143, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid rgba(185,241,255,0.32)", background: "radial-gradient(circle at 34% 22%, #d9fbff 0%, #7ceaff 10%, #27d4ef 24%, #1eb5dc 40%, #197fbb 58%, #17539a 72%, #142d68 86%, #0c173c 100%)", boxShadow: "0 0 34px rgba(0,220,255,0.46), 0 0 78px rgba(0,170,255,0.27), inset 24px 20px 38px rgba(255,255,255,0.16), inset -34px -40px 58px rgba(0,12,70,0.44)" }}>
                <div style={{ position: "absolute", left: 22, top: 18, width: 178, height: 106, borderRadius: 86, display: "flex", background: "radial-gradient(circle at 42% 34%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0) 75%)" }} />
                <div style={{ position: "absolute", right: 20, bottom: 20, width: 142, height: 110, borderRadius: 70, display: "flex", background: "radial-gradient(circle, rgba(64,34,180,0.30) 0%, rgba(64,34,180,0) 72%)" }} />
              </div>

              <div style={{ position: "absolute", inset: 0, borderRadius: 159, display: "flex", border: "8px solid rgba(255,255,255,0.035)" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: 159, display: "flex", borderTop: "8px solid #21e9ff", borderRight: "8px solid #43c8ff", borderBottom: "8px solid transparent", borderLeft: "8px solid transparent", transform: "rotate(-44deg)", opacity: 0.96, boxShadow: "0 0 20px rgba(0,213,255,0.15)" }} />
              <div style={{ position: "absolute", right: 18, bottom: 58, width: 14, height: 14, borderRadius: 7, display: "flex", background: "#69f1ff", boxShadow: "0 0 16px rgba(0,229,255,0.85)" }} />

              <div style={{ position: "absolute", top: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(0,229,255,0.48)", background: "rgba(3,25,62,0.55)", color: "#5befff", fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>WORK</div>
              <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, fontWeight: 500, letterSpacing: -3, color: "#dffcff", textShadow: "0 0 22px rgba(100,244,255,0.72)" }}>08:08</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18, padding: "8px 14px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.025)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
              <ControlButton icon="reset" />
              <ControlButton icon="pause" primary />
              <ControlButton icon="skip" />
            </div>
          </div>
        </div>
      </div>
    ),
    SIZE
  );
}
