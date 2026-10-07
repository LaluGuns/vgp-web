import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { CadenzListenPanel } from "@/components/cadenz/CadenzListenPanel";
import { CadenzTempoOrbit } from "@/components/cadenz/CadenzTempoOrbit";
import { CADENZ_APP_URL, CADENZ_PLAY_URL } from "@/lib/vgp-ecosystem";
import {
  CADENZ_BPM_COVERAGE,
  CADENZ_BPM_TITLES,
  CADENZ_HUB_PATH,
  CADENZ_INDEXABLE_BPMS,
  CADENZ_MUSIC_ASSETS,
  cadenzBpmPath,
  isCadenzBpm,
  isCadenzIndexableBpm,
} from "@/lib/organic-discovery/cadenz";

const SITE_URL = "https://www.virzyguns.com";

export const metadata: Metadata = {
  title: "Running Music by BPM | CADENZ",
  description: "Choose verified Virzy Guns running music from 150 to 180 BPM, open the shared CADENZ playlist on YouTube Music, and listen on Spotify.",
  alternates: { canonical: CADENZ_HUB_PATH },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: CADENZ_HUB_PATH,
    title: "Running Music by BPM | CADENZ",
    description: "An interactive 130–180 BPM tempo map with verified Virzy Guns running tracks and a shared YouTube Music playlist.",
    images: [{ url: "/images/cadenz-running-cadence-cover.jpg", width: 300, height: 300, alt: "Cyberpunk running cadence music by Virzy Guns" }],
  },
  twitter: { card: "summary_large_image", title: "Running Music by BPM | CADENZ", description: "Find your tempo, listen on Spotify, or browse the shared YouTube Music playlist.", images: ["/images/cadenz-running-cadence-cover.jpg"] },
};

function bpmHref(bpm: number) {
  return isCadenzIndexableBpm(bpm) ? cadenzBpmPath(bpm) : `${CADENZ_HUB_PATH}?bpm=${bpm}`;
}

