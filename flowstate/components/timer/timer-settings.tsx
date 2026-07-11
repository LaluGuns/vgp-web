"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { cn } from "@/lib/utils";

const PRESETS = [
  { key: "pomodoro", label: "Pomodoro", desc: "25 / 5" },
  { key: "deep_work", label: "Deep Work", desc: "50 / 10" },
  { key: "90_20", label: "90 / 20", desc: "90 / 20" },
] as const;

const ITEM_WIDTH = 90;
const ITEM_GAP = 4;
const PAD = 4;

function getItemLeft(index: number) {
  return PAD + index * (ITEM_WIDTH + ITEM_GAP);
}

export function TimerSettings() {
  const preset = useTimerStore((s) => s.preset);
  const setPreset = useTimerStore((s) => s.setPreset);
  const status = useTimerStore((s) => s.status);

  const activeIndex = preset.focusMinutes === 90 ? 2 : preset.focusMinutes === 50 ? 1 : 0;

  // Two-phase liquid stretch animation state
  const [pill, setPill] = useState(() => ({ left: getItemLeft(activeIndex), width: ITEM_WIDTH }));
  const prevIndexRef = useRef(activeIndex);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const animateTo = useCallback((newIndex: number) => {
    const prevIndex = prevIndexRef.current;
    if (newIndex === prevIndex) return;

    // Clear any pending phase 2
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);

    const prevLeft = getItemLeft(prevIndex);
    const newLeft = getItemLeft(newIndex);
    const minLeft = Math.min(prevLeft, newLeft);
    const maxRight = Math.max(prevLeft, newLeft) + ITEM_WIDTH;

    // Phase 1: STRETCH — blob expands to cover both old & new positions
    setPill({ left: minLeft, width: maxRight - minLeft });

    // Phase 2: CONTRACT — blob shrinks to just the new position
    phaseTimerRef.current = setTimeout(() => {
      setPill({ left: newLeft, width: ITEM_WIDTH });
    }, 220);

    prevIndexRef.current = newIndex;
  }, []);

  useEffect(() => {
    animateTo(activeIndex);
  }, [activeIndex, animateTo]);

  return (
    <div className="relative w-[292px] h-[38px] select-none">
      {/* Liquid glass background layer with gooey filter */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
        style={{ filter: "url(#liquid-goo)" }}
      >
        {/* Track background */}
        <div className="absolute inset-0 bg-white/[0.04] rounded-full" />
        {/* The stretching liquid blob */}
        <div
          className="absolute top-[3px] bottom-[3px] rounded-full bg-white/[0.18] transition-all duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu will-change-[left,width]"
          style={{
            left: `${pill.left}px`,
            width: `${pill.width}px`,
          }}
        />
      </div>

      {/* Visible glass indicator (non-filtered, crisp edges) */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-[3px] bottom-[3px] rounded-full backdrop-blur-md bg-white/[0.07] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)] transition-all duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu will-change-[left,width]"
          style={{
            left: `${pill.left}px`,
            width: `${pill.width}px`,
          }}
        />
      </div>

      {/* Track border */}
      <div className="absolute inset-0 rounded-full border border-white/[0.06] pointer-events-none" />

      {/* Interactive buttons (always crisp) */}
      <div className="absolute inset-0 flex items-center px-1">
        {PRESETS.map((p, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={p.key}
              disabled={status === "running"}
              className={cn(
                "relative z-10 h-[32px] text-[11px] rounded-full font-mono tracking-tight transition-colors duration-300 flex items-center justify-center",
                isActive ? "text-white font-semibold" : "text-white/60 hover:text-white"
              )}
              style={{ width: `${ITEM_WIDTH}px`, marginLeft: i === 0 ? 0 : `${ITEM_GAP}px` }}
              onClick={() => setPreset(p.key)}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
