import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  FOCUSED_MARKETS,
  SEO_PAGE_RELEASES,
  SEO_PAGES,
  createSeoReleaseManifest,
  indexableLanguageAlternates,
  indexableLanguageAlternatesForManifest,
  indexableLocalesForPath,
  sitemapCandidates,
  sitemapCandidatesForManifest,
} from "../../lib/marketing/seo-registry.ts";
import { marketRouteCopy } from "../../lib/marketing/market-copy.ts";
import { noIndexRouteMetadata } from "../../lib/marketing/route-metadata.ts";
import {
  FLOW_PRICING,
  STANDARD_ANNUAL_SAVINGS_PERCENT,
  priceCents,
  pricingJsonLdOffers,
} from "../../lib/pricing.ts";

test("every focused market has an honest AI-assisted indexable record for every SEO route", () => {
  assert.equal(SEO_PAGES.length, 17);
  for (const market of FOCUSED_MARKETS) {
    const releases = SEO_PAGE_RELEASES.filter((release) => release.market === market);
    assert.equal(releases.length, SEO_PAGES.length, market);
    for (const release of releases) {
      assert.equal(release.status, "indexable", `${market}:${release.path}`);
      assert.match(release.reviewer ?? "", /AI-assisted editorial QA/, `${market}:${release.path}`);
      if (release.legalDependency) assert.match(release.legalReviewer ?? "", /policy consistency QA/, `${market}:${release.path}`);
    }
  }
});

test("focused regional releases enter the sitemap and reciprocal hreflang graph", () => {
  const urls = sitemapCandidates("https://flow.virzyguns.com").map((entry) => entry.url);
  assert.equal(urls.length, 160);
  for (const market of FOCUSED_MARKETS) {
    assert.ok(urls.includes(`https://flow.virzyguns.com/${market}`), market);
    assert.ok(urls.includes(`https://flow.virzyguns.com/${market}/alternatives/brainfm`), market);
  }
  assert.ok(urls.includes("https://flow.virzyguns.com/en/alternatives/brainfm"));
  assert.deepEqual(indexableLocalesForPath("deep-work-timer"), ["en", ...FOCUSED_MARKETS, "id"]);
  const deepWorkAlternates = indexableLanguageAlternates("deep-work-timer");
  assert.equal(Object.keys(deepWorkAlternates).length, 10);
  assert.equal(deepWorkAlternates.en, "https://flow.virzyguns.com/en/deep-work-timer");
  assert.equal(deepWorkAlternates.id, "https://flow.virzyguns.com/id/deep-work-timer");
  for (const market of FOCUSED_MARKETS) {
    assert.equal(deepWorkAlternates[market], `https://flow.virzyguns.com/${market}/deep-work-timer`);
  }
  assert.deepEqual(indexableLocalesForPath("alternatives/brainfm"), ["en", ...FOCUSED_MARKETS]);
});

test("a promotion enters sitemap and hreflang only after its required reviews", () => {
  const incomplete = createSeoReleaseManifest({
    "ja-JP": {
      "deep-work-timer": {
        status: "indexable",
        reviewer: null,
        reviewedAt: null,
        legalReviewer: null,
        legalReviewedAt: null,
        note: "Attempted release without review.",
      },
    },
  });
  assert.equal(incomplete["ja-JP"]["deep-work-timer"].status, "native-review");

  const approved = createSeoReleaseManifest({
    "ja-JP": {
      "deep-work-timer": {
        status: "indexable",
        reviewer: "AI-assisted Japanese editorial QA",
        reviewedAt: "2026-07-22",
        legalReviewer: null,
        legalReviewedAt: null,
        note: "AI-assisted Japanese copy QA completed.",
      },
    },
  });
  assert.equal(approved["ja-JP"]["deep-work-timer"].status, "indexable");
  assert.equal(
    indexableLanguageAlternatesForManifest(approved, "deep-work-timer")["ja-JP"],
    "https://flow.virzyguns.com/ja-JP/deep-work-timer"
  );
  assert.ok(
    sitemapCandidatesForManifest("https://flow.virzyguns.com", approved)
      .some((entry) => entry.url === "https://flow.virzyguns.com/ja-JP/deep-work-timer")
  );

  const creatorWithoutLegalReview = createSeoReleaseManifest({
    "ja-JP": {
      "creator-music": {
        status: "indexable",
        reviewer: "AI-assisted Japanese editorial QA",
        reviewedAt: "2026-07-22",
        legalReviewer: null,
        legalReviewedAt: null,
        note: "Editorial QA complete, policy consistency QA missing.",
      },
    },
  });
  assert.equal(creatorWithoutLegalReview["ja-JP"]["creator-music"].status, "native-review");
});

