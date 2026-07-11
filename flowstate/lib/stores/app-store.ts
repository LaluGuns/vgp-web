import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  scene: string;
  showTasks: boolean;
  showMixer: boolean;
  showPlayer: boolean;
  showStats: boolean;
  isPremium: boolean;
  premiumUserId: string | null;

  setScene: (scene: string) => void;
  togglePanel: (panel: "tasks" | "mixer" | "player" | "stats") => void;
  setPremium: (isPremium: boolean, userId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scene: "midnight",
      showTasks: true,
      showMixer: false,
      showPlayer: true,
      showStats: false,
      isPremium: false,
      premiumUserId: null,

      setScene: (scene) => set({ scene }),

      togglePanel: (panel) => {
        const key = `show${panel.charAt(0).toUpperCase() + panel.slice(1)}` as keyof Pick<
          AppState,
          "showTasks" | "showMixer" | "showPlayer" | "showStats"
        >;
        set({ [key]: !get()[key] } as Partial<AppState>);
      },

      setPremium: (isPremium, userId) => set({ isPremium, premiumUserId: userId }),
    }),
    {
      name: "flowstate-app",
      partialize: (state) => ({
        scene: state.scene,
        showTasks: state.showTasks,
        showMixer: state.showMixer,
        showPlayer: state.showPlayer,
        isPremium: state.isPremium,
        premiumUserId: state.premiumUserId,
      }),
    }
  )
);

