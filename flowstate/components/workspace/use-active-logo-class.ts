"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";

// Interface theme and scene. Scene drives the visual accent color everywhere.
export function useActiveLogoClass() {
  const scene = useAppStore((s) => s.scene);
  const uiTheme = useThemeStore((s) => s.theme);

  const activeColor = scene || uiTheme;
  return activeColor === "studio" ? "logo-amber" :
    activeColor === "editorial" ? "logo-red" :
    activeColor === "terminal" ? "logo-green" :
    activeColor === "synthwave" ? "logo-magenta" :
    activeColor === "forest" ? "logo-emerald" :
    activeColor === "sunset" ? "logo-orange" :
    "logo-cyan";
}
