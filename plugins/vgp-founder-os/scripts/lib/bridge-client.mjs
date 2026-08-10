import { randomUUID } from "node:crypto";

export const DEFAULT_BASE_URL = "https://www.virzyguns.com";
export const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 20_000;

export class FounderOsBridgeError extends Error {
  constructor(message, { status = null, code = "BRIDGE_ERROR", requestId = null } = {}) {
    super(message);
    this.name = "FounderOsBridgeError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

function normalizeBaseUrl(rawValue) {
  const value = (rawValue || DEFAULT_BASE_URL).trim();
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new FounderOsBridgeError("FOUNDER_OS_BASE_URL must be an absolute URL.", {
      code: "INVALID_BASE_URL",
    });
  }

  const localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) {
    throw new FounderOsBridgeError("Founder OS Bridge requires HTTPS except on loopback hosts.", {
      code: "INSECURE_BASE_URL",
    });
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new FounderOsBridgeError("FOUNDER_OS_BASE_URL must not contain credentials, query, or fragment.", {
      code: "INVALID_BASE_URL",
    });
  }

  return url.toString().replace(/\/$/, "");
}

export function resolveBridgeConfig(env = process.env) {
  const secret = env.FOUNDER_OS_BRIDGE_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new FounderOsBridgeError(
      "FOUNDER_OS_BRIDGE_SECRET is missing or shorter than 32 characters.",
      { code: "BRIDGE_NOT_CONFIGURED" },
    );
  }
  return {
    baseUrl: normalizeBaseUrl(env.FOUNDER_OS_BASE_URL),
    secret,
  };
}

function safeErrorPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return {
    code: typeof value.code === "string" ? value.code.slice(0, 120) : undefined,
    error: typeof value.error === "string" ? value.error.slice(0, 500) : undefined,
    requestId: typeof value.requestId === "string" ? value.requestId.slice(0, 128) : undefined,
  };
}

async function readBoundedJson(response) {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    throw new FounderOsBridgeError("Founder OS Bridge response exceeded the size limit.", {
      status: response.status,
      code: "RESPONSE_TOO_LARGE",
    });
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_RESPONSE_BYTES) {
    throw new FounderOsBridgeError("Founder OS Bridge response exceeded the size limit.", {
      status: response.status,
      code: "RESPONSE_TOO_LARGE",
    });
  }
  if (bytes.byteLength === 0) return {};
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new FounderOsBridgeError("Founder OS Bridge returned invalid JSON.", {
      status: response.status,
      code: "INVALID_BRIDGE_RESPONSE",
    });
  }
}

export function createBridgeClient({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== "function") {
    throw new FounderOsBridgeError("This plugin requires Node.js with fetch support.", {
      code: "FETCH_UNAVAILABLE",
    });
  }
  const config = resolveBridgeConfig(env);

  return Object.freeze({
    async request({ method = "GET", path, query, body, requestKey }) {
      if (typeof path !== "string" || !path.startsWith("/api/founder/os/bridge/v1/")) {
        throw new FounderOsBridgeError("Bridge client rejected a non-allowlisted path.", {
          code: "PATH_NOT_ALLOWED",
        });
      }
      const url = new URL(`${config.baseUrl}${path}`);
      for (const [key, value] of Object.entries(query ?? {})) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      const requestId = randomUUID();
      const headers = {
        accept: "application/json",
        authorization: `Bearer ${config.secret}`,
        "x-request-id": requestId,
        "x-vgp-client": "codex-plugin",
      };
      let encodedBody;
      if (body !== undefined) {
        encodedBody = JSON.stringify(body);
        headers["content-type"] = "application/json";
      }
      if (requestKey) headers["idempotency-key"] = requestKey;

      let response;
      try {
        response = await fetchImpl(url, {
          method,
          headers,
          body: encodedBody,
          signal: controller.signal,
          redirect: "error",
        });
      } catch (error) {
        const timedOut = error instanceof Error && error.name === "AbortError";
        throw new FounderOsBridgeError(
          timedOut ? "Founder OS Bridge request timed out." : "Founder OS Bridge is unreachable.",
          { code: timedOut ? "BRIDGE_TIMEOUT" : "BRIDGE_UNREACHABLE", requestId },
        );
      } finally {
        clearTimeout(timeout);
      }

      const payload = await readBoundedJson(response);
      if (!response.ok) {
        const safe = safeErrorPayload(payload);
        throw new FounderOsBridgeError(safe.error || `Founder OS Bridge returned HTTP ${response.status}.`, {
          status: response.status,
          code: safe.code || "BRIDGE_HTTP_ERROR",
          requestId: safe.requestId || requestId,
        });
      }
      return payload;
    },
  });
}
