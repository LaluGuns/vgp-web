'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { ArrowRight, Bell, BookOpen, Clock, FileText, ListFilter, Mail, Newspaper } from 'lucide-react';
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

const launchStats = [
    { label: 'Status', value: 'Coming Soon' },
    { label: 'Edition', value: 'Trap Production' },
    { label: 'Length', value: '104 Pages' },
    { label: 'Format', value: 'PDF' },
];

const guideModules = [
    'Rhythmic Operating System',
    'Trap Framework',
    'Low End and 808 Physics',
    'Sequencing and Session Design',
    'Vocal Processing',
    'Mixing the Full Track',
    'Mastering for Streaming',
    'Release Metadata and Rights',
];

const getCategoryStyle = (slug: string) => categoryStyles[slug] ?? fallbackCategory;

function SoftLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
            {children}
        </span>
    );
}

function StatItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-white/40">{label}</p>
            <p className="mt-1 text-base font-semibold text-white">{value}</p>
        </div>
    );
}

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
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                active
                    ? 'border-white bg-white text-[#1d1d1f]'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
            }`}
        >
            {category.name}
        </button>
    );
}

function BookMockup() {
    return (
        <div className="relative mx-auto max-w-[560px]">
            <div className="absolute inset-x-8 bottom-0 h-16 rounded-[50%] bg-cyan-500/10 blur-3xl" />
            <div className="relative z-10 mx-auto w-[300px] max-w-[82vw] overflow-hidden rounded-lg bg-neutral-950 shadow-[0_34px_90px_rgba(0,0,0,0.48)] ring-1 ring-white/10 sm:w-[min(76vw,420px)]">
                <Image
                    src="/ebooks/trap-guide-book-cover.jpg"
                    alt="Music Production Guide: Trap Edition book cover"
                    width={815}
                    height={1058}
                    priority
                    sizes="(min-width: 1024px) 420px, 76vw"
                    className="h-auto w-full"
                />
            </div>
        </div>
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
            className="group block overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
        >
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div>
                    <span className={`inline-flex rounded-md px-3 py-1 text-xs font-semibold ring-1 ${category.badge}`}>
                        {getCategoryName(article.category)}
                    </span>
                    <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
                        {article.title}
                    </h2>
                    <p className="mt-5 max-w-3xl text-base leading-8 text-white/60">
                        {article.excerpt}
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-sm text-white/45">
                    <span className="inline-flex items-center gap-2">
                        <Clock size={16} />
                        {article.readingTime} min read
                    </span>
                    <span className="ml-auto inline-flex items-center gap-2 font-semibold text-[#0071e3]">
                        Open article <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </Link>
    );
}

function ArticleCard({
    article,
    getCategoryName,
}: {
    article: BlogArticle;
    getCategoryName: (slug: string) => string;
}) {
    const category = getCategoryStyle(article.category);

    return (
        <article className="h-full">
            <Link
                href={`/blog/${article.slug}`}
                className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.035] p-6 transition-colors hover:border-white/20"
            >
                <div className={`mb-5 h-1 w-10 rounded-full ${category.line}`} />
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${category.badge}`}>
                        {getCategoryName(article.category)}
                    </span>
                    <span className="text-xs text-white/35">{article.publishedAt}</span>
                </div>

                <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
                    {article.title}
                </h3>
                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-7 text-white/55">
                    {article.excerpt}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                    <span className="inline-flex items-center gap-2 text-white/45">
                        <Clock size={15} />
                        {article.readingTime} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#0071e3]">
                        Read <ArrowRight size={15} />
                    </span>
                </div>
            </Link>
        </article>
    );
}

