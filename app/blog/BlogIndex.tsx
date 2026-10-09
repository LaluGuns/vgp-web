'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bookmark, Search, X } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import type { BlogArticle, Category } from '@/lib/blog-data';
import { useReadArticles } from '@/components/blog/article/useReadArticles';

/** The list only needs these fields; full article bodies stay on the server. */
export type BlogListItem = Pick<BlogArticle, 'slug' | 'title' | 'excerpt' | 'category' | 'publishedAt' | 'readingTime'> & {
    /** Lowercased extra search text built on the server: keywords, section headings, glossary terms. */
    search: string;
    /** Published in the last 30 days. */
    isNew: boolean;
};

/** A learning path as the index needs it: lessons in order, by slug. */
export interface PathSummary {
    slug: string;
    name: string;
    description: string;
    lessons: string[];
}

/** First lesson of a path, for the "New here?" line. */
export interface StartLesson {
    pathName: string;
    slug: string;
    readingTime: number;
}

interface BlogIndexProps {
    /** In catalogue order. */
    articles: BlogListItem[];
    categories: Category[];
    featured: BlogListItem | null;
    paths: PathSummary[];
    startHere: StartLesson[];
    glossaryCount: number;
}

type Sort = 'new' | 'path';

const PAGE_SIZE = 20;
const STORAGE_KEY = 'vgp_bookmarked_articles';

const dateFormat = new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

function readSaved(): string[] {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(saved) ? saved.filter((s): s is string => typeof s === 'string') : [];
    } catch {
        return [];
    }
}

// Back from a lesson should land where the reader left the list. The App Router does not
// restore scroll on Back, so remember the position per URL for this tab, and restore it
// only when the list mounts because of a Back or Forward (a popstate just before).
const SCROLL_KEY = 'vgp_lessons_scroll';
let lastTraverse = 0;
if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
        lastTraverse = Date.now();
    });
}

function readScroll(): Record<string, number> {
    try {
        const value: unknown = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}');
        return value && typeof value === 'object' ? (value as Record<string, number>) : {};
    } catch {
        return {};
    }
}

function useListScrollMemory(pathname: string) {
    useEffect(() => {
        const here = () => location.pathname + location.search;
        const saved = readScroll()[here()];
        let frame = 0;
        if (Date.now() - lastTraverse < 1500 && typeof saved === 'number') {
            frame = requestAnimationFrame(() => window.scrollTo({ top: saved, behavior: 'instant' }));
        }
        let pending = 0;
        const remember = () => {
            if (pending) return;
            pending = requestAnimationFrame(() => {
                pending = 0;
                if (location.pathname !== pathname) return;
                try {
                    sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ ...readScroll(), [here()]: Math.round(window.scrollY) }));
                } catch {
                    // Without storage, Back simply starts at the top.
                }
            });
        };
        window.addEventListener('scroll', remember, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            cancelAnimationFrame(pending);
            window.removeEventListener('scroll', remember);
        };
    }, [pathname]);
}

