"use client";

import { Brain, Code, Palette, FileText, BookOpen, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { formatMinutes } from "@/lib/utils";

// Top Category focus blocks
// (Currently unreferenced — preserved verbatim from the insights page during
// the decomposition; the live "Top Focus Blocks" list uses KeyStatsColumn.)
interface CategoryProps {
  name: string;
  minutes: number;
  count: number;
  percentage: number;
}

export function CategoryCard({ name, minutes, count, percentage }: CategoryProps) {
  const { t } = useTranslation();
  let Icon = Brain;
  if (name.includes("Development") || name.includes("Software")) Icon = Code;
  else if (name.includes("Design") || name.includes("UI")) Icon = Palette;
  else if (name.includes("Writing") || name.includes("Technical")) Icon = FileText;
  else if (name.includes("Learning") || name.includes("Research") || name.includes("Study")) Icon = BookOpen;
  else if (name.includes("Admin") || name.includes("Planning") || name.includes("Meeting")) Icon = Calendar;

  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-all duration-300">

      <div className="absolute -right-4 -top-4 text-white/[0.01] group-hover:text-white/[0.03] transition-colors transform scale-150 pointer-events-none">
        <Icon className="h-16 w-16" />
      </div>

      <div className="flex justify-between items-start z-10">
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-sans font-semibold text-white/40 uppercase tracking-[0.15em]">{percentage}%</span>
      </div>

      <div className="flex flex-col z-10 mt-1">
        <span className="text-xs font-bold tracking-tight text-white/90 leading-tight truncate" title={name}>{name}</span>
        <span className="text-lg font-extrabold text-white tracking-tight leading-none mt-1.5 tabular-nums">
          {formatMinutes(minutes)}
        </span>
        <span className="text-[9px] text-white/40 font-mono tracking-tight mt-1">{count} {count === 1 ? t("insights.focusBlocks.sessionSingle", "deep session") : t("insights.focusBlocks.sessionPlural", "deep sessions")}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mt-1 z-10">
        <div
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
