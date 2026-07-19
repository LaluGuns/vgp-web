import assert from "node:assert/strict";
import test from "node:test";
import { classifyAcquisition } from "../../lib/analytics-acquisition.ts";

const host = "flow.virzyguns.com";
test("classifies organic search and rejects lookalike domains", () => {
  assert.equal(classifyAcquisition("https://www.google.com/search?q=flow", host), "organic");
  assert.equal(classifyAcquisition("https://notgoogle.com/search?q=flow", host), "referral");
});
test("classifies referral, direct and internal traffic", () => {
  assert.equal(classifyAcquisition("https://example.com/article", host), "referral");
  assert.equal(classifyAcquisition("", host), "direct");
  assert.equal(classifyAcquisition("https://flow.virzyguns.com/en/pricing", host), "internal");
});
test("classifies staff and bots before referrer channel", () => {
  assert.equal(classifyAcquisition("", "flow-preview.vercel.app"), "staff");
  assert.equal(classifyAcquisition("https://www.google.com/search?q=flow", host, "Googlebot/2.1"), "bot");
});
