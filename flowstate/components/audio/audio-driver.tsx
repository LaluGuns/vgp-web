"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { musicPlayer } from "@/lib/audio/hls-player";
import { resolveAudioUrl, prefetchAudioUrls } from "@/lib/audio/signed-urls";
import { genrePlaylist } from "@/lib/catalog";

/**
 * Headless, app-wide audio lifecycle. Mounted ONCE in the root layout so it
 * survives route changes — music no longer stops or restarts when you open
 * /insights, /pricing, etc. (This logic used to live inside the home page
 * component, which unmounted on navigation and killed/reset playback.)
 *
 * The MusicPlayer component is now pure UI: it reads store state and its
 * buttons dispatch store actions; this driver is what talks to the engine.
 */
export function AudioDriver() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);

  // Register engine callbacks once.
  useEffect(() => {
    musicPlayer.onProgress((current, dur) => {
      const { setProgress, setDuration } = usePlayerStore.getState();
      setProgress(current);
      if (dur > 0 && isFinite(dur)) setDuration(dur);
    });
    musicPlayer.onEnded(() => {
      if (usePlayerStore.getState().repeat === "one") {
        musicPlayer.seek(0);
        musicPlayer.play();
      } else {
        usePlayerStore.getState().next();
      }
    });
  }, []);

  // Load + (maybe) play whenever the track changes.
  useEffect(() => {
    if (!currentTrack?.hlsUrl) {
      musicPlayer.stop();
      return;
    }
    let cancelled = false;
    (async () => {
      // Resolve through the signed-URL provider (worker in prod, /public in dev),
      // prefetching the next couple of playlist tracks in the same round-trip.
      const store = usePlayerStore.getState();
      const playlist = store.currentPlaylist || genrePlaylist(store.activeGenre || "Lofi Chill");
      const idx = playlist.tracks.findIndex((t) => t.id === currentTrack.id);
      const upNext = idx >= 0
        ? playlist.tracks.slice(idx + 1, idx + 3).map((t) => t.hlsUrl)
        : [];

      let url: string;
      try {
        url = await resolveAudioUrl(currentTrack.hlsUrl, upNext);
      } catch (err) {
        console.error("Failed to resolve audio URL:", err);
        if (!cancelled) usePlayerStore.getState().pause();
        return;
      }
      if (cancelled) return;
      await musicPlayer.load(url);
      if (cancelled) return;
      if (usePlayerStore.getState().isPlaying) {
        musicPlayer.play().catch(() => {});
        prefetchAudioUrls(upNext);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Play/pause follows the store.
  useEffect(() => {
    if (!currentTrack?.hlsUrl) return;
    if (isPlaying) musicPlayer.play().catch(() => {});
    else musicPlayer.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Volume follows the store.
  useEffect(() => {
    musicPlayer.setVolume(volume);
  }, [volume]);

  return null;
}
