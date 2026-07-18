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
  // Free timer preset pages (programmatic SEO cluster).
  { path: "timer/25-5", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "timer/50-10", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "timer/45-15", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "timer/60-10", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "timer/90-15", changeFrequency: "monthly" as const, priority: 0.7 },
  // Keyword landings.
  { path: "deep-work-timer", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "study-timer", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "pomodoro-timer-with-music", changeFrequency: "monthly" as const, priority: 0.9 },
  // Music license (backlink magnet).
  { path: "license", changeFrequency: "monthly" as const, priority: 0.6 },
  // Competitor alternatives cluster.
  { path: "alternatives/brainfm", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "alternatives/endel", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "alternatives/flocus", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "alternatives/pomofocus", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "alternatives/noisli", changeFrequency: "monthly" as const, priority: 0.6 },
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
