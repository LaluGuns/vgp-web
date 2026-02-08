'use client';

/**
 * Blog Index Client Component
 * Grid layout with category filter tabs
 * Enhanced with Y3K visual polish
 */

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { staggerParent, staggerChild } from '@/lib/motion-presets';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface BlogIndexProps {
    articles: BlogArticle[];
    categories: Category[];
    featured: BlogArticle[];
}

const categoryStyles: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    'production-tips': {
        text: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        glow: 'shadow-[0_0_30px_rgba(0,229,255,0.2)]',
    },
    'licensing-guide': {
        text: 'text-[#ec4899]',
        bg: 'bg-[#ec4899]/10',
        border: 'border-[#ec4899]/30',
        glow: 'shadow-[0_0_30px_rgba(236,72,153,0.2)]',
    },
    'genre-guides': {
        text: 'text-[#00ff88]',
        bg: 'bg-[#00ff88]/10',
        border: 'border-[#00ff88]/30',
        glow: 'shadow-[0_0_30px_rgba(0,255,136,0.2)]',
    },
};

export function BlogIndex({ articles, categories, featured }: BlogIndexProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredArticles = activeCategory
        ? articles.filter((a) => a.category === activeCategory)
        : articles;

    const getCategoryName = (slug: string) => {
        return categories.find((c) => c.slug === slug)?.name || slug;
    };

    return (
        <PageTransition>
            {/* Hero with Gradient */}
            <section className="relative py-20 px-6 text-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="max-w-3xl mx-auto relative">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 mono-label text-primary mb-6 bg-primary/10 px-4 py-2 rounded-full">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="m22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            KNOWLEDGE BASE
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-hero mb-6">
                            Learn & <span className="text-primary">Create</span>
                        </h1>
                        <p className="text-cool-grey text-lg max-w-xl mx-auto">
                            Production techniques, licensing guides, and genre breakdowns
                            to elevate your music journey.
                        </p>
                    </m.div>
                </div>
            </section>

            {/* Featured Article */}
            {featured.length > 0 && (
                <section className="px-6 pb-16">
                    <div className="max-w-5xl mx-auto">
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link href={`/blog/${featured[0].slug}`} className="group block">
                                <div className={`relative overflow-hidden rounded-2xl border ${categoryStyles[featured[0].category].border} ${categoryStyles[featured[0].category].glow} bg-gradient-to-br from-white/[0.03] to-transparent p-8 sm:p-10 hover:border-white/20 transition-all duration-300`}>
                                    {/* Decorative Corner */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent" />

                                    {/* Featured Badge */}
                                    <div className="absolute top-6 right-6">
                                        <span className="inline-flex items-center gap-2 mono-label text-xs bg-primary/20 text-primary px-4 py-2 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                            FEATURED
                                        </span>
                                    </div>

                                    <span className={`inline-flex items-center gap-2 mono-label text-xs ${categoryStyles[featured[0].category].text} ${categoryStyles[featured[0].category].bg} px-3 py-1 rounded-full`}>
                                        {getCategoryName(featured[0].category)}
                                    </span>

                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-4 mb-4 tracking-apple group-hover:text-primary transition-colors">
                                        {featured[0].title}
                                    </h2>

                                    <p className="text-cool-grey leading-relaxed mb-6 max-w-2xl">
                                        {featured[0].excerpt}
                                    </p>

                                    <div className="flex items-center gap-6 text-sm text-dim-grey">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 6v6l4 2" strokeLinecap="round" />
                                            </svg>
                                            {featured[0].readingTime} min read
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                                            </svg>
                                            {new Date(featured[0].publishedAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className={`ml-auto flex items-center gap-1 ${categoryStyles[featured[0].category].text} group-hover:gap-2 transition-all`}>
                                            Read Article
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </m.div>
                    </div>
                </section>
            )}

            {/* Category Tabs */}
            <section className="px-6 py-12 bg-carbon relative">
                {/* Decorative Orbs */}
                <div className="absolute top-0 left-10 w-32 h-32 bg-primary/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-10 w-48 h-48 bg-[#ec4899]/5 rounded-full blur-[100px]" />

                <div className="max-w-5xl mx-auto relative">
                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === null
                                    ? 'bg-primary text-obsidian shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                    : 'bg-white/5 text-dim-grey hover:text-white hover:bg-white/10 border border-white/5'
                                }`}
                        >
                            All Articles
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                onClick={() => setActiveCategory(cat.slug)}
                                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${activeCategory === cat.slug
                                        ? `${categoryStyles[cat.slug].bg} ${categoryStyles[cat.slug].text} ${categoryStyles[cat.slug].glow} border ${categoryStyles[cat.slug].border}`
                                        : 'bg-white/5 text-dim-grey hover:text-white hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Articles Grid */}
                    <m.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerParent}
                        initial="hidden"
                        animate="visible"
                        key={activeCategory}
                    >
                        {filteredArticles.map((article) => (
                            <m.div key={article.slug} variants={staggerChild}>
                                <Link href={`/blog/${article.slug}`} className="group block h-full">
                                    <GlassCard className="h-full flex flex-col" padding="md" hover>
                                        {/* Category with dot */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`w-2 h-2 rounded-full ${categoryStyles[article.category].bg.replace('/10', '')}`}
                                                style={{
                                                    background: article.category === 'production-tips' ? '#00e5ff'
                                                        : article.category === 'licensing-guide' ? '#ec4899'
                                                            : '#00ff88'
                                                }}
                                            />
                                            <span className={`mono-label text-xs ${categoryStyles[article.category].text}`}>
                                                {getCategoryName(article.category)}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold mb-2 tracking-apple leading-snug group-hover:text-white transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-cool-grey text-sm mb-4 line-clamp-2 flex-1">
                                            {article.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-xs text-dim-grey">
                                                <span>{article.readingTime} min</span>
                                                <span>•</span>
                                                <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>
                                            <svg className={`w-4 h-4 ${categoryStyles[article.category].text} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </m.div>
                        ))}
                    </m.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

                <div className="max-w-2xl mx-auto relative">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="mono-label text-primary mb-4">READY TO CREATE?</p>
                        <h2 className="text-3xl font-bold mb-4">Find Your Perfect Beat</h2>
                        <p className="text-cool-grey mb-8 text-lg">
                            Browse our catalog of premium instrumentals.
                        </p>
                        <Link
                            href="/studio/beats"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-obsidian font-medium rounded-full hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)] transition-all duration-300"
                        >
                            Browse Beats
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
