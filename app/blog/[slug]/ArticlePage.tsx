/**
 * Article page: reading-first layout. The text, diagrams and maths are
 * rendered on the server; only the reading tools (progress, outline,
 * save and share, checklists, quiz, listening demos) run in the browser.
 */

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { ArticleBody, ArticleSources } from '@/components/blog/article/ArticleBody';
import { ArticleActions, ArticleOutline, OutlineList } from '@/components/blog/article/ArticleChrome';
import { Quiz } from '@/components/blog/article/Quiz';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import type { BlogArticle, Category } from '@/lib/blog-data';
import { parseArticle } from '@/lib/blog/content';
import { dialectForCategory } from '@/lib/blog/dialects';
import { glossaryFor } from '@/lib/blog/glossary';
import { getPathPosition } from '@/lib/blog/paths';

interface ArticlePageProps {
    article: BlogArticle;
    category?: Category;
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

const HEARING = /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i;

export function ArticlePage({ article, category }: ArticlePageProps) {
    const parsed = parseArticle(article.content, glossaryFor(article.category));
    const headings = parsed.sections.map((s) => ({ id: s.id, title: s.title }));
    const position = getPathPosition(article);
    // The next lesson gets its own block; this list shows the ones after it.
    const upcoming = position ? position.path.articles.slice(position.index + 2, position.index + 5) : [];
    const pathName = category?.name ?? article.category;
    const hasHearingNote = HEARING.test(article.content) || HEARING.test(article.excerpt);
    // One accent per lesson (docs/DESIGN.md, "Figure dialects"): inside the article, --accent is the
    // group's, so figures, demos, focus rings and the progress bar all speak the same colour.
    const dialect = dialectForCategory(article.category);
    const accentScope = { '--accent': dialect.accent } as CSSProperties;

    return (
        <PageTransition>
            <main className="editorial-shell text-white">
                <article style={accentScope}>
                    <header className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                        <div className="mx-auto max-w-7xl">
                            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/55">
                                <Link href="/blog" className="vgp-link hover:text-white">
                                    Articles
                                </Link>
                                <span aria-hidden="true">/</span>
                                <span className="inline-flex items-center gap-2">
                                    <DialectMark dialect={dialect} />
                                    <Link href={`/blog/category/${article.category}`} className="vgp-link hover:text-white">
                                        {pathName}
                                    </Link>
                                </span>
                            </nav>
                            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
                                {article.title}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{article.excerpt}</p>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-2">
                                <p className="text-sm text-white/55">
                                    <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> · {article.readingTime} min read
                                    {position ? (
                                        <>
                                            {' · '}
                                            <Link href={`/blog/category/${article.category}`} className="vgp-link hover:text-white">
                                                Lesson {position.index + 1} of {position.path.articles.length} in {pathName}
                                            </Link>
                                        </>
                                    ) : null}
                                </p>
                                <ArticleActions
                                    slug={article.slug}
                                    title={article.title}
                                    excerpt={article.excerpt}
                                    categoryName={category?.name}
                                    readingTime={article.readingTime}
                                />
                            </div>
                        </div>
                    </header>

                    <div className="px-4 pb-20 sm:px-6">
                        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                            <div className="min-w-0 lg:col-span-8">
                                <div className="max-w-[68ch]">
                                    {article.summary?.length ? (
                                        <section aria-labelledby="in-short" className="mb-10 border-b border-white/10 pb-8">
                                            <h2 id="in-short" className="text-sm font-medium text-white/55">
                                                In short
                                            </h2>
                                            <ol className="mt-4 space-y-3 text-base leading-7 text-white/85">
                                                {article.summary.map((point, i) => (
                                                    <li key={point} className="flex gap-4">
                                                        <span className="w-4 shrink-0 tabular-nums text-white/50">{i + 1}</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </section>
                                    ) : null}

                                    {headings.length > 0 ? (
                                        <details className="group mb-10 border-b border-white/10 pb-6 lg:hidden">
                                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-base font-medium text-white">
                                                In this article ({headings.length})
                                                <span className="text-sm text-white/55 group-open:hidden">Show</span>
                                                <span className="hidden text-sm text-white/55 group-open:inline">Hide</span>
                                            </summary>
                                            <div className="mt-3">
                                                <OutlineList headings={headings} />
                                            </div>
                                        </details>
                                    ) : null}

                                    <ArticleBody article={article} parsed={parsed} />

                                    <div id="article-end" />

                                    {hasHearingNote ? (
                                        <aside className="mt-12 border-y border-white/10 py-6 text-sm leading-6 text-white/65">
                                            <p className="font-semibold text-white">Hearing safety and educational use</p>
                                            <p className="mt-2">
                                                The physiological and acoustic ideas in this article are for music production and learning. They are not
                                                medical advice, diagnosis or treatment. Loud monitoring and long sessions can damage hearing, so keep
                                                levels moderate (around 80 to 85 dB SPL or lower) and take breaks. If you notice ringing, discomfort or
                                                hearing changes, see a licensed medical professional.
                                            </p>
                                        </aside>
                                    ) : null}

                                    {article.quiz?.length ? <Quiz questions={article.quiz} /> : null}

                                    <ArticleSources article={article} parsed={parsed} />

                                    {position?.next ? (
                                        <section aria-labelledby="next-lesson" className="mt-16 border-t border-white/10 pt-10">
                                            <p id="next-lesson" className="text-sm font-medium text-white/50">
                                                Next lesson · {position.index + 2} of {position.path.articles.length}
                                            </p>
                                            <Link
                                                href={`/blog/${position.next.slug}`}
                                                className="group mt-3 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                            >
                                                <span className="block font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-3xl">
                                                    {position.next.title}
                                                </span>
                                                <span className="mt-2 block text-base leading-7 text-white/65">{position.next.excerpt}</span>
                                            </Link>
                                            {position.prev ? (
                                                <p className="mt-6 text-sm text-white/55">
                                                    Previous:{' '}
                                                    <Link href={`/blog/${position.prev.slug}`} className="vgp-link text-white/75 hover:text-white">
                                                        {position.prev.title}
                                                    </Link>
                                                </p>
                                            ) : null}
                                        </section>
                                    ) : null}

                                    <section aria-labelledby="author-heading" className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-start">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[6px] bg-black">
                                            <Image src="/images/founder.jpg" alt="Portrait of Virzy Guns" fill sizes="80px" className="object-cover object-[50%_25%]" />
                                        </div>
                                        <div>
                                            <h2 id="author-heading" className="text-base font-semibold text-white">
                                                Written by Virzy Guns
                                            </h2>
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
                                        <p className="mt-10 text-sm leading-6 text-white/50">Topics: {article.seo.keywords.join(', ')}</p>
                                    ) : null}
                                </div>
                            </div>

                            <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
                                <div className="sticky top-28">
                                    <ArticleOutline slug={article.slug} headings={headings} accent={dialect.accent} />
                                </div>
                            </aside>
                        </div>
                    </div>
                </article>

                {upcoming.length > 0 && position ? (
                    <section aria-labelledby="path-heading" className="border-t border-white/10 px-4 pb-20 pt-14 sm:px-6">
                        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
                            <div className="lg:col-span-4">
                                <h2 id="path-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                                    Later in {pathName}
                                </h2>
                                <div className="mt-4">
                                    <TextLink href={`/blog/category/${article.category}`}>See all {position.path.articles.length} lessons</TextLink>
                                </div>
                            </div>
                            <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                                {upcoming.map((rel, i) => (
                                    <li key={rel.slug}>
                                        <Link href={`/blog/${rel.slug}`} className="group flex gap-5 py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                                            <span className="w-6 shrink-0 pt-0.5 text-sm tabular-nums text-white/55">{position.index + 3 + i}</span>
                                            <span className="min-w-0">
                                                <span className="block text-lg font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                                    {rel.title}
                                                </span>
                                                <span className="mt-1 line-clamp-2 block text-base leading-7 text-white/65">{rel.excerpt}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>
                ) : null}
            </main>
        </PageTransition>
    );
}
