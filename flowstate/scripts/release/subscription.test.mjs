import assert from "node:assert/strict";
import test from "node:test";
import {
  isEntitlementActive,
  mapSubscriptionStatus,
  mapVariantToPlan,
  selectActivePlan,
  validIsoDate,
} from "../../lib/security/subscription.ts";

test("unknown subscription statuses fail closed", () => {
  assert.equal(mapSubscriptionStatus("active"), "active");
  assert.equal(mapSubscriptionStatus("on_trial"), "trialing");
  assert.equal(mapSubscriptionStatus("paused"), "past_due");
  assert.equal(mapSubscriptionStatus("future_status"), null);
});

test("only configured variant IDs map to paid plans", () => {
  const variants = { monthly: "101", yearly: "202", lifetime: "303" };
  assert.equal(mapVariantToPlan(101, variants), "monthly");
  assert.equal(mapVariantToPlan("202", variants), "yearly");
  assert.equal(mapVariantToPlan("303", variants), "lifetime");
  assert.equal(mapVariantToPlan("999", variants), null);
  assert.equal(mapVariantToPlan("", variants), null);
});

test("dates and cancelled entitlements are handled conservatively", () => {
  assert.equal(validIsoDate("not-a-date"), null);
  assert.equal(validIsoDate("2026-07-12T00:00:00.000Z"), "2026-07-12T00:00:00.000Z");
  const now = Date.parse("2026-07-12T00:00:00.000Z");
  assert.equal(isEntitlementActive("active", null, now), true);
  assert.equal(isEntitlementActive("cancelled", "2026-07-13T00:00:00.000Z", now), true);
  assert.equal(isEntitlementActive("cancelled", "2026-07-11T00:00:00.000Z", now), false);
  assert.equal(isEntitlementActive("cancelled", null, now), false);
  assert.equal(isEntitlementActive("past_due", "2026-07-13T00:00:00.000Z", now), false);
});

test("profile plan selection preserves another valid subscription after a refund", () => {
  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(selectActivePlan([
    { status: "expired", plan: "yearly", current_period_end: new Date().toISOString() },
    { status: "cancelled", plan: "monthly", current_period_end: future },
  ]), "monthly");
  assert.equal(selectActivePlan([
    { status: "active", plan: "monthly" },
    { status: "active", plan: "lifetime" },
  ]), "lifetime");
  assert.equal(selectActivePlan([{ status: "expired", plan: "yearly" }]), "free");
});
