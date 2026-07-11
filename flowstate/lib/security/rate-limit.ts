/**
 * Lightweight fixed-window rate limiter.
 *
 * Default backend is in-memory (per-instance) — fine for a single Node process
 * and for dev. For multi-instance / serverless production, swap `MemoryStore`
 * for a Redis-backed store (ioredis with an atomic INCR + EXPIRE Lua script),
 * mirroring the pattern used in the main VGP repo. The `RateLimitStore`
 * interface keeps call sites unchanged.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
}

interface RateLimitStore {
  hit(key: string, windowMs: number, limit: number): Promise<RateLimitResult>;
}

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  constructor() {
    // Periodic cleanup to bound memory (prevents the leak class of bug).
    if (typeof setInterval !== "undefined") {
      const t = setInterval(() => {
        const now = Date.now();
        for (const [k, v] of this.buckets) {
          if (v.resetAt <= now) this.buckets.delete(k);
        }
      }, 60_000);
      // Don't keep the event loop alive for this timer.
      (t as { unref?: () => void }).unref?.();
    }
  }

  async hit(key: string, windowMs: number, limit: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { success: true, limit, remaining: limit - 1, resetAt };
    }

    existing.count += 1;
    const remaining = Math.max(0, limit - existing.count);
    return {
      success: existing.count <= limit,
      limit,
      remaining,
      resetAt: existing.resetAt,
    };
  }
}

const store: RateLimitStore = new MemoryStore();

/**
 * @param key    Unique key (e.g. `webhook:${ip}` or `signurl:${userId}`).
 * @param opts   limit = max requests per window; windowMs = window length.
 */
export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  return store.hit(key, opts.windowMs, opts.limit);
}

/** Extract a best-effort client IP from request headers. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
