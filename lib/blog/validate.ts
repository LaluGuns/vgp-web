/**
 * Structural checks for articles. The article route runs them at build
 * time, so a missing figure, an unknown demo or a broken formula fails
 * the build instead of shipping a broken lesson.
 */

import katex from 'katex';
import type { BlogArticle } from '../blog-data';
import { categories } from '../blog-data';
import { isDemoId } from './demos';
import { INLINE_MATH, looksLikeMath } from './content';
import { glossary } from './glossary';

export function validateArticle(article: BlogArticle): string[] {
    const problems: string[] = [];
    const say = (msg: string) => problems.push(`${article.slug}: ${msg}`);
    const content = article.content;

    if (!categories.some((c) => c.slug === article.category)) say(`unknown category "${article.category}"`);

    // Escapes like \t or \f inside a template literal turn into control characters and break maths.
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content)) say('control character in content (an unescaped backslash in maths?)');

    const figureRefs = [...content.matchAll(/^::figure\s+([\w-]+)\s*$/gm)].map((m) => m[1]);
    const figures = article.figures ?? {};
    for (const id of figureRefs) if (!figures[id]) say(`::figure ${id} has no entry in figures`);
    for (const id of Object.keys(figures)) {
        const uses = figureRefs.filter((r) => r === id).length;
        if (uses !== 1) say(`figure "${id}" is placed ${uses} times`);
        if (!figures[id].caption?.trim() || !figures[id].alt?.trim()) say(`figure "${id}" needs a caption and alt text`);
    }

    for (const m of content.matchAll(/^::demo\s+([\w-]+)\s*$/gm)) if (!isDemoId(m[1])) say(`unknown demo "${m[1]}"`);
    for (const m of content.matchAll(/^::(\w+)/gm)) if (!['figure', 'demo', 'licenses'].includes(m[1])) say(`unknown directive ::${m[1]}`);

    // Figures and demos are framed panels; the experiment section is one too, and panels do not nest.
    const sections = content.split(/^## /m);
    for (const section of sections) {
        if (/^DAW experiment/i.test(section) && /^::(figure|demo)/m.test(section)) say('figure or demo inside the DAW experiment section');
    }

    for (const tex of [...content.matchAll(/\$\$([\s\S]+?)\$\$/g)].map((m) => m[1])) {
        try {
            katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: 'ignore' });
        } catch (e) {
            say(`maths does not render: ${tex.slice(0, 60)} (${(e as Error).message.slice(0, 80)})`);
        }
    }

    // Inline maths must render as maths, never as raw "$...$" text (lib/blog/content.ts decides).
    const prose = content
        .replace(/^```[\s\S]*?^```/gm, ' ')
        .replace(/\$\$[\s\S]+?\$\$/g, ' ')
        .replace(/`[^`\n]+`/g, ' ');
    const leftover = prose.replace(INLINE_MATH, (match: string, tex: string) => {
        if (!looksLikeMath(tex)) {
            say(`inline maths shows as text: ${match.slice(0, 60)} (write it so it reads as maths, e.g. $x/2$, or in words)`);
            return ' ';
        }
        try {
            katex.renderToString(tex, { throwOnError: true, strict: 'ignore' });
        } catch (e) {
            say(`inline maths does not render: ${match.slice(0, 60)} (${(e as Error).message.slice(0, 80)})`);
        }
        return ' ';
    });
    // A "$" that opens on a letter or a backslash but was not read as maths prints as a raw dollar sign.
    for (const m of leftover.matchAll(/\$(?=[A-Za-z\\({])[^\n]{0,40}/g)) say(`unmatched $ shows as text: ${m[0]}`);

    if (article.summary && (article.summary.length < 2 || article.summary.length > 4)) say('summary should have 2 to 4 points');
    article.quiz?.forEach((q, i) => {
        if (q.options.length < 3) say(`quiz ${i + 1} needs at least 3 options`);
        if (q.answer < 0 || q.answer >= q.options.length) say(`quiz ${i + 1} answer index out of range`);
        if (!q.why.trim()) say(`quiz ${i + 1} needs an explanation`);
    });

    return problems;
}

export function validateAll(articles: BlogArticle[]): string[] {
    const problems = articles.flatMap(validateArticle);
    const seen = new Set<string>();
    for (const a of articles) {
        if (seen.has(a.slug)) problems.push(`duplicate slug ${a.slug}`);
        seen.add(a.slug);
    }
    for (const term of glossary) {
        if (term.article && !seen.has(term.article)) problems.push(`glossary "${term.id}" links to missing article ${term.article}`);
    }
    return problems;
}
