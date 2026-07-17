"use client";

import Link from "next/link";
import { CheckSquare, Timer, Sliders, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export type MobileTab = "tasks" | "focus" | "atmosphere";

// Mobile Bottom Navigation Bar (Stitch premium mobile layout spec)
export function WorkspaceMobileNav({
  mobileTab,
  setMobileTab,
  activeTourTarget,
}: {
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  activeTourTarget: string | null;
}) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-16 glass-pill flex items-center justify-around z-40 px-3 shadow-[0_16px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl border border-white/10 bg-black/40 rounded-full">
      {/* Tasks Tab */}
      <button
        onClick={() => setMobileTab("tasks")}
        className={cn(
          "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full",
          mobileTab === "tasks" ? "text-primary scale-105" : "text-white/45 hover:text-white"
        )}
      >
        <CheckSquare className="h-5 w-5 mb-0.5" />
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.tasks.title", "Tasks")}</span>
      </button>

      {/* Focus Tab (Central highlight) */}
      <button
        onClick={() => setMobileTab("focus")}
        className={cn(
          "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full relative -top-3 w-14 h-14 bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 shadow-xl backdrop-blur-xl",
          mobileTab === "focus"
            ? "text-primary border-primary/40 shadow-[0_8px_24px_rgba(88,196,255,0.3),inset_0_1px_rgba(255,255,255,0.25)]"
            : "text-white/60 hover:text-white"
        )}
      >
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/5 animate-pulse",
          mobileTab === "focus" ? "block" : "hidden"
        )} />
        <Timer className="h-6 w-6 relative z-10" />
        <span className="text-[8px] font-sans font-extrabold uppercase tracking-widest mt-0.5 relative z-10">{t("dashboard.timer.focus", "Focus")}</span>
      </button>

      {/* Atmosphere Tab */}
      <button
        onClick={() => setMobileTab("atmosphere")}
        className={cn(
          "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full",
          mobileTab === "atmosphere" ? "text-primary scale-105" : "text-white/45 hover:text-white"
        )}
      >
        <Sliders className="h-5 w-5 mb-0.5" />
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.player.sound", "Sound")}</span>
      </button>

      {/* Insights Link */}
      <Link
        id="tour-stats-bottom"
        href="/insights"
        className={cn(
          "flex flex-col items-center justify-center flex-1 py-1 text-white/45 hover:text-white transition-all duration-300",
          activeTourTarget === "stats" && "ring-2 ring-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00e5ff]/10 rounded-xl"
        )}
      >
        <BarChart2 className="h-5 w-5 mb-0.5" />
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.insights", "Insights")}</span>
      </Link>
    </div>
  );
}
