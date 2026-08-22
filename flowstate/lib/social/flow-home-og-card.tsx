import { ImageResponse } from "next/og";

const SIZE = { width: 1200, height: 630 };

type ControlIcon = "previous" | "pause" | "skip";

function IconShape({ icon, primary = false }: { icon: ControlIcon; primary?: boolean }) {
  const color = primary ? "#ffffff" : "rgba(255,255,255,0.88)";

  if (icon === "pause") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
        <div style={{ width: 6, height: 24, borderRadius: 4, display: "flex", background: color }} />
        <div style={{ width: 6, height: 24, borderRadius: 4, display: "flex", background: color }} />
      </div>
    );
  }

  if (icon === "previous") {
    return (
      <div style={{ width: 26, height: 24, position: "relative", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 2, width: 4, height: 19, borderRadius: 3, display: "flex", background: color }} />
        <div style={{ position: "absolute", left: 9, width: 13, height: 13, display: "flex", borderTop: `4px solid ${color}`, borderRight: `4px solid ${color}`, transform: "rotate(225deg)" }} />
      </div>
    );
  }

  return (
    <div style={{ width: 26, height: 24, position: "relative", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 4, width: 13, height: 13, display: "flex", borderTop: `4px solid ${color}`, borderRight: `4px solid ${color}`, transform: "rotate(45deg)" }} />
      <div style={{ position: "absolute", right: 2, width: 4, height: 19, borderRadius: 3, display: "flex", background: color }} />
    </div>
  );
}

function ControlButton({ icon, primary = false }: { icon: ControlIcon; primary?: boolean }) {
  return (
    <div
      style={{
        width: primary ? 72 : 60,
        height: primary ? 72 : 60,
        borderRadius: primary ? 26 : 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: primary ? "1px solid rgba(255,255,255,0.76)" : "1px solid rgba(255,255,255,0.38)",
        background: primary
          ? "linear-gradient(145deg, rgba(255,255,255,0.34) 0%, rgba(95,225,255,0.36) 46%, rgba(49,152,255,0.38) 100%)"
          : "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(94,207,255,0.20) 100%)",
        boxShadow: primary
          ? "0 16px 42px rgba(16,99,226,0.26), inset 0 1px 0 rgba(255,255,255,0.62)"
          : "inset 0 1px 0 rgba(255,255,255,0.42)",
      }}
    >
      <IconShape icon={icon} primary={primary} />
    </div>
  );
}

function FlowMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.62)",
          background: "linear-gradient(145deg, rgba(255,255,255,0.34), rgba(97,224,255,0.32))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.72), 0 14px 34px rgba(35,118,238,0.18)",
        }}
      >
        <div style={{ display: "flex", fontSize: 31, lineHeight: 1, fontWeight: 800, color: "white", transform: "translateY(-1px)" }}>f</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 11 }}>
        <div style={{ display: "flex", fontSize: 38, lineHeight: 1, fontWeight: 760, letterSpacing: -1.8, color: "white" }}>flow</div>
        <div style={{ display: "flex", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: "rgba(255,255,255,0.76)" }}>BY VIRZY GUNS</div>
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
          padding: "38px 48px 42px",
          color: "white",
          fontFamily: "sans-serif",
          background: "linear-gradient(135deg, #116dff 0%, #128fff 42%, #19c8ff 100%)",
        }}
      >
        <div style={{ position: "absolute", left: -120, top: -180, width: 560, height: 560, borderRadius: 280, display: "flex", background: "radial-gradient(circle, rgba(255,255,255,0.40) 0%, rgba(185,244,255,0.20) 42%, rgba(185,244,255,0) 74%)" }} />
        <div style={{ position: "absolute", right: -120, bottom: -220, width: 680, height: 680, borderRadius: 340, display: "flex", background: "radial-gradient(circle, rgba(142,236,255,0.56) 0%, rgba(99,186,255,0.22) 48%, rgba(99,186,255,0) 75%)" }} />
        <div style={{ position: "absolute", left: 380, top: 60, width: 600, height: 470, borderRadius: 250, display: "flex", background: "radial-gradient(circle, rgba(139,229,255,0.30) 0%, rgba(71,166,255,0.16) 52%, rgba(71,166,255,0) 76%)" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
          <FlowMark />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 17px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.44)",
              background: "rgba(255,255,255,0.15)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.46)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.3,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, display: "flex", background: "#bff8ff", boxShadow: "0 0 13px rgba(255,255,255,0.88)" }} />
            FOCUS MODE
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            marginTop: 28,
            display: "flex",
            alignItems: "stretch",
            borderRadius: 42,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.44)",
            background: "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(161,230,255,0.15) 50%, rgba(81,168,255,0.20) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.62), 0 26px 70px rgba(33,111,226,0.20)",
          }}
        >
          <div style={{ width: 480, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", width: 390, height: 390, borderRadius: 195, display: "flex", background: "radial-gradient(circle, rgba(211,250,255,0.52) 0%, rgba(116,225,255,0.22) 48%, rgba(116,225,255,0) 73%)" }} />
            <div
              style={{
                width: 330,
                height: 330,
                borderRadius: 165,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.56)",
                background: "radial-gradient(circle at 34% 24%, rgba(255,255,255,0.66) 0%, rgba(194,247,255,0.36) 17%, rgba(72,206,255,0.34) 45%, rgba(38,144,255,0.38) 72%, rgba(56,119,241,0.46) 100%)",
                boxShadow: "0 24px 62px rgba(32,112,231,0.26), inset 18px 16px 38px rgba(255,255,255,0.28), inset -18px -20px 46px rgba(63,134,244,0.22)",
              }}
            >
              <div style={{ position: "absolute", left: 31, top: 25, width: 190, height: 104, borderRadius: 90, display: "flex", background: "radial-gradient(circle at 38% 34%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.18) 54%, rgba(255,255,255,0) 76%)" }} />
              <div style={{ position: "absolute", inset: 12, borderRadius: 153, display: "flex", border: "7px solid rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", inset: 12, borderRadius: 153, display: "flex", borderTop: "7px solid #d5fbff", borderRight: "7px solid #b8f5ff", borderBottom: "7px solid transparent", borderLeft: "7px solid transparent", transform: "rotate(-42deg)" }} />
              <div style={{ position: "absolute", top: 72, display: "flex", padding: "7px 17px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.52)", background: "rgba(255,255,255,0.16)", fontSize: 12, fontWeight: 800, letterSpacing: 2.2, color: "white" }}>WORK</div>
              <div style={{ display: "flex", fontSize: 74, fontWeight: 560, letterSpacing: -3.4, color: "white" }}>08:08</div>
              <div style={{ position: "absolute", right: 22, bottom: 62, width: 15, height: 15, borderRadius: 8, display: "flex", background: "#e1fcff", boxShadow: "0 0 20px rgba(255,255,255,0.88)" }} />
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "34px 48px 34px 36px" }}>
            <div style={{ display: "flex", fontSize: 12, fontWeight: 800, letterSpacing: 2.4, color: "rgba(255,255,255,0.70)" }}>NOW PLAYING</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 54, lineHeight: 1.02, fontWeight: 660, letterSpacing: -2.3, color: "white" }}>Focus music</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 20, fontWeight: 520, color: "rgba(255,255,255,0.76)" }}>Original sound for deep work</div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 38 }}>
              <div style={{ width: "100%", height: 10, borderRadius: 999, display: "flex", overflow: "hidden", background: "rgba(255,255,255,0.20)", boxShadow: "inset 0 1px 2px rgba(77,148,241,0.22)" }}>
                <div style={{ width: "61%", height: "100%", borderRadius: 999, display: "flex", background: "linear-gradient(90deg, #d5fbff 0%, #a9f3ff 46%, #ffffff 100%)", boxShadow: "0 0 18px rgba(255,255,255,0.60)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.64)" }}>
                <div style={{ display: "flex" }}>24:18</div>
                <div style={{ display: "flex" }}>40:00</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
              <ControlButton icon="previous" />
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
