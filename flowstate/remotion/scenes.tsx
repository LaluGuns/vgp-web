import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COPY, TOKENS, type FlowPromoProps } from "./constants";
import { AtmospherePanel, DailyProgress, FlowWordmark, GlassCard, Header, MobileNav, PlayerControls, SoundtrackCard, TaskRow, TimerSphere, TouchIndicator } from "./ui";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.bezier(0.22, 1, 0.36, 1);

function Backdrop({ children, dim = 0 }: { children: React.ReactNode; dim?: number }) {
  return <AbsoluteFill style={{ background: TOKENS.background, color: TOKENS.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Arial, sans-serif", overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(21,70,112,0.22), transparent 39%), radial-gradient(circle at 83% 12%, rgba(0,229,255,0.055), transparent 24%), linear-gradient(180deg, #060216 0%, #070b1c 100%)" }} />
    <div style={{ position: "absolute", left: "50%", bottom: -130, width: 640, height: 260, transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,229,255,0.11), transparent 68%)", filter: "blur(16px)" }} />
    <AbsoluteFill style={{ background: `rgba(1,3,12,${dim})` }}>{children}</AbsoluteFill>
  </AbsoluteFill>;
}

function HookCopy({ hookVariant }: { hookVariant: FlowPromoProps["hookVariant"] }) {
  const lines = hookVariant === "playlist" ? ["Your playlist is", "killing your focus."] : hookVariant === "paywall" ? ["$70 a year.", "To listen to rain."] : ["POV: 47 tabs.", "Zero work done."];
  return <div style={{ width: 860, fontSize: hookVariant === "playlist" ? 89 : 84, lineHeight: 1.02, letterSpacing: "-0.055em", fontWeight: 750 }}>{lines.map((line, index) => <div key={line} style={{ color: index === 1 && hookVariant === "playlist" ? TOKENS.cyan : TOKENS.text }}>{line}</div>)}</div>;
}

