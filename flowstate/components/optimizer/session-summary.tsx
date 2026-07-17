"use client";

import { useState } from "react";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Target, MousePointerClick, Timer, X, Share2 } from "lucide-react";
import dynamic from "next/dynamic";

// The share card renderer (canvas drawing + qrcode) is only needed after a
// finished focus block — keep it out of the initial /app bundle.
const ShareModal = dynamic(
  () => import("./share-modal").then((m) => m.ShareModal),
  { ssr: false }
);

/** Friction Audit — end-of-session report shown after a real focus block. */
export function SessionSummary() {
  const [shareOpen, setShareOpen] = useState(false);
  const summary = useFocusSessionStore((s) => s.lastSummary);
  const dismiss = useFocusSessionStore((s) => s.dismissSummary);
  if (!summary) return null;

  const handleShare = () => {
    setShareOpen(true);
  };

  const heroColor = summary.completed ? "text-emerald-400" : "text-primary";

  let insight = "Clean block — you barely touched the controls.";
  if (summary.fidgetFirst10min >= 6) {
    insight = `${summary.fidgetFirst10min} adjustments in your first 10 minutes — set your audio and scene before the clock starts and you settle in faster.`;
  } else if (summary.completed) {
    insight = `${summary.durationMinutes}m of deep work, logged in full.`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
      <div className="glass-card w-full max-w-sm p-6 space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
            Friction Audit
          </span>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="text-muted-foreground/60 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center">
          <div className={cn("text-5xl font-bold tabular-nums", heroColor)}>{summary.durationMinutes}m</div>
          <div className="text-[11px] text-muted-foreground/60 uppercase tracking-wider mt-1">
            Deep Focus Time
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Timer className="h-3.5 w-3.5" />} label={summary.completed ? "Completed" : "Skipped"} value={`${summary.durationMinutes}m`} />
          <Stat icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Fidgets" value={`${summary.fidgetCount}`} />
          <Stat icon={<Target className="h-3.5 w-3.5" />} label="First 10m" value={`${summary.fidgetFirst10min}`} />
        </div>

        <p className="text-xs text-muted-foreground/80 leading-relaxed bg-white/[0.03] border border-white/5 rounded-lg p-3">
          {insight}
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 glass-pill border border-white/10 hover:border-primary/30 hover:bg-primary/5 text-white/70 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider"
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button className="flex-1" onClick={dismiss}>
            Done
          </Button>
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        focusMinutes={summary.durationMinutes}
        fidgetCount={summary.fidgetCount}
        completed={summary.completed}
        firstTenFidgets={summary.fidgetFirst10min}
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-tile p-2.5 flex flex-col items-center gap-1">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-semibold text-white tabular-nums">{value}</span>
      <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wide">{label}</span>
    </div>
  );
}
