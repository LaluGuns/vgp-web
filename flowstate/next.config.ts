import path from "path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

// Build a Content-Security-Policy tuned for the app.
// Audio (media-src) must allow the CDN host once configured; Supabase needs connect-src.
function buildCsp(): string {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
  const cdn = process.env.NEXT_PUBLIC_AUDIO_CDN_BASE_URL ?? process.env.AUDIO_CDN_BASE_URL ?? "";
  // Signed audio delivery worker (R2) — needed in connect-src (signing + Web Audio
  // fetch) and media-src (HLS/native audio element).
  const audioWorker = (process.env.NEXT_PUBLIC_AUDIO_WORKER_URL ?? "").replace(/\/$/, "");
  // PostHog ingest — only needed once analytics is actually enabled.
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_KEY
    ? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
    : "";
  // Sentry ingest — only needed once error reporting is actually enabled.
  const sentryIngest = process.env.NEXT_PUBLIC_SENTRY_DSN
    ? "https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io"
    : "";

  const connect = [
    "'self'",
    supabase,
    "https://*.supabase.co",
    "wss://*.supabase.co",
    cdn,
    audioWorker,
    // Lemon Squeezy checkout/overlay
    "https://*.lemonsqueezy.com",
    posthogHost,
    sentryIngest,
    isDev ? "ws:" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const media = ["'self'", "blob:", cdn, audioWorker].filter(Boolean).join(" ");

  // Scripts: dev needs 'unsafe-eval' for HMR/Turbopack. 'unsafe-inline' stays until
  // we move to a per-request nonce (see SECURITY.md upgrade path).
  const script = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${script}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `media-src ${media}`,
    `connect-src ${connect}`,
    "frame-src 'self' https://*.lemonsqueezy.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    !isDev ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS only in production (avoid pinning HTTP localhost during dev).
  ...(!isDev
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
    {
      source: "/sounds/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/tracks/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
    })
  : nextConfig;
