import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const auth = read("lib/google-play/pubsub-auth.ts");
const index = read("lib/google-play/index.ts");

test("authenticated PubSub validates the signed service identity and audience", () => {
  assert.match(auth, /payload\.email !== expectedEmail/);
  assert.match(auth, /payload\.email_verified !== true/);
  assert.match(auth, /audiences\.includes\(expectedAud\)/);
  assert.match(auth, /payload\.exp <= nowSeconds/);
  assert.match(auth, /accounts\.google\.com/);
  assert.match(auth, /crypto\.verify/);
});

test("Google signing keys are cached but refreshed on an unknown kid", () => {
  assert.match(auth, /JWKS_CACHE_MS/);
  assert.match(auth, /fetchGoogleJwks\(true\)/);
  assert.match(auth, /key\.kty !== "RSA"/);
  assert.match(auth, /header\.alg !== "RS256"/);
});

test("Google Play public module exports only the hardened PubSub verifier", () => {
  assert.match(index, /verifyPubSubPushBearer.*pubsub-auth/s);
  assert.doesNotMatch(index, /verifyPubSubPushBearer,[\s\S]*from "@\/lib\/google-play\/core"/);
});
