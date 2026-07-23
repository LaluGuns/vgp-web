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
  /**
   * True once the listener has curated the channel mix themselves (toggled a
   * sound or moved a channel fader). Environment presets check this so picking
   * an interface style can seed a mix for someone who has none, but never
   * overwrites one somebody built. Programmatic writes — preset loads and the
   * entitlement prune — deliberately leave it alone.
   */
  mixIsCustom: boolean;

  toggleSound: (id: string) => void;
  setVolume: (id: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  setSounds: (sounds: AmbientChannel[]) => void;
  loadPreset: (channels: ActiveChannel[]) => void;
  /**
   * Drop a channel the audio layer could not start, so the fader stops showing
   * as active while nothing plays. Not a listener edit — leaves mixIsCustom.
   */
  dropUnavailable: (id: string) => void;
  clearAll: () => void;
}

export const useMixerStore = create<MixerState>()(
  persist(
    (set, get) => ({
      activeChannels: [],
      masterVolume: 0.7,
      availableSounds: [],
      mixIsCustom: false,

      toggleSound: (id: string) => {
        const { activeChannels } = get();
        const exists = activeChannels.find((c) => c.id === id);
        if (exists) {
          set({ activeChannels: activeChannels.filter((c) => c.id !== id), mixIsCustom: true });
        } else {
          set({
            activeChannels: [...activeChannels, { id, volume: 0.5 }],
            mixIsCustom: true,
          });
        }
      },

      setVolume: (id: string, volume: number) => {
        set({
          activeChannels: get().activeChannels.map((c) =>
            c.id === id ? { ...c, volume } : c
          ),
          mixIsCustom: true,
        });
      },

      setMasterVolume: (volume: number) => set({ masterVolume: volume }),

      setSounds: (sounds: AmbientChannel[]) =>
        set({ availableSounds: sounds }),

      loadPreset: (channels: ActiveChannel[]) =>
        set({ activeChannels: channels }),

      dropUnavailable: (id: string) =>
        set({ activeChannels: get().activeChannels.filter((c) => c.id !== id) }),

      clearAll: () => set({ activeChannels: [], mixIsCustom: true }),
    }),
    {
      name: "flowstate-mixer",
      partialize: (state) => ({
        activeChannels: state.activeChannels,
        masterVolume: state.masterVolume,
        mixIsCustom: state.mixIsCustom,
      }),
    }
  )
);
