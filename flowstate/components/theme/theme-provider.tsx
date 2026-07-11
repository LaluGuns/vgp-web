"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { track } from "@/lib/analytics";

/**
 * Applies the active interface theme to <html data-theme="…"> and keeps it in
 * sync with the store. Fires the `theme_changed` analytics event on user-driven
 * changes only (never on hydration/mount).
 *
 * Hydration-safety: a tiny inline script in app/layout.tsx sets data-theme
 * before paint from localStorage. zustand's persist rehydrates ASYNC, so on
 * first render the store still holds the default ("glass"). Applying that
 * pre-hydration value would clobber the pre-paint attribute (glass flash /
 * wrong theme). So we only write the attribute once the store has hydrated,
 * and we subscribe for subsequent changes instead of effect-on-selector.
 */
export function ThemeProvider() {
  useEffect(() => {
    const apply = (theme: string) => {
      document.documentElement.setAttribute("data-theme", theme);
    };

    let hydrated = useThemeStore.persist.hasHydrated();
    if (hydrated) apply(useThemeStore.getState().theme);

    const unsubHydration = useThemeStore.persist.onFinishHydration((state) => {
      hydrated = true;
      apply(state.theme); // sync attribute to the persisted value — not a user switch
    });

    const unsubChanges = useThemeStore.subscribe((state, prev) => {
      if (state.theme === prev.theme) return;
      apply(state.theme);
      // Only count switches after hydration as user-driven.
      if (hydrated) track("theme_changed", { theme: state.theme });
    });

    return () => {
      unsubHydration();
      unsubChanges();
    };
  }, []);

  return null;
}
