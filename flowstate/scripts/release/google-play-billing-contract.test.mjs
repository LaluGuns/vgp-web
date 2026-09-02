import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const core = read("lib/google-play/core.ts");
const refundReview = read("lib/google-play/refund-review.ts");
const googleApi = read("lib/google-play/google-api.ts");
const rateLimit = read("lib/security/rate-limit.ts");
const playAccount = read("app/api/android/play-account/route.ts");
const playEntitlement = read("app/api/android/play-entitlement/route.ts");
const rtdn = read("app/api/webhooks/google-play/route.ts");
const atomicMigration = read("supabase/migrations/20260902091433_flowstate_atomic_subscription_state.sql");
const refundQueueMigration = read("supabase/migrations/20260902080753_flowstate_google_play_refund_review_queue.sql");

test("Google Play uses the immutable Flow Android package", () => {
  assert.match(googleApi, /com\.virzyguns\.flow/);
});

test("pending purchases never grant entitlement or get acknowledged", () => {
  assert.match(
    core,
    /case "SUBSCRIPTION_STATE_PENDING":[\s\S]{0,160}status: "past_due", entitled: false, acknowledge: false/,
  );
  assert.match(
    core,
    /case "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED":[\s\S]{0,120}status: "expired", entitled: false, acknowledge: false/,
  );
  assert.doesNotMatch(
    core,
    /default:[\s\S]{0,180}expiry[\s\S]{0,80}return \{ status: "active"/,
  );
});

test("eligible new subscription tokens are acknowledged server side after persistence", () => {
  assert.match(core, /ACKNOWLEDGEMENT_STATE_PENDING/);
  assert.match(core, /purchases\/subscriptions\/\$\{encodeURIComponent\(productId\)\}\/tokens\/\$\{encodeURIComponent\(purchaseToken\)\}:acknowledge/);
  assert.match(core, /Persist entitlement first/);
});

test("server configured base plan is fail closed", () => {
  assert.match(core, /if \(requiredBasePlan && requiredBasePlan !== basePlanId\)/);
});

test("current RTDN subscription notification set includes pending purchase cancellation", () => {
  assert.match(core, /20: "google_play_subscription_pending_purchase_cancelled"/);
  assert.match(rtdn, /verifyPubSubPushBearer/);
  assert.match(rtdn, /package_mismatch/);
});

test("voided purchase reconciliation uses current Android Publisher pagination and chargeback reason", () => {
  assert.match(core, /"pageSelection\.maxResults"/);
  assert.match(core, /"pageSelection\.token"/);
  assert.match(core, /Number\(item\.voidedReason\) === 7/);
  assert.doesNotMatch(core, /Number\(item\.voidedReason\) === 1/);
});

test("pending refund review uses orders.reviewrefund and is idempotent", () => {
  assert.match(refundReview, /\/orders\/\$\{encodeURIComponent\(claimed\.provider_order_id\)\}:reviewrefund/);
  assert.match(refundReview, /pendingRefundToken: claimed\.pending_refund_token/);
  assert.match(refundReview, /ignoreDuplicates: true/);
  assert.match(refundReview, /24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(refundReview, /voidedpurchases.*:review/);
});

test("Android receives the canonical obfuscated account id and authoritative entitlement flags", () => {
  assert.match(playAccount, /obfuscatedAccountId/);
  assert.match(playEntitlement, /entitled: result\.entitled/);
  assert.match(playEntitlement, /acknowledged: result\.acknowledged/);
  assert.match(playEntitlement, /subscriptionState: result\.subscriptionState/);
  assert.match(playEntitlement, /payload_too_large/);
});

test("rate limiting is shared through the server only database RPC", () => {
  assert.match(rateLimit, /flowstate_consume_rate_limit/);
  assert.match(rateLimit, /createServiceClient/);
  assert.doesNotMatch(rateLimit, /class MemoryStore/);
  assert.doesNotMatch(rateLimit, /new Map/);
});

test("billing mutations are service role only and atomic", () => {
  assert.match(atomicMigration, /security definer/i);
  assert.match(atomicMigration, /owner_conflict/);
  assert.match(atomicMigration, /grant execute[\s\S]*service_role/i);
  assert.match(refundQueueMigration, /enable row level security/i);
  assert.match(refundQueueMigration, /revoke all[\s\S]*anon, authenticated/i);
  assert.match(refundQueueMigration, /grant select, insert, update, delete[\s\S]*service_role/i);
});
