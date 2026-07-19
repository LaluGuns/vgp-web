"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioDeck } from "@/components/timer/studio-deck";
import { TerminalReadoutTimer, EditorialFolioTimer } from "@/components/timer/theme-timers";
import { GlassShowroomDial } from "@/components/landing/glass-showroom";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Landing hero — a live showroom unit instead of a product video.
 *
 * The three non-glass machines are the REAL timer components running on a
 * self-contained demo clock: every button works (house rule: no fake buttons),
 * it just drives this demo unit instead of a session. Visitors can press
 * PLAY on a tape deck before they've signed up for anything.
 */

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const STYLES = [
  { id: "glass", name: "Dynamic Glass", lamp: "199 100% 67%", bg: "radial-gradient(120% 100% at 50% 0%, hsl(250 45% 12%) 0%, hsl(258 60% 5%) 55%, hsl(260 55% 3%) 100%)" },
  { id: "studio", name: "Analog Studio", lamp: "38 88% 56%", bg: "linear-gradient(165deg, hsl(26 24% 10%), hsl(24 18% 6%))" },
  { id: "terminal", name: "Instrument Panel", lamp: "140 90% 55%", bg: "linear-gradient(165deg, hsl(160 12% 7%), hsl(160 14% 4%))" },
  { id: "editorial", name: "Editorial", lamp: "16 90% 55%", bg: "linear-gradient(165deg, hsl(30 8% 10%), hsl(30 9% 6%))" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

export function HeroMachines() {
  const { t, locale } = useTranslation();
  const [style, setStyle] = useState<StyleId>("glass");
  const [isBreak, setIsBreak] = useState(false);
  const [running, setRunning] = useState(true); // alive on page load
  const [seconds, setSeconds] = useState(FOCUS_SECONDS - 154); // mid-block: motion visible
  const [volume, setVolume] = useState(0.8);
  const startedRef = useRef(false);

  const total = isBreak ? BREAK_SECONDS : FOCUS_SECONDS;
  const progress = ((total - seconds) / total) * 100;

  // Demo clock — ticks only while "running", flips focus↔break at zero.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s > 1) return s - 1;
        setIsBreak((b) => !b);
        return isBreak ? FOCUS_SECONDS : BREAK_SECONDS;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBreak]);

  const machineProps = {
    secondsRemaining: seconds,
    progress,
    isFocus: !isBreak,
    isRunning: running,
    isIdle: !running && seconds === total,
    phaseLabel: isBreak
      ? t("dashboard.timer.break", "Break")
      : t("dashboard.timer.work", "Work"),
    contextLabel: t("landing.demo.context", "showroom unit — press the buttons"),
    locked: false,
    volume,
    onPlayPause: () => setRunning((r) => !r),
    onReset: () => {
      setRunning(false);
      setIsBreak(false);
      setSeconds(FOCUS_SECONDS);
    },
    onSkip: () => {
      setIsBreak((b) => !b);
      setSeconds(isBreak ? FOCUS_SECONDS : BREAK_SECONDS);
    },
    onGiveUp: () => {
      setRunning(false);
      setIsBreak(false);
      setSeconds(FOCUS_SECONDS);
    },
    onVolume: setVolume,
    t,
  };

  const active = STYLES.find((s) => s.id === style)!;

  return (
    <div className="w-full max-w-[640px] mx-auto space-y-4">
      {/* Style switcher — swaps the showroom unit live */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] border transition-all duration-200",
              style === s.id
                ? "text-black border-transparent"
                : "text-white/55 border-white/10 hover:text-white hover:border-white/25"
            )}
            style={style === s.id ? { background: `hsl(${s.lamp})` } : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Showroom floor — carries its OWN data-theme so each unit renders in
          its native palette (foreground, tokens, lamp) and is driven purely by
          this switcher, independent of whatever theme is set inside the app. */}
      <div
        data-theme={active.id}
        className="rounded-[22px] p-5 sm:p-7 flex items-center justify-center h-[480px] border border-white/[0.07] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
        style={{ background: active.bg } as React.CSSProperties}
      >
        {style === "glass" && (
          <GlassShowroomDial
            secondsRemaining={machineProps.secondsRemaining}
            progress={machineProps.progress}
            isFocus={machineProps.isFocus}
            isRunning={machineProps.isRunning}
            phaseLabel={machineProps.phaseLabel}
            contextLabel={machineProps.contextLabel}
            onPlayPause={machineProps.onPlayPause}
            onReset={machineProps.onReset}
            onSkip={machineProps.onSkip}
            t={t}
          />
        )}
        {style === "studio" && (
          <StudioDeck
            {...machineProps}
            presetLabel="POMODORO · 25 MIN"
            musicPlaying={running}
            accentHsl={active.lamp}
            onStop={() => setRunning(false)}
            onRewind={() => setSeconds(total)}
            onEject={machineProps.onReset}
            onPower={() => (running ? machineProps.onReset() : setRunning(true))}
          />
        )}
        {style === "terminal" && <TerminalReadoutTimer {...machineProps} />}
        {style === "editorial" && <EditorialFolioTimer {...machineProps} />}
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-white/45">
        <span>{t("landing.demo.caption", "A working unit, not a screenshot. The real thing has the music.")}</span>
        <Link
          href={`/${locale}/app`}
          className="inline-flex items-center gap-1 text-[#00e5ff] hover:underline underline-offset-4"
        >
          {t("landing.demo.open", "Open the app")}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
