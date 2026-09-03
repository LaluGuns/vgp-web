import { nativePlatform } from "./native-bridge";

const FLOW_WEB_ORIGIN = "https://flow.virzyguns.com";
const API_PREFIXES = ["/api/", "/auth/"];

function shouldProxyPath(pathname: string): boolean {
  return API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function rewriteInput(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input === "string") {
    if (input.startsWith("/")) {
      const url = new URL(input, FLOW_WEB_ORIGIN);
      return shouldProxyPath(url.pathname) ? url.toString() : input;
    }
    return input;
  }

  if (input instanceof URL) {
    if (input.origin === window.location.origin && shouldProxyPath(input.pathname)) {
      return new URL(`${input.pathname}${input.search}${input.hash}`, FLOW_WEB_ORIGIN);
    }
    return input;
  }

  if (input instanceof Request) {
    const url = new URL(input.url);
    if (url.origin === window.location.origin && shouldProxyPath(url.pathname)) {
      const nextUrl = new URL(`${url.pathname}${url.search}${url.hash}`, FLOW_WEB_ORIGIN);
      return new Request(nextUrl, input);
    }
  }

  return input;
}

function installApiProxy(): void {
  if ((window as any).__FLOW_FETCH_PROXY_INSTALLED__) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => originalFetch(rewriteInput(input), init)) as typeof window.fetch;
  (window as any).__FLOW_FETCH_PROXY_INSTALLED__ = true;
}

function applyPersistedTheme(): void {
  const valid = ["glass", "studio", "editorial", "terminal"];
  let theme = "glass";
  try {
    const raw = localStorage.getItem("flowstate-ui-theme");
    if (raw) {
      const parsed = JSON.parse(raw);
      const stored = parsed?.state?.theme;
      if (valid.includes(stored)) theme = stored;
    }
  } catch {}
  document.documentElement.setAttribute("data-theme", theme);
}

export function installMobileRuntime(): void {
  window.__FLOW_MOBILE__ = true;
  document.documentElement.classList.add("dark");
  document.documentElement.setAttribute("data-flow-native", nativePlatform());
  document.documentElement.setAttribute("data-flow-mobile", "true");
  applyPersistedTheme();
  installApiProxy();

  if (!window.location.hash) {
    history.replaceState(null, "", "#/app");
  }
}
