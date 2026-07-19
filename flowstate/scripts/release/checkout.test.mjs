import assert from "node:assert/strict";
import test from "node:test";
import {
  checkoutUrlFromResponse,
  checkoutPriceCents,
  isAllowedRequestOrigin,
  isTrustedCheckoutUrl,
  parseCheckoutInput,
  resolveAppOrigin,
} from "../../lib/security/checkout.ts";

test("checkout input only accepts supported intervals and string promo codes", () => {
  assert.deepEqual(parseCheckoutInput({ interval: "monthly" }), { interval: "monthly" });
  assert.deepEqual(parseCheckoutInput({ interval: "yearly", discountCode: " flowbro " }), {
    interval: "yearly",
    discountCode: "flowbro",
  });
  assert.equal(parseCheckoutInput({ interval: "weekly" }), null);
  assert.equal(parseCheckoutInput({}), null);
  assert.equal(parseCheckoutInput({ interval: "monthly", discountCode: 123 }), null);
  assert.deepEqual(parseCheckoutInput({
    interval: "monthly",
    acquisition: {
      sessionAcquisition: "organic",
      firstTouchChannel: "direct",
      acquisitionSessionId: "session-123",
      referrerHost: "www.google.com",
      landingPath: "/ja-JP/creator-music/city-pop",
      locale: "ja-JP",
      market: "ja-JP",
      cluster: "creator_music",
    },
  })?.acquisition, {
    sessionAcquisition: "organic",
    firstTouchChannel: "direct",
    acquisitionSessionId: "session-123",
    referrerHost: "www.google.com",
    landingPath: "/ja-JP/creator-music/city-pop",
    locale: "ja-JP",
    market: "ja-JP",
    cluster: "creator_music",
  });
  assert.equal(parseCheckoutInput({ interval: "monthly", acquisition: { sessionAcquisition: "organic", landingPath: "not-a-path" } })?.acquisition, undefined);
});

test("checkout prices are server authoritative", () => {
  const forged = parseCheckoutInput({ interval: "yearly", amountUsdCents: 1 });
  assert.ok(forged);
  assert.equal(checkoutPriceCents(forged), 5999);
  assert.equal(checkoutPriceCents({ interval: "monthly", discountCode: "FLOWBRO" }), 499);
  assert.equal(checkoutPriceCents({ interval: "yearly", discountCode: "flowbro" }), 2999);
});

test("cross-origin browser checkout requests are rejected", () => {
  const requestUrl = "https://flow.virzyguns.com/api/checkout";
  assert.equal(isAllowedRequestOrigin("https://flow.virzyguns.com", requestUrl), true);
  assert.equal(isAllowedRequestOrigin("https://evil.example", requestUrl), false);
  assert.equal(isAllowedRequestOrigin("not a url", requestUrl), false);
  assert.equal(isAllowedRequestOrigin(null, requestUrl), true);
});

test("production app origin must be configured HTTPS", () => {
  const requestUrl = "http://localhost:3001/api/checkout";
  assert.equal(resolveAppOrigin(undefined, requestUrl, true), null);
  assert.equal(resolveAppOrigin("http://flow.virzyguns.com", requestUrl, true), null);
  assert.equal(
    resolveAppOrigin("https://flow.virzyguns.com/app", requestUrl, true),
    "https://flow.virzyguns.com"
  );
  assert.equal(resolveAppOrigin(undefined, requestUrl, false), "http://localhost:3001");
});

test("only HTTPS Lemon Squeezy checkout URLs are accepted", () => {
  assert.equal(isTrustedCheckoutUrl("https://app.lemonsqueezy.com/checkout/abc"), true);
  assert.equal(isTrustedCheckoutUrl("http://app.lemonsqueezy.com/checkout/abc"), false);
  assert.equal(isTrustedCheckoutUrl("https://lemonsqueezy.com.evil.example/abc"), false);
  assert.equal(
    checkoutUrlFromResponse({
      data: { attributes: { url: "https://app.lemonsqueezy.com/checkout/abc" } },
    }),
    "https://app.lemonsqueezy.com/checkout/abc"
  );
  assert.equal(checkoutUrlFromResponse({ data: { attributes: { url: "https://evil.example" } } }), null);
});
