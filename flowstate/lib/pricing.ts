// Pay-what-you-want pricing config with multi-currency support.
// Amounts are in the currency's main unit (USD dollars, IDR rupiah, JPY yen, ...).
// `perUsd` is an approximate FX rate used only to convert the chosen amount into
// USD cents for the Lemon Squeezy checkout (the MoR does final localization/charging).

export interface Currency {
  code: string;
  symbol: string;
  label: string;
  min: number; // minimum payment in this currency (~ $1)
  step: number; // slider step
  suggested: number[]; // monthly quick-pick amounts
  perUsd: number; // 1 USD ≈ perUsd units of this currency
  decimals: number;
}

// Minimums are calibrated to a ~$5 USD floor. Lemon Squeezy charges 5% + $0.50 per
// transaction (+0.5% for subscriptions), so a $1 floor lost ~55% of revenue to the flat
// fee alone every renewal; $5 brings the effective fee down to ~15%.
export const CURRENCIES: Record<string, Currency> = {
  USD: { code: "USD", symbol: "$", label: "US Dollar", min: 5, step: 1, suggested: [5, 10, 20, 50], perUsd: 1, decimals: 2 },
  IDR: { code: "IDR", symbol: "Rp", label: "Rupiah", min: 80000, step: 20000, suggested: [80000, 160000, 320000, 800000], perUsd: 16000, decimals: 0 },
  EUR: { code: "EUR", symbol: "€", label: "Euro", min: 5, step: 1, suggested: [5, 10, 20, 50], perUsd: 0.92, decimals: 2 },
  JPY: { code: "JPY", symbol: "¥", label: "Yen", min: 800, step: 100, suggested: [800, 1600, 3200, 8000], perUsd: 155, decimals: 0 },
  GBP: { code: "GBP", symbol: "£", label: "Pound", min: 4, step: 1, suggested: [4, 8, 16, 40], perUsd: 0.79, decimals: 2 },
  SGD: { code: "SGD", symbol: "S$", label: "SGD", min: 7, step: 1, suggested: [7, 14, 28, 70], perUsd: 1.35, decimals: 2 },
};

// Map a country (from locale) to a default currency.
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD", ID: "IDR", JP: "JPY", GB: "GBP", SG: "SGD",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR", AT: "EUR", PT: "EUR", FI: "EUR",
};

export function detectCurrency(): string {
  if (typeof navigator === "undefined") return "USD";
  const lang = navigator.language || "en-US";
  const region = (lang.split("-")[1] || "").toUpperCase();
  const code = COUNTRY_CURRENCY[region];
  return code && CURRENCIES[code] ? code : "USD";
}

export function formatCurrency(amount: number, code: string): string {
  const c = CURRENCIES[code] ?? CURRENCIES.USD;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c.code,
      maximumFractionDigits: c.decimals,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${c.symbol}${amount}`;
  }
}

// Convert a chosen amount in `code` to USD cents for Lemon Squeezy custom_price.
export function toUsdCents(amount: number, code: string): number {
  const c = CURRENCIES[code] ?? CURRENCIES.USD;
  return Math.max(100, Math.round((amount / c.perUsd) * 100));
}

export const BILLING = {
  monthly: { id: "monthly", label: "Monthly", multiplier: 1, suffix: "/mo" },
  yearly: { id: "yearly", label: "Yearly", multiplier: 10, suffix: "/yr" },
} as const;

export type BillingInterval = keyof typeof BILLING;
