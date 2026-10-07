'use client';

/**
 * Article page: reading-first layout with a thin progress bar, a sticky
 * outline on desktop and one collapsible outline on mobile.
 */

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Check, Copy, Share2 } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { MasterclassShareModal } from '@/components/blog/MasterclassShareModal';
import type { BlogArticle, Category } from '@/lib/blog-data';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface ArticlePageProps {
    article: BlogArticle;
    category?: Category;
    related: BlogArticle[];
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

const actionClass =
    'inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-medium text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

export function ArticlePage({ article, category, related }: ArticlePageProps) {
    const hasMedicalOrHearingClaims =
        /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i.test(article.content) ||
        /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i.test(article.excerpt);

    const [mounted, setMounted] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('');
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    const headings = useMemo(() => {
        const matches = Array.from(article.content.matchAll(/^##\s+(.*$)/gm));
        return matches.map((match, index) => ({ title: match[1].replace(/\*\*/g, '').trim(), id: `section-${index}` }));
    }, [article.content]);

    // Only real bullets from the article; no filler when there are fewer than two.
    const keyTakeaways = useMemo(() => {
        const bullets = Array.from(article.content.matchAll(/^- (.*$)/gm)).map((m) => m[1].replace(/\*\*/g, '').trim());
        return bullets.length >= 2 ? bullets.slice(0, 4) : [];
    }, [article.content]);

    const html = useMemo(() => formatContent(article.content), [article.content]);

    useEffect(() => {
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setScrollPercent(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);

            let current = headings[0]?.id ?? '';
            for (const heading of headings) {
                const el = document.getElementById(heading.id);
                if (el && el.getBoundingClientRect().top <= 140) current = heading.id;
            }
            setActiveSection(current);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [headings]);

    useEffect(() => {
        let cancelled = false;
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            requestAnimationFrame(() => {
                if (!cancelled) setIsBookmarked(saved.includes(article.slug));
            });
        } catch {
            // Saving is optional when browser storage is unavailable.
        }
        return () => {
            cancelled = true;
        };
    }, [article.slug]);

    const toggleBookmark = () => {
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            const updated = saved.includes(article.slug) ? saved.filter((s) => s !== article.slug) : [...saved, article.slug];
            localStorage.setItem('vgp_bookmarked_articles', JSON.stringify(updated));
            setIsBookmarked(!isBookmarked);
        } catch {
            // Saving is optional when browser storage is unavailable.
        }
    };

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(() => {});
        }
    };

    const outline = (
        <ol className="space-y-1">
            {headings.map((h, i) => {
                const isActive = activeSection === h.id;
                return (
                    <li key={h.id}>
                        <a
                            href={`#${h.id}`}
                            aria-current={isActive ? 'location' : undefined}
                            className={`flex gap-3 border-l py-1.5 pl-3 text-sm leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                                isActive ? 'border-white text-white' : 'border-white/10 text-white/55 hover:text-white'
                            }`}
                        >
                            <span className="w-5 shrink-0 tabular-nums text-white/40">{i + 1}.</span>
                            <span>{h.title}</span>
                        </a>
                    </li>
                );
            })}
        </ol>
    );

    const actions = (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <button type="button" onClick={toggleBookmark} aria-pressed={isBookmarked} className={actionClass}>
                <Bookmark size={16} className={isBookmarked ? 'fill-current text-white' : ''} aria-hidden="true" />
                {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <button type="button" onClick={handleCopyLink} className={actionClass}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
            </button>
            <button type="button" onClick={() => setShowShareModal(true)} className={actionClass}>
                <Share2 size={16} aria-hidden="true" />
                Share
            </button>
        </div>
    );

    return (
        <PageTransition>
            {mounted &&
                createPortal(
                    <div
                        aria-hidden="true"
                        className="pointer-events-none fixed left-0 top-0 z-[9999] h-0.5 bg-sky-300"
                        style={{ width: `${scrollPercent}%` }}
                    />,
                    document.body,
                )}

            <article className="editorial-shell text-white">
                <header className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/55">
                            <Link href="/blog" className="vgp-link hover:text-white">Articles</Link>
                            <span aria-hidden="true">/</span>
                            <Link href={`/blog/category/${article.category}`} className="vgp-link hover:text-white">
                                {category?.name || article.category}
                            </Link>
                        </nav>
                        <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                            {article.title}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{article.excerpt}</p>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-2">
                            <p className="text-sm text-white/55">
                                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> · {article.readingTime} min read
                            </p>
                            {actions}
                        </div>
                    </div>
                </header>

                <div className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <div className="min-w-0 lg:col-span-8">
                            {keyTakeaways.length > 0 ? (
                                <section aria-labelledby="key-points" className="mb-10 border-b border-white/10 pb-8">
                                    <h2 id="key-points" className="text-sm font-medium text-white/55">Key points</h2>
                                    <ul className="mt-3 space-y-2 text-base leading-7 text-white/85">
                                        {keyTakeaways.map((takeaway) => (
                                            <li key={takeaway} className="relative pl-5">
                                                <span className="absolute left-0 top-[0.7em] h-1 w-1 rounded-full bg-white/60" aria-hidden="true" />
                                                {takeaway}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ) : null}

                            {headings.length > 0 ? (
                                <details className="group mb-10 border-b border-white/10 pb-6 lg:hidden">
                                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-base font-medium text-white">
                                        In this article ({headings.length})
                                        <span className="text-sm text-white/55 group-open:hidden">Show</span>
                                        <span className="hidden text-sm text-white/55 group-open:inline">Hide</span>
                                    </summary>
                                    <div className="mt-3">{outline}</div>
                                </details>
                            ) : null}

                            <div
                                className="article-content max-w-[68ch] text-lg leading-8 text-white/80"
                                dangerouslySetInnerHTML={{ __html: html }}
                            />

                            {hasMedicalOrHearingClaims ? (
                                <aside className="mt-12 max-w-[68ch] border-y border-white/10 py-6 text-sm leading-6 text-white/65">
                                    <p className="font-semibold text-white">Hearing safety and educational use</p>
                                    <p className="mt-2">
                                        The physiological and acoustic ideas in this article are for music production and learning.
                                        They are not medical advice, diagnosis or treatment. Loud monitoring and long sessions can
                                        damage hearing, so keep levels moderate (around 80 to 85 dB SPL or lower) and take breaks.
                                        If you notice ringing, discomfort or hearing changes, see a licensed medical professional.
                                    </p>
                                </aside>
                            ) : null}

                            <section aria-labelledby="author-heading" className="mt-14 flex max-w-[68ch] flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-start">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[6px] bg-black">
                                    <Image src="/images/founder.jpg" alt="Portrait of Virzy Guns" fill sizes="80px" className="object-cover object-[50%_25%]" />
                                </div>
                                <div>
                                    <h2 id="author-heading" className="text-base font-semibold text-white">Written by Virzy Guns</h2>
                                    <p className="mt-1 text-sm leading-6 text-white/65">
                                        Songwriter and producer, founder of Virzy Guns Production. Now building HealingWave.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                        <TextLink href="/studio/beats">Browse beats</TextLink>
                                        <TextLink href="/about">About Virzy Guns</TextLink>
                                    </div>
                                </div>
                            </section>

                            {article.seo.keywords.length > 0 ? (
                                <p className="mt-10 max-w-[68ch] text-sm leading-6 text-white/50">
                                    Topics: {article.seo.keywords.join(', ')}
                                </p>
                            ) : null}
                        </div>

                        <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
                            <div className="sticky top-28 space-y-8">
                                {headings.length > 0 ? (
                                    <nav aria-label="In this article">
                                        <p className="mb-3 text-sm font-medium text-white">In this article</p>
                                        <div className="max-h-[60vh] overflow-y-auto pr-1">{outline}</div>
                                    </nav>
                                ) : null}
                                <p className="text-xs text-white/50">{Math.round(scrollPercent)}% read</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </article>

            {related.length > 0 ? (
                <section aria-labelledby="related-heading" className="border-t border-white/10 px-4 pb-20 pt-14 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
                        <h2 id="related-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl lg:col-span-4">
                            Keep reading
                        </h2>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {related.map((rel) => (
                                <li key={rel.slug}>
                                    <Link href={`/blog/${rel.slug}`} className="group block py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                                        <span className="text-xs text-white/50">{rel.readingTime} min read</span>
                                        <span className="mt-2 block text-lg font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            {rel.title}
                                        </span>
                                        <span className="mt-1 line-clamp-2 block text-base leading-7 text-white/65">{rel.excerpt}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            ) : null}

            <MasterclassShareModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                article={{
                    title: article.title,
                    excerpt: article.excerpt,
                    slug: article.slug,
                }}
                categoryName={category?.name}
                readingTime={`${article.readingTime || 4} min read`}
                logoSrc="/branding/logo-tg.png"
                siteUrl="https://www.virzyguns.com"
            />
        </PageTransition>
    );
}

// Markdown-like content formatter. Headings get ids for the outline; math renders with KaTeX.
function formatContent(content: string): string {
    let sectionCount = 0;

    // Helper to repair JS string escape sequence corruptions & restore stripped TeX commands
    const sanitizeLatex = (str: string) => {
        return str
            .replace(/\x0crac/g, '\\frac')
            .replace(/\\rac\b/g, '\\frac')
            .replace(/\x09ext/g, '\\text')
            .replace(/\\ext\b/g, '\\text')
            .replace(/\x09imes/g, '\\times')
            .replace(/\\imes\b/g, '\\times')
            .replace(/\x09au/g, '\\tau')
            .replace(/\\au\b/g, '\\tau')
            .replace(/\x09heta/g, '\\theta')
            .replace(/\\heta\b/g, '\\theta')
            .replace(/\x08egin/g, '\\begin')
            .replace(/\\egin\b/g, '\\begin')
            .replace(/\x08eta/g, '\\beta')
            .replace(/\\eta\b/g, '\\beta')
            .replace(/\x0dight/g, '\\right')
            .replace(/\\ight\b/g, '\\right')
            .replace(/\x0dho/g, '\\rho')
            .replace(/\\ho\b/g, '\\rho')
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            // Restore stripped backslashes for standard TeX keywords
            .replace(/(^|[^a-zA-Z\\])(Delta|delta|sum|cdot|lambda|pi|alpha|sigma|omega|phi|left|right|log|sin|sqrt|le|ge)\b/g, '$1\\$2');
    };

    // 0. Pre-process Code Fences (```text ... ```) into KaTeX Display Math
    let formatted = content.replace(/```(?:text|math)?\s*([\s\S]*?)\s*```/g, (_, codeContent) => {
        const rawMath = sanitizeLatex(codeContent.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto border-y border-white/10 py-6 text-center">
                    <div class="inline-block text-white text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-white font-mono">${rawMath}</div>`;
        }
    });

    // 0b. Pre-process backticked math formulas (`f_n = ...`) into KaTeX Display Math
    formatted = formatted.replace(/`([^`\n]*?=[^`\n]*?)`/g, (_, mathContent) => {
        const rawMath = sanitizeLatex(
            mathContent.trim()
                .replace(/\\times/g, '\\times ')
                .replace(/×/g, '\\times ')
                .replace(/·/g, '\\cdot ')
                .replace(/Σ/g, '\\sum_{n=0}^{N-1} ')
                .replace(/λ/g, '\\lambda ')
                .replace(/π/g, '\\pi ')
                .replace(/°/g, '^\\circ')
                .replace(/≤/g, '\\le ')
                .replace(/≥/g, '\\ge ')
        );

        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto border-y border-white/10 py-6 text-center">
                    <div class="inline-block text-white text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-white font-mono">${rawMath}</div>`;
        }
    });

    // 1. Process Display Math Formulas ($$...$$) using KaTeX
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (_, mathContent) => {
        const rawMath = sanitizeLatex(mathContent.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto border-y border-white/10 py-6 text-center">
                    <div class="inline-block text-white text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-white font-mono">${rawMath}</div>`;
        }
    });

    // 2. Process Inline Math Variables ($...$) using KaTeX
    formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (_, inlineMath) => {
        const rawMath = sanitizeLatex(inlineMath.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: false,
                throwOnError: false,
            });
            return `<span class="inline-block mx-1 text-white">${renderedHtml}</span>`;
        } catch {
            return `<span class="inline-block mx-1 font-mono text-white">${rawMath}</span>`;
        }
    });

    // 3. Process Markdown Tables
    formatted = formatted.replace(/((?:^\s*\|.*\|\s*\r?\n)+)/gm, (match) => {
        const rows = match.trim().split(/\r?\n/).map(r => r.trim());
        if (rows.length < 2) return match;

        const headerCells = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');
        if (!rows[1].includes('---')) return match;

        const bodyRows = rows.slice(2).map(row => {
            return row.split('|').map(c => c.trim()).filter(c => c !== '');
        });

        const headerHtml = `
            <thead>
                <tr class="border-b border-white/20">
                    ${headerCells.map(h => `<th class="py-3 px-4 text-left text-sm font-semibold text-white whitespace-nowrap">${h}</th>`).join('')}
                </tr>
            </thead>
        `;

        const bodyHtml = `
            <tbody>
                ${bodyRows.map((cells) => `
                    <tr class="border-b border-white/[0.07]">
                        ${cells.map((c, i) => `<td class="py-3 px-4 text-sm align-top ${i === 0 ? 'text-white font-medium' : 'text-white/75'}">${c}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;

        // Trim and end on a fresh line so a heading right after the table still matches ^###.
        return `<div class="my-8 overflow-x-auto rounded-md border border-white/10">
                <table class="w-full min-w-[520px] border-collapse text-left">
                    ${headerHtml}
                    ${bodyHtml}
                </table>
            </div>\n\n`;
    });

    // 4. H2 headings with ids for the outline
    formatted = formatted.replace(/^## (.*$)/gm, (_, titleText) => {
        const id = `section-${sectionCount++}`;
        const cleanTitle = titleText.replace(/\*\*/g, '').trim();
        return `<h2 id="${id}" class="scroll-mt-28 mt-14 mb-5 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-snug text-white">${cleanTitle}</h2>`;
    });

    // 5. H3 headings
    formatted = formatted.replace(/^### (.*$)/gm, `<h3 class="mt-10 mb-3 text-xl font-semibold text-white">$1</h3>`);

    // 6. Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, `<strong class="text-white font-semibold">$1</strong>`);

    // 7. Bullet lists
    formatted = formatted.replace(/^- (.*$)/gm, `<div class="relative mb-3 pl-6 text-white/80"><span class="absolute left-1 top-[0.8em] h-1 w-1 rounded-full bg-white/60" aria-hidden="true"></span>$1</div>`);

    // 8. Numbered lists
    formatted = formatted.replace(/^(\d+)\. (.*$)/gm, `<div class="mb-3 flex gap-4"><span class="w-6 shrink-0 tabular-nums text-white/50">$1.</span><span class="text-white/80">$2</span></div>`);

    return formatted;
}
