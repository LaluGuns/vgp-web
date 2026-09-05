import crypto from "node:crypto";

export const ANDROID_PACKAGE = "com.virzyguns.flow";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const ANDROID_PUBLISHER_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3";

type GoogleServiceAccount = { client_email: string; private_key: string; token_uri?: string };
let accessTokenCache: { token: string; expiresAt: number } | null = null;

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function requireServiceAccount(): GoogleServiceAccount {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not configured");
  const parsed = JSON.parse(raw) as Partial<GoogleServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) throw new Error("Invalid Google Play service account JSON");
  return parsed as GoogleServiceAccount;
}

async function googleAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache.token;
  const sa = requireServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: sa.client_email,
    scope: ANDROID_PUBLISHER_SCOPE,
    aud: sa.token_uri || GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claims}`;
  const assertion = `${unsigned}.${base64Url(crypto.sign("RSA-SHA256", Buffer.from(unsigned), sa.private_key))}`;
  const response = await fetch(sa.token_uri || GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google OAuth failed (${response.status})`);
  const json = await response.json() as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Google OAuth returned no access token");
  accessTokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + Math.max(300, Number(json.expires_in || 3600)) * 1000,
  };
  return json.access_token;
}

export async function publisherFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await googleAccessToken();
  const response = await fetch(`${ANDROID_PUBLISHER_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    signal: init.signal || AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google Android Publisher request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
