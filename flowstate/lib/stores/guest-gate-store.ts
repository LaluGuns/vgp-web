import { create } from "zustand";
import { track } from "@/lib/analytics";

// Persisted count of focus blocks a signed-out visitor has completed. We gate on
// the FIRST completed session (value-moment), never mid-focus — the prompt fires
// at the break boundary via useFocusTracker.
const COUNT_KEY = "flowstate-guest-sessions";

function bumpGuestSessions(): number {
  if (typeof window === "undefined") return 0;
  const next = (parseInt(localStorage.getItem(COUNT_KEY) || "0", 10) || 0) + 1;
  localStorage.setItem(COUNT_KEY, String(next));
  return next;
}

type GuestGateState = {
  open: boolean;
  // Called when a guest (no account) finishes a focus block. From the first
  // completed session on, we surface the sign-in gate.
  notifyGuestSessionComplete: () => void;
  close: () => void;
};

export const useGuestGateStore = create<GuestGateState>((set) => ({
  open: false,
  notifyGuestSessionComplete: () => {
    const count = bumpGuestSessions();
    if (count >= 1) {
      track("guest_gate_shown", { count });
      set({ open: true });
    }
  },
  close: () => set({ open: false }),
}));
