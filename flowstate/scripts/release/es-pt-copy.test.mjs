import assert from "node:assert/strict";
import test from "node:test";

import {
  ES_PT_MARKET_PATHS,
  esPtMarketRouteCopy,
  esPtMarketSharedCopy,
} from "../../lib/marketing/es-pt-market-copy.ts";
import { getEsPtAlternativeCopy } from "../../lib/marketing/es-pt-alternatives.ts";
import {
  esPtCreatorGenres,
  esPtCreatorLicenseCopy,
  esPtCreatorMusicCopy,
  esPtCreatorUiCopy,
  esPtPomodoroMusicCopy,
  esPtPricingCopy,
} from "../../lib/marketing/es-pt-visible-copy.ts";

const locales = ["es-MX", "es-ES", "pt-BR"];
const alternativeSlugs = ["brainfm", "endel", "flocus", "pomofocus", "noisli"];

function normalizedWords(value) {
  return new Set(
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? [],
  );
}

function jaccardSimilarity(left, right) {
  const intersection = [...left].filter((word) => right.has(word)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 1 : intersection / union;
}

test("Spanish and Brazilian Portuguese copy covers all 17 approved routes", () => {
  assert.equal(ES_PT_MARKET_PATHS.length, 17);
  for (const locale of locales) {
    assert.ok(esPtMarketSharedCopy(locale), locale);
    for (const path of ES_PT_MARKET_PATHS) {
      const copy = esPtMarketRouteCopy(locale, path);
      assert.ok(copy, `${locale}:${path}`);
      assert.ok(copy.metaTitle.length > 12, `${locale}:${path}:metaTitle`);
      assert.ok(copy.metaDescription.length > 40, `${locale}:${path}:metaDescription`);
      assert.ok(copy.paragraphs.length >= 2, `${locale}:${path}:paragraphs`);
      assert.ok(copy.faq.length >= 2, `${locale}:${path}:faq`);
    }
  }
});

test("rich alternative sections are localized and complete", () => {
  for (const locale of locales) {
    for (const slug of alternativeSlugs) {
      const copy = getEsPtAlternativeCopy(locale, slug);
      assert.ok(copy, `${locale}:${slug}`);
      assert.ok(copy.rows.length >= 6, `${locale}:${slug}:rows`);
      assert.ok(copy.whenParagraphs.length >= 2, `${locale}:${slug}:when`);
      assert.doesNotMatch(`${copy.tableHeading} ${copy.whenHeading}`, /side by side|when .*right|comparison table/i);
    }
  }
});

test("creator and Pomodoro visible-field overrides preserve catalogue policy", () => {
  for (const locale of locales) {
    const root = esPtCreatorMusicCopy(locale);
    const genres = esPtCreatorGenres(locale);
    const license = esPtCreatorLicenseCopy(locale);
    assert.ok(root && genres && license && esPtCreatorUiCopy(locale) && esPtPricingCopy(locale));
    assert.equal(genres.length, 3);
    assert.deepEqual(genres.map((item) => item.genre), ["City Pop", "Cyberpunk Jazz", "Neo Synthwave"]);
    assert.match(`${root.intro} ${license.intro}`, /174/);
    assert.match(root.intro, /49/);
    assert.match(root.intro, /43/);
    assert.match(root.intro, /82/);
    assert.match(root.intro, /Lofi/);
    assert.match(license.finePrint, /Spotify/);
    assert.match(license.finePrint, /YouTube/);
    assert.match(license.notAllowed.join(" "), /Content ID/);
    assert.ok(esPtPomodoroMusicCopy(locale)?.musicParagraphs.length >= 2);
  }
});

test("Mexico and Spain are editorially distinct", () => {
  for (const path of ES_PT_MARKET_PATHS) {
    const mexico = esPtMarketRouteCopy("es-MX", path);
    const spain = esPtMarketRouteCopy("es-ES", path);
    assert.ok(mexico && spain, path);
    assert.notDeepEqual(spain.paragraphs, mexico.paragraphs, `${path}: body copy must be market-specific`);
    assert.notDeepEqual(spain.faq, mexico.faq, `${path}: FAQ copy must be market-specific`);
  }

  for (const slug of alternativeSlugs) {
    const mexico = getEsPtAlternativeCopy("es-MX", slug);
    const spain = getEsPtAlternativeCopy("es-ES", slug);
    assert.ok(mexico && spain, slug);
    assert.notDeepEqual(spain.rows, mexico.rows, `${slug}: comparison rows must be market-specific`);

    const mexicoTable = JSON.stringify(mexico.rows);
    const spainTable = JSON.stringify(spain.rows);
    const similarity = jaccardSimilarity(normalizedWords(mexicoTable), normalizedWords(spainTable));
    assert.ok(similarity < 0.72, `${slug}: comparison table is too similar across markets (${similarity.toFixed(2)})`);
  }

  assert.notEqual(esPtPricingCopy("es-MX")?.promoPlaceholder, esPtPricingCopy("es-ES")?.promoPlaceholder);
  assert.notEqual(esPtCreatorUiCopy("es-MX")?.checking, esPtCreatorUiCopy("es-ES")?.checking);
});

test("visible copy avoids English leakage and preserves licence boundaries", () => {
  const spanish = ES_PT_MARKET_PATHS.flatMap((path) => {
    const mexico = esPtMarketRouteCopy("es-MX", path);
    const spain = esPtMarketRouteCopy("es-ES", path);
    return [mexico, spain];
  });
  const visible = [
    ...spanish,
    ...locales.flatMap((locale) => [
      esPtCreatorMusicCopy(locale),
      esPtCreatorGenres(locale),
      esPtCreatorLicenseCopy(locale),
      esPtPomodoroMusicCopy(locale),
    ]),
    ...locales.flatMap((locale) => alternativeSlugs.map((slug) => getEsPtAlternativeCopy(locale, slug))),
  ];
  const serialized = JSON.stringify(visible);
  const withoutDefinedRecord = serialized.replaceAll("Grant Record", "");
  assert.doesNotMatch(withoutDefinedRecord, /\b(?:grant|grants|stream|streams|preset|presets|gaming|games|stock)\b|motion graphics|crescendos/i);

  for (const locale of locales) {
    const license = esPtCreatorLicenseCopy(locale);
    assert.ok(license, locale);
    const policy = JSON.stringify(license);
    assert.match(policy, /174/);
    assert.match(policy, /Lofi/);
    assert.match(policy, /Content ID/);
    assert.match(policy, /Flow Pro activo|Flow Pro active|Flow Pro ativo/i);
    assert.match(policy, /atribuci[oó]n|atribui[cç][aã]o/i);
    assert.match(policy, /pel[ií]cula|filme/i);
    assert.match(policy, /videojuego|videogame/i);
    assert.match(policy, /cliente/i);
    assert.match(policy, /licencia escrita independiente|licen[cç]a escrita independente/i);
  }
});
