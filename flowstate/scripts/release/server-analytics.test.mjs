import assert from "node:assert/strict";
import test from "node:test";
import { subscriptionAnalyticsEvent } from "../../lib/server-analytics.ts";

test("maps subscription lifecycle events to the commercial taxonomy", () => {
  assert.equal(subscriptionAnalyticsEvent("subscription_created", "active"), "subscription_activated");
  assert.equal(subscriptionAnalyticsEvent("subscription_resumed", "trialing"), "subscription_activated");
  assert.equal(subscriptionAnalyticsEvent("subscription_cancelled", "cancelled"), "subscription_cancelled");
  assert.equal(subscriptionAnalyticsEvent("subscription_payment_refunded", "expired"), "subscription_refunded");
  assert.equal(subscriptionAnalyticsEvent("subscription_payment_chargeback", "expired"), "subscription_chargeback");
});

test("does not emit activation for routine updates or failed payments", () => {
  assert.equal(subscriptionAnalyticsEvent("subscription_updated", "active"), null);
  assert.equal(subscriptionAnalyticsEvent("subscription_payment_failed", "past_due"), null);
  assert.equal(subscriptionAnalyticsEvent("order_created", "paid"), null);
});
