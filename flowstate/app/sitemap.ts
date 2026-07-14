import type { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/translations/dictionaries";

const BASE = "https://flow.virzyguns.com";
const LOCALES = Object.keys(LANGUAGES);

// Marketing + legal pages only (the /app and /insights product pages are
// auth-gated and not meant for indexing).
const PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "pricing", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "login", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "legal/terms", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "legal/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "legal/refund", changeFrequency: "yearly" as const, priority: 0.2 },
];

function urlFor(locale: string, path: string) {
  return `${BASE}/${locale}${path ? `/${path}` : ""}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((locale) => ({
      url: urlFor(locale, path),
      lastModified: now,
      changeFrequency,
      priority,
      // hreflang alternates so search engines cluster the language variants.
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, urlFor(l, path)])),
      },
    }))
  );
}
