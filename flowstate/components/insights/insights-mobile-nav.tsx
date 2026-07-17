"use client";

import Link from "next/link";
import { Timer, BarChart2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Mobile Bottom Navigation Bar (Stitch premium mobile layout spec)
export function InsightsMobileNav() {
  const { t } = useTranslation();

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-16 glass-pill flex items-center justify-around z-40 px-3 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl border border-white/10 bg-black/40 rounded-full">
      {/* Home/Focus Link */}
      <Link
        href="/app"
        className="flex flex-col items-center justify-center flex-1 py-1 text-white/45 hover:text-white transition-all duration-300"
      >
        <Timer className="h-5 w-5 mb-0.5" />
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.focus", "Focus")}</span>
      </Link>

      {/* Stats Tab (Active on insights page) */}
      <div className="flex flex-col items-center justify-center flex-1 py-1 text-primary scale-105">
        <BarChart2 className="h-5 w-5 mb-0.5" />
        <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.insights", "Insights")}</span>
      </div>
    </div>
  );
}
