"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

// Focus Science Glossary & Tips Component
export function FocusScienceGlossary() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"ratio" | "fidget" | "residue">("ratio");

  return (
    <section className="glass-card p-5 flex flex-col gap-4 h-full relative">

      <div className="flex flex-col gap-1 z-10">
        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{t("insights.glossary.title", "How your focus stats work")}</h3>
        <p className="text-xs text-white/40 leading-relaxed font-normal">{t("insights.glossary.subtitle", "Plain notes on what each number measures — and what it doesn't.")}</p>
      </div>

      <div className="flex gap-1.5 border-b border-white/5 pb-2 z-10">
        <button
          onClick={() => setActiveTab("ratio")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "ratio"
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.focustime.tab", "Focus Time")}
        </button>
        <button
          onClick={() => setActiveTab("fidget")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "fidget"
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.fidgeting.tab", "Fidgeting")}
        </button>
        <button
          onClick={() => setActiveTab("residue")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "residue"
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.residue.tab", "Residue")}
        </button>
      </div>

      <div className="min-h-[120px] text-xs text-white/70 leading-relaxed bg-white/[0.01] border border-white/5 p-4 rounded-xl z-10 flex-1 flex flex-col justify-center">
        {activeTab === "ratio" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.focustime.title", "Deep Focus Time")}</strong> {t("insights.glossary.focustime.desc1", "counts the real measured minutes your focus timer actually ran — nothing inflated. We never credit the target duration you didn't finish, and we don't penalise you for leaving this tab to work in another app (your editor, Word, Figma…). Flowstate can't see that app, so it doesn't pretend to.")}
            </p>
            <p>
              {t("insights.glossary.focustime.desc2", "The heatmap and trend chart both use these honest minutes, so the numbers you see are the minutes you actually put in.")}
            </p>
          </div>
        )}
        {activeTab === "fidget" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.fidgeting.title", "Fidget Auditing")}</strong> {t("insights.glossary.fidgeting.desc1", "counts the small adjustments you make in the first 10 minutes — nudging the volume, swapping the ambient mix, changing the scene.")}
            </p>
            <p>
              {t("insights.glossary.fidgeting.desc2", "A lot of adjusting usually means the setup wasn't ready. Get your audio and scene how you want them before you start the clock, and you settle in faster.")}
            </p>
          </div>
        )}
        {activeTab === "residue" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.residue.title", "Attention Residue")}</strong> {t("insights.glossary.residue.desc1", "is what's left over when you switch tasks — part of your head stays on the last thing for a while after you've moved on.")}
            </p>
            <p>
              {t("insights.glossary.residue.desc2", "A quick glance at messages mid-block leaves some of that residue. Fewer switches while the timer runs means less of your attention gets split.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
