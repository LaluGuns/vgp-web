/**
 * Server-side search text for the lesson library: keywords, section
 * headings and the glossary terms each lesson uses. Built once per server
 * process and sent as one short lowercase string per lesson, so the
 * browser filters without loading any article bodies.
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
 * The browser matches each typed word as a substring, so the index only needs
 * the distinct words the title and excerpt do not already contain, and no word
 * that sits inside a longer one ("limiter" inside "limiters").
 */
function searchText(article: BlogArticle): string {
    const terms = termsIn(article.content, article.category).flatMap((t) => [t.term, ...t.forms]);
    const shown = `${article.title} ${article.excerpt}`.toLowerCase();
    const words = [...new Set(tokens([...article.seo.keywords, ...headings(article.content), ...terms].join(' ')))].filter(
        (w) => !shown.includes(w),
    );
    return words.filter((w) => !words.some((other) => other !== w && other.includes(w))).join(' ');
}

// Keyed by the article object, so an edited lesson (a new object) is indexed again.
const cache = new WeakMap<BlogArticle, string>();

export function lessonSearchText(article: BlogArticle): string {
    let text = cache.get(article);
    if (text === undefined) {
        text = searchText(article);
        cache.set(article, text);
    }
    return text;
}
