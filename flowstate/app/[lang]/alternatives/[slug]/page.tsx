// Competitor comparison pages: /[lang]/alternatives/{brainfm,endel,flocus,
// pomofocus,noisli}. Fully static; honest by design — each page has a
// "when the competitor is still the right pick" section.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveLocale } from "@/lib/translations/server";
import {
  ALTERNATIVE_SLUGS,
  getAlternativeCopy,
  type AlternativeSlug,
} from "@/lib/translations/pages/alternatives";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { marketRouteCopy } from "@/lib/marketing/market-copy";
import { getJaKoAlternativeCopy } from "@/lib/marketing/ja-ko-alternatives";
import { deAlternativeCopy } from "@/lib/marketing/de-market-copy";
import { getEsPtAlternativeCopy } from "@/lib/marketing/es-pt-alternatives";
import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { CopyBlock, FaqBlock, TimerLinksBlock } from "@/components/marketing/landing-sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALTERNATIVE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!(ALTERNATIVE_SLUGS as readonly string[]).includes(slug)) return {};
  const locale = resolveLocale(lang);
  const copy = getJaKoAlternativeCopy(lang, slug as AlternativeSlug) ?? deAlternativeCopy(lang, slug as AlternativeSlug) ?? getEsPtAlternativeCopy(lang, slug as AlternativeSlug) ?? getAlternativeCopy(locale, slug as AlternativeSlug);
  const localized = marketRouteCopy(lang, `alternatives/${slug}`);
  return marketingMetadata(lang, `alternatives/${slug}`, localized?.metaTitle ?? copy.metaTitle, localized?.metaDescription ?? copy.metaDescription);
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!(ALTERNATIVE_SLUGS as readonly string[]).includes(slug)) notFound();

  const locale = resolveLocale(lang);
  const copy = getJaKoAlternativeCopy(lang, slug as AlternativeSlug) ?? deAlternativeCopy(lang, slug as AlternativeSlug) ?? getEsPtAlternativeCopy(lang, slug as AlternativeSlug) ?? getAlternativeCopy(locale, slug as AlternativeSlug);
  const localized = marketRouteCopy(lang, `alternatives/${slug}`);
  const shared = getMarketingShared(lang);
  const others = ALTERNATIVE_SLUGS.filter((s) => s !== slug);
  const title = localized?.h1 ?? copy.h1;
  const intro = localized?.paragraphs ?? copy.intro;
  const faq = localized?.faq ?? copy.faq;

  const faqLd = faqJsonLd(faq);
  const breadcrumbLd = breadcrumbJsonLd(lang, [
    { name: shared.breadcrumbHome, path: "" },
    { name: title, path: `alternatives/${slug}` },
  ]);

  return (
    <MarketingShell
      locale={lang}
      breadcrumb={[
        { name: shared.breadcrumbHome, href: `/${lang}` },
        { name: copy.competitorName },
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

      <section className="space-y-6">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
          {title}
        </h1>
        <CopyBlock paragraphs={intro} />
      </section>

      {/* Comparison table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{copy.tableHeading}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-mono uppercase tracking-[0.15em]">
                <th className="px-4 py-3 text-white/40 font-medium" />
                <th className="px-4 py-3 text-white/60 font-medium">{copy.competitorName}</th>
                <th className="px-4 py-3 text-[#00e5ff] font-medium">Flow</th>
              </tr>
            </thead>
            <tbody>
              {copy.rows.map((row) => (
                <tr key={row.feature} className="border-b border-white/[0.05] last:border-b-0">
                  <td className="px-4 py-3 text-white/80 font-medium align-top whitespace-nowrap">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-white/55 align-top">{row.them}</td>
                  <td className="px-4 py-3 text-white/75 align-top">{row.flow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Honesty section */}
      <section className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{copy.whenHeading}</h2>
        {copy.whenParagraphs.map((p, i) => (
          <p key={i} className="text-sm text-white/70 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <FaqBlock heading={shared.faqHeading} faq={faq} />

      {/* Cross-links inside the alternatives cluster */}
      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {others.map((s) => {
            const other = getJaKoAlternativeCopy(lang, s) ?? deAlternativeCopy(lang, s) ?? getEsPtAlternativeCopy(lang, s) ?? getAlternativeCopy(locale, s);
            const otherTitle = marketRouteCopy(lang, `alternatives/${s}`)?.h1 ?? other.h1;
            return (
              <Link
                key={s}
                href={`/${lang}/alternatives/${s}`}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
              >
                {otherTitle}
              </Link>
            );
          })}
        </div>
      </section>

      <TimerLinksBlock locale={lang} />
      <MarketingCta
        locale={lang}
        title={shared.ctaTitle}
        body={shared.ctaBody}
        button={shared.ctaButton}
      />
    </MarketingShell>
  );
}
