import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

function bucketHash(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function validResetAt(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Distributed fixed-window limiter backed by Supabase/Postgres.
 *
 * The logical key is SHA-256 hashed before persistence. This keeps raw IP/user
 * composites out of the rate-limit table and makes the limit shared across all
 * Vercel instances.
 *
 * DB/RPC failure deliberately throws. Security-sensitive call sites should fail
 * closed rather than silently falling back to a per-instance memory limiter.
 */
export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateLimitResult> {
  if (!key || key.length > 2048) throw new Error("Invalid rate limit key");
  if (!Number.isInteger(opts.limit) || opts.limit < 1 || opts.limit > 100_000) {
    throw new Error("Invalid rate limit limit");
  }
  if (!Number.isInteger(opts.windowMs) || opts.windowMs < 1_000 || opts.windowMs > 86_400_000) {
    throw new Error("Invalid rate limit window");
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("flowstate_consume_rate_limit", {
    p_bucket_key: bucketHash(key),
    p_limit: opts.limit,
    p_window_ms: opts.windowMs,
  });
  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;
  const resetAt = validResetAt(row?.reset_at);
  const limit = Number(row?.limit_count);
  const remaining = Number(row?.remaining);
  if (
    !row ||
    typeof row.success !== "boolean" ||
    !Number.isInteger(limit) ||
    limit !== opts.limit ||
    !Number.isInteger(remaining) ||
    remaining < 0 ||
    resetAt == null
  ) {
    throw new Error("Invalid rate limit backend response");
  }

  return {
    success: row.success,
    limit,
    remaining,
    resetAt,
  };
}

/**
 * Best-effort client IP. Vercel's platform header is preferred when present.
 * The IP is only used as part of a hashed rate-limit key and is never persisted raw.
 */
export function clientIp(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim().slice(0, 128);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 128);

  return (headers.get("x-real-ip") ?? "unknown").trim().slice(0, 128);
}
