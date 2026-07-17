"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The live showroom demo (HeroMachines) drags in the real timer components +
// stores — far too much JS to block first paint on. `ssr: false` requires a
// client wrapper, and we additionally wait for browser idle before mounting so
// hydrating the hero copy never competes with the demo bundle.
const HeroMachines = dynamic(
  () =>
    import("@/components/landing/hero-machines").then((m) => m.HeroMachines),
  { ssr: false }
);

// Mirrors the "glass" showroom floor background from hero-machines.tsx so the
// placeholder frame is pixel-stable against the mounted unit.
const GLASS_FLOOR_BG =
  "radial-gradient(120% 100% at 50% 0%, hsl(250 45% 12%) 0%, hsl(258 60% 5%) 55%, hsl(260 55% 3%) 100%)";

export function HeroMachinesIsland() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const mount = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(mount, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(mount, 200);
    }
    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, []);

  if (ready) return <HeroMachines />;

  // Static frame with the exact geometry of the live unit (switcher pill row
  // + h-[480px] floor) so swapping in the real machines causes zero CLS.
  return (
    <div className="w-full max-w-[640px] mx-auto space-y-4" aria-hidden>
      {/* Switcher row placeholder — same height as the real pill row */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {["Dynamic Glass", "Analog Studio", "Instrument Panel", "Editorial"].map(
          (name) => (
            <span
              key={name}
              className="px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.15em] border border-transparent text-transparent select-none"
            >
              {name}
            </span>
          )
        )}
      </div>
      {/* Showroom floor placeholder — identical frame and height */}
      <div
        className="rounded-[22px] p-5 sm:p-7 flex items-center justify-center h-[480px] border border-white/[0.07] shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
        style={{ background: GLASS_FLOOR_BG }}
      />
    </div>
  );
}
