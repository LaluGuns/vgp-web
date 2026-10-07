'use client';

import Link from 'next/link';
import { useState } from 'react';

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

/** Tempo map: every BPM point is a link; hover or focus previews it in the center. */
export function CadenzTempoOrbit({ selectedBpm }: { selectedBpm: CadenzBpm }) {
  const [previewBpm, setPreviewBpm] = useState<CadenzBpm>(selectedBpm);
  const publishable = isCadenzIndexableBpm(previewBpm);

  return (
    <div
      className="relative isolate mx-auto aspect-[1.12/1] w-full max-w-[42rem] overflow-hidden rounded-[6px] border border-white/10 bg-[#0a0e12]"
      onMouseLeave={() => setPreviewBpm(selectedBpm)}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 640 570" fill="none" aria-hidden="true">
        <ellipse cx="320" cy="285" rx="252" ry="218" stroke="white" strokeOpacity="0.16" strokeDasharray="3 11" />
        <ellipse cx="320" cy="285" rx="213" ry="180" stroke="white" strokeOpacity="0.07" />
        <ellipse cx="320" cy="285" rx="148" ry="121" stroke="white" strokeOpacity="0.05" />
      </svg>

      <p className="pointer-events-none absolute left-5 top-4 text-xs text-white/50">Tempo map</p>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-[9.5rem] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-[#050607] text-center sm:h-[11rem] sm:w-[11rem]">
        <span className="font-display text-4xl font-semibold tabular-nums tracking-[-0.04em] text-white sm:text-5xl">{previewBpm}</span>
        <span className="mt-1 text-xs text-white/55">BPM</span>
        <span className={'mt-3 text-xs font-medium ' + (publishable ? 'text-sky-300' : 'text-white/50')}>
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
            aria-label={exact ? `Open the ${bpm} BPM track` : `Show ${bpm} BPM on the map`}
            data-organic-cta
            data-destination-type={exact ? 'bpm_collection' : 'bpm_hub_state'}
            data-source-position="tempo_orbit"
            className={
              'absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-12 sm:w-12 ' +
              (active
                ? 'border-white bg-white text-[#050607]'
                : exact
                  ? 'border-sky-300/50 bg-[#050607] text-white hover:border-sky-300'
                  : 'border-white/15 bg-[#050607] text-white/55 hover:border-white/40 hover:text-white')
            }
            style={{ left: point.left + '%', top: point.top + '%' }}
          >
            {bpm}
          </Link>
        );
      })}

      <Link
        href={hrefFor(previewBpm)}
        data-organic-cta
        data-destination-type={publishable ? 'bpm_collection' : 'bpm_hub_state'}
        data-source-position="tempo_orbit_center"
        className="absolute bottom-4 left-1/2 z-20 inline-flex min-h-11 -translate-x-1/2 items-center whitespace-nowrap px-3 text-sm font-medium text-white underline decoration-white/30 underline-offset-4 hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {publishable ? `Open the ${previewBpm} BPM track` : `Show ${previewBpm} BPM`}
      </Link>
    </div>
  );
}
