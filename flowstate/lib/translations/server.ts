// Server-side dictionary access for React Server Components.
//
// Mirrors the lookup rules of `useTranslation()` (hooks/use-translation.tsx):
// exact key in the active locale → English fallback → caller fallback → key.
// This is NOT a new i18n system — it reads the same `dictionaries` object the
// client provider uses, so server-rendered copy and client copy always agree.
import {
  dictionaries,
  DEFAULT_LOCALE,
  LANGUAGES,
  type Locale,
} from "./dictionaries";

function resolveTranslation(dictionary: object, key: string): string | undefined {
  let current: unknown = dictionary;
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

/** Coerce a raw /[lang] segment to a supported locale (layout does the same). */
export function resolveLocale(lang: string): Locale {
  return (Object.keys(LANGUAGES) as string[]).includes(lang)
    ? (lang as Locale)
    : DEFAULT_LOCALE;
}

/** Build a `t(key, fallback?)` translator usable in server components. */
export function getTranslator(locale: Locale) {
  return (key: string, fallback?: string): string => {
    const localized = resolveTranslation(dictionaries[locale], key);
    if (localized !== undefined) return localized;

    const english = resolveTranslation(dictionaries[DEFAULT_LOCALE], key);
    return english ?? fallback ?? key;
  };
}
