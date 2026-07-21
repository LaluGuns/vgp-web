import type { Metadata } from "next";
import { localePath, SEO_SITE_URL } from "./seo-registry.ts";

/**
 * Prevent a noindex route from inheriting the public page canonical and
 * hreflang graph from /[lang]/layout. A self canonical is deliberate here:
 * the document is private from search, but it must not consolidate into /en.
 */
export function noIndexRouteMetadata(locale: string, path: string): Metadata {
  return {
    metadataBase: new URL(SEO_SITE_URL),
    alternates: {
      canonical: localePath(locale, path),
      languages: {},
    },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}
