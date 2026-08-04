import { ProposalRequestSchema } from "./contracts";
import { ChiefOfStaff } from "./chief-of-staff";
import {
  ReplayNonceGuard,
  type ClaimNonceInput,
} from "./replay-nonce-guard";
import {
  SIGNATURE_WINDOW_SECONDS,
  sha256Hex,
  verifyRequestSignature,
  type SignatureHeaders,
} from "./security";

export { ChiefOfStaff, ReplayNonceGuard };

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
} as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);
    const route =
      request.method === "GET" && url.pathname === "/internal/v1/health"
        ? "health"
        : request.method === "POST" && url.pathname === "/internal/v1/proposals"
          ? "proposal"
          : null;

    if (!route) {
      return json({ error: "NOT_FOUND", requestId }, 404);
    }

    const maximumBodyBytes = parseMaximumBodyBytes(env.MAX_BODY_BYTES);
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > maximumBodyBytes) {
      return json({ error: "PAYLOAD_TOO_LARGE", requestId }, 413);
    }

    const bodyResult =
      route === "health"
        ? { ok: true as const, bytes: new Uint8Array(), text: "" }
        : await readBoundedUtf8Body(request, maximumBodyBytes);
    if (!bodyResult.ok && bodyResult.error === "PAYLOAD_TOO_LARGE") {
      return json({ error: "PAYLOAD_TOO_LARGE", requestId }, 413);
    }
    if (!bodyResult.ok) {
      return json({ error: "INVALID_BODY", requestId }, 400);
    }
    const { bytes: bodyBytes, text: bodyText } = bodyResult;

    if (!env.INTERNAL_HMAC_SECRET || !env.INTERNAL_HMAC_KEY_ID) {
      console.error(
        JSON.stringify({
          message: "internal auth configuration missing",
          requestId,
          environment: env.ENVIRONMENT,
        }),
      );
      return json({ error: "SERVICE_UNAVAILABLE", requestId }, 503);
    }

    const signatureHeaders: SignatureHeaders = {
      keyId: request.headers.get("x-vgp-key-id") ?? "",
      timestamp: request.headers.get("x-vgp-timestamp") ?? "",
      nonce: request.headers.get("x-vgp-nonce") ?? "",
      signature: request.headers.get("x-vgp-signature") ?? "",
    };
    const verification = await verifyRequestSignature({
      method: request.method,
      pathname: url.pathname,
      bodyBytes,
      headers: signatureHeaders,
      expectedKeyId: env.INTERNAL_HMAC_KEY_ID,
      secret: env.INTERNAL_HMAC_SECRET,
    });
    if (!verification.ok) {
      return json({ error: verification.code, requestId }, 401);
    }

    const nonceShard = (await sha256Hex(signatureHeaders.nonce)).slice(0, 2);
    const guardName = `${signatureHeaders.keyId}:${nonceShard}`;
    const guard = env.REPLAY_GUARD.getByName(guardName);
    const claim: ClaimNonceInput = {
      keyId: signatureHeaders.keyId,
      nonce: signatureHeaders.nonce,
      timestampSeconds: verification.timestampSeconds,
      expiresAtSeconds:
        verification.timestampSeconds + SIGNATURE_WINDOW_SECONDS + 1,
    };
    if (!(await guard.claimNonce(claim))) {
      return json({ error: "REPLAY_DETECTED", requestId }, 409);
    }

    if (route === "health") {
      return json({
        ok: true,
        service: "vgp-founder-agent",
        environment: env.ENVIRONMENT,
        mode: env.PROPOSAL_MODE,
        externalActionsAllowed: false,
        requestId,
      });
    }

    let rawInput: unknown;
    try {
      rawInput = JSON.parse(bodyText);
    } catch {
      return json({ error: "MALFORMED_JSON", requestId }, 400);
    }
    const parsed = ProposalRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      return json(
        {
          error: "INVALID_PROPOSAL_REQUEST",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
          })),
          requestId,
        },
        400,
      );
    }

    try {
      const chief = env.CHIEF_OF_STAFF.getByName(parsed.data.scopeId);
      const result = await chief.createProposal(parsed.data);
      if (!result.ok) {
        return json({ error: result.error, requestId }, 400);
      }
      const { proposal } = result;
      console.log(
        JSON.stringify({
          message: "dry-run proposal created",
          requestId,
          runId: parsed.data.runId,
          proposalId: proposal.proposalId,
          taskType: proposal.taskType,
          specialistCount: proposal.selectedSpecialists.length,
          evidenceCount: proposal.evidenceSummary.supplied,
          externalActionsAllowed: false,
        }),
      );
      return json({ proposal, requestId }, 200);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "proposal generation failed",
          requestId,
          error: error instanceof Error ? error.message : "unknown",
        }),
      );
      return json({ error: "PROPOSAL_FAILED", requestId }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

function parseMaximumBodyBytes(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1_024 && parsed <= 65_536
    ? parsed
    : 32_768;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

async function readBoundedUtf8Body(
  request: Request,
  maximumBodyBytes: number,
): Promise<
  | { ok: true; bytes: Uint8Array; text: string }
  | { ok: false; error: "PAYLOAD_TOO_LARGE" | "INVALID_UTF8" }
> {
  if (!request.body) {
    return { ok: true, bytes: new Uint8Array(), text: "" };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    totalBytes += result.value.byteLength;
    if (totalBytes > maximumBodyBytes) {
      await reader.cancel("payload too large");
      return { ok: false, error: "PAYLOAD_TOO_LARGE" };
    }
    chunks.push(result.value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      bytes,
      text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    };
  } catch {
    return { ok: false, error: "INVALID_UTF8" };
  }
}
