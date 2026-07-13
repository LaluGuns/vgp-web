import { create } from "zustand";

type UpgradePromptState = {
  open: boolean;
  messageKey: string;
  fallback: string;
  show: (messageKey: string, fallback: string) => void;
  close: () => void;
};

export const useUpgradePromptStore = create<UpgradePromptState>((set) => ({
  open: false,
  messageKey: "pricing.upgradeToUnlock",
  fallback: "This feature is available with Flowstate Pro.",
  show: (messageKey, fallback) => set({ open: true, messageKey, fallback }),
  close: () => set({ open: false }),
}));
