import type { TimerPhase, TimerPreset } from "./timer-store";

export type TimerTransitionReason = "none" | "elapsed" | "manual_skip" | "reset" | "preset_change";

export function phaseSeconds(preset: TimerPreset, phase: TimerPhase): number {
  switch (phase) {
    case "focus":
      return preset.focusMinutes * 60;
    case "short_break":
      return preset.shortBreakMinutes * 60;
    case "long_break":
      return preset.longBreakMinutes * 60;
  }
}

export function phaseAfter(
  currentPhase: TimerPhase,
  sessionsCompleted: number,
  preset: TimerPreset,
  countFocusCompletion: boolean,
): TimerPhase {
  if (currentPhase !== "focus") return "focus";
  const completedCount = sessionsCompleted + (countFocusCompletion ? 1 : 0);
  return completedCount > 0 && completedCount % preset.longBreakInterval === 0
    ? "long_break"
    : "short_break";
}
