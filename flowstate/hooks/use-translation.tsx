"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Locale, LANGUAGES, DEFAULT_LOCALE, dictionaries } from "@/lib/translations/dictionaries";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const saved = localStorage.getItem("flowstate-locale") as Locale;
    if (saved && Object.keys(LANGUAGES).includes(saved)) {
      setLocaleState(saved);
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0].toLowerCase() as Locale;
      if (Object.keys(LANGUAGES).includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    if (Object.keys(LANGUAGES).includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem("flowstate-locale", newLocale);
      document.cookie = `flowstate-locale=${newLocale}; path=/; max-age=31536000`;
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[locale] as any;
    if (!dict) return fallback || key;

    const parts = key.split(".");
    let current = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return fallback || key;
      }
    }
    return typeof current === "string" ? current : fallback || key;
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
