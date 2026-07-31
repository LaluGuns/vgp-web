'use client';

/**
 * Article Page Client Component
 * Full article view with premium interactive reading experience
 * Features: React Portal top reading progress bar (fixed to document.body),
 * React Portal high-z-index mobile drawer & inline ToC accordion, active section tracking,
 * text size control, bookmarks, copy link/share, key takeaways, and enhanced typography.
 */

import { useState, useEffect, useMemo, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowUp,
    Bookmark,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Copy,
    List,
    Share2,
    Sparkles,
    Type,
    X,
    BarChart2,
    Activity,
    Download,
    QrCode,
    Award,
    CheckCircle2,
    Headphones,
    HelpCircle,
    Send,
    Clock3,
    ShieldCheck,
    ExternalLink,
    Mail,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { MasterclassShareModal } from '@/components/blog/MasterclassShareModal';
import type { BlogArticle, Category } from '@/lib/blog-data';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
        text: 'text-sky-200',
        bg: 'bg-sky-300/10',
        glow: 'shadow-[0_0_20px_rgba(56,189,248,0.22)]',
        gradient: 'from-sky-300/20 via-transparent to-transparent',
        hex: '#38bdf8',
    },
    'genre-guides': {
        text: 'text-cyan-200',
        bg: 'bg-cyan-300/10',
        glow: 'shadow-[0_0_20px_rgba(103,232,249,0.2)]',
        gradient: 'from-cyan-300/20 via-transparent to-transparent',
        hex: '#67e8f9',
    },
    'songwriting': {
        text: 'text-blue-200',
        bg: 'bg-blue-300/10',
        glow: 'shadow-[0_0_20px_rgba(147,197,253,0.18)]',
        gradient: 'from-blue-300/20 via-transparent to-transparent',
        hex: '#93c5fd',
    },
    'arrangement-groove': {
        text: 'text-sky-200',
        bg: 'bg-sky-300/10',
        glow: 'shadow-[0_0_20px_rgba(14,165,233,0.2)]',
        gradient: 'from-sky-400/20 via-transparent to-transparent',
        hex: '#0ea5e9',
    },
    'sound-design': {
        text: 'text-[#10b981]',
        bg: 'bg-[#10b981]/10',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        gradient: 'from-[#10b981]/20 via-transparent to-transparent',
        hex: '#10b981',
    },
    'vocal-production': {
        text: 'text-sky-100',
        bg: 'bg-sky-200/10',
        glow: 'shadow-[0_0_20px_rgba(125,211,252,0.18)]',
        gradient: 'from-sky-200/20 via-transparent to-transparent',
        hex: '#7dd3fc',
    },
    'mixing-mastering': {
        text: 'text-[#06b6d4]',
        bg: 'bg-[#06b6d4]/10',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
        gradient: 'from-[#06b6d4]/20 via-transparent to-transparent',
        hex: '#06b6d4',
    },
    'producer-psychology': {
        text: 'text-slate-200',
        bg: 'bg-slate-300/10',
        glow: 'shadow-[0_0_20px_rgba(203,213,225,0.15)]',
        gradient: 'from-slate-300/20 via-transparent to-transparent',
        hex: '#cbd5e1',
    },
    'audio-science': {
        text: 'text-[#3b82f6]',
        bg: 'bg-[#3b82f6]/10',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        gradient: 'from-[#3b82f6]/20 via-transparent to-transparent',
        hex: '#3b82f6',
    },
};

