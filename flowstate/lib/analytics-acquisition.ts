export type AcquisitionClass = "organic" | "referral" | "direct" | "internal" | "bot" | "staff";

const SEARCH_DOMAINS = [
  "google.com", "google.co.id", "google.co.uk", "bing.com", "duckduckgo.com",
  "search.yahoo.com", "yahoo.com", "yandex.com", "yandex.ru", "baidu.com",
  "ecosia.org", "search.brave.com", "brave.com", "startpage.com",
];

function matchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

export function classifyAcquisition(referrer: string, hostname: string, userAgent = ""): AcquisitionClass {
  const currentHost = hostname.toLowerCase();
  if (/bot|crawler|spider|slurp|facebookexternalhit/i.test(userAgent)) return "bot";
  if (currentHost === "localhost" || currentHost.endsWith(".vercel.app") || currentHost.includes("staging")) return "staff";
  if (!referrer) return "direct";
  try {
    const referrerHost = new URL(referrer).hostname.toLowerCase();
    if (matchesDomain(referrerHost, currentHost)) return "internal";
    if (SEARCH_DOMAINS.some((domain) => matchesDomain(referrerHost, domain))) return "organic";
    return "referral";
  } catch { return "direct"; }
}
