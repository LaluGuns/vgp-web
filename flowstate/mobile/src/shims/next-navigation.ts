import { useEffect, useMemo, useState } from "react";

const WEB_ORIGIN = "https://flow.virzyguns.com";
const ROUTE_EVENT = "flow-mobile-route";
const INTERNAL_ROUTES = new Set(["app", "login", "pricing", "insights"]);

type MobileRoute = "app" | "login" | "pricing" | "insights";

function preferredLocale(): string {
  try {
    const stored = localStorage.getItem("flowstate-locale");
    if (stored) return stored;
  } catch {}
  const base = typeof navigator !== "undefined" ? navigator.language.split("-")[0].toLowerCase() : "en";
  return ["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it"].includes(base) ? base : "en";
}

function normalizeInternalPath(href: string): string {
  if (!href) return `/${preferredLocale()}/app`;
  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      if (url.origin === WEB_ORIGIN) return `${url.pathname}${url.search}${url.hash}`;
    } catch {}
    return href;
  }
  if (!href.startsWith("/")) return `/${href}`;
  return href;
}

function routeFromPath(path: string): MobileRoute | "external" {
  const pathname = path.split("?")[0].split("#")[0];
  // Strip a locale only when it is a complete path segment. Without the
  // lookahead, /app was incorrectly parsed as locale /ap + route p.
  const clean = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, "");
  const segment = (clean.replace(/^\//, "").split("/")[0] || "app").toLowerCase();
  return INTERNAL_ROUTES.has(segment) ? segment as MobileRoute : "external";
}

function queryFromPath(path: string): string {
  const query = path.includes("?") ? path.slice(path.indexOf("?") + 1).split("#")[0] : "";
  return query ? `?${query}` : "";
}

function hashFor(path: string): string {
  const route = routeFromPath(path);
  if (route === "external") return "#/app";
  return `#/${route}${queryFromPath(path)}`;
}

export function mobileNavigate(rawHref: string, replace = false): void {
  const href = normalizeInternalPath(rawHref);
  const route = routeFromPath(href);

  if (route === "external" || (/^https?:\/\//i.test(href) && !href.startsWith(WEB_ORIGIN))) {
    const target = /^https?:\/\//i.test(href) ? href : `${WEB_ORIGIN}${href}`;
    const nativeOpen = (window as any).Capacitor?.Plugins?.FlowNative?.openExternal;
    if (typeof nativeOpen === "function") {
      nativeOpen({ url: target }).catch(() => window.open(target, "_blank", "noopener,noreferrer"));
    } else {
      window.open(target, "_blank", "noopener,noreferrer");
    }
    return;
  }

  const nextHash = hashFor(href);
  if (replace) history.replaceState(null, "", nextHash);
  else history.pushState(null, "", nextHash);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

function routeFromHash(hash: string): MobileRoute {
  const route = hash.replace(/^#\//, "").split("?")[0].toLowerCase();
  return INTERNAL_ROUTES.has(route) ? route as MobileRoute : "app";
}

function mobilePathname(): string {
  const locale = preferredLocale();
  return `/${locale}/${routeFromHash(window.location.hash || "#/app")}`;
}

function mobileSearch(): string {
  const hash = window.location.hash || "";
  return hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
}

function useRouteVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const update = () => setVersion((value) => value + 1);
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    window.addEventListener(ROUTE_EVENT, update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
      window.removeEventListener(ROUTE_EVENT, update);
    };
  }, []);
  return version;
}

export function usePathname(): string {
  useRouteVersion();
  return typeof window === "undefined" ? "/en/app" : mobilePathname();
}

export function useSearchParams(): URLSearchParams {
  const version = useRouteVersion();
  return useMemo(
    () => new URLSearchParams(typeof window === "undefined" ? "" : mobileSearch()),
    [version],
  );
}

export function useParams(): Record<string, string> {
  const pathname = usePathname();
  return { lang: pathname.split("/")[1] || "en" };
}

export function useRouter() {
  useRouteVersion();
  return {
    push: (href: string) => mobileNavigate(String(href), false),
    replace: (href: string) => mobileNavigate(String(href), true),
    back: () => history.back(),
    forward: () => history.forward(),
    refresh: () => window.location.reload(),
    prefetch: async () => undefined,
  };
}

export function redirect(href: string): never {
  mobileNavigate(href, true);
  throw new Error("FLOW_MOBILE_REDIRECT");
}

export function notFound(): never {
  throw new Error("FLOW_MOBILE_NOT_FOUND");
}
