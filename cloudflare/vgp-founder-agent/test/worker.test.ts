import { env, exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import {
  BASIC_MP3_TERMS_V1,
  BASIC_MP3_TERMS_V1_SHA256,
  canonicalLicenseTermsPayload,
} from "../src/license-policy";
import {
  buildCanonicalRequest,
  sha256Hex,
  signCanonicalRequest,
} from "../src/security";

const TEST_SECRET = "test-secret-with-at-least-32-characters";
const TEST_KEY_ID = "test-v1";

describe("signed internal Worker", () => {
  it("requires a valid signature even for health", async () => {
    const unsigned = await exports.default.fetch(
      "https://worker.test/internal/v1/health",
    );
    expect(unsigned.status).toBe(401);

    const request = await signedRequest({
      method: "GET",
      pathname: "/internal/v1/health",
      nonce: "health-nonce-00000001",
    });
    const response = await exports.default.fetch(request);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      mode: "mock-dry-run",
      externalActionsAllowed: false,
    });
  });

  it("durably rejects a replayed nonce", async () => {
    const requestA = await signedRequest({
      method: "GET",
      pathname: "/internal/v1/health",
      nonce: "replay-nonce-00000001",
    });
    const requestB = new Request(requestA);

    expect((await exports.default.fetch(requestA)).status).toBe(200);
    const replay = await exports.default.fetch(requestB);
    expect(replay.status).toBe(409);
    await expect(replay.json()).resolves.toMatchObject({
      error: "REPLAY_DETECTED",
    });
  });

  it("rejects a stale signed request", async () => {
    const request = await signedRequest({
      method: "GET",
      pathname: "/internal/v1/health",
      nonce: "stale-nonce-00000001",
      timestampSeconds: Math.floor(Date.now() / 1_000) - 301,
    });
    const response = await exports.default.fetch(request);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "STALE_REQUEST",
    });
  });

  it("rejects a body changed after signing", async () => {
    const originalBody = JSON.stringify(validProposal());
    const request = await signedRequest({
      method: "POST",
      pathname: "/internal/v1/proposals",
      nonce: "tamper-nonce-0000001",
      bodyText: originalBody,
    });
    const tampered = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: `${originalBody} `,
    });

    expect((await exports.default.fetch(tampered)).status).toBe(401);
  });

  it("streams and rejects a body larger than the configured bound", async () => {
    const oversized = new Request(
      "https://worker.test/internal/v1/proposals",
      {
        method: "POST",
        body: "x".repeat(32_769),
      },
    );
    const response = await exports.default.fetch(oversized);
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: "PAYLOAD_TOO_LARGE",
    });
  });

  it("returns a bounded dry-run proposal and stores only a safe summary", async () => {
    const body = JSON.stringify(
      validProposal({
        taskType: "draft",
        objective: "Prepare beat outreach for a public business prospect.",
        requestedRoles: ["lead-scout", "sales-concierge"],
        includeBasicMp3Terms: true,
      }),
    );
    const request = await signedRequest({
      method: "POST",
      pathname: "/internal/v1/proposals",
      nonce: "proposal-nonce-000001",
      bodyText: body,
    });
    const response = await exports.default.fetch(request);
    expect(response.status).toBe(200);

    const result = await response.json<{
      proposal: {
        safety: { externalActionsAllowed: boolean };
        policyInputs: {
          basicMp3Terms: {
            price: number;
            copiesLimit: number;
            onlineAudioStreamsLimit: number;
            musicVideosLimit: number;
            contentSha256: string;
          };
        };
        approvalInvalidationConditions: string[];
      };
    }>();
    expect(result.proposal.safety.externalActionsAllowed).toBe(false);
    expect(result.proposal.policyInputs.basicMp3Terms).toMatchObject({
      price: 15,
      copiesLimit: 2_000,
      onlineAudioStreamsLimit: 5_000,
      musicVideosLimit: 1,
    });
    expect(result.proposal.approvalInvalidationConditions).toContain(
      "LICENSE_TERMS_HASH_CHANGED",
    );

    const chief = env.CHIEF_OF_STAFF.getByName("founder:test");
    const state = await chief.getSafeState();
    expect(JSON.stringify(state)).not.toContain("Prepare beat outreach");
    expect(JSON.stringify(state)).not.toContain(TEST_SECRET);
  });

  it("rejects credential-like material before it reaches durable state", async () => {
    const body = JSON.stringify(
      validProposal({
        objective:
          "Use access_token=abc123456789012345678901234567890 to inspect an account.",
      }),
    );
    const request = await signedRequest({
      method: "POST",
      pathname: "/internal/v1/proposals",
      nonce: "credential-nonce-0001",
      bodyText: body,
    });
    const response = await exports.default.fetch(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "CREDENTIAL_LIKE_MATERIAL_REJECTED",
    });
  });
});

describe("license policy source integrity", () => {
  it("hashes the exact owner-confirmed Basic MP3 terms", async () => {
    expect(BASIC_MP3_TERMS_V1).toEqual({
      offerId: "basic-mp3",
      version: "owner-confirmed-main-c407209-2026-07-29",
      sourceUri: "owner://vgp/beat-license/basic-mp3/2026-07-29",
      currency: "USD",
      price: 15,
      allowedUse: "Music Recording",
      copiesLimit: 2_000,
      onlineAudioStreamsLimit: 5_000,
      musicVideosLimit: 1,
    });
    expect(await sha256Hex(canonicalLicenseTermsPayload())).toBe(
      BASIC_MP3_TERMS_V1_SHA256,
    );
  });
});

async function signedRequest(input: {
  method: "GET" | "POST";
  pathname: string;
  nonce: string;
  bodyText?: string;
  timestampSeconds?: number;
}): Promise<Request> {
  const bodyText = input.bodyText ?? "";
  const timestamp = String(
    input.timestampSeconds ?? Math.floor(Date.now() / 1_000),
  );
  const bodySha256 = await sha256Hex(bodyText);
  const canonical = buildCanonicalRequest({
    method: input.method,
    pathname: input.pathname,
    bodySha256,
    timestamp,
    nonce: input.nonce,
    keyId: TEST_KEY_ID,
  });
  const signature = await signCanonicalRequest(canonical, TEST_SECRET);
  return new Request(`https://worker.test${input.pathname}`, {
    method: input.method,
    headers: {
      "content-type": "application/json",
      "x-vgp-key-id": TEST_KEY_ID,
      "x-vgp-timestamp": timestamp,
      "x-vgp-nonce": input.nonce,
      "x-vgp-signature": signature,
    },
    body: input.method === "POST" ? bodyText : undefined,
  });
}

function validProposal(
  overrides: Partial<{
    taskType: "analysis" | "draft";
    objective: string;
    requestedRoles: string[];
    includeBasicMp3Terms: boolean;
  }> = {},
) {
  return {
    schemaVersion: "1",
    runId: crypto.randomUUID(),
    scopeId: "founder:test",
    taskType: overrides.taskType ?? "analysis",
    objective: overrides.objective ?? "Analyze the supplied owned-account evidence.",
    requestedRoles: overrides.requestedRoles ?? ["growth-intelligence"],
    evidence: [],
    constraints: ["No external actions."],
    includeBasicMp3Terms: overrides.includeBasicMp3Terms ?? false,
  };
}
