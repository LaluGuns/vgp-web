'use client';

/**
 * The interactive edges of the article page: save, copy and share
 * actions, the reading progress bar and the outline that follows the
 * reader. The article text itself is rendered on the server.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, Check, Copy, Share2 } from 'lucide-react';
import { MasterclassShareModal } from '@/components/blog/MasterclassShareModal';
import { markRead } from './reading-state';

const actionClass =
    'inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-sm font-medium text-white/70 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60';

export function ArticleActions({
    slug,
    title,
    excerpt,
    categoryName,
    readingTime,
}: {
    slug: string;
    title: string;
    excerpt: string;
    categoryName?: string;
    readingTime: number;
}) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            requestAnimationFrame(() => {
                if (!cancelled) setIsBookmarked(saved.includes(slug));
            });
        } catch {
            // Saving is optional when browser storage is unavailable.
        }
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const toggleBookmark = () => {
        try {
            const saved: string[] = JSON.parse(localStorage.getItem('vgp_bookmarked_articles') || '[]');
            const updated = saved.includes(slug) ? saved.filter((s) => s !== slug) : [...saved, slug];
            localStorage.setItem('vgp_bookmarked_articles', JSON.stringify(updated));
            setIsBookmarked(!isBookmarked);
        } catch {
            // Saving is optional when browser storage is unavailable.
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard
            ?.writeText(window.location.href)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {});
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <button type="button" onClick={toggleBookmark} aria-pressed={isBookmarked} className={actionClass}>
                    <Bookmark size={16} className={isBookmarked ? 'fill-current text-white' : ''} aria-hidden="true" />
                    {isBookmarked ? 'Saved' : 'Save'}
                </button>
                <button type="button" onClick={handleCopyLink} className={actionClass}>
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
                </button>
                <button type="button" onClick={() => setShowShareModal(true)} className={actionClass}>
                    <Share2 size={16} aria-hidden="true" />
                    Share
                </button>
            </div>
            <MasterclassShareModal
                open={showShareModal}
                onClose={() => setShowShareModal(false)}
                article={{ title, excerpt, slug }}
                categoryName={categoryName}
                readingTime={`${readingTime || 4} min read`}
                logoSrc="/branding/logo-tg.png"
                siteUrl="https://www.virzyguns.com"
            />
        </>
    );
}

interface OutlineItem {
    id: string;
    title: string;
}

/**
 * Progress bar, active section and "read" marking. Renders the desktop outline.
 * `accent` is the lesson group's accent, so the bar matches the figures; the bar
 * is portalled to <body>, outside the article that scopes `--accent`.
 */
export function ArticleOutline({ slug, headings, accent = 'var(--accent)' }: { slug: string; headings: OutlineItem[]; accent?: string }) {
    const [mounted, setMounted] = useState(false);
    const [percent, setPercent] = useState(0);
    const [active, setActive] = useState(headings[0]?.id ?? '');

    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        let marked = false;
        let ticking = false;
        const update = () => {
            ticking = false;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const next = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
            setPercent(next);
            let current = headings[0]?.id ?? '';
            for (const heading of headings) {
                const el = document.getElementById(heading.id);
                if (el && el.getBoundingClientRect().top <= 140) current = heading.id;
            }
            setActive(current);
            // Reaching the sources or the quiz counts as having read it.
            const end = document.getElementById('article-end');
            if (!marked && end && end.getBoundingClientRect().top < window.innerHeight) {
                marked = true;
                markRead(slug);
            }
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [headings, slug]);

    return (
        <>
            {mounted
                ? createPortal(
                      <div
                          aria-hidden="true"
                          className="pointer-events-none fixed left-0 top-0 z-[9999] h-0.5"
                          style={{ width: `${percent}%`, background: accent }}
                      />,
                      document.body,
                  )
                : null}
            <nav aria-label="In this article">
                <p className="mb-3 text-sm font-medium text-white">In this article</p>
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                    <OutlineList headings={headings} active={active} />
                </div>
            </nav>
            <p className="mt-8 text-xs text-white/50">{Math.round(percent)}% read</p>
        </>
    );
}

/** Section links. `touch` gives each link a 44 px row, for phones. */
export function OutlineList({ headings, active, touch = false }: { headings: OutlineItem[]; active?: string; touch?: boolean }) {
    return (
        <ol className={touch ? '' : 'space-y-1'}>
            {headings.map((h, i) => {
                const isActive = active === h.id;
                return (
                    <li key={h.id}>
                        <a
                            href={`#${h.id}`}
                            aria-current={isActive ? 'location' : undefined}
                            className={`flex gap-3 border-l pl-3 text-sm leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                                touch ? 'min-h-11 items-center py-2.5' : 'py-1.5'
                            } ${isActive ? 'border-white text-white' : 'border-white/10 text-white/60 hover:text-white'}`}
                        >
                            <span className="w-5 shrink-0 tabular-nums text-white/50" aria-hidden="true">
                                {i + 1}.
                            </span>
                            <span>{h.title}</span>
                        </a>
                    </li>
                );
            })}
        </ol>
    );
}

/**
 * Phones have no outline beside the text, so once the reader is past the
 * inline "In this article" list a small Contents button stays in reach,
 * above the bottom navigation. It opens the section list as a sheet.
 */
export function MobileContents({ headings }: { headings: OutlineItem[] }) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [active, setActive] = useState('');
    const sheet = useRef<HTMLDivElement>(null);

    // Portalled to <body>: the page transition wrapper is transformed, which would pin a
    // fixed child to the article instead of the screen.
    useEffect(() => {
        const frame = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            const start = document.getElementById('article-outline-inline');
            const end = document.getElementById('article-end');
            const pastStart = start ? start.getBoundingClientRect().bottom < 0 : window.scrollY > 600;
            const beforeEnd = end ? end.getBoundingClientRect().top > window.innerHeight * 0.6 : true;
            setVisible(pastStart && beforeEnd);
            let current = '';
            for (const heading of headings) {
                const el = document.getElementById(heading.id);
                if (el && el.getBoundingClientRect().top <= 140) current = heading.id;
            }
            setActive(current);
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [headings]);

    if (headings.length < 2 || !mounted) return null;

    return createPortal(
        <div className="lg:hidden">
            <button
                type="button"
                onClick={() => sheet.current?.togglePopover()}
                aria-haspopup="dialog"
                tabIndex={visible ? undefined : -1}
                aria-hidden={visible ? undefined : true}
                data-visible={visible ? '' : undefined}
                className={`vgp-contents-button fixed right-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 bg-[var(--surface-strong)] px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-[opacity,transform] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                }`}
            >
                <span aria-hidden="true" className="flex flex-col gap-[3px]">
                    <span className="block h-px w-3.5 bg-current" />
                    <span className="block h-px w-3.5 bg-current" />
                    <span className="block h-px w-2.5 bg-current" />
                </span>
                Contents
            </button>
            <div
                ref={sheet}
                id="article-contents"
                {...({ popover: 'auto' } as Record<string, string>)}
                role="dialog"
                aria-label="In this article"
                className="vgp-contents-pop"
                onClick={(event) => {
                    if ((event.target as HTMLElement).closest('a')) sheet.current?.hidePopover();
                }}
            >
                <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-white">In this article</p>
                    <button
                        type="button"
                        onClick={() => sheet.current?.hidePopover()}
                        className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm text-white/70 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        Close
                    </button>
                </div>
                <OutlineList headings={headings} active={active} touch />
            </div>
        </div>,
        document.body,
    );
}
