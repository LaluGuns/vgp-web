import type { ReactNode } from 'react';
import type { BlogArticle } from '@/lib/blog-data';
import type { Block, ParsedArticle, Section } from '@/lib/blog/content';
import { getArticleBySlug } from '@/lib/blog-data';
import { dialectForCategory } from '@/lib/blog/dialects';
import { Figure } from '@/components/blog/figures/Figure';
import { DemoSlot } from '@/components/blog/demos/DemoSlot';
import { CodeBlock } from './CodeBlock';
import { ExperimentSteps } from './ExperimentSteps';
import { LicenseTable } from './LicenseTable';
import { TermPlacement } from './TermPlacement';
import { ScrollRegion } from './ScrollRegion';

const html = (value: string) => ({ __html: value });

/** Column name shown before each value when a table stacks on phones: "Price: $15". */
function phoneLabel(head: string) {
    const text = head.replace(/<[^>]+>/g, '').trim();
    return !text ? '' : /[?:.!]$/.test(text) ? `${text} ` : `${text}: `;
}

function Paragraph({ value, lede }: { value: string; lede?: boolean }) {
    return <p className={lede ? 'my-6 text-xl leading-9 text-white/90' : 'my-6'} dangerouslySetInnerHTML={html(value)} />;
}

function Heading({ section }: { section: Section }) {
    return (
        <>
            {section.label ? <p className="mb-2 text-sm font-medium text-white/50">{section.label}</p> : null}
            <h2 id={section.id} className="scroll-mt-8 text-2xl font-semibold leading-snug tracking-[-0.02em] text-white sm:text-3xl">
                {section.title}
            </h2>
        </>
    );
}

interface RenderContext {
    article: BlogArticle;
    figureNumber: () => number;
}

