/**
 * Server-side search text for the lesson library. Built once per server
 * process and sent as two short lowercase strings per lesson, so the browser
 * filters and ranks without loading any article bodies:
 * - headings: words from the section headings,
 * - terms: words from the SEO keywords and the glossary terms the lesson uses.
 * A title match outranks the excerpt, the excerpt outranks a heading and a
 * heading outranks a keyword (BlogIndex.tsx, `scoreLesson`).
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
 * The browser matches a typed word of four or more letters anywhere in a
 * word and a shorter one ("eq", "808") only at the start of a word. So a word
 * can be left out of a field when a word that starts with it is already
 * there or in a stronger field ("limiter" when "limiters" is in the title).
 */
function fresh(words: string[], stronger: string[]): string[] {
    const unique = [...new Set(words)].filter((w) => !stronger.some((s) => s.startsWith(w)));
    return unique.filter((w) => !unique.some((other) => other !== w && other.startsWith(w)));
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
