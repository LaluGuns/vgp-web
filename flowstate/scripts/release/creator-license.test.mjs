import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  CREATOR_GENRES,
  isCreatorGenre,
  safeCreatorDownloadFilename,
  selectActiveCreatorPlan,
} from "../../lib/creator-license/policy.ts";

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
});

test("new grants require a currently active canonical subscription", () => {
  const now = Date.parse("2026-07-19T00:00:00.000Z");
  assert.equal(selectActiveCreatorPlan([], now), null);
  assert.deepEqual(
    selectActiveCreatorPlan([
      { id: "monthly-1", status: "active", plan: "monthly", current_period_end: "2026-08-19T00:00:00.000Z" },
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
      { status: "active", plan: "monthly", current_period_end: "2026-07-18T00:00:00.000Z" },
    ], now),
    null
  );
});

test("download filenames cannot inject paths or response header syntax", () => {
  assert.equal(
    safeCreatorDownloadFilename('../../Neon "Drive"\r\nX-Bad: yes', "city-pop/city-pop-001"),
    "neon-drivex-bad-yes.mp3"
  );
});

test("migration permits own SELECT but no authenticated writes and public verify has no PII", async () => {
  const migration = await readFile(
    new URL("supabase/migrations/20260719000000_creator_license_grants.sql", appRoot),
    "utf8"
  );
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /grant select[^;]+to authenticated/i);
  assert.doesNotMatch(migration, /grant (?:insert|update|delete|all)[^;]+to authenticated/i);
  assert.match(migration, /\(select auth\.uid\(\)\) = user_id/i);
  assert.match(migration, /user_id uuid references auth\.users\(id\) on delete set null/i);
  assert.doesNotMatch(migration, /user_id[^\n]+on delete cascade/i);
  assert.match(
    migration,
    /create unique index idx_fs_creator_grants_one_active_version[\s\S]+where user_id is not null and revoked_at is null/i
  );

  const verifier = await readFile(
    new URL("app/api/license/verify/[id]/route.ts", appRoot),
    "utf8"
  );
  assert.doesNotMatch(verifier, /\.select\([^)]*(?:email|user_id)/i);
  assert.doesNotMatch(verifier, /user_metadata/i);

  const grantRoute = await readFile(
    new URL("app/api/license/grants/route.ts", appRoot),
    "utf8"
  );
  assert.match(grantRoute, /error\?\.code === "23505"[\s\S]+findCurrentGrant\(user\.id\)/);
});

test("refunds revoke only grants tied to the refunded subscription", async () => {
  const webhook = await readFile(
    new URL("app/api/webhooks/lemonsqueezy/route.ts", appRoot),
    "utf8"
  );
  assert.match(webhook, /revocation_reason:\s*"subscription_refunded"/);
  assert.match(webhook, /\.contains\("plan_snapshot",\s*\{ subscription_id: existing\.id \}\)/);
  assert.match(webhook, /if \(eventName === "subscription_payment_refunded"\)/);
});
