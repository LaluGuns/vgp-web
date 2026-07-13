"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { TRACKS, PLAYLIST, GENRES, tracksByGenre, genrePlaylist } from "@/lib/catalog";
import { useTranslation } from "@/hooks/use-translation";
import { musicPlayer } from "@/lib/audio/hls-player";
import { useUpgradePromptStore } from "@/lib/stores/upgrade-prompt-store";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatTime, cn } from "@/lib/utils";
import { recordFidget, recordVolumeFidget } from "@/lib/optimizer/fidget";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Repeat1,
  Disc3,
  Lock,
  Search,
} from "lucide-react";

export function MusicPlayer() {
  const { t } = useTranslation();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const storeIsPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);
  const next = usePlayerStore((s) => s.next);
  const previous = usePlayerStore((s) => s.previous);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const setPlaylist = usePlayerStore((s) => s.setPlaylist);
  const activeGenre = usePlayerStore((s) => s.activeGenre);
  const setActiveGenre = usePlayerStore((s) => s.setActiveGenre);
  const crossfadeDuration = usePlayerStore((s) => s.crossfadeDuration);
  const setCrossfadeDuration = usePlayerStore((s) => s.setCrossfadeDuration);
  const showUpgrade = useUpgradePromptStore((s) => s.show);
  const playbackError = usePlayerStore((s) => s.playbackError);
  const retryPlayback = usePlayerStore((s) => s.retryPlayback);

  const [query, setQuery] = useState("");
  const isPremium = useAppStore((s) => s.isPremium);
  // Never render a playing state unless there is an actual source to load.
  const isPlaying = Boolean(currentTrack?.hlsUrl && storeIsPlaying);

  const visibleTracks = useMemo(() => {
    const list = tracksByGenre(activeGenre);
    const q = query.trim().toLowerCase();
    return q ? list.filter((t) => t.title.toLowerCase().includes(q)) : list;
  }, [activeGenre, query]);

  // Keep the active-genre playlist scoped on mount (engine lifecycle itself lives
  // in the persistent <AudioDriver> mounted in the root layout).
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      setPlaylist(genrePlaylist(activeGenre));
      initRef.current = true;
    }
  }, [setPlaylist, activeGenre]);

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  function handlePlayPause() {
    musicPlayer.unlockAudio();
    if (!currentTrack?.hlsUrl) {
      const playlist = genrePlaylist(activeGenre);
      const tracks = playlist.tracks;
      if (tracks.length > 0) {
        const track = shuffle 
          ? tracks[Math.floor(Math.random() * tracks.length)] 
          : (visibleTracks[0] ?? tracks[0]);
        play(track, playlist);
      }
    } else if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }

  return (
    <div className="space-y-4 select-none">
      {/* Now playing header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-14 h-14 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 flex items-center justify-center shrink-0 relative overflow-hidden",
            isPlaying ? "border-primary/35 shadow-[inset_0_1px_rgba(255,255,255,0.1),0_0_15px_rgba(0,229,255,0.2)]" : "shadow-[inset_0_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.15)]"
          )}
        >
          <div className="absolute inset-0.5 rounded-lg bg-gradient-to-b from-white/15 to-transparent opacity-80 pointer-events-none" />
          <Disc3
            className={cn("h-7 w-7 text-white/80 relative z-10", isPlaying && "text-primary animate-spin")}
            style={{ animationDuration: "4s" }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {currentTrack?.title ?? t("dashboard.player.selectTrack", "Select a track")}
          </p>
          <p className="text-[11px] text-white/40 truncate font-mono">
            {currentTrack?.artist ?? "Virzy Guns Production"}
            {currentTrack?.genre ? ` · ${currentTrack.genre}` : ""}
          </p>
        </div>
      </div>

      {playbackError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-400/[0.08] px-3 py-2">
          <span className="text-[11px] text-white/65">
            {t("insights.error.description", "Please check your connection and try again.")}
          </span>
          <button
            type="button"
            className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary hover:text-white"
            onClick={() => {
              musicPlayer.unlockAudio();
              retryPlayback();
            }}
          >
            {t("insights.error.retry", "Retry Connection")}
          </button>
        </div>
      )}

      {/* Progress */}
      <PlayerProgress />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            shuffle
              ? "text-primary bg-primary/10 border-primary/25 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              : "text-white/35 border-transparent",
            "transition-all duration-300 hover:text-white hover:bg-white/[0.06] hover:border-white/10 active:scale-95 border rounded-xl"
          )}
          onClick={() => { toggleShuffle(); recordFidget(); }}
          aria-label={t("dashboard.player.shuffle", "Shuffle")}
        >
          <Shuffle className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/10 active:scale-95 transition-all duration-300 border border-transparent rounded-xl"
          onClick={() => {
            previous();
            recordFidget();
          }}
          aria-label={t("dashboard.player.prev", "Previous")}
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] text-white relative overflow-hidden group border",
            isPlaying
              ? "glass-dome-sm border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.35)] animate-pulse-glow"
              : "glass-dome-sm border-white/20 hover:border-white/45 shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
          )}
          onClick={handlePlayPause}
          aria-label={isPlaying ? t("dashboard.player.pause", "Pause") : t("dashboard.player.play", "Play")}
        >
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-90 pointer-events-none" />
          {isPlaying ? (
            <Pause className="h-5 w-5 relative z-10 text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
          ) : (
            <Play className="h-5 w-5 ml-0.5 relative z-10 text-white/90 group-hover:text-white transition-colors duration-200" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-white/50 hover:text-white hover:bg-white/[0.06] hover:border-white/10 active:scale-95 transition-all duration-300 border border-transparent rounded-xl"
          onClick={() => { next(); recordFidget(); }}
          aria-label={t("dashboard.player.next", "Next")}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            repeat !== "none"
              ? "text-primary bg-primary/10 border-primary/25 shadow-[0_0_10px_rgba(0,229,255,0.2)]"
              : "text-white/35 border-transparent",
            "transition-all duration-300 hover:text-white hover:bg-white/[0.06] hover:border-white/10 active:scale-95 border rounded-xl"
          )}
          onClick={() => { cycleRepeat(); recordFidget(); }}
          aria-label={t("dashboard.player.repeat", "Repeat")}
        >
          <RepeatIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2.5 px-1 py-0.5">
        <Volume2 className="h-3.5 w-3.5 text-white/45 shrink-0" />
        <Slider value={[volume]} max={1} step={0.05} onValueChange={([v]) => { setVolume(v); recordVolumeFidget(); }} />
      </div>

      {/* Crossfade */}
      <div className="space-y-1.5 px-1">
        <div className="flex justify-between text-[9.5px] font-sans font-bold text-white/40 uppercase tracking-[0.15em] leading-none mb-1">
          <span>{t("dashboard.player.crossfade", "Crossfade")}</span>
          <span className="text-primary font-bold">{crossfadeDuration === 0 ? t("dashboard.player.off", "Off") : `${crossfadeDuration}s`}</span>
        </div>
        <Slider
          value={[crossfadeDuration]}
          min={0}
          max={12}
          step={1}
          onValueChange={([v]) => setCrossfadeDuration(v)}
        />
      </div>


      {/* Search */}
      <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-full px-3.5 py-1.5 transition-all duration-300 focus-within:border-primary/45 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_10px_rgba(0,229,255,0.08)] relative overflow-hidden group">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 group-focus-within:bg-primary/20" />
        <Search className="h-3.5 w-3.5 text-white/40 shrink-0 group-focus-within:text-primary transition-colors duration-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${t("dashboard.player.search", "Search")} ${activeGenre}...`}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-white/35 focus:outline-none"
        />
        <span className="text-[9.5px] font-sans font-bold text-white/45 tabular-nums shrink-0 leading-none">
          {visibleTracks.length}
        </span>
      </div>

      {/* Track list (selected genre) */}
      <div className="space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar pt-0.5">
        {visibleTracks.map((track, i) => {
          const isActive = currentTrack?.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => {
                musicPlayer.unlockAudio();
                if (track.isPremium && !isPremium) {
                  showUpgrade("pricing.upgradeToUnlockTrack", "This track is Pro-only. Go Pro to play the full library?");
                  return;
                }
                play(track, genrePlaylist(activeGenre));
                recordFidget();
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-left transition-all duration-300 border relative group",
                isActive
                  ? "bg-primary/[0.08] border-primary/25 text-primary shadow-[inset_0_1px_rgba(255,255,255,0.08),0_0_15px_rgba(0,229,255,0.12)] border-t-primary/40 border-l-primary/30 font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/[0.03] border-transparent hover:border-white/10 hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
              )}
            >
              <span className={cn(
                "text-[10px] font-mono tabular-nums w-5 shrink-0 text-center flex items-center justify-center",
                isActive ? "text-primary font-bold" : "text-white/40"
              )}>
                {isActive && isPlaying ? (
                  <span className="flex items-end gap-0.5 h-3 w-3.5 justify-center pb-0.5">
                    <span className="w-[1.5px] bg-primary rounded-full animate-eq-1" style={{ height: "3px" }} />
                    <span className="w-[1.5px] bg-primary rounded-full animate-eq-2" style={{ height: "9px" }} />
                    <span className="w-[1.5px] bg-primary rounded-full animate-eq-3" style={{ height: "5px" }} />
                  </span>
                ) : isActive ? (
                  "▶"
                ) : (
                  (i + 1).toString().padStart(2, "0")
                )}
              </span>
              <span className="flex-1 text-xs truncate font-medium">{track.title}</span>
              {track.isPremium && <Lock className="h-3 w-3 shrink-0 opacity-60" />}
              <span className="text-[10px] tabular-nums shrink-0 font-mono opacity-65">
                {formatTime(track.durationS)}
              </span>
            </button>
          );
        })}
        {visibleTracks.length === 0 && (
          <p className="text-[11px] text-white/60 text-center py-4">{t("dashboard.player.noTracks", "No tracks found.")}</p>
        )}
      </div>
    </div>
  );
}

// Progress subcomponent to isolate seek bar re-renders for performance
function PlayerProgress() {
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const [localProgress, setLocalProgress] = useState<number | null>(null);

  return (
    <div className="space-y-1">
      <Slider
        value={[localProgress !== null ? localProgress : progress]}
        max={duration || currentTrack?.durationS || 1}
        step={1}
        onValueChange={([v]) => {
          setLocalProgress(v);
        }}
        onValueCommit={([v]) => {
          musicPlayer.seek(v);
          usePlayerStore.getState().setProgress(v);
          setLocalProgress(null);
        }}
      />
      <div className="flex justify-between text-[10px] text-white/35 tabular-nums font-mono">
        <span>{formatTime(Math.floor(localProgress !== null ? localProgress : progress))}</span>
        <span>{formatTime(Math.floor(duration || currentTrack?.durationS || 0))}</span>
      </div>
    </div>
  );
}
