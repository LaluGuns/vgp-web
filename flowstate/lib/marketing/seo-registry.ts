/**
 * The public SEO release registry.
 *
 * A route being technically renderable is deliberately not enough to put it in
 * a sitemap or hreflang graph. A release must be explicitly marked indexable
 * after its native copy has been reviewed. Keep draft markets here so routing
 * can safely render them without accidentally publishing them to search.
 */
export type SeoMarketCode =
  | "global-en"
  | "global-es"
  | "en-US"
  | "en-GB"
  | "ja-JP"
  | "de-DE"
  | "es-MX"
  | "es-ES"
  | "pt-BR"
  | "ko-KR"
  | "id";

export type SeoReleaseStatus = "draft" | "native-review" | "ready" | "indexable" | "paused";

export type SeoRouteLocale =
  | "en" | "id" | "es" | "fr" | "de" | "ja" | "ko" | "zh" | "pt" | "ru" | "it"
  | "en-US" | "en-GB" | "ja-JP" | "de-DE" | "es-MX" | "es-ES" | "pt-BR" | "ko-KR";

export type SeoPage = {
  path: string;
  cluster: "brand" | "conversion" | "timer" | "deep-work" | "study" | "music" | "creator";
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  lastModified: string;
};

export type SeoPageRelease = {
  path: SeoPage["path"];
  market: SeoMarketCode;
  locale: SeoRouteLocale;
  baseLanguage: string;
  cluster: SeoPage["cluster"];
  reviewer: string | null;
  reviewedAt: string | null;
  legalDependency: boolean;
  status: SeoReleaseStatus;
  contentUpdatedAt: string;
};

export const SEO_SITE_URL = "https://flow.virzyguns.com";

export const FOCUSED_MARKETS = ["en-US", "en-GB", "ja-JP", "de-DE", "es-MX", "es-ES", "pt-BR", "ko-KR"] as const satisfies readonly SeoMarketCode[];

/** Existing dictionary routes plus the Focused 8. The base routes remain public
 * fallback experiences, but only EN/ID reviewed releases are indexable today. */
export const ROUTABLE_LOCALES = [
  "en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it",
  "en-US", "en-GB", "ja-JP", "de-DE", "es-MX", "es-ES", "pt-BR", "ko-KR",
] as const satisfies readonly SeoRouteLocale[];

const MARKET_BY_LOCALE: Record<SeoMarketCode, { locale: SeoRouteLocale; baseLanguage: string }> = {
  "global-en": { locale: "en", baseLanguage: "en" },
  "global-es": { locale: "es", baseLanguage: "es" },
  "en-US": { locale: "en-US", baseLanguage: "en" },
  "en-GB": { locale: "en-GB", baseLanguage: "en" },
  "ja-JP": { locale: "ja-JP", baseLanguage: "ja" },
  "de-DE": { locale: "de-DE", baseLanguage: "de" },
  "es-MX": { locale: "es-MX", baseLanguage: "es" },
  "es-ES": { locale: "es-ES", baseLanguage: "es" },
  "pt-BR": { locale: "pt-BR", baseLanguage: "pt" },
  "ko-KR": { locale: "ko-KR", baseLanguage: "ko" },
  id: { locale: "id", baseLanguage: "id" },
};

const MARKET_FOR_LOCALE: Partial<Record<SeoRouteLocale, SeoMarketCode>> = Object.fromEntries(
  Object.entries(MARKET_BY_LOCALE).map(([market, value]) => [value.locale, market as SeoMarketCode])
);

const LEGACY_REGION_DESTINATIONS: Partial<Record<SeoRouteLocale, SeoRouteLocale>> = {
  ja: "ja-JP",
  de: "de-DE",
  pt: "pt-BR",
  ko: "ko-KR",
};

