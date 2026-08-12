import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, AudioLines, CircleGauge, Headphones, Sparkles } from "lucide-react";

import { CadenzListenPanel } from "@/components/cadenz/CadenzListenPanel";
import { CadenzTempoOrbit } from "@/components/cadenz/CadenzTempoOrbit";
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
          { "@type": "ListItem", position: 1, name: "CADENZ", item: `${SITE_URL}/cadenz` },
          { "@type": "ListItem", position: 2, name: "Running music by BPM", item: `${SITE_URL}${CADENZ_HUB_PATH}` },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020509] text-white selection:bg-[#b8ff48] selection:text-[#071006]">
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-400/[0.08] blur-[120px]" />
        <div className="absolute -right-40 top-[30rem] h-[34rem] w-[34rem] rounded-full bg-violet-500/[0.09] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(103,232,249,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.12)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto max-w-[90rem] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45" aria-label="Breadcrumb">
          <Link href="/cadenz" className="transition hover:text-cyan-100" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</Link>
          <span aria-hidden="true">/</span><span className="text-white/75">Running music</span>
        </nav>

        <header className="mt-10 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8ff48]/25 bg-[#b8ff48]/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d7ff9d]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Verified rhythm collection
            </div>
            <h1 className="mt-6 max-w-3xl text-[clamp(3.25rem,7.4vw,7.25rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
              Running music <span className="mt-2 block bg-[linear-gradient(90deg,#67e8f9,#b8ff48_55%,#a78bfa)] bg-clip-text text-transparent">by BPM.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-white/62 sm:text-lg">Pick a pulse, open the exact Spotify track, or browse the shared CADENZ playlist on YouTube Music. The map covers 130–180 BPM and six tempo pages connect to exact Virzy Guns tracks.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={cadenzBpmPath(170)} data-organic-cta data-destination-type="bpm_collection" data-source-position="hub_hero_primary" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#b8ff48] px-6 py-3.5 text-sm font-extrabold text-[#081006] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Start at 170 BPM <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/cadenz" data-organic-cta data-destination-type="cadenz" data-source-position="hub_hero_secondary" className="inline-flex min-h-13 items-center justify-center rounded-xl border border-white/14 bg-white/[0.045] px-6 py-3.5 text-sm font-semibold transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Discover the CADENZ app</Link>
            </div>
            <p className="mt-5 max-w-lg text-xs leading-6 text-white/40">BPM is the musical tempo. SPM is your steps per minute. They can line up one beat per step, but your natural stride and comfort come first.</p>
          </div>
          <CadenzTempoOrbit selectedBpm={selectedBpm} />
        </header>

        <section className="mt-16 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] sm:grid-cols-4" aria-label="Collection summary">
          <div className="p-5 sm:p-6"><CircleGauge className="h-4 w-4 text-cyan-200/75" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">11</p><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">tempo points</p></div>
          <div className="border-l border-white/10 p-5 sm:p-6"><Headphones className="h-4 w-4 text-cyan-200/75" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">6</p><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">exact Spotify tracks</p></div>
          <div className="border-l border-white/10 p-5 sm:p-6"><AudioLines className="h-4 w-4 text-cyan-200/75" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">1</p><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">YouTube Music playlist</p></div>
          <div className="border-l border-white/10 p-5 sm:p-6"><Sparkles className="h-4 w-4 text-cyan-200/75" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">130–180</p><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">BPM range</p></div>
        </section>

        <section className="mt-20" aria-labelledby="tempo-deck-title">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8ff48]/75">Tempo deck</p><h2 id="tempo-deck-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Choose how today moves.</h2></div>
            <p className="max-w-md text-sm leading-7 text-white/50">Green points open a verified track page. The remaining tempos stay in this map until an exact destination is ready.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {CADENZ_BPM_COVERAGE.map((bpm) => {
              const exact = isCadenzIndexableBpm(bpm);
              const active = bpm === selectedBpm;
              return (
                <Link key={bpm} href={bpmHref(bpm)} data-organic-cta data-destination-type={exact ? "bpm_collection" : "bpm_hub_state"} data-source-position="tempo_deck" aria-current={active ? "page" : undefined} className={`group relative min-h-32 overflow-hidden rounded-2xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 ${active ? "border-cyan-100/60 bg-cyan-100/[0.11]" : exact ? "border-[#b8ff48]/20 bg-[#b8ff48]/[0.035] hover:-translate-y-1 hover:border-[#b8ff48]/50" : "border-white/10 bg-white/[0.025] hover:-translate-y-1 hover:border-cyan-200/25"}`}>
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-current opacity-55" /><span className="block text-3xl font-semibold tracking-[-0.04em]">{bpm}</span><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">BPM</span><span className={`mt-5 block text-[10px] font-semibold uppercase tracking-[0.12em] ${exact ? "text-[#cfff86]" : "text-white/35"}`}>{exact ? "Exact track" : "Explore tempo"}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-20">
          {selectedAsset ? <CadenzListenPanel asset={selectedAsset} /> : (
            <section className="grid gap-7 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="tempo-preview-title">
              <div className="flex min-h-56 flex-col justify-between rounded-2xl border border-cyan-200/15 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,.2),rgba(4,16,25,.92)_68%)] p-6"><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/55">Map point</span><div><p className="text-7xl font-semibold tracking-[-0.07em]">{selectedBpm}</p><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/55">BPM</p></div></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Catalog language</p><h2 id="tempo-preview-title" className="mt-3 text-3xl font-semibold">A useful tempo, without a fake destination.</h2><p className="mt-4 text-sm leading-7 text-white/58">These source-backed titles explain how {selectedBpm} BPM can be framed. CADENZ will not invent a Spotify or YouTube URL before an exact asset is verified.</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{CADENZ_BPM_TITLES[selectedBpm].map((title) => <li key={title} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/72">{title}</li>)}</ul></div>
            </section>
          )}
        </div>

        <section className="mt-20 grid gap-4 lg:grid-cols-2" aria-labelledby="bpm-spm-title">
          <article className="rounded-[1.5rem] border border-cyan-200/15 bg-cyan-200/[0.045] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/60">The music</p><h2 id="bpm-spm-title" className="mt-3 text-2xl font-semibold">BPM sets the pulse.</h2><p className="mt-4 text-sm leading-7 text-white/58">Beats per minute describes how fast the music moves. Choose a track because the pulse feels clear for your session, not because one number is universal.</p></article>
          <article className="rounded-[1.5rem] border border-violet-300/15 bg-violet-300/[0.045] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/65">Your movement</p><h2 className="mt-3 text-2xl font-semibold">SPM tracks the steps.</h2><p className="mt-4 text-sm leading-7 text-white/58">Steps per minute is personal and changes with pace, terrain, fatigue, and body mechanics. Use music as a cue; never force a stride that feels wrong.</p></article>
        </section>

        <footer className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 pt-8 text-sm text-white/45 sm:flex-row sm:items-center">
          <Link href="/cadenz" className="transition hover:text-cyan-100">About the CADENZ app</Link><div className="flex flex-wrap gap-x-4 gap-y-2">{exactBpms.map((bpm) => <Link key={bpm} href={cadenzBpmPath(bpm)} className="transition hover:text-[#b8ff48]">{bpm} BPM</Link>)}</div>
        </footer>
      </div>
    </main>
  );
}