'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import type { BlogArticle, Category } from '@/lib/blog-data';

interface BlogIndexProps {
    articles: BlogArticle[];
    categories: Category[];
    featured: BlogArticle[];
}

const CAT: Record<string, { color: string; secondary: string }> = {
    'production-tips': { color: '#00D4FF', secondary: '#0066FF' },
    'licensing-guide': { color: '#FF3CAC', secondary: '#FF0066' },
    'genre-guides': { color: '#FFD700', secondary: '#FF6B00' },
};
const fallback = { color: '#B8FF00', secondary: '#00FF88' };
const getCat = (slug: string) => CAT[slug] ?? fallback;

// ── HOLO THUMB ────────────────────────────────────────────────────────
function HoloThumb({ slug, title, variant = 'sm' }: { slug: string; title: string; variant?: 'sm' | 'lg' }) {
    const { color, secondary } = getCat(slug);
    const ch = title.charAt(0).toUpperCase();
    const uid = `${slug}-${variant}`;

    return (
        <div className="absolute inset-0 overflow-hidden" style={{ background: '#03030a' }}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <radialGradient id={`glow-${uid}`} cx="55%" cy="45%" r="55%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                    <pattern id={`grid-${uid}`} width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M 24 0 L 0 0 0 24" fill="none" stroke={color} strokeWidth="0.35" />
                    </pattern>
                </defs>
            </svg>

            {/* Glow */}
            <svg className="absolute inset-0 w-full h-full">
                <rect width="100%" height="100%" fill={`url(#glow-${uid})`} />
            </svg>

            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.05 }}>
                <rect width="100%" height="100%" fill={`url(#grid-${uid})`} />
            </svg>

            {/* Scanlines */}
            <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
                pointerEvents: 'none',
            }} />

            {/* Ghost letter */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <span style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontWeight: 900,
                    fontSize: variant === 'lg' ? '18rem' : '7rem',
                    lineHeight: 1,
                    color: 'transparent',
                    WebkitTextStroke: `1px ${color}`,
                    opacity: 0.12,
                    letterSpacing: '-0.05em',
                    userSelect: 'none',
                }}>
                    {ch}
                </span>
            </div>

            {/* Spinning conic blob */}
            <div style={{
                position: 'absolute',
                width: variant === 'lg' ? '280px' : '110px',
                height: variant === 'lg' ? '280px' : '110px',
                borderRadius: '50%',
                background: `conic-gradient(from 0deg, ${color}35, ${secondary}25, transparent, ${color}35)`,
                filter: 'blur(35px)',
                top: '5%', right: '5%',
                animation: 'spin 14s linear infinite',
                willChange: 'transform',
                transform: 'translateZ(0)',
            }} />

            {/* Horizontal light streak */}
            <div style={{
                position: 'absolute',
                left: 0, right: 0,
                top: '40%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${color}70, ${secondary}50, transparent)`,
                boxShadow: `0 0 10px ${color}80`,
            }} />

            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, borderTop: `1px solid ${color}60`, borderRight: `1px solid ${color}60` }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, width: 14, height: 14, borderBottom: `1px solid ${color}60`, borderLeft: `1px solid ${color}60` }} />

            {/* Bottom line */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
            }} />
        </div>
    );
}

function DataTag({ color, children }: { color: string; children: React.ReactNode }) {
    return (
        <span style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: '0.55rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: color, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            {children}
        </span>
    );
}

