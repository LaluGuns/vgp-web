"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The WebGL wallpaper is ~heavy client-only work (shaders + zustand stores).
// `ssr: false` must live inside a client component (not the server page), so
// this tiny wrapper defers both the download and the mount until the browser
// is idle — the server-rendered gradient placeholder below paints instantly,
// so LCP never waits on the bundle.
const WebGLBackground = dynamic(
  () =>
    import("@/components/scenes/webgl-background").then(
      (m) => m.WebGLBackground
    ),
  { ssr: false }
);

// Static stand-in for the cosmic scene: same fixed -z-20 stacking slot the
// canvas uses, painted with the canonical midnight palette so there is no
// flash and zero layout shift when the real canvas fades in.
const MIDNIGHT_GRADIENT =
  "radial-gradient(120% 100% at 50% 0%, hsl(250 45% 12%) 0%, hsl(258 60% 5%) 55%, hsl(260 55% 3%) 100%)";

export function LandingBackground() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Mount after idle (fallback timeout for Safari) so hydration of the
    // landing copy wins the main thread first.
    if (typeof window === "undefined") return;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const mount = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(mount, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(mount, 200);
    }
    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {!ready && (
        <div
          aria-hidden
          className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
          style={{ background: MIDNIGHT_GRADIENT }}
        />
      )}
      {ready && <WebGLBackground forceScene />}
    </>
  );
}
