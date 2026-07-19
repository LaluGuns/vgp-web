import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";
import { CREATOR_TRACKS } from "@/lib/creator-license/catalog";
import { resolveLocale } from "@/lib/translations/server";
import { marketingMetadata, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { creatorGenres, creatorMusicCopy, creatorOrganizationJsonLd, CREATOR_MUSIC_PATH } from "@/lib/creator-music/content";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CreatorCatalog } from "@/components/creator-music/creator-catalog";
import { TrackedLink } from "@/components/analytics/tracked-link";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = creatorMusicCopy(locale);
  return marketingMetadata(locale, CREATOR_MUSIC_PATH, copy.title, copy.description);
}

export default async function CreatorMusicPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = creatorMusicCopy(locale);
  const shared = getMarketingShared(locale);
  const genres = creatorGenres(locale);
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: shared.breadcrumbHome, path: "" },
    { name: "Creator Music", path: CREATOR_MUSIC_PATH },
  ]);
  const playlistLd = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    name: "Flow Creator Music",
    numTracks: CREATOR_TRACKS.length,
    genre: genres.map((genre) => genre.genre),
    url: `https://flow.virzyguns.com/${locale}/${CREATOR_MUSIC_PATH}`,
  };

  return <MarketingShell locale={locale} breadcrumb={[{ name: shared.breadcrumbHome, href: `/${locale}` }, { name: "Creator Music" }]}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorOrganizationJsonLd()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

    <section className="max-w-3xl space-y-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">Flow Creator Music</p>
      <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{copy.h1}</h1>
      <p className="text-base leading-relaxed text-white/70">{copy.intro}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {genres.map((item) => <Link key={item.slug} href={`/${locale}/${CREATOR_MUSIC_PATH}/${item.slug}`} className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-semibold text-white/75 transition-colors hover:border-[#00e5ff]/60 hover:text-white">{item.genre}</Link>)}
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-3">
      {genres.map((item) => {
        const count = CREATOR_TRACKS.filter((track) => track.creatorGenre === item.genre).length;
        return <Link key={item.slug} href={`/${locale}/${CREATOR_MUSIC_PATH}/${item.slug}`} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-colors hover:border-[#00e5ff]/40 hover:bg-white/[0.04]">
          <Headphones className="h-5 w-5 text-[#00e5ff]" />
          <h2 className="mt-5 text-lg font-bold text-white">{item.genre}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{item.intro}</p>
          <p className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#00e5ff]">{count} tracks <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></p>
        </Link>;
      })}
    </section>

    <section className="grid gap-4 rounded-3xl border border-white/[0.08] bg-black/20 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
      <div><h2 className="text-xl font-bold text-white">{copy.licenseHeading}</h2><ol className="mt-3 space-y-1 text-sm text-white/60">{copy.licenseSteps.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}</ol></div>
      <TrackedLink href={`/${locale}/license`} destination={`/${locale}/license`} source="creator_music_license_cta" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00e5ff] px-4 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-cyan-300">Read the terms <ArrowRight className="h-4 w-4" /></TrackedLink>
    </section>

    <CreatorCatalog tracks={CREATOR_TRACKS} locale={locale} title={copy.catalogHeading} />
  </MarketingShell>;
}
