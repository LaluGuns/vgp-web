"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState({ hour: "00", minute: "00", second: "00" });
  useEffect(() => {
    function tick() {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setTime({
        hour: pad(now.getHours()),
        minute: pad(now.getMinutes()),
        second: pad(now.getSeconds()),
      });
    }
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.15)] select-none group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
      <span className="text-[10px] font-mono font-medium text-white/50 tracking-wider tabular-nums flex items-center">
        <span>{time.hour}</span>
        <span className="animate-pulse inline-block duration-1000 mx-0.5 text-white/30">:</span>
        <span>{time.minute}</span>
        <span className="text-white/20 text-[9px] ml-1.5">{time.second}</span>
      </span>
    </div>
  );
}
