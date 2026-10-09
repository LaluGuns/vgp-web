import type { BlogArticle } from '../blog-data';

/**
 * Minutes a lesson takes: its prose at 220 words a minute (a typical rate
 * for instructional non-fiction), 15 s to read each figure, 30 s to play
 * each demo and a minute for the quiz. Rounded, never under 2. The
 * validator checks every lesson's `readingTime` against it, so the "min
 * read" on a card always means the same thing.
 */
export function readingMinutes(article: Pick<BlogArticle, 'content' | 'quiz'>): number {
    const content = article.content;
    const figures = (content.match(/^::figure\s/gm) ?? []).length;
    const demos = (content.match(/^::demo\s/gm) ?? []).length;
    const prose = content
        .replace(/^::.*$/gm, ' ')
        .replace(/^```[\s\S]*?^```/gm, ' ')
        .replace(/\$\$[\s\S]+?\$\$/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#*_`>|]/g, ' ');
    const words = prose.split(/\s+/).filter(Boolean).length;
    const minutes = words / 220 + figures * 0.25 + demos * 0.5 + (article.quiz?.length ? 1 : 0);
    return Math.max(2, Math.round(minutes));
}
