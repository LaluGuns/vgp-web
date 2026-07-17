"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";

// Interface theme. In "glass" the Scene recolours --primary (legacy behaviour);
// other themes own their accent, so we don't let the Scene override it.
export function useActiveLogoClass() {
  const scene = useAppStore((s) => s.scene);
  const uiTheme = useThemeStore((s) => s.theme);

  const activeColor = uiTheme !== "glass" ? uiTheme : scene;
  return activeColor === "studio" ? "logo-amber" :
    activeColor === "editorial" ? "logo-red" :
    activeColor === "terminal" ? "logo-green" :
    activeColor === "synthwave" ? "logo-magenta" :
    activeColor === "forest" ? "logo-emerald" :
    activeColor === "sunset" ? "logo-orange" :
    "logo-cyan";
}
