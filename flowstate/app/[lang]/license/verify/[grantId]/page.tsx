import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LicenseVerifier } from "@/components/creator-music/license-verifier";
import { noIndexRouteMetadata } from "@/lib/marketing/route-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; grantId: string }>;
}): Promise<Metadata> {
  const { lang, grantId } = await params;
  return {
    ...noIndexRouteMetadata(lang, `license/verify/${encodeURIComponent(grantId)}`),
    title: "Creator license verification",
  };
}

export default async function VerifyCreatorLicensePage({ params }: { params: Promise<{ lang: string; grantId: string }> }) {
  const { lang, grantId } = await params;
  const locale = lang;
  return <MarketingShell locale={lang} breadcrumb={[{ name: "Home", href: `/${lang}` }, { name: "Creator license", href: `/${lang}/license` }, { name: "Verification" }]}>
    <section className="max-w-2xl space-y-4"><p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">Public verification</p><h1 className="text-3xl font-black text-white md:text-4xl">Creator license verification</h1><p className="text-sm leading-relaxed text-white/60">This page only shows whether a grant is valid, its issued date, terms version, catalog version, and eligible genres. It never exposes the license holder’s identity.</p></section>
    <LicenseVerifier grantId={grantId} />
    <Link href={`/${locale}/license`} className="text-sm font-semibold text-[#00e5ff] hover:underline underline-offset-4">Read the creator license →</Link>
  </MarketingShell>;
}
