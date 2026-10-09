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

function searchText(article: BlogArticle): string {
    const terms = termsIn(article.content, article.category).flatMap((t) => [t.term, ...t.forms]);
    const words = [...article.seo.keywords, ...headings(article.content), ...terms].map((w) => w.toLowerCase());
    return [...new Set(words)].join(' · ');
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
