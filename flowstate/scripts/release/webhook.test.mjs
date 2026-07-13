import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { verifyLemonSqueezySignature } from "../../lib/security/webhook.ts";

test("Lemon Squeezy HMAC verifier accepts only the exact signed raw body", () => {
  const secret = "test-secret-with-enough-entropy";
  const body = JSON.stringify({ meta: { event_name: "subscription_updated" } });
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyLemonSqueezySignature(body, signature, secret), true);
  assert.equal(verifyLemonSqueezySignature(`${body}\n`, signature, secret), false);
  assert.equal(verifyLemonSqueezySignature(body, "not-hex", secret), false);
  assert.equal(verifyLemonSqueezySignature(body, "00".repeat(32), secret), false);
});

test("Lemon Squeezy HMAC verifier fails closed without a secret", () => {
  assert.throws(
    () => verifyLemonSqueezySignature("{}", "00".repeat(32), ""),
    /LEMONSQUEEZY_WEBHOOK_SECRET/
  );
});
