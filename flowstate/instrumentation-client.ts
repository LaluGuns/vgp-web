// Client-side error tracking. No-op unless the DSN is configured.
//
// The Sentry SDK is deliberately NOT imported statically: the full
// @sentry/nextjs browser bundle costs ~2.4s of scripting on a throttled
// mobile CPU, and a static import here lands it in the critical chunk of
// every page (it dominated landing TBT). Instead the SDK is dynamic-imported
// after window load + idle; errors thrown before init are buffered by tiny
// listeners and flushed once Sentry is up, so nothing is lost.
//
// Session replay stays OFF (PostHog owns replay when enabled) to keep the
// bundle lean and avoid double-recording users.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

type RouterTransitionStart = (href: string, navigationType: string) => void;
let sentryRouterTransitionStart: RouterTransitionStart | null = null;

if (dsn && typeof window !== "undefined") {
  const errorBuffer: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    errorBuffer.push(event.error ?? event.message);
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    errorBuffer.push(event.reason);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  const boot = () => {
    import("@sentry/nextjs")
      .then((Sentry) => {
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
        sentryRouterTransitionStart = Sentry.captureRouterTransitionStart;
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
        for (const buffered of errorBuffer) Sentry.captureException(buffered);
        errorBuffer.length = 0;
      })
      .catch(() => {
        // SDK failed to load (offline, blocked) — drop the buffer quietly.
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
        errorBuffer.length = 0;
      });
  };

  const afterIdle = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(boot, { timeout: 5000 });
    } else {
      setTimeout(boot, 1500);
    }
  };
  if (document.readyState === "complete") {
    afterIdle();
  } else {
    window.addEventListener("load", afterIdle, { once: true });
  }
}

// Next.js calls this on every client-side navigation. Before Sentry has
// booted it is a cheap no-op; afterwards it forwards to the real hook.
export const onRouterTransitionStart: RouterTransitionStart = (
  href,
  navigationType
) => {
  sentryRouterTransitionStart?.(href, navigationType);
};
