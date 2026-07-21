// Programmatic timer preset pages: /[lang]/timer/25-5, 50-10, 45-15, 60-10,
// 90-15. Fully static server components; the only client island is the small
// self-contained MiniTimer (real buttons, no app stores).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveLocale } from "@/lib/translations/server";
import {
  TIMER_SLUGS,
  TIMER_CONFIG,
  getTimerCopy,
  type TimerSlug,
} from "@/lib/translations/pages/timers";
import {
  buildTimerLabels,
  getMarketingShared,
  getFreeTimerLinks,
} from "@/lib/translations/pages/shared";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { withMarketRouteCopy } from "@/lib/marketing/market-copy";
import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { MiniTimer } from "@/components/marketing/mini-timer";

export const dynamicParams = false;

export function generateStaticParams() {
  return TIMER_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!(TIMER_SLUGS as readonly string[]).includes(slug)) return {};
  const locale = resolveLocale(lang);
  const copy = withMarketRouteCopy(lang, `timer/${slug}`, getTimerCopy(locale, slug as TimerSlug));
  return marketingMetadata(lang, `timer/${slug}`, copy.metaTitle, copy.metaDescription);
}

export default async function TimerPresetPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!(TIMER_SLUGS as readonly string[]).includes(slug)) notFound();

  const locale = resolveLocale(lang);
  const timerSlug = slug as TimerSlug;
  const { workMin, breakMin } = TIMER_CONFIG[timerSlug];
  const copy = withMarketRouteCopy(lang, `timer/${slug}`, getTimerCopy(locale, timerSlug));
  const shared = getMarketingShared(lang);
  const otherTimers = getFreeTimerLinks(lang).filter(
    (l) => !l.href.endsWith(`/timer/${slug}`)
  );

  const faqLd = faqJsonLd(copy.faq);
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: shared.breadcrumbHome, path: "" },
    { name: shared.breadcrumbTimers, path: `timer/${slug}` },
  ]);

  return (
    <MarketingShell
      locale={lang}
      breadcrumb={[
        { name: shared.breadcrumbHome, href: `/${lang}` },
        { name: `${workMin}/${breakMin}` },
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

      {/* Hero: H1 + the working timer */}
      <section className="space-y-8">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
          {copy.h1}
        </h1>
        <MiniTimer
          workMin={workMin}
          breakMin={breakMin}
          appHref={`/${lang}/app`}
          labels={buildTimerLabels(lang, workMin, breakMin)}
        />
      </section>

      {/* Method copy */}
      <section className="max-w-2xl space-y-4">
        {copy.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-white/70 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      {/* FAQ (matches the FAQPage JSON-LD) */}
      <section className="max-w-2xl space-y-5">
        <h2 className="text-xl font-bold text-white tracking-tight">{shared.faqHeading}</h2>
        <div className="space-y-4">
          {copy.faq.map((f) => (
            <div key={f.q} className="border-b border-white/[0.06] pb-4 space-y-1.5">
              <h3 className="text-sm font-semibold text-white">{f.q}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links to the other presets */}
      <section className="space-y-3">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
          {shared.otherTimersHeading}
        </h2>
        <div className="flex flex-wrap gap-2">
          {otherTimers.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <MarketingCta
        locale={lang}
        title={shared.ctaTitle}
        body={shared.ctaBody}
        button={shared.ctaButton}
      />
    </MarketingShell>
  );
}
