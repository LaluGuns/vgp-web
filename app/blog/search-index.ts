/**
 * Server-side search text for the lesson library. Built once per server
 * process and sent as two short lowercase strings per lesson, so the browser
 * filters and ranks without loading any article bodies:
 * - headings: words from the section headings,
 * - terms: words from the SEO keywords and the glossary terms the lesson uses.
 * A title match outranks the excerpt, the excerpt outranks a heading and a
 * heading outranks a keyword (BlogIndex.tsx, `scoreLesson`).
 *
 * The lesson bodies reach search through a separate digest
 * (/blog/search-digest.json, `searchDigest`): the words a lesson's body uses
 * that few other lessons do. The list fetches it only once the reader starts
 * a search, so /blog itself stays as light as before.
 */

import type { BlogArticle } from '@/lib/blog-data';
import { termsIn } from '@/lib/blog/glossary';

const ROLE_PREFIX = /^(?:hook|why it matters(?: in the (?:mix|session|room))?|science model|daw experiment|common mistake|producer takeaway)\s*:?\s*/i;

function headings(content: string): string[] {
    return [...content.matchAll(/^#{2,3}\s+(.+)$/gm)]
        .map((m) => m[1].replace(/\*\*/g, '').replace(ROLE_PREFIX, '').trim())
        .filter((h) => h && !/^(?:references|sources)$/i.test(h));
}

const STOP = new Set('an of to in on is it by or at as be do if so up we my me no the and for with you your are was were what when why how not from that this into than then its can does'.split(' '));
const tokens = (text: string) =>
    text
        .toLowerCase()
        .split(/[\s,;:!?·()"“”'‘’/]+/)
        .filter((w) => w.length > 1 && !STOP.has(w));

/**
 * True when `word` can be left out because `other` already finds it. The
 * browser matches a typed word of four or more letters anywhere in a word and
 * a shorter one ("eq", "808") at the start of a word; a short plural it
 * searches as a whole word ("pads" finds "pad" and "pads", not "padding").
 * So "limiter" can go when "limiters" is there, but "pad" stays beside "padding".
 */
const covers = (other: string, word: string) =>
    other.startsWith(word) && (word.length >= 4 || other === word || other === `${word}s` || other === `${word}es`);

/** The words not already found through a stronger field or a longer word in the same one. */
function fresh(words: string[], stronger: string[]): string[] {
    const unique = [...new Set(words)].filter((w) => !stronger.some((s) => covers(s, w)));
    return unique.filter((w) => !unique.some((other) => other !== w && covers(other, w)));
}

function searchFields(article: BlogArticle): { headings: string; terms: string } {
    const shown = tokens(`${article.title} ${article.excerpt}`);
    const headingWords = fresh(tokens(headings(article.content).join(' ')), shown);
    const glossaryTerms = termsIn(article.content, article.category).flatMap((t) => [t.term, ...t.forms]);
    const termWords = fresh(tokens([...article.seo.keywords, ...glossaryTerms].join(' ')), [...shown, ...headingWords]);
    return { headings: headingWords.join(' '), terms: termWords.join(' ') };
}

// Keyed by the article object, so an edited lesson (a new object) is indexed again.
const cache = new WeakMap<BlogArticle, { headings: string; terms: string }>();

export function lessonSearchFields(article: BlogArticle): { headings: string; terms: string } {
    let fields = cache.get(article);
    if (fields === undefined) {
        fields = searchFields(article);
        cache.set(article, fields);
    }
    return fields;
}

/** A body word goes into the digest only while at most this many lessons use it; commoner words find too much to help. */
const DIGEST_MAX_LESSONS = 5;

/** Body prose only: no headings (indexed already), sources, figures, demos, maths, code or link targets. */
function bodyWords(content: string): Set<string> {
    const prose = content
        .replace(/^#{2,3}\s+(?:references|sources)\s*$[\s\S]*?(?=^#{2}\s|(?![\s\S]))/gim, ' ')
        .replace(/^#{2,3}\s+.*$/gm, ' ')
        .replace(/^::.*$/gm, ' ')
        .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/\]\([^)]*\)/g, ' ')
        .replace(/https?:\/\/\S+/g, ' ');
    const words = new Set<string>();
    for (const raw of prose.toLowerCase().split(/[^\p{L}\p{N}'’-]+/u)) {
        const word = raw.replace(/^['’-]+|['’-]+$/g, '').replace(/['’]s$/, '');
        if (word.length < 3 || STOP.has(word)) continue;
        // Bare numbers (years, pages, frequencies) find nothing useful; "sm7b" or "la-2a" stay.
        if (/^[\d.,-]+$/.test(word)) continue;
        words.add(word);
    }
    return words;
}

let digestCache: { source: readonly BlogArticle[]; digest: Record<string, string> } | undefined;

/**
 * slug -> space-separated words from the lesson's body that at most
 * DIGEST_MAX_LESSONS lessons use and its title, excerpt, headings and terms
 * do not already cover. Searched last, so a body match never outranks a title.
 */
export function searchDigest(articles: readonly BlogArticle[]): Record<string, string> {
    if (digestCache?.source === articles) return digestCache.digest;
    const bodies = articles.map((article) => bodyWords(article.content));
    const lessonsUsing = new Map<string, number>();
    for (const words of bodies) for (const word of words) lessonsUsing.set(word, (lessonsUsing.get(word) ?? 0) + 1);
    const digest: Record<string, string> = {};
    articles.forEach((article, i) => {
        const fields = lessonSearchFields(article);
        const indexed = [...tokens(`${article.title} ${article.excerpt}`), ...`${fields.headings} ${fields.terms}`.split(' ')];
        const rare = [...bodies[i]].filter((word) => (lessonsUsing.get(word) ?? 0) <= DIGEST_MAX_LESSONS);
        const words = fresh(rare, indexed);
        if (words.length) digest[article.slug] = words.join(' ');
    });
    digestCache = { source: articles, digest };
    return digest;
}
