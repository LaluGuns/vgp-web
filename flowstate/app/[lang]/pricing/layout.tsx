import type { Metadata } from "next";
import { indexableLanguageAlternates, localePath, SEO_SITE_URL, shouldIndexSeoPage } from "@/lib/marketing/seo-registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const indexable = shouldIndexSeoPage(lang, "pricing");

  return {
    alternates: {
      canonical: localePath(lang, "pricing"),
      languages: indexable
        ? { ...indexableLanguageAlternates("pricing"), "x-default": `${SEO_SITE_URL}${localePath("en", "pricing")}` }
        : undefined,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
