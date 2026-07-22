// SEO helpers for the static marketing pages (timer presets, keyword
// landings, /license, /alternatives). Metadata + JSON-LD builders only —
// no React, safe to import from server components.
import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/translations/dictionaries";
import { indexableLanguageAlternates, localePath, SEO_SITE_URL, shouldIndexSeoPage } from "@/lib/marketing/seo-registry";

export const SITE_URL = SEO_SITE_URL;

const OPEN_GRAPH_LOCALE: Record<string, string> = {
  en: "en_US", id: "id_ID", es: "es_ES", fr: "fr_FR", de: "de_DE",
  ja: "ja_JP", ko: "ko_KR", zh: "zh_CN", pt: "pt_BR", ru: "ru_RU", it: "it_IT",
  "en-US": "en_US", "en-GB": "en_GB", "ja-JP": "ja_JP", "de-DE": "de_DE",
  "es-MX": "es_MX", "es-ES": "es_ES", "pt-BR": "pt_BR", "ko-KR": "ko_KR",
};

export function openGraphLocale(locale: string) {
  return OPEN_GRAPH_LOCALE[locale] ?? locale.replace("-", "_");
}

export type FaqItem = { q: string; a: string };

/**
 * Per-page metadata with a self canonical. Only reviewed EN/ID pages receive
 * hreflang and index permission; fallback locales remain crawlable but noindex.
 * `path` is the locale-less route, e.g. "timer/50-10". The layout already
 * sets metadataBase and the `%s · Flow by Virzy Guns` title template.
 */
export function marketingMetadata(
  locale: string,
  path: string,
  title: string,
  description: string
): Metadata {
  const indexable = shouldIndexSeoPage(locale, path);
  const languages = indexable ? {
    ...indexableLanguageAlternates(path),
    "x-default": `${SITE_URL}${localePath(DEFAULT_LOCALE, path)}`,
  } : undefined;
  const canonical = `${SITE_URL}${localePath(locale, path)}`;
  const socialImage = `${SITE_URL}${localePath(locale, "opengraph-image")}`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages,
    },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Flow by Virzy Guns",
      type: "website",
      locale: openGraphLocale(locale),
      images: [{ url: socialImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
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
