import process from "node:process";
import {
  SEO_SITE_URL,
  sitemapCandidates,
} from "../../lib/marketing/seo-registry.ts";

const EXPECTED_INDEXABLE_URLS = 160;
const DEFAULT_CONCURRENCY = 8;
const DEFAULT_TIMEOUT_MS = 20_000;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const PUBLIC_ORIGIN = new URL(SEO_SITE_URL).origin;
const PUBLIC_HOSTNAME = new URL(SEO_SITE_URL).hostname.toLowerCase();
const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function usage() {
  console.log(`Runtime SEO crawl

Usage:
  npm run seo:crawl -- [options]

Options:
  --base-url <url>      Deployment to fetch (default: BASE_URL or http://127.0.0.1:3000)
  --host <hostname>     Override the HTTP Host header (default: production host for localhost)
  --concurrency <n>     Parallel requests (default: ${DEFAULT_CONCURRENCY})
  --timeout-ms <n>      Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --help                Show this help

Examples:
  npm run seo:crawl -- --base-url http://127.0.0.1:3000
  npm run seo:crawl -- --base-url https://my-preview.vercel.app
  npm run seo:crawl -- --base-url https://flow.virzyguns.com`);
}

function takeValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${option} requires a value`);
  return value;
}

function positiveInteger(value, option) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${option} must be a positive integer`);
  }
  return parsed;
}

function parseArgs(args) {
  const config = {
    baseUrl: process.env.BASE_URL ?? "http://127.0.0.1:3000",
    host: process.env.SEO_CRAWL_HOST,
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    if (option === "--help") {
      usage();
      process.exit(0);
    }
    if (option === "--base-url") config.baseUrl = takeValue(args, index++, option);
    else if (option === "--host") config.host = takeValue(args, index++, option);
    else if (option === "--concurrency") {
      config.concurrency = positiveInteger(takeValue(args, index++, option), option);
    } else if (option === "--timeout-ms") {
      config.timeoutMs = positiveInteger(takeValue(args, index++, option), option);
    } else {
      throw new Error(`Unknown option: ${option}`);
    }
  }

  const base = new URL(config.baseUrl);
  if (!new Set(["http:", "https:"]).has(base.protocol)) {
    throw new Error("--base-url must use http or https");
  }
  base.pathname = base.pathname.replace(/\/+$/, "") || "/";
  base.search = "";
  base.hash = "";

  const local = LOCAL_HOSTNAMES.has(base.hostname.toLowerCase());
  const requestHost = config.host ?? (local ? new URL(SEO_SITE_URL).host : undefined);
  const effectiveHostname = (requestHost ?? base.host).split(":")[0].toLowerCase();

  return {
    ...config,
    base,
    local,
    requestHost,
    // NextRequest.nextUrl keeps the socket hostname in local development even
    // when Host is overridden. Treat local crawls as preview-policy checks;
    // production robots/header behavior is verified only on the real host.
    productionLike: !local && effectiveHostname === PUBLIC_HOSTNAME,
  };
}

function decodeEntities(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (match, entity) => {
    if (entity[0] !== "#") return named[entity.toLowerCase()] ?? match;
    const hexadecimal = entity[1]?.toLowerCase() === "x";
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match;
    }
  });
}

function attributes(tag) {
  const result = {};
  const body = tag.replace(/^<[^\s>]+|\/?\s*>$/g, "");
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of body.matchAll(pattern)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function startTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
}

function metaValues(html, key, value) {
  return startTags(html, "meta")
    .filter((attrs) => attrs[key]?.toLowerCase() === value.toLowerCase())
    .map((attrs) => attrs.content)
    .filter((content) => content !== undefined);
}

function linkTags(html, rel) {
  return startTags(html, "link").filter((attrs) =>
    (attrs.rel ?? "").toLowerCase().split(/\s+/).includes(rel.toLowerCase())
  );
}

function xmlLoc(block) {
  const match = block.match(/<loc>([\s\S]*?)<\/loc>/i);
  return match ? decodeEntities(match[1].trim()) : undefined;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => {
    const block = match[1];
    const alternates = startTags(block, "xhtml:link")
      .filter((attrs) => (attrs.rel ?? "").toLowerCase() === "alternate" && attrs.hreflang)
      .map((attrs) => ({ hreflang: attrs.hreflang, href: attrs.href }));
    return { loc: xmlLoc(block), alternates };
  });
}

