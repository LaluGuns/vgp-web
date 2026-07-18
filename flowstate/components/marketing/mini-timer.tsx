"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, RotateCcw, SkipForward, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Self-contained preset timer for the marketing pages (/timer/50-10 etc.).
 *
 * Same idea as the landing showroom clock (components/landing/hero-machines.tsx):
 * a real work/break countdown with real buttons — house rule: no fake buttons —
 * but deliberately NOT wired into the app stores or audio engine, so these
 * pages stay a tiny client island. Preset minutes come from the route slug.
 */
export interface MiniTimerLabels {
  work: string;
  break: string;
  start: string;
  pause: string;
  reset: string;
  skip: string;
  /** e.g. "{work} min work · {break} min break" already resolved */
  preset: string;
  /** caption under the unit, e.g. "Runs right here. The full app adds the music." */
  caption: string;
  openApp: string;
}

export function MiniTimer({
  workMin,
  breakMin,
  appHref,
  labels,
}: {
  workMin: number;
  breakMin: number;
  appHref: string;
  labels: MiniTimerLabels;
}) {
  const workTotal = workMin * 60;
  const breakTotal = breakMin * 60;

  const [isBreak, setIsBreak] = useState(false);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(workTotal);
  const baseTitle = useRef<string | null>(null);

  const total = isBreak ? breakTotal : workTotal;
  const progress = ((total - seconds) / total) * 100;

  // The clock — ticks while running, flips work↔break at zero.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s > 1) return s - 1;
        setIsBreak((b) => !b);
        return isBreak ? workTotal : breakTotal;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, isBreak, workTotal, breakTotal]);

  // Countdown in the tab title while running, restored when paused/reset.
  useEffect(() => {
    if (baseTitle.current === null) baseTitle.current = document.title;
    if (running) {
      document.title = `${format(seconds)} · ${isBreak ? labels.break : labels.work}`;
    } else if (baseTitle.current) {
      document.title = baseTitle.current;
    }
  }, [running, seconds, isBreak, labels.break, labels.work]);

  function format(s: number) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  function reset() {
    setRunning(false);
    setIsBreak(false);
    setSeconds(workTotal);
  }

  function skip() {
    setIsBreak((b) => !b);
    setSeconds(isBreak ? workTotal : breakTotal);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="glass-card rounded-3xl border border-white/10 p-8 text-center space-y-6 bg-black/30">
        {/* Phase lamp */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em]">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              running ? "bg-[#00e5ff] animate-pulse" : "bg-white/25"
            )}
          />
          <span className={isBreak ? "text-emerald-300/90" : "text-[#00e5ff]"}>
            {isBreak ? labels.break : labels.work}
          </span>
        </div>

        {/* Readout */}
        <div
          className="text-6xl sm:text-7xl font-mono font-bold text-white tabular-nums tracking-tight"
          aria-live="off"
        >
          {format(seconds)}
        </div>

        {/* Progress */}
        <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000 ease-linear",
              isBreak ? "bg-emerald-400/80" : "bg-[#00e5ff]"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls — every button does what it says */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(0,229,255,0.35)]"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? labels.pause : labels.start}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={labels.reset}
            title={labels.reset}
            className="p-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={skip}
            aria-label={labels.skip}
            title={labels.skip}
            className="p-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
          {labels.preset}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-white/45 text-center">
        <span>{labels.caption}</span>
        <Link
          href={appHref}
          className="inline-flex items-center gap-1 text-[#00e5ff] hover:underline underline-offset-4 whitespace-nowrap"
        >
          {labels.openApp}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
