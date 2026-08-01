'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    Bookmark,
    BookOpen,
    Clock,
    ListFilter,
    Search,
    X,
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { CinematicBackdrop } from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface BlogIndexProps {
    articles: BlogArticle[];
    categories: Category[];
    featured: BlogArticle[];
}

const categoryStyles: Record<string, { label: string; badge: string; line: string }> = {
    'production-tips': {
        label: 'Production',
        badge: 'bg-sky-100 text-sky-950 ring-sky-200',
        line: 'bg-sky-300',
    },
    'licensing-guide': {
        label: 'Licensing',
        badge: 'bg-slate-100 text-slate-900 ring-slate-200',
        line: 'bg-slate-300',
    },
    'genre-guides': {
        label: 'Genre',
        badge: 'bg-cyan-100 text-cyan-950 ring-cyan-200',
        line: 'bg-cyan-300',
    },
};

const fallbackCategory = {
    label: 'Guide',
    badge: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
    line: 'bg-neutral-400',
};

const getCategoryStyle = (slug: string) => categoryStyles[slug] ?? fallbackCategory;

function CategoryButton({
    category,
    active,
    onClick,
}: {
    category: { slug: string; name: string };
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-md border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                    ? 'border-white bg-white text-[#1d1d1f]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
            }`}
        >
            {category.name}
        </button>
    );
}

function FeaturedArticle({
    article,
    getCategoryName,
}: {
    article: BlogArticle;
    getCategoryName: (slug: string) => string;
}) {
    const category = getCategoryStyle(article.category);

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-white/25"
        >
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ring-1 ${category.badge}`}>
                        {getCategoryName(article.category)}
                    </span>
                    <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
                        {article.title}
                    </h2>
                    <p className="mt-5 max-w-3xl text-base leading-7 text-white/65">
                        {article.excerpt}
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-sm text-white/45">
                    <span className="inline-flex items-center gap-2">
                        <Clock size={16} />
                        {article.readingTime} min read
                    </span>
                    <span className="ml-auto inline-flex items-center gap-2 font-semibold text-sky-200">
                        Read full article <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

