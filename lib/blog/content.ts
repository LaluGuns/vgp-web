/**
 * Turns article markdown into blocks the article page can lay out.
 * Runs on the server only, so KaTeX never ships to the browser.
 *
 * Supported: ## and ### headings, paragraphs, - and 1. lists, tables,
 * $$display$$ and $inline$ math, **bold**, *italic*, [links](url),
 * and `::figure <id>`, `::demo <id>` and `::licenses` lines. See docs/ARTICLES.md.
 */

import katex from 'katex';
import { findTerms, type GlossaryEntry } from './glossary';

export type Block =
    | { kind: 'p'; html: string }
    | { kind: 'h3'; html: string }
    | { kind: 'ul'; items: string[] }
    | { kind: 'ol'; items: string[]; start: number }
    | { kind: 'math'; html: string }
    | { kind: 'code'; text: string }
    | { kind: 'table'; head: string[]; rows: string[][] }
    | { kind: 'figure'; id: string }
    | { kind: 'demo'; id: string }
    | { kind: 'licenses' };

export type SectionRole = 'intro' | 'why' | 'science' | 'experiment' | 'mistake' | 'takeaway' | 'references' | 'plain';

export interface Section {
    id: string;
    role: SectionRole;
    /** Small label shown above the heading, from the role. */
    label?: string;
    title: string;
    blocks: Block[];
}

export interface ParsedArticle {
    lead: Block[];
    sections: Section[];
    /** Glossary entries linked in the text, in order of first use. */
    terms: GlossaryEntry[];
}

// Heading prefixes that mark a section's job. Authors write
// "## DAW experiment: hearing before seeing"; readers see the label
// "Try it" above the heading "Hearing before seeing".
const ROLES: { match: RegExp; role: SectionRole; label?: string }[] = [
    { match: /^hook\b\s*:?\s*/i, role: 'intro' },
    { match: /^why it matters\b(?:\s+in the (?:mix|session|room))?\s*:?\s*/i, role: 'why', label: 'Why it matters' },
    { match: /^science model\b\s*:?\s*/i, role: 'science', label: 'The science' },
    { match: /^daw experiment\b\s*:?\s*/i, role: 'experiment', label: 'Try it' },
    { match: /^common mistake\b\s*:?\s*/i, role: 'mistake', label: 'Common mistake' },
    { match: /^producer takeaway\b\s*:?\s*/i, role: 'takeaway', label: 'Takeaway' },
    { match: /^(?:references|sources)\s*$/i, role: 'references' },
];

function classifyHeading(raw: string): { role: SectionRole; label?: string; title: string } {
    const text = raw.replace(/\*\*/g, '').trim();
    for (const { match, role, label } of ROLES) {
        const m = text.match(match);
        if (!m) continue;
        const rest = text.slice(m[0].length).trim();
        if (role === 'references') return { role, title: 'Sources' };
        if (!rest) return { role, title: label ?? text };
        return { role, label, title: rest.charAt(0).toUpperCase() + rest.slice(1) };
    }
    return { role: 'plain', title: text };
}

// ── Math ─────────────────────────────────────────────────────────────

