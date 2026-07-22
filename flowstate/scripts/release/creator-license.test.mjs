import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CREATOR_CONTRACT_2026_07_21,
  CREATOR_CONTRACT_V1_HISTORICAL,
  CREATOR_RIGHTS_VERIFIED_AT,
  CREATOR_TERMS_DOCUMENT_SHA256,
  CREATOR_TERMS_DOCUMENT_VERSION,
  getCreatorContractSpec,
} from "../../lib/creator-license/contract-v1.ts";
import {
  CREATOR_CATALOG_VERSION,
  CREATOR_GENRES,
  CREATOR_TERMS_VERSION,
  isCreatorGenre,
  safeCreatorCertificateFilename,
  safeCreatorDownloadFilename,
  selectActiveCreatorPlan,
  validateCreatorLicenseAcceptance,
  validateLicenseeName,
} from "../../lib/creator-license/policy.ts";
import { generateLicenseCertificatePdf } from "../../lib/creator-license/pdf.ts";
import { CREATOR_ATTRIBUTION } from "../../lib/creator-music/content.ts";

const appRoot = new URL("../../", import.meta.url);

test("creator catalog is exactly the three approved genres and 174 tracks", async () => {
  const raw = JSON.parse(await readFile(new URL("public/tracks/catalog.json", appRoot), "utf8"));
  const creator = raw.filter((track) => isCreatorGenre(track.genre));
  const counts = Object.fromEntries(
    CREATOR_GENRES.map((genre) => [genre, creator.filter((track) => track.genre === genre).length])
  );

  assert.deepEqual(counts, {
    "City Pop": 49,
    "Cyberpunk Jazz": 43,
    "Neo Synthwave": 82,
  });
  assert.equal(creator.length, 174);
  assert.equal(creator.some((track) => /^Lofi /.test(track.genre)), false);
  assert.equal(creator.some((track) => track.isPremium === false), true);
  assert.equal(CREATOR_RIGHTS_VERIFIED_AT, "2026-07-21");
});

test("new grants require a currently active canonical subscription", () => {
  const now = Date.parse("2026-07-21T00:00:00.000Z");
  assert.equal(selectActiveCreatorPlan([], now), null);
  assert.deepEqual(
    selectActiveCreatorPlan([
      { id: "monthly-1", status: "active", plan: "monthly", current_period_end: "2026-08-21T00:00:00.000Z" },
    ], now),
    { plan: "monthly", subscriptionId: "monthly-1" }
  );
  assert.deepEqual(
    selectActiveCreatorPlan([{ id: "life-1", status: "active", plan: "lifetime" }], now),
    { plan: "lifetime", subscriptionId: "life-1" }
  );
  assert.equal(
    selectActiveCreatorPlan([
      { status: "cancelled", plan: "yearly", current_period_end: "2027-01-01T00:00:00.000Z" },
    ], now),
    null
  );
  assert.equal(
    selectActiveCreatorPlan([
      { status: "active", plan: "monthly", current_period_end: "2026-07-20T00:00:00.000Z" },
    ], now),
    null
  );
});

test("clickwrap rejects missing or non-explicit acceptance", () => {
  assert.deepEqual(validateCreatorLicenseAcceptance(null), {
    ok: false,
    code: "terms_acceptance_required",
  });
  assert.deepEqual(
    validateCreatorLicenseAcceptance({
      acceptTerms: false,
      termsVersion: CREATOR_TERMS_VERSION,
      catalogVersion: CREATOR_CATALOG_VERSION,
    }),
    { ok: false, code: "terms_acceptance_required" }
  );
  assert.deepEqual(
    validateCreatorLicenseAcceptance({
      acceptTerms: "true",
      termsVersion: CREATOR_TERMS_VERSION,
      catalogVersion: CREATOR_CATALOG_VERSION,
    }),
    { ok: false, code: "terms_acceptance_required" }
  );
});

test("clickwrap requires the exact current terms and catalog versions", () => {
  assert.deepEqual(
    validateCreatorLicenseAcceptance({
      acceptTerms: true,
      termsVersion: "creator-license-v1",
      catalogVersion: CREATOR_CATALOG_VERSION,
    }),
    { ok: false, code: "terms_version_mismatch" }
  );
  assert.deepEqual(
    validateCreatorLicenseAcceptance({
      acceptTerms: true,
      termsVersion: CREATOR_TERMS_VERSION,
      catalogVersion: "creator-catalog-stale",
    }),
    { ok: false, code: "catalog_version_mismatch" }
  );

  const valid = validateCreatorLicenseAcceptance({
    acceptTerms: true,
    termsVersion: CREATOR_TERMS_VERSION,
    catalogVersion: CREATOR_CATALOG_VERSION,
  });
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.deepEqual(valid.acceptance, {
      acceptTerms: true,
      termsVersion: "creator-license-2026-07-21",
      catalogVersion: CREATOR_CATALOG_VERSION,
    });
  }
});

