import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { audioUrl } from "@/lib/utils";

/**
 * Signed audio URL provider.
 *
 * Production: audio lives in R2 behind the `flowstate-audio-delivery` Worker.
 * Every play resolves through `POST {worker}/v1/urls`, which returns short-TTL
 * HMAC-signed stream URLs (see worker/src/index.js). Free tracks need no auth;
 * premium tracks send the Supabase access token so the worker can check the plan.
 *
 * Dev fallback: when NEXT_PUBLIC_AUDIO_WORKER_URL is unset, paths resolve through
 * the dev-only `/api/dev-audio` route, which mirrors the worker's anti-sniff
 * behaviour (opaque token in the URL, octet-stream response) so download
 * managers stay blind on localhost too. A legacy public-CDN base is still
 * honoured when explicitly configured.
 */

const workerBase = (process.env.NEXT_PUBLIC_AUDIO_WORKER_URL || "").replace(/\/$/, "");
const legacyCdnBase = process.env.NEXT_PUBLIC_AUDIO_CDN_BASE_URL || "";

/** Opaque local URL: no ".mp3", no audio/* content-type — nothing to sniff. */
function devAudioUrl(path: string): string {
  const key = path.replace(/^\//, "");
  const token =
    typeof btoa === "function"
      ? btoa(key).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
      : key;
  return `/api/dev-audio?p=${token}`;
}

// Refresh a cached URL this many ms before it actually expires.
const EXPIRY_SAFETY_MS = 60_000;

interface CacheEntry {
  url: string;
  expiresAt: number; // epoch ms
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string>>();

export function isWorkerConfigured(): boolean {
  return workerBase.length > 0;
}

async function accessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await createClient().auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function requestSignedUrls(paths: string[]): Promise<Map<string, CacheEntry>> {
  const token = await accessToken();
  const res = await fetch(`${workerBase}/v1/urls`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ paths }),
  });
  if (!res.ok) throw new Error(`audio worker ${res.status}`);
  const json: { urls: { path: string; url?: string; expires_at?: string; error?: string }[] } =
    await res.json();

  const out = new Map<string, CacheEntry>();
  for (const item of json.urls ?? []) {
    if (item.url && item.expires_at) {
      out.set(item.path, { url: item.url, expiresAt: new Date(item.expires_at).getTime() });
    }
  }
  return out;
}

/**
 * Resolve one audio path (e.g. "/tracks/city-pop/x.mp3") to a playable URL.
 * `prefetch` paths are signed in the same round-trip and warmed into the cache
 * (pass the next tracks in the playlist to hide the signing latency).
 */
export async function resolveAudioUrl(path: string, prefetch: string[] = []): Promise<string> {
  if (!path) return path;
  if (!workerBase) {
    // Explicit legacy CDN wins; otherwise the anti-sniff dev route.
    return legacyCdnBase ? audioUrl(path) : devAudioUrl(path);
  }

  const now = Date.now();
  const hit = cache.get(path);
  if (hit && hit.expiresAt - EXPIRY_SAFETY_MS > now) return hit.url;

  const pending = inflight.get(path);
  if (pending) return pending;

  const wanted = [path, ...prefetch.filter((p) => {
    const c = cache.get(p);
    return p !== path && !(c && c.expiresAt - EXPIRY_SAFETY_MS > now);
  })].slice(0, 24);

  const promise = (async () => {
    try {
      const signed = await requestSignedUrls(wanted);
      for (const [p, entry] of signed) cache.set(p, entry);
      const entry = signed.get(path);
      if (!entry) throw new Error(`no signed url for ${path}`);
      return entry.url;
    } finally {
      inflight.delete(path);
    }
  })();

  inflight.set(path, promise);
  return promise;
}

/** Warm the cache for upcoming tracks without blocking playback. */
export function prefetchAudioUrls(paths: string[]): void {
  if (!workerBase || paths.length === 0) return;
  const now = Date.now();
  const missing = paths.filter((p) => {
    const c = cache.get(p);
    return !(c && c.expiresAt - EXPIRY_SAFETY_MS > now);
  });
  if (missing.length === 0) return;
  requestSignedUrls(missing.slice(0, 24))
    .then((signed) => {
      for (const [p, entry] of signed) cache.set(p, entry);
    })
    .catch(() => {
      /* prefetch is best-effort */
    });
}
