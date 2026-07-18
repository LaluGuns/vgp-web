// Registry for the /alternatives/<slug> cluster.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";
import { getBrainfmCopy } from "./brainfm";
import { getEndelCopy } from "./endel";
import { getFlocusCopy } from "./flocus";
import { getPomofocusCopy } from "./pomofocus";
import { getNoisliCopy } from "./noisli";

export const ALTERNATIVE_SLUGS = [
  "brainfm",
  "endel",
  "flocus",
  "pomofocus",
  "noisli",
] as const;
export type AlternativeSlug = (typeof ALTERNATIVE_SLUGS)[number];

const registry: Record<AlternativeSlug, (locale: Locale) => AlternativeCopy> = {
  brainfm: getBrainfmCopy,
  endel: getEndelCopy,
  flocus: getFlocusCopy,
  pomofocus: getPomofocusCopy,
  noisli: getNoisliCopy,
};

export function getAlternativeCopy(locale: Locale, slug: AlternativeSlug): AlternativeCopy {
  return registry[slug](locale);
}

export type { AlternativeCopy } from "./types";
