/**
 * Article page: reading-first layout. The text, diagrams and maths are
 * rendered on the server; only the reading tools (progress, outline,
 * save and share, checklists, quiz, listening demos) run in the browser.
 */

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { ArticleBody, ArticleSources } from '@/components/blog/article/ArticleBody';
import { ArticleActions, MobileContents, OutlineTracker, ReadingProgress } from '@/components/blog/article/ArticleChrome';
import { OutlineList, type OutlineItem } from '@/components/blog/article/OutlineList';
import { Quiz } from '@/components/blog/article/Quiz';
import { TapLink } from '@/components/blog/article/TapLink';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import type { BlogArticle, Category } from '@/lib/blog-data';
import { parseArticle, type ParsedArticle } from '@/lib/blog/content';
import { dialectForCategory } from '@/lib/blog/dialects';
import { glossaryFor } from '@/lib/blog/glossary';
import { getPath, getPathPosition, learningPaths, type LearningPath } from '@/lib/blog/paths';

interface ArticlePageProps {
    article: BlogArticle;
    category?: Category;
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

const HEARING = /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i;

// Ids already taken on a lesson page, so a section called "In short" cannot collide.
const RESERVED_IDS = ['main', 'in-short', 'article-outline-inline', 'article-contents', 'article-end', 'check-yourself', 'path-next', 'author-heading', 'path-heading'];
const QUIZ_ID = 'check-yourself';

/**
 * Section anchors are slugs of the heading ("#why-the-fader-comes-last"), so a
 * shared link says where it goes and survives a section being added above it.
 */
function withSectionIds(parsed: ParsedArticle): ParsedArticle {
    const used = new Set(RESERVED_IDS);
    const sections = parsed.sections.map((section) => {
        const base =
            section.role === 'references'
                ? 'sources'
                : section.title
                      .toLowerCase()
                      .replace(/&/g, ' and ')
                      .replace(/['’]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '')
                      .slice(0, 64)
                      .replace(/-+$/, '') || 'section';
        let id = base;
        for (let n = 2; used.has(id) || /^(term-|section-\d)/.test(id); n++) id = `${base}-${n}`;
        used.add(id);
        return { ...section, id };
    });
    return { ...parsed, sections };
}

const bigLink = 'vgp-focus group mt-3 block rounded-sm';
const bigTitle =
    'block font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-3xl';

/**
 * What comes after this lesson: the next lesson in the path, or at the end
 * of a path, the first lesson of the next one. Previous is always offered.
 */
function PathNext({ article, pathName }: { article: BlogArticle; pathName: string }) {
    const position = getPathPosition(article);
    const path = position?.path ?? getPath(article.category);
    if (!path || path.articles.length === 0) return null;
    const total = path.articles.length;
    const pathHref = `/blog/category/${article.category}`;
    const after = (from: LearningPath) => learningPaths[(learningPaths.indexOf(from) + 1) % learningPaths.length];

    // A lesson kept off its path's reading order (a studio note, say): point to the path itself.
    if (!position) {
        const first = path.articles[0];
        return (
            <section aria-labelledby="path-next" className="mt-16 border-t border-white/10 pt-10">
                <h2 id="path-next" className="text-sm font-medium text-white/55">
                    The {pathName} path · {total} lessons
                </h2>
                <Link href={`/blog/${first.slug}`} className={bigLink}>
                    <span className="block text-sm text-white/55">Lesson 1</span>
                    <span className={`mt-1 ${bigTitle}`}>{first.title}</span>
                    <span className="mt-2 block text-base leading-7 text-white/65">{first.excerpt}</span>
                </Link>
                <p className="mt-4 text-sm text-white/60">
                    <TapLink href={pathHref}>See all {total} lessons</TapLink>
                </p>
            </section>
        );
    }

    const previous = position.prev ? (
        <p className="mt-6 text-sm text-white/55">
            Previous:{' '}
            <TapLink href={`/blog/${position.prev.slug}`} className="text-white/75 hover:text-white">
                {position.prev.title}
            </TapLink>
        </p>
    ) : null;

    if (position.next) {
        return (
            <section aria-labelledby="path-next" className="mt-16 border-t border-white/10 pt-10">
                <h2 id="path-next" className="text-sm font-medium text-white/55">
                    Next lesson · {position.index + 2} of {total}
                </h2>
                <Link href={`/blog/${position.next.slug}`} className={bigLink}>
                    <span className={bigTitle}>{position.next.title}</span>
                    <span className="mt-2 block text-base leading-7 text-white/65">{position.next.excerpt}</span>
                </Link>
                {previous}
            </section>
        );
    }

    // The last lesson: close this path and open the next one.
    const nextPath = learningPaths.length > 1 ? after(path) : undefined;
    const nextFirst = nextPath?.articles[0];
    return (
        <section aria-labelledby="path-next" className="mt-16 border-t border-white/10 pt-10">
            <p className="text-sm font-medium text-white/55">
                Lesson {total} of {total}
            </p>
            <h2 id="path-next" className="mt-2 font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white sm:text-3xl">
                You reached the end of {pathName}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/70">
                That was the last of {total} lessons in this path.
                {nextPath && nextFirst ? ` The next path is ${nextPath.category.name}, ${nextPath.articles.length} lessons.` : null}
            </p>
            {nextPath && nextFirst ? (
                <Link href={`/blog/${nextFirst.slug}`} className={`${bigLink} mt-6`}>
                    <span className="block text-sm text-white/55">{nextPath.category.name}, lesson 1</span>
                    <span className={`mt-1 ${bigTitle}`}>{nextFirst.title}</span>
                    <span className="mt-2 block text-base leading-7 text-white/65">{nextFirst.excerpt}</span>
                </Link>
            ) : null}
            <p className="mt-6 flex flex-wrap gap-x-6 text-sm text-white/60">
                <TapLink href={pathHref}>Back to the {pathName} path</TapLink>
                <TapLink href="/blog">All lessons</TapLink>
            </p>
            {previous}
        </section>
    );
}

export function ArticlePage({ article, category }: ArticlePageProps) {
    const parsed = withSectionIds(parseArticle(article.content, glossaryFor(article.category)));
    const sectionIds = parsed.sections.map((s) => s.id);
    // Contents in page order: the body sections, the quiz, then the sources.
    const body = parsed.sections.filter((s) => s.role !== 'references').map((s) => ({ id: s.id, title: s.title }));
    const sources = parsed.sections.filter((s) => s.role === 'references').map((s) => ({ id: s.id, title: s.title }));
    const headings: OutlineItem[] = [...body, ...(article.quiz?.length ? [{ id: QUIZ_ID, title: 'Check yourself' }] : []), ...sources];
    const headingIds = headings.map((h) => h.id);
    const position = getPathPosition(article);
    // The next lesson gets its own block (PathNext); this list shows the ones after it.
    const upcoming = position ? position.path.articles.slice(position.index + 2, position.index + 5) : [];
    const pathName = category?.name ?? article.category;
    const hasHearingNote = HEARING.test(article.content) || HEARING.test(article.excerpt);
    // One accent per lesson (docs/DESIGN.md, "Figure dialects"): inside the lesson, --accent is the
    // group's, so figures, demos, focus rings and the progress bar all speak the same colour.
    const dialect = dialectForCategory(article.category);
    const accentScope = { '--accent': dialect.accent } as CSSProperties;

    // No transformed wrapper (PageTransition) around the page: the Contents button and the
    // progress bar are position: fixed and must stay pinned to the screen.
    return (
        <>
            <main id="main" tabIndex={-1} style={accentScope} className="editorial-shell text-white focus:outline-none">
                <ReadingProgress slug={article.slug} accent={dialect.accent} sectionIds={sectionIds} />
                <article>
                    <header className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                        <div className="mx-auto max-w-7xl">
                            <nav aria-label="Breadcrumb" className="-my-3 flex flex-wrap items-center gap-x-2 text-sm text-white/55">
                                <TapLink href="/blog" className="hover:text-white">
                                    Lessons
                                </TapLink>
                                <span aria-hidden="true">/</span>
                                <span className="inline-flex items-center gap-2">
                                    <DialectMark dialect={dialect} />
                                    <TapLink href={`/blog/category/${article.category}`} className="hover:text-white">
                                        {pathName}
                                    </TapLink>
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
                                            <TapLink href={`/blog/category/${article.category}`} className="hover:text-white">
                                                Lesson {position.index + 1} of {position.path.articles.length} in {pathName}
                                            </TapLink>
                                        </>
                                    ) : null}
                                </p>
                                <ArticleActions
                                    slug={article.slug}
                                    title={article.title}
                                    excerpt={article.excerpt}
                                    categoryName={category?.name}
                                    readingTime={article.readingTime}
                                    accent={dialect.accent}
                                />
                            </div>
                        </div>
                    </header>

                    <div className="px-4 pb-20 sm:px-6">
                        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                            {/* First in the source, so the outline comes before the text in the tab order; the grid puts it on the right. */}
                            <div className="hidden lg:col-span-3 lg:col-start-10 lg:row-start-1 lg:block">
                                <div className="sticky top-28">
                                    <OutlineTracker ids={headingIds}>
                                        <nav aria-label="In this article">
                                            <p className="mb-3 text-sm font-medium text-white">In this article</p>
                                            <div className="max-h-[60vh] overflow-y-auto pr-1">
                                                <OutlineList headings={headings} />
                                            </div>
                                        </nav>
                                        <p data-percent="" className="mt-8 min-h-4 text-xs text-white/50" />
                                    </OutlineTracker>
                                </div>
                            </div>
                            <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
                                <div className="max-w-[68ch]">
                                    {article.summary?.length ? (
                                        <section aria-labelledby="in-short" className="mb-10 border-b border-white/10 pb-8">
                                            <h2 id="in-short" className="text-sm font-medium text-white/55">
                                                In short
                                            </h2>
                                            <ol className="mt-4 space-y-3 text-base leading-7 text-white/85">
                                                {article.summary.map((point, i) => (
                                                    <li key={point} className="flex gap-4">
                                                        <span className="w-4 shrink-0 tabular-nums text-white/50" aria-hidden="true">
                                                            {i + 1}
                                                        </span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </section>
                                    ) : null}

                                    {headings.length > 0 ? (
                                        <details id="article-outline-inline" className="group mb-10 border-b border-white/10 pb-6 lg:hidden">
                                            <summary className="vgp-focus flex min-h-11 cursor-pointer list-none items-center justify-between rounded-sm text-base font-medium text-white [&::-webkit-details-marker]:hidden">
                                                In this article ({headings.length})
                                                <span className="text-sm text-white/55 group-open:hidden">Show</span>
                                                <span className="hidden text-sm text-white/55 group-open:inline">Hide</span>
                                            </summary>
                                            <div className="mt-3">
                                                <OutlineList headings={headings} touch />
                                            </div>
                                        </details>
                                    ) : null}
                                    <MobileContents headings={headings} />

                                    <ArticleBody article={article} parsed={parsed} />

                                    <div id="article-end" />

                                    {hasHearingNote ? (
                                        <div role="note" aria-label="Hearing safety" className="mt-12 border-y border-white/10 py-6 text-sm leading-6 text-white/65">
                                            <p className="font-semibold text-white">Hearing safety and educational use</p>
                                            <p className="mt-2">
                                                The physiological and acoustic ideas in this article are for music production and learning. They are not
                                                medical advice, diagnosis or treatment. Loud monitoring and long sessions can damage hearing, so keep
                                                levels moderate (around 80 to 85 dB SPL or lower) and take breaks. If you notice ringing, discomfort or
                                                hearing changes, see a licensed medical professional.
                                            </p>
                                        </div>
                                    ) : null}

                                    {article.quiz?.length ? <Quiz questions={article.quiz} id={QUIZ_ID} /> : null}

                                    <ArticleSources article={article} parsed={parsed} />

                                    <PathNext article={article} pathName={pathName} />

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
                                            <div className="mt-1 flex flex-wrap gap-x-6 text-sm font-medium text-white">
                                                <TapLink href="/studio/beats">Browse beats</TapLink>
                                                <TapLink href="/about">About Virzy Guns</TapLink>
                                            </div>
                                        </div>
                                    </section>

                                    {article.seo.keywords.length > 0 ? (
                                        <p className="mt-10 text-sm leading-6 text-white/50">Topics: {article.seo.keywords.join(', ')}</p>
                                    ) : null}
                                </div>
                            </div>
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
                                <p className="mt-2 text-sm text-white">
                                    <TapLink href={`/blog/category/${article.category}`}>See all {position.path.articles.length} lessons</TapLink>
                                </p>
                            </div>
                            <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                                {upcoming.map((rel, i) => (
                                    <li key={rel.slug}>
                                        <Link href={`/blog/${rel.slug}`} className="vgp-focus group flex gap-5 py-6">
                                            <span className="w-6 shrink-0 pt-0.5 text-sm tabular-nums text-white/55" aria-hidden="true">
                                                {position.index + 3 + i}
                                            </span>
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
        </>
    );
}
