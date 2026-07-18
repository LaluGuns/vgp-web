// /[lang]/license — creator-facing music license (backlink magnet).
import type { Metadata } from "next";
import { Check, X } from "lucide-react";

import { resolveLocale } from "@/lib/translations/server";
import { getLicenseCopy } from "@/lib/translations/pages/license";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { CopyBlock, FaqBlock } from "@/components/marketing/landing-sections";

const PATH = "license";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = getLicenseCopy(locale);
  return marketingMetadata(locale, PATH, copy.metaTitle, copy.metaDescription);
}

export default async function LicensePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = getLicenseCopy(locale);
  const shared = getMarketingShared(locale);

  const faqLd = faqJsonLd(copy.faq);
  const breadcrumbLd = breadcrumbJsonLd(locale, [
    { name: shared.breadcrumbHome, path: "" },
    { name: copy.metaTitle, path: PATH },
  ]);

  return (
    <MarketingShell
      locale={locale}
      breadcrumb={[
        { name: shared.breadcrumbHome, href: `/${locale}` },
        { name: copy.metaTitle },
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
          {copy.h1}
        </h1>
        <CopyBlock paragraphs={copy.intro} />
      </section>

      {/* Allowed */}
      <section className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{copy.allowedHeading}</h2>
        <ul className="space-y-2.5">
          {copy.allowed.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/70 leading-relaxed">
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Attribution line — the one condition, copy-paste ready */}
      <section className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{copy.attributionHeading}</h2>
        <p className="text-sm text-white/70 leading-relaxed">{copy.attributionBody}</p>
        <pre className="glass-card rounded-2xl border border-[#00e5ff]/25 bg-black/30 px-5 py-4 text-sm font-mono text-[#00e5ff] whitespace-pre-wrap break-words">
          {copy.attributionLine}
        </pre>
      </section>

      {/* Not allowed */}
      <section className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{copy.notAllowedHeading}</h2>
        <ul className="space-y-2.5">
          {copy.notAllowed.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/70 leading-relaxed">
              <X className="h-4 w-4 text-rose-400/80 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/50 leading-relaxed pt-2">{copy.finePrint}</p>
      </section>

      <FaqBlock heading={shared.faqHeading} faq={copy.faq} />
      <MarketingCta
        locale={locale}
        title={shared.ctaTitle}
        body={shared.ctaBody}
        button={shared.ctaButton}
      />
    </MarketingShell>
  );
}
