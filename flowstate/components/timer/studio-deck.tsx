"use client";

import { useEffect, useRef } from "react";
import { cn, formatTime } from "@/lib/utils";
import { Rewind, FastForward, Play, Pause, Square, Lock } from "lucide-react";
import { SevenSegment } from "./seven-segment";

/**
 * Analog Studio — the whole center column is one reel-to-reel machine.
 *
 * Layout (top → bottom), mirroring a real deck:
 *   1. Dual VU meters (LEFT follows the music, RIGHT follows session progress)
 *      with a PEAK lamp between them.
 *   2. Tape transport: supply/take-up reels (tape winds left → right as the
 *      block progresses, reels spin while running) around an amber TIME LEFT
 *      display + phase badge + preset line.
 *   3. Control rail: POWER lamp, physical transport buttons
 *      (REWIND=reset · STOP=pause · PLAY/PAUSE · FFWD=skip · EJECT=reset/give-up),
 *      and a draggable VOLUME knob wired to the music player.
 *
 * Pure SVG/CSS + one rAF loop for the needles. Timer/music logic stays in
 * TimerDisplay — this component only renders and calls the handlers it's given.
 * The `accentHsl` prop scopes --primary to the machine, so picking a Visual
 * Theme (scene) re-lamps the whole deck: digits, needles, LEDs, glows.
 */

export interface StudioDeckProps {
  secondsRemaining: number;
  progress: number; // 0–100
  isFocus: boolean;
  isRunning: boolean;
  isIdle: boolean;
  phaseLabel: string;
  presetLabel: string;
  contextLabel: string;
  locked: boolean;
  musicPlaying: boolean;
  volume: number; // 0–1
  accentHsl: string; // "H S% L%" — scene-driven lamp colour
  onPlayPause: () => void;
  onStop: () => void;
  /** REWIND — wind the tape back: timer to 0, music keeps playing. */
  onRewind: () => void;
  /** EJECT — pop the tape: full reset, music stops too. */
  onEject: () => void;
  /** POWER — master switch: start when idle, kill everything when live. */
  onPower: () => void;
  onSkip: () => void;
  onGiveUp: () => void;
  onVolume: (v: number) => void;
  t: (key: string, fallback?: string) => string;
}

/* ── Small hardware bits ────────────────────────────────────────────── */

function Screw({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute w-2.5 h-2.5 rounded-full", className)}
      style={{
        background:
          "radial-gradient(circle at 35% 30%, hsl(30 8% 38%), hsl(28 10% 16%) 60%, hsl(26 12% 8%))",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.6)",
      }}
    >
      <span
        className="absolute left-1/2 top-1/2 w-[7px] h-[1.5px] -translate-x-1/2 -translate-y-1/2 rotate-45"
        style={{ background: "rgba(0,0,0,0.55)" }}
      />
    </span>
  );
}

const EjectIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 5 4.5 13h15L12 5z" />
    <rect x="4.5" y="16" width="15" height="2.6" rx="1" />
  </svg>
);

/* ── VU meter ───────────────────────────────────────────────────────── */

const VU_TICKS = [
  { db: "-20", a: -44 },
  { db: "-10", a: -30 },
  { db: "-7", a: -20 },
  { db: "-5", a: -11 },
  { db: "-3", a: -2 },
  { db: "-1", a: 8 },
  { db: "0", a: 17, red: true },
  { db: "1", a: 26, red: true },
  { db: "2", a: 35, red: true },
  { db: "3", a: 44, red: true },
];

