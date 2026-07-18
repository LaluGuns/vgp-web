// Keyword landing: /[lang]/study-timer — 25/5 preset.
import type { Metadata } from "next";

import { resolveLocale } from "@/lib/translations/server";
import { getStudyTimerCopy } from "@/lib/translations/pages/study-timer";
import { buildTimerLabels, getMarketingShared } from "@/lib/translations/pages/shared";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { MiniTimer } from "@/components/marketing/mini-timer";
import { CopyBlock, FaqBlock, TimerLinksBlock } from "@/components/marketing/landing-sections";

const PATH = "study-timer";
const WORK = 25;
const BREAK = 5;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = getStudyTimerCopy(locale);
  return marketingMetadata(locale, PATH, copy.metaTitle, copy.metaDescription);
}

export default async function StudyTimerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = getStudyTimerCopy(locale);
  const shared = getMarketingShared(locale);

  const faqLd = faqJsonLd(copy.faq);
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: shared.breadcrumbHome, path: "" },
    { name: copy.h1, path: PATH },
  ]);

  return (
    <MarketingShell
      locale={locale}
      breadcrumb={[
        { name: shared.breadcrumbHome, href: `/${locale}` },
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
          appHref={`/${locale}/app`}
          labels={buildTimerLabels(locale, WORK, BREAK)}
        />
      </section>

      <CopyBlock paragraphs={copy.paragraphs} />
      <FaqBlock heading={shared.faqHeading} faq={copy.faq} />
      <TimerLinksBlock locale={locale} currentPath={PATH} />
      <MarketingCta
        locale={locale}
        title={shared.ctaTitle}
        body={shared.ctaBody}
        button={shared.ctaButton}
      />
    </MarketingShell>
  );
}
