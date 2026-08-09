import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";

import {
  CADENZ_BPM_COVERAGE,
  CADENZ_BPM_EVIDENCE,
  CADENZ_BPM_TITLES,
  CADENZ_HUB_PATH,
  CADENZ_INDEXABLE_BPMS,
  cadenzBpmPath,
  isCadenzBpm,
} from "@/lib/organic-discovery/cadenz";

export const metadata: Metadata = {
  title: "Running Music by BPM",
  description:
    "Explore Virzy Guns cadence music across the complete 130–180 BPM running range, with evidence-led collections for CADENZ.",
  alternates: { canonical: CADENZ_HUB_PATH },
};

function bpmHref(bpm: number) {
  return CADENZ_INDEXABLE_BPMS.includes(bpm as (typeof CADENZ_INDEXABLE_BPMS)[number])
    ? cadenzBpmPath(bpm as (typeof CADENZ_INDEXABLE_BPMS)[number])
    : CADENZ_HUB_PATH + "?bpm=" + bpm;
}

export default async function CadenzRunningMusicHub({
  searchParams,
}: {
  searchParams: Promise<{ bpm?: string }>;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const params = await searchParams;
  const parsedBpm = Number(params.bpm);
  const selectedBpm = isCadenzBpm(parsedBpm) ? parsedBpm : 180;
  const selectedTitles = CADENZ_BPM_TITLES[selectedBpm];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.virzyguns.com" + CADENZ_HUB_PATH + "#collection",
    url: "https://www.virzyguns.com" + CADENZ_HUB_PATH,
    name: "Running Music by BPM",
    description: "Evidence-led running cadence music coverage from 130 to 180 BPM.",
    isPartOf: { "@id": "https://www.virzyguns.com/#website" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: CADENZ_BPM_COVERAGE.map((bpm, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: bpm + " BPM running music",
        url: "https://www.virzyguns.com" + bpmHref(bpm),
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#02070c] px-4 py-16 text-white sm:px-6 lg:px-10">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl">
        <nav className="mb-10 text-sm text-white/55" aria-label="Breadcrumb">
          <Link href="/cadenz" className="hover:text-white" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</Link>
          <span className="mx-2">/</span>
          <span>Running music by BPM</span>
        </nav>

        <header className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/75">
            Virzy Guns → CADENZ
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Running music by BPM, from 130 to 180.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
            Choose a tempo that matches the session you are planning. CADENZ keeps the complete 5 BPM architecture visible while standalone collections are promoted only when the catalog and evidence support a useful destination.
          </p>
        </header>

        <section className="mt-12" aria-labelledby="bpm-grid-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">Tempo map</p>
              <h2 id="bpm-grid-title" className="mt-2 text-2xl font-semibold">Select a target tempo</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/55">
              BPM is the primary search language. SPM is shown only where the title or use case explicitly supports a one-beat-per-step interpretation.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CADENZ_BPM_COVERAGE.map((bpm) => {
              const evidence = CADENZ_BPM_EVIDENCE[bpm];
              const active = bpm === selectedBpm;
              return (
                <Link
                  key={bpm}
                  href={bpmHref(bpm)}
                  data-organic-cta
                  data-destination-type="bpm_collection"
                  data-source-position="bpm_selector"
                  className={
                    "rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 " +
                    (active
                      ? "border-sky-200/55 bg-sky-200/10"
                      : "border-white/10 bg-white/[0.035] hover:border-sky-200/30")
                  }
                >
                  <span className="block text-2xl font-semibold">{bpm}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-white/50">BPM</span>
                  <span className="mt-3 block text-[11px] font-medium uppercase tracking-[0.14em] text-sky-200/70">
                    {evidence.indexable ? "Collection" : "Hub coverage"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">
              Catalog title evidence
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{selectedBpm} BPM running cadence</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              These titles are copied from the supplied DistroKid evidence and are shown as catalog references. They are not automatically treated as owned-channel videos, DSP links, or playable assets.
            </p>
            <ul className="mt-6 space-y-3">
              {selectedTitles.map((title) => (
                <li key={title} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                  {title}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-2xl border border-sky-200/20 bg-sky-200/[0.05] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">Next step</p>
            <h2 className="mt-3 text-2xl font-semibold">Keep the session moving</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              CADENZ is coming soon. Join the waitlist for cadence-first listening and product updates.
            </p>
            <Link
              href="/cadenz"
              data-organic-cta
              data-destination-type="cadenz_waitlist"
              data-source-position="primary_cta"
              className="mt-6 inline-flex rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Join the CADENZ waitlist
            </Link>
          </aside>
        </section>

        <footer className="mt-12 flex flex-wrap gap-3 text-sm text-white/55">
          <Link href="/cadenz" className="hover:text-white">About CADENZ</Link>
          {CADENZ_INDEXABLE_BPMS.map((bpm) => (
            <Link key={bpm} href={cadenzBpmPath(bpm)} className="hover:text-white">
              {bpm} BPM collection
            </Link>
          ))}
        </footer>
      </div>
    </main>
  );
}