// ── FEATURED CARD ─────────────────────────────────────────────────────
function FeaturedCard({ article, getCategoryName }: { article: BlogArticle; getCategoryName: (s: string) => string }) {
    const { color, secondary } = getCat(article.category);

    return (
        <Link href={`/blog/${article.slug}`} className="group block">
            <div
                className="relative overflow-hidden rounded-2xl transition-all duration-500"
                style={{
                    background: 'rgba(255,255,255,0.022)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${color}40`;
                    el.style.boxShadow = `0 40px 100px rgba(0,0,0,0.7), 0 0 60px ${color}12`;
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(255,255,255,0.07)';
                    el.style.boxShadow = '0 40px 100px rgba(0,0,0,0.6)';
                }}
            >
                {/* HUD top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.015)',
                }}>
                    <DataTag color={color}>SYS.FEATURED</DataTag>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <DataTag color="rgba(255,255,255,0.22)">{article.publishedAt}</DataTag>
                        <DataTag color={color}>{getCategoryName(article.category)}</DataTag>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2">
                    {/* Visual side */}
                    <div className="relative overflow-hidden" style={{ height: 380 }}>
                        <HoloThumb slug={article.category} title={article.title} variant="lg" />
                        {/* Fade to content */}
                        <div className="hidden lg:block absolute inset-y-0 right-0 w-28" style={{
                            background: 'linear-gradient(to right, transparent, #03030a)',
                        }} />
                    </div>

                    {/* Content side */}
                    <div className="flex flex-col justify-between p-8 lg:p-10" style={{ position: 'relative', zIndex: 10 }}>
                        <div>
                            {/* Pill */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '6px 14px', borderRadius: 999, marginBottom: 20,
                                background: `linear-gradient(135deg, ${color}15, ${secondary}10)`,
                                border: `1px solid ${color}30`,
                                boxShadow: `0 0 18px ${color}18`,
                            }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                                <span style={{
                                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                                    fontSize: '0.58rem', letterSpacing: '0.28em',
                                    textTransform: 'uppercase', color,
                                }}>Featured Article</span>
                            </div>

                            <h2 style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                                fontWeight: 800,
                                fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                                lineHeight: 1.1,
                                letterSpacing: '-0.03em',
                                color: 'rgba(255,255,255,0.9)',
                                marginBottom: 16,
                            }}>
                                {article.title}
                            </h2>

                            <p style={{
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                fontSize: '0.875rem',
                                lineHeight: 1.85,
                                color: 'rgba(255,255,255,0.35)',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}>
                                {article.excerpt}
                            </p>
                        </div>

                        {/* CTA */}
                        <div style={{ marginTop: 32 }}>
                            <div style={{
                                width: 40, height: 1, marginBottom: 20,
                                backgroundColor: color,
                                transition: 'width 0.4s ease',
                            }} className="group-hover:w-16" />
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 12,
                                fontFamily: 'ui-monospace, "SF Mono", monospace',
                                fontSize: '0.62rem', letterSpacing: '0.24em',
                                textTransform: 'uppercase', color,
                            }}>
                                Access Article
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HUD bottom bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.01)',
                }}>
                    <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: '0.5rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>VGP.BLOG.v2025</span>
                    <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: '0.5rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>READ_MORE ↗</span>
                </div>
            </div>
        </Link>
    );
}

