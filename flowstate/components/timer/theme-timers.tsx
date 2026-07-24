"use client";

import { cn, formatTime } from "@/lib/utils";
import { Lock } from "lucide-react";

/**
 * Per-theme timer machines for the non-glass, non-studio interface styles.
 * (Studio has its own full deck in studio-deck.tsx.)
 *
 *  - terminal  → instrument readout: phosphor digits, blinking colon, ASCII
 *                progress rail, command-prompt controls (`> run`, `> pause`…)
 *                and a text volume fader. Everything mono, everything real.
 *  - editorial → print folio: running header, oversized numerals, filling
 *                baseline rule, controls as quiet smallcaps text actions.
 *
 * Rule of the house: no fake buttons. Every visible control calls a real
 * handler; states (disabled/locked) reflect the actual timer state.
 */

export interface ThemeTimerProps {
  secondsRemaining: number;
  progress: number; // 0–100
  isFocus: boolean;
  isRunning: boolean;
  isIdle: boolean;
  phaseLabel: string;
  contextLabel: string;
  locked: boolean;
  volume: number; // 0–1
  onPlayPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onGiveUp: () => void;
  onVolume: (v: number) => void;
  t: (key: string, fallback?: string) => string;
}

/* ─────────────────────── Terminal / Instrument ─────────────────────── */

function TermCmd({
  label,
  onClick,
  disabled,
  danger,
  active,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono text-[11px] tracking-[0.08em] px-2 py-1 rounded-[3px] transition-colors duration-150",
        "disabled:opacity-30 disabled:pointer-events-none"
      )}
      style={{
        color: danger ? "hsl(4 80% 62%)" : active ? "hsl(160 12% 5%)" : "hsl(var(--primary))",
        background: active ? "hsl(var(--primary))" : "transparent",
        border: `1px solid ${danger ? "hsl(4 80% 62% / 0.4)" : "hsl(var(--primary) / 0.35)"}`,
      }}
    >
      {"> "}
      {label}
    </button>
  );
}

