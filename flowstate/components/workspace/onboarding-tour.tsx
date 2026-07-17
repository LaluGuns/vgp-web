"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { AtmosphereTab } from "./atmosphere-panel";
import type { MobileTab } from "./mobile-nav";

export const TOUR_STEPS = [
  {
    title: "Welcome to Flowstate",
    desc: "A timer, music produced in-house by Virzy Guns Production, an ambient mixer, and a task list. That's the whole setup — takes about a minute to walk through.",
    target: "workspace"
  },
  {
    title: "1. Pomodoro Timer",
    desc: "Center of the screen. Click Play or hit SPACEBAR to start a 25-minute focus block. The gear sets your own work and break lengths.",
    target: "timer"
  },
  {
    title: "2. Soundtracks",
    desc: "Pick a track on the 'Music' tab — lofi, synthwave, ambient, all produced in-house. Tip: [ and ] swap tracks from the keyboard.",
    target: "music"
  },
  {
    title: "3. Ambient Mixer",
    desc: "The 'Ambient' tab, next to 'Music'. Layer rain, café, campfire, and white noise — each slider sets its own level.",
    target: "ambient"
  },
  {
    title: "4. Task Checklist",
    desc: "Left sidebar. Add tasks, estimate pomodoros, check them off as you go. One task per block keeps things clean. Press T to open the editor.",
    target: "tasks"
  },
  {
    title: "5. Focus Insights",
    desc: "Click 'Stats' in the sidebar or the mobile bottom bar. Sessions, streaks, and a heatmap of when you actually focus.",
    target: "stats"
  }
];