export default async function CadenzRunningMusicHub({ searchParams }: { searchParams: Promise<{ bpm?: string }> }) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const parsedBpm = Number((await searchParams).bpm);
  const selectedBpm = isCadenzBpm(parsedBpm) ? parsedBpm : 170;
  const selectedAsset = isCadenzIndexableBpm(selectedBpm) ? CADENZ_MUSIC_ASSETS[selectedBpm] : null;
  const exactBpms = [...CADENZ_INDEXABLE_BPMS].sort((a, b) => a - b);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${CADENZ_HUB_PATH}#collection`,
        url: `${SITE_URL}${CADENZ_HUB_PATH}`,
        name: "Running Music by BPM | CADENZ",
        description: "Interactive running music collections with verified Virzy Guns Spotify tracks from 150 to 180 BPM.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: exactBpms.length,
          itemListElement: exactBpms.map((bpm, index) => ({ "@type": "ListItem", position: index + 1, name: `${bpm} BPM running music`, url: `${SITE_URL}${cadenzBpmPath(bpm)}` })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "CADENZ", item: CADENZ_APP_URL },
          { "@type": "ListItem", position: 2, name: "Running music by BPM", item: `${SITE_URL}${CADENZ_HUB_PATH}` },
        ],
      },
    ],
  };

  return (
    <main className="editorial-shell min-h-screen text-white">
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-7xl">
        <nav className="flex items-center gap-2 text-sm text-white/55" aria-label="Breadcrumb">
          <a href={CADENZ_APP_URL} className="underline decoration-white/30 underline-offset-4 hover:text-white" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</a>
          <span aria-hidden="true">/</span>
          <span className="text-white/80">Running music</span>
        </nav>

        <header className="mt-8 grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
              Running music by BPM.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              Pick a tempo, open the exact Spotify track, or play the whole CADENZ album on YouTube Music. The map covers 11
              tempos from 130 to 180 BPM, and 6 of them link to a verified Virzy Guns track.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href={cadenzBpmPath(170)} data-organic-cta data-destination-type="bpm_collection" data-source-position="hub_hero_primary" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]">
                Start at 170 BPM
              </Link>
              <a href={CADENZ_PLAY_URL} target="_blank" rel="noopener noreferrer" data-organic-cta data-destination-type="google_play" data-source-position="hub_hero_secondary" className="text-sm font-medium text-white underline decoration-white/30 underline-offset-[6px] hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                Get CADENZ on Google Play
              </a>
            </div>
            <p className="mt-8 max-w-lg text-sm leading-6 text-white/55">
              BPM is the tempo of the music. SPM is your steps per minute. They can line up one beat per step, but your natural stride comes first.
            </p>
          </div>
          <div className="lg:col-span-6">
            <CadenzTempoOrbit selectedBpm={selectedBpm} />
          </div>
        </header>

        <section className="mt-20 border-t border-white/10 pt-12" aria-labelledby="tempo-deck-title">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="tempo-deck-title" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-5">Pick a tempo</h2>
            <p className="max-w-xl text-base leading-7 text-white/65 lg:col-span-7">
              Tempos marked exact track open a page with the verified song. The others stay on this map until a matching release is verified.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {CADENZ_BPM_COVERAGE.map((bpm) => {
              const exact = isCadenzIndexableBpm(bpm);
              const active = bpm === selectedBpm;
              return (
                <Link key={bpm} href={bpmHref(bpm)} data-organic-cta data-destination-type={exact ? "bpm_collection" : "bpm_hub_state"} data-source-position="tempo_deck" aria-current={active ? "page" : undefined} className={`flex min-h-24 flex-col justify-between rounded-[6px] border p-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${active ? "border-white/70 bg-white/[0.04]" : "border-white/10 hover:border-white/30"}`}>
                  <span><span className="font-display text-3xl font-semibold tabular-nums tracking-[-0.03em]">{bpm}</span> <span className="text-xs text-white/55">BPM</span></span>
                  <span className={`text-xs font-medium ${exact ? "text-sky-300" : "text-white/50"}`}>{exact ? "Exact track" : "Map point"}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-20">
          {selectedAsset ? <CadenzListenPanel asset={selectedAsset} /> : (
            <section className="grid gap-10 border-y border-white/10 py-12 lg:grid-cols-12" aria-labelledby="tempo-preview-title">
              <div className="lg:col-span-4">
                <p className="font-display text-7xl font-semibold tabular-nums tracking-[-0.05em]">{selectedBpm}</p>
                <p className="mt-1 text-sm text-white/55">BPM, map point</p>
              </div>
              <div className="lg:col-span-8">
                <h2 id="tempo-preview-title" className="text-2xl font-semibold sm:text-3xl">Tracks at {selectedBpm} BPM in the catalog</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                  These tracks exist at this tempo. A direct listening link appears here once the exact release is verified, so no link is guessed.
                </p>
                <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
                  {CADENZ_BPM_TITLES[selectedBpm].map((title) => <li key={title} className="py-3 text-base text-white/80">{title}</li>)}
                </ul>
              </div>
            </section>
          )}
        </div>

        <section className="mt-20 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-2" aria-labelledby="bpm-spm-title">
          <div>
            <h2 id="bpm-spm-title" className="text-2xl font-semibold">BPM sets the pulse</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/70">Beats per minute is how fast the music moves. Pick a track because the pulse feels clear for today, not because one number suits everyone.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">SPM is your steps</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/70">Steps per minute is personal. It changes with pace, terrain, fatigue and how you move. Use the music as a cue and never force a stride that feels wrong.</p>
          </div>
        </section>

        <footer className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:items-center">
          <a href={CADENZ_APP_URL} className="underline decoration-white/30 underline-offset-4 hover:text-white">About the CADENZ app</a>
          <div className="flex flex-wrap gap-x-5 gap-y-2">{exactBpms.map((bpm) => <Link key={bpm} href={cadenzBpmPath(bpm)} className="hover:text-white">{bpm} BPM</Link>)}</div>
        </footer>
        </div>
      </div>
    </main>
  );
}
