import React from "react";
import { Img, staticFile } from "remotion";
import { TOKENS } from "./constants";

type IconName =
  | "check"
  | "focus"
  | "tasks"
  | "sound"
  | "music"
  | "ambient"
  | "theme"
  | "play"
  | "pause"
  | "skip"
  | "reset"
  | "disc"
  | "rain"
  | "cafe"
  | "vinyl";

export function Icon({ name, size = 24, color = "currentColor", strokeWidth = 1.8 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const common = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, React.ReactNode> = {
    check: <path {...common} d="m5 12 4 4L19 7" />,
    focus: <><circle {...common} cx="12" cy="12" r="7.5" /><path {...common} d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" /></>,
    tasks: <><rect {...common} x="4" y="3.5" width="16" height="17" rx="3" /><path {...common} d="m8 9 1.5 1.5L12 8M8 15h7M8 18h5" /></>,
    sound: <><path {...common} d="M4 10v4h3l4 3.5v-11L7 10H4Z" /><path {...common} d="M15 9.5c1.4 1.3 1.4 3.7 0 5M17.5 7c2.7 2.5 2.7 7.5 0 10" /></>,
    music: <><path {...common} d="M9 18V5l9-2v13" /><circle {...common} cx="6.5" cy="18" r="3" /><circle {...common} cx="15.5" cy="16" r="3" /></>,
    ambient: <><path {...common} d="M4 6h16M4 12h16M4 18h16" /><circle cx="9" cy="6" r="2" fill={TOKENS.backgroundBlue} stroke={color} strokeWidth={strokeWidth} /><circle cx="15" cy="12" r="2" fill={TOKENS.backgroundBlue} stroke={color} strokeWidth={strokeWidth} /><circle cx="8" cy="18" r="2" fill={TOKENS.backgroundBlue} stroke={color} strokeWidth={strokeWidth} /></>,
    theme: <><circle {...common} cx="12" cy="12" r="8.5" /><path {...common} d="M12 3.5v17M3.5 12h17M5.8 5.8l12.4 12.4M18.2 5.8 5.8 18.2" /></>,
    play: <path fill={color} d="m9 6 9 6-9 6V6Z" />,
    pause: <path fill={color} d="M8 6h3v12H8zM13 6h3v12h-3z" />,
    skip: <><path {...common} d="m6 7 7 5-7 5V7ZM17 7v10" /></>,
    reset: <><path {...common} d="M5 9a7.5 7.5 0 1 1 1.2 7.8" /><path {...common} d="M5 4.5v4.8h4.8" /></>,
    disc: <><circle {...common} cx="12" cy="12" r="8.5" /><circle {...common} cx="12" cy="12" r="2" /><path {...common} d="M12 3.5v4M20.5 12h-4" /></>,
    rain: <><path {...common} d="M7 5v5M12 3v5M17 5v5M5 15l-1 3M10 14l-1 4M15 14l-1 4M20 14l-1 4" /></>,
    cafe: <><path {...common} d="M5 8h11v5.5A4.5 4.5 0 0 1 11.5 18h-2A4.5 4.5 0 0 1 5 13.5V8ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M7 5h.01M11 5h.01M15 5h.01" /></>,
    vinyl: <><circle {...common} cx="12" cy="12" r="8.5" /><circle {...common} cx="12" cy="12" r="2" /><path {...common} d="m16.2 7.8-2 2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function GlassCard({ children, style, className = "", accent = false }: { children: React.ReactNode; style?: React.CSSProperties; className?: string; accent?: boolean }) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: TOKENS.radius,
        background: `linear-gradient(145deg, rgba(255,255,255,${accent ? 0.08 : 0.055}) 0%, rgba(7,12,30,0.56) 100%)`,
        border: `1px solid ${accent ? "rgba(88,196,255,0.28)" : TOKENS.glassBorder}`,
        boxShadow: `inset 0 1px 0 ${TOKENS.glassHighlight}, 0 18px 50px ${TOKENS.shadow}`,
        backdropFilter: "blur(20px) saturate(1.4)",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.09), transparent 32%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

export function FlowWordmark({ size = "large", centered = false }: { size?: "small" | "large"; centered?: boolean }) {
  const width = size === "large" ? 190 : 132;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: centered ? "center" : "flex-start", gap: 12 }}>
      <Img src={staticFile("icons/flowstate-logo.png")} style={{ width, height: "auto", objectFit: "contain", opacity: 0.94 }} />
    </div>
  );
}