export function HookScene({ hookVariant, showFrictionLine }: Pick<FlowPromoProps, "hookVariant" | "showFrictionLine">) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16, 44, 54], [0, 1, 1, 0.78], clamp);
  const rise = interpolate(frame, [0, 20], [28, 0], { ...clamp, easing: ease });
  const edge = interpolate(frame, [0, 54], [0, 1], clamp);
  const fragments = [
    [244, 692, 260, -2, 0.12], [356, 764, 182, 1, 0.18], [486, 650, 316, -1, 0.13], [664, 748, 226, 2, 0.2], [790, 632, 280, -2, 0.12], [978, 786, 170, 1, 0.18],
  ] as const;
  return <Backdrop><AbsoluteFill style={{ opacity }}>
    <div style={{ position: "absolute", top: 680, left: 72, transform: `translateY(${rise}px)` }}><HookCopy hookVariant={hookVariant} /></div>
    {fragments.map(([top, left, width, tilt, fragmentOpacity], index) => <div key={index} style={{ position: "absolute", top, left, width, height: 48, transform: `rotate(${tilt}deg) translateX(${Math.sin((frame + index * 13) / 28) * 9}px)`, opacity: fragmentOpacity * edge, border: "1px solid rgba(88,196,255,0.65)", borderRadius: 14, background: "linear-gradient(90deg, rgba(88,196,255,0.12), rgba(255,255,255,0.025))", boxShadow: "0 0 20px rgba(0,229,255,0.1)" }}><div style={{ height: 4, width: "34%", margin: "13px 16px 0", borderRadius: 3, background: "rgba(255,255,255,0.35)" }}><div style={{ height: 4, width: "62%", marginTop: 10, borderRadius: 3, background: "rgba(255,255,255,0.15)" }} /></div></div>)}
    <div style={{ position: "absolute", left: 72, bottom: 410, color: TOKENS.faint, fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase" }}>Too many choices / not enough focus</div>
    {showFrictionLine && <div style={{ position: "absolute", left: 72, bottom: 280, width: 210, height: 1, background: `linear-gradient(90deg, ${TOKENS.cyan}, transparent)`, opacity: edge }} />}
  </AbsoluteFill></Backdrop>;
}

export function AgitationScene() {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 30], [0, 1], clamp);
  const wipe = interpolate(frame, [36, 51], [-12, 110], { ...clamp, easing: ease });
  const cursorY = frame < 32 ? (frame % 4) * 106 : 212;
  return <Backdrop><AbsoluteFill>
    <div style={{ position: "absolute", top: 470, left: 72, opacity: interpolate(frame, [0, 10, 44, 51], [0, 1, 1, 0], clamp) }}>
      <div style={{ color: TOKENS.muted, fontSize: 29, maxWidth: 690 }}>You know exactly which tab opens next.</div>
      <div style={{ marginTop: 40, width: 760, height: 1, background: "rgba(255,255,255,0.11)" }} />
      {[0, 1, 2, 3].map((row) => <div key={row} style={{ height: 78, width: 760, display: "flex", alignItems: "center", gap: 18, borderBottom: "1px solid rgba(255,255,255,0.055)" }}><span style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.035)" }} /><span style={{ width: 230, height: 9, borderRadius: 5, background: row === 1 ? "rgba(88,196,255,0.48)" : "rgba(255,255,255,0.13)" }} /><span style={{ width: 170, height: 9, borderRadius: 5, background: "rgba(255,255,255,0.08)" }} /><span style={{ marginLeft: "auto", color: TOKENS.faint, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 15 }}>00:{12 + row}</span></div>)}
      <div style={{ position: "absolute", top: 168 + cursorY, left: 0, width: 760, height: 76, border: `1px solid rgba(0,229,255,${0.3 + progress * 0.4})`, borderRadius: 16, boxShadow: "0 0 24px rgba(0,229,255,0.14)" }} />
    </div>
    <div style={{ position: "absolute", top: `${wipe}%`, left: 0, width: "100%", height: 4, background: TOKENS.cyan, boxShadow: "0 0 28px rgba(0,229,255,0.78)" }} />
    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe}%`, width: 140, background: "linear-gradient(90deg, rgba(0,229,255,0.16), transparent)", opacity: progress }} />
  </AbsoluteFill></Backdrop>;
}

function WorkspaceFrame({ children, activeTab = "focus", timer = "25:00", timerProgress = 0, playing = false, dim = 0, compact = false }: { children?: React.ReactNode; activeTab?: "tasks" | "focus" | "atmosphere"; timer?: string; timerProgress?: number; playing?: boolean; dim?: number; compact?: boolean }) {
  const navTop = compact ? 1630 : 1710;
  const timerTop = compact ? 430 : 382;
  return <Backdrop dim={dim}><div style={{ position: "absolute", left: 52, right: 52, top: compact ? 88 : 112, bottom: 90 }}>
    <Header />
    <div style={{ position: "absolute", top: 112, left: 0, right: 0 }}><DailyProgress progress={playing ? 0.5 : 0.33} /></div>
    <div style={{ position: "absolute", top: timerTop, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}><TimerSphere time={timer} progress={timerProgress} active={playing} compact={compact} /><div style={{ marginTop: compact ? -10 : -24, width: compact ? 620 : 760 }}><SoundtrackCard playing={playing} /></div><div style={{ marginTop: 22 }}><PlayerControls playing={playing} /></div></div>
    {children}
    <div style={{ position: "absolute", left: 0, right: 0, top: navTop }}><MobileNav active={activeTab} /></div>
  </div></Backdrop>;
}

export function FlowRevealScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = spring({ frame, fps, config: { damping: 20, stiffness: 105, mass: 1 } });
  const opacity = interpolate(frame, [0, 12, 54, 60], [0, 1, 1, 0.88], clamp);
  return <AbsoluteFill style={{ opacity, transform: `translateY(${(1 - settle) * 90}px) scale(${0.975 + settle * 0.025})` }}><WorkspaceFrame compact><div style={{ position: "absolute", left: 72, top: 154, color: TOKENS.text, fontSize: 58, fontWeight: 700, letterSpacing: "-0.05em" }}>One place. <span style={{ color: TOKENS.cyan }}>Zero rabbit holes.</span></div><div style={{ position: "absolute", left: 0, right: 0, top: 108, height: 2, transform: `scaleX(${interpolate(frame, [0, 35], [0, 1], { ...clamp, easing: ease })})`, transformOrigin: "left", background: `linear-gradient(90deg, transparent, ${TOKENS.cyan}, transparent)`, boxShadow: "0 0 18px rgba(0,229,255,0.55)" }} /></WorkspaceFrame></AbsoluteFill>;
}

export function FocusScene() {
  const frame = useCurrentFrame();
  const playing = frame >= 24;
  const timer = frame >= 46 ? "24:59" : "25:00";
  const progress = frame >= 46 ? interpolate(frame, [46, 95], [0, 0.025], clamp) : 0;
  const touchProgress = interpolate(frame, [12, 32], [0, 1], clamp);
  return <AbsoluteFill><WorkspaceFrame activeTab="focus" timer={timer} timerProgress={progress} playing><div style={{ position: "absolute", top: 382 + 550 * 0.5, left: 540, pointerEvents: "none" }}><TouchIndicator progress={touchProgress} /></div><div style={{ position: "absolute", left: 72, top: 148, color: TOKENS.muted, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase" }}>Focus / 25 min work block</div></WorkspaceFrame></AbsoluteFill>;
}

export function TasksScene() {
  const frame = useCurrentFrame();
  const done = frame >= 44;
  const progress = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: ease });
  const rowReveal = interpolate(frame, [0, 16], [0, 1], clamp);
  return <WorkspaceFrame activeTab="tasks" timer="24:59" timerProgress={0.025} playing dim={0.06}><div style={{ position: "absolute", left: 62, right: 62, top: 310, opacity: progress, transform: `translateX(${(1 - progress) * 48}px)` }}><GlassCard style={{ padding: 28 }} accent={done}><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}><div><div style={{ color: TOKENS.muted, fontSize: 14, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>Tasks</div><div style={{ color: TOKENS.text, fontSize: 30, fontWeight: 700, marginTop: 6 }}>Tasks (3)</div></div><span style={{ color: TOKENS.primary, fontSize: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", padding: "7px 12px", borderRadius: 999, border: "1px solid rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.06)" }}>{done ? "1/3 Complete" : "0/3 Complete"}</span></div><div style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, borderRadius: 16, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)", color: TOKENS.faint, fontSize: 16, marginBottom: 14 }}>What's your next focus block?<span style={{ marginLeft: "auto", width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.07)", display: "grid", placeItems: "center", color: TOKENS.muted }}>+</span></div><div style={{ display: "grid", gap: 12 }}><TaskRow title="Finish the landing page" active reveal={rowReveal} done={done} /><TaskRow title="Review the final mix" reveal={rowReveal} /><TaskRow title="Send project update" reveal={rowReveal} /></div></GlassCard></div></WorkspaceFrame>;
}

export function AtmosphereScene() {
  const frame = useCurrentFrame();
  const tab = frame < 36 ? "music" : "ambient";
  const slider = interpolate(frame, [38, 96], [0.34, 0.61], { ...clamp, easing: ease });
  const reveal = interpolate(frame, [0, 15], [0, 1], clamp);
  return <WorkspaceFrame activeTab="atmosphere" timer="24:59" timerProgress={0.025} playing dim={0.02}><div style={{ position: "absolute", left: 62, right: 62, top: 330, opacity: reveal, transform: `translateY(${(1 - reveal) * 36}px)` }}><AtmospherePanel activeTab={tab} progress={slider} /></div><div style={{ position: "absolute", top: 288, left: 62, color: TOKENS.muted, fontSize: 17, letterSpacing: "0.16em", textTransform: "uppercase" }}>Tune the room, keep the work</div></WorkspaceFrame>;
}

export function ProductPayoffScene() {
  const frame = useCurrentFrame();
  const first = interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: ease });
  const second = interpolate(frame, [12, 28], [0, 1], { ...clamp, easing: ease });
  const dark = interpolate(frame, [0, 55], [0.16, 0.72], clamp);
  return <AbsoluteFill><WorkspaceFrame activeTab="focus" timer="24:59" timerProgress={0.025} playing dim={dark}><div style={{ position: "absolute", left: 72, right: 72, top: 730, textAlign: "center" }}><div style={{ opacity: first, transform: `translateY(${(1 - first) * 16}px)`, color: TOKENS.text, fontSize: 50, fontWeight: 700, letterSpacing: "-0.04em" }}>{COPY.productLine}</div><div style={{ opacity: second, transform: `translateY(${(1 - second) * 16}px)`, marginTop: 24, color: TOKENS.cyan, fontSize: 65, fontWeight: 780, letterSpacing: "-0.055em" }}>{COPY.brandLine}</div></div></WorkspaceFrame></AbsoluteFill>;
}

export function EndCardScene() {
  const frame = useCurrentFrame();
  const logo = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: ease });
  const copy = interpolate(frame, [14, 32], [0, 1], { ...clamp, easing: ease });
  const url = interpolate(frame, [28, 47], [0, 1], { ...clamp, easing: ease });
  const glow = interpolate(frame, [0, 24, 90], [0.1, 0.42, 0.2], clamp);
  return <Backdrop><AbsoluteFill><div style={{ position: "absolute", left: "50%", top: 610, width: 680, height: 680, transform: "translate(-50%, -50%)", borderRadius: "50%", background: `radial-gradient(circle, rgba(0,229,255,${glow}), transparent 66%)`, filter: "blur(20px)" }} /><div style={{ position: "absolute", left: 0, right: 0, top: 580, opacity: logo, transform: `translateY(${(1 - logo) * 18}px)` }}><FlowWordmark size="large" centered /></div><div style={{ position: "absolute", top: 835, left: 70, right: 70, textAlign: "center", opacity: copy, transform: `translateY(${(1 - copy) * 14}px)` }}><div style={{ color: TOKENS.cyan, fontSize: 52, fontWeight: 750, letterSpacing: "-0.045em" }}>{COPY.brandLine}</div><div style={{ color: TOKENS.muted, fontSize: 30, fontWeight: 550, marginTop: 28 }}>{COPY.descriptor}</div></div><div style={{ position: "absolute", top: 1200, left: 70, right: 70, textAlign: "center", opacity: url, transform: `translateY(${(1 - url) * 12}px)` }}><div style={{ display: "inline-block", padding: "16px 26px", borderRadius: 18, border: "1px solid rgba(0,229,255,0.32)", background: "rgba(0,229,255,0.065)", boxShadow: "0 0 26px rgba(0,229,255,0.12), inset 0 1px rgba(255,255,255,0.16)", color: TOKENS.text, fontSize: 38, fontWeight: 650, letterSpacing: "-0.02em" }}>{COPY.url}</div><div style={{ marginTop: 35, color: TOKENS.muted, fontSize: 22 }}>{COPY.friction}</div></div><div style={{ position: "absolute", bottom: 176, left: 0, right: 0, textAlign: "center", color: TOKENS.faint, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase" }}>Focus workspace / Virzy Guns Production</div></AbsoluteFill></Backdrop>;
}

