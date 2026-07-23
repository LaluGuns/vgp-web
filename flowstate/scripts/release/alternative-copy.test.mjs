import assert from "node:assert/strict";
import test from "node:test";

import { getBrainfmCopy } from "../../lib/translations/pages/alternatives/brainfm.ts";
import { getEndelCopy } from "../../lib/translations/pages/alternatives/endel.ts";
import { getFlocusCopy } from "../../lib/translations/pages/alternatives/flocus.ts";
import { getNoisliCopy } from "../../lib/translations/pages/alternatives/noisli.ts";
import { getPomofocusCopy } from "../../lib/translations/pages/alternatives/pomofocus.ts";
import { getJaKoAlternativeCopy } from "../../lib/marketing/ja-ko-alternatives.ts";

const ALTERNATIVE_SLUGS = ["brainfm", "endel", "flocus", "pomofocus", "noisli"];
const baseGetters = {
  brainfm: getBrainfmCopy,
  endel: getEndelCopy,
  flocus: getFlocusCopy,
  pomofocus: getPomofocusCopy,
  noisli: getNoisliCopy,
};

const localeCases = [
  ["en", (slug) => baseGetters[slug]("en"), /check .*current/i],
  ["id", (slug) => baseGetters[slug]("id"), /cek .*saat ini/i],
  ["ja-JP", (slug) => getJaKoAlternativeCopy("ja-JP", slug), /現在.*確認/u],
  ["ko-KR", (slug) => getJaKoAlternativeCopy("ko-KR", slug), /현재.*확인/u],
];

const unsupportedCompetitorClaims = [
  /[$£€¥₩]\s*\d|\d+(?:\.\d+)?\s*(?:\/\s*(?:mo|yr)|per month)/i,
  /\btrial\b|トライアル|체험 후|uji coba/i,
  /heart[ -]?rate|detak jantung|心拍|심박/i,
  /better than anyone|more granular than .* ever|at any price|lebih baik dari siapa pun|harga berapa pun/i,
];

test("rich EN, ID, JA, and KO alternative copy avoids unsupported competitor claims", () => {
  for (const [locale, getCopy, currentOfferPattern] of localeCases) {
    for (const slug of ALTERNATIVE_SLUGS) {
      const copy = getCopy(slug);
      assert.ok(copy, `${locale}:${slug}:missing`);
      assert.ok(copy.intro.length >= 2, `${locale}:${slug}:intro`);
      assert.ok(copy.rows.length >= 5, `${locale}:${slug}:rows`);
      assert.ok(copy.whenParagraphs.length >= 2, `${locale}:${slug}:when`);
      assert.ok(copy.faq.length >= 3, `${locale}:${slug}:faq`);

      const competitorClaims = JSON.stringify({
        intro: copy.intro,
        them: copy.rows.map((row) => row.them),
        when: copy.whenParagraphs,
      });
      assert.match(competitorClaims, currentOfferPattern, `${locale}:${slug}:provider-current-offer`);
      for (const pattern of unsupportedCompetitorClaims) {
        assert.doesNotMatch(competitorClaims, pattern, `${locale}:${slug}:${pattern}`);
      }
    }
  }
});

test("every rich alternative states the complete Flow Creator Music boundary", () => {
  const required = [
    /174/,
    /Pro/i,
    /Grant Record/i,
    /Spotify/i,
    /YouTube/i,
    /Attribution|Atribusi|表示義務|저작자 표시/iu,
    /published terms|ketentuan terbit|公開規約|공개 약관/iu,
    /Not included in Free|Tidak termasuk Free|Freeには含まれません|Free에는 포함되지 않습니다/iu,
  ];

  for (const [locale, getCopy] of localeCases) {
    for (const slug of ALTERNATIVE_SLUGS) {
      const copy = getCopy(slug);
      const licenseRow = copy.rows.find((row) => /Creator license|Lisensi kreator|クリエイターライセンス|크리에이터 라이선스/iu.test(row.feature));
      assert.ok(licenseRow, `${locale}:${slug}:license-row`);

      const creatorFaq = copy.faq.find(({ a }) => /Creator Music/u.test(a));
      assert.ok(creatorFaq, `${locale}:${slug}:creator-faq`);
      const licenseText = `${licenseRow.flow} ${creatorFaq.a}`;
      for (const pattern of required) {
        assert.match(licenseText, pattern, `${locale}:${slug}:${pattern}`);
      }
      assert.match(
        licenseText,
        /every new download\/license|setiap download\/lisensi baru|新しいダウンロードまたはライセンスごと|새 다운로드 또는 라이선스마다/iu,
        `${locale}:${slug}:new-grant-needs-active-pro`,
      );
      assert.match(
        licenseText,
        /grants no creator rights|tidak memberi hak kreator|クリエイター利用権は得られません|크리에이터 이용 권한이 생기지 않습니다/iu,
        `${locale}:${slug}:listening-is-not-clearance`,
      );
    }
  }
});