function renderMath(tex: string, displayMode: boolean): string {
    return katex.renderToString(tex.trim(), { displayMode, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
}

// $...$ is maths when it opens on a non-space character and closes before a
// non-digit. Prices like "$15 to $30" never match: the second "$" is followed
// by a digit. Maths that starts with a digit must still look like maths: a
// sign (\\ ^ _ { } = / × ± − ·), a number with a letter on it ("2M", "0.5x")
// or terms joined by + or - ("1 + g").
export const INLINE_MATH = /(?<![\\$\w])\$(?=[^\s$])([^$\n]+?)(?<=[^\s$])\$(?![\d$\w])/g;
export const looksLikeMath = (tex: string) =>
    !/^\d/.test(tex) ||
    /[\\^_{}=/×±−·]/.test(tex) ||
    /^\d+(?:\.\d+)?\s?[a-zA-Z]/.test(tex) ||
    /[\w)]\s*[+-]\s*[\w(]/.test(tex);

// ── Inline formatting ────────────────────────────────────────────────

function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isExternal(href: string) {
    return /^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?virzyguns\.com/.test(href);
}

interface InlineContext {
    /** Glossary terms not yet linked in this article. */
    pending: Map<string, GlossaryEntry>;
    used: GlossaryEntry[];
}

function linkTerms(html: string, ctx: InlineContext): string {
    if (ctx.pending.size === 0) return html;
    // Only touch text between tags, and never inside a link.
    let insideLink = 0;
    return html
        .split(/(<[^>]+>)/)
        .map((part) => {
            if (part.startsWith('<')) {
                if (/^<a[\s>]/.test(part)) insideLink++;
                if (part === '</a>') insideLink--;
                return part;
            }
            if (insideLink > 0 || !part.trim()) return part;
            return findTerms(part, ctx.pending, (entry, match) => {
                ctx.pending.delete(entry.id);
                ctx.used.push(entry);
                return `<button type="button" class="vgp-term" popovertarget="term-${entry.id}" aria-haspopup="dialog">${match}</button>`;
            });
        })
        .join('');
}

function inline(text: string, ctx?: InlineContext): string {
    const stash: string[] = [];
    const keep = (html: string) => `\u0000${stash.push(html) - 1}\u0000`;

    // Code first, so nothing inside backticks is read as maths or a link.
    let out = text.replace(/`([^`\n]+)`/g, (_, code: string) => keep(`<code class="vgp-code">${escapeHtml(code)}</code>`));
    out = out.replace(INLINE_MATH, (match: string, tex: string) => (looksLikeMath(tex) ? keep(renderMath(tex, false)) : match));

    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, href: string) => {
        const external = isExternal(href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return keep(`<a href="${escapeHtml(href)}" class="vgp-inline-link"${attrs}>${inlineMarks(escapeHtml(label))}</a>`);
    });

    // Bare URLs, as in reference lists.
    out = out.replace(/(^|[\s(])(https?:\/\/[^\s)<]+[^\s)<.,;:])/g, (_, lead: string, href: string) => {
        return lead + keep(`<a href="${escapeHtml(href)}" class="vgp-inline-link break-all" target="_blank" rel="noopener noreferrer">${escapeHtml(href.replace(/^https?:\/\//, ''))}</a>`);
    });

    out = inlineMarks(escapeHtml(out));
    if (ctx) out = linkTerms(out, ctx);
    return out.replace(/\u0000(\d+)\u0000/g, (_, i: string) => stash[Number(i)]);
}

function inlineMarks(html: string): string {
    return html
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(“"])\*(?=\S)([^*]+?)(?<=\S)\*(?=$|[\s.,;:!?)”"])/g, '$1<em>$2</em>');
}

// ── Blocks ───────────────────────────────────────────────────────────

function parseTable(lines: string[]): Block | null {
    const cells = (row: string) =>
        row
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim());
    if (lines.length < 2 || !/^\s*\|?\s*:?-{3,}/.test(lines[1])) return null;
    return {
        kind: 'table',
        head: cells(lines[0]).map((c) => inline(c)),
        rows: lines.slice(2).map((row) => cells(row).map((c) => inline(c))),
    };
}

