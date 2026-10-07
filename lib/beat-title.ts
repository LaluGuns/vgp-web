/**
 * Display formatting for BeatStars titles. The raw titles are written for
 * BeatStars search ("ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT",
 * 'BUY 2 GET 1 HARD TRAP BEAT "CYBERWAR"'), so the store shows a clean name
 * and moves the descriptors to a quieter detail line. Data, slugs and SEO
 * keep the raw title.
 */

const PROMO = /\*?\bfree\b|\bbuy\s*2\s*get(\s*1)?\b/gi;

function isShouting(text: string) {
    const letters = text.replace(/[^a-z]/gi, '');
    return letters.length > 1 && letters === letters.toUpperCase();
}

function isWhispering(text: string) {
    const letters = text.replace(/[^a-z]/gi, '');
    return letters.length > 1 && letters === letters.toLowerCase();
}

const KEEP_UPPER = new Set(['UK', 'RNB', 'R&B', 'DJ', 'EDM', 'BPM', 'II', 'III', 'IV']);
const KEEP_LOWER = new Set(['x', 'of', 'the', 'and', 'in', 'a', 'to', 'for', 'by', 'on']);

function titleCaseWord(word: string, index: number) {
    if (!word) return word;
    if (/\d|\$/.test(word)) return word;
    if (KEEP_UPPER.has(word.toUpperCase())) return word.toUpperCase();
    const lower = word.toLowerCase();
    if (index > 0 && KEEP_LOWER.has(lower)) return lower;
    return lower
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
}

function normalizeCase(text: string) {
    if (!isShouting(text) && !isWhispering(text)) return text;
    return text
        .split(/\s+/)
        .map((word, index) => titleCaseWord(word, index))
        .join(' ');
}

function tidy(text: string) {
    return text
        .replace(PROMO, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/^[\s\-|·,]+|[\s\-|·,]+$/g, '')
        .trim();
}

export function formatBeatTitle(raw: string): { name: string; detail?: string } {
    const quoted = raw.match(/["“]([^"”]+)["”]/);
    let name: string;
    let rest: string[];

    if (quoted) {
        name = quoted[1];
        rest = [raw.replace(quoted[0], ' ')];
    } else {
        const parts = raw
            .split(/\s+[-–|]\s+|\s*[([]\s*|\s*[)\]]\s*/)
            .map((part) => part.trim())
            .filter(Boolean);
        name = parts[0] ?? raw;
        rest = parts.slice(1);
    }

    const cleanName = normalizeCase(tidy(name)) || normalizeCase(tidy(raw));
    const detail = rest.map((part) => normalizeCase(tidy(part))).filter(Boolean).join(' · ');

    return { name: cleanName, detail: detail || undefined };
}