export function Header() {
  return (
    <div style={{ height: 92, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
      <div style={{ width: 220, color: TOKENS.faint, fontSize: 14, letterSpacing: "0.18em", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>DEEP WORK ACTIVE</div>
      <FlowWordmark size="small" centered />
      <div style={{ width: 220, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: TOKENS.cyan }}><Icon name="focus" size={17} /></span>
        <span style={{ width: 34, height: 34, borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", display: "grid", placeItems: "center", color: TOKENS.muted }}><Icon name="theme" size={17} /></span>
      </div>
    </div>
  );
}

export function DailyProgress({ progress = 0.33 }: { progress?: number }) {
  const circumference = 2 * Math.PI * 39;
  const offset = circumference * (1 - progress);
  return (
    <GlassCard style={{ padding: 26, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ color: TOKENS.muted, fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Daily Progress</div>
        <div style={{ color: TOKENS.text, fontSize: 25, fontWeight: 700, marginTop: 10 }}>1 <span style={{ color: TOKENS.faint }}>/</span> 3 <span style={{ color: TOKENS.muted, fontSize: 19, fontWeight: 500 }}>tasks completed</span></div>
        <div style={{ color: TOKENS.muted, fontSize: 14, marginTop: 11, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}><span style={{ color: TOKENS.text }}>1</span> / 3 sessions <span style={{ color: TOKENS.primary, marginLeft: 12, fontWeight: 700 }}>33% achieved</span></div>
      </div>
      <div style={{ position: "relative", width: 104, height: 104, display: "grid", placeItems: "center" }}>
        <div style={{ position: "absolute", inset: 5, borderRadius: "50%", background: "linear-gradient(145deg, rgba(255,255,255,0.2), rgba(3,10,30,0.2))", boxShadow: "inset 0 1px 5px rgba(255,255,255,0.15), 0 5px 18px rgba(0,0,0,0.3)" }} />
        <svg width="104" height="104" viewBox="0 0 104 104" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="52" cy="52" r="39" fill="none" stroke="rgba(88,196,255,0.1)" strokeWidth="6" />
          <circle cx="52" cy="52" r="39" fill="none" stroke={TOKENS.cyan} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.45))" }} />
        </svg>
        <span style={{ position: "absolute", color: TOKENS.text, fontSize: 19, fontWeight: 800, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{Math.round(progress * 100)}%</span>
      </div>
    </GlassCard>
  );
}

export function TimerSphere({ time = "25:00", progress = 0, active = false, compact = false }: { time?: string; progress?: number; active?: boolean; compact?: boolean }) {
  const size = compact ? 310 : 550;
  const center = size / 2;
  const radius = size * 0.405;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", inset: size * 0.09, borderRadius: "50%", background: "radial-gradient(circle at 32% 22%, rgba(115,215,255,0.24), rgba(32,84,140,0.14) 38%, rgba(2,7,25,0.9) 78%)", border: "1px solid rgba(152,227,255,0.2)", boxShadow: active ? "0 0 65px rgba(0,229,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -28px 55px rgba(0,0,0,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -28px 55px rgba(0,0,0,0.42)" }} />
      <div style={{ position: "absolute", inset: size * 0.17, borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, rgba(88,196,255,0.08), transparent 60%)", filter: "blur(8px)" }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <defs><linearGradient id={`timer-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={TOKENS.cyanDeep} /><stop offset="58%" stopColor={TOKENS.cyan} /><stop offset="100%" stopColor="#A8F2FF" /></linearGradient></defs>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={size * 0.014} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={`url(#timer-gradient-${size})`} strokeWidth={size * 0.014} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} opacity={active ? 1 : 0.68} style={{ filter: active ? "drop-shadow(0 0 10px rgba(0,229,255,0.65))" : undefined }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "translateY(-2%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: active ? TOKENS.cyan : TOKENS.muted, fontSize: compact ? 13 : 17, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}><span style={{ width: compact ? 7 : 9, height: compact ? 7 : 9, borderRadius: "50%", background: active ? TOKENS.cyan : TOKENS.primary, boxShadow: active ? `0 0 14px ${TOKENS.cyan}` : undefined }} /> WORK</div>
        <div style={{ color: TOKENS.text, fontSize: compact ? 54 : 100, lineHeight: 1, fontWeight: 600, letterSpacing: "-0.055em", fontVariantNumeric: "tabular-nums", marginTop: compact ? 14 : 22, textShadow: active ? "0 5px 28px rgba(88,196,255,0.45)" : "0 5px 20px rgba(0,0,0,0.5)" }}>{time}</div>
        <div style={{ color: TOKENS.muted, fontSize: compact ? 12 : 16, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: compact ? 16 : 24 }}>FOCUS</div>
      </div>
    </div>
  );
}

export function PlayerControls({ playing, press = 0 }: { playing: boolean; press?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, padding: "17px 30px", borderRadius: 999, background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px rgba(255,255,255,0.16), 0 15px 32px rgba(0,0,0,0.22)" }}>
      <span style={{ color: TOKENS.muted, display: "grid", placeItems: "center" }}><Icon name="reset" size={25} /></span>
      <span style={{ width: 82, height: 82, borderRadius: "50%", display: "grid", placeItems: "center", color: TOKENS.cyan, background: "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))", border: `2px solid ${TOKENS.primary}`, boxShadow: playing ? `0 0 28px rgba(0,229,255,${0.32 + press * 0.3})` : "0 0 18px rgba(88,196,255,0.25)", transform: `scale(${1 - press * 0.03})` }}><Icon name={playing ? "pause" : "play"} size={30} color={TOKENS.cyan} /></span>
      <span style={{ color: TOKENS.muted, display: "grid", placeItems: "center" }}><Icon name="skip" size={25} /></span>
    </div>
  );
}

export function SoundtrackCard({ playing = false }: { playing?: boolean }) {
  return (
    <GlassCard style={{ padding: 22 }} accent={playing}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 74, height: 74, borderRadius: 18, display: "grid", placeItems: "center", border: `1px solid ${playing ? "rgba(0,229,255,0.38)" : TOKENS.glassBorder}`, background: "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.025))", color: playing ? TOKENS.cyan : TOKENS.text, boxShadow: playing ? "0 0 20px rgba(0,229,255,0.18)" : undefined }}><Icon name="disc" size={38} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: TOKENS.muted, fontSize: 14, letterSpacing: "0.15em", fontWeight: 700, textTransform: "uppercase" }}>Focus Soundtrack</div>
          <div style={{ color: TOKENS.text, fontSize: 27, fontWeight: 700, marginTop: 8, whiteSpace: "nowrap" }}>Lo Static</div>
          <div style={{ color: TOKENS.muted, fontSize: 16, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", marginTop: 5 }}>Virzy Guns · Lofi Chill</div>
        </div>
        <div style={{ color: playing ? TOKENS.cyan : TOKENS.muted, fontSize: 13, fontWeight: 800, letterSpacing: "0.13em", textTransform: "uppercase", alignSelf: "flex-start" }}>Originals</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 21 }}>
        <span style={{ color: TOKENS.muted }}><Icon name="music" size={19} /></span>
        <div style={{ height: 5, flex: 1, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}><div style={{ width: playing ? "29%" : "8%", height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${TOKENS.cyanDeep}, ${TOKENS.cyan})`, boxShadow: "0 0 10px rgba(0,229,255,0.5)" }} /></div>
        <span style={{ color: TOKENS.muted, fontSize: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>00:28</span>
      </div>
    </GlassCard>
  );
}

export function MobileNav({ active }: { active: "tasks" | "focus" | "atmosphere" }) {
  const tabs: Array<{ id: "tasks" | "focus" | "atmosphere"; label: string; icon: IconName }> = [
    { id: "tasks", label: "Tasks", icon: "tasks" },
    { id: "focus", label: "Focus", icon: "focus" },
    { id: "atmosphere", label: "Sound", icon: "sound" },
  ];
  return (
    <div style={{ height: 94, borderRadius: 48, background: "rgba(3,7,20,0.78)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 1px rgba(255,255,255,0.15), 0 18px 44px rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 22px", backdropFilter: "blur(24px)" }}>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return <div key={tab.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: isActive ? TOKENS.cyan : TOKENS.muted, transform: isActive ? "translateY(-5px)" : undefined }}><span style={{ width: isActive ? 68 : 56, height: isActive ? 68 : 56, borderRadius: "50%", display: "grid", placeItems: "center", background: isActive ? "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.035))" : "transparent", border: isActive ? "1px solid rgba(88,196,255,0.4)" : "1px solid transparent", boxShadow: isActive ? "0 10px 25px rgba(0,229,255,0.18), inset 0 1px rgba(255,255,255,0.25)" : undefined }}><Icon name={tab.icon} size={isActive ? 29 : 25} /></span><span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{tab.label}</span></div>;
      })}
    </div>
  );
}

export function TaskRow({ title, done = false, active = false, reveal = 1 }: { title: string; done?: boolean; active?: boolean; reveal?: number }) {
  return (
    <div style={{ opacity: reveal, display: "flex", alignItems: "center", gap: 18, padding: "22px 20px", borderRadius: 20, background: active ? "rgba(0,229,255,0.055)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(0,229,255,0.28)" : "rgba(255,255,255,0.08)"}`, boxShadow: active ? "inset 0 1px rgba(255,255,255,0.14), 0 10px 24px rgba(0,0,0,0.16)" : "inset 0 1px rgba(255,255,255,0.05)" }}>
      <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", border: `1px solid ${done ? "rgba(0,229,255,0.65)" : "rgba(255,255,255,0.2)"}`, color: done ? TOKENS.cyan : TOKENS.faint, background: done ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.025)", boxShadow: done ? "0 0 18px rgba(0,229,255,0.2)" : undefined }}><Icon name="check" size={22} color={done ? TOKENS.cyan : TOKENS.faint} strokeWidth={2.4} /></span>
      <span style={{ flex: 1 }}><span style={{ display: "block", color: done ? "rgba(238,245,255,0.36)" : TOKENS.text, fontSize: 23, fontWeight: 600, textDecoration: done ? "line-through" : undefined }}>{title}</span><span style={{ display: "block", color: done ? "rgba(0,229,255,0.55)" : TOKENS.muted, fontSize: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", marginTop: 7 }}>{done ? "Completed" : "Session: 0/1"}</span></span>
      <span style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", color: active ? TOKENS.cyan : TOKENS.muted, border: `1px solid ${active ? "rgba(0,229,255,0.3)" : "rgba(255,255,255,0.08)"}` }}><Icon name="focus" size={21} /></span>
    </div>
  );
}

export function AtmospherePanel({ progress = 0.56, activeTab = "ambient" }: { progress?: number; activeTab?: "music" | "ambient" | "theme" }) {
  const tabs: Array<{ id: "music" | "ambient" | "theme"; label: string; icon: IconName }> = [
    { id: "music", label: "Music", icon: "music" },
    { id: "ambient", label: "Ambient", icon: "ambient" },
    { id: "theme", label: "Theme", icon: "theme" },
  ];
  return (
    <GlassCard style={{ padding: 26 }} accent={activeTab === "ambient"}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div><div style={{ color: TOKENS.muted, fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Atmosphere</div><div style={{ color: TOKENS.text, fontSize: 26, fontWeight: 700, marginTop: 8 }}>Environmental Controls</div></div>
        <span style={{ color: TOKENS.primary, fontSize: 14, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>Unified</span>
      </div>
      <div style={{ position: "relative", marginTop: 22, height: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: 5, borderRadius: 18, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ position: "absolute", top: 5, bottom: 5, left: activeTab === "music" ? "0.8%" : activeTab === "ambient" ? "34.1%" : "67.4%", width: "31.7%", borderRadius: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "inset 0 1px rgba(255,255,255,0.22)" }} />
        {tabs.map((tab) => <div key={tab.id} style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: tab.id === activeTab ? TOKENS.text : TOKENS.muted, fontSize: 16, fontWeight: tab.id === activeTab ? 800 : 600 }}><Icon name={tab.icon} size={20} />{tab.label}</div>)}
      </div>
      {activeTab === "ambient" ? <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><AmbientSlider label="Rain" value={progress} icon="rain" /><AmbientSlider label="Cafe" value={0.38 + progress * 0.16} icon="cafe" /><AmbientSlider label="Vinyl" value={0.24} icon="vinyl" /><AmbientSlider label="Windchimes" value={0.17} icon="ambient" /></div> : <div style={{ padding: "32px 12px 18px", color: TOKENS.muted, fontSize: 18 }}>{activeTab === "music" ? "Now Playing · Originals" : "Dynamic Glass"}</div>}
    </GlassCard>
  );
}

export function AmbientSlider({ label, value, icon }: { label: string; value: number; icon: IconName }) {
  return <div style={{ padding: "18px 16px 16px", borderRadius: 18, background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ display: "flex", alignItems: "center", gap: 10, color: TOKENS.text, fontSize: 16, fontWeight: 700 }}><span style={{ color: TOKENS.primary }}><Icon name={icon} size={20} /></span>{label}<span style={{ marginLeft: "auto", color: TOKENS.primary, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 14 }}>{Math.round(value * 100)}%</span></div><div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.12)", marginTop: 18, position: "relative" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${value * 100}%`, borderRadius: 999, background: `linear-gradient(90deg, ${TOKENS.cyanDeep}, ${TOKENS.cyan})`, boxShadow: "0 0 10px rgba(0,229,255,0.3)" }} /><div style={{ position: "absolute", top: "50%", left: `${value * 100}%`, width: 18, height: 18, borderRadius: "50%", transform: "translate(-50%, -50%)", background: TOKENS.text, border: `2px solid ${TOKENS.cyan}`, boxShadow: "0 1px 5px rgba(0,0,0,0.4), 0 0 8px rgba(0,229,255,0.35)" }} /></div></div>;
}

export function TouchIndicator({ progress = 0 }: { progress?: number }) {
  const scale = 0.76 + Math.sin(progress * Math.PI) * 0.24;
  return <div style={{ position: "absolute", width: 108, height: 108, borderRadius: "50%", border: `2px solid rgba(0,229,255,${0.26 + Math.sin(progress * Math.PI) * 0.42})`, transform: `translate(-50%, -50%) scale(${scale})`, boxShadow: "0 0 24px rgba(0,229,255,0.2)" }} />;
}