export function parseArticle(content: string, glossary: GlossaryEntry[] = []): ParsedArticle {
    const lines = content.replace(/\r\n?/g, '\n').split('\n');
    const ctx: InlineContext = { pending: new Map(glossary.map((g) => [g.id, g])), used: [] };

    const lead: Block[] = [];
    const sections: Section[] = [];
    let blocks = lead;
    let paragraph: string[] = [];

    const flush = () => {
        if (paragraph.length === 0) return;
        const text = paragraph.join(' ').trim();
        paragraph = [];
        if (!text) return;
        // A paragraph that is only display math.
        const display = text.match(/^\$\$([\s\S]+)\$\$$/);
        if (display) {
            blocks.push({ kind: 'math', html: renderMath(display[1], true) });
            return;
        }
        // References and plain sections keep terms unlinked.
        const current = sections[sections.length - 1];
        const linkable = current && current.role !== 'references';
        blocks.push({ kind: 'p', html: inline(text, linkable ? ctx : undefined) });
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            flush();
            continue;
        }

        const h2 = line.match(/^##\s+(.*)$/);
        if (h2) {
            flush();
            const { role, label, title } = classifyHeading(h2[1]);
            const section: Section = { id: `section-${sections.length}`, role, label, title, blocks: [] };
            if (sections.length === 0 && role === 'plain') section.role = 'intro';
            sections.push(section);
            blocks = section.blocks;
            continue;
        }

        const h3 = line.match(/^###\s+(.*)$/);
        if (h3) {
            flush();
            blocks.push({ kind: 'h3', html: inline(h3[1].replace(/\*\*/g, '')) });
            continue;
        }

        const directive = trimmed.match(/^::(figure|demo)\s+([\w-]+)\s*$/);
        if (directive) {
            flush();
            blocks.push({ kind: directive[1] as 'figure' | 'demo', id: directive[2] });
            continue;
        }
        if (trimmed === '::licenses') {
            flush();
            blocks.push({ kind: 'licenses' });
            continue;
        }

        // Fenced block: shown as monospaced text. Use $$ for formulas.
        if (trimmed.startsWith('```')) {
            flush();
            const body: string[] = [];
            while (++i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i]);
            blocks.push({ kind: 'code', text: body.join('\n') });
            continue;
        }

        // Display math across lines: $$ ... $$
        if (trimmed.startsWith('$$') && !(trimmed.length > 4 && trimmed.endsWith('$$'))) {
            flush();
            const body = [trimmed.slice(2)];
            while (++i < lines.length && !lines[i].includes('$$')) body.push(lines[i]);
            if (i < lines.length) body.push(lines[i].slice(0, lines[i].indexOf('$$')));
            blocks.push({ kind: 'math', html: renderMath(body.join('\n'), true) });
            continue;
        }

        if (trimmed.startsWith('|')) {
            flush();
            const rows = [trimmed];
            while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) rows.push(lines[++i].trim());
            const table = parseTable(rows);
            if (table) blocks.push(table);
            else paragraph.push(...rows);
            continue;
        }

        // "- item" or "* item". An italic line starts with "*Word", so it is not a bullet.
        if (/^[-*]\s+/.test(trimmed)) {
            flush();
            const items = [trimmed.replace(/^[-*]\s+/, '')];
            while (i + 1 < lines.length && /^[-*]\s+/.test(lines[i + 1].trim())) items.push(lines[++i].trim().replace(/^[-*]\s+/, ''));
            const linkable = sections[sections.length - 1]?.role !== 'references';
            blocks.push({ kind: 'ul', items: items.map((t) => inline(t, linkable ? ctx : undefined)) });
            continue;
        }

        const ol = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (ol) {
            flush();
            const start = Number(ol[1]);
            const items = [ol[2]];
            while (i + 1 < lines.length && /^\d+\.\s+/.test(lines[i + 1].trim())) items.push(lines[++i].trim().replace(/^\d+\.\s+/, ''));
            // Experiment steps become checkbox labels, so they stay free of term buttons.
            const role = sections[sections.length - 1]?.role;
            const linkable = role !== 'experiment' && role !== 'references';
            blocks.push({ kind: 'ol', start, items: items.map((t) => inline(t, linkable ? ctx : undefined)) });
            continue;
        }

        paragraph.push(trimmed);
    }
    flush();

    return { lead, sections, terms: ctx.used };
}

/** Plain-text word count of the prose, for reading time. */
export function countWords(content: string): number {
    return content
        .replace(/\$\$[\s\S]*?\$\$/g, ' ')
        .replace(/^::.*$/gm, ' ')
        .replace(/[#*|`_\-[\]()]/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
}
