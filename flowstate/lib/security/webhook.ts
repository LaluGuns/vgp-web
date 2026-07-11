import crypto from "crypto";

/**
 * Verify a Lemon Squeezy webhook signature.
 * LS sends `X-Signature` = hex HMAC-SHA256 of the RAW request body using the
 * store's webhook signing secret. Always compare with a timing-safe equal.
 *
 * Usage in a route handler (must read the raw body, not parsed JSON):
 *   const raw = await req.text();
 *   const sig = req.headers.get("x-signature") ?? "";
 *   if (!verifyLemonSqueezySignature(raw, sig)) return new Response("invalid", { status: 401 });
 *   const event = JSON.parse(raw);
 */
export function verifyLemonSqueezySignature(
  rawBody: string,
  signature: string,
  secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
): boolean {
  if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");

  // Lengths must match for timingSafeEqual; mismatched length => invalid.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