test("creator UI uses only the exact controlling ID and EN clickwrap text", async () => {
  const component = await readFile(new URL("components/creator-music/creator-catalog.tsx", appRoot), "utf8");
  const exactId = "Saya telah membaca dan menyetujui Lisensi Musik untuk Kreator creator-license-2026-07-21. Saya memahami bahwa atribusi wajib, musik tidak boleh didistribusikan tersendiri, dan saya tidak boleh mendaftarkan rekaman atau fingerprint musiknya ke Content ID atau sistem sejenis.";
  const exactEn = "I have read and agree to the Creator Music License creator-license-2026-07-21. I understand that attribution is required, the music may not be distributed standalone, and I may not register the track or its music fingerprint in Content ID or a similar system.";

  assert.equal(component.includes(exactId), true);
  assert.equal(component.includes(exactEn), true);
  assert.equal(component.includes("regional?.clickwrap"), false);
});

test("issued certificates use the exact controlling attribution line", () => {
  assert.equal(
    CREATOR_ATTRIBUTION,
    "Music: Flow Creator Music by Chill Music Division / Virzy Guns Production - https://flow.virzyguns.com/creator-music"
  );
});

test("licensee name validation rejects empty, control chars, and email addresses", () => {
  assert.equal(validateLicenseeName(null).ok, false);
  assert.equal(validateLicenseeName("").ok, false);
  assert.equal(validateLicenseeName("   a   ").ok, false); // < 2 chars
  assert.equal(validateLicenseeName("user@example.com").ok, false); // email rejected
  assert.equal(validateLicenseeName("Jane\nDoe").ok, false); // control char rejected

  const valid = validateLicenseeName("  Jane Doe / Studio X  ");
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.name, "Jane Doe / Studio X");
  }
});

test("contract version 2026-07-21 fingerprint matches canonical EN and ID documents", async () => {
  const en = await readFile(new URL("docs/legal/creator-license-2026-07-21/canonical/FLOW_CREATOR_LICENSE_creator-license-2026-07-21_EN.md", appRoot));
  const id = await readFile(new URL("docs/legal/creator-license-2026-07-21/canonical/FLOW_CREATOR_LICENSE_creator-license-2026-07-21_ID.md", appRoot));
  const manifest = await readFile(new URL("docs/legal/creator-license-2026-07-21/creator-rights-manifest-v1.csv", appRoot));

  assert.equal(en.includes(0x0d), false, "English contract must be LF-only");
  assert.equal(id.includes(0x0d), false, "Indonesian contract must be LF-only");
  assert.equal(en.at(-1), 0x0a, "English contract must end in LF");
  assert.equal(id.at(-1), 0x0a, "Indonesian contract must end in LF");

  const enHash = createHash("sha256").update(en).digest("hex");
  const idHash = createHash("sha256").update(id).digest("hex");
  const manifestHash = createHash("sha256").update(manifest).digest("hex");

  assert.equal(enHash, "b51df66d5f7a14b5400e09e18643ab0165beb2768b787d027ace17471b9cc886");
  assert.equal(idHash, "7d05922373a256fce5dffbd4a67547623dd676ead2d997a0c9c790d8bd64d5e9");
  assert.equal(manifestHash, "bb4c0f2ff6373e2cb2360f4331ce0001f72297519968aed025035e89ca47cdd5");

  const bundleDigest = createHash("sha256")
    .update(Buffer.concat([en, Buffer.from("\n"), id]))
    .digest("hex");

  assert.equal(CREATOR_TERMS_DOCUMENT_VERSION, "creator-license-2026-07-21");
  assert.equal(bundleDigest, CREATOR_TERMS_DOCUMENT_SHA256);
  assert.equal(bundleDigest, "537c0c9f14b70a95e1339d5142bf4ea4c55cae278c89eaaeadc14cf15277c4ec");

  // Verify registry contains both historical v1 and current 2026-07-21
  const spec2026 = getCreatorContractSpec("creator-license-2026-07-21");
  const specV1 = getCreatorContractSpec("creator-license-v1");
  assert.ok(spec2026);
  assert.ok(specV1);
  assert.equal(spec2026?.documentSha256, "537c0c9f14b70a95e1339d5142bf4ea4c55cae278c89eaaeadc14cf15277c4ec");
  assert.equal(specV1?.documentSha256, "d2b4c6eca30c1b74586f44a0aceb2e38a5d5f6cf88303f85bd83779235656274");
});

