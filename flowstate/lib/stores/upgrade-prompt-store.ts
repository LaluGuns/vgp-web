import { create } from "zustand";
import { track } from "@/lib/analytics";

type UpgradePromptState = {
  open: boolean;
  messageKey: string;
  fallback: string;
  show: (messageKey: string, fallback: string, source?: string) => void;
  close: () => void;
};

export const useUpgradePromptStore = create<UpgradePromptState>((set) => ({
  open: false,
  messageKey: "pricing.upgradeToUnlock",
  fallback: "This feature is available with Flow Pro.",
  // Single choke-point for the paywall: every locked-feature tap flows through
  // here, so this is where we record it (source = which feature gated them).
  show: (messageKey, fallback, source = "unknown") => {
    track("paywall_viewed", { source });
    set({ open: true, messageKey, fallback });
  },
  close: () => set({ open: false }),
}));
