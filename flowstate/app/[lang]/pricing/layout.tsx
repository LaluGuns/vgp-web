import type { Metadata } from "next";
import { marketRouteCopy } from "@/lib/marketing/market-copy";
import { marketingMetadata } from "@/lib/marketing/seo";
import { getTranslator, resolveLocale } from "@/lib/translations/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const regional = marketRouteCopy(lang, "pricing");
  const t = getTranslator(resolveLocale(lang));
  return marketingMetadata(
    lang,
    "pricing",
    regional?.metaTitle ?? t("pricing.fixed.title", "Flow Pro pricing"),
    regional?.metaDescription ?? t("pricing.fixed.description", "Compare Flow Free and Flow Pro plans for focus music, ambient sounds, scenes, and creator tools.")
  );
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
