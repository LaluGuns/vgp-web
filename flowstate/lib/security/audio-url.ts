import crypto from "crypto";

/**
 * Signed audio URLs — protect premium tracks from hotlinking/ripping.
 *
 * Flow:
 *  1. Client requests a track it's entitled to.
 *  2. Server checks entitlement (is_premium), then calls `signAudioPath` to mint
 *     a short-lived signed URL pointing at the CDN.
 *  3. An edge function / worker at the CDN (or a Next route) calls `verifyAudioToken`
 *     before serving the bytes.
 *
 * The signature binds the path + expiry so a leaked URL dies quickly and can't be
 * altered to point at another track.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function key(): string {
  const k = process.env.AUDIO_SIGNING_KEY;
  if (!k) throw new Error("AUDIO_SIGNING_KEY is not set");
  return k;
}

function sign(path: string, expires: number): string {
  return crypto
    .createHmac("sha256", key())
    .update(`${path}:${expires}`, "utf8")
    .digest("base64url");
}

export function signAudioPath(
  path: string,
  ttlMs: number = DEFAULT_TTL_MS
): { url: string; expires: number; token: string } {
  const expires = Date.now() + ttlMs;
  const token = sign(path, expires);
  const base = process.env.AUDIO_CDN_BASE_URL ?? "";
  const url = `${base}${path}?expires=${expires}&token=${token}`;
  return { url, expires, token };
}

export function verifyAudioToken(
  path: string,
  expires: number,
  token: string
): boolean {
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const expected = sign(path, expires);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
