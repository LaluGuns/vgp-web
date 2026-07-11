"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { TRACKS, PLAYLIST, genrePlaylist } from "@/lib/catalog";
import { musicPlayer } from "@/lib/audio/hls-player";

// Module-level variable to throttle global shortcuts across all hook instances (preventing duplicate execution)
let lastTriggerTime = 0;
const THROTTLE_MS = 150; // 150ms debounce/throttle

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.repeat) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // 1. Input Field Shortcut Masking
      // Mask all shortcuts if focused on any text input or editable element
      const isTextInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target.getAttribute("role") === "textbox";

      if (isTextInput) return;

      // 2. Prevent Spacebar shortcut on interactive elements
      // Allows spacebar to be used natively to activate buttons, checkboxes, select, links, sliders, etc.
      if (e.code === "Space") {
        const isInteractive =
          target instanceof HTMLButtonElement ||
          target instanceof HTMLAnchorElement ||
          target instanceof HTMLSelectElement ||
          target.getAttribute("role") === "button" ||
          target.getAttribute("role") === "link" ||
          target.getAttribute("role") === "checkbox" ||
          target.getAttribute("role") === "slider" ||
          target.getAttribute("role") === "menuitem" ||
          target.tabIndex >= 0;

        if (isInteractive) return;
      }

      // 3. Define the shortcuts we handle
      const activeKeys = [
        "Space",
        "KeyR",
        "KeyS",
        "KeyM",
        "KeyT",
        "KeyP",
        "BracketRight",
        "BracketLeft",
      ];
      if (!activeKeys.includes(e.code)) return;

      // 4. Ignore modified keys (e.g. Ctrl + R, Cmd + S) so we don't intercept browser defaults
      const isModified = e.metaKey || e.ctrlKey || e.altKey;
      if (isModified) return;

      // 5. Apply Debounce/Throttle
      const now = Date.now();
      if (now - lastTriggerTime < THROTTLE_MS) {
        e.preventDefault();
        return;
      }
      lastTriggerTime = now;

      const timer = useTimerStore.getState();
      const player = usePlayerStore.getState();
      const app = useAppStore.getState();
      const fs = useFocusSessionStore.getState();

      const optimizerLocked = fs.autopilot && timer.status === "running" && timer.phase === "focus";

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (optimizerLocked) return;
          
          if (timer.status === "idle") {
            timer.start();
            if (!player.isPlaying) {
              if (!player.currentTrack) {
                const playlist = genrePlaylist(player.activeGenre || "Lofi Chill");
                const tracks = playlist.tracks;
                if (tracks.length > 0) {
                  const track = player.shuffle
                    ? tracks[Math.floor(Math.random() * tracks.length)]
                    : tracks[0];
                  player.play(track, playlist);
                }
              }
              else player.resume();
            }
          } else if (timer.status === "running") {
            timer.pause();
            if (player.isPlaying) player.pause();
          } else if (timer.status === "paused") {
            timer.resume();
            if (!player.isPlaying) {
              if (!player.currentTrack) {
                const playlist = genrePlaylist(player.activeGenre || "Lofi Chill");
                const tracks = playlist.tracks;
                if (tracks.length > 0) {
                  const track = player.shuffle
                    ? tracks[Math.floor(Math.random() * tracks.length)]
                    : tracks[0];
                  player.play(track, playlist);
                }
              }
              else player.resume();
            }
          }
          break;
        case "KeyR":
          if (optimizerLocked) return;
          timer.reset();
          player.pause();
          break;
        case "KeyS":
          if (optimizerLocked) return;
          timer.skip();
          break;
        case "KeyM":
          app.togglePanel("mixer");
          break;
        case "KeyT":
          app.togglePanel("tasks");
          break;
        case "KeyP":
          if (optimizerLocked) return;
          if (player.isPlaying) player.pause();
          else player.resume();
          break;
        case "BracketRight":
          if (optimizerLocked) return;
          player.next();
          break;
        case "BracketLeft":
          if (optimizerLocked) return;
          player.previous();
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
}
