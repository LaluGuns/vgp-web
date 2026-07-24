"use client";

import { useState } from "react";
import { Music, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { GENRES } from "@/lib/catalog";
import { musicPlayer } from "@/lib/audio/hls-player";
import { recordFidget } from "@/lib/optimizer/fidget";
import { usePlayerStore } from "@/lib/stores/player-store";

// Sleek Collapsible Genre Selector
export function GenreSelector() {
  const { t } = useTranslation();
  const activeGenre = usePlayerStore((s) => s.activeGenre);
  const playGenre = usePlayerStore((s) => s.playGenre);
  const [isGenresExpanded, setIsGenresExpanded] = useState(false);

  return (
    <div className="glass-card p-3 flex flex-col shrink-0 transition-all duration-300">
      <button
        onClick={() => setIsGenresExpanded(!isGenresExpanded)}
        className="flex items-center justify-between w-full text-left focus:outline-none select-none group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
            <Music className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[9.5px] font-sans text-white/35 uppercase tracking-[0.15em] block leading-none mb-1.5 font-bold">{t("dashboard.player.soundtrack", "Focus Soundtrack")}</span>
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
              {activeGenre}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-sans font-semibold uppercase tracking-[0.05em] text-white/40 group-hover:text-white/60 transition-colors duration-300">
            {isGenresExpanded ? t("dashboard.player.collapse", "Collapse") : t("dashboard.player.changeSound", "Change Sound")}
          </span>
          <div className="w-5 h-5 rounded-md hover:bg-white/[0.04] flex items-center justify-center text-white/50 group-hover:text-white transition-colors duration-300">
            {isGenresExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </div>
      </button>

      <div className={cn(
        "grid transition-all duration-300 ease-in-out",
        isGenresExpanded ? "grid-rows-[1fr] opacity-100 mt-3.5" : "grid-rows-[0fr] opacity-0"
      )}>
        <div className="overflow-hidden">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-0.5 border-t border-white/[0.04] pt-3">
            {GENRES.map((g) => {
              const isActive = activeGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    musicPlayer.unlockAudio();
                    playGenre(g);
                    recordFidget();
                  }}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 active:scale-95",
                    isActive
                      ? "bg-primary/[0.12] text-primary border-primary/25 shadow-[inset_0_1px_rgba(255,255,255,0.1),0_0_12px_hsl(var(--primary)/0.25)] border-t-primary/35 border-l-primary/30 font-semibold"
                      : "text-white/60 hover:text-white bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
                  )}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