function occurrences(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function duplicateValues(values) {
  return [...occurrences(values)].filter(([, count]) => count > 1).map(([value]) => value);
}

function compactList(values, limit = 8) {
  if (values.length <= limit) return values.join(", ");
  return `${values.slice(0, limit).join(", ")} (+${values.length - limit} more)`;
}

function sameEntries(actual, expected) {
  const actualEntries = Object.entries(actual).sort(([left], [right]) => left.localeCompare(right));
  const expectedEntries = Object.entries(expected).sort(([left], [right]) => left.localeCompare(right));
  return JSON.stringify(actualEntries) === JSON.stringify(expectedEntries);
}

function connectionUrl(base, publicUrlOrPath) {
  const source = new URL(publicUrlOrPath, PUBLIC_ORIGIN);
  const target = new URL(base);
  target.pathname = source.pathname;
  target.search = source.search;
  target.hash = "";
  return target;
}

function hostHeaders(host) {
  return host ? { host, "accept-language": "en" } : { "accept-language": "en" };
}

async function fetchWithRetry(url, { host, timeoutMs }) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: hostHeaders(host),
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (attempt === 1 && RETRYABLE_STATUS.has(response.status)) {
        await response.body?.cancel();
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
    }
  }
  throw lastError;
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function expectedOgLocale(locale) {
  const locales = {
    en: "en_US",
    id: "id_ID",
    "en-US": "en_US",
    "en-GB": "en_GB",
    "ja-JP": "ja_JP",
    "de-DE": "de_DE",
    "es-MX": "es_MX",
    "es-ES": "es_ES",
    "pt-BR": "pt_BR",
    "ko-KR": "ko_KR",
  };
  return locales[locale];
}

function routeParts(canonical) {
  const segments = new URL(canonical).pathname.split("/").filter(Boolean);
  return { locale: segments[0], path: segments.slice(1).join("/") };
}

function addError(errors, category, url, message) {
  errors.push({ category, url, message });
}

function parseHtmlPage(html, candidate, errors, baseUrl) {
  const canonical = candidate.url;
  const { locale } = routeParts(canonical);

  const canonicals = linkTags(html, "canonical").map((attrs) => attrs.href).filter(Boolean);
  if (canonicals.length !== 1) {
    addError(errors, "canonical", canonical, `expected exactly one canonical, found ${canonicals.length}`);
  } else if (canonicals[0] !== canonical) {
    addError(errors, "canonical", canonical, `expected ${canonical}, found ${canonicals[0]}`);
  }

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) addError(errors, "h1", canonical, `expected exactly one H1, found ${h1Count}`);

  const alternateTags = linkTags(html, "alternate").filter((attrs) => attrs.hreflang);
  const alternateDuplicates = duplicateValues(alternateTags.map((attrs) => attrs.hreflang));
  if (alternateDuplicates.length) {
    addError(errors, "hreflang", canonical, `duplicate hreflang values: ${compactList(alternateDuplicates)}`);
  }
  const alternates = Object.fromEntries(alternateTags.map((attrs) => [attrs.hreflang, attrs.href]));
  if (!sameEntries(alternates, candidate.alternates.languages)) {
    const expected = Object.entries(candidate.alternates.languages).map(([key, value]) => `${key}=${value}`);
    const actual = Object.entries(alternates).map(([key, value]) => `${key}=${value}`);
    addError(errors, "hreflang", canonical, `graph mismatch; expected [${compactList(expected)}], found [${compactList(actual)}]`);
  }
  if (alternates["x-default"] !== `${PUBLIC_ORIGIN}/en${routeParts(canonical).path ? `/${routeParts(canonical).path}` : ""}`) {
    addError(errors, "hreflang", canonical, "x-default does not point to the matching /en route");
  }

  const robots = [
    ...metaValues(html, "name", "robots"),
    ...metaValues(html, "name", "googlebot"),
  ];
  if (robots.some((value) => /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value))) {
    addError(errors, "robots-meta", canonical, `indexable page contains noindex: ${robots.join(" | ")}`);
  }

  const ogLocales = metaValues(html, "property", "og:locale");
  const expectedLocale = expectedOgLocale(locale);
  if (ogLocales.length !== 1 || ogLocales[0] !== expectedLocale) {
    addError(errors, "open-graph", canonical, `expected one og:locale=${expectedLocale}, found ${ogLocales.join(" | ") || "none"}`);
  }

  const ogUrls = metaValues(html, "property", "og:url");
  if (ogUrls.length !== 1 || ogUrls[0] !== canonical) {
    addError(errors, "open-graph", canonical, `expected one og:url=${canonical}, found ${ogUrls.join(" | ") || "none"}`);
  }

  const expectedImage = `${PUBLIC_ORIGIN}/${locale}/opengraph-image`;
  const ogImages = metaValues(html, "property", "og:image");
  const localizedImage = ogImages.some((image) => {
    try {
      const parsed = new URL(image);
      const expectedPath = `/${locale}/opengraph-image`;
      const sameLocalServer = LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase())
        && LOCAL_HOSTNAMES.has(baseUrl.hostname.toLowerCase())
        && parsed.port === baseUrl.port;
      const allowedOrigin = parsed.origin === PUBLIC_ORIGIN || parsed.origin === baseUrl.origin || sameLocalServer;
      return allowedOrigin && parsed.pathname === expectedPath;
    } catch {
      return false;
    }
  });
  if (ogImages.length < 1 || !localizedImage) {
    addError(errors, "open-graph", canonical, `expected og:image=${expectedImage}, found ${ogImages.join(" | ") || "none"}`);
  }

  const hrefs = startTags(html, "a").map((attrs) => attrs.href).filter(Boolean);
  return { alternates, hrefs };
}