function VuMeter({
  label,
  needleRef,
}: {
  label: string;
  needleRef: React.Ref<SVGLineElement>;
}) {
  return (
    <svg viewBox="0 0 150 74" className="w-full h-auto">
      {/* Meter face */}
      <rect x="1" y="1" width="148" height="72" rx="5" fill="hsl(var(--scene-glow-h, 36) 24% 9%)" stroke="hsl(var(--primary) / 0.25)" />
      <rect x="4" y="4" width="142" height="66" rx="3" fill="hsl(var(--scene-glow-h, 38) 28% 11%)" />
      {/* Warm backlight */}
      <ellipse cx="75" cy="66" rx="66" ry="34" fill="hsl(var(--primary) / 0.13)" />

      {/* Scale arc + ticks */}
      <g transform="translate(75 64)">
        <path d="M -52 -18 A 56 56 0 0 1 52 -18" fill="none" stroke="hsl(40 30% 62% / 0.55)" strokeWidth="1" />
        {VU_TICKS.map(({ db, a, red }) => {
          const r = ((a - 90) * Math.PI) / 180;
          const c = Math.cos(r);
          const s = Math.sin(r);
          return (
            <g key={db}>
              <line
                x1={c * 47} y1={s * 47} x2={c * 54} y2={s * 54}
                stroke={red ? "hsl(8 72% 52%)" : "hsl(40 30% 66%)"}
                strokeWidth={red ? 1.6 : 1.1}
              />
              <text
                x={c * 60} y={s * 60 + 2}
                fontSize="5.4" textAnchor="middle"
                fontFamily="var(--font-mono)"
                fill={red ? "hsl(8 72% 56%)" : "hsl(40 26% 60%)"}
              >
                {db}
              </text>
            </g>
          );
        })}
        {/* Red zone band */}
        <path d="M 14.5 -51 A 53 53 0 0 1 37 -37" fill="none" stroke="hsl(8 72% 48% / 0.85)" strokeWidth="2.4" />

        {/* Needle (rotated imperatively from the rAF loop) */}
        <line
          ref={needleRef}
          x1="0" y1="4" x2="0" y2="-48"
          stroke="hsl(var(--primary))" strokeWidth="1.6" strokeLinecap="round"
          style={{ transform: "rotate(-44deg)", transformOrigin: "0 0" }}
        />
        <circle cx="0" cy="0" r="4" fill="hsl(28 18% 14%)" stroke="hsl(30 12% 26%)" />
      </g>

      <text x="75" y="30" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)" letterSpacing="2" fill="hsl(40 30% 70% / 0.85)">
        VU
      </text>
      <text x="10" y="13" fontSize="6" fontFamily="var(--font-mono)" letterSpacing="1.5" fill="hsl(40 26% 58% / 0.8)">
        {label}
      </text>
    </svg>
  );
}

/* ── Reel ───────────────────────────────────────────────────────────── */

function Reel({ cx, tapeR, spinning }: { cx: number; tapeR: number; spinning: boolean }) {
  return (
    <g>
      {/* Tape pack */}
      <circle cx={cx} cy="0" r={tapeR} fill="hsl(18 40% 13%)" stroke="hsl(20 35% 20%)" strokeWidth="1" />
      <circle cx={cx} cy="0" r={tapeR - 2} fill="none" stroke="hsl(16 30% 9%)" strokeWidth="1" opacity="0.7" />
      {/* Metal reel over the tape */}
      <g>
        {spinning && (
          <animateTransform
            attributeName="transform" type="rotate"
            from={`0 ${cx} 0`} to={`360 ${cx} 0`}
            dur="2.6s" repeatCount="indefinite"
          />
        )}
        <circle cx={cx} cy="0" r="30" fill="hsl(35 10% 72% / 0.13)" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1.4" />
        {/* Three trapezoid windows like a real NAB reel */}
        {[90, 210, 330].map((a) => (
          <path
            key={a}
            d="M -7 -26 L 7 -26 L 11 -12 L -11 -12 Z"
            transform={`translate(${cx} 0) rotate(${a})`}
            fill="hsl(26 26% 7%)"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="0.8"
          />
        ))}
        <circle cx={cx} cy="0" r="9" fill="hsl(30 8% 22%)" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1.2" />
        <circle cx={cx} cy="0" r="3" fill="hsl(26 20% 8%)" />
      </g>
    </g>
  );
}

/* ── Transport button ───────────────────────────────────────────────── */

