import type { MetadataRoute } from "next";
import { INDEXABLE_LOCALES, SEO_PAGES, indexableLanguageAlternates, localePath } from "@/lib/marketing/seo-registry";

const BASE = "https://flow.virzyguns.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return SEO_PAGES.flatMap(({ path, changeFrequency, priority, lastModified }) =>
    INDEXABLE_LOCALES.map((locale) => ({
      url: `${BASE}${localePath(locale, path)}`,
      lastModified: new Date(lastModified),
      changeFrequency,
      priority,
      alternates: {
        languages: indexableLanguageAlternates(path),
      },
    }))
  );
}
