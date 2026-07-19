import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { resolveLocale } from "@/lib/translations/server";
import { marketingMetadata, faqJsonLd, breadcrumbJsonLd } from "@/lib/marketing/seo";
import { getMarketingShared } from "@/lib/translations/pages/shared";
import { creatorLicenseCopy, CREATOR_MUSIC_PATH } from "@/lib/creator-music/content";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { AttributionCopy } from "@/components/creator-music/attribution-copy";

const PATH = "license";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = creatorLicenseCopy(locale);
  return marketingMetadata(locale, PATH, copy.title, copy.description);
}

export default async function LicensePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = resolveLocale(lang);
  const copy = creatorLicenseCopy(locale);
  const shared = getMarketingShared(locale);
  const breadcrumb = breadcrumbJsonLd(locale, [{ name: shared.breadcrumbHome, path: "" }, { name: "Creator license", path: PATH }]);
  return <MarketingShell locale={locale} breadcrumb={[{ name: shared.breadcrumbHome, href: `/${locale}` }, { name: "Creator license" }]}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(copy.faq)) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <section className="max-w-3xl space-y-5"><p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">Flow Creator Music</p><h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{copy.h1}</h1><p className="text-base leading-relaxed text-white/70">{copy.intro}</p><Link href={`/${locale}/${CREATOR_MUSIC_PATH}`} className="text-sm font-semibold text-[#00e5ff] hover:underline underline-offset-4">Browse eligible creator music →</Link></section>
    <section className="grid gap-8 md:grid-cols-2"><div><h2 className="text-xl font-bold text-white">{copy.allowedHeading}</h2><ul className="mt-4 space-y-3">{copy.allowed.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</li>)}</ul></div><div><h2 className="text-xl font-bold text-white">{copy.notAllowedHeading}</h2><ul className="mt-4 space-y-3">{copy.notAllowed.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/70"><X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />{item}</li>)}</ul></div></section>
    <section className="max-w-3xl space-y-4"><h2 className="text-xl font-bold text-white">{copy.attributionHeading}</h2><p className="text-sm text-white/70">{copy.attributionBody}</p><AttributionCopy locale={locale} /><p className="text-xs leading-relaxed text-white/45">{copy.finePrint}</p></section>
    <section className="max-w-3xl space-y-4"><h2 className="text-xl font-bold text-white">Questions</h2>{copy.faq.map((item) => <div key={item.q} className="border-b border-white/[0.08] pb-4"><h3 className="font-semibold text-white">{item.q}</h3><p className="mt-1 text-sm leading-relaxed text-white/60">{item.a}</p></div>)}</section>
  </MarketingShell>;
}