export const SEO_PAGES: readonly SeoPage[] = [
  { path: "", cluster: "brand", changeFrequency: "weekly", priority: 1, lastModified: "2026-07-19" },
  { path: "pricing", cluster: "conversion", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "deep-work-timer", cluster: "deep-work", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "study-timer", cluster: "study", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "pomodoro-timer-with-music", cluster: "music", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-19" },
  { path: "timer/25-5", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-19" },
  { path: "timer/50-10", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-19" },
  { path: "creator-music", cluster: "creator", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-19" },
  { path: "creator-music/city-pop", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "creator-music/cyberpunk-jazz", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "creator-music/neo-synthwave", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-19" },
  { path: "license", cluster: "creator", changeFrequency: "yearly", priority: 0.7, lastModified: "2026-07-19" },
];

export function isCreatorSeoPath(path: string) {
  return path === "license" || path === "creator-music" || path.startsWith("creator-music/");
}

function releaseFor(page: SeoPage, market: SeoMarketCode): SeoPageRelease {
  const marketConfig = MARKET_BY_LOCALE[market];
  const creatorOnlyEn = isCreatorSeoPath(page.path);
  const reviewed = market === "global-en" || (!creatorOnlyEn && market === "id");
  return {
    path: page.path,
    market,
    locale: marketConfig.locale,
    baseLanguage: marketConfig.baseLanguage,
    cluster: page.cluster,
    reviewer: reviewed ? "Flow editorial" : null,
    reviewedAt: reviewed ? page.lastModified : null,
    legalDependency: page.path === "license",
    // Every regional/catchall ES release is intentionally held at draft until
    // native reviewed copy is supplied. No dictionary fallback can promote it.
    status: reviewed ? "indexable" : "draft",
    contentUpdatedAt: page.lastModified,
  };
}

/**
 * Explicit records make an accidental global locale whitelist impossible.
 * The Focused 8 are present but draft, which keeps release ownership visible
 * while keeping them out of sitemap, hreflang, and index permission.
 */
export const SEO_PAGE_RELEASES: readonly SeoPageRelease[] = SEO_PAGES.flatMap((page) =>
  (Object.keys(MARKET_BY_LOCALE) as SeoMarketCode[])
    .filter((market) => !isCreatorSeoPath(page.path) || market === "global-en")
    .map((market) => releaseFor(page, market))
);

export function isSupportedSeoLocale(locale: string): locale is SeoRouteLocale {
  return (ROUTABLE_LOCALES as readonly string[]).includes(locale);
}

/** Converts a regional URL segment to the dictionary locale used to render it. */
export function baseLanguageForLocale(locale: string): string {
  if (isSupportedSeoLocale(locale)) return MARKET_FOR_LOCALE[locale]
    ? MARKET_BY_LOCALE[MARKET_FOR_LOCALE[locale]].baseLanguage
    : locale;
  return "en";
}

export function marketForLocale(locale: string): SeoMarketCode | undefined {
  return isSupportedSeoLocale(locale) ? MARKET_FOR_LOCALE[locale] : undefined;
}

export function isIndexableSeoPath(path: string) {
  return SEO_PAGES.some((page) => page.path === path);
}

export function releasesForPath(path: string): readonly SeoPageRelease[] {
  return SEO_PAGE_RELEASES.filter((release) => release.path === path);
}

export function indexableReleasesForPath(path: string): readonly SeoPageRelease[] {
  return releasesForPath(path).filter((release) => release.status === "indexable");
}

export function indexableLocalesForPath(path: string): readonly SeoRouteLocale[] {
  return indexableReleasesForPath(path).map((release) => release.locale);
}

/** Compatibility helper for metadata at the page root. */
export function isIndexableLocale(locale: string) {
  return shouldIndexSeoPage(locale, "");
}

export function shouldIndexSeoPage(locale: string, path: string) {
  return indexableReleasesForPath(path).some((release) => release.locale === locale);
}

export function localePath(locale: string, path = "") {
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  return `/${locale}${cleanPath ? `/${cleanPath}` : ""}`;
}

/** Hreflang graph generated from exactly the same release records as sitemap. */
export function indexableLanguageAlternates(path: string) {
  return Object.fromEntries(indexableLocalesForPath(path).map((locale) => [
    locale,
    `${SEO_SITE_URL}${localePath(locale, path)}`,
  ]));
}

export type SeoSitemapCandidate = {
  url: string;
  lastModified: Date;
  changeFrequency: SeoPage["changeFrequency"];
  priority: number;
  alternates: { languages: Record<string, string> };
};

/** Pure candidate builder used by the Next sitemap route and release tests. */
export function sitemapCandidates(baseUrl: string): SeoSitemapCandidate[] {
  return SEO_PAGES.flatMap(({ path, changeFrequency, priority, lastModified }) => {
    const languages = {
      ...indexableLanguageAlternates(path),
      "x-default": `${SEO_SITE_URL}${localePath("en", path)}`,
    };
    return indexableLocalesForPath(path).map((locale) => ({
      url: `${baseUrl}${localePath(locale, path)}`,
      lastModified: new Date(lastModified),
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}

/**
 * Redirect a legacy base route only after its regional destination is actually
 * indexable for that path. Before that the old route remains a useful,
 * directly-accessible noindex fallback instead of becoming a dead redirect.
 */
export function legacyLocaleRedirectDestination(locale: string, path: string): SeoRouteLocale | undefined {
  const destination = isSupportedSeoLocale(locale) ? LEGACY_REGION_DESTINATIONS[locale] : undefined;
  return destination && shouldIndexSeoPage(destination, path) ? destination : undefined;
}
