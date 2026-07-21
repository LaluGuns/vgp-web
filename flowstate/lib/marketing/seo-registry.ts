/**
 * The public SEO release registry.
 *
 * A rendered route is not automatically a search release. This manifest is
 * the single source of truth for the native-copy/legal-review gate, metadata,
 * hreflang and sitemap output. Promote a record only after the reviewer named
 * on that record has approved the deployed copy.
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

export type SeoPageCluster =
  | "brand"
  | "conversion"
  | "timer"
  | "deep-work"
  | "study"
  | "music"
  | "creator"
  | "comparison";

export type SeoPage = {
  path: string;
  cluster: SeoPageCluster;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
  lastModified: string;
};

export type SeoReleaseDecision = {
  status: SeoReleaseStatus;
  reviewer: string | null;
  reviewedAt: string | null;
  legalReviewer: string | null;
  legalReviewedAt: string | null;
  note: string;
};

export type SeoPageRelease = SeoReleaseDecision & {
  path: SeoPage["path"];
  market: SeoMarketCode;
  locale: SeoRouteLocale;
  baseLanguage: string;
  cluster: SeoPageCluster;
  legalDependency: boolean;
  contentUpdatedAt: string;
};

export type SeoReleasePromotions = Readonly<
  Partial<Record<SeoMarketCode, Readonly<Record<string, SeoReleaseDecision>>>>
>;

export type SeoReleaseManifest = Readonly<
  Record<SeoMarketCode, Readonly<Record<string, SeoReleaseDecision>>>
>;

export const SEO_SITE_URL = "https://flow.virzyguns.com";

export const FOCUSED_MARKETS = [
  "en-US",
  "en-GB",
  "ja-JP",
  "de-DE",
  "es-MX",
  "es-ES",
  "pt-BR",
  "ko-KR",
] as const satisfies readonly SeoMarketCode[];

export type FocusedMarketLocale = (typeof FOCUSED_MARKETS)[number];

/** Existing dictionary routes plus country-specific destinations. */
export const ROUTABLE_LOCALES = [
  "en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it",
  ...FOCUSED_MARKETS,
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

/** The 12 original acquisition pages plus the five honest competitor comparisons. */
export const SEO_PAGES: readonly SeoPage[] = [
  { path: "", cluster: "brand", changeFrequency: "weekly", priority: 1, lastModified: "2026-07-21" },
  { path: "pricing", cluster: "conversion", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "deep-work-timer", cluster: "deep-work", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "study-timer", cluster: "study", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "pomodoro-timer-with-music", cluster: "music", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-21" },
  { path: "timer/25-5", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-21" },
  { path: "timer/50-10", cluster: "timer", changeFrequency: "monthly", priority: 0.7, lastModified: "2026-07-21" },
  { path: "creator-music", cluster: "creator", changeFrequency: "monthly", priority: 0.9, lastModified: "2026-07-21" },
  { path: "creator-music/city-pop", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "creator-music/cyberpunk-jazz", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "creator-music/neo-synthwave", cluster: "creator", changeFrequency: "monthly", priority: 0.8, lastModified: "2026-07-21" },
  { path: "license", cluster: "creator", changeFrequency: "yearly", priority: 0.7, lastModified: "2026-07-21" },
  { path: "alternatives/brainfm", cluster: "comparison", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-07-21" },
  { path: "alternatives/endel", cluster: "comparison", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-07-21" },
  { path: "alternatives/flocus", cluster: "comparison", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-07-21" },
  { path: "alternatives/pomofocus", cluster: "comparison", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-07-21" },
  { path: "alternatives/noisli", cluster: "comparison", changeFrequency: "monthly", priority: 0.6, lastModified: "2026-07-21" },
];

export function isCreatorSeoPath(path: string) {
  return path === "license" || path === "creator-music" || path.startsWith("creator-music/");
}

function decision(
  status: SeoReleaseStatus,
  note: string,
  reviewer: string | null = null,
  reviewedAt: string | null = null,
  legalReviewer: string | null = null,
  legalReviewedAt: string | null = null
): SeoReleaseDecision {
  return { status, note, reviewer, reviewedAt, legalReviewer, legalReviewedAt };
}

/**
 * Per-page promotion records. Keep this empty until a named native reviewer
 * approves the market copy; creator and licence pages also require the legal
 * reviewer fields. This makes review promotion a small, auditable diff.
 */
export const SEO_RELEASE_PROMOTIONS: SeoReleasePromotions = {};

function reviewGatedPromotion(page: SeoPage, promotion: SeoReleaseDecision): SeoReleaseDecision {
  if (promotion.status !== "indexable") return promotion;

  if (!promotion.reviewer || !promotion.reviewedAt) {
    return decision(
      "native-review",
      "An indexable promotion needs a named native reviewer and review date before release."
    );
  }

  if (isCreatorSeoPath(page.path) && (!promotion.legalReviewer || !promotion.legalReviewedAt)) {
    return decision(
      "native-review",
      "Creator Music and License promotions need named native and legal reviewers before release.",
      promotion.reviewer,
      promotion.reviewedAt
    );
  }

  return promotion;
}

function decisionForPage(
  page: SeoPage,
  market: SeoMarketCode,
  promotions: SeoReleasePromotions
): SeoReleaseDecision {
  const promotion = promotions[market]?.[page.path];
  if (promotion) return reviewGatedPromotion(page, promotion);
  if (market === "global-en") {
    return decision("indexable", "Published English source copy.", "Flow editorial", page.lastModified,
      isCreatorSeoPath(page.path) ? "Flow legal" : null,
      isCreatorSeoPath(page.path) ? page.lastModified : null);
  }

  if (market === "id" && !isCreatorSeoPath(page.path) && page.cluster !== "comparison") {
    return decision("indexable", "Published Indonesian source copy.", "Flow editorial", page.lastModified);
  }

  if ((FOCUSED_MARKETS as readonly string[]).includes(market)) {
    return decision(
      "native-review",
      isCreatorSeoPath(page.path)
        ? "Localized creator/licence summary is drafted; native and legal review are required before indexing."
        : "Localized market copy is drafted; native review is required before indexing."
    );
  }

  return decision("draft", "No native market copy has been approved for search release.");
}

/**
 * Explicit page × market review manifest. The status is never inferred from a
 * route or dictionary fallback: this is the only promotion switch that feeds
 * canonical clusters and the sitemap.
 */
export function createSeoReleaseManifest(promotions: SeoReleasePromotions = SEO_RELEASE_PROMOTIONS): SeoReleaseManifest {
  return (
  Object.fromEntries(
    (Object.keys(MARKET_BY_LOCALE) as SeoMarketCode[]).map((market) => [
      market,
      Object.fromEntries(SEO_PAGES.map((page) => [page.path, decisionForPage(page, market, promotions)])),
    ])
  ) as SeoReleaseManifest
  );
}

export const SEO_RELEASE_MANIFEST = createSeoReleaseManifest();

export function pageReleasesForManifest(manifest: SeoReleaseManifest): readonly SeoPageRelease[] {
  return SEO_PAGES.flatMap((page) =>
  (Object.keys(MARKET_BY_LOCALE) as SeoMarketCode[]).map((market) => {
    const marketConfig = MARKET_BY_LOCALE[market];
    const release = manifest[market][page.path];
    return {
      ...release,
      path: page.path,
      market,
      locale: marketConfig.locale,
      baseLanguage: marketConfig.baseLanguage,
      cluster: page.cluster,
      legalDependency: isCreatorSeoPath(page.path),
      contentUpdatedAt: page.lastModified,
    };
  })
);
}

export const SEO_PAGE_RELEASES = pageReleasesForManifest(SEO_RELEASE_MANIFEST);

export function isSupportedSeoLocale(locale: string): locale is SeoRouteLocale {
  return (ROUTABLE_LOCALES as readonly string[]).includes(locale);
}

export function isFocusedMarketLocale(locale: string): locale is FocusedMarketLocale {
  return (FOCUSED_MARKETS as readonly string[]).includes(locale);
}

/** Converts a regional URL segment to the dictionary locale used to render app UI. */
export function baseLanguageForLocale(locale: string): string {
  if (isSupportedSeoLocale(locale)) {
    const market = MARKET_FOR_LOCALE[locale];
    return market ? MARKET_BY_LOCALE[market].baseLanguage : locale;
  }
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

export function releaseFor(locale: string, path: string): SeoPageRelease | undefined {
  return releasesForPath(path).find((release) => release.locale === locale);
}

export function indexableReleasesForPath(path: string): readonly SeoPageRelease[] {
  return releasesForPath(path).filter((release) => release.status === "indexable");
}

export function indexableLocalesForPath(path: string): readonly SeoRouteLocale[] {
  return indexableLocalesForManifest(SEO_RELEASE_MANIFEST, path);
}

export function indexableLocalesForManifest(manifest: SeoReleaseManifest, path: string): readonly SeoRouteLocale[] {
  return (Object.keys(MARKET_BY_LOCALE) as SeoMarketCode[])
    .filter((market) => manifest[market][path]?.status === "indexable")
    .map((market) => MARKET_BY_LOCALE[market].locale);
}

export function isIndexableLocale(locale: string) {
  return shouldIndexSeoPage(locale, "");
}

export function shouldIndexSeoPage(locale: string, path: string) {
  return releaseFor(locale, path)?.status === "indexable";
}

export function localePath(locale: string, path = "") {
  const cleanPath = path.replace(/^\/+|\/+$/g, "");
  return `/${locale}${cleanPath ? `/${cleanPath}` : ""}`;
}

/** Hreflang graph generated from exactly the same release records as sitemap. */
export function indexableLanguageAlternates(path: string) {
  return indexableLanguageAlternatesForManifest(SEO_RELEASE_MANIFEST, path);
}

export function indexableLanguageAlternatesForManifest(manifest: SeoReleaseManifest, path: string) {
  return Object.fromEntries(indexableLocalesForManifest(manifest, path).map((locale) => [
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
export function sitemapCandidatesForManifest(baseUrl: string, manifest: SeoReleaseManifest): SeoSitemapCandidate[] {
  return SEO_PAGES.flatMap(({ path, changeFrequency, priority, lastModified }) => {
    const languages = {
      ...indexableLanguageAlternatesForManifest(manifest, path),
      "x-default": `${SEO_SITE_URL}${localePath("en", path)}`,
    };
    return indexableLocalesForManifest(manifest, path).map((locale) => ({
      url: `${baseUrl}${localePath(locale, path)}`,
      lastModified: new Date(lastModified),
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}

export function sitemapCandidates(baseUrl: string): SeoSitemapCandidate[] {
  return sitemapCandidatesForManifest(baseUrl, SEO_RELEASE_MANIFEST);
}

/** Redirect a legacy base route only after its regional destination is indexable. */
export function legacyLocaleRedirectDestination(locale: string, path: string): SeoRouteLocale | undefined {
  const destination = isSupportedSeoLocale(locale) ? LEGACY_REGION_DESTINATIONS[locale] : undefined;
  return destination && shouldIndexSeoPage(destination, path) ? destination : undefined;
}