function renderBlock(block: Block, key: string, section: Section | null, ctx: RenderContext, lede = false): ReactNode {
    switch (block.kind) {
        case 'p':
            return <Paragraph key={key} value={block.html} lede={lede} />;
        case 'h3':
            return <h3 key={key} className="mb-3 mt-10 text-xl font-semibold text-white" dangerouslySetInnerHTML={html(block.html)} />;
        case 'ul':
            return (
                <ul key={key} className="my-6 space-y-3">
                    {block.items.map((item, i) => (
                        <li key={i} className="relative pl-6">
                            <span className="absolute left-1 top-[0.8em] h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                            <span dangerouslySetInnerHTML={html(item)} />
                        </li>
                    ))}
                </ul>
            );
        case 'ol':
            if (section?.role === 'experiment') {
                return <ExperimentSteps key={key} steps={block.items} storageKey={`${ctx.article.slug}:${key}`} />;
            }
            return (
                <ol key={key} className="my-6 space-y-3" start={block.start}>
                    {block.items.map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <span className="w-6 shrink-0 tabular-nums text-white/50">{block.start + i}.</span>
                            <span dangerouslySetInnerHTML={html(item)} />
                        </li>
                    ))}
                </ol>
            );
        case 'math':
            return (
                <ScrollRegion key={key} label="Equation" className="vgp-math my-8 border-y border-white/10 py-6 text-center text-base text-white sm:text-xl">
                    <div dangerouslySetInnerHTML={html(block.html)} />
                </ScrollRegion>
            );
        case 'code':
            return <CodeBlock key={key} text={block.text} />;
        case 'table':
            // On phones each row becomes a small card, so nothing hides behind a sideways scroll.
            // A cell too wide even for that (a long formula) scrolls inside the region.
            return (
                <ScrollRegion key={key} label="Table" className="vgp-table my-8 sm:rounded-[6px] sm:border sm:border-white/10">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-white/20">
                                {/* An empty corner cell is not a column header: a <td>, so it is not announced as one. */}
                                {block.head.map((cell, i) =>
                                    cell.trim() ? (
                                        <th key={i} className="px-4 py-3 text-sm font-semibold text-white" dangerouslySetInnerHTML={html(cell)} />
                                    ) : (
                                        <td key={i} className="px-4 py-3" />
                                    ),
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-white/[0.07] last:border-0">
                                    {row.map((cell, ci) => (
                                        <td
                                            key={ci}
                                            data-label={phoneLabel(block.head[ci] ?? '')}
                                            className={`px-4 py-3 align-top text-sm leading-6 ${ci === 0 ? 'font-medium text-white' : 'text-white/75'}`}
                                            dangerouslySetInnerHTML={html(cell)}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollRegion>
            );
        case 'figure': {
            const spec = ctx.article.figures?.[block.id];
            if (!spec) return null;
            return <Figure key={key} spec={spec} number={ctx.figureNumber()} dialect={dialectForCategory(ctx.article.category)} />;
        }
        case 'demo':
            return <DemoSlot key={key} id={block.id} dialect={dialectForCategory(ctx.article.category).name} />;
        case 'licenses':
            return <LicenseTable key={key} />;
    }
}

function SectionView({ section, ctx, first }: { section: Section; ctx: RenderContext; first: boolean }) {
    const blocks = section.blocks.map((block, i) =>
        renderBlock(block, `${section.id}-${i}`, section, ctx, first && i === 0 && block.kind === 'p'),
    );
    // Plain <section>s: a name would make each one a region landmark, and a lesson
    // would list a dozen of them. The headings carry the structure.
    switch (section.role) {
        case 'experiment':
            return (
                <section className="my-16 rounded-[6px] border border-white/10 bg-[var(--surface)] px-4 py-7 sm:px-8 sm:py-9">
                    <Heading section={section} />
                    <div className="vgp-experiment">{blocks}</div>
                </section>
            );
        case 'mistake':
            return (
                <section className="my-16 border-l-2 border-white/25 pl-5 sm:pl-7">
                    <Heading section={section} />
                    {blocks}
                </section>
            );
        case 'takeaway':
            return (
                <section className="mt-16 border-t border-white/10 pt-9">
                    <Heading section={section} />
                    <div className="text-white/90">{blocks}</div>
                </section>
            );
        case 'references': {
            // The heading sits outside <summary>, so it stays a heading for screen readers.
            const count = section.blocks.reduce((n, b) => n + (b.kind === 'ul' || b.kind === 'ol' ? b.items.length : b.kind === 'p' ? 1 : 0), 0);
            return (
                <section className="mt-14 border-t border-white/10 pt-6">
                    <h2 id={section.id} className="scroll-mt-8 text-base font-semibold text-white">
                        Sources
                    </h2>
                    {/* Opened by OpenDetails (ArticleChrome) for a #sources link and for print, where the toggle is left out. */}
                    <details className="group">
                        <summary className="vgp-focus flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-sm text-white/60 hover:text-white print:hidden [&::-webkit-details-marker]:hidden">
                            <span className="group-open:hidden">Show {count === 1 ? 'the source' : `all ${count}`}</span>
                            <span className="hidden group-open:inline">Hide sources</span>
                            <span aria-hidden="true" className="transition-transform group-open:rotate-180">
                                ▾
                            </span>
                        </summary>
                        <div className="vgp-sources mt-1 text-sm leading-6 text-white/65">{blocks}</div>
                    </details>
                </section>
            );
        }
        default:
            return (
                <section className={first ? 'mt-2' : 'mt-16'}>
                    <Heading section={section} />
                    {blocks}
                </section>
            );
    }
}

function TermPopovers({ terms }: { terms: ParsedArticle['terms'] }) {
    if (terms.length === 0) return null;
    const markup = terms
        .map((term) => {
            const target = term.article ? getArticleBySlug(term.article) : undefined;
            const more = target
                ? `<a class="vgp-term-more" href="/blog/${target.slug}">Read: ${escape(target.title)}</a>`
                : '';
            // Links first, then Close: Tab from the term walks into the popover in this order.
            return `<div id="term-${term.id}" popover class="vgp-term-pop" role="dialog" aria-label="${escape(term.term)}">
<p class="vgp-term-name">${escape(term.term)}</p>
<p>${escape(term.definition)}</p>
<div class="vgp-term-actions"><div class="vgp-term-links">${more}<a class="vgp-term-all" href="/learn/glossary#${term.id}">All terms</a></div><button type="button" popovertarget="term-${term.id}" popovertargetaction="hide">Close</button></div>
</div>`;
        })
        .join('');
    return <div dangerouslySetInnerHTML={html(markup)} />;
}

function escape(text: string) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function ArticleBody({ article, parsed }: { article: BlogArticle; parsed: ParsedArticle }) {
    let figures = 0;
    const ctx: RenderContext = { article, figureNumber: () => ++figures };
    return (
        <div className="article-content text-lg leading-8 text-white/80">
            {parsed.lead.map((block, i) => renderBlock(block, `lead-${i}`, null, ctx, i === 0 && block.kind === 'p'))}
            {parsed.sections
                .filter((section) => section.role !== 'references')
                .map((section, i) => (
                    <SectionView key={section.id} section={section} ctx={ctx} first={i === 0 && parsed.lead.length === 0} />
                ))}
            <TermPopovers terms={parsed.terms} />
            {parsed.terms.length > 0 ? <TermPlacement /> : null}
        </div>
    );
}

/** The reference list, shown after the quiz so the lesson ends on practice, not citations. */
export function ArticleSources({ article, parsed }: { article: BlogArticle; parsed: ParsedArticle }) {
    const sources = parsed.sections.filter((section) => section.role === 'references');
    if (sources.length === 0) return null;
    const ctx: RenderContext = { article, figureNumber: () => 0 };
    return (
        <div className="article-content text-lg leading-8 text-white/80">
            {sources.map((section) => (
                <SectionView key={section.id} section={section} ctx={ctx} first={false} />
            ))}
        </div>
    );
}
