"use client";

import { useRef } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";
import { useTaskStore } from "@/lib/stores/task-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { musicPlayer } from "@/lib/audio/hls-player";
import { TRACKS, PLAYLIST, genrePlaylist } from "@/lib/catalog";
import {
  useTimerTick,
  useTimerNotification,
  useTimerDocumentTitle,
} from "@/hooks/use-timer";
import { formatTime, cn } from "@/lib/utils";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { Button } from "@/components/ui/button";
import { RotateCcw, SkipForward, Play, Pause, Lock } from "lucide-react";
import { TimerSettings } from "./timer-settings";
import { ThemedTimerCenter } from "./theme-timers";
import { StudioDeck } from "./studio-deck";
import { AutopilotToggle } from "../optimizer/autopilot-toggle";
import { useTranslation } from "@/hooks/use-translation";
import dynamic from "next/dynamic";

// three.js is ~150KB gzip — load it lazily so it stays out of the initial bundle.
// The dial renders instantly (dome + SVG ring); the organic sphere fades in a beat later.
const LiquidSphere = dynamic(
  () => import("./liquid-sphere").then((m) => m.LiquidSphere),
  { ssr: false }
);

const SCENE_THEMES: Record<
  string,
  {
    primary: string;
    shadowColor: string;
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
  }
> = {
  midnight: {
    primary: "#58c4ff",
    shadowColor: "rgba(88,196,255,0.4)",
    gradientStart: "#00E5FF",
    gradientMid: "#00B0FF",
    gradientEnd: "#0055FF",
  },
  "rain-window": {
    primary: "#00e5ff",
    shadowColor: "rgba(0,229,255,0.4)",
    gradientStart: "#00E5FF",
    gradientMid: "#0099FF",
    gradientEnd: "#0033FF",
  },
  synthwave: {
    primary: "#ff0080",
    shadowColor: "rgba(255,0,128,0.4)",
    gradientStart: "#FF0080",
    gradientMid: "#D900FF",
    gradientEnd: "#7F00FF",
  },
  forest: {
    primary: "#00ff88",
    shadowColor: "rgba(0,255,136,0.4)",
    gradientStart: "#00FF88",
    gradientMid: "#10B981",
    gradientEnd: "#047857",
  },
  terminal: {
    primary: "#00ff66",
    shadowColor: "rgba(0,255,102,0.4)",
    gradientStart: "#00FF66",
    gradientMid: "#059669",
    gradientEnd: "#022c22",
  },
  sunset: {
    primary: "#ff5500",
    shadowColor: "rgba(255,85,0,0.4)",
    gradientStart: "#FF5500",
    gradientMid: "#FF9900",
    gradientEnd: "#CC3300",
  },
};

// Studio lamp colours per scene — the Visual Theme re-lamps the deck (digits,
// needles, LEDs). Deliberately warmer-calibrated than the glass scene palette:
// the machine's default is amber like real hardware, and each scene stays a
// clearly different backlight so scene picks are meaningful outside glass.
const STUDIO_LAMP: Record<string, string> = {
  midnight: "38 88% 56%", // default: warm amber
  "rain-window": "199 90% 64%", // ice blue
  synthwave: "320 88% 62%", // magenta
  forest: "150 65% 52%", // moss green
  terminal: "140 85% 55%", // phosphor
  sunset: "18 95% 58%", // burnt orange
};

// Instrument Panel phosphors — classic CRT tube colours per scene.
const TERMINAL_LAMP: Record<string, string> = {
  midnight: "140 90% 55%", // default: P1 green phosphor
  "rain-window": "190 95% 60%", // cyan tube
  synthwave: "315 90% 62%", // magenta tube
  forest: "95 75% 55%", // chartreuse
  terminal: "140 90% 55%", // green (same family as default on purpose)
  sunset: "35 95% 55%", // amber CRT
};

// Editorial spot colours — one bold print ink per scene.
const EDITORIAL_LAMP: Record<string, string> = {
  midnight: "16 90% 55%", // default: vermilion
  "rain-window": "220 80% 60%", // cobalt
  synthwave: "330 85% 58%", // process magenta
  forest: "150 60% 42%", // deep green ink
  terminal: "170 65% 42%", // teal ink
  sunset: "25 95% 55%", // warm orange ink
};

