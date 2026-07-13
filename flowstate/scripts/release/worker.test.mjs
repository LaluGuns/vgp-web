import assert from "node:assert/strict";
import test from "node:test";

import worker from "../../worker/src/index.js";

const freePath = "/tracks/test/free.mp3";
const premiumPath = "/tracks/test/pro.mp3";

function env(overrides = {}) {
  return {
    ALLOWED_ORIGINS: "https://flow.virzyguns.com,http://localhost:3001",
    FULL_TTL_SECONDS: "900",
    PREMIUM_PROMO: "0",
    URL_SIGNING_SECRET: "test-secret-that-is-at-least-32-bytes-long",
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_ANON_KEY: "public-anon-key",
    AUDIO_BUCKET: {
      async get(key) {
        if (key === "tracks/catalog.json") {
          return {
            async json() {
              return [
                { hlsUrl: freePath, isPremium: false },
                { hlsUrl: premiumPath, isPremium: true },
              ];
            },
          };
        }
        return null;
      },
    },
    ...overrides,
  };
}

async function issue(paths, workerEnv = env(), headers = {}) {
  const request = new Request("https://audio.example/v1/urls", {
    method: "POST",
    headers: { origin: "http://localhost:3001", "content-type": "application/json", ...headers },
    body: JSON.stringify({ paths }),
  });
  const response = await worker.fetch(request, workerEnv);
  return { response, body: await response.json() };
}

test("worker issues signed URLs for catalogued free tracks", async () => {
  const { response, body } = await issue([freePath]);
  assert.equal(response.status, 200);
  assert.match(body.urls[0].url, /^https:\/\/audio\.example\/v1\/stream\?/);
  assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:3001");
});

test("worker refuses premium tracks without entitlement", async () => {
  const { response, body } = await issue([premiumPath]);
  assert.equal(response.status, 200);
  assert.equal(body.urls[0].error, "premium required");
  assert.equal(body.urls[0].url, undefined);
});

test("worker checks premium entitlement with the user JWT instead of service role", async () => {
  const originalFetch = globalThis.fetch;
  const token = `${btoa("header")}.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), headers: new Headers(init.headers) });
    if (String(url).endsWith("/auth/v1/user")) {
      return Response.json({ id: "user-1" });
    }
    return Response.json([{ plan: "yearly" }]);
  };

  try {
    const { response, body } = await issue([premiumPath], env(), { authorization: `Bearer ${token}` });
    assert.equal(response.status, 200);
    assert.ok(body.urls[0].url);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].headers.get("authorization"), `Bearer ${token}`);
    assert.equal(calls[1].headers.get("apikey"), "public-anon-key");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("worker fails closed when the signing secret is absent or weak", async () => {
  for (const secret of [undefined, "too-short"]) {
    const { response, body } = await issue([freePath], env({ URL_SIGNING_SECRET: secret }));
    assert.equal(response.status, 503);
    assert.equal(body.error, "service unavailable");
  }
});

test("worker rejects malformed and expired stream URLs", async () => {
  const workerEnv = env();
  const malformed = await worker.fetch(new Request("https://audio.example/v1/stream?k=bad&e=1&s=bad"), workerEnv);
  assert.equal(malformed.status, 403);

  const { body } = await issue([freePath], workerEnv);
  const signed = new URL(body.urls[0].url);
  signed.searchParams.set("e", "1");
  const expired = await worker.fetch(new Request(signed), workerEnv);
  assert.equal(expired.status, 403);
});

test("worker rejects oversized bodies and unsupported range forms", async () => {
  const tooLarge = await issue([freePath], env(), { "content-length": String(16 * 1024 + 1) });
  assert.equal(tooLarge.response.status, 413);

  const oversizedBody = await worker.fetch(
    new Request("https://audio.example/v1/urls", {
      method: "POST",
      body: JSON.stringify({ paths: [freePath], padding: "x".repeat(17 * 1024) }),
    }),
    env()
  );
  assert.equal(oversizedBody.status, 413);

  const workerEnv = env();
  const { body } = await issue([freePath], workerEnv);
  const suffixRange = await worker.fetch(
    new Request(body.urls[0].url, { headers: { range: "bytes=-500" } }),
    workerEnv
  );
  assert.equal(suffixRange.status, 416);
});
