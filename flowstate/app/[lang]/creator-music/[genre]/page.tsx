import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { creatorTracksByGenre } from "@/lib/creator-license/catalog";
import { resolveLocale } from "@/lib/translations/server";
import { marketingMetadata, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { marketRouteCopy } from "@/lib/marketing/market-copy";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { creatorGenreBySlug, creatorGenres, creatorOrganizationJsonLd, creatorUiCopy, CREATOR_MUSIC_PATH } from "@/lib/creator-music/content";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CreatorCatalog } from "@/components/creator-music/creator-catalog";
import { esPtCreatorGenres } from "@/lib/marketing/es-pt-visible-copy";

export const dynamicParams = false;

export function generateStaticParams() {
  return creatorGenres("en").map(({ slug }) => ({ genre: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; genre: string }> }): Promise<Metadata> {
  const { lang, genre } = await params;
  const item = (esPtCreatorGenres(lang) ?? creatorGenres(resolveLocale(lang))).find((entry) => entry.slug === genre);
  if (!item) return {};
  const localized = marketRouteCopy(lang, `${CREATOR_MUSIC_PATH}/${item.slug}`);
  return marketingMetadata(lang, `${CREATOR_MUSIC_PATH}/${item.slug}`, localized?.metaTitle ?? item.title, localized?.metaDescription ?? item.description);
}

export default async function CreatorGenrePage({ params }: { params: Promise<{ lang: string; genre: string }> }) {
  const { lang, genre } = await params;
  const locale = resolveLocale(lang);
  const item = (esPtCreatorGenres(lang) ?? creatorGenres(locale)).find((entry) => entry.slug === genre);
  if (!item) notFound();
  const tracks = creatorTracksByGenre(item.genre);
  const ui = creatorUiCopy(lang);
  const localized = marketRouteCopy(lang, `${CREATOR_MUSIC_PATH}/${item.slug}`);
  const shared = getMarketingShared(lang);
  const title = localized?.h1 ?? item.h1;
  const intro = localized?.paragraphs[0] ?? item.intro;
  const breadcrumb = breadcrumbJsonLd(lang, [
    { name: shared.breadcrumbHome, path: "" },
    { name: ui?.creatorCatalog ?? "Creator Music", path: CREATOR_MUSIC_PATH },
    { name: title, path: `${CREATOR_MUSIC_PATH}/${item.slug}` },
  ]);
  const playlistLd = { "@context": "https://schema.org", "@type": "MusicPlaylist", name: `Flow Creator Music: ${item.genre}`, numTracks: tracks.length, genre: item.genre, url: `https://flow.virzyguns.com/${lang}/${CREATOR_MUSIC_PATH}/${item.slug}` };

  return <MarketingShell locale={lang} breadcrumb={[{ name: shared.breadcrumbHome, href: `/${lang}` }, { name: ui?.creatorCatalog ?? "Creator Music", href: `/${lang}/${CREATOR_MUSIC_PATH}` }, { name: title }]}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorOrganizationJsonLd()) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <section className="max-w-3xl space-y-5">
      <Link href={`/${lang}/${CREATOR_MUSIC_PATH}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-[#00e5ff]"><ArrowLeft className="h-3.5 w-3.5" /> {ui?.allCreatorMusic ?? "All creator music"}</Link>
      <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">{item.primaryQuery}</p>
      <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{title}</h1>
      <p className="text-base leading-relaxed text-white/70">{intro}</p>
      {localized?.legalReviewNotice && <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-relaxed text-amber-100/75">{localized.legalReviewNotice}</p>}
      <ul className="flex flex-wrap gap-2">{item.useCases.map((useCase) => <li key={useCase} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65">{useCase}</li>)}</ul>
    </section>
    <CreatorCatalog tracks={tracks} locale={lang} genre={item.genre} title={`${item.genre} ${ui?.eligibleTracks ?? "creator tracks"}`} />
    <Link href={`/${lang}/pomodoro-timer-with-music`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#00e5ff] hover:underline underline-offset-4">{ui?.pairTimer ?? "Pair it with a focus timer"} <ArrowRight className="h-4 w-4" /></Link>
  </MarketingShell>;
}
