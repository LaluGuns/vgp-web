import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import {
  createBridgeClient,
  FounderOsBridgeError,
  resolveBridgeConfig,
} from "./lib/bridge-client.mjs";

const TEST_SECRET = "x".repeat(32);

test("bridge client sends inherited bearer auth and idempotency without exposing the secret", async (t) => {
  let observed;
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    observed = {
      method: request.method,
      url: request.url,
      authorization: request.headers.authorization,
      idempotencyKey: request.headers["idempotency-key"],
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    };
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ success: true, status: "DRAFT" }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const client = createBridgeClient({
    env: {
      FOUNDER_OS_BASE_URL: `http://127.0.0.1:${address.port}`,
      FOUNDER_OS_BRIDGE_SECRET: TEST_SECRET,
    },
  });

  const result = await client.request({
    method: "POST",
    path: "/api/founder/os/bridge/v1/drafts",
    body: { requestKey: "draft:test-001", title: "Test" },
    requestKey: "draft:test-001",
  });

  assert.deepEqual(result, { success: true, status: "DRAFT" });
  assert.equal(observed.method, "POST");
  assert.equal(observed.url, "/api/founder/os/bridge/v1/drafts");
  assert.equal(observed.authorization, `Bearer ${TEST_SECRET}`);
  assert.equal(observed.idempotencyKey, "draft:test-001");
  assert.equal(JSON.stringify(result).includes(TEST_SECRET), false);
});

test("bridge configuration fails closed for missing secrets and non-loopback HTTP", () => {
  assert.throws(
    () => resolveBridgeConfig({ FOUNDER_OS_BASE_URL: "https://www.virzyguns.com" }),
    (error) => error instanceof FounderOsBridgeError && error.code === "BRIDGE_NOT_CONFIGURED",
  );
  assert.throws(
    () => resolveBridgeConfig({ FOUNDER_OS_BASE_URL: "http://example.com", FOUNDER_OS_BRIDGE_SECRET: TEST_SECRET }),
    (error) => error instanceof FounderOsBridgeError && error.code === "INSECURE_BASE_URL",
  );
});

test("bridge client rejects paths outside the versioned Founder OS allowlist", async () => {
  const client = createBridgeClient({
    env: {
      FOUNDER_OS_BASE_URL: "https://www.virzyguns.com",
      FOUNDER_OS_BRIDGE_SECRET: TEST_SECRET,
    },
    fetchImpl: () => {
      throw new Error("fetch must not run");
    },
  });
  await assert.rejects(
    () => client.request({ path: "/api/founder/os/providers/meta/actions/execute" }),
    (error) => error instanceof FounderOsBridgeError && error.code === "PATH_NOT_ALLOWED",
  );
});
