import assert from "node:assert/strict";
import test from "node:test";
import { invokeTool, TOOL_DEFINITIONS, TOOL_NAMES } from "./lib/tool-registry.mjs";

const PROHIBITED_TOOL_NAME = /(approve|execute|send|publish|upload|reply|dm|oauth|disconnect)/i;

function recordingClient(result = { success: true }) {
  const calls = [];
  return {
    calls,
    async request(input) {
      calls.push(input);
      return result;
    },
  };
}

test("tool registry exposes only bounded bridge categories and no external-action tool", () => {
  assert.equal(TOOL_NAMES.length, 11);
  assert.deepEqual(TOOL_NAMES, TOOL_DEFINITIONS.map((tool) => tool.name));
  assert.equal(TOOL_NAMES.some((name) => PROHIBITED_TOOL_NAME.test(name)), false);
  assert.equal(new Set(TOOL_NAMES).size, TOOL_NAMES.length);
  for (const tool of TOOL_DEFINITIONS) {
    assert.equal(tool.inputSchema.type, "object");
    assert.equal(tool.inputSchema.additionalProperties, false);
  }
});

test("read tools map only to versioned Founder OS Bridge paths", async () => {
  const client = recordingClient({ success: true, approvals: [] });
  await invokeTool("founder_list_approvals", { status: "DRAFT", limit: 10 }, client);
  await invokeTool("founder_get_provider_health", {}, client);
  await invokeTool("founder_get_provider_analytics", { provider: "meta" }, client);
  await invokeTool("founder_get_audit_log", { beforeId: "42", limit: 10 }, client);
  assert.deepEqual(client.calls, [
    { path: "/api/founder/os/bridge/v1/approvals", query: { status: "DRAFT", limit: 10 } },
    { path: "/api/founder/os/bridge/v1/providers" },
    { path: "/api/founder/os/bridge/v1/providers/meta/analytics" },
    { path: "/api/founder/os/bridge/v1/audit", query: { beforeId: "42", limit: 10 } },
  ]);
});

test("draft creation is idempotent and stays on the draft endpoint", async () => {
  const client = recordingClient({ success: true, status: "DRAFT" });
  const input = {
    requestKey: "draft:test-002",
    kind: "email-outreach",
    targetLabel: "Evidence-backed prospect",
    payloadSummary: "Internal email draft",
    evidenceIds: ["evidence:1"],
    prospectId: "prospect:1",
    subject: "Evidence-backed draft",
    body: "Draft body only.",
  };
  const result = await invokeTool("founder_create_draft", input, client);
  assert.equal(result.status, "DRAFT");
  assert.deepEqual(client.calls, [{
    method: "POST",
    path: "/api/founder/os/bridge/v1/drafts",
    body: input,
    requestKey: "draft:test-002",
  }]);
});

test("request-review validates an exact hash and cannot carry hidden action fields", async () => {
  const client = recordingClient();
  await assert.rejects(
    () => invokeTool("founder_request_review", {
      requestKey: "review:test-001",
      approvalId: "draft:test-002",
      expectedContentHash: "sha256:not-a-hash",
    }, client),
    /expectedContentHash is invalid/,
  );
  await assert.rejects(
    () => invokeTool("founder_create_draft", {
      requestKey: "draft:test-003",
      execute: true,
    }, client),
    /Forbidden external-action field/,
  );
  assert.equal(client.calls.length, 0);

  const expectedContentHash = `sha256:${"a".repeat(64)}`;
  await invokeTool("founder_request_review", {
    requestKey: "review:test-001",
    approvalId: "draft:test-002",
    expectedContentHash,
  }, client);
  assert.deepEqual(client.calls, [{
    method: "POST",
    path: "/api/founder/os/bridge/v1/approvals/draft%3Atest-002/request-review",
    body: { expectedContentHash },
    requestKey: "review:test-001",
  }]);
});

test("unknown or execution-like tool names fail before any bridge request", async () => {
  const client = recordingClient();
  await assert.rejects(() => invokeTool("founder_execute_approval", {}, client), /Unknown or prohibited tool/);
  assert.equal(client.calls.length, 0);
});
