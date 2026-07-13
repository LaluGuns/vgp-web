import { PREMIUM_AMBIENT_PATHS } from "../../lib/audio/ambient-catalog.ts";

/**
 * flowstate-audio-delivery — signed, entitlement-gated audio streaming from R2.
 *
 * Adapted from the proven cadenz-audio-delivery pattern:
 *   POST /v1/urls    — batch-issue short-TTL HMAC-signed stream URLs.
 *                      Free tracks: no auth required (free tier works logged-out).
 *                      Premium tracks: Supabase JWT + flowstate_profiles.plan != 'free'.
 *   GET  /v1/stream  — verify signature + expiry, then proxy R2 with Range support.
 *   GET  /v1/health  — liveness.
 *
 * Design notes:
 *  - The R2 keys mirror the old public paths (`tracks/<category>/<file>.mp3`), so the
 *    app's catalog paths map 1:1 to keys (strip the leading slash).
 *  - Track metadata (isPremium) comes from `tracks/catalog.json` in the bucket,
 *    cached in module scope for CATALOG_TTL_MS.
 *  - `cache-control: private, no-store` + ~15-min expiry kills catalog scraping,
 *    hotlinking, and paste-URL-into-a-download-manager. (In-flight capture by a local
 *    proxy or OS loopback recording is not stoppable by any web player.)
 */

const JSON_HEADERS = { "content-type": "application/json" };
const CATALOG_TTL_MS = 5 * 60 * 1000;
const MAX_ITEMS = 24; // one playlist page worth of URLs per request
const MAX_BODY_BYTES = 16 * 1024;
const MIN_SIGNING_SECRET_LENGTH = 32;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";
    const cors = corsHeaders(env, origin);

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }
      if (url.pathname === "/v1/health") {
        return json({ ok: true, ts: new Date().toISOString() }, 200, cors);
      }
      if (url.pathname === "/v1/urls" && request.method === "POST") {
        return await issueUrls(request, env, cors);
      }
      if (url.pathname === "/v1/stream" && (request.method === "GET" || request.method === "HEAD")) {
        return await stream(request, env, url, cors);
      }
      return json({ error: "not found" }, 404, cors);
    } catch (err) {
      console.error("unhandled", err);
      return json({ error: "internal error" }, 500, cors);
    }
  },
};