test("every regional market route has localized metadata, H1, body copy, and FAQs", () => {
  for (const market of FOCUSED_MARKETS) {
    for (const page of SEO_PAGES) {
      const copy = marketRouteCopy(market, page.path);
      assert.ok(copy, `${market}:${page.path}`);
      assert.ok(copy.metaTitle.length > 12, `${market}:${page.path}:title`);
      assert.ok(copy.metaDescription.length > 40, `${market}:${page.path}:description`);
      assert.ok(copy.h1.length > 4, `${market}:${page.path}:h1`);
      assert.ok(copy.paragraphs.length >= 2, `${market}:${page.path}:paragraphs`);
      assert.ok(copy.faq.length >= 2, `${market}:${page.path}:faq`);
      if (page.legalDependency) assert.ok(copy.legalReviewNotice, `${market}:${page.path}:legal-notice`);
    }
  }
});

test("US and UK releases have distinct route copy and exact creator-license boundaries", () => {
  for (const page of SEO_PAGES) {
    const us = marketRouteCopy("en-US", page.path);
    const uk = marketRouteCopy("en-GB", page.path);
    assert.ok(us, `en-US:${page.path}`);
    assert.ok(uk, `en-GB:${page.path}`);
    assert.notEqual(us.h1, uk.h1, `${page.path}:h1`);
    assert.notDeepEqual(us.paragraphs, uk.paragraphs, `${page.path}:body`);
    assert.ok(us.metaTitle.length <= 65, `${page.path}:en-US:title-length`);
    assert.ok(uk.metaTitle.length <= 65, `${page.path}:en-GB:title-length`);
    assert.ok(us.metaDescription.length <= 165, `${page.path}:en-US:description-length`);
    assert.ok(uk.metaDescription.length <= 165, `${page.path}:en-GB:description-length`);
  }

  for (const locale of ["en-US", "en-GB"]) {
    const license = marketRouteCopy(locale, "license");
    assert.ok(license, `${locale}:license`);
    const text = [...license.paragraphs, ...license.faq.flatMap(({ q, a }) => [q, a])].join(" ");
    for (const [term, pattern] of [
      ["174", /174/i], ["49", /49/i], ["43", /43/i], ["82", /82/i],
      ["Lofi", /Lofi/i], ["active Pro", /active Pro/i], ["attribution", /attribution/i],
      ["nonexclusive", /non-?exclusive/i], ["nontransferable", /non-?transferable/i],
      ["standalone redistribution", /standalone redistribution/i],
      ["Content ID", /Content ID/i], ["Spotify", /Spotify/i], ["YouTube", /YouTube/i],
    ]) {
      assert.match(text, pattern, `${locale}:license:${term}`);
    }
  }
});

test("private routes self-canonicalize without inherited hreflang", () => {
  const metadata = noIndexRouteMetadata("ja-JP", "app");
  assert.equal(metadata.alternates?.canonical, "/ja-JP/app");
  assert.deepEqual(metadata.alternates?.languages, {});
  assert.equal(metadata.robots?.index, false);
  assert.equal(metadata.robots?.follow, false);

  const verification = noIndexRouteMetadata("ja-JP", "license/verify/grant-123");
  assert.equal(verification.alternates?.canonical, "/ja-JP/license/verify/grant-123");
  assert.deepEqual(verification.alternates?.languages, {});
});

test("public price data and schema offers share one exact source", () => {
  assert.equal(FLOW_PRICING.currency, "USD");
  assert.equal(priceCents("monthly"), 999);
  assert.equal(priceCents("yearly"), 5999);
  assert.equal(STANDARD_ANNUAL_SAVINGS_PERCENT, 50);
  assert.deepEqual(pricingJsonLdOffers().map((offer) => offer.price), ["9.99", "59.99"]);
});

test("90/15 copy is practical rather than an ultradian claim", async () => {
  const [deepWork, timers] = await Promise.all([
    readFile(new URL("../../lib/translations/pages/deep-work-timer.ts", import.meta.url), "utf8"),
    readFile(new URL("../../lib/translations/pages/timers.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(deepWork, /ultradian/i);
  assert.doesNotMatch(timers, /ultradian/i);
  assert.match(deepWork, /practical preset|preset praktis/i);
  assert.match(timers, /practical workflow choice|pilihan workflow praktis/i);
});
