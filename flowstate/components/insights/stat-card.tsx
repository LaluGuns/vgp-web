"use client";

// (Currently unreferenced — preserved verbatim from the insights page during
// the decomposition.)
export function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-colors">

      <div className="absolute -right-4 -top-4 text-white/[0.01] group-hover:text-white/[0.03] transition-colors transform scale-150 pointer-events-none">
        {icon}
      </div>
      <div className="text-primary z-10">{icon}</div>
      <div className="flex flex-col z-10">
        <span className="text-2xl font-extrabold tracking-tight text-white/90 leading-none tabular-nums">{value}</span>
        <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/40 mt-2 leading-none">{label}</span>
        <span className="text-[10px] text-white/50 mt-2 leading-relaxed">{subtext}</span>
      </div>
    </div>
  );
}
