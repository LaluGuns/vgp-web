"use client";

import { useEffect, useRef, useState } from "react";
import { useMixerStore, type AmbientChannel } from "@/lib/stores/mixer-store";
import { useAppStore } from "@/lib/stores/app-store";
import { ambientEngine } from "@/lib/audio/audio-engine";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveAudioUrl } from "@/lib/audio/signed-urls";
import { recordFidget, recordVolumeFidget } from "@/lib/optimizer/fidget";
import { useTranslation } from "@/hooks/use-translation";
import {
  CloudRain,
  Coffee,
  Flame,
  Waves,
  Wind,
  Keyboard,
  TreePine,
  Zap,
  Bird,
  Volume2,
  Lock,
  Droplets,
  Disc3,
  Building2,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "cloud-rain": CloudRain,
  coffee: Coffee,
  flame: Flame,
  waves: Waves,
  wind: Wind,
  keyboard: Keyboard,
  "tree-pine": TreePine,
  zap: Zap,
  bird: Bird,
  droplets: Droplets,
  building: Building2,
  disc: Disc3,
};

const DEFAULT_SOUNDS: AmbientChannel[] = [
  { id: "rain", name: "Rain", slug: "rain", icon: "cloud-rain", category: "nature", fileUrl: "/sounds/rain.mp3", isPremium: false },
  { id: "fire", name: "Fireplace", slug: "fire", icon: "flame", category: "nature", fileUrl: "/sounds/fire.mp3", isPremium: false },
  { id: "ocean", name: "Ocean", slug: "ocean", icon: "waves", category: "nature", fileUrl: "/sounds/ocean.mp3", isPremium: false },
  { id: "forest", name: "Forest", slug: "forest", icon: "tree-pine", category: "nature", fileUrl: "/sounds/forest.mp3", isPremium: false },
  { id: "birds", name: "Birds", slug: "birds", icon: "bird", category: "nature", fileUrl: "/sounds/birds.mp3", isPremium: false },
  { id: "cafe", name: "Cafe", slug: "cafe", icon: "coffee", category: "urban", fileUrl: "/sounds/cafe.mp3", isPremium: false },
  { id: "wind", name: "Windchimes", slug: "wind", icon: "wind", category: "nature", fileUrl: "/sounds/wind.mp3", isPremium: false },
  { id: "fire-rain", name: "Fire & Rain", slug: "fire-rain", icon: "flame", category: "nature", fileUrl: "/sounds/fire-rain.mp3", isPremium: true },
  { id: "river", name: "River", slug: "river", icon: "droplets", category: "nature", fileUrl: "/sounds/river.mp3", isPremium: true },
  { id: "waterfall", name: "Waterfall", slug: "waterfall", icon: "droplets", category: "nature", fileUrl: "/sounds/waterfall.mp3", isPremium: true },
  { id: "city", name: "City", slug: "city", icon: "building", category: "urban", fileUrl: "/sounds/city.mp3", isPremium: true },
  { id: "vinyl", name: "Vinyl", slug: "vinyl", icon: "disc", category: "texture", fileUrl: "/sounds/vinyl.mp3", isPremium: true },
];

interface VolumeSliderProps {
  value: number;
  onCommit: (value: number) => void;
  onChange: (value: number) => void;
  className?: string;
}

function VolumeSlider({ value, onCommit, onChange, className }: VolumeSliderProps) {
  const [localVal, setLocalVal] = useState(value);

  // Sync with store updates (e.g. from preset loaded, remote sync, etc.)
  useEffect(() => {
    queueMicrotask(() => setLocalVal(value));
  }, [value]);

  return (
    <Slider
      value={[localVal]}
      max={1}
      step={0.01}
      className={className}
      onValueChange={([v]) => {
        setLocalVal(v);
        onChange(v);
      }}
      onValueCommit={([v]) => {
        onCommit(v);
      }}
    />
  );
}

