'use client';

/**
 * Category Page Client Component
 * Filtered article grid by category
 */

import Link from 'next/link';
import { m } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { staggerParent, staggerChild } from '@/lib/motion-presets';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface CategoryPageProps {
    category: Category;
    articles: BlogArticle[];
    allCategories: Category[];
}

const categoryColors: Record<string, string> = {
    'production-tips': 'text-primary',
    'licensing-guide': 'text-[#ec4899]',
    'genre-guides': 'text-[#00ff88]',
};

export function CategoryPage({ category, articles, allCategories }: CategoryPageProps) {
    return (
        <PageTransition>
            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link
                            href="/blog"
                            className="mono-label text-dim-grey hover:text-white transition-colors mb-4 inline-block"
                        >
                            ← BACK TO BLOG
                        </Link>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-hero mb-4 ${categoryColors[category.slug]}`}>
                            {category.name}
                        </h1>
                        <p className="text-cool-grey text-lg">
                            {category.description}
                        </p>
                    </m.div>
                </div>
            </section>

            {/* Category Navigation */}
            <section className="px-6 py-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/blog"
                            className="px-5 py-2 rounded-full text-sm font-medium bg-white/5 text-dim-grey hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            All Articles
                        </Link>
                        {allCategories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/blog/category/${cat.slug}`}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${cat.slug === category.slug
                                        ? 'bg-primary text-obsidian'
                                        : 'bg-white/5 text-dim-grey hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-12 px-6 bg-carbon">
                <div className="max-w-5xl mx-auto">
                    <m.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerParent}
                        initial="hidden"
                        animate="visible"
                    >
                        {articles.map((article) => (
                            <m.div key={article.slug} variants={staggerChild}>
                                <Link href={`/blog/${article.slug}`}>
                                    <GlassCard className="h-full" padding="md" hover>
                                        <span className={`mono-label text-xs ${categoryColors[article.category]}`}>
                                            {category.name}
                                        </span>
                                        <h3 className="text-lg font-semibold mt-2 mb-2 tracking-apple leading-snug">
                                            {article.title}
                                        </h3>
                                        <p className="text-cool-grey text-sm mb-4 line-clamp-2">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-dim-grey mt-auto pt-3 border-t border-white/5">
                                            <span>{article.readingTime} min</span>
                                            <span>•</span>
                                            <span>{new Date(article.publishedAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </m.div>
                        ))}
                    </m.div>

                    {articles.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-dim-grey">No articles in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Ready to Find Your Beat?</h2>
                        <p className="text-cool-grey mb-6">
                            Browse our catalog of premium instrumentals.
                        </p>
                        <Link
                            href="/studio/beats"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-obsidian font-medium rounded-full hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-200"
                        >
                            Browse Beats
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
