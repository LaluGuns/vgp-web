"use client";

import { useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { usePlayerStore } from "@/lib/stores/player-store";

// Invisible client island for the landing page's side effects:
// - pause any in-app music when the visitor lands on marketing territory
// - keep document.title localized when the locale changes client-side
export function LandingEffects() {
  const { t, locale } = useTranslation();

  useEffect(() => {
    // Pause any playing music tracks when visiting the landing page
    const playerStore = usePlayerStore.getState();
    if (playerStore.isPlaying) {
      playerStore.pause();
    }
  }, []);

  useEffect(() => {
    document.title = t("metadata.title", "Flowstate - Deep Work Music & Focus Timer");
  }, [locale, t]);

  return null;
}
