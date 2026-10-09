'use client';

import Link from 'next/link';
import { memo, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { Bookmark, Search, X } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TapLink } from '@/components/blog/article/TapLink';
import { StartHere, type StartLesson } from '@/components/blog/paths/StartHere';
import { useChipRow } from '@/components/blog/paths/useChipRow';
import { useScrollMemory } from '@/components/blog/useScrollMemory';
import type { BlogArticle, Category } from '@/lib/blog-data';
import { useReadArticles } from '@/components/blog/article/useReadArticles';

/** The list only needs these fields; full article bodies stay on the server. */
export type BlogListItem = Pick<BlogArticle, 'slug' | 'title' | 'excerpt' | 'category' | 'publishedAt' | 'readingTime'> & {
    /** Lowercased words from the section headings, built on the server (search-index.ts). */
    headings: string;
    /** Lowercased words from the keywords and glossary terms, built on the server. */
    terms: string;
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

interface BlogIndexProps {
    /** In catalogue order. */
    articles: BlogListItem[];
    categories: Category[];
    featured: BlogListItem | null;
    paths: PathSummary[];
    startHere: StartLesson[];
    glossaryCount: number;
}

/** Best match exists only while there is a query; it is then the default order. */
type Sort = 'match' | 'new' | 'path';

const PAGE_SIZE = 20;
const STORAGE_KEY = 'vgp_bookmarked_articles';
/** Typing writes q to the URL once the reader pauses, not on every key. */
const URL_DELAY = 150;

const defaultSort = (q: string, cat: string): Sort => (q.trim() ? 'match' : cat === 'all' ? 'new' : 'path');

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

// Search ranking. A typed word of four or more letters matches anywhere in a
// word; a shorter one ("eq", "808") only at the start of a word, so "eq" does
// not find every lesson that says "frequency".
interface WordMatcher {
    word: string;
    short: boolean;
    start: RegExp;
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function wordMatchers(query: string): WordMatcher[] {
    return [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))].map((word) => ({
        word,
        short: word.length <= 3,
        start: new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(word)}`, 'u'),
    }));
}

/** Points per field (title, excerpt, headings, keywords and terms): [at a word start, inside a word]. */
const FIELD_POINTS: [number, number][] = [
    [10, 7],
    [5, 4],
    [3, 2],
    [1.5, 1],
];

/** 0 when a word matches nowhere; otherwise each word scores its best field, plus a bonus for the whole phrase in the title. */
function scoreLesson(fields: string[], words: WordMatcher[], phrase: string): number {
    let total = 0;
    for (const matcher of words) {
        let best = 0;
        fields.forEach((text, i) => {
            if (matcher.start.test(text)) best = Math.max(best, FIELD_POINTS[i][0]);
            else if (!matcher.short && text.includes(matcher.word)) best = Math.max(best, FIELD_POINTS[i][1]);
        });
        if (best === 0) return 0;
        total += best;
    }
    return words.length > 1 && fields[0].includes(phrase) ? total + 5 : total;
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

const ArticleRow = memo(function ArticleRow({
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
    onToggleBookmark: (slug: string) => void;
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
                <h3 className="mt-2 text-xl font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                    {article.title}
                </h3>
                <span className="mt-2 line-clamp-2 block max-w-2xl text-base leading-7 text-white/65">{article.excerpt}</span>
            </Link>
            <button
                type="button"
                onClick={() => onToggleBookmark(article.slug)}
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
});

const LearningPaths = memo(function LearningPaths({ paths, read, startHere }: { paths: PathSummary[]; read: string[]; startHere: StartLesson[] }) {
    return (
        <section aria-labelledby="paths-heading" className="px-4 pb-14 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 id="paths-heading" className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                        Learning paths
                    </h2>
                    <p className="text-sm text-white/55">Each path is a set of lessons meant to be read in order.</p>
                </div>
                <StartHere lessons={startHere} className="mt-3 max-w-2xl" />
                {/* Phones get a two-column list of names; the descriptions start at sm. */}
                <ul className="mt-5 grid grid-cols-2 gap-x-4 border-t border-white/10 sm:gap-x-10 lg:grid-cols-3">
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
});

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
    useScrollMemory();

    const catParam = params.get('cat');
    const category = catParam && categories.some((c) => c.slug === catParam) ? catParam : 'all';
    const sortParam = params.get('sort');
    const chosenSort: Sort | null = sortParam === 'new' || sortParam === 'path' ? sortParam : null;
    const showSaved = params.get('saved') === '1';
    const urlCount = Math.floor(Number(params.get('n')) / PAGE_SIZE) * PAGE_SIZE;
    const visibleCount = urlCount > PAGE_SIZE ? urlCount : PAGE_SIZE;
    const urlQuery = params.get('q') ?? '';

    // The input keeps its own state so typing never waits on the router. Each q this
    // component writes is pending until the URL catches up; a q that shows up in the URL
    // without being written here (a link back to /blog) replaces what is in the box.
    const [query, setQuery] = useState(urlQuery);
    const [pendingQueries, setPendingQueries] = useState<string[]>([]);
    const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
    if (urlQuery !== seenUrlQuery) {
        setSeenUrlQuery(urlQuery);
        const own = pendingQueries.indexOf(urlQuery);
        if (own >= 0) {
            setPendingQueries(pendingQueries.slice(own + 1));
        } else {
            setPendingQueries([]);
            setQuery(urlQuery);
        }
    }
    // The box updates on every key; the list follows when React has time (no lag while typing).
    const listQuery = useDeferredValue(query);
    const hasQuery = listQuery.trim() !== '';
    const sort: Sort = chosenSort ?? defaultSort(listQuery, category);

    // Saved lessons live in this browser only, so they load after hydration.
    const [saved, setSaved] = useState<string[]>([]);
    useEffect(() => {
        const frame = requestAnimationFrame(() => setSaved(readSaved()));
        return () => cancelAnimationFrame(frame);
    }, []);

    // A query waits URL_DELAY before it reaches the URL. Any other write, a click on a
    // link and unmounting settle it first, so the URL never lags behind the list.
    const urlTimer = useRef(0);
    const pendingWrite = useRef<(() => void) | null>(null);
    const flushUrl = useCallback(() => {
        window.clearTimeout(urlTimer.current);
        const write = pendingWrite.current;
        pendingWrite.current = null;
        write?.();
    }, []);
    useEffect(() => () => window.clearTimeout(urlTimer.current), []);

    const writeUrl = (next: { q?: string; cat?: string; sort?: Sort | null; saved?: boolean; n?: number | null }) => {
        window.clearTimeout(urlTimer.current);
        pendingWrite.current = null;
        const q = (next.q ?? query).trim();
        const cat = next.cat ?? category;
        const nextSaved = next.saved ?? showSaved;
        const nextSort = next.sort === undefined ? chosenSort : next.sort;
        const n = next.n === undefined ? (urlCount > PAGE_SIZE ? urlCount : null) : next.n;
        const search = new URLSearchParams();
        if (q) search.set('q', q);
        if (cat !== 'all') search.set('cat', cat);
        if (nextSort && nextSort !== 'match' && nextSort !== defaultSort(q, cat)) search.set('sort', nextSort);
        if (nextSaved) search.set('saved', '1');
        if (n && n > PAGE_SIZE) search.set('n', String(n));
        const qs = search.toString();
        if (q !== urlQuery) setPendingQueries((current) => [...current, q]);
        window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
    };

    const onQueryChange = (value: string) => {
        setQuery(value);
        window.clearTimeout(urlTimer.current);
        pendingWrite.current = () => writeUrl({ q: value, n: null });
        urlTimer.current = window.setTimeout(flushUrl, URL_DELAY);
    };

    const onLinkClickCapture = (event: MouseEvent<HTMLElement>) => {
        if (event.target instanceof Element && event.target.closest('a[href]')) flushUrl();
    };

    const getCategoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? 'Lessons';

    const toggleBookmark = useCallback((slug: string) => {
        setSaved((current) => {
            const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {
                // Saving is optional when browser storage is unavailable.
            }
            return next;
        });
    }, []);

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

    // Search fields in score order: title, excerpt, headings, keywords and glossary terms.
    const fields = useMemo(
        () => new Map(articles.map((a) => [a.slug, [a.title.toLowerCase(), a.excerpt.toLowerCase(), a.headings, a.terms]])),
        [articles],
    );

    const filteredArticles = useMemo(() => {
        const words = wordMatchers(listQuery);
        const phrase = words.map((m) => m.word).join(' ');
        const list: { article: BlogListItem; index: number; score: number }[] = [];
        articles.forEach((article, index) => {
            if (category !== 'all' && article.category !== category) return;
            if (showSaved && !saved.includes(article.slug)) return;
            const score = words.length ? scoreLesson(fields.get(article.slug) ?? [], words, phrase) : 0;
            if (words.length === 0 || score > 0) list.push({ article, index, score });
        });
        const newest = (a: (typeof list)[number], b: (typeof list)[number]) =>
            b.article.publishedAt.localeCompare(a.article.publishedAt) || b.index - a.index;
        list.sort((a, b) => {
            if (sort === 'match') return b.score - a.score || newest(a, b);
            if (sort === 'path') {
                const ra = pathOrder.rank.get(a.article.slug) ?? Number.MAX_SAFE_INTEGER;
                const rb = pathOrder.rank.get(b.article.slug) ?? Number.MAX_SAFE_INTEGER;
                return ra - rb || a.index - b.index;
            }
            return newest(a, b);
        });
        return list.map(({ article }) => article);
    }, [articles, category, showSaved, saved, listQuery, fields, sort, pathOrder]);

    const showFeaturedArticle = Boolean(featured && !hasQuery && category === 'all' && !showSaved);
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

    // The selected path chip scrolls into view on a phone (after Back, or on a shared ?cat= link).
    const chipRow = useRef<HTMLDivElement>(null);
    useChipRow(chipRow, showSaved ? 'saved' : category);

    // "Show more lessons" moves focus to the first lesson it added.
    const list = useRef<HTMLUListElement>(null);
    const focusRow = useRef<number | null>(null);
    useEffect(() => {
        const index = focusRow.current;
        const link = index === null ? null : list.current?.children[index]?.querySelector('a');
        if (link) {
            focusRow.current = null;
            link.focus();
        }
    }, [visibleCount]);
    const showMore = () => {
        focusRow.current = visibleCount;
        writeUrl({ n: visibleCount + PAGE_SIZE });
    };

    const activePath = category !== 'all' ? paths.find((p) => p.slug === category) : undefined;

    return (
        <PageTransition>
            <main id="main" tabIndex={-1} onClickCapture={onLinkClickCapture} className="editorial-shell text-white focus:outline-none">
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

                <section id="vgp-reading-room" aria-labelledby="library-heading" className="px-4 pb-20 sm:px-6">
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
                                    {/* The border is white/40 on --bg, over 3:1 for an input boundary (WCAG 1.4.11). */}
                                    <input
                                        id="article-search"
                                        type="search"
                                        value={query}
                                        onChange={(e) => onQueryChange(e.target.value)}
                                        placeholder="Search: LUFS, 808, reverb"
                                        className={`min-h-11 w-full rounded-md border border-white/40 bg-[#0a0e12] py-2.5 pl-10 text-white placeholder-white/55 focus:border-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-search-cancel-button]:appearance-none ${
                                            query ? 'pr-11' : 'pr-3'
                                        }`}
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
                                <TapLink href="/learn/glossary" className="text-white">
                                    The glossary explains {glossaryCount} of them
                                </TapLink>
                            </p>

                            <div
                                ref={chipRow}
                                className="vgp-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
                                role="group"
                                aria-label="Filter by path"
                            >
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
                                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Order">
                                    <span className="mr-1 text-sm text-white/55" aria-hidden="true">
                                        Order
                                    </span>
                                    {hasQuery ? <FilterButton label="Best match" active={sort === 'match'} onClick={() => writeUrl({ sort: null, n: null })} /> : null}
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
                                        <h3 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-4xl">
                                            {featured.title}
                                        </h3>
                                        <span className="mt-4 block max-w-2xl text-lg leading-8 text-white/70">{featured.excerpt}</span>
                                    </Link>
                                ) : null}

                                {libraryArticles.length > 0 ? (
                                    <ul ref={list} className="divide-y divide-white/10">
                                        {libraryArticles.slice(0, visibleCount).map((article) => (
                                            <ArticleRow
                                                key={article.slug}
                                                article={article}
                                                meta={metaFor(article)}
                                                isBookmarked={saved.includes(article.slug)}
                                                isRead={read.includes(article.slug)}
                                                onToggleBookmark={toggleBookmark}
                                            />
                                        ))}
                                    </ul>
                                ) : null}

                                {libraryArticles.length > visibleCount ? (
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-8">
                                        <button
                                            type="button"
                                            onClick={showMore}
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
                                                : hasQuery
                                                  ? `No lesson matches "${listQuery.trim()}".`
                                                  : 'No lessons in this path yet.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="mt-4 inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            <span className="vgp-link">Show all lessons</span>
                                        </button>
                                        <StartHere lessons={startHere} className="mt-6 max-w-xl" />
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
                                    <p className="mt-1">
                                        <TapLink href="/book" className="text-sm font-medium text-white">
                                            See the chapters
                                        </TapLink>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
