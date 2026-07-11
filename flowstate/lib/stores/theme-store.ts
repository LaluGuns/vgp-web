import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interface style ("skin") — distinct from the WebGL Scene wallpaper.
 * The active theme id is mirrored onto <html data-theme="…"> by ThemeProvider,
 * and globals.css swaps every design token per theme.
 */
export type ThemeId = "glass" | "studio" | "editorial" | "terminal";

export const THEMES: { id: ThemeId; nameKey: string; fallbackName: string }[] = [
  { id: "glass", nameKey: "app.themes.glass", fallbackName: "Dynamic Glass" },
  { id: "studio", nameKey: "app.themes.studio", fallbackName: "Analog Studio" },
  { id: "editorial", nameKey: "app.themes.editorial", fallbackName: "Editorial" },
  { id: "terminal", nameKey: "app.themes.terminal", fallbackName: "Instrument Panel" },
];

const THEME_IDS: ThemeId[] = THEMES.map((t) => t.id);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as string[]).includes(value);
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "glass",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "flowstate-ui-theme" }
  )
);
