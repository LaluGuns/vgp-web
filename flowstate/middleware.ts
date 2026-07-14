import { NextRequest, NextResponse } from "next/server";

// Locale routing only. Keep this list in sync with lib/translations/dictionaries.ts.
const LOCALES = ["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it"];
const DEFAULT_LOCALE = "en";

function resolveLocale(req: NextRequest): string {
  // 1. Explicit choice (cookie set by the language switcher) wins.
  const cookie = req.cookies.get("flowstate-locale")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  // 2. Otherwise fall back to the browser's Accept-Language preference.
  const accept = req.headers.get("accept-language");
  if (accept) {
    for (const part of accept.split(",")) {
      const code = part.split(";")[0].trim().split("-")[0].toLowerCase();
      if (LOCALES.includes(code)) return code;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Already locale-prefixed → let it through untouched (every /{locale}/… URL
  // stays directly reachable and crawlable — no cloaking, no geo redirects).
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  // Unprefixed request → 307 (temporary) redirect to the resolved locale.
  const locale = resolveLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Run on pages only: skip API, auth callbacks, Next internals, the OG image
  // route, and any path with a file extension (sitemap.xml, robots.txt, *.png…).
  matcher: ["/((?!api|auth|_next|opengraph-image|.*\\.).*)"],
};
