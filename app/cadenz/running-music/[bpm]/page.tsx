import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { CadenzListenPanel } from "@/components/cadenz/CadenzListenPanel";
import { CADENZ_APP_URL } from "@/lib/vgp-ecosystem";
import {
  CADENZ_BPM_COVERAGE,
  CADENZ_HUB_PATH,
  CADENZ_INDEXABLE_BPMS,
  CADENZ_MUSIC_ASSETS,
  cadenzBpmPath,
  isCadenzBpm,
  isCadenzIndexableBpm,
  type CadenzBpm,
} from "@/lib/organic-discovery/cadenz";

const SITE_URL = "https://www.virzyguns.com";
const releaseDateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export const dynamicParams = false;

// The segment is "170-bpm", so the params must carry the suffix too.
export function generateStaticParams() {
  return CADENZ_INDEXABLE_BPMS.map((bpm) => ({ bpm: `${bpm}-bpm` }));
}

function parseBpm(value: string) {
  const match = /^(\d+)-bpm$/.exec(value);
  const bpm = match ? Number(match[1]) : Number.NaN;
  return isCadenzBpm(bpm) && isCadenzIndexableBpm(bpm) ? bpm : null;
}

export async function generateMetadata({ params }: { params: Promise<{ bpm: string }> }): Promise<Metadata> {
  const bpm = parseBpm((await params).bpm);
  if (!bpm) return {};
  const asset = CADENZ_MUSIC_ASSETS[bpm];
  const title = `${bpm} BPM Running Music | CADENZ`;
  const description = `Listen to ${asset.title} by Virzy Guns on Spotify, then browse the shared CADENZ YouTube Music playlist for a focused ${bpm} BPM running cadence session.`;
  return {
    title,
    description,
    alternates: { canonical: cadenzBpmPath(bpm) },
    robots: { index: true, follow: true },
    openGraph: {
      type: "music.song",
      url: cadenzBpmPath(bpm),
      title,
      description,
      images: [{ url: asset.coverImage, width: 300, height: 300, alt: `${asset.releaseTitle} cover artwork` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [asset.coverImage] },
  };
}

function bpmHref(bpm: CadenzBpm) {
  return isCadenzIndexableBpm(bpm) ? cadenzBpmPath(bpm) : `${CADENZ_HUB_PATH}?bpm=${bpm}`;
}

export default async function CadenzBpmPage({ params }: { params: Promise<{ bpm: string }> }) {
  const bpm = parseBpm((await params).bpm);
  if (!bpm) notFound();

  const nonce = (await headers()).get("x-nonce") || undefined;
  const asset = CADENZ_MUSIC_ASSETS[bpm];
  const adjacent = CADENZ_BPM_COVERAGE.filter((candidate) => Math.abs(candidate - bpm) <= 10 && candidate !== bpm);
  const pageUrl = `${SITE_URL}${cadenzBpmPath(bpm)}`;
  const sameAs = [asset.spotifyUrl];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: `${bpm} BPM Running Music | CADENZ`,
        description: asset.sessionSummary,
        isPartOf: { "@id": `${SITE_URL}${CADENZ_HUB_PATH}#collection` },
        mainEntity: { "@id": `${pageUrl}#recording` },
      },
      {
        "@type": "MusicRecording",
        "@id": `${pageUrl}#recording`,
        name: asset.title,
        url: asset.spotifyUrl,
        image: `${SITE_URL}${asset.coverImage}`,
        byArtist: { "@type": "Person", name: asset.artist, url: `${SITE_URL}/about` },
        isrcCode: asset.isrc,
        inAlbum: { "@type": "MusicAlbum", name: asset.releaseTitle },
        datePublished: asset.releaseDate,
        sameAs,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CADENZ", item: CADENZ_APP_URL },
          { "@type": "ListItem", position: 2, name: "Running music by BPM", item: `${SITE_URL}${CADENZ_HUB_PATH}` },
          { "@type": "ListItem", position: 3, name: `${bpm} BPM running music`, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="editorial-shell min-h-screen text-white">
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/55" aria-label="Breadcrumb">
          <a href={CADENZ_APP_URL} className="underline decoration-white/30 underline-offset-4 hover:text-white" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</a>
          <span aria-hidden="true">/</span>
          <Link href={CADENZ_HUB_PATH} className="underline decoration-white/30 underline-offset-4 hover:text-white" data-organic-cta data-destination-type="cadenz_hub" data-source-position="breadcrumb">Running music</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white/80">{bpm} BPM</span>
        </nav>

        <header className="mt-8 grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm text-sky-300">Exact Spotify track and playlist</p>
            <h1 className="mt-4 font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
              {bpm} BPM running music
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">{asset.sessionSummary}</p>
            <p className="mt-5 text-sm text-white/55">{asset.sessionLabel} · Virzy Guns · 1-hour track</p>
          </div>
          <p className="font-display text-[clamp(6rem,16vw,11rem)] font-semibold leading-[0.8] tabular-nums tracking-[-0.06em] text-white/90 lg:col-span-5 lg:text-right" aria-hidden="true">
            {bpm}
          </p>
        </header>

        <div className="mt-16"><CadenzListenPanel asset={asset} /></div>

        <section className="mt-16 grid gap-12 lg:grid-cols-12" aria-labelledby="session-guide-title">
          <div className="lg:col-span-7">
            <h2 id="session-guide-title" className="text-2xl font-semibold sm:text-3xl">How to use it</h2>
            <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {asset.useTips.map((tip, index) => (
                <li key={tip} className="flex gap-4 py-4 text-base leading-7 text-white/75">
                  <span className="w-6 shrink-0 tabular-nums text-white/45">{index + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="text-2xl font-semibold">A tempo, not a prescription</h2>
            <p className="mt-3 text-base leading-7 text-white/70">
              {bpm} BPM describes this track. Your steps per minute may match it, run at half-time, or sit somewhere else. Comfort, terrain and your plan for the day matter more than a target number.
            </p>
          </aside>
        </section>

        <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="catalog-facts-title">
          <h2 id="catalog-facts-title" className="text-2xl font-semibold sm:text-3xl">The track behind this page</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-xs text-white/50">Artist</dt><dd className="mt-1 text-base text-white/85">{asset.artist}</dd></div>
            <div><dt className="text-xs text-white/50">ISRC</dt><dd className="mt-1 font-mono text-base text-white/85">{asset.isrc}</dd></div>
            <div><dt className="text-xs text-white/50">Release date</dt><dd className="mt-1 text-base text-white/85">{releaseDateFormat.format(new Date(`${asset.releaseDate}T00:00:00Z`))}</dd></div>
            <div><dt className="text-xs text-white/50">Available on</dt><dd className="mt-1 text-base text-white/85">Spotify{asset.youtube ? " and YouTube Music" : ""}</dd></div>
          </dl>
        </section>

        <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="adjacent-title">
          <h2 id="adjacent-title" className="text-2xl font-semibold sm:text-3xl">Nearby tempos</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {adjacent.map((candidate) => (
              <Link key={candidate} href={bpmHref(candidate)} data-organic-cta data-destination-type="adjacent_bpm" data-source-position="adjacent_links" className="flex min-h-20 items-end justify-between rounded-[6px] border border-white/10 p-4 transition-colors hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                <span><span className="font-display text-2xl font-semibold tabular-nums">{candidate}</span> <span className="text-xs text-white/55">BPM</span></span>
                <span className={`text-xs font-medium ${isCadenzIndexableBpm(candidate) ? "text-sky-300" : "text-white/50"}`}>{isCadenzIndexableBpm(candidate) ? "Exact track" : "Map point"}</span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-8">
          <Link href={CADENZ_HUB_PATH} className="text-sm font-medium text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white">Back to the 130 to 180 BPM map</Link>
        </footer>
        </div>
      </div>
    </main>
  );
}