export function ArticlePage({ article, category, related }: ArticlePageProps) {
    const colors = categoryColors[article.category] || categoryColors['production-tips'];

    // Medical / Hearing Claims Detection
    const hasMedicalOrHearingClaims =
        /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i.test(article.content) ||
        /tinnitus|hearing loss|hearing damage|hearing safety|acoustic reflex|binaural|entrainment/i.test(article.excerpt);

    // Reading Progress & Springs
    const { scrollYProgress } = useScroll();
    useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    // Interactive States
    const [mounted, setMounted] = useState(false);
    const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>('large');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [activeSection, setActiveSection] = useState<string>('');
    const [showInlineToc, setShowInlineToc] = useState(true);
    const [showMobileBottomSheet, setShowMobileBottomSheet] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isReaderWidgetExpanded, setIsReaderWidgetExpanded] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    // Mount check for Portal
    useEffect(() => {
        let isMounted = true;
        requestAnimationFrame(() => {
            if (isMounted) {
                setMounted(true);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    // Extract Headings for Table of Contents
    const headings = useMemo(() => {
        const matches = Array.from(article.content.matchAll(/^##\s+(.*$)/gm));
        return matches.map((match, index) => {
            const title = match[1].replace(/\*\*/g, '').trim();
            const id = `section-${index}`;
            return { title, id };
        });
    }, [article.content]);

    // Extract Key Takeaways
    const keyTakeaways = useMemo(() => {
        const bullets = Array.from(article.content.matchAll(/^- (.*$)/gm)).map(m => m[1].replace(/\*\*/g, '').trim());
        if (bullets.length >= 2) {
            return bullets.slice(0, 4);
        }
        return [
            article.excerpt,
            'Written, mixed, and analyzed through practical audio engineering principles.',
            'Directly applicable to modern beat production, arrangement, and mixing workflows.',
        ];
    }, [article.content, article.excerpt]);

    // Track Native Window Scroll Progress with ResizeObserver
    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollPx = window.scrollY || window.pageYOffset || 0;
            const docHeight = Math.max(
                document.body?.scrollHeight || 0,
                document.documentElement?.scrollHeight || 0,
                document.body?.offsetHeight || 0,
                document.documentElement?.offsetHeight || 0
            );
            const winHeight = docHeight - window.innerHeight;
            const pct = winHeight > 0 ? Math.min(100, Math.max(0, (scrollPx / winHeight) * 100)) : 0;
            setScrollPercent(Math.round(pct));
            setShowScrollTop(scrollPx > 350);
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress, { passive: true });

        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined' && document.body) {
            resizeObserver = new ResizeObserver(() => updateScrollProgress());
            resizeObserver.observe(document.body);
        }

        updateScrollProgress();

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
            window.removeEventListener('resize', updateScrollProgress);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, []);

    // IntersectionObserver for TOC Heading Highlighting
    useEffect(() => {
        if (headings.length === 0) return;

        const handleScroll = () => {
            const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
            if (headingElements.length === 0) return;

            let current = headings[0].id;
            for (const el of headingElements) {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 140) {
                        current = el.id;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    // Bookmark Persistence
    useEffect(() => {
        let isMounted = true;
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            const isSaved = saved.includes(article.slug);
            requestAnimationFrame(() => {
                if (isMounted) {
                    setIsBookmarked(isSaved);
                }
            });
        } catch {
            // ignore
        }
        return () => {
            isMounted = false;
        };
    }, [article.slug]);

    const toggleBookmark = () => {
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            const updated = saved.includes(article.slug)
                ? saved.filter(s => s !== article.slug)
                : [...saved, article.slug];
            localStorage.setItem('vgp_bookmarked_articles', JSON.stringify(updated));
            setIsBookmarked(!isBookmarked);
        } catch {
            // ignore
        }
    };

    const handleCopyLink = () => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const cycleFontSize = () => {
        if (fontSizeLevel === 'normal') setFontSizeLevel('large');
        else if (fontSizeLevel === 'large') setFontSizeLevel('xlarge');
        else setFontSizeLevel('normal');
    };

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const yOffset = -100;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset + yOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
            setShowMobileBottomSheet(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load MathJax dynamically for LaTeX formula support
    useEffect(() => {
        const typesetMath = () => {
            if (typeof window !== 'undefined' && (window as any).MathJax) {
                const MJ = (window as any).MathJax;
                try {
                    if (MJ.typesetClear) MJ.typesetClear();
                    if (MJ.typesetPromise) {
                        MJ.typesetPromise(['.article-content']).catch(() => {});
                    }
                } catch {
                    // ignore
                }
            }
        };

        if (typeof window !== 'undefined' && !(window as any).MathJax?.typesetPromise) {
            (window as any).MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']],
                    processEscapes: true,
                },
                options: {
                    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                },
            };
        }

        const scriptId = 'mathjax-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            script.addEventListener('load', () => {
                setTimeout(typesetMath, 50);
                setTimeout(typesetMath, 300);
            });
            document.head.appendChild(script);
        } else {
            requestAnimationFrame(typesetMath);
            setTimeout(typesetMath, 150);
            setTimeout(typesetMath, 500);
        }
    }, [article]);

    const fontSizeClasses = {
        normal: 'text-base sm:text-lg leading-[1.85rem] sm:leading-8',
        large: 'text-lg sm:text-xl leading-[2rem] sm:leading-9',
        xlarge: 'text-xl sm:text-2xl leading-[2.25rem] sm:leading-[2.5rem]',
    }[fontSizeLevel];

    const minutesLeft = Math.max(1, Math.ceil(article.readingTime * (1 - scrollPercent / 100)));

    // Render Progress Bar via Portal to avoid CSS transform ancestor bugs
    const progressBarElement = (
        <div
            className="fixed top-0 left-0 h-1.5 z-[9999] pointer-events-none transition-all duration-100 ease-out"
            style={{
                width: `${Math.max(scrollPercent, 1.5)}%`,
                background: `linear-gradient(90deg, #00e5ff, ${colors.hex}, #38bdf8)`,
                boxShadow: `0 0 16px #00e5ff, 0 0 8px ${colors.hex}`,
            }}
        />
    );

    return (
        <PageTransition>
            {/* Top Reading Progress Bar rendered directly into document.body */}
            {mounted && createPortal(progressBarElement, document.body)}

            {/* Hero Header */}
            <div className={`relative bg-gradient-to-b ${colors.gradient}`}>
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />

                <div className="absolute top-20 right-10 w-32 h-32 rounded-full blur-[80px] opacity-30" style={{ background: colors.hex }} />
                <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full blur-[60px] opacity-20" style={{ background: colors.hex }} />

                <article className="relative py-12 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-5"
                        >
                            <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1 group">
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Reading Room
                            </Link>
                            <span className="text-white/20">/</span>
                            <Link
                                href={`/blog/category/${article.category}`}
                                className={`hover:text-white transition-colors ${colors.text}`}
                            >
                                {category?.name || article.category}
                            </Link>
                        </motion.div>

                        {/* Category Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full ${colors.text} ${colors.bg} ${colors.glow}`}>
                                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                {category?.name || article.category}
                            </span>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mt-5 mb-5 leading-[1.1]">
                                {article.title}
                            </h1>
                            <p className="text-white/80 text-base sm:text-xl leading-relaxed mb-6">
                                {article.excerpt}
                            </p>
                        </motion.div>

                        {/* Desktop & Mobile Top Reader Toolbar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md"
                        >
                            <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm text-white/60">
                                <div className="flex items-center gap-2">
                                    <Clock size={15} className="text-sky-300" />
                                    <span>{article.readingTime} min read</span>
                                    <span className="text-white/30">·</span>
                                    <span className="text-xs text-sky-200/90 font-medium">~{minutesLeft} min left</span>
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-white/10" />
                                <time dateTime={article.publishedAt} className="hidden sm:block text-white/50 text-xs">
                                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </time>
                            </div>

                            {/* Reader Quick Buttons */}
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={cycleFontSize}
                                    title="Toggle Text Size (Normal / Large / XL)"
                                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
                                >
                                    <Type size={13} />
                                    <span className="uppercase text-[11px]">{fontSizeLevel}</span>
                                </button>

                                <button
                                    onClick={toggleBookmark}
                                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                                    className={`flex items-center justify-center h-8 w-8 rounded-lg border transition ${
                                        isBookmarked
                                            ? 'border-sky-300/40 bg-sky-400/20 text-sky-200'
                                            : 'border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/15 hover:text-white'
                                    }`}
                                >
                                    <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                                </button>

                                <button
                                    onClick={handleCopyLink}
                                    title="Copy Article Link"
                                    className="relative flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/15 hover:text-white"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    {copied && (
                                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold text-black shadow-md whitespace-nowrap z-50">
                                            Copied!
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={handleShare}
                                    title="Share Article"
                                    className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/15 hover:text-white"
                                >
                                    <Share2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </article>
            </div>

            {/* Main Content Layout with Sticky ToC Sidebar */}
            <article className="py-8 sm:py-12 px-4 sm:px-6 relative">
                <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_260px] items-start">

                    {/* Main Reading Column */}
                    <div className="min-w-0">
                        {/* Interactive Key Takeaways Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="mb-8 sm:mb-10 rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-400/[0.07] via-transparent to-transparent p-5 sm:p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-2 mb-3.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-300/20 text-sky-200">
                                    <Sparkles size={15} />
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                                    Key Takeaways & Core Concepts
                                </h3>
                            </div>
                            <ul className="grid gap-2.5">
                                {keyTakeaways.map((takeaway, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/85 leading-relaxed">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-sky-300" />
                                        <span>{takeaway}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Inline Mobile Section Outline (Expandable Directly On-Page) */}
                        {headings.length > 0 && (
                            <div className="lg:hidden mb-8 rounded-2xl border border-sky-300/30 bg-[#0c0e14] p-4 shadow-xl">
                                <button
                                    onClick={() => setShowInlineToc(!showInlineToc)}
                                    className="flex w-full items-center justify-between text-left cursor-pointer"
                                >
                                    <span className="flex items-center gap-2 text-sm font-bold text-white">
                                        <List size={16} className="text-sky-300 shrink-0" />
                                        Article Sections ({headings.length})
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200 border border-sky-300/30">
                                        {showInlineToc ? 'Hide Outline' : 'Show Outline'}
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${showInlineToc ? 'rotate-180' : ''}`} />
                                    </span>
                                </button>

                                {showInlineToc && (
                                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2 max-h-[60vh] overflow-y-auto">
                                        {headings.map((h, i) => {
                                            const isActive = activeSection === h.id;
                                            return (
                                                <button
                                                    key={h.id}
                                                    type="button"
                                                    onClick={() => scrollToHeading(h.id)}
                                                    className={`flex w-full items-start gap-3 text-left text-xs p-3 rounded-xl transition cursor-pointer ${
                                                        isActive
                                                            ? 'bg-sky-400/25 text-white font-bold border-l-4 border-sky-300 shadow-md'
                                                            : 'bg-white/[0.05] text-white/80 hover:bg-white/15 hover:text-white border border-white/10'
                                                    }`}
                                                >
                                                    <span className="font-mono text-sky-300 font-bold shrink-0">
                                                        {String(i + 1).padStart(2, '0')}.
                                                    </span>
                                                    <span className="leading-relaxed">{h.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Formatted Article Body */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`prose prose-invert prose-lg max-w-none ${fontSizeClasses}`}
                        >
                            <div
                                className="article-content"
                                dangerouslySetInnerHTML={{
                                    __html: formatContent(article.content, colors.hex),
                                }}
                            />
                        </motion.div>

                        {/* Verified Studio Author Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-14 sm:mt-16"
                        >
                            <GlassCard padding="lg" glow="cyan" className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ background: colors.hex }} />

                                <div className="flex flex-col items-center text-center sm:text-left sm:flex-row gap-6 relative sm:ml-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                                        <Image
                                            src="/branding/logo-tg.png"
                                            alt="VGP"
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-contain"
                                            style={{ filter: `drop-shadow(0 0 15px ${colors.hex}80)` }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-semibold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                                            Virzy Guns Production
                                            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-mono font-bold" style={{ background: `${colors.hex}20`, color: colors.hex }}>
                                                AUTHOR
                                            </span>
                                        </p>
                                        <p className="text-white/60 text-xs sm:text-sm mb-4">
                                            Music producer, songwriter, sound designer, and creative director behind VGP Studio & HealingWave Lab.
                                        </p>

                                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                            <Link
                                                href="/studio/beats"
                                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-[1.02]"
                                                style={{
                                                    background: colors.hex,
                                                    color: '#0a0a0a',
                                                    boxShadow: `0 0 20px ${colors.hex}40`,
                                                }}
                                            >
                                                Browse Beats
                                            </Link>
                                            <Link
                                                href="/about"
                                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition"
                                            >
                                                Founder Story
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Hearing Safety / Science Disclaimer */}
                        {hasMedicalOrHearingClaims && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-10 sm:mt-12 rounded-xl border border-sky-300/20 bg-sky-300/[0.035] p-5 sm:p-6 text-xs leading-relaxed text-white/70"
                            >
                                <strong className="mb-2 block font-bold uppercase tracking-wider text-sky-200">
                                    Educational & Hearing Safety Disclaimer
                                </strong>
                                The psychological, physiological, neurobiological, and acoustic safety concepts discussed in this article (such as dopamine responses, cognitive habituation, ear fatigue, acoustic reflexes, and sound pressure levels) are intended solely for educational, creative, and music production research. This content does not substitute for professional medical advice, clinical diagnosis, or treatment. Loud monitoring and prolonged exposure can cause permanent hearing damage, tinnitus, or auditory fatigue. Always practice safe monitoring levels (recommended below 80-85 dB SPL) and take regular ear breaks. If you experience hearing discomfort, persistent ringing, or severe mental fatigue, consult a licensed medical professional.
                            </motion.div>
                        )}

                        {/* Tags / Keywords */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-10 sm:mt-12 pt-8 border-t border-white/10"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="7" cy="7" r="1" fill="currentColor" />
                                </svg>
                                ARTICLE TOPICS
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {article.seo.keywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="text-xs px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-white/70 hover:border-sky-300/40 hover:text-sky-200 transition-all duration-200 cursor-default"
                                    >
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Sticky Table of Contents Sidebar */}
                    <aside className="hidden lg:block sticky top-28 space-y-6">
                        {headings.length > 0 && (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-4 flex items-center gap-2">
                                    <List size={14} className="text-sky-300" />
                                    Article Outline
                                </p>
                                <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                                    {headings.map((h, i) => {
                                        const isActive = activeSection === h.id;
                                        return (
                                            <button
                                                key={h.id}
                                                type="button"
                                                onClick={() => scrollToHeading(h.id)}
                                                className={`group flex items-start gap-2.5 w-full text-left text-xs py-2 px-3 rounded-lg transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-sky-400/20 text-white font-bold border-l-2 border-sky-300'
                                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                <span className={`font-mono shrink-0 ${isActive ? 'text-sky-300' : 'text-white/30'}`}>
                                                    {String(i + 1).padStart(2, '0')}.
                                                </span>
                                                <span className="line-clamp-2 leading-snug">{h.title}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Article Quick Actions Card */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-md space-y-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-1">
                                Reader Tools
                            </p>

                            <button
                                onClick={toggleBookmark}
                                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 transition cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Bookmark size={14} className={isBookmarked ? 'fill-current text-sky-300' : ''} />
                                    {isBookmarked ? 'Bookmarked' : 'Save for later'}
                                </span>
                                <span className="text-[10px] text-white/40">{isBookmarked ? 'Saved' : 'Save'}</span>
                            </button>

                            <button
                                onClick={handleCopyLink}
                                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-medium text-white/80 hover:bg-white/10 transition cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    Copy URL
                                </span>
                                <span className="text-[10px] text-white/40">{copied ? 'Done' : 'Copy'}</span>
                            </button>
                        </div>
                    </aside>
                </div>
            </article>

            {/* Related Articles */}
            {related.length > 0 && (
                <section className="py-14 sm:py-16 px-4 sm:px-6 bg-black/40 border-t border-white/10 relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px] opacity-20" style={{ background: colors.hex }} />

                    <div className="max-w-4xl mx-auto relative">
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-3">
                            <span className="w-1.5 h-6 sm:h-7 rounded-full" style={{ background: colors.hex }} />
                            Continue Reading
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            {related.map((rel) => {
                                const relColors = categoryColors[rel.category] || categoryColors['production-tips'];
                                return (
                                    <Link key={rel.slug} href={`/blog/${rel.slug}`}>
                                        <GlassCard padding="md" hover className="h-full group flex flex-col justify-between">
                                            <div>
                                                <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${relColors.text}`}>
                                                    {rel.category}
                                                </span>
                                                <h3 className="text-sm sm:text-base font-semibold mt-2 mb-2 leading-snug group-hover:text-white transition-colors">
                                                    {rel.title}
                                                </h3>
                                                <p className="text-white/60 text-xs leading-relaxed line-clamp-3 mb-4">
                                                    {rel.excerpt}
                                                </p>
                                            </div>
                                            <div className={`text-xs ${relColors.text} font-semibold flex items-center gap-1 mt-auto pt-2 border-t border-white/5`}>
                                                Read article
                                                <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </GlassCard>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Mobile Side Collapsible Reader Widget rendered via Portal */}
            {mounted && createPortal(
                <div className="lg:hidden fixed bottom-24 right-3 z-[9995] pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {!isReaderWidgetExpanded ? (
                            <motion.div
                                key="collapsed-widget"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-black/95 p-1.5 px-2.5 text-white shadow-[0_0_20px_rgba(0,229,255,0.25)] backdrop-blur-xl hover:border-sky-300 transition"
                            >
                                {/* 1-Tap Direct Section Jump Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setShowMobileBottomSheet(true)}
                                    className="flex items-center gap-1.5 hover:text-sky-300 transition cursor-pointer"
                                    title="Quick Section Jump"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-400/20 text-[10px] font-bold text-sky-200 border border-sky-300/30">
                                        {scrollPercent}%
                                    </div>
                                    <List size={14} className="text-sky-300" />
                                    <span className="text-[11px] font-semibold text-sky-200">Jump</span>
                                </button>

                                <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

                                {/* Expand Reader Tools */}
                                <button
                                    type="button"
                                    onClick={() => setIsReaderWidgetExpanded(true)}
                                    className="flex h-6 w-6 items-center justify-center rounded-full text-white/60 hover:text-white transition cursor-pointer"
                                    title="Expand Reader Toolbar"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-widget"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                className="flex items-center gap-2 rounded-full border border-sky-300/40 bg-[#090b10]/95 p-2 px-3 shadow-[0_0_25px_rgba(0,229,255,0.3)] backdrop-blur-2xl"
                            >
                                <span className="text-[10px] font-bold text-sky-200 bg-sky-400/20 px-2 py-1 rounded-full border border-sky-300/30">
                                    {scrollPercent}%
                                </span>

                                {headings.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowMobileBottomSheet(true)}
                                        className="flex items-center gap-1 rounded-full bg-sky-400/25 px-3 py-1.5 text-xs font-bold text-sky-200 border border-sky-300/40 active:scale-95 transition cursor-pointer"
                                    >
                                        <List size={13} />
                                        Outline
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={toggleBookmark}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer ${
                                        isBookmarked ? 'bg-sky-400/20 text-sky-200' : 'bg-white/10 text-white/70'
                                    }`}
                                >
                                    <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleShare}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 cursor-pointer"
                                >
                                    <Share2 size={14} />
                                </button>

                                {showScrollTop && (
                                    <button
                                        type="button"
                                        onClick={scrollToTop}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black font-bold cursor-pointer"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setIsReaderWidgetExpanded(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white cursor-pointer ml-1"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>,
                document.body
            )}

            {/* Mobile High-z-index Bottom Sheet Modal rendered via Portal */}
            {mounted && showMobileBottomSheet && createPortal(
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileBottomSheet(false)}
                        className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md lg:hidden pointer-events-auto"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[82vh] rounded-t-3xl border-t border-sky-300/30 bg-[#0c0d12] p-6 shadow-2xl lg:hidden flex flex-col pointer-events-auto"
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <List size={18} className="text-sky-300" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    Article Outline ({headings.length} Sections)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMobileBottomSheet(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
                            {headings.map((h, i) => {
                                const isActive = activeSection === h.id;
                                return (
                                    <button
                                        key={h.id}
                                        type="button"
                                        onClick={() => scrollToHeading(h.id)}
                                        className={`flex w-full items-start gap-3 text-left text-sm p-3.5 rounded-xl transition cursor-pointer ${
                                            isActive
                                                ? 'bg-sky-400/30 text-white font-bold border-l-4 border-sky-300 shadow-md'
                                                : 'bg-white/[0.06] text-white/90 hover:bg-white/15 active:scale-98 border border-white/10'
                                        }`}
                                    >
                                        <span className="font-mono text-sky-300 font-bold shrink-0">
                                            {String(i + 1).padStart(2, '0')}.
                                        </span>
                                        <span className="leading-relaxed">{h.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}

            {/* Masterclass Share Modal */}
            <MasterclassShareModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                article={{
                    title: article.title,
                    excerpt: article.excerpt,
                    slug: article.slug,
                }}
                categoryName={category?.name}
                readingTime={`${article.readingTime || 4} min read`}
                logoSrc="/branding/logo-tg.png"
                siteUrl="https://www.virzyguns.com"
            />
        </PageTransition>
    );
}

// Markdown-like content formatter with section IDs for ToC jump anchors & MathJax cards
function formatContent(content: string, accentColor: string): string {
    let sectionCount = 0;

    // Helper to repair JS string escape sequence corruptions & restore stripped TeX commands
    const sanitizeLatex = (str: string) => {
        return str
            .replace(/\x0crac/g, '\\frac')
            .replace(/\\rac\b/g, '\\frac')
            .replace(/\x09ext/g, '\\text')
            .replace(/\\ext\b/g, '\\text')
            .replace(/\x09imes/g, '\\times')
            .replace(/\\imes\b/g, '\\times')
            .replace(/\x09au/g, '\\tau')
            .replace(/\\au\b/g, '\\tau')
            .replace(/\x09heta/g, '\\theta')
            .replace(/\\heta\b/g, '\\theta')
            .replace(/\x08egin/g, '\\begin')
            .replace(/\\egin\b/g, '\\begin')
            .replace(/\x08eta/g, '\\beta')
            .replace(/\\eta\b/g, '\\beta')
            .replace(/\x0dight/g, '\\right')
            .replace(/\\ight\b/g, '\\right')
            .replace(/\x0dho/g, '\\rho')
            .replace(/\\ho\b/g, '\\rho')
            .replace(/\\u003c/g, '<')
            .replace(/\\u003e/g, '>')
            // Restore stripped backslashes for standard TeX keywords
            .replace(/(^|[^a-zA-Z\\])(Delta|delta|sum|cdot|lambda|pi|alpha|sigma|omega|phi|left|right|log|sin|sqrt|le|ge)\b/g, '$1\\$2');
    };

    // 0. Pre-process Code Fences (```text ... ```) into KaTeX Display Math
    let formatted = content.replace(/```(?:text|math)?\s*([\s\S]*?)\s*```/g, (_, codeContent) => {
        const rawMath = sanitizeLatex(codeContent.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto rounded-2xl border border-sky-300/30 bg-gradient-to-r from-sky-400/[0.08] via-sky-300/[0.03] to-transparent p-5 sm:p-6 text-center shadow-lg backdrop-blur-md">
                    <div class="inline-block text-sky-100 text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-sky-200 font-mono">${rawMath}</div>`;
        }
    });

    // 0b. Pre-process backticked math formulas (`f_n = ...`) into KaTeX Display Math
    formatted = formatted.replace(/`([^`\n]*?=[^`\n]*?)`/g, (_, mathContent) => {
        const rawMath = sanitizeLatex(
            mathContent.trim()
                .replace(/\\times/g, '\\times ')
                .replace(/×/g, '\\times ')
                .replace(/·/g, '\\cdot ')
                .replace(/Σ/g, '\\sum_{n=0}^{N-1} ')
                .replace(/λ/g, '\\lambda ')
                .replace(/π/g, '\\pi ')
                .replace(/°/g, '^\\circ')
                .replace(/≤/g, '\\le ')
                .replace(/≥/g, '\\ge ')
        );

        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto rounded-2xl border border-sky-300/30 bg-gradient-to-r from-sky-400/[0.08] via-sky-300/[0.03] to-transparent p-5 sm:p-6 text-center shadow-lg backdrop-blur-md">
                    <div class="inline-block text-sky-100 text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-sky-200 font-mono">${rawMath}</div>`;
        }
    });

    // 1. Process Display Math Formulas ($$...$$) using KaTeX
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (_, mathContent) => {
        const rawMath = sanitizeLatex(mathContent.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: true,
                throwOnError: false,
            });
            return `
                <div class="my-8 overflow-x-auto rounded-2xl border border-sky-300/30 bg-gradient-to-r from-sky-400/[0.08] via-sky-300/[0.03] to-transparent p-5 sm:p-6 text-center shadow-lg backdrop-blur-md">
                    <div class="inline-block text-sky-100 text-base sm:text-xl leading-relaxed">
                        ${renderedHtml}
                    </div>
                </div>
            `;
        } catch {
            return `<div class="my-8 text-center text-sky-200 font-mono">${rawMath}</div>`;
        }
    });

    // 2. Process Inline Math Variables ($...$) using KaTeX
    formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (_, inlineMath) => {
        const rawMath = sanitizeLatex(inlineMath.trim());
        try {
            const renderedHtml = katex.renderToString(rawMath, {
                displayMode: false,
                throwOnError: false,
            });
            return `<span class="inline-block mx-1 text-sky-200 font-semibold">${renderedHtml}</span>`;
        } catch {
            return `<span class="inline-block mx-1 font-mono text-sky-200">${rawMath}</span>`;
        }
    });

    // 3. Process Markdown Tables
    formatted = formatted.replace(/((?:^\s*\|.*\|\s*\r?\n)+)/gm, (match) => {
        const rows = match.trim().split(/\r?\n/).map(r => r.trim());
        if (rows.length < 2) return match;

        const headerCells = rows[0].split('|').map(c => c.trim()).filter(c => c !== '');
        if (!rows[1].includes('---')) return match;

        const bodyRows = rows.slice(2).map(row => {
            return row.split('|').map(c => c.trim()).filter(c => c !== '');
        });

        const headerHtml = `
            <thead>
                <tr class="bg-gradient-to-r from-sky-500/20 via-sky-400/10 to-transparent border-b border-sky-300/30">
                    ${headerCells.map(h => `<th class="py-3.5 px-4 text-left text-[11px] sm:text-xs font-bold tracking-wider text-sky-200 uppercase whitespace-nowrap">${h}</th>`).join('')}
                </tr>
            </thead>
        `;

        const bodyHtml = `
            <tbody class="divide-y divide-white/5">
                ${bodyRows.map((cells, rIdx) => `
                    <tr class="${rIdx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'} hover:bg-sky-400/[0.06] transition-colors">
                        ${cells.map((c, i) => `<td class="py-3.5 px-4 text-xs sm:text-sm ${i === 0 ? 'text-white font-semibold' : 'text-white/80'}">${c}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;

        return `
            <div class="my-8 overflow-hidden rounded-2xl border border-sky-300/30 bg-[#07090e] shadow-xl backdrop-blur-md">
                <div class="flex items-center justify-between px-4 py-2.5 bg-sky-950/40 border-b border-sky-300/20 text-[11px] font-mono text-sky-300">
                    <span class="flex items-center gap-2 font-bold uppercase tracking-wider">
                        <span class="w-2 h-2 rounded-full bg-sky-300 animate-pulse"></span>
                        Audio Specification Matrix
                    </span>
                    <span class="text-[10px] text-sky-400/70 font-mono">SCROLL HORIZONTALLY →</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[520px]">
                        ${headerHtml}
                        ${bodyHtml}
                    </table>
                </div>
            </div>
        `;
    });

    // 2. Format H2 Headings with ID anchors for Table of Contents
    formatted = formatted.replace(/^## (.*$)/gm, (_, titleText) => {
        const id = `section-${sectionCount++}`;
        const cleanTitle = titleText.replace(/\*\*/g, '').trim();
        return `
            <div id="${id}" class="scroll-mt-28 relative mt-12 sm:mt-16 mb-6 pt-4">
                <div class="absolute left-0 top-4 bottom-0 w-1 rounded-full" style="background: linear-gradient(180deg, ${accentColor}, transparent)"></div>
                <h2 class="text-xl sm:text-3xl font-bold text-white pl-3.5 sm:pl-4 tracking-tight leading-snug">${cleanTitle}</h2>
            </div>
        `;
    });

    // 3. Format H3 Headings
    formatted = formatted.replace(/^### (.*$)/gm, `
        <h3 class="text-base sm:text-xl font-semibold text-white/95 mt-8 sm:mt-10 mb-3 flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full shrink-0" style="background: ${accentColor}"></span>
            $1
        </h3>
    `);

    // 4. Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, `<strong class="text-white font-semibold">$1</strong>`);

    // 5. Bullet Lists
    formatted = formatted.replace(/^- (.*$)/gm, `
        <div class="flex items-start gap-2.5 sm:gap-3 mb-3 pl-1 sm:pl-2">
            <span class="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style="background: ${accentColor}"></span>
            <span class="text-white/80 leading-relaxed text-sm sm:text-base">$1</span>
        </div>
    `);

    // 6. Styled Tip & Callout Blocks
    formatted = formatted.replace(/\*\*(Quick Guide|Tip|Note|Important|Rule|Takeaway):\*\*/g, `
        <div class="my-6 sm:my-8 p-4 sm:p-6 rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent" style="border-left: 4px solid ${accentColor}">
            <p class="text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1.5" style="color: ${accentColor}">$1</p>
    `);

    // 7. Numbered Lists
    formatted = formatted.replace(/^(\d+)\. (.*$)/gm, `
        <div class="flex items-start gap-3 sm:gap-4 mb-3.5">
            <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0" style="background: ${accentColor}20; color: ${accentColor}">$1</span>
            <span class="text-white/80 pt-0.5 leading-relaxed text-sm sm:text-base">$2</span>
        </div>
    `);

    return formatted;
}