const chipClass = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-md border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        active ? 'border-white/70 text-white' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
    }`;

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} aria-pressed={active} className={chipClass(active)}>
            {label}
        </button>
    );
}

function ArticleRow({
    article,
    meta,
    isBookmarked,
    isRead,
    onToggleBookmark,
}: {
    article: BlogListItem;
    meta: string;
    isBookmarked: boolean;
    isRead: boolean;
    onToggleBookmark: () => void;
}) {
    return (
        <li className="flex items-start gap-4 py-7">
            <Link
                href={`/blog/${article.slug}`}
                className="group min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
                <span className="text-xs text-white/50">
                    {article.isNew ? <span className="font-medium text-white">New · </span> : null}
                    {meta} · {formatDate(article.publishedAt)} · {article.readingTime} min read
                    {isRead ? ' · Read' : ''}
                </span>
                <span className="mt-2 block text-xl font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                    {article.title}
                </span>
                <span className="mt-2 line-clamp-2 block max-w-2xl text-base leading-7 text-white/65">{article.excerpt}</span>
            </Link>
            <button
                type="button"
                onClick={onToggleBookmark}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? `Remove ${article.title} from saved lessons` : `Save ${article.title} for later`}
                title={isBookmarked ? 'Remove from saved' : 'Save for later'}
                className={`-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                    isBookmarked ? 'text-white' : 'text-white/40 hover:text-white'
                }`}
            >
                <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} aria-hidden="true" />
            </button>
        </li>
    );
}

function LearningPaths({ paths, read, startHere }: { paths: PathSummary[]; read: string[]; startHere: StartLesson[] }) {
    return (
        <section aria-labelledby="paths-heading" className="px-4 pb-14 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 id="paths-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                        Learning paths
                    </h2>
                    <p className="text-sm text-white/55">Each path is a set of lessons meant to be read in order.</p>
                </div>
                {startHere.length > 0 ? (
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
                        New here? Start with{' '}
                        {startHere.map((lesson, i) => (
                            <span key={lesson.slug}>
                                {i > 0 ? (i === startHere.length - 1 ? ' or ' : ', ') : null}
                                <Link href={`/blog/${lesson.slug}`} className="vgp-link text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                                    {lesson.pathName}, lesson 1
                                </Link>{' '}
                                ({lesson.readingTime} min)
                            </span>
                        ))}
                        .
                    </p>
                ) : null}
                {/* Phones get a two-column list of names; the descriptions start at sm. */}
                <ul className="mt-6 grid grid-cols-2 gap-x-4 border-t border-white/10 sm:gap-x-10 lg:grid-cols-3">
                    {paths.map((path) => {
                        const done = path.lessons.filter((slug) => read.includes(slug)).length;
                        return (
                            <li key={path.slug} className="border-b border-white/10">
                                <Link
                                    href={`/blog/category/${path.slug}`}
                                    className="group block py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:py-5"
                                >
                                    <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                                        <span className="text-base font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-lg">
                                            {path.name}
                                        </span>
                                        <span className="shrink-0 text-xs tabular-nums text-white/50">
                                            {done > 0 ? `${done} of ${path.lessons.length} read` : `${path.lessons.length} lessons`}
                                        </span>
                                    </span>
                                    <span className="mt-1.5 line-clamp-2 hidden text-sm leading-6 text-white/60 sm:block">{path.description}</span>
                                    {done > 0 ? (
                                        <span className="mt-3 block h-0.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
                                            <span className="block h-full bg-white/70" style={{ width: `${(done / path.lessons.length) * 100}%` }} />
                                        </span>
                                    ) : null}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

/**
 * The lesson library. What the reader filters lives in the URL (q, cat,
 * sort, saved, n), so Back from a lesson returns to the same list at the
 * same length, and a filtered list can be shared. The URL is updated with
 * history.replaceState, which Next keeps in sync with useSearchParams
 * without a server round trip.
 */
export function BlogIndex({ articles, categories, featured, paths, startHere, glossaryCount }: BlogIndexProps) {
    const read = useReadArticles();
    const params = useSearchParams();
    const pathname = usePathname();
    useListScrollMemory(pathname);

    const catParam = params.get('cat');
    const category = catParam && categories.some((c) => c.slug === catParam) ? catParam : 'all';
    const sortParam = params.get('sort');
    // A path reads in lesson order; the whole library reads newest first.
    const defaultSort: Sort = category === 'all' ? 'new' : 'path';
    const sort: Sort = sortParam === 'new' || sortParam === 'path' ? sortParam : defaultSort;
    const showSaved = params.get('saved') === '1';
    const urlCount = Math.floor(Number(params.get('n')) / PAGE_SIZE) * PAGE_SIZE;
    const visibleCount = urlCount > PAGE_SIZE ? urlCount : PAGE_SIZE;
    const urlQuery = params.get('q') ?? '';

    // The input keeps its own state so typing never waits on the router.
    const [query, setQuery] = useState(urlQuery);

    // Saved lessons live in this browser only, so they load after hydration.
    const [saved, setSaved] = useState<string[]>([]);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setSaved(readSaved()));
        return () => cancelAnimationFrame(frame);
    }, []);

    const writeUrl = (next: { q?: string; cat?: string; sort?: Sort | null; saved?: boolean; n?: number | null }) => {
        const q = (next.q ?? query).trim();
        const cat = next.cat ?? category;
        const nextSaved = next.saved ?? showSaved;
        const nextSort = next.sort === undefined ? sortParam : next.sort;
        const n = next.n === undefined ? (urlCount > PAGE_SIZE ? urlCount : null) : next.n;
        const search = new URLSearchParams();
        if (q) search.set('q', q);
        if (cat !== 'all') search.set('cat', cat);
        if (nextSort && nextSort !== (cat === 'all' ? 'new' : 'path')) search.set('sort', nextSort);
        if (nextSaved) search.set('saved', '1');
        if (n && n > PAGE_SIZE) search.set('n', String(n));
        const qs = search.toString();
        window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
    };

    const onQueryChange = (value: string) => {
        setQuery(value);
        writeUrl({ q: value, n: null });
    };

    const getCategoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? 'Lessons';

    const toggleBookmark = (slug: string) => {
        const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
            // Saving is optional when browser storage is unavailable.
        }
        setSaved(next);
    };

    // Lesson order across the paths, and each lesson's number inside its path.
    const pathOrder = useMemo(() => {
        const rank = new Map<string, number>();
        const number = new Map<string, number>();
        paths.forEach((path, p) =>
            path.lessons.forEach((slug, i) => {
                rank.set(slug, p * 1000 + i);
                number.set(slug, i + 1);
            }),
        );
        return { rank, number };
    }, [paths]);

    const haystacks = useMemo(
        () => new Map(articles.map((a) => [a.slug, `${a.title} ${a.excerpt}`.toLowerCase() + ' ' + a.search])),
        [articles],
    );

    const filteredArticles = useMemo(() => {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        const list = articles
            .map((article, index) => ({ article, index }))
            .filter(({ article }) => {
                if (category !== 'all' && article.category !== category) return false;
                if (showSaved && !saved.includes(article.slug)) return false;
                if (words.length === 0) return true;
                const text = haystacks.get(article.slug) ?? '';
                return words.every((word) => text.includes(word));
            });
        list.sort((a, b) => {
            if (sort === 'path') {
                const ra = pathOrder.rank.get(a.article.slug) ?? Number.MAX_SAFE_INTEGER;
                const rb = pathOrder.rank.get(b.article.slug) ?? Number.MAX_SAFE_INTEGER;
                return ra - rb || a.index - b.index;
            }
            return b.article.publishedAt.localeCompare(a.article.publishedAt) || b.index - a.index;
        });
        return list.map(({ article }) => article);
    }, [articles, category, showSaved, saved, query, haystacks, sort, pathOrder]);

    const showFeaturedArticle = Boolean(featured && !query.trim() && category === 'all' && !showSaved);
    const libraryArticles = showFeaturedArticle ? filteredArticles.filter((a) => a.slug !== featured?.slug) : filteredArticles;

    const metaFor = (article: BlogListItem) => {
        const name = getCategoryName(article.category);
        const n = pathOrder.number.get(article.slug);
        return sort === 'path' && n ? `${name} · Lesson ${n}` : name;
    };

    const resetFilters = () => {
        setQuery('');
        writeUrl({ q: '', cat: 'all', sort: null, saved: false, n: null });
    };

    const activePath = category !== 'all' ? paths.find((p) => p.slug === category) : undefined;

    return (
        <PageTransition>
            <main id="main" tabIndex={-1} className="editorial-shell text-white focus:outline-none">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                            Lessons
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            {articles.length} free lessons from the studio in {paths.length} paths, from songwriting and arrangement to mixing,
                            audio science and licensing. Most come with diagrams, an experiment to try in your DAW and a short quiz.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-6">
                            <a
                                href="#vgp-reading-room"
                                className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <span className="vgp-link">Browse all {articles.length} lessons</span>
                            </a>
                            <Link
                                href="/learn/glossary"
                                className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <span className="vgp-link">Glossary</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <LearningPaths paths={paths} read={read} startHere={startHere} />

                <section id="vgp-reading-room" aria-labelledby="library-heading" className="scroll-mt-24 px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl pb-4">
                        <h2 id="library-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                            All lessons
                        </h2>
                    </div>
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-4 border-y border-white/10 py-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-md">
                                    <label htmlFor="article-search" className="sr-only">
                                        Search lessons
                                    </label>
                                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/55" aria-hidden="true" />
                                    <input
                                        id="article-search"
                                        type="search"
                                        value={query}
                                        onChange={(e) => onQueryChange(e.target.value)}
                                        placeholder="Search: LUFS, 808, vocals, licensing…"
                                        className="min-h-11 w-full rounded-md border border-white/15 bg-[#0a0e12] py-2.5 pl-10 pr-11 text-white placeholder-white/55 focus:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                    />
                                    {query ? (
                                        <button
                                            type="button"
                                            onClick={() => onQueryChange('')}
                                            aria-label="Clear search"
                                            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-white/55 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>
                                    ) : null}
                                </div>
                                <p className="text-sm text-white/55" aria-live="polite">
                                    {filteredArticles.length} {filteredArticles.length === 1 ? 'lesson' : 'lessons'}
                                </p>
                            </div>
                            <p className="text-sm text-white/60">
                                Stuck on a term?{' '}
                                <Link href="/learn/glossary" className="vgp-link text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                                    The glossary explains {glossaryCount} of them
                                </Link>
                                .
                            </p>

                            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by path">
                                {[{ slug: 'all', name: 'All' }, ...categories].map((c) => (
                                    <FilterButton
                                        key={c.slug}
                                        label={c.name}
                                        active={category === c.slug && !showSaved}
                                        onClick={() => writeUrl({ cat: c.slug, saved: false, sort: null, n: null })}
                                    />
                                ))}
                                {saved.length > 0 ? (
                                    <FilterButton label={`Saved (${saved.length})`} active={showSaved} onClick={() => writeUrl({ saved: !showSaved, n: null })} />
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <div className="flex items-center gap-2" role="group" aria-label="Order">
                                    <span className="mr-1 text-sm text-white/55" aria-hidden="true">
                                        Order
                                    </span>
                                    <FilterButton label="Newest" active={sort === 'new'} onClick={() => writeUrl({ sort: 'new', n: null })} />
                                    <FilterButton label="Path order" active={sort === 'path'} onClick={() => writeUrl({ sort: 'path', n: null })} />
                                </div>
                                {activePath ? (
                                    <Link
                                        href={`/blog/category/${activePath.slug}`}
                                        className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="vgp-link">Open the {activePath.name} path</span>
                                    </Link>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-10 pt-4 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                {showFeaturedArticle && featured ? (
                                    <Link
                                        href={`/blog/${featured.slug}`}
                                        className="group block border-b border-white/10 py-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="text-xs text-white/50">
                                            Featured · {getCategoryName(featured.category)} · {featured.readingTime} min read
                                        </span>
                                        <span className="mt-3 block max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-4xl">
                                            {featured.title}
                                        </span>
                                        <span className="mt-4 block max-w-2xl text-lg leading-8 text-white/70">{featured.excerpt}</span>
                                    </Link>
                                ) : null}

                                {libraryArticles.length > 0 ? (
                                    <ul className="divide-y divide-white/10">
                                        {libraryArticles.slice(0, visibleCount).map((article) => (
                                            <ArticleRow
                                                key={article.slug}
                                                article={article}
                                                meta={metaFor(article)}
                                                isBookmarked={saved.includes(article.slug)}
                                                isRead={read.includes(article.slug)}
                                                onToggleBookmark={() => toggleBookmark(article.slug)}
                                            />
                                        ))}
                                    </ul>
                                ) : null}

                                {libraryArticles.length > visibleCount ? (
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-8">
                                        <button
                                            type="button"
                                            onClick={() => writeUrl({ n: visibleCount + PAGE_SIZE })}
                                            className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-[border-color,transform] duration-200 hover:border-white/60 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            Show more lessons
                                        </button>
                                        <p className="text-sm text-white/50">
                                            {visibleCount} of {libraryArticles.length}
                                        </p>
                                    </div>
                                ) : null}

                                {libraryArticles.length === 0 ? (
                                    <div className="py-16">
                                        <p className="text-lg text-white/75">
                                            {showSaved
                                                ? 'Nothing saved in this filter yet.'
                                                : query
                                                  ? `No lesson matches "${query}".`
                                                  : 'No lessons in this path yet.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="mt-4 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            <span className="vgp-link">Show all lessons</span>
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="lg:col-span-3 lg:col-start-10 lg:pt-10">
                                <div className="lg:sticky lg:top-28">
                                    <div className="w-32 overflow-hidden rounded-[4px] border border-white/10">
                                        <Image
                                            src="/ebooks/trap-guide-book-cover.jpg"
                                            alt="Cover of Music Production Guide: Trap Edition"
                                            width={815}
                                            height={1058}
                                            sizes="128px"
                                            className="h-auto w-full"
                                        />
                                    </div>
                                    <p className="mt-5 text-xs text-white/50">PDF, coming soon</p>
                                    <p className="mt-1 text-lg font-semibold leading-snug text-white">Music Production Guide: Trap Edition</p>
                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        The long version of these notes: 80+ pages on 808s, drums, mix balance and mastering.
                                    </p>
                                    <div className="mt-4">
                                        <TextLink href="/book">See the chapters</TextLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
