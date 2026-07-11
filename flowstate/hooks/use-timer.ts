"use client";

import { useEffect, useRef } from "react";
import { useTimerStore, type TimerPhase } from "@/lib/stores/timer-store";

// Short synthesized chime for phase transitions. Uses a dedicated lazy AudioContext
// so we never depend on a missing /sounds/bell.mp3 asset (which 404'd before).
let chimeCtx: AudioContext | null = null;
function playPhaseChime(nextPhase: TimerPhase) {
  try {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!chimeCtx) chimeCtx = new Ctx();
    const ctx = chimeCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    // Rising two-note cue for focus ("lock in"), falling for break ("ease off").
    const freqs = nextPhase === "focus" ? [660, 880] : [880, 660];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    /* audio not unlocked yet — ignore */
  }
}

export function useTimerTick() {
  const status = useTimerStore((s) => s.status);
  const tick = useTimerStore((s) => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === "running") {
      tick(); // Sync immediately
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, tick]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "running") {
        tick();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, tick]);
}

export function useTimerNotification() {
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (prevPhaseRef.current !== phase && status === "running") {
      // Music keeps playing across phases on purpose — it used to be paused here and
      // never resumed, so it died permanently after the first block. The chime + the
      // notification are what signal the transition now.
      if ("Notification" in window && Notification.permission === "granted") {
        const msg =
          phase === "focus"
            ? "Break over — time to lock in."
            : "Nice session! Take a break.";
        new Notification("Flowstate", { body: msg, icon: "/icons/icon-192.png" });
      }

      playPhaseChime(phase === "focus" ? "focus" : "short_break");
    }
    prevPhaseRef.current = phase;
  }, [phase, status]);
}

export function useTimerDocumentTitle() {
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);

  useEffect(() => {
    if (status === "idle") {
      document.title = "Flowstate";
      return;
    }
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    const time = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    const label = phase === "focus" ? "Focus" : "Break";
    document.title = `${time} — ${label} | Flowstate`;
  }, [secondsRemaining, status, phase]);
}
