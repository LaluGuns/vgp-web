import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AmbientChannel {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  fileUrl: string;
  isPremium: boolean;
}

export interface ActiveChannel {
  id: string;
  volume: number;
}

interface MixerState {
  activeChannels: ActiveChannel[];
  masterVolume: number;
  availableSounds: AmbientChannel[];

  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  setSounds: (sounds: AmbientChannel[]) => void;
  loadPreset: (channels: ActiveChannel[]) => void;
  clearAll: () => void;
}

export const useMixerStore = create<MixerState>()(
  persist(
    (set, get) => ({
      activeChannels: [],
      masterVolume: 0.7,
      availableSounds: [],

      toggleSound: (id: string) => {
        const { activeChannels } = get();
        const exists = activeChannels.find((c) => c.id === id);
        if (exists) {
          set({ activeChannels: activeChannels.filter((c) => c.id !== id) });
        } else {
          set({
            activeChannels: [...activeChannels, { id, volume: 0.5 }],
          });
        }
      },

      setVolume: (id: string, volume: number) => {
        set({
          activeChannels: get().activeChannels.map((c) =>
            c.id === id ? { ...c, volume } : c
          ),
        });
      },

      setMasterVolume: (volume: number) => set({ masterVolume: volume }),

      setSounds: (sounds: AmbientChannel[]) =>
        set({ availableSounds: sounds }),

      loadPreset: (channels: ActiveChannel[]) =>
        set({ activeChannels: channels }),

      clearAll: () => set({ activeChannels: [] }),
    }),
    {
      name: "flowstate-mixer",
      partialize: (state) => ({
        activeChannels: state.activeChannels,
        masterVolume: state.masterVolume,
      }),
    }
  )
);