export function TerminalReadoutTimer({
  secondsRemaining,
  progress,
  isFocus,
  isRunning,
  isIdle,
  phaseLabel,
  contextLabel,
  locked,
  volume,
  onPlayPause,
  onReset,
  onSkip,
  onGiveUp,
  onVolume,
  t,
}: ThemeTimerProps) {
  const cells = 22;
  const filled = Math.round((Math.max(0, Math.min(100, progress)) / 100) * cells);
  const m = Math.floor(secondsRemaining / 60).toString().padStart(2, "0");
  const s = (secondsRemaining % 60).toString().padStart(2, "0");
  const accent = isFocus ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  const volCells = 10;
  const volFilled = Math.round(Math.max(0, Math.min(1, volume)) * volCells);

  return (
    <div className="relative w-full max-w-[440px] flex items-center justify-center shrink-0 select-none">
      <div
        className="relative w-full rounded-lg px-5 pt-6 pb-4 flex flex-col items-center gap-3.5"
        style={{ background: "hsl(160 12% 6%)", border: "1px solid hsl(var(--primary) / 0.22)" }}
      >
        {/* Bezel corner ticks */}
        {[
          "top-1.5 left-1.5 border-t border-l",
          "top-1.5 right-1.5 border-t border-r",
          "bottom-1.5 left-1.5 border-b border-l",
          "bottom-1.5 right-1.5 border-b border-r",
        ].map((pos) => (
          <span key={pos} className={cn("absolute w-2.5 h-2.5", pos)} style={{ borderColor: "hsl(var(--primary) / 0.45)" }} />
        ))}

        {/* Status line */}
        <div className="w-full flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: accent }}>
          <span className="flex items-center gap-2">
            [ {phaseLabel} ]
            {locked && <Lock className="h-3 w-3" />}
          </span>
          <span style={{ color: "hsl(var(--foreground) / 0.5)" }}>
            {isIdle ? "IDLE" : isRunning ? "RUN" : "HOLD"}
          </span>
        </div>

        {/* Digits */}
        <div
          className="font-mono font-bold tabular-nums leading-none flex items-baseline"
          style={{ color: accent, fontSize: "4.6rem", textShadow: "0 0 18px hsl(var(--primary) / 0.45)" }}
        >
          <span>{m}</span>
          <span className={cn("mx-1", isRunning && "animate-pulse")}>:</span>
          <span>{s}</span>
        </div>

        {/* Progress rail */}
        <div className="font-mono text-[13px] leading-none tracking-[0.08em]" aria-hidden>
          <span style={{ color: accent }}>{"█".repeat(filled)}</span>
          <span style={{ color: "hsl(var(--foreground) / 0.18)" }}>{"░".repeat(cells - filled)}</span>
        </div>
        <div className="w-full flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          <span className="truncate max-w-[200px]">
            {contextLabel}
            <span className="inline-block w-[7px] h-[11px] ml-1 align-text-bottom animate-pulse" style={{ background: "hsl(var(--primary) / 0.7)" }} />
          </span>
          <span style={{ color: accent }}>{Math.round(progress)}%</span>
        </div>

        {/* Command controls — the terminal's transport */}
        <div className="w-full flex items-center justify-center gap-2 pt-1 border-t" style={{ borderColor: "hsl(var(--primary) / 0.15)" }}>
          {locked ? (
            <>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
                {t("dashboard.timer.locked", "Locked — finish the block")}
              </span>
              <TermCmd label={t("dashboard.term.abort", "abort")} onClick={onGiveUp} danger />
            </>
          ) : (
            <>
              <TermCmd
                label={isRunning ? t("dashboard.term.pause", "pause") : t("dashboard.term.run", "run")}
                onClick={onPlayPause}
                active={isRunning}
              />
              <TermCmd label={t("dashboard.term.reset", "reset")} onClick={onReset} disabled={isIdle} />
              <TermCmd label={t("dashboard.term.skip", "skip")} onClick={onSkip} />
            </>
          )}
        </div>

        {/* Volume fader — real, steps of 10% */}
        <div className="w-full flex items-center justify-center gap-2 font-mono text-[11px]">
          <button
            onClick={() => onVolume(Math.max(0, volume - 0.1))}
            aria-label={t("dashboard.term.volDown", "Volume down")}
            className="px-1.5 rounded-[3px] transition-colors"
            style={{ color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}
          >
            -
          </button>
          <span className="text-[9px] tracking-[0.2em]" style={{ color: "hsl(var(--foreground) / 0.5)" }}>VOL</span>
          <span aria-hidden>
            <span style={{ color: accent }}>{"▮".repeat(volFilled)}</span>
            <span style={{ color: "hsl(var(--foreground) / 0.18)" }}>{"▯".repeat(volCells - volFilled)}</span>
          </span>
          <button
            onClick={() => onVolume(Math.min(1, volume + 0.1))}
            aria-label={t("dashboard.term.volUp", "Volume up")}
            className="px-1.5 rounded-[3px] transition-colors"
            style={{ color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Editorial ─────────────────────────── */

function FolioAction({
  label,
  onClick,
  disabled,
  accent,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-[11px] font-sans font-semibold uppercase tracking-[0.22em] transition-colors duration-150",
        "underline-offset-4 hover:underline disabled:opacity-30 disabled:pointer-events-none"
      )}
      style={{
        color: danger
          ? "hsl(4 70% 58%)"
          : accent
            ? "hsl(var(--primary))"
            : "hsl(var(--foreground) / 0.65)",
      }}
    >
      {label}
    </button>
  );
}

export function EditorialFolioTimer({
  secondsRemaining,
  progress,
  isFocus,
  isRunning,
  isIdle,
  phaseLabel,
  contextLabel,
  locked,
  onPlayPause,
  onReset,
  onSkip,
  onGiveUp,
  t,
}: ThemeTimerProps) {
  const accent = isFocus ? "hsl(var(--primary))" : "hsl(var(--secondary))";

  return (
    <div className="relative w-full max-w-[440px] flex items-center justify-center shrink-0 select-none">
      <div className="w-full flex flex-col gap-3">
        {/* Running header: phase left, progress folio right */}
        <div className="flex items-end justify-between border-b pb-2" style={{ borderColor: "hsl(var(--foreground) / 0.25)" }}>
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] flex items-center gap-1.5" style={{ color: accent }}>
            {phaseLabel}
            {locked && <Lock className="h-3 w-3" />}
          </span>
          <span className="text-[10px] font-sans tabular-nums tracking-[0.2em] text-muted-foreground/70">
            {String(Math.round(progress)).padStart(2, "0")} / 100
          </span>
        </div>

        {/* Oversized numerals */}
        <div className="text-center py-1">
          <span
            className="text-[5.2rem] font-sans font-extrabold tracking-[-0.04em] leading-[0.95] tabular-nums"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {formatTime(secondsRemaining)}
          </span>
        </div>

        {/* Baseline rule fills with progress */}
        <div className="relative h-[3px] w-full" style={{ background: "hsl(var(--foreground) / 0.12)" }}>
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%`, background: accent }}
          />
          {isRunning && (
            <span
              className="absolute -top-[3px] w-[9px] h-[9px] rounded-full"
              style={{ left: `calc(${progress}% - 4px)`, background: accent, transition: "left 1s linear" }}
            />
          )}
        </div>

        {/* Typographic controls — the folio's transport */}
        <div className="flex items-center justify-center gap-4 pt-1.5">
          {locked ? (
            <>
              <span className="text-[10px] font-sans uppercase tracking-[0.25em]" style={{ color: accent }}>
                {t("dashboard.timer.locked", "Locked — finish the block")}
              </span>
              <FolioAction label={t("dashboard.timer.giveUp", "Give up")} onClick={onGiveUp} danger />
            </>
          ) : (
            <>
              <FolioAction
                label={isRunning ? t("dashboard.timer.pause", "Pause") : t("dashboard.timer.start", "Start")}
                onClick={onPlayPause}
                accent
              />
              <span className="text-muted-foreground/30">·</span>
              <FolioAction label={t("dashboard.timer.reset", "Reset")} onClick={onReset} disabled={isIdle} />
              <span className="text-muted-foreground/30">·</span>
              <FolioAction label={t("dashboard.timer.skip", "Skip")} onClick={onSkip} />
            </>
          )}
        </div>

        <div className="flex justify-center">
          <span className="text-[11px] italic text-muted-foreground/75 truncate max-w-[260px]">
            {contextLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Router: picks the machine for a non-glass, non-studio interface style. */
export function ThemedTimerCenter({ theme, ...props }: ThemeTimerProps & { theme: string }) {
  if (theme === "terminal") return <TerminalReadoutTimer {...props} />;
  return <EditorialFolioTimer {...props} />;
}