function TransportButton({
  label,
  onClick,
  active,
  disabled,
  wide,
  children,
  ariaLabel,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  wide?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        // Fluid: buttons share the rail via flex-basis and shrink freely so the
        // whole transport fits any column width (desktop panel → 375px phone)
        // without clipping. Play/Pause keeps a little more room.
        "group flex flex-col items-center gap-1 rounded-[6px] px-1 pt-1.5 pb-1 min-w-0 transition-transform duration-100 active:translate-y-[2px] disabled:opacity-40 disabled:pointer-events-none",
        wide ? "flex-[1.5]" : "flex-1"
      )}
      style={{
        background: active
          ? "linear-gradient(180deg, hsl(34 22% 26%), hsl(30 18% 15%))"
          : "linear-gradient(180deg, hsl(30 10% 24%), hsl(28 12% 13%))",
        border: "1px solid hsl(28 12% 8%)",
        boxShadow: active
          ? "inset 0 1px 0 hsl(var(--primary) / 0.35), 0 2px 3px rgba(0,0,0,0.55), 0 0 12px hsl(var(--primary) / 0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.14), 0 3px 4px rgba(0,0,0,0.55)",
      }}
    >
      <span
        className="text-[7px] font-mono uppercase tracking-[0.12em] truncate max-w-full leading-none"
        style={{ color: "hsl(40 22% 62%)" }}
      >
        {label}
      </span>
      <span className="shrink-0" style={{ color: active ? "hsl(var(--primary))" : "hsl(40 18% 74%)" }}>{children}</span>
    </button>
  );
}

/* ── The deck ───────────────────────────────────────────────────────── */

