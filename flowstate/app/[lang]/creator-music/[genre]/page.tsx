import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { creatorTracksByGenre } from "@/lib/creator-license/catalog";
import { resolveLocale } from "@/lib/translations/server";
import { marketingMetadata, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { creatorGenreBySlug, creatorGenres, creatorOrganizationJsonLd, CREATOR_MUSIC_PATH } from "@/lib/creator-music/content";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CreatorCatalog } from "@/components/creator-music/creator-catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return creatorGenres("en").map(({ slug }) => ({ genre: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; genre: string }> }): Promise<Metadata> {
  const { lang, genre } = await params;
  const item = creatorGenreBySlug(resolveLocale(lang), genre);
  if (!item) return {};
  return marketingMetadata(resolveLocale(lang), `${CREATOR_MUSIC_PATH}/${item.slug}`, item.title, item.description);
}

export default async function CreatorGenrePage({ params }: { params: Promise<{ lang: string; genre: string }> }) {
  const { lang, genre } = await params;
  const locale = resolveLocale(lang);
  const item = creatorGenreBySlug(locale, genre);
  if (!item) notFound();
  const tracks = creatorTracksByGenre(item.genre);
  const shared = getMarketingShared(locale);
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: shared.breadcrumbHome, path: "" },
    { name: "Creator Music", path: CREATOR_MUSIC_PATH },
    { name: item.genre, path: `${CREATOR_MUSIC_PATH}/${item.slug}` },
  ]);
  const playlistLd = { "@context": "https://schema.org", "@type": "MusicPlaylist", name: `Flow Creator Music: ${item.genre}`, numTracks: tracks.length, genre: item.genre, url: `https://flow.virzyguns.com/${locale}/${CREATOR_MUSIC_PATH}/${item.slug}` };

  return <MarketingShell locale={locale} breadcrumb={[{ name: shared.breadcrumbHome, href: `/${locale}` }, { name: "Creator Music", href: `/${locale}/${CREATOR_MUSIC_PATH}` }, { name: item.genre }]}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorOrganizationJsonLd()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <section className="max-w-3xl space-y-5">
      <Link href={`/${locale}/${CREATOR_MUSIC_PATH}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-[#00e5ff]"><ArrowLeft className="h-3.5 w-3.5" /> All creator music</Link>
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">{item.primaryQuery}</p>
      <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{item.h1}</h1>
      <p className="text-base leading-relaxed text-white/70">{item.intro}</p>
      <ul className="flex flex-wrap gap-2">{item.useCases.map((useCase) => <li key={useCase} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">{useCase}</li>)}</ul>
    </section>
    <CreatorCatalog tracks={tracks} locale={locale} genre={item.genre} title={`${item.genre} creator tracks`} />
    <Link href={`/${locale}/pomodoro-timer-with-music`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#00e5ff] hover:underline underline-offset-4">Pair it with a focus timer <ArrowRight className="h-4 w-4" /></Link>
  </MarketingShell>;
}
