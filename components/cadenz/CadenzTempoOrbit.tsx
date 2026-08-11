'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Headphones, Orbit } from 'lucide-react';

import {
  CADENZ_BPM_COVERAGE,
  CADENZ_HUB_PATH,
  cadenzBpmPath,
  isCadenzIndexableBpm,
  type CadenzBpm,
} from '@/lib/organic-discovery/cadenz';

const points = [
  { left: 8, top: 54 },
  { left: 13, top: 29 },
  { left: 25, top: 12 },
  { left: 42, top: 5 },
  { left: 59, top: 8 },
  { left: 75, top: 20 },
  { left: 84, top: 40 },
  { left: 83, top: 65 },
  { left: 72, top: 81 },
  { left: 55, top: 88 },
  { left: 36, top: 86 },
] as const;

function hrefFor(bpm: CadenzBpm) {
  return isCadenzIndexableBpm(bpm)
    ? cadenzBpmPath(bpm)
    : CADENZ_HUB_PATH + '?bpm=' + bpm;
}

export function CadenzTempoOrbit({ selectedBpm }: { selectedBpm: CadenzBpm }) {
  const [previewBpm, setPreviewBpm] = useState<CadenzBpm>(selectedBpm);
  const publishable = isCadenzIndexableBpm(previewBpm);

  return (
    <div
      className="relative isolate mx-auto aspect-[1.12/1] w-full max-w-[42rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,238,.13),rgba(3,13,20,.72)_42%,rgba(2,7,12,.96)_74%)] shadow-[0_35px_120px_rgba(0,0,0,.48)]"
      onMouseLeave={() => setPreviewBpm(selectedBpm)}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:36px_36px]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 640 570" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="cadenz-orbit-line" x1="80" y1="60" x2="570" y2="500" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" stopOpacity="0.12" />
            <stop offset="0.48" stopColor="#67E8F9" stopOpacity="0.72" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0.12" />
          </linearGradient>
          <filter id="cadenz-orbit-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <ellipse cx="320" cy="285" rx="252" ry="218" stroke="url(#cadenz-orbit-line)" strokeWidth="2" strokeDasharray="3 11" />
        <ellipse cx="320" cy="285" rx="213" ry="180" stroke="#67E8F9" strokeOpacity="0.12" />
        <ellipse cx="320" cy="285" rx="148" ry="121" stroke="#67E8F9" strokeOpacity="0.08" />
        <path d="M154 319C194 206 277 159 379 180C460 197 500 260 488 340C475 430 376 458 292 423C220 393 183 348 154 319Z" stroke="#67E8F9" strokeOpacity="0.14" />
        <circle cx="320" cy="285" r="92" fill="#22D3EE" fillOpacity="0.055" filter="url(#cadenz-orbit-glow)" />
      </svg>

      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/52 backdrop-blur">
        <Orbit className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
        Interactive tempo orbit
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[9.5rem] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan-200/20 bg-[#04121b]/88 text-center shadow-[0_0_70px_rgba(34,211,238,.12)] backdrop-blur-xl sm:h-[11rem] sm:w-[11rem]">
        <span className="absolute inset-3 rounded-full border border-cyan-200/10" />
        <span className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{previewBpm}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/60">BPM</span>
        <span className={"mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] " + (publishable ? 'text-emerald-200' : 'text-white/40')}>
          {publishable ? <Headphones className="h-3 w-3" aria-hidden="true" /> : null}
          {publishable ? 'Exact track' : 'Map point'}
        </span>
      </div>

      {CADENZ_BPM_COVERAGE.map((bpm, index) => {
        const point = points[index];
        const active = bpm === previewBpm;
        const exact = isCadenzIndexableBpm(bpm);
        return (
          <Link
            key={bpm}
            href={hrefFor(bpm)}
            onMouseEnter={() => setPreviewBpm(bpm)}
            onFocus={() => setPreviewBpm(bpm)}
            aria-label={exact ? `Open verified ${bpm} BPM music` : `Explore ${bpm} BPM in the CADENZ map`}
            data-organic-cta
            data-destination-type={exact ? 'bpm_collection' : 'bpm_hub_state'}
            data-source-position="tempo_orbit"
            className={
              'absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-bold shadow-lg transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 sm:h-12 sm:w-12 ' +
              (active
                ? 'scale-110 border-cyan-100 bg-cyan-100 text-slate-950 shadow-[0_0_35px_rgba(103,232,249,.4)]'
                : exact
                  ? 'border-emerald-200/35 bg-[#08211e]/90 text-emerald-100 hover:scale-110 hover:border-emerald-100/70'
                  : 'border-white/13 bg-[#07131b]/90 text-white/52 hover:scale-105 hover:border-cyan-200/35 hover:text-white')
            }
            style={{ left: point.left + '%', top: point.top + '%' }}
          >
            {active ? <span className="absolute inset-[-7px] -z-10 rounded-full border border-cyan-200/20 motion-safe:animate-ping" /> : null}
            {bpm}
          </Link>
        );
      })}

      <Link
        href={hrefFor(previewBpm)}
        data-organic-cta
        data-destination-type={publishable ? 'bpm_collection' : 'bpm_hub_state'}
        data-source-position="tempo_orbit_center"
        className="absolute bottom-5 left-1/2 z-20 inline-flex min-h-10 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-black/35 px-4 py-2 text-xs font-semibold text-white/75 backdrop-blur transition hover:border-cyan-200/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
      >
        {publishable ? 'Open this track' : 'Explore this tempo'}
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}
