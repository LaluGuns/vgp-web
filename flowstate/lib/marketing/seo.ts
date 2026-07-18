// SEO helpers for the static marketing pages (timer presets, keyword
// landings, /license, /alternatives). Metadata + JSON-LD builders only —
// no React, safe to import from server components.
import type { Metadata } from "next";
import { LANGUAGES, DEFAULT_LOCALE } from "@/lib/translations/dictionaries";

export const SITE_URL = "https://flow.virzyguns.com";
const LOCALES = Object.keys(LANGUAGES);

export type FaqItem = { q: string; a: string };

/**
 * Per-page metadata with canonical + hreflang alternates for all 11 locales.
 * `path` is the locale-less route, e.g. "timer/50-10". The layout already
 * sets metadataBase and the `%s · Flow by Virzy Guns` title template.
 */
export function marketingMetadata(
  locale: string,
  path: string,
  title: string,
  description: string
): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, `/${l}/${path}`])
  );
  languages["x-default"] = `/${DEFAULT_LOCALE}/${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${path}`,
      languages,
    },
    openGraph: { title, description },
  };
}

/** schema.org FAQPage JSON-LD from a list of Q&A pairs. */
export function faqJsonLd(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/**
 * schema.org BreadcrumbList JSON-LD. Items are given root-relative paths
 * ("", "timer/50-10") and expanded to absolute locale URLs here.
 */
export function breadcrumbJsonLd(
  locale: string,
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, path }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_URL}/${locale}${path ? `/${path}` : ""}`,
    })),
  };
}