export function StudioDeck({
  secondsRemaining,
  progress,
  isFocus,
  isRunning,
  isIdle,
  phaseLabel,
  presetLabel,
  contextLabel,
  locked,
  musicPlaying,
  volume,
  accentHsl,
  onPlayPause,
  onStop,
  onRewind,
  onEject,
  onPower,
  onSkip,
  onGiveUp,
  onVolume,
  t,
}: StudioDeckProps) {
  const p = Math.max(0, Math.min(100, progress)) / 100;
  const tapeL = 34 + (1 - p) * 20; // supply pack radius 54 → 34
  const tapeR = 34 + p * 20;

  /* Needle physics: one rAF loop mutates both needles directly (no re-renders). */
  const needleL = useRef<SVGLineElement>(null);
  const needleR = useRef<SVGLineElement>(null);
  const peakRef = useRef<HTMLSpanElement>(null);
  const anim = useRef({ l: -44, r: -44, phase: 0 });

  useEffect(() => {
    // 20fps interval (not rAF): analog needles don't need frame-perfect motion,
    // and a persistent rAF keeps the compositor from ever going idle.
    const tick = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      const a = anim.current;
      a.phase += 0.31;
      // LEFT — program level: wanders musically while audio plays.
      const targetL = musicPlaying
        ? -6 + Math.sin(a.phase) * 9 + Math.sin(a.phase * 2.7 + 1.3) * 6 + (Math.random() - 0.5) * 5
        : -44;
      // RIGHT — session level: parks at the block's progress position.
      const targetR = isRunning ? -44 + p * 88 + (musicPlaying ? Math.sin(a.phase * 1.4) * 1.5 : 0) : -44 + p * 88;
      const nextL = a.l + (targetL - a.l) * 0.22; // ballistic lag, like a real VU
      const nextR = a.r + (targetR - a.r) * 0.12;
      // Only touch the DOM when a needle actually moved — otherwise the page
      // repaints forever even with parked needles (and never goes idle).
      if (Math.abs(nextL - a.l) > 0.05 && needleL.current) {
        needleL.current.style.transform = `rotate(${nextL}deg)`;
      }
      if (Math.abs(nextR - a.r) > 0.05 && needleR.current) {
        needleR.current.style.transform = `rotate(${nextR}deg)`;
      }
      a.l = nextL;
      a.r = nextR;
      if (peakRef.current) {
        const peakOn = a.l > 15 ? "1" : "0.18";
        if (peakRef.current.style.opacity !== peakOn) peakRef.current.style.opacity = peakOn;
      }
    };
    const id = setInterval(tick, 50);
    tick();
    return () => clearInterval(id);
  }, [musicPlaying, isRunning, p]);

  /* Volume knob: vertical drag (pointer capture) + wheel. */
  const dragState = useRef<{ y: number; v: number } | null>(null);
  const knobDeg = -135 + Math.max(0, Math.min(1, volume)) * 270;

  return (
    <div
      className="w-full max-w-[440px] select-none"
      style={{ "--primary": accentHsl } as React.CSSProperties}
    >
      {/* ── Chassis ── */}
      <div
        className="relative rounded-[18px] p-4 sm:p-5"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--scene-glow-h, 28) 20% 12%) 0%, hsl(var(--scene-glow-h, 26) 22% 8%) 45%, hsl(var(--scene-glow-h, 24) 20% 6%) 100%)",
          border: "1px solid hsl(var(--primary) / 0.25)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.6), 0 24px 50px rgba(0,0,0,0.55)",
        }}
      >
        <Screw className="top-2.5 left-2.5" />
        <Screw className="top-2.5 right-2.5" />
        <Screw className="bottom-2.5 left-2.5" />
        <Screw className="bottom-2.5 right-2.5" />

        {/* ── 1 · VU bridge ── */}
        <div
          className="rounded-[10px] px-3 py-3 mb-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(180deg, hsl(var(--scene-glow-h, 26) 22% 6%), hsl(var(--scene-glow-h, 26) 24% 4%))",
            border: "1px solid hsl(var(--primary) / 0.20)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex-1"><VuMeter label="LEFT" needleRef={needleL} /></div>
          <div className="flex flex-col items-center gap-1 px-1 shrink-0">
            <span className="text-[7px] font-mono tracking-[0.2em]" style={{ color: "hsl(40 22% 58%)" }}>PEAK</span>
            <span
              ref={peakRef}
              className="w-2 h-2 rounded-full transition-opacity duration-150"
              style={{ background: "hsl(8 80% 55%)", boxShadow: "0 0 8px hsl(8 80% 55%)", opacity: 0.18 }}
            />
            <span className="text-[7px] font-mono tracking-[0.2em]" style={{ color: "hsl(40 22% 45%)" }}>dB</span>
          </div>
          <div className="flex-1"><VuMeter label="RIGHT" needleRef={needleR} /></div>
        </div>

        {/* ── 2 · Tape transport ── */}
        <div
          className="relative rounded-[10px] px-3 pt-5 pb-3 mb-4"
          style={{
            background: "linear-gradient(180deg, hsl(var(--scene-glow-h, 26) 24% 8%), hsl(var(--scene-glow-h, 25) 26% 6%))",
            border: "1px solid hsl(var(--primary) / 0.20)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.65)",
          }}
        >
          <svg viewBox="-260 -78 520 190" className="w-full h-auto">
            {/* Reels */}
            <Reel cx={-160} tapeR={tapeL} spinning={isRunning} />
            <Reel cx={160} tapeR={tapeR} spinning={isRunning} />
            {/* Tape path: reel → guide → capstan → guide → reel */}
            <line x1={-160 + 0} y1={tapeL} x2={-60} y2={64} stroke="hsl(18 35% 16%)" strokeWidth="2.4" />
            <line x1={-60} y1={64} x2={60} y2={64} stroke="hsl(18 35% 16%)" strokeWidth="2.4" />
            <line x1={60} y1={64} x2={160} y2={tapeR} stroke="hsl(18 35% 16%)" strokeWidth="2.4" />
            {[-60, 60].map((x) => (
              <g key={x}>
                <circle cx={x} cy="64" r="7" fill="hsl(28 12% 14%)" stroke="hsl(40 16% 55% / 0.5)" strokeWidth="1.2" />
                <circle cx={x} cy="64" r="2.4" fill="hsl(26 18% 7%)" />
              </g>
            ))}
            {/* Capstan */}
            <circle cx="0" cy="64" r="10" fill="hsl(30 8% 20%)" stroke="hsl(40 16% 58% / 0.55)" strokeWidth="1.4" />
            <circle cx="0" cy="64" r="3.4" fill="hsl(24 20% 6%)" />

            <text x="-252" y="98" fontSize="8.5" fontFamily="var(--font-mono)" letterSpacing="1.5" fill="hsl(40 20% 48%)">
              {t("dashboard.deck.supplyReel", "SUPPLY REEL")}
            </text>
            <text x="252" y="98" fontSize="8.5" textAnchor="end" fontFamily="var(--font-mono)" letterSpacing="1.5" fill="hsl(40 20% 48%)">
              {t("dashboard.deck.takeUpReel", "TAKE UP REEL")}
            </text>
          </svg>

          {/* Center display, layered over the SVG between the reels */}
          <div className="absolute inset-x-0 top-[8%] flex flex-col items-center pointer-events-none">
            <span className="text-[8px] font-mono tracking-[0.35em] mb-1.5" style={{ color: "hsl(40 22% 55%)" }}>
              {t("dashboard.deck.timeLeft", "TIME LEFT")}
            </span>
            <SevenSegment
              value={formatTime(secondsRemaining)}
              height={48}
              blinkColon={isRunning}
              style={{ color: "hsl(var(--primary))" }}
            />
            <span
              className="mt-2 px-3 py-[3px] rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-[0.28em] flex items-center gap-1.5"
              style={{
                color: isFocus ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                border: `1px solid ${isFocus ? "hsl(var(--primary) / 0.4)" : "hsl(var(--secondary) / 0.4)"}`,
                background: "rgba(0,0,0,0.45)",
              }}
            >
              {locked && <Lock className="h-2.5 w-2.5" />}
              {phaseLabel}
            </span>
            <span
              className="mt-1.5 text-[9.5px] font-mono uppercase tracking-[0.25em] px-2 py-0.5 rounded backdrop-blur-[2px]"
              style={{
                color: "hsl(40 20% 52%)",
                background: "rgba(10, 8, 6, 0.65)",
                border: "1px solid rgba(255, 218, 168, 0.05)"
              }}
            >
              {presetLabel}
            </span>
          </div>
        </div>

        {/* ── 3 · Control rail ── */}
        <div className="flex items-stretch gap-2 sm:gap-3">
          {/* POWER — real master switch: starts the block when idle, kills
              timer + music when live (give-up path when Autopilot-locked). */}
          <div className="flex flex-col items-center justify-center gap-1 px-0.5 shrink-0">
            <span className="text-[7.5px] font-mono uppercase tracking-[0.2em]" style={{ color: "hsl(40 22% 55%)" }}>
              {t("dashboard.deck.power", "POWER")}
            </span>
            <button
              onClick={onPower}
              aria-label={
                isIdle
                  ? t("dashboard.timer.start", "Start")
                  : t("dashboard.deck.powerOff", "Power off — end the session")
              }
              className="w-8 h-8 rounded-full transition-transform duration-100 active:translate-y-[1px] active:scale-95"
              style={{
                background: "radial-gradient(circle at 35% 30%, hsl(30 8% 30%), hsl(28 10% 14%) 70%)",
                border: "1px solid hsl(28 12% 8%)",
                boxShadow: isIdle
                  ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 5px rgba(0,0,0,0.5)"
                  : "inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 5px rgba(0,0,0,0.5), 0 0 10px hsl(var(--primary) / 0.25)",
              }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: isIdle ? "hsl(30 10% 25%)" : "hsl(var(--primary))",
                boxShadow: isIdle ? "none" : "0 0 8px hsl(var(--primary))",
              }}
            />
          </div>

          {/* Transport buttons */}
          <div
            className="flex-1 min-w-0 flex items-stretch justify-center gap-1 sm:gap-1.5 rounded-[10px] px-1.5 py-2"
            style={{
              background: "linear-gradient(180deg, hsl(26 14% 10%), hsl(25 16% 7%))",
              border: "1px solid hsl(30 12% 17%)",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.55)",
            }}
          >
            <TransportButton label={t("dashboard.deck.rewind", "REWIND")} onClick={locked ? onGiveUp : onRewind} ariaLabel={t("dashboard.deck.rewindAria", "Rewind — restart the block, music keeps playing")}>
              <Rewind className="h-4 w-4 fill-current" />
            </TransportButton>
            <TransportButton label={t("dashboard.deck.stop", "STOP")} onClick={onStop} disabled={isIdle || locked} ariaLabel={t("dashboard.timer.pause", "Pause")}>
              <Square className="h-3.5 w-3.5 fill-current" />
            </TransportButton>
            <TransportButton
              label={t("dashboard.deck.playPause", "PLAY / PAUSE")}
              onClick={onPlayPause}
              active={isRunning}
              wide
              disabled={locked && isRunning}
              ariaLabel={isRunning ? t("dashboard.timer.pause", "Pause") : t("dashboard.timer.start", "Start")}
            >
              <span className="flex items-center gap-0.5">
                <Play className="h-4 w-4 fill-current" />
                <Pause className="h-4 w-4 fill-current" />
              </span>
            </TransportButton>
            <TransportButton label={t("dashboard.deck.ffwd", "FFWD")} onClick={onSkip} disabled={locked} ariaLabel={t("dashboard.timer.skip", "Skip")}>
              <FastForward className="h-4 w-4 fill-current" />
            </TransportButton>
            <TransportButton label={t("dashboard.deck.eject", "EJECT")} onClick={locked ? onGiveUp : onEject} ariaLabel={locked ? t("dashboard.timer.giveUp", "Give up") : t("dashboard.deck.ejectAria", "Eject — end the session and stop the music")}>
              <EjectIcon className="h-4 w-4" />
            </TransportButton>
          </div>

          {/* VOLUME knob */}
          <div className="flex flex-col items-center justify-center gap-1 px-0.5 shrink-0">
            <span className="text-[7px] font-mono uppercase tracking-[0.15em]" style={{ color: "hsl(40 22% 55%)" }}>
              {t("dashboard.deck.volume", "VOLUME")}
            </span>
            <div
              role="slider"
              aria-label={t("dashboard.deck.volume", "VOLUME")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              tabIndex={0}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full cursor-ns-resize touch-none"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, hsl(30 10% 34%), hsl(28 10% 16%) 62%, hsl(26 12% 10%))",
                border: "1px solid hsl(28 12% 8%)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.55)",
              }}
              onPointerDown={(e) => {
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                dragState.current = { y: e.clientY, v: volume };
              }}
              onPointerMove={(e) => {
                if (!dragState.current) return;
                const dv = (dragState.current.y - e.clientY) / 140;
                onVolume(Math.max(0, Math.min(1, dragState.current.v + dv)));
              }}
              onPointerUp={() => (dragState.current = null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowRight") onVolume(Math.min(1, volume + 0.05));
                if (e.key === "ArrowDown" || e.key === "ArrowLeft") onVolume(Math.max(0, volume - 0.05));
              }}
            >
              {/* Pointer line */}
              <span
                className="absolute left-1/2 top-1/2 w-[2px] h-[15px] rounded-full"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 0 5px hsl(var(--primary) / 0.7)",
                  transform: `translate(-50%, -100%) rotate(${knobDeg}deg)`,
                  transformOrigin: "50% 100%",
                }}
              />
            </div>
            <div className="w-full flex justify-between text-[6.5px] font-mono" style={{ color: "hsl(40 18% 45%)" }}>
              <span>MIN</span>
              <span>MAX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context line under the machine */}
      <div className="mt-2.5 text-center">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: "hsl(40 18% 55%)" }}>
          {contextLabel}
        </span>
      </div>
    </div>
  );
}
