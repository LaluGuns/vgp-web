import assert from "node:assert/strict";
import test from "node:test";

import { jaKoMarketRouteCopy } from "../../lib/marketing/ja-ko-market-copy.ts";
import { getJaKoAlternativeCopy } from "../../lib/marketing/ja-ko-alternatives.ts";
import { SEO_PAGES } from "../../lib/marketing/seo-registry.ts";
import {
  creatorGenres,
  creatorLicenseCopy,
  creatorMusicCopy,
  creatorUiCopy,
} from "../../lib/creator-music/content.ts";

const LOCALES = [
  ["ja-JP", "ja", /[ぁ-んァ-ヶ一-龯]/u],
  ["ko-KR", "ko", /[가-힣]/u],
];

test("Japanese and Korean copy covers every SEO registry route", () => {
  for (const [locale, , nativeScript] of LOCALES) {
    for (const page of SEO_PAGES) {
      const copy = jaKoMarketRouteCopy(locale, page.path);
      assert.ok(copy, `${locale}:${page.path}:missing`);
      assert.match(copy.h1, nativeScript, `${locale}:${page.path}:native-h1`);
      assert.ok(copy.metaTitle.length <= 60, `${locale}:${page.path}:title-length`);
      assert.ok(copy.metaDescription.length <= 160, `${locale}:${page.path}:description-length`);
      assert.ok(copy.paragraphs.length >= 2, `${locale}:${page.path}:body`);
      assert.ok(copy.faq.length >= 2, `${locale}:${page.path}:faq`);
    }
  }
});

test("Japanese and Korean comparison pages localize the full decision surface", () => {
  for (const [locale] of LOCALES) {
    for (const slug of ["brainfm", "endel", "flocus", "pomofocus", "noisli"]) {
      const copy = getJaKoAlternativeCopy(locale, slug);
      assert.ok(copy, `${locale}:${slug}:missing`);
      assert.ok(copy.rows.length >= 5, `${locale}:${slug}:table`);
      assert.ok(copy.whenParagraphs.length >= 2, `${locale}:${slug}:honesty`);
      assert.ok(copy.faq.length >= 2, `${locale}:${slug}:faq`);
    }
  }
});

test("Japanese and Korean Creator Music copy preserves the controlling catalog and license", () => {
  for (const [locale, base] of LOCALES) {
    const genres = creatorGenres(base);
    const music = creatorMusicCopy(base);
    const license = creatorLicenseCopy(base);
    const ui = creatorUiCopy(locale);
    const text = JSON.stringify({ route: jaKoMarketRouteCopy(locale, "license"), genres, music, license, ui });

    assert.deepEqual(genres.map(({ genre }) => genre), ["City Pop", "Cyberpunk Jazz", "Neo Synthwave"]);
    for (const token of ["174", "49", "43", "82", "Lofi", "Flow Pro", "Content ID", "Spotify", "YouTube"]) {
      assert.match(text, new RegExp(token, "i"), `${locale}:${token}`);
    }
    assert.doesNotMatch(text, /royalty[- ]free|著作権フリー|저작권 무료/i, `${locale}:no-broader-rights-claim`);
  }
});
