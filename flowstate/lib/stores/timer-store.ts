import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => void;
  setPreset: (key: string) => void;
  setCustom: (preset: Partial<TimerPreset>) => void;
}

function getPhaseSeconds(preset: TimerPreset, phase: TimerPhase): number {
  switch (phase) {
    case "focus":
      return preset.focusMinutes * 60;
    case "short_break":
      return preset.shortBreakMinutes * 60;
    case "long_break":
      return preset.longBreakMinutes * 60;
  }
}

function nextPhase(
  currentPhase: TimerPhase,
  sessionsCompleted: number,
  preset: TimerPreset
): TimerPhase {
  if (currentPhase !== "focus") return "focus";
  const nextCount = sessionsCompleted + 1;
  return nextCount % preset.longBreakInterval === 0
    ? "long_break"
    : "short_break";
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

      start: () => {
        const { preset, phase } = get();
        const total = getPhaseSeconds(preset, phase);
        set({
          status: "running",
          secondsRemaining: total,
          totalSeconds: total,
          currentSessionId: crypto.randomUUID(),
          expectedEndTime: Date.now() + total * 1000,
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
        const total = getPhaseSeconds(preset, "focus");
        set({
          status: "idle",
          phase: "focus",
          secondsRemaining: total,
          totalSeconds: total,
          currentSessionId: null,
          expectedEndTime: null,
        });
      },

      skip: () => {
        const { phase, sessionsCompleted, preset } = get();
        const wasWork = phase === "focus";
        const newCompleted = wasWork
          ? sessionsCompleted + 1
          : sessionsCompleted;
        const newPhase = nextPhase(phase, sessionsCompleted, preset);
        const total = getPhaseSeconds(preset, newPhase);
        const shouldAutoStart = wasWork
          ? preset.autoStartBreaks
          : preset.autoStartFocus;
        set({
          phase: newPhase,
          secondsRemaining: total,
          totalSeconds: total,
          sessionsCompleted: newCompleted,
          status: shouldAutoStart ? "running" : "idle",
          currentSessionId: shouldAutoStart ? crypto.randomUUID() : null,
          expectedEndTime: shouldAutoStart ? Date.now() + total * 1000 : null,
        });
      },

      tick: () => {
        const { expectedEndTime, status } = get();
        if (status !== "running" || !expectedEndTime) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
        if (remaining <= 0) {
          get().skip();
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
        });
      },
    }),
    {
      name: "flowstate-timer",
      partialize: (state) => ({
        preset: state.preset,
        sessionsCompleted: state.sessionsCompleted,
        status: state.status,
        phase: state.phase,
        secondsRemaining: state.secondsRemaining,
        totalSeconds: state.totalSeconds,
        currentSessionId: state.currentSessionId,
        expectedEndTime: state.expectedEndTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state || state.status !== "running") return;
        // A running phase survived a reload. expectedEndTime is absolute, so
        // the countdown stays correct; if it already elapsed while the tab was
        // gone, settle the phase without auto-starting the next one.
        if (!state.expectedEndTime) {
          useTimerStore.setState({ status: "paused" });
          return;
        }
        const remaining = Math.ceil((state.expectedEndTime - Date.now()) / 1000);
        if (remaining > 0) {
          useTimerStore.setState({ secondsRemaining: remaining });
          return;
        }
        const { phase, sessionsCompleted, preset } = state;
        const wasWork = phase === "focus";
        const newPhase = nextPhase(phase, sessionsCompleted, preset);
        const total = getPhaseSeconds(preset, newPhase);
        useTimerStore.setState({
          phase: newPhase,
          secondsRemaining: total,
          totalSeconds: total,
          sessionsCompleted: wasWork ? sessionsCompleted + 1 : sessionsCompleted,
          status: "idle",
          currentSessionId: null,
          expectedEndTime: null,
        });
      },
    }
  )
);
