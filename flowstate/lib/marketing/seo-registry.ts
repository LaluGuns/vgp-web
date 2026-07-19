import type { Locale } from "@/lib/translations/dictionaries";

/**
 * The single source of truth for Flow URLs we actively ask search engines to
 * index. A locale is only eligible when its page has native editorial copy.
 * Add a locale here only as part of a reviewed translation release.
 */
export const INDEXABLE_LOCALES = ["en", "id"] as const satisfies readonly Locale[];

export type SeoPage = {
  path: string;
  cluster: "brand" | "conversion" | "timer" | "deep-work" | "study" | "music" | "creator";
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  lastModified: string;
};

export const SEO_PAGES: readonly SeoPage[] = [
  { path: "", cluster: "brand", changeFrequency: "weekly", priority: 1, lastModified: "2026-07-19" },
  { path: "pricing", cluster: "conversion", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "deep-work-timer", cluster: "deep-work", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "study-timer", cluster: "study", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "pomodoro-timer-with-music", cluster: "music", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-19" },
  { path: "timer/25-5", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-19" },
  { path: "timer/50-10", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-19" },
  // Creator Music is intentionally limited to the reviewed EN/ID editorial
  // release. Receipt verification is private-by-design and stays out of this
  // registry, sitemap, and hreflang graph.
  { path: "creator-music", cluster: "creator", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-19" },
  { path: "creator-music/city-pop", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "creator-music/cyberpunk-jazz", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "creator-music/neo-synthwave", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "license", cluster: "creator", changeFrequency: "yearly", priority: 0.7, lastModified: "2026-07-19" },
];

export function isIndexableLocale(locale: string): locale is (typeof INDEXABLE_LOCALES)[number] {
  return (INDEXABLE_LOCALES as readonly string[]).includes(locale);
}

export function isIndexableSeoPath(path: string) {
  return SEO_PAGES.some((page) => page.path === path);
}

export function shouldIndexSeoPage(locale: string, path: string) {
  return isIndexableLocale(locale) && isIndexableSeoPath(path);
}

export function localePath(locale: string, path = "") {
  return `/${locale}${path ? `/${path}` : ""}`;
}

export function indexableLanguageAlternates(path: string) {
  return Object.fromEntries(INDEXABLE_LOCALES.map((locale) => [locale, localePath(locale, path)]));
}
