import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import {
  CADENZ_BPM_COVERAGE,
  CADENZ_BPM_EVIDENCE,
  CADENZ_BPM_TITLES,
  CADENZ_INDEXABLE_BPMS,
  CADENZ_HUB_PATH,
  cadenzBpmPath,
  isCadenzBpm,
  isCadenzIndexableBpm,
  type CadenzBpm,
} from "@/lib/organic-discovery/cadenz";

export const dynamicParams = false;

export function generateStaticParams() {
  return CADENZ_INDEXABLE_BPMS.map((bpm) => ({ bpm: String(bpm) }));
}

function parseBpm(value: string): CadenzBpm | null {
  const match = /^([0-9]+)-bpm$/.exec(value);
  const bpm = match ? Number(match[1]) : Number.NaN;
  return Number.isInteger(bpm) && isCadenzBpm(bpm) && isCadenzIndexableBpm(bpm) ? bpm : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bpm: string }>;
}): Promise<Metadata> {
  const { bpm: rawBpm } = await params;
  const bpm = parseBpm(rawBpm);
  if (!bpm) return {};
  return {
    title: bpm + " BPM Running Music",
    description:
      "Explore verified Virzy Guns running cadence titles around " +
      bpm +
      " BPM and see how the CADENZ tempo architecture supports the full 130–180 BPM range.",
    alternates: { canonical: cadenzBpmPath(bpm) },
  };
}

export default async function CadenzBpmPage({
  params,
}: {
  params: Promise<{ bpm: string }>;
}) {
  const { bpm: rawBpm } = await params;
  const bpm = parseBpm(rawBpm);
  if (!bpm) notFound();

  const nonce = (await headers()).get("x-nonce") || undefined;
  const titles = CADENZ_BPM_TITLES[bpm];
  const evidence = CADENZ_BPM_EVIDENCE[bpm];
  const adjacent = CADENZ_BPM_COVERAGE.filter((candidate) => Math.abs(candidate - bpm) === 5);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://www.virzyguns.com" + cadenzBpmPath(bpm) + "#collection",
    url: "https://www.virzyguns.com" + cadenzBpmPath(bpm),
    name: bpm + " BPM Running Music",
    description: evidence.note,
    isPartOf: {
      "@id": "https://www.virzyguns.com" + CADENZ_HUB_PATH + "#collection",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: titles.map((title, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: title,
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
      <div className="mx-auto max-w-5xl">
        <nav className="mb-10 text-sm text-white/55" aria-label="Breadcrumb">
          <Link href="/cadenz" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</Link>
          <span className="mx-2">/</span>
          <Link href={CADENZ_HUB_PATH} data-organic-cta data-destination-type="cadenz_hub" data-source-position="breadcrumb">Running music by BPM</Link>
          <span className="mx-2">/</span>
          <span>{bpm} BPM</span>
        </nav>

        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/75">Virzy Guns → CADENZ</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {bpm} BPM running music
          </h1>
          <p className="mt-6 text-base leading-8 text-white/70 sm:text-lg">
            A focused collection for listeners exploring a {bpm} BPM running or cadence target. The page uses BPM as the primary label and treats SPM as a secondary term only when the underlying title explicitly supports it.
          </p>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">Verified catalog titles</p>
            <h2 className="mt-3 text-2xl font-semibold">{bpm} BPM / SPM references</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">
              The titles below are source-backed catalog references. They are not presented as owned-channel YouTube videos or direct DSP destinations until the identity crosswalk and URL review are complete.
            </p>
            <ul className="mt-6 space-y-3">
              {titles.map((title) => (
                <li key={title} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                  {title}
                </li>
              ))}
            </ul>
          </article>

          <aside className="rounded-2xl border border-sky-200/20 bg-sky-200/[0.05] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">Evidence tier {evidence.tier}</p>
            <h2 className="mt-3 text-2xl font-semibold">Why this collection exists</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">{evidence.note}</p>
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

        <section className="mt-12 rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8" aria-labelledby="adjacent-title">
          <h2 id="adjacent-title" className="text-2xl font-semibold">Explore adjacent tempo</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {adjacent.map((candidate) => (
              <Link
                key={candidate}
                href={isCadenzIndexableBpm(candidate) ? cadenzBpmPath(candidate) : CADENZ_HUB_PATH + "?bpm=" + candidate}
                data-organic-cta
                data-destination-type="adjacent_bpm"
                data-source-position="adjacent_links"
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/75 hover:border-sky-200/40 hover:text-white"
              >
                {candidate} BPM
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 text-sm text-white/55">
          <Link href={CADENZ_HUB_PATH} className="hover:text-white">Back to the complete 130–180 BPM map</Link>
        </footer>
      </div>
    </main>
  );
}
