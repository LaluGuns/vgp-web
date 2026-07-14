"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { persistSession, initSessionOutbox } from "@/lib/optimizer/persist";
import { track } from "@/lib/analytics";
import { useUser } from "@/hooks/use-user";
import { useGuestGateStore } from "@/lib/stores/guest-gate-store";

/**
 * Drives the Focus Optimizer:
 *  - Per-second elapsed ticking (actual running focus time).
 *  - Session lifecycle: begin on focus start, finalize+persist on focus end,
 *    open the Context Bookmark modal on pause.
 *
 * NOTE: This intentionally does NOT track "defection" (leaving the browser tab).
 * Flowstate is a focus-music tool — your real work usually happens in another app
 * (editor, Word, Figma…). Treating a hidden tab as "not focused" produced false
 * "you drifted off" nudges and a garbage Real Focus Ratio, so it was removed.
 * Mount once (in the app page).
 */
export function useFocusTracker() {
  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);

  const prevStatus = useRef(status);
  const prevPhase = useRef(phase);

  // Keep the latest auth state in a ref so the session-end effect reads it fresh
  // (without adding it to the effect deps and re-running lifecycle logic).
  const { user, configured } = useUser();
  const authRef = useRef({ user, configured });
  authRef.current = { user, configured };

  // ── Outbox: retry undelivered sessions on app start / reconnect ──
  useEffect(() => {
    initSessionOutbox();
  }, []);

  // ── Elapsed ticking (only while focus is running) ──
  useEffect(() => {
    const id = setInterval(() => {
      const t = useTimerStore.getState();
      if (t.status === "running" && t.phase === "focus") {
        useFocusSessionStore.getState().tickElapsed();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Session lifecycle + context modal ──
  useEffect(() => {
    const fs = useFocusSessionStore.getState();
    const ps = prevStatus.current;
    const pp = prevPhase.current;

    // Resumes (transitioning from paused -> running) should NOT trigger beginSession.
    // A fresh session starts if transitioning from idle, or if the phase switches to focus (e.g. from break).
    const focusStarting =
      phase === "focus" && status === "running" && (ps === "idle" || pp !== "focus");

    const wasFocus = pp === "focus" && (ps === "running" || ps === "paused");
    const focusEnding = wasFocus && (phase !== "focus" || status === "idle");

    if (focusEnding) {
      if (fs.startedAt !== null) {
        const completed = phase !== "focus"; // moved to a break = completed; idle reset = gave up
        const summary = fs.finalizeSession(completed);
        if (summary) {
          const activeTaskId = useTaskStore.getState().activeTaskId;
          void persistSession(summary, useTimerStore.getState().preset.mode, activeTaskId);
          track(summary.completed ? "session_completed" : "session_skipped", {
            duration_min: summary.durationMinutes,
            mode: useTimerStore.getState().preset.mode,
          });
          // Increment completed Pomodoro count on active task if completed successfully
          if (summary.completed && activeTaskId) {
            useTaskStore.getState().incrementPomodoro(activeTaskId);
          }
          // Guest reached the break after a real focus block (>=60s finalized —
          // completed OR skipped) → nudge sign-in at the break boundary, never
          // mid-session. No-op when signed in or when auth isn't configured.
          if (authRef.current.configured && !authRef.current.user) {
            useGuestGateStore.getState().notifyGuestSessionComplete();
          }
        }
      }
    }

    if (focusStarting) {
      fs.beginSession();
      track("session_started", { mode: useTimerStore.getState().preset.mode });
    }

    // Pause during focus → record pause timestamp, and prompt for a context bookmark
    if (phase === "focus" && ps === "running" && status === "paused") {
      fs.openContextModal();
      fs.pauseSession();
    }
    // Resuming closes the prompt and completes pause duration calculation
    if (ps === "paused" && status === "running") {
      fs.closeContextModal();
      fs.resumeSession();
    }

    prevStatus.current = status;
    prevPhase.current = phase;
  }, [status, phase]);

  // ── Autopilot beforeunload warning ──
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const fs = useFocusSessionStore.getState();
      const t = useTimerStore.getState();
      const optimizerLocked = fs.autopilot && t.status === "running" && t.phase === "focus";

      if (optimizerLocked) {
        e.preventDefault();
        e.returnValue = "Leaving now will fail your focus lock session.";
        return e.returnValue;
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