// ── ARTICLE CARD ──────────────────────────────────────────────────────
function ArticleCard({ article, index, getCategoryName }: {
    article: BlogArticle; index: number; getCategoryName: (s: string) => string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const { color, secondary } = getCat(article.category);

    return (
        <motion.div ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={`/blog/${article.slug}`} className="group block h-full">
                <div
                    className="h-full flex flex-col overflow-hidden rounded-xl"
                    style={{
                        background: 'rgba(255,255,255,0.022)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.35s ease',
                    }}
                    onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(-5px)';
                        el.style.borderColor = `${color}30`;
                        el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.55), 0 0 30px ${color}10`;
                    }}
                    onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.transform = 'translateY(0)';
                        el.style.borderColor = 'rgba(255,255,255,0.06)';
                        el.style.boxShadow = 'none';
                    }}
                >
                    {/* Thumb */}
                    <div className="relative overflow-hidden shrink-0" style={{ height: 168 }}>
                        <HoloThumb slug={article.category} title={article.title} />

                        {/* Badge */}
                        <div style={{
                            position: 'absolute', top: 10, left: 10, zIndex: 10,
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 999,
                            backdropFilter: 'blur(12px)',
                            background: `${color}12`,
                            border: `1px solid ${color}30`,
                        }}>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
                            <span style={{
                                fontFamily: 'ui-monospace, "SF Mono", monospace',
                                fontSize: '0.52rem', letterSpacing: '0.22em',
                                textTransform: 'uppercase', color,
                            }}>{getCategoryName(article.category)}</span>
                        </div>

                        {/* Hover bottom glow line */}
                        <div
                            className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                height: 1,
                                background: `linear-gradient(90deg, transparent, ${color}, ${secondary}, transparent)`,
                                boxShadow: `0 0 8px ${color}`,
                            }}
                        />
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-5">
                        {/* Timestamp row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: '0.52rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
                                {article.publishedAt}
                            </span>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: i === 0 ? color : `${color}28` }} />
                                ))}
                            </div>
                        </div>

                        <h3 style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            lineHeight: 1.4,
                            letterSpacing: '-0.02em',
                            color: 'rgba(255,255,255,0.82)',
                            marginBottom: 10,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}>
                            {article.title}
                        </h3>

                        <p style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '0.75rem',
                            lineHeight: 1.7,
                            color: 'rgba(255,255,255,0.28)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1,
                            marginBottom: 16,
                        }}>
                            {article.excerpt}
                        </p>

                        {/* Footer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingTop: 12,
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 12, height: 1, backgroundColor: `${color}50` }} />
                                <span style={{ fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>VGP</span>
                            </div>
                            <span
                                className="group-hover:gap-3"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                    fontFamily: 'ui-monospace, "SF Mono", monospace',
                                    fontSize: '0.55rem', letterSpacing: '0.25em',
                                    textTransform: 'uppercase', color,
                                    transition: 'gap 0.3s ease',
                                }}
                            >
                                ACCESS
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ── MAIN ──────────────────────────────────────────────────────────────
export function BlogIndex({ articles, categories, featured }: BlogIndexProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredArticles = articles.filter(a =>
        selectedCategory === 'all' || a.category === selectedCategory
    );

    const featuredArticle = featured[0] ?? articles[0];
    const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;

    const sfPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    const sfMono = 'ui-monospace, "SF Mono", monospace';

    return (
        <PageTransition>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
                @keyframes holo {
                    0%,100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>

            <div style={{ background: '#03030a', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

                {/* Ambient blobs */}
                <div style={{ position: 'fixed', top: '-15%', left: '-8%', width: '70vw', height: '70vw', background: 'radial-gradient(circle, rgba(0,212,255,0.065) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', transform: 'translateZ(0)', willChange: 'transform' }} />
                <div style={{ position: 'fixed', top: '25%', right: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(255,60,172,0.045) 0%, transparent 60%)', filter: 'blur(90px)', pointerEvents: 'none', transform: 'translateZ(0)', willChange: 'transform' }} />

                {/* Global scanlines */}
                <div style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.022,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)',
                }} />

                <section style={{ paddingTop: 96, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
                    <div style={{ maxWidth: 1152, margin: '0 auto' }}>

                        {/* ── HEADER ── */}
                        <motion.div
                            style={{ marginBottom: 80, position: 'relative' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Ghost BG */}
                            <div aria-hidden style={{
                                position: 'absolute', top: -8, left: 0,
                                fontFamily: sfPro, fontWeight: 900,
                                fontSize: 'clamp(4rem, 14vw, 10rem)',
                                lineHeight: 1, letterSpacing: '-0.05em',
                                color: 'rgba(255,255,255,0.018)',
                                userSelect: 'none', pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                            }}>BLOG</div>

                            <div style={{ position: 'relative', zIndex: 10 }}>
                                {/* Eyebrow */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                    <div style={{ width: 24, height: 1, backgroundColor: '#00D4FF' }} />
                                    <span style={{ fontFamily: sfMono, fontSize: '0.58rem', letterSpacing: '0.4em', color: 'rgba(0,212,255,0.7)', textTransform: 'uppercase' }}>
                                        VGP Knowledge Base
                                    </span>
                                </div>

                                {/* Title — contained, no overflow */}
                                <h1 style={{
                                    fontFamily: sfPro,
                                    fontWeight: 900,
                                    fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                                    lineHeight: 0.92,
                                    letterSpacing: '-0.045em',
                                    marginBottom: 28,
                                }}>
                                    <span style={{ display: 'block', color: 'rgba(255,255,255,0.95)' }}>Production</span>
                                    <span style={{
                                        display: 'block',
                                        backgroundImage: 'linear-gradient(135deg, #00D4FF 0%, #7DF9FF 25%, #FF3CAC 55%, #FFD700 85%, #00D4FF 100%)',
                                        backgroundSize: '300% 300%',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        animation: 'holo 5s ease infinite',
                                    }}>
                                        Insights
                                    </span>
                                </h1>

                                {/* Descriptor */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, maxWidth: 400 }}>
                                    <div style={{ width: 1, minHeight: 36, flexShrink: 0, background: 'linear-gradient(to bottom, #00D4FF, transparent)' }} />
                                    <p style={{ fontFamily: sfPro, fontSize: '0.875rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.32)', fontWeight: 300 }}>
                                        Expert guides on beat licensing, production techniques, and industry trends.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* ── FEATURED ── */}
                        {featuredArticle && (
                            <motion.div
                                style={{ marginBottom: 72 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.15 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <span style={{ fontFamily: sfMono, fontSize: '0.52rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase' }}>
                                        Latest.Featured
                                    </span>
                                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)' }} />
                                </div>
                                <FeaturedCard article={featuredArticle} getCategoryName={getCategoryName} />
                            </motion.div>
                        )}

                        {/* ── FILTER ── */}
                        <motion.div
                            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 36 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span style={{ fontFamily: sfMono, fontSize: '0.52rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginRight: 4 }}>
                                Filter://
                            </span>

                            {[{ slug: 'all', name: 'All' }, ...categories].map((c) => {
                                const isActive = selectedCategory === c.slug;
                                const color = c.slug === 'all' ? 'rgba(255,255,255,0.9)' : getCat(c.slug).color;

                                return (
                                    <button
                                        key={c.slug}
                                        onClick={() => setSelectedCategory(c.slug)}
                                        style={{
                                            fontFamily: sfMono,
                                            fontSize: '0.6rem',
                                            letterSpacing: '0.22em',
                                            textTransform: 'uppercase',
                                            padding: '6px 16px',
                                            borderRadius: 999,
                                            border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.08)'}`,
                                            background: isActive ? color : 'transparent',
                                            color: isActive ? '#000' : 'rgba(255,255,255,0.3)',
                                            boxShadow: isActive ? `0 0 18px ${color}45` : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}

                            <span style={{ marginLeft: 'auto', fontFamily: sfMono, fontSize: '0.52rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>
                                {filteredArticles.length}_ENTRIES
                            </span>
                        </motion.div>

                        {/* ── GRID ── */}
                        {filteredArticles.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                                {filteredArticles.map((article, i) => (
                                    <ArticleCard key={article.slug} article={article} index={i} getCategoryName={getCategoryName} />
                                ))}
                            </div>
                        ) : (
                            <motion.div style={{ textAlign: 'center', padding: '96px 0' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <p style={{ fontFamily: sfMono, fontSize: '0.62rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase', marginBottom: 16 }}>
                                    NULL.RESULTS
                                </p>
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    style={{ fontFamily: sfMono, fontSize: '0.58rem', letterSpacing: '0.3em', color: '#00D4FF', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    CLEAR.FILTER →
                                </button>
                            </motion.div>
                        )}
                    </div>
                </section>
            </div>
        </PageTransition>
    );
}
