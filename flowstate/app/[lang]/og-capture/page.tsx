"use client";

import Image from "next/image";
import { GlassShowroomDial } from "@/components/landing/glass-showroom";

const styles = ["Dynamic Glass", "Analog Studio", "Instrument Panel", "Editorial"];

export default function OgCapturePage() {
  return (
    <main
      style={{
        width: 1200,
        height: 630,
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(900px 620px at 50% 48%, rgba(41,88,212,0.62) 0%, rgba(41,88,212,0.26) 48%, rgba(41,88,212,0) 72%), radial-gradient(700px 520px at 82% 20%, rgba(48,184,255,0.20) 0%, rgba(48,184,255,0) 72%), radial-gradient(620px 520px at 15% 80%, rgba(111,69,255,0.26) 0%, rgba(111,69,255,0) 72%), linear-gradient(135deg, #10245b 0%, #202767 46%, #173b72 100%)",
        color: "white",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", padding: "34px 50px 36px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 54 }}>
          <Image
            src="/icons/flowstate-logo.png"
            alt="Flow by Virzy Guns logo"
            width={764}
            height={268}
            priority
            style={{ height: 42, width: "auto", objectFit: "contain" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {styles.map((name, index) => (
              <div
                key={name}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: index === 0 ? "1px solid rgba(88,196,255,0.88)" : "1px solid rgba(255,255,255,0.13)",
                  background: index === 0 ? "#58c4ff" : "rgba(255,255,255,0.035)",
                  color: index === 0 ? "#04152d" : "rgba(255,255,255,0.58)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.1fr", alignItems: "center", gap: 30 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 16 }}>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.22em", color: "#7ce7ff", marginBottom: 16 }}>
              Your focus environment
            </div>
            <div style={{ fontSize: 54, lineHeight: 1.02, fontWeight: 800, letterSpacing: -2.2, maxWidth: 430 }}>
              Music for focus. Built for deep work.
            </div>
            <div style={{ marginTop: 22, fontSize: 17, lineHeight: 1.55, color: "rgba(255,255,255,0.76)", maxWidth: 430 }}>
              Original focus music, timer, and ambient sound in one place.
            </div>
            <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", minWidth: 210, height: 52, padding: "0 22px", borderRadius: 14, background: "#00e5ff", color: "#04152d", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", boxShadow: "0 0 26px rgba(0,229,255,0.30)" }}>
              Start Focusing Free
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "scale(1.18)", transformOrigin: "center" }}>
            <GlassShowroomDial
              secondsRemaining={8 * 60 + 8}
              progress={67.47}
              isFocus
              isRunning={false}
              phaseLabel="Work"
              contextLabel="Interactive product preview"
              onPlayPause={() => {}}
              onReset={() => {}}
              onSkip={() => {}}
              t={(_key, fallback) => fallback ?? ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