function internalTargets(page, base) {
  const targets = [];
  for (const href of page.hrefs) {
    if (/^(?:mailto|tel|javascript|data|blob):/i.test(href) || href.startsWith("#")) continue;
    let target;
    try {
      target = new URL(href, page.canonical);
    } catch {
      continue;
    }
    if (!new Set([PUBLIC_ORIGIN, base.origin]).has(target.origin)) continue;
    target.hash = "";
    if (target.pathname.startsWith("/_next/")) continue;
    targets.push(`${target.pathname}${target.search}`);
  }
  return targets;
}

function assertRobotsText(text, productionLike, errors, url) {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const hasExactDisallowRoot = lines.some((line) => /^disallow:\s*\/$/i.test(line));
  if (productionLike) {
    if (hasExactDisallowRoot) addError(errors, "robots-txt", url, "production robots.txt disallows the entire site");
    if (!lines.some((line) => /^allow:\s*\/$/i.test(line))) {
      addError(errors, "robots-txt", url, "production robots.txt is missing Allow: /");
    }
    if (!lines.some((line) => line.toLowerCase() === `sitemap: ${PUBLIC_ORIGIN}/sitemap.xml`)) {
      addError(errors, "robots-txt", url, "production robots.txt is missing the public sitemap URL");
    }
  } else if (!hasExactDisallowRoot) {
    addError(errors, "robots-txt", url, "preview robots.txt must contain Disallow: /");
  }
}

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const errors = [];
  const expected = sitemapCandidates(PUBLIC_ORIGIN);
  const expectedUrls = expected.map((candidate) => candidate.url);
  const expectedByUrl = new Map(expected.map((candidate) => [candidate.url, candidate]));

  if (expected.length !== EXPECTED_INDEXABLE_URLS) {
    throw new Error(`Release registry produced ${expected.length} URLs; expected exactly ${EXPECTED_INDEXABLE_URLS}`);
  }
  const registryDuplicates = duplicateValues(expectedUrls);
  if (registryDuplicates.length) throw new Error(`Release registry has duplicate URLs: ${compactList(registryDuplicates)}`);

  console.log(`SEO crawl target: ${config.base.origin}`);
  console.log(`Request host policy: ${config.requestHost ?? config.base.host} (${config.productionLike ? "production" : "preview"})`);
  console.log(`Registry contract: ${expected.length} unique indexable URLs`);

  const sitemapUrl = connectionUrl(config.base, "/sitemap.xml");
  const sitemapResponse = await fetchWithRetry(sitemapUrl, config);
  if (sitemapResponse.status !== 200) {
    addError(errors, "sitemap", sitemapUrl.href, `HTTP ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  const sitemapEntries = parseSitemap(sitemapXml);
  const sitemapLocs = sitemapEntries.map((entry) => entry.loc).filter(Boolean);
  const sitemapDuplicates = duplicateValues(sitemapLocs);
  if (sitemapEntries.length !== EXPECTED_INDEXABLE_URLS) {
    addError(errors, "sitemap", sitemapUrl.href, `expected ${EXPECTED_INDEXABLE_URLS} <url> entries, found ${sitemapEntries.length}`);
  }
  if (sitemapDuplicates.length) {
    addError(errors, "sitemap", sitemapUrl.href, `duplicate <loc> values: ${compactList(sitemapDuplicates)}`);
  }
  const missingFromSitemap = expectedUrls.filter((url) => !sitemapLocs.includes(url));
  const extraInSitemap = sitemapLocs.filter((url) => !expectedByUrl.has(url));
  if (missingFromSitemap.length) addError(errors, "sitemap", sitemapUrl.href, `missing registry URLs: ${compactList(missingFromSitemap)}`);
  if (extraInSitemap.length) addError(errors, "sitemap", sitemapUrl.href, `unexpected URLs: ${compactList(extraInSitemap)}`);

  for (const entry of sitemapEntries) {
    const candidate = expectedByUrl.get(entry.loc);
    if (!candidate) continue;
    const duplicateAlternates = duplicateValues(entry.alternates.map(({ hreflang }) => hreflang));
    if (duplicateAlternates.length) {
      addError(errors, "sitemap", entry.loc, `duplicate sitemap hreflang values: ${compactList(duplicateAlternates)}`);
    }
    const actual = Object.fromEntries(entry.alternates.map(({ hreflang, href }) => [hreflang, href]));
    if (!sameEntries(actual, candidate.alternates.languages)) {
      addError(errors, "sitemap", entry.loc, "sitemap hreflang graph differs from the release registry");
    }
  }

  const pageResults = await mapConcurrent(expected, config.concurrency, async (candidate, index) => {
    const requestUrl = connectionUrl(config.base, candidate.url);
    try {
      const response = await fetchWithRetry(requestUrl, config);
      if ((index + 1) % 25 === 0 || index + 1 === expected.length) {
        console.log(`Crawled ${index + 1}/${expected.length} indexable pages`);
      }
      if (response.status !== 200) {
        addError(errors, "http", candidate.url, `HTTP ${response.status}`);
        await response.body?.cancel();
        return { canonical: candidate.url, alternates: {}, hrefs: [] };
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.toLowerCase().includes("text/html")) {
        addError(errors, "http", candidate.url, `expected text/html, found ${contentType || "no content-type"}`);
      }
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      if (config.productionLike && /noindex/i.test(xRobotsTag)) {
        addError(errors, "robots-header", candidate.url, `production response contains ${xRobotsTag}`);
      }
      if (!config.productionLike && !/noindex/i.test(xRobotsTag)) {
        addError(errors, "robots-header", candidate.url, "preview response is missing X-Robots-Tag: noindex");
      }
      const html = await response.text();
      return { canonical: candidate.url, ...parseHtmlPage(html, candidate, errors, config.base) };
    } catch (error) {
      addError(errors, "http", candidate.url, error instanceof Error ? error.message : String(error));
      return { canonical: candidate.url, alternates: {}, hrefs: [] };
    }
  });

  const pagesByCanonical = new Map(pageResults.map((page) => [page.canonical, page]));
  for (const page of pageResults) {
    for (const [hreflang, target] of Object.entries(page.alternates)) {
      if (hreflang === "x-default") continue;
      const reciprocal = pagesByCanonical.get(target)?.alternates;
      if (reciprocal && reciprocal[routeParts(page.canonical).locale] !== page.canonical) {
        addError(errors, "hreflang", page.canonical, `${target} does not reciprocate its ${hreflang} alternate`);
      }
    }
  }

  const linkTargets = [...new Set(pageResults.flatMap((page) => internalTargets(page, config.base)))].sort();
  console.log(`Checking ${linkTargets.length} unique same-origin navigation targets`);
  await mapConcurrent(linkTargets, config.concurrency, async (target) => {
    try {
      const response = await fetchWithRetry(connectionUrl(config.base, target), config);
      if (response.status >= 400) addError(errors, "internal-link", target, `HTTP ${response.status}`);
      await response.body?.cancel();
    } catch (error) {
      addError(errors, "internal-link", target, error instanceof Error ? error.message : String(error));
    }
  });

  const robotsUrl = connectionUrl(config.base, "/robots.txt");
  try {
    const response = await fetchWithRetry(robotsUrl, config);
    if (response.status !== 200) addError(errors, "robots-txt", robotsUrl.href, `HTTP ${response.status}`);
    assertRobotsText(await response.text(), config.productionLike, errors, robotsUrl.href);
  } catch (error) {
    addError(errors, "robots-txt", robotsUrl.href, error instanceof Error ? error.message : String(error));
  }

  if (config.local) {
    const previewHost = "seo-preview.invalid";
    const previewPage = connectionUrl(config.base, expected[0].url);
    try {
      const response = await fetchWithRetry(previewPage, { ...config, host: previewHost });
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      if (!/noindex/i.test(xRobotsTag)) {
        addError(errors, "preview-protection", previewPage.href, `Host ${previewHost} returned no X-Robots-Tag: noindex`);
      }
      await response.body?.cancel();
      const previewRobots = await fetchWithRetry(connectionUrl(config.base, "/robots.txt"), { ...config, host: previewHost });
      assertRobotsText(await previewRobots.text(), false, errors, robotsUrl.href);
    } catch (error) {
      addError(errors, "preview-protection", previewPage.href, error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length) {
    const grouped = Map.groupBy(errors, (error) => error.category);
    console.error(`\nSEO crawl failed with ${errors.length} defect(s):`);
    for (const [category, defects] of grouped) {
      console.error(`\n[${category}] ${defects.length}`);
      for (const defect of defects) console.error(`- ${defect.url}: ${defect.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`\nSEO crawl passed: ${expected.length} pages, ${sitemapEntries.length} sitemap entries, ${linkTargets.length} internal targets.`);
}

main().catch((error) => {
  console.error(`SEO crawl could not run: ${error instanceof Error ? error.stack : error}`);
  process.exitCode = 1;
});
