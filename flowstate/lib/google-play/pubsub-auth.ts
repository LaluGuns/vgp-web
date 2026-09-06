import crypto from "node:crypto";

type PubSubJwtPayload = {
  aud?: string | string[];
  email?: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  iss?: string;
};

type GoogleJwk = {
  kid?: string;
  kty?: string;
  n?: string;
  e?: string;
  alg?: string;
};

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const JWKS_CACHE_MS = 55 * 60 * 1000;
let jwksCache: { keys: GoogleJwk[]; expiresAt: number } | null = null;

function decodeJsonPart<T>(part: string): T {
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
  } catch {
    throw new Error("Invalid Pub/Sub bearer JWT");
  }
}

async function fetchGoogleJwks(forceRefresh = false): Promise<GoogleJwk[]> {
  if (!forceRefresh && jwksCache && jwksCache.expiresAt > Date.now()) {
    return jwksCache.keys;
  }

  const response = await fetch(GOOGLE_JWKS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Could not load Google signing keys (${response.status})`);

  const json = await response.json() as { keys?: GoogleJwk[] };
  const keys = Array.isArray(json.keys) ? json.keys : [];
  if (!keys.length) throw new Error("Google signing-key response was empty");

  jwksCache = { keys, expiresAt: Date.now() + JWKS_CACHE_MS };
  return keys;
}

async function keyFor(kid: string): Promise<GoogleJwk> {
  let keys = await fetchGoogleJwks();
  let key = keys.find((candidate) => candidate.kid === kid);
  if (!key) {
    keys = await fetchGoogleJwks(true);
    key = keys.find((candidate) => candidate.kid === kid);
  }
  if (!key || key.kty !== "RSA" || (key.alg && key.alg !== "RS256")) {
    throw new Error("Unknown Pub/Sub signing key");
  }
  return key;
}

export async function verifyPubSubPushBearer(authHeader: string | null): Promise<void> {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token || token.length > 16_384) throw new Error("Missing or invalid Pub/Sub bearer token");

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error("Invalid Pub/Sub bearer JWT");
  }

  const header = decodeJsonPart<{ kid?: string; alg?: string }>(parts[0]);
  const payload = decodeJsonPart<PubSubJwtPayload>(parts[1]);
  if (!header.kid || header.alg !== "RS256") throw new Error("Invalid Pub/Sub JWT header");

  const jwk = await keyFor(header.kid);
  let key: crypto.KeyObject;
  try {
    key = crypto.createPublicKey({ key: jwk as crypto.JsonWebKey, format: "jwk" });
  } catch {
    throw new Error("Invalid Google signing key");
  }

  const validSignature = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    Buffer.from(parts[2], "base64url"),
  );
  if (!validSignature) throw new Error("Invalid Pub/Sub signature");

  const expectedAud = process.env.GOOGLE_PLAY_PUBSUB_AUDIENCE?.trim();
  const expectedEmail = process.env.GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT_EMAIL?.trim();
  if (!expectedAud || !expectedEmail) throw new Error("Pub/Sub verification is not configured");

  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    !audiences.includes(expectedAud) ||
    payload.email !== expectedEmail ||
    payload.email_verified !== true ||
    !payload.exp ||
    payload.exp <= nowSeconds ||
    !payload.iat ||
    payload.iat > nowSeconds + 300 ||
    payload.iat < nowSeconds - 3_900 ||
    !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss || "")
  ) {
    throw new Error("Invalid Pub/Sub token claims");
  }
}
