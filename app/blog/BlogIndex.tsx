'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Bookmark, Search, X } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface BlogIndexProps {
    articles: BlogArticle[];
    categories: Category[];
    featured: BlogArticle[];
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function formatDate(value: string) {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

function FilterButton({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`min-h-10 shrink-0 rounded-md border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                active ? 'border-white/70 text-white' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
}

function ArticleRow({
    article,
    categoryName,
    isBookmarked,
    onToggleBookmark,
}: {
    article: BlogArticle;
    categoryName: string;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
}) {
    return (
        <li className="flex items-start gap-4 py-7">
            <Link
                href={`/blog/${article.slug}`}
                className="group min-w-0 flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
                <span className="text-xs text-white/50">
                    {categoryName} · {formatDate(article.publishedAt)} · {article.readingTime} min read
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
                aria-label={isBookmarked ? `Remove ${article.title} from saved articles` : `Save ${article.title} for later`}
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

const PAGE_SIZE = 20;

export function BlogIndex({ articles, categories, featured }: BlogIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);
    const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            requestAnimationFrame(() => {
                if (isMounted) {
                    setBookmarkedSlugs(saved);
                }
            });
        } catch {
            // ignore
        }
        return () => {
            isMounted = false;
        };
    }, []);

    const featuredArticle = featured[0] ?? articles[0];
    const getCategoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? 'Guide';

    const toggleBookmark = (slug: string) => {
        setBookmarkedSlugs((current) => {
            const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
            try {
                localStorage.setItem('vgp_bookmarked_articles', JSON.stringify(next));
            } catch {
                // Saving is optional when browser storage is unavailable.
            }
            return next;
        });
    };

    const filteredArticles = useMemo(() => {
        return articles.filter((article) => {
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            const matchesSearch =
                searchQuery.trim() === '' ||
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.seo.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesBookmark = !showBookmarkedOnly || bookmarkedSlugs.includes(article.slug);

            return matchesCategory && matchesSearch && matchesBookmark;
        });
    }, [articles, selectedCategory, searchQuery, showBookmarkedOnly, bookmarkedSlugs]);

    // Show the library in pages of 20. The count resets whenever the filters change.
    const filterKey = `${selectedCategory}|${searchQuery}|${showBookmarkedOnly}`;
    const [limit, setLimit] = useState({ key: filterKey, count: PAGE_SIZE });
    const visibleCount = limit.key === filterKey ? limit.count : PAGE_SIZE;

    const showFeaturedArticle = Boolean(featuredArticle && !searchQuery && selectedCategory === 'all' && !showBookmarkedOnly);
    const libraryArticles = showFeaturedArticle
        ? filteredArticles.filter((article) => article.slug !== featuredArticle?.slug)
        : filteredArticles;

    const resetFilters = () => {
        setSelectedCategory('all');
        setSearchQuery('');
        setShowBookmarkedOnly(false);
    };

    return (
        <PageTransition>
            <main className="editorial-shell text-white">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                            Articles
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            Production notes from the studio: drums, 808s, songwriting, vocals, mixing and beat licensing.
                            All free to read.
                        </p>
                    </div>
                </section>

                <section id="vgp-reading-room" aria-label="Article library" className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-5 border-y border-white/10 py-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:max-w-md">
                                    <label htmlFor="article-search" className="sr-only">
                                        Search articles
                                    </label>
                                    <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/45" aria-hidden="true" />
                                    <input
                                        id="article-search"
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search: 808, vocals, licensing…"
                                        className="w-full rounded-md border border-white/15 bg-[#0a0e12] py-2.5 pl-10 pr-10 text-white placeholder-white/40 focus:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                    />
                                    {searchQuery ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            aria-label="Clear search"
                                            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-white/50 hover:text-white"
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>
                                    ) : null}
                                </div>
                                <p className="text-sm text-white/55" aria-live="polite">
                                    {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                                </p>
                            </div>

                            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
                                {[{ slug: 'all', name: 'All' }, ...categories].map((category) => (
                                    <FilterButton
                                        key={category.slug}
                                        label={category.name}
                                        active={selectedCategory === category.slug && !showBookmarkedOnly}
                                        onClick={() => {
                                            setSelectedCategory(category.slug);
                                            setShowBookmarkedOnly(false);
                                        }}
                                    />
                                ))}
                                {bookmarkedSlugs.length > 0 ? (
                                    <FilterButton
                                        label={`Saved (${bookmarkedSlugs.length})`}
                                        active={showBookmarkedOnly}
                                        onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                                    />
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-10 pt-4 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                {showFeaturedArticle && featuredArticle ? (
                                    <Link
                                        href={`/blog/${featuredArticle.slug}`}
                                        className="group block border-b border-white/10 py-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="text-xs text-white/50">
                                            Featured · {getCategoryName(featuredArticle.category)} · {featuredArticle.readingTime} min read
                                        </span>
                                        <span className="mt-3 block max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4 sm:text-4xl">
                                            {featuredArticle.title}
                                        </span>
                                        <span className="mt-4 block max-w-2xl text-lg leading-8 text-white/70">{featuredArticle.excerpt}</span>
                                    </Link>
                                ) : null}

                                {libraryArticles.length > 0 ? (
                                    <ul className="divide-y divide-white/10">
                                        {libraryArticles.slice(0, visibleCount).map((article) => (
                                            <ArticleRow
                                                key={article.slug}
                                                article={article}
                                                categoryName={getCategoryName(article.category)}
                                                isBookmarked={bookmarkedSlugs.includes(article.slug)}
                                                onToggleBookmark={() => toggleBookmark(article.slug)}
                                            />
                                        ))}
                                    </ul>
                                ) : null}

                                {libraryArticles.length > visibleCount ? (
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-8">
                                        <button
                                            type="button"
                                            onClick={() => setLimit({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                                            className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-[border-color,transform] duration-200 hover:border-white/60 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            Show more articles
                                        </button>
                                        <p className="text-sm text-white/50">
                                            {visibleCount} of {libraryArticles.length}
                                        </p>
                                    </div>
                                ) : null}

                                {libraryArticles.length === 0 ? (
                                    <div className="py-16">
                                        <p className="text-lg text-white/75">
                                            {showBookmarkedOnly
                                                ? 'Nothing saved in this filter yet.'
                                                : searchQuery
                                                    ? `No article matches "${searchQuery}".`
                                                    : 'No articles in this category yet.'}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="mt-4 text-sm font-medium text-white vgp-link"
                                        >
                                            Show all articles
                                        </button>
                                    </div>
                                ) : null}
                            </div>

                            <aside className="lg:col-span-3 lg:col-start-10 lg:pt-10">
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
                            </aside>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
