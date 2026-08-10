import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CREATOR_CATALOG_VERSION,
  CREATOR_CATALOG_VERSION_V1,
  CREATOR_TERMS_VERSION,
} from "../../lib/creator-license/policy.ts";

test("creator catalog v2 is additive and historical catalog version remains named", () => {
  assert.equal(CREATOR_CATALOG_VERSION, "creator-catalog-2026-08-09-v2");
  assert.equal(CREATOR_CATALOG_VERSION_V1, "creator-catalog-2026-07-19");
  assert.equal(CREATOR_TERMS_VERSION, "creator-license-2026-07-21");
});

test("v2 migration adds nullable identity fields and does not edit legal scripts", async () => {
  const migration = await readFile(
    new URL("../../supabase/migrations/20260809000000_creator_catalog_v2_identity.sql", import.meta.url),
    "utf8",
  );
  for (const field of ["recording_artist", "display_credit", "label_licensor", "external_title", "isrc"]) {
    assert.match(migration, new RegExp(`add column if not exists ${field}`));
  }
  assert.doesNotMatch(migration, /flowstate\/scripts\/legal|output\/legal-private|signature/i);
});

