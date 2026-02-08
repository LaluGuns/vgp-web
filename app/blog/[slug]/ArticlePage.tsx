'use client';

/**
 * Article Page Client Component
 * Full article view with premium reading experience
 * Enhanced with Y3K visual polish
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { m, useScroll, useSpring } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface ArticlePageProps {
    article: BlogArticle;
    category?: Category;
    related: BlogArticle[];
}

const categoryColors: Record<string, { text: string; bg: string; glow: string; gradient: string; hex: string }> = {
    'production-tips': {
        text: 'text-primary',
        bg: 'bg-primary/10',
        glow: 'shadow-[0_0_20px_rgba(0,229,255,0.3)]',
        gradient: 'from-primary/20 via-transparent to-transparent',
        hex: '#00e5ff',
    },
    'licensing-guide': {
        text: 'text-[#ec4899]',
        bg: 'bg-[#ec4899]/10',
        glow: 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
        gradient: 'from-[#ec4899]/20 via-transparent to-transparent',
        hex: '#ec4899',
    },
    'genre-guides': {
        text: 'text-[#00ff88]',
        bg: 'bg-[#00ff88]/10',
        glow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
        gradient: 'from-[#00ff88]/20 via-transparent to-transparent',
        hex: '#00ff88',
    },
};

export function ArticlePage({ article, category, related }: ArticlePageProps) {
    const colors = categoryColors[article.category] || categoryColors['production-tips'];

    // Reading progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <PageTransition>
            {/* Reading Progress Bar */}
            <m.div
                className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
                style={{
                    scaleX,
                    background: `linear-gradient(90deg, ${colors.hex}, ${colors.hex}80)`,
                }}
            />

            {/* Hero Header with Gradient */}
            <div className={`relative bg-gradient-to-b ${colors.gradient}`}>
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Floating Orbs */}
                <div className="absolute top-20 right-10 w-32 h-32 rounded-full blur-[80px] opacity-30" style={{ background: colors.hex }} />
                <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full blur-[60px] opacity-20" style={{ background: colors.hex }} />

                <article className="relative py-16 px-6">
                    <div className="max-w-3xl mx-auto">
                        {/* Breadcrumb */}
                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-sm text-dim-grey mb-8"
                        >
                            <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1 group">
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Blog
                            </Link>
                            <span className="text-white/20">/</span>
                            <Link
                                href={`/blog/category/${article.category}`}
                                className={`hover:text-white transition-colors ${colors.text}`}
                            >
                                {category?.name || article.category}
                            </Link>
                        </m.div>

                        {/* Category Badge */}
                        <m.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className={`inline-flex items-center gap-2 mono-label text-xs px-4 py-2 rounded-full ${colors.text} ${colors.bg} ${colors.glow}`}>
                                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                {category?.name}
                            </span>
                        </m.div>

                        {/* Title */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-hero mt-6 mb-6 leading-tight">
                                {article.title}
                            </h1>
                            {/* Excerpt */}
                            <p className="text-cool-grey text-lg leading-relaxed mb-8">
                                {article.excerpt}
                            </p>
                        </m.div>

                        {/* Meta Info Card */}
                        <m.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <GlassCard padding="sm" className="inline-flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-dim-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-cool-grey">{article.readingTime} min read</span>
                                </div>
                                <div className="w-px h-4 bg-white/10" />
                                <div className="flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4 text-dim-grey" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                                    </svg>
                                    <time dateTime={article.publishedAt} className="text-cool-grey">
                                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </time>
                                </div>
                            </GlassCard>
                        </m.div>
                    </div>
                </article>
            </div>

            {/* Content Section with Sidebar Accent */}
            <article className="py-16 px-6 relative">
                <div className="max-w-3xl mx-auto relative">
                    {/* Accent Line - Left Side */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-px hidden lg:block -ml-16"
                        style={{
                            background: `linear-gradient(180deg, ${colors.hex}40, ${colors.hex}10, transparent)`
                        }}
                    />

                    {/* Content */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="prose prose-invert prose-lg max-w-none"
                    >
                        <div
                            className="article-content"
                            dangerouslySetInnerHTML={{
                                __html: formatContent(article.content, colors.hex)
                            }}
                        />
                    </m.div>

                    {/* Author Card + CTA */}
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-16"
                    >
                        <GlassCard padding="lg" glow="subtle" className="relative overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: colors.hex }} />

                            <div className="flex flex-col items-center text-center sm:text-left sm:flex-row gap-6 relative sm:ml-12">
                                {/* Logo with category color tint */}
                                <div
                                    className="w-20 h-20 flex items-center justify-center shrink-0"
                                >
                                    <img
                                        src="/branding/logo-tg.png"
                                        alt="VGP"
                                        className="w-full h-full object-contain"
                                        style={{
                                            filter: `drop-shadow(0 0 15px ${colors.hex}80)`,
                                        }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                                        VGP Studio
                                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${colors.hex}20`, color: colors.hex }}>
                                            VERIFIED
                                        </span>
                                    </p>
                                    <p className="text-cool-grey text-sm mb-4">
                                        Premium beat production & music education resources.
                                    </p>

                                    {/* CTA Button */}
                                    <Link
                                        href="/studio/beats"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
                                        style={{
                                            background: colors.hex,
                                            color: '#0a0a0a',
                                            boxShadow: `0 0 20px ${colors.hex}40`,
                                        }}
                                    >
                                        Browse Beats
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </m.div>

                    {/* Tags / Keywords */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 pt-8 border-t border-white/10"
                    >
                        <p className="text-xs text-dim-grey mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="7" cy="7" r="1" fill="currentColor" />
                            </svg>
                            RELATED TOPICS
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {article.seo.keywords.map((keyword) => (
                                <span
                                    key={keyword}
                                    className="text-xs px-4 py-2 rounded-full border border-white/10 text-cool-grey hover:border-transparent transition-all duration-200 cursor-default"
                                    style={{
                                        ['--tw-bg-opacity' as string]: 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `${colors.hex}15`;
                                        e.currentTarget.style.color = colors.hex;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '';
                                    }}
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </m.div>
                </div>
            </article>

            {/* Related Articles */}
            {related.length > 0 && (
                <section className="py-16 px-6 bg-carbon relative overflow-hidden">
                    {/* Decorative Gradient Orb */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: colors.hex }} />

                    <div className="max-w-3xl mx-auto relative">
                        <h2 className="text-xl font-semibold mb-8 flex items-center gap-3">
                            <span className="w-1 h-6 rounded-full" style={{ background: colors.hex }} />
                            Continue Reading
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {related.map((rel) => (
                                <Link key={rel.slug} href={`/blog/${rel.slug}`}>
                                    <GlassCard padding="md" hover className="h-full group">
                                        <span className={`mono-label text-xs ${categoryColors[rel.category].text}`}>
                                            {category?.name}
                                        </span>
                                        <h3 className="text-base font-medium mt-2 mb-2 leading-snug group-hover:text-white transition-colors">
                                            {rel.title}
                                        </h3>
                                        <p className="text-cool-grey text-sm line-clamp-2 mb-4">
                                            {rel.excerpt}
                                        </p>
                                        <div className={`text-xs ${categoryColors[rel.category].text} flex items-center gap-1`}>
                                            Read more
                                            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA with Gradient */}
            <section className="py-20 px-6 text-center relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

                <div className="max-w-2xl mx-auto relative">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <p className="mono-label text-primary mb-4">READY TO CREATE?</p>
                        <h2 className="text-3xl font-bold mb-4">
                            Put Your Knowledge Into Practice
                        </h2>
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

// Enhanced markdown-like content formatter with premium styling
function formatContent(content: string, accentColor: string): string {
    // 1. First, handle TABLES completely to prevent other regex from breaking them
    // Matches blocks of lines starting with | (tolerant of whitespace)
    let formatted = content.replace(/((?:^\s*\|.*\|\s*\r?\n)+)/gm, (match) => {
        const rows = match.trim().split(/\r?\n/).map(r => r.trim());
        if (rows.length < 2) return match;

        // Parse header
        const headerCells = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');

        // Check separator line (must contain dashes)
        if (!rows[1].includes('---')) return match;

        // Parse body
        const bodyRows = rows.slice(2).map(row => {
            return row.split('|').map(c => c.trim()).filter(c => c !== '');
        });

        // Generate HTML Table
        const headerHtml = `
            <thead>
                <tr class="bg-white/5 border-b border-white/10">
                    ${headerCells.map(h => `<th class="py-4 px-6 text-left text-sm font-semibold text-white whitespace-nowrap">${h}</th>`).join('')}
                </tr>
            </thead>
        `;

        const bodyHtml = `
            <tbody class="divide-y divide-white/5">
                ${bodyRows.map(cells => `
                    <tr class="hover:bg-white/5 transition-colors">
                        ${cells.map((c, i) => `<td class="py-4 px-6 text-sm ${i === 0 ? 'text-white font-medium' : 'text-cool-grey'}">${c}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;

        return `
            <div class="overflow-x-auto my-8 rounded-xl border border-white/10 bg-white/[0.02] shadow-sm">
                <table class="w-full text-left border-collapse min-w-[600px]">
                    ${headerHtml}
                    ${bodyHtml}
                </table>
            </div>
        `;
    });

    // 2. Then apply other formatting rules
    formatted = formatted
        // H2 Headers
        .replace(/^## (.*$)/gm, `
            <div class="relative mt-16 mb-8">
                <div class="absolute -left-6 top-0 bottom-0 w-1 rounded-full" style="background: linear-gradient(180deg, ${accentColor}, transparent)"></div>
                <h2 class="text-2xl sm:text-3xl font-bold text-white pl-2 break-normal">$1</h2>
            </div>
        `)
        // H3 Headers
        .replace(/^### (.*$)/gm, `
            <h3 class="text-xl font-semibold text-white mt-10 mb-4 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full background-accent shrink-0"></span>
                $1
            </h3>
        `)
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, `<strong class="text-white font-semibold">$1</strong>`)
        // Lists with styled bullets
        .replace(/^- (.*$)/gm, `
            <div class="flex items-start gap-3 mb-3 pl-2">
                <span class="mt-2 w-1.5 h-1.5 rounded-full shrink-0 background-accent"></span>
                <span class="text-cool-grey">$1</span>
            </div>
        `)
        // Quick Guide / Tips blocks
        .replace(/\*\*(Quick Guide|Tip|Note|Important):\*\*/g, `
            <div class="my-6 p-5 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent border-accent-left">
                <p class="text-xs font-bold tracking-wider mb-2 text-accent">$1</p>
        `)
        // Numbered lists
        .replace(/^(\d+)\. (.*$)/gm, `
            <div class="flex items-start gap-4 mb-4">
                <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-accent-dim text-accent">$1</span>
                <span class="text-cool-grey pt-1">$2</span>
            </div>
        `);

    // 3. Finally, wrap unhandled text in P tags
    // Important: We need to avoid wrapping HTML blocks we just created (like <div class="overflow-x-auto"...) in <p> tags
    // Simple strategy: Split by double newline, check if line starts with < or empty, otherwise wrap

    // Actually, simple regex replacement at end is risky.
    // Let's use a simpler heuristic: match lines that DON'T start with < and aren't empty
    formatted = formatted.replace(/^([^<\s].*)$/gm, `<p class="text-cool-grey leading-relaxed mb-6">$1</p>`);

    // Apply accent colors dynamically via regex replacement for style attributes
    formatted = formatted
        .replace(/background-accent/g, `style="background: ${accentColor}"`)
        .replace(/border-accent-left/g, `style="border-left: 3px solid ${accentColor}"`)
        .replace(/text-accent/g, `style="color: ${accentColor}"`)
        .replace(/bg-accent-dim/g, `style="background: ${accentColor}15; color: ${accentColor}"`);

    return formatted;
}
