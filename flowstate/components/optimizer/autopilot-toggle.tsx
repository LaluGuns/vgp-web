"use client";

import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { useTimerStore } from "@/lib/stores/timer-store";
import { cn } from "@/lib/utils";
import { Lock, LockOpen } from "lucide-react";

/**
 * Autopilot (Focus Lock) toggle. When on, controls lock during the focus block
 * so you can't fidget or impulsively quit. Can't be toggled mid-lock — the only
 * way out is the "Give Up" escape hatch (which records a failed session).
 */
export function AutopilotToggle() {
  const autopilot = useFocusSessionStore((s) => s.autopilot);
  const setAutopilot = useFocusSessionStore((s) => s.setAutopilot);
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);

  const lockedNow = autopilot && status === "running" && phase === "focus";

  return (
    <button
      onClick={() => {
        if (!lockedNow) setAutopilot(!autopilot);
      }}
      disabled={lockedNow}
      title="Autopilot locks music, mixer and pause/skip for the whole focus block"
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] transition-all duration-300 border select-none shrink-0 shadow-[inset_0_1px_rgba(255,255,255,0.05)]",
        autopilot
          ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_12px_rgba(0,229,255,0.2)] font-semibold"
          : "text-white/40 border-white/8 hover:text-white hover:bg-white/[0.04]",
        lockedNow && "opacity-80 cursor-not-allowed"
      )}
    >
      {autopilot ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
      Autopilot {autopilot ? "On" : "Off"}
    </button>
  );
}
