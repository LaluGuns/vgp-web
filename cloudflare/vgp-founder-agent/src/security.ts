export const SIGNATURE_WINDOW_SECONDS = 5 * 60;

export interface SignatureHeaders {
  keyId: string;
  timestamp: string;
  nonce: string;
  signature: string;
}

export interface VerifySignatureInput {
  method: string;
  pathname: string;
  bodyBytes: Uint8Array;
  headers: SignatureHeaders;
  expectedKeyId: string;
  secret: string;
  nowSeconds?: number;
}

export type SignatureVerification =
  | {
      ok: true;
      canonical: string;
      bodySha256: string;
      timestampSeconds: number;
    }
  | {
      ok: false;
      code:
        | "INVALID_AUTH_HEADERS"
        | "UNKNOWN_KEY_ID"
        | "STALE_REQUEST"
        | "INVALID_SIGNATURE";
    };

const encoder = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  return sha256BytesHex(encoder.encode(value));
}

export async function sha256BytesHex(value: Uint8Array): Promise<string> {
  const bytes = new Uint8Array(value.byteLength);
  bytes.set(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

export function buildCanonicalRequest(input: {
  method: string;
  pathname: string;
  bodySha256: string;
  timestamp: string;
  nonce: string;
  keyId: string;
}): string {
  return [
    input.method.toUpperCase(),
    input.pathname,
    input.bodySha256,
    input.timestamp,
    input.nonce,
    input.keyId,
  ].join("\n");
}

export async function signCanonicalRequest(
  canonical: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(canonical));
  return bytesToHex(new Uint8Array(signature));
}

export async function verifyRequestSignature(
  input: VerifySignatureInput,
): Promise<SignatureVerification> {
  const { keyId, timestamp, nonce, signature } = input.headers;
  if (
    !keyId ||
    !/^\d{10}$/.test(timestamp) ||
    !/^[A-Za-z0-9_-]{16,128}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return { ok: false, code: "INVALID_AUTH_HEADERS" };
  }

  if (!(await timingSafeTextEqual(keyId, input.expectedKeyId))) {
    return { ok: false, code: "UNKNOWN_KEY_ID" };
  }

  const timestampSeconds = Number(timestamp);
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1_000);
  if (Math.abs(nowSeconds - timestampSeconds) > SIGNATURE_WINDOW_SECONDS) {
    return { ok: false, code: "STALE_REQUEST" };
  }

  const bodySha256 = await sha256BytesHex(input.bodyBytes);
  const canonical = buildCanonicalRequest({
    method: input.method,
    pathname: input.pathname,
    bodySha256,
    timestamp,
    nonce,
    keyId,
  });
  const expectedSignature = await signCanonicalRequest(canonical, input.secret);

  if (!(await timingSafeHexEqual(signature, expectedSignature))) {
    return { ok: false, code: "INVALID_SIGNATURE" };
  }

  return { ok: true, canonical, bodySha256, timestampSeconds };
}

async function timingSafeTextEqual(left: string, right: string): Promise<boolean> {
  const [leftHash, rightHash] = await Promise.all([sha256Hex(left), sha256Hex(right)]);
  return timingSafeHexEqual(leftHash, rightHash);
}

async function timingSafeHexEqual(left: string, right: string): Promise<boolean> {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) {
    return false;
  }

  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  if (leftBytes.byteLength !== rightBytes.byteLength) {
    const [leftHash, rightHash] = await Promise.all([sha256Hex(left), sha256Hex(right)]);
    return timingSafeEqual(hexToBytes(leftHash), hexToBytes(rightHash));
  }
  return timingSafeEqual(leftBytes, rightBytes);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
import { timingSafeEqual } from "node:crypto";
