// Keyword landing: /[lang]/pomodoro-timer-with-music — the cluster's main
// money page. Timer island + in-house music section with track previews.
import type { Metadata } from "next";

import { resolveLocale } from "@/lib/translations/server";
import { getPomodoroMusicCopy } from "@/lib/translations/pages/pomodoro-timer-with-music";
import { buildTimerLabels, getMarketingShared } from "@/lib/translations/pages/shared";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { withMarketRouteCopy } from "@/lib/marketing/market-copy";
import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { MiniTimer } from "@/components/marketing/mini-timer";
import { CopyBlock, FaqBlock, TimerLinksBlock } from "@/components/marketing/landing-sections";
import { SoundtrackShowcase } from "@/components/landing/soundtrack-showcase";
import { DE_POMODORO_MUSIC_DETAIL } from "@/lib/marketing/de-market-copy";
import { esPtPomodoroMusicCopy } from "@/lib/marketing/es-pt-visible-copy";

const PATH = "pomodoro-timer-with-music";
const WORK = 25;
const BREAK = 5;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const baseCopy = getPomodoroMusicCopy(locale);
  const richCopy = esPtPomodoroMusicCopy(lang) ?? (lang === "de-DE" ? { ...baseCopy, ...DE_POMODORO_MUSIC_DETAIL } : baseCopy);
  const copy = withMarketRouteCopy(lang, PATH, richCopy);
  return marketingMetadata(lang, PATH, copy.metaTitle, copy.metaDescription);
}

export default async function PomodoroTimerWithMusicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const baseCopy = getPomodoroMusicCopy(locale);
  const richCopy = esPtPomodoroMusicCopy(lang) ?? (lang === "de-DE" ? { ...baseCopy, ...DE_POMODORO_MUSIC_DETAIL } : baseCopy);
  const copy = withMarketRouteCopy(lang, PATH, richCopy);
  const shared = getMarketingShared(lang);

  const faqLd = faqJsonLd(copy.faq);
  const breadcrumbLd = breadcrumbJsonLd(lang, [
    { name: shared.breadcrumbHome, path: "" },
    { name: copy.h1, path: PATH },
  ]);

  return (
    <MarketingShell
      locale={lang}
      breadcrumb={[
        { name: shared.breadcrumbHome, href: `/${lang}` },
        { name: copy.h1 },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
          {copy.h1}
        </h1>
        <MiniTimer
          workMin={WORK}
          breakMin={BREAK}
          appHref={`/${lang}/app`}
          labels={buildTimerLabels(lang, WORK, BREAK)}
        />
      </section>

      <CopyBlock paragraphs={copy.paragraphs} />

      {/* The moat: in-house music, with real previews */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {copy.musicHeading}
          </h2>
          {copy.musicParagraphs.map((p, i) => (
            <p key={i} className="text-sm text-white/70 leading-relaxed">
              {p}
            </p>
          ))}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
              {copy.genresLabel}
            </span>
            {copy.genres.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full text-[11px] font-mono border border-white/10 text-white/60"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        {/* Same previewer as the landing page (light audio island). */}
        <SoundtrackShowcase />
      </section>

      <FaqBlock heading={shared.faqHeading} faq={copy.faq} />
      <TimerLinksBlock locale={lang} currentPath={PATH} />
      <MarketingCta
        locale={lang}
        title={shared.ctaTitle}
        body={shared.ctaBody}
        button={shared.ctaButton}
      />
    </MarketingShell>
  );
}
