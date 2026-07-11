import * as Sentry from "@sentry/nextjs";

// Client-side error tracking. No-op unless the DSN is configured.
// Session replay stays OFF (PostHog owns replay when enabled) to keep the
// bundle lean and avoid double-recording users.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    ignoreErrors: [
      // Autoplay policies reject play() until user interaction — expected, handled.
      "NotAllowedError",
      "AbortError",
    ],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