test("PDF certificate generator produces valid PDF with required fields and zero prohibited PII", async () => {
  const certId = "12345678-1234-4234-8234-123456789abc";
  const grantId = "87654321-4321-4321-8321-987654321cba";
  const pdfBuffer = await generateLicenseCertificatePdf({
    certificateId: certId,
    grantId: grantId,
    trackId: "city-pop/city-pop-001",
    trackTitle: "Neon Drive",
    trackArtist: "Chill Music Division",
    trackGenre: "City Pop",
    catalogVersion: "creator-catalog-2026-07-19",
    termsVersion: "creator-license-2026-07-21",
    termsDocumentVersion: "creator-license-2026-07-21",
    termsDocumentSha256: "537c0c9f14b70a95e1339d5142bf4ea4c55cae278c89eaaeadc14cf15277c4ec",
    licenseeName: "Studio Alpha",
    attributionText: "Music: Flow Creator Music by Chill Music Division / Virzy Guns Production - https://flow.virzyguns.com/creator-music",
    issuedAt: "2026-07-21T10:00:00.000Z",
    verifyUrl: `https://flow.virzyguns.com/en/license/verify/${certId}`,
  });

  assert.ok(pdfBuffer instanceof Buffer);
  assert.ok(pdfBuffer.length > 5000);
  const pdfText = pdfBuffer.toString("utf8");

  assert.ok(pdfText.startsWith("%PDF-1.4"));
  assert.ok(pdfText.includes("FLOW CREATOR MUSIC"));
  assert.ok(pdfText.includes("LICENSE CERTIFICATE"));
  assert.ok(pdfText.includes("Studio Alpha"));
  assert.ok(pdfText.includes(certId));
  assert.ok(pdfText.includes(grantId));
  assert.ok(pdfText.includes("creator-license-2026-07-21"));
  assert.ok(pdfText.includes("537c0c9f14b70a95e1339d5142bf4ea4c55cae278c89eaaeadc14cf15277c4ec".slice(0, 16)));

  // Prohibited PII & Assets must NOT be in PDF
  assert.equal(pdfText.includes("LALU_VIRZY_GUNAWAN_SIGNATURE"), false);
  assert.equal(pdfText.includes("output/legal-private"), false);
  assert.equal(pdfText.includes("NIK"), false);
  assert.equal(pdfText.includes("NPWP"), false);
});

test("download filenames cannot inject paths or response header syntax", () => {
  assert.equal(
    safeCreatorDownloadFilename('../../Neon "Drive"\r\nX-Bad: yes', "city-pop/city-pop-001"),
    "neon-drivex-bad-yes.mp3"
  );
  assert.equal(
    safeCreatorCertificateFilename('../../Neon "Drive"\r\nX-Bad: yes', "12345678-1234-4234-8234-123456789abc"),
    "Flow-License-neon-drivex-bad-yes-12345678-1234-4234-8234-123456789abc.pdf"
  );
});

test("migrations permit own SELECT, service_role insert/update, and verify has no PII", async () => {
  const grantMigration = await readFile(
    new URL("supabase/migrations/20260719000000_creator_license_grants.sql", appRoot),
    "utf8"
  );
  const certMigration = await readFile(
    new URL("supabase/migrations/20260721000000_creator_license_certificates.sql", appRoot),
    "utf8"
  );

  assert.match(grantMigration, /enable row level security/i);
  assert.match(certMigration, /enable row level security/i);
  assert.match(certMigration, /grant select[^;]+to authenticated/i);
  assert.doesNotMatch(certMigration, /grant (?:insert|update|delete|all)[^;]+to authenticated/i);
  assert.match(certMigration, /\(select auth\.uid\(\)\) = user_id/i);
  assert.match(certMigration, /user_id uuid references auth\.users\(id\) on delete set null/i);
  assert.doesNotMatch(certMigration, /user_id[^\n]+on delete cascade/i);
  assert.match(
    certMigration,
    /create unique index idx_fs_creator_certs_grant_track\s+on public\.flowstate_creator_license_certificates\(grant_id, track_id\)/i
  );

  const verifier = await readFile(
    new URL("app/api/license/verify/[id]/route.ts", appRoot),
    "utf8"
  );
  assert.doesNotMatch(verifier, /\.select\([^)]*(?:email|user_id|licensee_name)/i);
  assert.doesNotMatch(verifier, /user_metadata/i);
});

test("no code or build artifact imports from output/legal-private", async () => {
  const filesToCheck = [
    "lib/creator-license/contract-v1.ts",
    "lib/creator-license/policy.ts",
    "lib/creator-license/server.ts",
    "lib/creator-license/catalog.ts",
    "lib/creator-license/pdf.ts",
    "app/api/license/grants/route.ts",
    "app/api/license/download/[...trackId]/route.ts",
    "app/api/license/verify/[id]/route.ts",
    "app/api/license/certificate/[id]/route.ts",
  ];

  for (const relPath of filesToCheck) {
    const content = await readFile(new URL(relPath, appRoot), "utf8");
    assert.equal(content.includes("output/legal-private"), false, `${relPath} must not reference output/legal-private`);
  }
});
