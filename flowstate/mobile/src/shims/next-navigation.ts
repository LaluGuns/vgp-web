import { useEffect, useMemo, useState } from "react";

const WEB_ORIGIN = "https://flow.virzyguns.com";
const ROUTE_EVENT = "flow-mobile-route";

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

function routeKind(path: string): "app" | "login" | "external" {
  const clean = path.split("?")[0].replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, "");
  if (clean === "/app" || clean === "" || clean === "/") return "app";
  if (clean === "/login") return "login";
  return "external";
}

function hashFor(path: string): string {
  const kind = routeKind(path);
  if (kind === "login") return `#/login${path.includes("?") ? `?${path.split("?")[1]}` : ""}`;
  return "#/app";
}

export function mobileNavigate(rawHref: string, replace = false): void {
  const href = normalizeInternalPath(rawHref);
  const kind = routeKind(href);

  if (kind === "external" || /^https?:\/\//i.test(href)) {
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

function mobilePathname(): string {
  const locale = preferredLocale();
  const hash = window.location.hash || "#/app";
  return hash.startsWith("#/login") ? `/${locale}/login` : `/${locale}/app`;
}

function mobileSearch(): string {
  const hash = window.location.hash || "";
  const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : "";
  return query;
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
  useRouteVersion();
  return useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : mobileSearch()), [typeof window === "undefined" ? "" : window.location.hash]);
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
