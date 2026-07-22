import assert from "node:assert/strict";
import test from "node:test";
import {
  baseLanguageForLocale,
  indexableLanguageAlternates,
  indexableLocalesForPath,
  legacyLocaleRedirectDestination,
  sitemapCandidates,
  shouldIndexSeoPage,
} from "../../lib/marketing/seo-registry.ts";

test("maps every Focused 8 route to its safe base-language dictionary", () => {
  assert.equal(baseLanguageForLocale("en-US"), "en");
  assert.equal(baseLanguageForLocale("en-GB"), "en");
  assert.equal(baseLanguageForLocale("ja-JP"), "ja");
  assert.equal(baseLanguageForLocale("de-DE"), "de");
  assert.equal(baseLanguageForLocale("es-MX"), "es");
  assert.equal(baseLanguageForLocale("es-ES"), "es");
  assert.equal(baseLanguageForLocale("pt-BR"), "pt");
  assert.equal(baseLanguageForLocale("ko-KR"), "ko");
});

test("only release-registry-approved routes can be indexed", () => {
  assert.equal(shouldIndexSeoPage("en", "deep-work-timer"), true);
  assert.equal(shouldIndexSeoPage("id", "deep-work-timer"), true);
  assert.equal(shouldIndexSeoPage("ja-JP", "creator-music/city-pop"), true);
  assert.equal(shouldIndexSeoPage("en-US", "deep-work-timer"), true);
  assert.equal(shouldIndexSeoPage("es", "pricing"), false);
  assert.equal(shouldIndexSeoPage("fr", "pricing"), false);
  assert.equal(shouldIndexSeoPage("en", "creator-music/city-pop"), true);
  assert.equal(shouldIndexSeoPage("id", "creator-music/city-pop"), false);
});

test("hreflang graph includes only reciprocal, indexable variants", () => {
  const languages = indexableLanguageAlternates("deep-work-timer");
  assert.equal(Object.keys(languages).length, 10);
  assert.equal(languages.en, "https://flow.virzyguns.com/en/deep-work-timer");
  assert.equal(languages.id, "https://flow.virzyguns.com/id/deep-work-timer");
  assert.deepEqual(indexableLocalesForPath("creator-music"), ["en", "en-US", "en-GB", "ja-JP", "de-DE", "es-MX", "es-ES", "pt-BR", "ko-KR"]);
});

test("sitemap candidates and legacy redirects follow activated country releases", () => {
  const urls = sitemapCandidates("https://flow.virzyguns.com").map((item) => item.url);
  assert.ok(urls.includes("https://flow.virzyguns.com/en/deep-work-timer"));
  assert.ok(urls.includes("https://flow.virzyguns.com/id/deep-work-timer"));
  assert.ok(urls.includes("https://flow.virzyguns.com/ja-JP"));
  assert.ok(urls.includes("https://flow.virzyguns.com/es-MX/pricing"));
  assert.equal(urls.length, 160);
  assert.equal(
    sitemapCandidates("https://flow.virzyguns.com")[0].alternates.languages["x-default"],
    "https://flow.virzyguns.com/en"
  );
  assert.equal(legacyLocaleRedirectDestination("ja", "creator-music/city-pop"), "ja-JP");
  assert.equal(legacyLocaleRedirectDestination("de", "deep-work-timer"), "de-DE");
});
