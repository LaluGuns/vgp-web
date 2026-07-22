"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { type Locale, LANGUAGES, DEFAULT_LOCALE, dictionaries } from "@/lib/translations/dictionaries";
import { baseLanguageForLocale, isSupportedSeoLocale, type SeoRouteLocale } from "@/lib/marketing/seo-registry";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: SeoRouteLocale) => void;
  t: (key: string, fallback?: string) => string;
}

function resolveTranslation(dictionary: object, key: string): string | undefined {
  let current: unknown = dictionary;
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);
  const router = useRouter();
  const pathname = usePathname();

  // The URL segment (/[lang]) is the source of truth — keep state in sync when
  // navigation changes the route locale.
  useEffect(() => {
    if (initialLocale) setLocaleState(initialLocale);
  }, [initialLocale]);

  // Legacy client-only detection, used ONLY when no route locale was supplied
  // (e.g. a page rendered outside the [lang] segment). With locale routing the
  // middleware already resolved the language, so this stays dormant.
  useEffect(() => {
    if (initialLocale) return;
    const saved = localStorage.getItem("flowstate-locale") as Locale;
    if (saved && Object.keys(LANGUAGES).includes(saved)) {
      setLocaleState(saved);
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0].toLowerCase() as Locale;
      if (Object.keys(LANGUAGES).includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, [initialLocale]);

  const setLocale = (newLocale: SeoRouteLocale) => {
    if (!isSupportedSeoLocale(newLocale)) return;
    setLocaleState(baseLanguageForLocale(newLocale) as Locale);
    localStorage.setItem("flowstate-locale", newLocale);
    // Persist for the middleware so future visits resolve this language.
    document.cookie = `flowstate-locale=${newLocale}; path=/; max-age=31536000`;

    // The URL is the source of truth: swap the leading /[lang] segment so the
    // language change is a real navigation (keeps content and URL in sync = SEO).
    const segments = (pathname || "/").split("/");
    if (isSupportedSeoLocale(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/") || `/${newLocale}`);
  };

  const t = (key: string, fallback?: string): string => {
    const localized = resolveTranslation(dictionaries[locale], key);
    if (localized !== undefined) return localized;

    const english = resolveTranslation(dictionaries[DEFAULT_LOCALE], key);
    return english ?? fallback ?? key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key: string, fallback?: string) => fallback || key,
    };
  }
  return context;
}
