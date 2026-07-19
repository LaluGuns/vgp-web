import { NextRequest, NextResponse } from "next/server";
import { legacyLocaleRedirectDestination, localePath } from "@/lib/marketing/seo-registry";

// Base dictionary routes plus country-specific destinations. Country routes
// can render now but remain noindex until their per-page release is reviewed.
const LOCALES = ["en", "id", "es", "fr", "de", "ja", "ko", "zh", "pt", "ru", "it", "en-US", "en-GB", "ja-JP", "de-DE", "es-MX", "es-ES", "pt-BR", "ko-KR"];
const DEFAULT_LOCALE = "en";

function resolveLocale(req: NextRequest): string {
  const cookie = req.cookies.get("flowstate-locale")?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  const accept = req.headers.get("accept-language");
  if (accept) {
    for (const part of accept.split(",")) {
      const raw = part.split(";")[0].trim();
      const exact = LOCALES.find((locale) => locale.toLowerCase() === raw.toLowerCase());
      if (exact) return exact;
      const base = raw.split("-")[0].toLowerCase();
      if (LOCALES.includes(base)) return base;
    }
  }
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const localeSegment = pathname.split("/")[1];

  if (LOCALES.includes(localeSegment)) {
    const path = pathname.split("/").slice(2).join("/");
    const destination = legacyLocaleRedirectDestination(localeSegment, path);
    if (destination) {
      const url = req.nextUrl.clone();
      url.pathname = localePath(destination, path);
      return NextResponse.redirect(url, 308);
    }

    // No geo-IP redirects. Legacy and country URLs remain directly accessible;
    // SEO indexability is determined by the page-level release registry.
    return NextResponse.next();
  }

  const locale = resolveLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!api|auth|_next|opengraph-image|.*\\.).*)"],
};
