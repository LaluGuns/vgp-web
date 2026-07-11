import { useTimerStore } from "@/lib/stores/timer-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";

// Only count interactions that happen during an active focus phase.
function focusActive(): boolean {
  const t = useTimerStore.getState();
  return t.status === "running" && t.phase === "focus";
}

/** Discrete intentional control change (track switch, sound toggle, scene change…). */
export function recordFidget() {
  if (!focusActive()) return;
  useFocusSessionStore.getState().addFidget();
}

// Volume drags fire many events — debounce into a single fidget per ~1s of fiddling.
let volTimer: ReturnType<typeof setTimeout> | null = null;
export function recordVolumeFidget() {
  if (!focusActive()) return;
  if (volTimer) clearTimeout(volTimer);
  volTimer = setTimeout(() => {
    volTimer = null;
    if (focusActive()) useFocusSessionStore.getState().addFidget();
  }, 1000);
}