// Convert a hex accent to the "H S% L%" triplet Tailwind's --primary expects, so
// scoping `--primary` to the timer re-themes every primary-referencing element at
// once (play button, phase badge, ripples, glow) instead of hardcoding each.
function hexToHslTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue /= 6;
  }
  return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function TimerDisplay() {
  useTimerTick();
  useTimerNotification();
  useTimerDocumentTitle();

  const { t } = useTranslation();

  const wasPlayingRef = useRef(true);

  const status = useTimerStore((s) => s.status);
  const phase = useTimerStore((s) => s.phase);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const skip = useTimerStore((s) => s.skip);

  const musicPlay = usePlayerStore((s) => s.play);
  const musicPause = usePlayerStore((s) => s.pause);
  const musicResume = usePlayerStore((s) => s.resume);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);
  const musicVolume = usePlayerStore((s) => s.volume);
  const setMusicVolume = usePlayerStore((s) => s.setVolume);
  const preset = useTimerStore((s) => s.preset);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const activeGenre = usePlayerStore((s) => s.activeGenre);
  const shuffle = usePlayerStore((s) => s.shuffle);

  const autopilot = useFocusSessionStore((s) => s.autopilot);
  const setAutopilot = useFocusSessionStore((s) => s.setAutopilot);
  const bookmark = useFocusSessionStore((s) => s.contextBookmark);

  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const scene = useAppStore((s) => s.scene);
  const uiTheme = useThemeStore((s) => s.theme);

  const timerProgress =
    totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  const radius = 118;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (timerProgress / 100) * circumference;

  const isFocus = phase === "focus";
  const phaseLabel = isFocus ? t("dashboard.timer.work", "Work") : t("dashboard.timer.break", "Break");
  // Scope --primary to the scene accent so the whole dial (play button, badge,
  // ripples, glows) follows the theme. Break state uses its own emerald classes.
  const sceneHsl = hexToHslTriplet(SCENE_THEMES[scene]?.primary ?? "#58c4ff");

  function handlePlayPause() {
    musicPlayer.unlockAudio();
    if (status === "idle") {
      start();
      if (!isMusicPlaying) {
        if (!currentTrack) {
          const playlist = genrePlaylist(activeGenre || "Lofi Chill");
          const tracks = playlist.tracks;
          if (tracks.length > 0) {
            const track = shuffle 
              ? tracks[Math.floor(Math.random() * tracks.length)] 
              : tracks[0];
            musicPlay(track, playlist);
          }
        }
        else musicResume();
      }
    } else if (status === "running") {
      wasPlayingRef.current = isMusicPlaying;
      pause();
      if (isMusicPlaying) musicPause();
    } else {
      resume();
      if (!isMusicPlaying && wasPlayingRef.current) {
        if (!currentTrack) {
          const playlist = genrePlaylist(activeGenre || "Lofi Chill");
          const tracks = playlist.tracks;
          if (tracks.length > 0) {
            const track = shuffle 
              ? tracks[Math.floor(Math.random() * tracks.length)] 
              : tracks[0];
            musicPlay(track, playlist);
          }
        }
        else musicResume();
      }
    }
  }

  function handleReset() {
    reset();
    musicPause();
  }

  const lockedNow = autopilot && status === "running" && isFocus;
  function giveUp() {
    reset();
    setAutopilot(false);
    musicPause();
  }

  const contextLabel =
    isFocus && bookmark
      ? bookmark
      : activeTask
        ? `# ${activeTask.title}`
        : t("dashboard.timer.focus", "focus").toUpperCase();

  // Every interface style re-lamps its machine from the Visual Theme (scene):
  // glass follows the scene palette directly; the machines each map scenes to
  // their own hardware-appropriate lamp colours. Scoped to the timer column.
  const lampHsl =
    uiTheme === "studio"
      ? STUDIO_LAMP[scene] ?? "38 88% 56%"
      : uiTheme === "terminal"
        ? TERMINAL_LAMP[scene] ?? "140 90% 55%"
        : uiTheme === "editorial"
          ? EDITORIAL_LAMP[scene] ?? "16 90% 55%"
          : sceneHsl;

  return (
    <div
      className="flex flex-col items-center gap-5 w-full select-none"
      style={{ "--primary": lampHsl } as React.CSSProperties}
    >
      {/* Non-glass interface styles bring their own centerpiece machine
          instead of the liquid-glass sphere dial. Studio gets the full
          reel-to-reel deck (VU meters + transport + volume) — the scene
          (Visual Theme) re-lamps the machine via accentHsl, so scene picks
          stay meaningful outside glass. */}
      {uiTheme === "studio" ? (
        <StudioDeck
          secondsRemaining={secondsRemaining}
          progress={timerProgress}
          isFocus={isFocus}
          isRunning={status === "running"}
          isIdle={status === "idle"}
          phaseLabel={phaseLabel}
          presetLabel={`${preset.mode === "pomodoro" ? "POMODORO" : "DEEP WORK"} · ${preset.focusMinutes} MIN`}
          contextLabel={contextLabel}
          locked={lockedNow}
          musicPlaying={isMusicPlaying}
          volume={musicVolume}
          accentHsl={lampHsl}
          onPlayPause={handlePlayPause}
          onStop={() => {
            if (status === "running") {
              wasPlayingRef.current = isMusicPlaying;
              pause();
              if (isMusicPlaying) musicPause();
            }
          }}
          onRewind={reset} // wind back: timer restarts, the music keeps rolling
          onEject={handleReset} // pop the tape: timer reset AND music stops
          onPower={
            status === "idle" ? handlePlayPause : lockedNow ? giveUp : handleReset
          }
          onSkip={skip}
          onGiveUp={giveUp}
          onVolume={setMusicVolume}
          t={t}
        />
      ) : uiTheme !== "glass" ? (
        <ThemedTimerCenter
          theme={uiTheme}
          secondsRemaining={secondsRemaining}
          progress={timerProgress}
          isFocus={isFocus}
          isRunning={status === "running"}
          isIdle={status === "idle"}
          phaseLabel={phaseLabel}
          contextLabel={contextLabel}
          locked={lockedNow}
          volume={musicVolume}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSkip={skip}
          onGiveUp={giveUp}
          onVolume={setMusicVolume}
          t={t}
        />
      ) : (
      <div className="relative w-[280px] h-[280px] flex items-center justify-center shrink-0">
        {/* Glass lens backing (Liquid Glass Dome) */}
        <div className="absolute inset-[15px] rounded-full glass-dome transform-gpu pointer-events-none z-0" />

        {/* Live 3D Organic Liquid Sphere (Rendered in front of the dome background, but behind HUD and sheen) */}
        <div className="absolute inset-[15px] rounded-full overflow-hidden z-10 pointer-events-none">
          <LiquidSphere
            isRunning={status === "running"}
            color={isFocus ? (SCENE_THEMES[scene]?.primary ?? "#58c4ff") : (SCENE_THEMES[scene]?.gradientMid ?? "#10B981")}
          />
        </div>

        {/* 3D Specular Sheen & Glass Highlights (Overlay on top of the sphere) */}
        <div className="absolute inset-[15px] rounded-full pointer-events-none z-20 overflow-hidden">
          {/* Specular sheen highlight */}
          <div className="glass-sheen" />
          {/* Subtle back reflection */}
          <div className="glass-reflection" />
          {/* Inner glass refraction ring */}
          <div className="absolute inset-1.5 rounded-full border border-white/15 bg-gradient-to-tr from-white/[0.03] to-transparent" />
        </div>

        {/* Ambient ripples while running */}
        {status === "running" && (
          <>
            <div
              className={cn(
                "absolute w-[250px] h-[250px] rounded-full border opacity-0 pointer-events-none animate-ripple z-0",
                isFocus ? "border-primary/20" : "border-secondary/20"
              )}
            />
            <div
              className={cn(
                "absolute w-[250px] h-[250px] rounded-full border opacity-0 pointer-events-none animate-ripple-delayed z-0",
                isFocus ? "border-primary/20" : "border-secondary/20"
              )}
            />
          </>
        )}

        <svg className="absolute inset-0 -rotate-90 z-10 w-full h-full" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={SCENE_THEMES[scene]?.gradientStart ?? "#00E5FF"} />
              <stop offset="50%" stopColor={SCENE_THEMES[scene]?.gradientMid ?? "#00B0FF"} />
              <stop offset="100%" stopColor={SCENE_THEMES[scene]?.gradientEnd ?? "#0055FF"} />
            </linearGradient>
            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="dial-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />

          {/* Glow under-layer */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={isFocus ? "url(#focusGradient)" : "url(#breakGradient)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            opacity="0.3"
            filter="url(#dial-glow)"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
          {/* Sharp foreground */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke={isFocus ? "url(#focusGradient)" : "url(#breakGradient)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        {/* Central HUD */}
        <div className="absolute inset-0 pointer-events-none z-30 select-none text-center">
          {/* Phase Badge */}
          <div className="absolute top-[50px] left-1/2 -translate-x-1/2 pointer-events-auto">
            <div
              className={cn(
                "px-3.5 py-1 rounded-full border bg-black/40 border-white/[0.06] backdrop-blur-sm flex items-center gap-2",
                isFocus ? "border-primary/20" : "border-secondary/25"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  isFocus ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]" : "bg-secondary shadow-[0_0_6px_hsl(var(--secondary))]"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-mono font-bold uppercase tracking-[0.2em]",
                  isFocus ? "text-primary glow-text-primary" : "text-secondary glow-text-secondary"
                )}
              >
                {phaseLabel}
              </span>
              {lockedNow && <Lock className="h-2.5 w-2.5 text-primary" />}
            </div>
          </div>

          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] text-[5.2rem] font-sans font-semibold tracking-tight text-white leading-none tabular-nums pointer-events-auto"
            style={{
              filter: isFocus
                ? `drop-shadow(0px 2px 8px rgba(0,0,0,0.5)) drop-shadow(0px 4px 20px ${SCENE_THEMES[scene]?.shadowColor ?? "rgba(88,196,255,0.4)"})`
                : `drop-shadow(0px 2px 8px rgba(0,0,0,0.5)) drop-shadow(0px 4px 20px ${SCENE_THEMES[scene]?.shadowColor ?? "rgba(88,196,255,0.4)"})`
            }}
          >
            {formatTime(secondsRemaining)}
          </span>

          {/* Bottom Context / Task label */}
          <div className="absolute bottom-[46px] left-1/2 -translate-x-1/2 w-full max-w-[230px] h-10 flex items-center justify-center px-4 pointer-events-auto">
            {isFocus && bookmark ? (
              <span
                className={cn(
                  "text-center leading-snug line-clamp-2 px-2",
                  status === "paused"
                    ? "text-white font-semibold text-xs"
                    : "text-white/60 text-[11px]"
                )}
              >
                {bookmark}
              </span>
            ) : (
              <span className="text-[10px] text-white/60 max-w-[170px] truncate font-mono uppercase tracking-wider">
                {activeTask ? (
                  <span className="text-white/80 font-medium"># {activeTask.title}</span>
                ) : (
                  t("dashboard.timer.focus", "focus").toUpperCase()
                )}
              </span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Timer controls — every non-glass machine carries its own transport
          (deck buttons / terminal commands / folio text actions) */}
      {uiTheme !== "glass" ? null : lockedNow ? (
        <div className="flex flex-col items-center gap-2.5 z-20">
          <div className="flex items-center gap-2 px-5 py-3 !rounded-full glass-card text-primary text-[11px] font-mono uppercase tracking-[0.15em]">
            <Lock className="h-4 w-4" /> {t("dashboard.timer.locked", "Locked — finish the block")}
          </div>
          <button
            onClick={giveUp}
            className="text-[10px] text-muted-foreground/40 hover:text-red-400 transition-colors uppercase tracking-[0.15em]"
          >
            {t("dashboard.timer.giveUp", "Give up")}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-6 px-6 py-2.5 !rounded-full z-20 transform-gpu glass-card border-t-white/30 border-l-white/20">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-white/50 hover:text-white hover:bg-white/[0.05] transition-all duration-300 active:scale-95"
            onClick={handleReset}
            aria-label={t("dashboard.timer.reset", "Reset")}
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </Button>

          <Button
            variant="ghost"
            className={cn(
              "rounded-full w-14 h-14 flex items-center justify-center transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] glass-dome-sm border-2 text-primary",
              status === "running"
                ? isFocus
                  ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
                  : "border-secondary text-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.5)]"
                : "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)] animate-pulse-glow"
            )}
            onClick={handlePlayPause}
            aria-label={status === "running" ? t("dashboard.timer.pause", "Pause") : t("dashboard.timer.start", "Start")}
          >
            {status === "running" ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 text-white/50 hover:text-white hover:bg-white/[0.05] transition-all duration-300 active:scale-95"
            onClick={skip}
            aria-label={t("dashboard.timer.skip", "Skip")}
          >
            <SkipForward className="h-4.5 w-4.5" />
          </Button>
        </div>
      )}

      {/* Preset pills & Autopilot lock controls (Tightly styled inside the card) */}
      <div className="flex flex-col items-center gap-3.5 mt-2 shrink-0 select-none">
        <TimerSettings />
        <AutopilotToggle />
      </div>
    </div>
  );
}