// Interactive Tour Guide Overlay/Tooltip — owns the tooltip anchoring math and
// auto-switching of tabs while the tour walks through targets.
export function OnboardingTour({
  tourStep,
  setTourStep,
  activeTab,
  setActiveTab,
  mobileTab,
  setMobileTab,
}: {
  tourStep: number | null;
  setTourStep: (step: number | null) => void;
  activeTab: AtmosphereTab;
  setActiveTab: (tab: AtmosphereTab) => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
}) {
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right" | "center" | "bottom-sheet">("center");

  // Update layout position of tour guide tooltips
  useEffect(() => {
    if (tourStep === null) return;

    if (tourStep === 0) {
      setPlacement("center");
      setTooltipStyle({});
      return;
    }

    const currentStep = TOUR_STEPS[tourStep];
    if (!currentStep) return;

    // Automatically transition tab / mobile state depending on active tour target
    if (tourStep === 1) {
      setMobileTab("focus");
    } else if (tourStep === 2) {
      setMobileTab("atmosphere");
      setActiveTab("music");
    } else if (tourStep === 3) {
      setMobileTab("atmosphere");
      setActiveTab("ambient");
    } else if (tourStep === 4) {
      setMobileTab("tasks");
    }

    const updatePosition = () => {
      // On phones the floating tooltip can run off the bottom of the screen and
      // clip the Next button. Pin it as a bottom sheet instead (the target still
      // gets its highlight ring) so the controls are always visible.
      if (window.innerWidth < 768) {
        setPlacement("bottom-sheet");
        setTooltipStyle({
          position: "fixed",
          left: "50%",
          bottom: "16px",
          transform: "translateX(-50%)",
          zIndex: 9999,
        });
        return;
      }

      let el: HTMLElement | null = null;
      if (currentStep.target === "timer") {
        el = document.getElementById("tour-timer");
      } else if (currentStep.target === "music") {
        el = document.getElementById("tour-music-tab");
      } else if (currentStep.target === "ambient") {
        el = document.getElementById("tour-ambient-tab");
      } else if (currentStep.target === "tasks") {
        el = document.getElementById("tour-tasks");
      } else if (currentStep.target === "stats") {
        el = window.innerWidth < 768
          ? document.getElementById("tour-stats-bottom")
          : document.getElementById("tour-stats-sidebar");
      }

      if (!el) {
        setPlacement("center");
        setTooltipStyle({});
        return;
      }

      const rect = el.getBoundingClientRect();
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      // Decide placement
      let pref: "top" | "bottom" | "left" | "right" = "bottom";
      if (currentStep.target === "timer") {
        pref = "top";
      } else if (currentStep.target === "music" || currentStep.target === "ambient") {
        pref = winWidth < 768 ? "top" : "left";
      } else if (currentStep.target === "tasks") {
        pref = winWidth < 768 ? "bottom" : "right";
      } else if (currentStep.target === "stats") {
        pref = winWidth < 768 ? "top" : "right";
      }

      const gap = 14;
      let top = 0;
      let left = 0;
      const tooltipW = 340;
      const tooltipH = 180;

      if (pref === "bottom") {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        left = Math.max(tooltipW / 2 + 16, Math.min(winWidth - tooltipW / 2 - 16, left));
      } else if (pref === "top") {
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        left = Math.max(tooltipW / 2 + 16, Math.min(winWidth - tooltipW / 2 - 16, left));
      } else if (pref === "left") {
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        top = Math.max(tooltipH / 2 + 16, Math.min(winHeight - tooltipH / 2 - 16, top));
      } else if (pref === "right") {
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        top = Math.max(tooltipH / 2 + 16, Math.min(winHeight - tooltipH / 2 - 16, top));
      }

      setPlacement(pref);
      setTooltipStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform:
          pref === "bottom" ? "translate(-50%, 0)" :
          pref === "top" ? "translate(-50%, -100%)" :
          pref === "left" ? "translate(-100%, -50%)" :
          "translate(0, -50%)",
        zIndex: 9999,
      });
    };

    const handle = setTimeout(updatePosition, 200);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      clearTimeout(handle);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, mobileTab, activeTab]);

  if (tourStep === null) return null;

  return (
    <>
      {/* Backdrop only for Step 0 (Welcome) */}
      {tourStep === 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-[24px] border border-[#00e5ff]/20 max-w-md w-full bg-[#0b1326]/90 shadow-[0_0_50px_rgba(0,229,255,0.15)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-[#00e5ff] tracking-widest uppercase bg-[#00e5ff]/10 px-2.5 py-1 rounded-md font-bold">
                GUIDED TOUR • STEP 1 OF {TOUR_STEPS.length}
              </span>
              <button
                onClick={() => {
                  setTourStep(null);
                  localStorage.setItem("flowstate_tour_completed", "true");
                }}
                className="text-white/45 hover:text-white text-xs font-mono font-bold tracking-wider"
              >
                SKIP
              </button>
            </div>

            <div className="space-y-2 text-left">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {TOUR_STEPS[tourStep].title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {TOUR_STEPS[tourStep].desc}
              </p>
            </div>

            <div className="flex justify-end items-center pt-2">
              <button
                onClick={() => setTourStep(1)}
                className="px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                Start Tour →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltips for Step 1 to 5 */}
      {tourStep > 0 && (
        <div
          style={tooltipStyle}
          className="w-[calc(100vw-32px)] sm:w-[340px] p-5 rounded-2xl border border-[#00e5ff]/35 bg-[#0b1326]/95 shadow-[0_12px_40px_rgba(0,229,255,0.22)] space-y-4 text-left backdrop-blur-md transition-all duration-300 ease-out animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Arrow pointer — directional placements only; hidden for the
              mobile bottom sheet, which isn't anchored to the target. */}
          {placement !== "bottom-sheet" && (
            <div
              className={cn(
                "absolute w-3 h-3 bg-[#0b1326] border-[#00e5ff]/35 rotate-45 pointer-events-none",
                placement === "top" && "bottom-[-7px] left-1/2 -translate-x-1/2 border-r border-b",
                placement === "bottom" && "top-[-7px] left-1/2 -translate-x-1/2 border-l border-t",
                placement === "left" && "right-[-7px] top-1/2 -translate-y-1/2 border-r border-t",
                placement === "right" && "left-[-7px] top-1/2 -translate-y-1/2 border-l border-b"
              )}
            />
          )}

          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono text-[#00e5ff] tracking-widest uppercase bg-[#00e5ff]/10 px-2.5 py-1 rounded-md font-bold">
              STEP {tourStep + 1} OF {TOUR_STEPS.length}
            </span>
            <button
              onClick={() => {
                setTourStep(null);
                localStorage.setItem("flowstate_tour_completed", "true");
              }}
              className="text-white/45 hover:text-white text-xs font-mono font-bold tracking-wider"
            >
              SKIP
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white tracking-wide">
              {TOUR_STEPS[tourStep].title}
            </h3>
            <p className="text-[11px] text-white/70 leading-relaxed">
              {TOUR_STEPS[tourStep].desc}
            </p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setTourStep(tourStep - 1)}
              className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={() => {
                if (tourStep < TOUR_STEPS.length - 1) {
                  setTourStep(tourStep + 1);
                } else {
                  setTourStep(null);
                  localStorage.setItem("flowstate_tour_completed", "true");
                }
              }}
              className="px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)]"
            >
              {tourStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