function ArticleCard({
    article,
    getCategoryName,
    isBookmarked,
    onToggleBookmark,
}: {
    article: BlogArticle;
    getCategoryName: (slug: string) => string;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
}) {
    const category = getCategoryStyle(article.category);

    return (
        <article className="h-full">
            <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/[0.035] p-5 transition-all hover:border-white/25 hover:bg-white/[0.05] sm:p-6">
                <Link href={`/blog/${article.slug}`} className="group block min-w-0">
                <div>
                    <div className={`mb-4 h-1 w-10 rounded-full ${category.line}`} />
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ring-1 ${category.badge}`}>
                            {getCategoryName(article.category)}
                        </span>
                        <span className="text-[11px] text-white/40">{article.publishedAt}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold leading-snug text-white group-hover:text-sky-200 transition-colors">
                        {article.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm leading-6 text-white/60">
                        {article.excerpt}
                    </p>
                </div>
                </Link>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5 text-white/45">
                        <Clock size={14} />
                        {article.readingTime} min
                    </span>
                    <div className="flex items-center gap-3">
                        <Link href={`/blog/${article.slug}`} className="inline-flex items-center gap-1 font-semibold text-sky-200 transition-transform hover:translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70">
                            Read <ArrowRight size={14} />
                        </Link>
                        <button
                            type="button"
                            onClick={onToggleBookmark}
                            aria-pressed={isBookmarked}
                            aria-label={isBookmarked ? `Remove ${article.title} from saved articles` : `Save ${article.title} for later`}
                            title={isBookmarked ? 'Remove from saved articles' : 'Save for later'}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/70 ${isBookmarked ? 'border-sky-300/50 bg-sky-400/20 text-sky-200' : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/25 hover:text-white'}`}
                        >
                            <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function BlogIndex({ articles, categories, featured }: BlogIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);
    const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);
    const { openPopup } = useNewsletter();

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
    const getCategoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name || getCategoryStyle(slug).label;

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

    const showFeaturedArticle = Boolean(featuredArticle && !searchQuery && selectedCategory === 'all' && !showBookmarkedOnly);
    const libraryArticles = showFeaturedArticle
        ? filteredArticles.filter((article) => article.slug !== featuredArticle?.slug)
        : filteredArticles;

    return (
        <PageTransition>
            <main className="editorial-shell relative max-w-full overflow-hidden text-white">
                {/* Section 1: Editorial Header */}
                <section className="relative overflow-hidden px-4 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-12">
                    <CinematicBackdrop />

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                VGP Reading Room
                            </span>
                            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
                                Articles and production notes.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-white/70 sm:text-lg">
                                Practical tutorials on trap drum design, 808 control, beat licensing terms, mixing decisions, and release strategy.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2: Search, Filters & Article Grid */}
                <section id="vgp-reading-room" className="px-4 pb-16 sm:px-6 lg:pb-20">
                    <div className="mx-auto max-w-7xl">
                        {/* Interactive Search & Category Controls */}
                        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-4 lg:flex-row lg:items-center">
                            {/* Search Input Bar */}
                            <div className="relative flex-1 min-w-[220px]">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <label htmlFor="article-search" className="sr-only">Search articles</label>
                                <input
                                    id="article-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search articles by topic, 808, mixing, licensing..."
                                    className="w-full rounded-lg border border-white/10 bg-black/40 py-2.5 pl-10 pr-9 text-xs text-white placeholder-white/40 transition focus:border-sky-300/50 focus:outline-none focus:ring-1 focus:ring-sky-300/50"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear article search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 mr-1 hidden sm:inline-flex">
                                    <ListFilter size={14} />
                                    Categories:
                                </span>
                                {[{ slug: 'all', name: 'All' }, ...categories].map((category) => (
                                    <CategoryButton
                                        key={category.slug}
                                        category={category}
                                        active={selectedCategory === category.slug && !showBookmarkedOnly}
                                        onClick={() => {
                                            setSelectedCategory(category.slug);
                                            setShowBookmarkedOnly(false);
                                        }}
                                    />
                                ))}

                                {bookmarkedSlugs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                                        aria-pressed={showBookmarkedOnly}
                                        className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-xs font-semibold transition ${
                                            showBookmarkedOnly
                                                ? 'border-sky-300/50 bg-sky-400/20 text-sky-200'
                                                : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                                        }`}
                                    >
                                        <Bookmark size={13} className={showBookmarkedOnly ? 'fill-current' : ''} />
                                        Saved ({bookmarkedSlugs.length})
                                    </button>
                                )}
                            </div>

                            <span className="text-xs font-semibold text-white/45 lg:ml-auto">
                                {filteredArticles.length} articles found
                            </span>
                        </div>

                        {/* Featured Article */}
                        {showFeaturedArticle && featuredArticle && (
                            <div className="mb-10">
                                <FeaturedArticle article={featuredArticle} getCategoryName={getCategoryName} />
                            </div>
                        )}

                        {/* Article Cards Grid */}
                        {libraryArticles.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {libraryArticles.map((article) => (
                                    <ArticleCard
                                        key={article.slug}
                                        article={article}
                                        getCategoryName={getCategoryName}
                                        isBookmarked={bookmarkedSlugs.includes(article.slug)}
                                        onToggleBookmark={() => toggleBookmark(article.slug)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/10 bg-white/[0.035] py-16 text-center">
                                <p className="text-sm font-semibold text-white/50">No articles match your search criteria.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSearchQuery('');
                                        setShowBookmarkedOnly(false);
                                    }}
                                    className="mt-4 text-xs font-semibold text-sky-200 hover:underline"
                                >
                                    Reset all filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 3: Restrained Book Promotion Banner */}
                <section className="border-t border-white/10 bg-white/[0.015] px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <div className="liquid-glass-soft flex flex-col gap-6 rounded-xl border border-white/10 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-200">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-200/70">
                                        Flagship Book Release
                                    </span>
                                    <h3 className="mt-1 text-xl font-semibold text-white">
                                        Music Production Guide: Trap Edition
                                    </h3>
                                    <p className="mt-1 max-w-xl text-xs text-white/60 sm:text-sm">
                                        Want structured long-form reading? Read the 80+ page manual covering 808 physics, drum sequencing, mixing balance, and mastering.
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Link
                                    href="/book"
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white px-5 py-2.5 text-xs font-semibold text-[#030405] transition hover:bg-white/90"
                                >
                                    <span>View Book Details</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