export function AmbientMixer() {
  const { t } = useTranslation();
  const activeChannels = useMixerStore((s) => s.activeChannels);
  const masterVolume = useMixerStore((s) => s.masterVolume);
  const toggleSound = useMixerStore((s) => s.toggleSound);
  const setVolume = useMixerStore((s) => s.setVolume);
  const setMasterVolume = useMixerStore((s) => s.setMasterVolume);
  const availableSounds = useMixerStore((s) => s.availableSounds);
  const setSounds = useMixerStore((s) => s.setSounds);

  const isPremium = useAppStore((s) => s.isPremium);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      setSounds(DEFAULT_SOUNDS);
      initializedRef.current = true;
    }
  }, [setSounds]);

  const sounds = availableSounds.length > 0 ? availableSounds : DEFAULT_SOUNDS;

  useEffect(() => {
    ambientEngine.setMasterVolume(masterVolume);
  }, [masterVolume]);

  // Sync activeChannels to ref for use in play/stop effect
  const activeChannelsRef = useRef(activeChannels);
  useEffect(() => {
    activeChannelsRef.current = activeChannels;
  }, [activeChannels]);

  // Compute a string dependency of active channel IDs.
  // This ensures play/stop triggers only when channels are added/removed, NOT when volume changes.
  const activeIdsString = activeChannels.map((c) => c.id).sort().join(",");

  useEffect(() => {
    for (const sound of sounds) {
      const channel = activeChannelsRef.current.find((c) => c.id === sound.id);
      if (channel) {
        // Ambient loops resolve through the signed-URL provider (worker in prod,
        // /public in dev) — they are gitignored, so prod has no local copies.
        resolveAudioUrl(sound.fileUrl)
          .then((url) => {
            // Re-check: the channel may have been toggled off while resolving.
            if (activeChannelsRef.current.some((c) => c.id === sound.id)) {
              ambientEngine.play(sound.id, url, channel.volume);
            }
          })
          .catch((err) => console.error("Failed to resolve ambient URL:", err));
      } else if (ambientEngine.isPlaying(sound.id)) {
        ambientEngine.stop(sound.id);
      }
    }
    return () => {
      for (const sound of sounds) {
        if (ambientEngine.isPlaying(sound.id)) {
          ambientEngine.stop(sound.id);
        }
      }
    };
  }, [activeIdsString, sounds]);

  // Track previous volume settings to avoid redundant engine calls during slider updates
  const prevVolumesRef = useRef<Record<string, number>>({});
  useEffect(() => {
    for (const channel of activeChannels) {
      const prevVol = prevVolumesRef.current[channel.id];
      if (prevVol !== channel.volume) {
        ambientEngine.setVolume(channel.id, channel.volume);
        prevVolumesRef.current[channel.id] = channel.volume;
      }
    }
    // Clean up cached volumes for channels that are no longer active
    const activeIds = new Set(activeChannels.map((c) => c.id));
    for (const id in prevVolumesRef.current) {
      if (!activeIds.has(id)) {
        delete prevVolumesRef.current[id];
      }
    }
  }, [activeChannels]);

  return (
    <div className="space-y-6 select-none">
      
      {/* Master Volume Controls */}
      <div className="flex justify-between items-center bg-white/[0.02] p-4 border border-white/[0.04] rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">{t("dashboard.mixer.volumeMixer", "Volume Mixer")}</span>
          <h4 className="text-xs font-semibold text-white tracking-tight">{t("dashboard.mixer.ambientSounds", "Ambient Sounds")}</h4>
        </div>
        <div className="flex items-center gap-3 w-40">
          <Volume2 className="h-4.5 w-4.5 text-white/35 shrink-0" />
          <VolumeSlider
            value={masterVolume}
            className="hover:cursor-pointer text-primary"
            onChange={(v) => {
              ambientEngine.setMasterVolume(v);
            }}
            onCommit={(v) => {
              setMasterVolume(v);
              recordVolumeFidget();
            }}
          />
        </div>
      </div>

      {/* Grid of Sound Tiles */}
      <div className="grid grid-cols-3 gap-2.5 xs:gap-3">
        {sounds.map((sound) => {
          const active = activeChannels.find((c) => c.id === sound.id);
          const Icon = ICON_MAP[sound.icon] || Wind;
          const locked = sound.isPremium && !isPremium;

          return (
            <div 
              key={sound.id} 
              onClick={locked ? () => {
                if (confirm(t("pricing.upgradeToUnlock", "This sound is Pro-only. Go Pro to play the full library?"))) {
                  window.location.href = "/pricing";
                }
              } : undefined}
              onKeyDown={locked ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (confirm(t("pricing.upgradeToUnlock", "This sound is Pro-only. Go Pro to play the full library?"))) {
                    window.location.href = "/pricing";
                  }
                }
              } : undefined}
              tabIndex={locked ? 0 : undefined}
              className={cn(
                "flex flex-col items-center justify-between p-3 px-2.5 rounded-2xl transition-all duration-500 min-h-[112px] relative overflow-hidden select-none transform-gpu glass-tile group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50",
                active 
                  ? "ring-1 ring-primary/30 shadow-[0_4px_14px_rgba(0,212,255,0.12)] scale-[1.02] hover:scale-[1.04]" 
                  : locked
                    ? "opacity-60 hover:opacity-95 cursor-pointer hover:scale-[1.02] border-white/5 active:scale-[0.98]"
                    : "border-white/5 opacity-85 hover:opacity-100 hover:scale-[1.02] active:scale-[0.98] cursor-default"
              )}
            >
              {/* Premium Lock Corner */}
              {locked && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.15)] transition-all duration-300 group-hover:scale-110">
                  <Lock className="h-2.5 w-2.5 text-amber-400" />
                </div>
              )}

              {/* Card content container */}
              <div className={cn("flex flex-col items-center justify-between h-full w-full", locked && "pointer-events-none")}>
                {/* Sound Icon Button */}
                <button
                  disabled={locked}
                  onClick={() => { ambientEngine.unlock(); toggleSound(sound.id); recordFidget(); }}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 border",
                    active
                      ? "bg-primary/10 border-primary/15 text-primary"
                      : locked
                        ? "border-transparent text-muted-foreground/30"
                        : "border-white/5 text-white/35 hover:text-white hover:bg-white/[0.04] hover:border-white/10"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </button>

                {/* Name Label */}
                <span className={cn(
                  "text-[9px] font-mono uppercase tracking-wider mt-2 select-none text-center font-medium",
                  active ? "text-primary" : "text-white/30"
                )}>
                  {t(`dashboard.timer.sounds.${sound.id}`, sound.name)}
                </span>

                {/* Volume Slider for Active Channel */}
                <div className="w-full h-4 flex items-center mt-2.5 transition-all duration-300">
                  {active ? (
                    <VolumeSlider
                      className="w-full h-1 animate-in fade-in zoom-in-95 duration-300"
                      value={active.volume}
                      onChange={(v) => {
                        ambientEngine.setVolume(sound.id, v);
                      }}
                      onCommit={(v) => {
                        setVolume(sound.id, v);
                        recordVolumeFidget();
                      }}
                    />
                  ) : (
                    <span className="w-full h-[1px] bg-white/[0.03] block rounded animate-in fade-in duration-300" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
