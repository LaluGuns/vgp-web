"use client";

import Link from "next/link";
import { Sparkles, Share2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Page header: title + localized insight message, mobile language/share
// actions, desktop share + back-to-timer buttons.
export function InsightsHeader({
  message,
  hasData,
  onShare,
}: {
  message: string;
  hasData: boolean;
  onShare: () => void;
}) {
  const { t, locale, setLocale } = useTranslation();

  return (
    <header className="md:h-14 h-auto flex flex-col md:flex-row md:items-center justify-between pb-4 shrink-0 select-none z-20 border-b border-white/5 mb-4 gap-3">
      <div className="flex items-start justify-between w-full md:w-auto gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" /> {t("insights.title", "Focus Insights")}
          </h1>
          <p className="text-white/50 text-[10px] md:text-xs leading-relaxed max-w-xs md:max-w-none">{message}</p>
        </div>

        {/* Mobile Actions Container (Language Selector & Share) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
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

          {hasData && (
            <button
              onClick={onShare}
              className="p-2 rounded-full glass-pill hover:bg-primary/5 transition-all text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 flex items-center justify-center shadow-lg"
              title={t("insights.share", "Share Stats")}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop-only action buttons */}
      <div className="hidden md:flex items-center gap-3">
        {hasData && (
          <button
            onClick={onShare}
            className="px-4 py-2.5 rounded-full glass-pill hover:bg-primary/5 transition-all text-xs font-mono uppercase tracking-wider text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 flex items-center gap-2"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t("insights.share", "Share Stats")}
          </button>
        )}
        <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10">
          {t("dashboard.backToTimer", "Back to Timer")}
        </Link>
      </div>
    </header>
  );
}
