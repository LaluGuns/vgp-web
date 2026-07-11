import { create } from "zustand";
import { useTimerStore } from "./timer-store";

export interface SessionSummary {
  durationMinutes: number;
  fidgetCount: number;
  fidgetFirst10min: number;
  contextBookmark: string;
  completed: boolean;
  fidgetTimeline: number[];
  startedAt: number;
  elapsedSeconds: number;
  targetDurationSeconds: number;
}

interface FocusSessionState {
  // live metrics for the current focus phase
  startedAt: number | null;
  startedAtCalendar: number | null;
  elapsedSeconds: number; // actual running focus time (excludes pauses)
  fidgetCount: number;
  fidgetTimeline: number[]; // seconds-since-start of each fidget
  contextBookmark: string;

  // Pause/Resume tracking for accurate elapsed time (immune to background throttling)
  lastPauseStart: number | null;
  totalPausedTime: number;

  // mode + ui
  autopilot: boolean;
  contextModalOpen: boolean;
  lastSummary: SessionSummary | null;

  beginSession: () => void;
  tickElapsed: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  addFidget: () => void;
  setBookmark: (text: string) => void;
  setAutopilot: (on: boolean) => void;
  openContextModal: () => void;
  closeContextModal: () => void;
  finalizeSession: (completed: boolean) => SessionSummary | null;
  dismissSummary: () => void;
}

// Sessions shorter than this don't produce a report (avoids noise from quick stops).
const MIN_REPORT_SECONDS = 60;

export const useFocusSessionStore = create<FocusSessionState>()((set, get) => ({
  startedAt: null,
  startedAtCalendar: null,
  elapsedSeconds: 0,
  fidgetCount: 0,
  fidgetTimeline: [],
  contextBookmark: "",
  lastPauseStart: null,
  totalPausedTime: 0,
  autopilot: false,
  contextModalOpen: false,
  lastSummary: null,

  beginSession: () =>
    set({
      startedAt: performance.now(),
      startedAtCalendar: Date.now(),
      elapsedSeconds: 0,
      fidgetCount: 0,
      fidgetTimeline: [],
      contextBookmark: "",
      lastPauseStart: null,
      totalPausedTime: 0,
    }),

  tickElapsed: () => {
    if (get().startedAt === null) return;
    set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
  },

  pauseSession: () => {
    if (get().startedAt !== null && get().lastPauseStart === null) {
      set({ lastPauseStart: performance.now() });
    }
  },

  resumeSession: () => {
    const { lastPauseStart, totalPausedTime } = get();
    if (lastPauseStart !== null) {
      set({
        totalPausedTime: totalPausedTime + (performance.now() - lastPauseStart),
        lastPauseStart: null,
      });
    }
  },

  addFidget: () => {
    const { startedAt, lastPauseStart, totalPausedTime } = get();
    if (startedAt === null) return;

    let currentPaused = totalPausedTime;
    if (lastPauseStart !== null) {
      currentPaused += performance.now() - lastPauseStart;
    }
    const exactElapsed = Math.max(
      0,
      Math.round((performance.now() - startedAt - currentPaused) / 1000)
    );

    set((s) => ({
      fidgetCount: s.fidgetCount + 1,
      fidgetTimeline: [...s.fidgetTimeline, exactElapsed],
    }));
  },

  setBookmark: (text) => set({ contextBookmark: text.slice(0, 140) }),
  setAutopilot: (on) => set({ autopilot: on }),
  openContextModal: () => set({ contextModalOpen: true }),
  closeContextModal: () => set({ contextModalOpen: false }),

  finalizeSession: (completed) => {
    const s = get();
    let finalPausedTime = s.totalPausedTime;
    if (s.lastPauseStart !== null) {
      finalPausedTime += performance.now() - s.lastPauseStart;
    }
    
    const elapsed = s.startedAt !== null 
      ? Math.max(0, Math.round((performance.now() - s.startedAt - finalPausedTime) / 1000))
      : s.elapsedSeconds;

    const cleared = {
      startedAt: null,
      startedAtCalendar: null,
      elapsedSeconds: 0,
      fidgetCount: 0,
      fidgetTimeline: [],
      contextBookmark: "",
      contextModalOpen: false,
      lastPauseStart: null,
      totalPausedTime: 0,
    };

    if (elapsed < MIN_REPORT_SECONDS) {
      set(cleared);
      return null;
    }

    const timerState = useTimerStore.getState();
    const targetDurationSeconds = timerState.preset.focusMinutes * 60;

    // An early skip doesn't count as completed
    const actualCompleted = completed && (elapsed >= targetDurationSeconds - 5);

    const summary: SessionSummary = {
      durationMinutes: Math.round(elapsed / 60),
      fidgetCount: s.fidgetCount,
      fidgetFirst10min: s.fidgetTimeline.filter((t) => t <= 600).length,
      contextBookmark: s.contextBookmark,
      completed: actualCompleted,
      fidgetTimeline: s.fidgetTimeline,
      startedAt: s.startedAtCalendar || Date.now(),
      elapsedSeconds: elapsed,
      targetDurationSeconds,
    };
    set({ ...cleared, lastSummary: summary });
    return summary;
  },

  dismissSummary: () => set({ lastSummary: null }),
}));
