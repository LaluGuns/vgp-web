"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Maximize2, Minimize2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { AccountButton } from "@/components/auth/account-button";
import { LiveClock } from "./live-clock";
import { useActiveLogoClass } from "./use-active-logo-class";

// Header — Clean Apple-style bar (clock, mobile language select, logo,
// account, tour + fullscreen buttons).
export function WorkspaceHeader({ onStartTour }: { onStartTour: () => void }) {
  const { t, locale, setLocale } = useTranslation();
  const activeLogoClass = useActiveLogoClass();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  return (
    <header className="h-14 flex items-center justify-between pb-4 shrink-0 select-none z-20">
      {/* Left: Live clock on desktop */}
      <div className="hidden md:flex items-center gap-3 w-40">
        <LiveClock />
      </div>

      {/* Mobile Language Selector */}
      <div className="flex md:hidden items-center w-24">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as any)}
          className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-2 py-1 text-[9px] font-mono text-white/50 hover:text-white/80 transition-all duration-300 focus:outline-none cursor-pointer"
        >
          <option value="en" className="bg-[#0b1326] text-white">EN</option>
          <option value="id" className="bg-[#0b1326] text-white">ID</option>
          <option value="es" className="bg-[#0b1326] text-white">ES</option>
          <option value="fr" className="bg-[#0b1326] text-white">FR</option>
          <option value="de" className="bg-[#0b1326] text-white">DE</option>
          <option value="ja" className="bg-[#0b1326] text-white">JA</option>
          <option value="ko" className="bg-[#0b1326] text-white">KO</option>
          <option value="zh" className="bg-[#0b1326] text-white">ZH</option>
          <option value="pt" className="bg-[#0b1326] text-white">PT</option>
          <option value="ru" className="bg-[#0b1326] text-white">RU</option>
          <option value="it" className="bg-[#0b1326] text-white">IT</option>
        </select>
      </div>

      {/* Center: Title/Logo */}
      <div className="flex items-center gap-2 group cursor-pointer select-none">
        <Image
          src="/icons/flowstate-logo.png"
          alt="Flow"
          width={100}
          height={32}
          className={cn(
            "h-7 w-auto object-contain opacity-85 hover:opacity-100 theme-logo transition-all duration-500",
            activeLogoClass
          )}
          priority
        />
      </div>

      {/* Right: Account + Tour Guide + Fullscreen */}
      <div className="flex justify-end items-center gap-2 w-auto md:w-52">
        <AccountButton />

        {/* Onboarding Tour Button */}
        <button
          onClick={onStartTour}
          aria-label="Start guided tour"
          title="Start Tour Guide"
          className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-90"
        >
          <HelpCircle className="h-4 w-4 text-[#00e5ff] group-hover:text-cyan-300 transition-colors" />
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label={t("dashboard.player.toggleFullscreen", "Toggle fullscreen")}
          title={t("dashboard.player.fullscreen", "Fullscreen")}
          className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-90"
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
                isFullscreen
                  ? "opacity-0 scale-75 rotate-90 pointer-events-none"
                  : "opacity-100 scale-100 rotate-0"
              )}
            >
              <Maximize2 className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </div>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
                isFullscreen
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 -rotate-90 pointer-events-none"
              )}
            >
              <Minimize2 className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
