import { create } from "zustand";
import { persist } from "zustand/middleware";
import { phaseAfter, phaseSeconds, type TimerTransitionReason } from "./timer-transitions";

export type TimerMode = "pomodoro" | "deep_work" | "custom" | "stopwatch";
export type TimerPhase = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerPreset {
  mode: TimerMode;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

const PRESETS: Record<string, TimerPreset> = {
  pomodoro: {
    mode: "pomodoro",
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
  },
  deep_work: {
    mode: "deep_work",
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    longBreakInterval: 2,
    autoStartBreaks: true,
    autoStartFocus: false,
  },
  "90_20": {
    mode: "deep_work",
    focusMinutes: 90,
    shortBreakMinutes: 20,
    longBreakMinutes: 30,
    longBreakInterval: 2,
    autoStartBreaks: true,
    autoStartFocus: false,
  },
};

interface TimerState {
  status: TimerStatus;
  phase: TimerPhase;
  preset: TimerPreset;
  secondsRemaining: number;
  totalSeconds: number;
  sessionsCompleted: number;
  currentSessionId: string | null;
  expectedEndTime: number | null;
  lastTransitionReason: TimerTransitionReason;

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setPreset: (key: string) => void;
  setCustom: (preset: Partial<TimerPreset>) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      status: "idle",
      phase: "focus",
      preset: PRESETS.pomodoro,
      secondsRemaining: PRESETS.pomodoro.focusMinutes * 60,
      totalSeconds: PRESETS.pomodoro.focusMinutes * 60,
      sessionsCompleted: 0,
      currentSessionId: null,
      expectedEndTime: null,
      lastTransitionReason: "none",

      start: () => {
        const { preset, phase } = get();
        const total = phaseSeconds(preset, phase);
        set({
          status: "running",
          secondsRemaining: total,
          totalSeconds: total,
          currentSessionId: crypto.randomUUID(),
          expectedEndTime: Date.now() + total * 1000,
          lastTransitionReason: "none",
        });
      },

      pause: () => set({ status: "paused", expectedEndTime: null }),
      resume: () => {
        const { secondsRemaining } = get();
        set({
          status: "running",
          expectedEndTime: Date.now() + secondsRemaining * 1000,
        });
      },

      reset: () => {
        const { preset } = get();
        const total = phaseSeconds(preset, "focus");
        set({
          status: "idle",
          phase: "focus",
          secondsRemaining: total,
          totalSeconds: total,
          currentSessionId: null,
          expectedEndTime: null,
          lastTransitionReason: "reset",
        });
      },

      skip: () => {
        const { phase, sessionsCompleted, preset } = get();
        const wasFocus = phase === "focus";
        const newPhase = phaseAfter(phase, sessionsCompleted, preset, false);
        const total = phaseSeconds(preset, newPhase);
        const shouldAutoStart = wasFocus ? preset.autoStartBreaks : preset.autoStartFocus;
        set({
          phase: newPhase,
          secondsRemaining: total,
          totalSeconds: total,
          sessionsCompleted,
          status: shouldAutoStart ? "running" : "idle",
          currentSessionId: shouldAutoStart ? crypto.randomUUID() : null,
          expectedEndTime: shouldAutoStart ? Date.now() + total * 1000 : null,
          lastTransitionReason: "manual_skip",
        });
      },

      tick: () => {
        const { expectedEndTime, status, phase, sessionsCompleted, preset } = get();
        if (status !== "running" || !expectedEndTime) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
        if (remaining <= 0) {
          const wasFocus = phase === "focus";
          const newCompleted = wasFocus ? sessionsCompleted + 1 : sessionsCompleted;
          const newPhase = phaseAfter(phase, sessionsCompleted, preset, wasFocus);
          const total = phaseSeconds(preset, newPhase);
          const shouldAutoStart = wasFocus ? preset.autoStartBreaks : preset.autoStartFocus;
          set({
            phase: newPhase,
            secondsRemaining: total,
            totalSeconds: total,
            sessionsCompleted: newCompleted,
            status: shouldAutoStart ? "running" : "idle",
            currentSessionId: shouldAutoStart ? crypto.randomUUID() : null,
            expectedEndTime: shouldAutoStart ? Date.now() + total * 1000 : null,
            lastTransitionReason: "elapsed",
          });
        } else {
          set({ secondsRemaining: remaining });
        }
      },

      setPreset: (key: string) => {
        const preset = PRESETS[key];
        if (!preset) return;
        const total = preset.focusMinutes * 60;
        set({
          preset,
          status: "idle",
          phase: "focus",
          secondsRemaining: total,
          totalSeconds: total,
          sessionsCompleted: 0,
          currentSessionId: null,
          expectedEndTime: null,
          lastTransitionReason: "preset_change",
        });
      },

      setCustom: (partial: Partial<TimerPreset>) => {
        const current = get().preset;
        const preset = { ...current, ...partial, mode: "custom" as const };
        const total = preset.focusMinutes * 60;
        set({
          preset,
          status: "idle",
          phase: "focus",
          secondsRemaining: total,
          totalSeconds: total,
          currentSessionId: null,
          expectedEndTime: null,
          lastTransitionReason: "preset_change",
        });
      },
    }),
    {
      name: "flowstate-timer",
      partialize: (state) => ({
        preset: state.preset,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