export function BlogIndex({ articles, categories, featured }: BlogIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const { openPopup } = useNewsletter();

    const filteredArticles = useMemo(
        () => articles.filter((article) => selectedCategory === 'all' || article.category === selectedCategory),
        [articles, selectedCategory],
    );

    const featuredArticle = featured[0] ?? articles[0];
    const getCategoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name || getCategoryStyle(slug).label;

    return (
        <PageTransition>
        <main className="editorial-shell relative max-w-full overflow-hidden text-white">
                <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16">
                    <CinematicBackdrop />

                    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                        <div className="relative max-w-3xl min-w-0">
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                className="relative z-10"
                            >
                                <SoftLabel>VGP reading room</SoftLabel>
                                <h1
                                    aria-label="Music Production Guide: Trap Edition"
                                    className="mt-6 max-w-full break-words font-display text-4xl font-semibold leading-[1.06] text-white sm:text-6xl lg:text-7xl"
                                >
                                    <span className="block">Music Production</span>
                                    <span className="block">Guide:</span>
                                    <span className="block text-white/45">Trap Edition</span>
                                </h1>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/65">
                                    100% Art. 100% Science.
                                </p>
                                <p className="mt-6 max-w-[21.5rem] text-base leading-7 text-white/70 sm:max-w-2xl sm:text-xl sm:leading-9">
                                    Rhythm, math, and production decisions behind professional trap music. A practical guide for
                                    turning creative instinct into repeatable systems for drums, 808s, vocals, mixing, and mastering.
                                </p>

                                <div className="mt-7 flex max-w-[21.5rem] flex-col gap-3 sm:max-w-none sm:flex-row">
                                    <button
                                        onClick={openPopup}
                                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-white/90"
                                    >
                                        <Bell size={17} />
                                        Notify me
                                    </button>
                                    <a
                                        href="#vgp-reading-room"
                                        className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30"
                                    >
                                        <BookOpen size={17} />
                                        Read articles
                                    </a>
                                </div>
                            </m.div>
                        </div>

                        <m.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <BookMockup />
                        </m.div>
                    </div>

                    <div className="relative mx-auto mt-12 grid max-w-7xl grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4 lg:mt-14">
                        {launchStats.map((item) => (
                            <StatItem key={item.label} label={item.label} value={item.value} />
                        ))}
                    </div>
                </section>


                <section className="overflow-hidden border-y border-white/10 bg-white/[0.035] px-4 py-14 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div>
                            <SoftLabel>Inside the book</SoftLabel>
                            <h2 className="mt-4 max-w-[21.5rem] text-3xl font-semibold leading-tight text-white sm:max-w-xl sm:text-4xl">
                                A production syllabus that looks like it belongs on a serious producer desk.
                            </h2>
                            <p className="mt-5 max-w-[21.5rem] text-base leading-8 text-white/55 sm:max-w-xl">
                                Chapter-style systems for turning creative instinct into repeatable production decisions.
                                Study the core ideas before the full PDF is available.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {guideModules.map((module, index) => (
                                <div
                                    key={module}
                                    className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-sm font-semibold text-white/55 ring-1 ring-white/10">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm font-semibold text-white/80">{module}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="vgp-reading-room" className="overflow-hidden px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <SoftLabel>Editorial system</SoftLabel>
                                <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                                    Production notes from the guide.
                                </h2>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-white/55">
                                    Practical articles on beat selection, 808 control, home recording, licensing, and
                                    release-ready production decisions.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                                    <Newspaper className="mx-auto mb-2 text-white/45" size={19} />
                                    <p className="text-xs font-semibold text-white/45">Articles</p>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                                    <FileText className="mx-auto mb-2 text-white/45" size={19} />
                                    <p className="text-xs font-semibold text-white/45">Chapters</p>
                                </div>
                                <button
                                    onClick={openPopup}
                                    className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-center transition-colors hover:border-white/20"
                                >
                                    <Mail className="mx-auto mb-2 text-white/45" size={19} />
                                    <span className="text-xs font-semibold text-white/45">Waitlist</span>
                                </button>
                            </div>
                        </div>

                        {featuredArticle && (
                            <div className="mb-12">
                                <FeaturedArticle article={featuredArticle} getCategoryName={getCategoryName} />
                            </div>
                        )}

                        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:flex-row md:items-center">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/50">
                                <ListFilter size={16} />
                                Filter
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {[{ slug: 'all', name: 'All' }, ...categories].map((category) => (
                                    <CategoryButton
                                        key={category.slug}
                                        category={category}
                                        active={selectedCategory === category.slug}
                                        onClick={() => setSelectedCategory(category.slug)}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-medium text-white/45 md:ml-auto">
                                {filteredArticles.length} entries
                            </span>
                        </div>

                        {filteredArticles.length > 0 ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {filteredArticles.map((article) => (
                                    <ArticleCard
                                        key={article.slug}
                                        article={article}
                                        getCategoryName={getCategoryName}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-white/10 bg-white/[0.035] py-16 text-center">
                                <p className="text-sm font-semibold text-white/50">No entries in this filter.</p>
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className="mt-4 text-sm font-semibold text-[#0071e3]"
                                >
                                    Clear filter
                                </button>
                            </div>
                        )}
                    </div>
                </section>
        </main>
        </PageTransition>
    );
}
