import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, ArrowRight, Check, Footprints, Gauge, Headphones, Music2 } from "lucide-react";

import { CadenzListenPanel } from "@/components/cadenz/CadenzListenPanel";
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

export const dynamicParams = false;

export function generateStaticParams() {
  return CADENZ_INDEXABLE_BPMS.map((bpm) => ({ bpm: String(bpm) }));
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
  const description = `Listen to ${asset.title} by Virzy Guns on Spotify and explore a focused ${bpm} BPM running cadence session.`;
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
          { "@type": "ListItem", position: 1, name: "CADENZ", item: `${SITE_URL}/cadenz` },
          { "@type": "ListItem", position: 2, name: "Running music by BPM", item: `${SITE_URL}${CADENZ_HUB_PATH}` },
          { "@type": "ListItem", position: 3, name: `${bpm} BPM running music`, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020509] text-white selection:bg-[#b8ff48] selection:text-[#071006]">
      <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-[32rem] w-[32rem] rounded-full bg-cyan-400/[0.09] blur-[120px]" />
        <div className="absolute -right-32 top-[38rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/[0.08] blur-[130px]" />
        <div className="absolute inset-x-0 top-0 h-[48rem] opacity-[0.16] [background-image:linear-gradient(rgba(103,232,249,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.11)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[86rem] px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-14">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/42" aria-label="Breadcrumb">
          <Link href="/cadenz" className="transition hover:text-cyan-100" data-organic-cta data-destination-type="cadenz" data-source-position="breadcrumb">CADENZ</Link><span>/</span>
          <Link href={CADENZ_HUB_PATH} className="transition hover:text-cyan-100" data-organic-cta data-destination-type="cadenz_hub" data-source-position="breadcrumb">Running music</Link><span>/</span><span className="text-white/72">{bpm} BPM</span>
        </nav>

        <header className="mt-10 grid items-end gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-cyan-200/15 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,.2),rgba(5,18,27,.94)_68%)] p-6 shadow-[0_35px_110px_rgba(0,0,0,.36)] sm:min-h-[26rem] sm:p-8">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-100/60">CADENZ tempo signal</span><span className="h-2.5 w-2.5 rounded-full bg-[#b8ff48] shadow-[0_0_24px_rgba(184,255,72,.8)] motion-safe:animate-pulse" /></div>
            <div><p className="text-[clamp(6.5rem,17vw,12rem)] font-semibold leading-[0.72] tracking-[-0.085em]">{bpm}</p><div className="mt-7 flex items-center gap-3"><span className="text-sm font-bold uppercase tracking-[0.26em] text-cyan-100/65">BPM</span><span className="h-px flex-1 bg-gradient-to-r from-cyan-200/40 to-transparent" /></div></div>
          </div>

          <div className="pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8ff48]/25 bg-[#b8ff48]/[0.07] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d7ff9d]"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Exact Spotify track</div>
            <h1 className="mt-6 text-[clamp(3rem,6.7vw,7rem)] font-semibold leading-[0.91] tracking-[-0.06em]">{bpm} BPM <span className="block bg-[linear-gradient(90deg,#67e8f9,#a7f3d0_52%,#a78bfa)] bg-clip-text text-transparent">running music.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">{asset.sessionSummary}</p>
            <div className="mt-7 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/54"><span className="rounded-full border border-white/10 px-3 py-2">{asset.sessionLabel}</span><span className="rounded-full border border-white/10 px-3 py-2">Virzy Guns</span><span className="rounded-full border border-white/10 px-3 py-2">1-hour track</span></div>
          </div>
        </header>

        <div className="mt-16"><CadenzListenPanel asset={asset} /></div>

        <section className="mt-16 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8" aria-labelledby="session-guide-title">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08]"><Footprints className="h-5 w-5 text-cyan-100" aria-hidden="true" /></div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/55">Session guide</p><h2 id="session-guide-title" className="mt-3 text-3xl font-semibold">Use the beat. Keep your agency.</h2>
            <ol className="mt-7 grid gap-3 sm:grid-cols-3">{asset.useTips.map((tip, index) => <li key={tip} className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-xs font-bold text-[#b8ff48]">0{index + 1}</span><p className="mt-3 text-sm leading-6 text-white/68">{tip}</p></li>)}</ol>
          </article>
          <aside className="rounded-[1.75rem] border border-violet-300/15 bg-violet-300/[0.045] p-6 sm:p-8">
            <Gauge className="h-5 w-5 text-violet-200" aria-hidden="true" /><p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/60">BPM and SPM</p><h2 className="mt-3 text-2xl font-semibold">Music tempo is not a prescription.</h2><p className="mt-4 text-sm leading-7 text-white/58">{bpm} BPM describes this track. Your steps per minute may match it, use half-time, or sit elsewhere entirely. Comfort, terrain, and your session plan matter more than a target number.</p>
          </aside>
        </section>

        <section className="mt-16 rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 sm:p-8" aria-labelledby="catalog-facts-title">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8ff48]/70">Catalog identity</p><h2 id="catalog-facts-title" className="mt-3 text-3xl font-semibold">The track behind this page.</h2></div><Headphones className="h-7 w-7 text-cyan-200/65" aria-hidden="true" /></div>
          <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#071017] p-4"><dt className="text-[10px] uppercase tracking-[0.15em] text-white/35">Artist</dt><dd className="mt-2 text-sm font-semibold">{asset.artist}</dd></div>
            <div className="bg-[#071017] p-4"><dt className="text-[10px] uppercase tracking-[0.15em] text-white/35">ISRC</dt><dd className="mt-2 font-mono text-sm text-white/75">{asset.isrc}</dd></div>
            <div className="bg-[#071017] p-4"><dt className="text-[10px] uppercase tracking-[0.15em] text-white/35">Release date</dt><dd className="mt-2 text-sm font-semibold">June 8, 2024</dd></div>
            <div className="bg-[#071017] p-4"><dt className="text-[10px] uppercase tracking-[0.15em] text-white/35">Availability</dt><dd className="mt-2 text-sm font-semibold">Spotify{asset.youtube ? " + YouTube" : ""}</dd></div>
          </dl>
        </section>

        <section className="mt-16" aria-labelledby="adjacent-title">
          <div className="flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">Tempo neighbors</p><h2 id="adjacent-title" className="mt-3 text-3xl font-semibold">Shift the signal.</h2></div><Music2 className="h-6 w-6 text-cyan-200/60" aria-hidden="true" /></div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{adjacent.map((candidate) => <Link key={candidate} href={bpmHref(candidate)} data-organic-cta data-destination-type="adjacent_bpm" data-source-position="adjacent_links" className="group flex min-h-24 items-end justify-between rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:-translate-y-1 hover:border-cyan-200/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100"><span><span className="block text-2xl font-semibold">{candidate}</span><span className="text-[10px] uppercase tracking-[0.15em] text-white/35">BPM</span></span><ArrowRight className="h-4 w-4 text-white/35 transition group-hover:text-cyan-100" aria-hidden="true" /></Link>)}</div>
        </section>

        <footer className="mt-16 border-t border-white/10 pt-8"><Link href={CADENZ_HUB_PATH} className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-cyan-100"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the 130–180 BPM map</Link></footer>
      </div>
    </main>
  );
}