function corsHeaders(env, origin) {
  const allowed = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const h = {
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "authorization, content-type, range",
    "access-control-expose-headers": "content-range, accept-ranges, content-length",
    "access-control-max-age": "86400",
    vary: "origin",
  };
  if (allowed.includes(origin)) h["access-control-allow-origin"] = origin;
  return h;
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

// ── Catalog (isPremium lookup) ─────────────────────────────────────────────

let catalogCache = { map: null, at: 0 };

async function getCatalog(env) {
  const now = Date.now();
  if (catalogCache.map && now - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.map;
  }
  const obj = await env.AUDIO_BUCKET.get("tracks/catalog.json");
  if (!obj) return catalogCache.map || new Map(); // stale-if-error
  const entries = await obj.json();
  const map = new Map();
  for (const e of entries) {
    // hlsUrl is stored with a leading slash: "/tracks/city-pop/x.mp3" → key "tracks/..."
    const key = String(e.hlsUrl || "").replace(/^\//, "");
    if (key) map.set(key, { isPremium: !!e.isPremium });
  }
  catalogCache = { map, at: now };
  return map;
}

// ── Supabase auth + entitlement ────────────────────────────────────────────

async function getUser(request, env) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { authorization: auth, apikey: env.SUPABASE_ANON_KEY },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user && user.id ? user : null;
}

async function isPremiumUser(env, userId, authorization) {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/flowstate_profiles?id=eq.${userId}&select=plan`,
    {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        // Query through the user's JWT. RLS only permits reading their own
        // profile, so the Worker never needs the Supabase service-role key.
        authorization,
      },
    }
  );
  if (!res.ok) return false;
  const rows = await res.json();
  return rows.length > 0 && rows[0].plan && rows[0].plan !== "free";
}

// Small in-memory grant cache keyed by a hash of the JWT (mirrors cadenz).
const grantCache = new Map();
const GRANT_MAX_TTL_MS = 8 * 60 * 1000;
const enc = new TextEncoder();

async function sha256hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function jwtExpMs(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

async function resolveGrant(request, env) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  const hash = await sha256hex(token);
  const now = Date.now();
  const hit = grantCache.get(hash);
  if (hit && hit.expMs > now) return { userId: hit.userId, isPremium: hit.isPremium };

  const user = await getUser(request, env);
  if (!user) {
    grantCache.delete(hash);
    return null;
  }
  const isPremium = await isPremiumUser(env, user.id, auth);
  const jwtMs = jwtExpMs(token);
  const expMs = jwtMs ? Math.min(now + GRANT_MAX_TTL_MS, jwtMs - 30_000) : now + GRANT_MAX_TTL_MS;
  if (expMs > now) grantCache.set(hash, { userId: user.id, isPremium, expMs });
  if (grantCache.size > 500) {
    for (const [k, v] of grantCache) if (v.expMs <= now) grantCache.delete(k);
  }
  return { userId: user.id, isPremium };
}

// ── HMAC signing ───────────────────────────────────────────────────────────

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function hasSigningSecret(env) {
  return typeof env.URL_SIGNING_SECRET === "string" && env.URL_SIGNING_SECRET.length >= MIN_SIGNING_SECRET_LENGTH;
}

const b64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function signToken(env, key, exp) {
  if (!hasSigningSecret(env)) throw new Error("URL signing secret is not configured");
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(env.URL_SIGNING_SECRET),
    enc.encode(`${key}|${exp}`)
  );
  return b64url(sig);
}

async function verifyToken(env, key, exp, sig) {
  const expires = Number(exp);
  if (!hasSigningSecret(env) || !key || !Number.isSafeInteger(expires) || !sig || Date.now() / 1000 > expires) {
    return false;
  }
  try {
    const normalized = sig.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env.URL_SIGNING_SECRET),
      bytes,
      enc.encode(`${key}|${expires}`)
    );
  } catch {
    return false;
  }
}

// ── POST /v1/urls ──────────────────────────────────────────────────────────

// tracks/<category>/<file>.mp3  — music (catalog-gated)
// sounds/<file>.mp3|wav         — ambient loops (shared Free/Pro catalog, flat or one dir deep)
const KEY_RE = /^(tracks\/[a-z0-9-]{1,60}\/[a-z0-9._-]{1,120}\.mp3|sounds\/(?:[a-z0-9._-]{1,60}\/)?[a-z0-9._-]{1,120}\.(?:mp3|wav|m4a))$/;
const PREMIUM_SOUND_KEYS = new Set(PREMIUM_AMBIENT_PATHS);

async function issueUrls(request, env, cors) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: "request too large" }, 413, cors);
  if (!hasSigningSecret(env)) return json({ error: "service unavailable" }, 503, cors);

  let body;
  try {
    const rawBody = await request.text();
    if (enc.encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json({ error: "request too large" }, 413, cors);
    }
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: "invalid json" }, 400, cors);
  }

  const paths = Array.isArray(body && body.paths) ? body.paths.slice(0, MAX_ITEMS) : [];
  if (!paths.length) return json({ error: `paths required (max ${MAX_ITEMS})` }, 400, cors);

  const promo = env.PREMIUM_PROMO === "1";
  const catalog = await getCatalog(env);

  // Auth is optional — only resolved when the batch contains premium tracks.
  let grant;
  let grantResolved = false;
  async function ensureGrant() {
    if (!grantResolved) {
      grant = await resolveGrant(request, env);
      grantResolved = true;
    }
    return grant;
  }

  const origin = new URL(request.url).origin;
  const configuredTtl = Number(env.FULL_TTL_SECONDS || 900);
  const ttl = Number.isFinite(configuredTtl) ? Math.min(900, Math.max(60, Math.floor(configuredTtl))) : 900;
  const results = [];

  for (const raw of paths) {
    const key = String(raw || "").replace(/^\//, "");
    if (!KEY_RE.test(key)) {
      results.push({ path: raw, error: "invalid path" });
      continue;
    }
    const isTrack = key.startsWith("tracks/");
    // Music must exist in the R2 catalog; ambience uses the shared Pro catalog.
    const meta = isTrack ? catalog.get(key) : { isPremium: PREMIUM_SOUND_KEYS.has(key) };
    if (!meta) {
      results.push({ path: raw, error: "not available" });
      continue;
    }
    if (meta.isPremium && !promo) {
      const g = await ensureGrant();
      if (!g || !g.isPremium) {
        results.push({ path: raw, error: "premium required" });
        continue;
      }
    }
    const exp = Math.floor(Date.now() / 1000) + ttl;
    const sig = await signToken(env, key, exp);
    // Key travels base64url-encoded: download managers also pattern-match
    // ".mp3" in URLs, so the raw path must never appear on the wire.
    const kTok = btoa(key).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    results.push({
      path: raw,
      url: `${origin}/v1/stream?k=${kTok}&e=${exp}&s=${sig}`,
      expires_at: new Date(exp * 1000).toISOString(),
    });
  }

  return json({ urls: results }, 200, cors);
}

// ── GET /v1/stream ─────────────────────────────────────────────────────────

async function stream(request, env, url, cors) {
  const kTok = url.searchParams.get("k") || "";
  const exp = url.searchParams.get("e");
  const sig = url.searchParams.get("s");
  // Decode the base64url key token (signature binds the RAW key, so a
  // tampered token simply fails verification below).
  let key;
  try {
    key = atob(kTok.replace(/-/g, "+").replace(/_/g, "/"));
  } catch {
    return json({ error: "expired or invalid url" }, 403, cors);
  }
  if (!KEY_RE.test(key)) {
    return json({ error: "expired or invalid url" }, 403, cors);
  }
  if (!(await verifyToken(env, key, exp, sig))) {
    return json({ error: "expired or invalid url" }, 403, cors);
  }

  const rangeHeader = request.headers.get("range");
  let r2Options;
  let start = 0;
  let end = null;
  if (rangeHeader) {
    const m = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
    if (!m) return json({ error: "invalid range" }, 416, cors);
    if (m) {
      start = parseInt(m[1], 10);
      end = m[2] ? parseInt(m[2], 10) : null;
      if (end !== null && end < start) return json({ error: "invalid range" }, 416, cors);
      r2Options = {
        range: end !== null ? { offset: start, length: end - start + 1 } : { offset: start },
      };
    }
  }

  const isHead = request.method === "HEAD";
  const object = isHead
    ? await env.AUDIO_BUCKET.head(key)
    : await env.AUDIO_BUCKET.get(key, r2Options);
  if (!object) return json({ error: "not found" }, 404, cors);

  const size = object.size;
  // Deliberately NOT audio/*: download managers (IDM & friends) sniff media by
  // content-type on the wire. Every player path in the app (music + ambient)
  // fetches bytes into Web Audio's decodeAudioData, which ignores content-type,
  // so an opaque binary stream plays fine while giving sniffers nothing to grab.
  // (nosniff keeps browsers from re-classifying it.)
  const headers = new Headers({
    ...cors,
    "content-type": "application/octet-stream",
    "content-disposition": 'inline; filename="stream.bin"',
    "accept-ranges": "bytes",
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  });

  if (isHead) {
    headers.set("content-length", String(size));
    return new Response(null, { status: 200, headers });
  }

  if (r2Options) {
    const effectiveEnd = end !== null ? Math.min(end, size - 1) : size - 1;
    headers.set("content-range", `bytes ${start}-${effectiveEnd}/${size}`);
    headers.set("content-length", String(effectiveEnd - start + 1));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set("content-length", String(size));
  return new Response(object.body, { status: 200, headers });
}
