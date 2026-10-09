'use client';

/**
 * The interactive edges of the article page: save, copy and share actions,
 * the reading progress bar, the side outline's current section and the
 * Contents button on phones. The article text and the outline links are
 * rendered on the server; these only follow the reader, through one shared
 * scroll listener (reading-scroll.ts) and without re-rendering on scroll.
 */

import { startTransition, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Bookmark, Check, Copy, Share2 } from 'lucide-react';
import { copyToClipboard } from './clipboard';
import { OutlineList, type OutlineItem } from './OutlineList';
import { closeWhenFocusLeaves } from './popover-focus';
import { currentSection, readNow, subscribeReading } from './reading-scroll';
import { markRead } from './reading-state';

// The share dialog (with the QR code; html-to-image loads on the first download) is its
// own chunk, rendered only while open. It is fetched once the page has loaded and the
// browser is idle, so a tap on a slow phone connection finds it here; reaching for Share
// earlier (hover, focus or touch) fetches it at once. A plain import() rather than
// next/dynamic: dynamic() suspends on first render and React holds a revealed Suspense
// boundary back about 300 ms, which made the dialog lag the tap even when the chunk was
// already here.
type ShareDialogComponent = typeof import('@/components/blog/MasterclassShareModal').MasterclassShareModal;
let shareDialog: Promise<ShareDialogComponent> | null = null;
const loadShareDialog = () =>
    (shareDialog ??= import('@/components/blog/MasterclassShareModal').then((m) => m.MasterclassShareModal).catch((error) => {
        shareDialog = null; // let the next tap try again
        throw error;
    }));

/** Runs `fn` once the page has loaded and the browser is idle. Returns a cancel function. */
function afterLoadWhenIdle(fn: () => void): () => void {
    let cancel = () => {};
    const start = () => {
        if (typeof window.requestIdleCallback === 'function') {
            const id = window.requestIdleCallback(() => fn(), { timeout: 4000 });
            cancel = () => window.cancelIdleCallback(id);
        } else {
            const id = window.setTimeout(fn, 1500);
            cancel = () => window.clearTimeout(id);
        }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
        window.removeEventListener('load', start);
        cancel();
    };
}

const actionClass =
    'vgp-focus inline-flex min-h-11 items-center gap-2 rounded-[4px] px-1 text-sm font-medium text-white/70 transition-colors hover:text-white';

export function ArticleActions({
    slug,
    title,
    excerpt,
    categoryName,
    readingTime,
    accent,
}: {
    slug: string;
    title: string;
    excerpt: string;
    categoryName?: string;
    readingTime: number;
    accent?: string;
}) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [ShareDialog, setShareDialog] = useState<ShareDialogComponent | null>(null);
    const shareButton = useRef<HTMLButtonElement>(null);

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
        copyToClipboard(window.location.href)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {});
    };

    const prefetchShare = () => {
        if (ShareDialog) return;
        loadShareDialog()
            .then((component) => setShareDialog(() => component))
            .catch(() => {});
    };

    useEffect(
        () =>
            afterLoadWhenIdle(() => {
                loadShareDialog()
                    .then((component) => setShareDialog(() => component))
                    .catch(() => {});
            }),
        [],
    );

    const openShare = () => {
        if (ShareDialog) {
            // Built as a transition, so the tap is answered at once and the dialog follows
            // a frame later instead of holding the tap until it has been laid out.
            startTransition(() => setSharing(true));
            return;
        }
        setSharing(true);
        loadShareDialog()
            .then((component) => setShareDialog(() => component))
            // Offline or the chunk failed: give the button back rather than leave it waiting.
            .catch(() => setSharing(false));
    };
    // Share was pressed before the dialog's code arrived: say so until it opens.
    const opening = sharing && !ShareDialog;

    // The dialog hands focus back to Share as it closes; this covers a browser that does not.
    const closeShare = useCallback(() => {
        setSharing(false);
        requestAnimationFrame(() => {
            if (document.activeElement === document.body) shareButton.current?.focus();
        });
    }, []);

    return (
        <>
            {/* Reading tools for the screen: they need JavaScript and mean nothing on paper. */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 print:hidden [@media(scripting:none)]:hidden">
                <button type="button" onClick={toggleBookmark} aria-pressed={isBookmarked} className={actionClass}>
                    <Bookmark size={16} className={isBookmarked ? 'fill-current text-white' : ''} aria-hidden="true" />
                    {isBookmarked ? 'Saved' : 'Save'}
                </button>
                <button type="button" onClick={handleCopyLink} className={actionClass}>
                    {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                    <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
                </button>
                <button
                    ref={shareButton}
                    type="button"
                    aria-haspopup="dialog"
                    onPointerEnter={prefetchShare}
                    onPointerDown={prefetchShare}
                    onFocus={prefetchShare}
                    onClick={openShare}
                    aria-busy={opening || undefined}
                    className={actionClass}
                >
                    <Share2 size={16} aria-hidden="true" />
                    {opening ? 'Opening…' : 'Share'}
                </button>
            </div>
            {sharing && ShareDialog ? (
                <ShareDialog
                    onClose={closeShare}
                    article={{ title, excerpt, slug }}
                    categoryName={categoryName}
                    readingTime={`${readingTime || 4} min read`}
                    accent={accent}
                    siteUrl="https://www.virzyguns.com"
                />
            ) : null}
        </>
    );
}

/** Mark the outline link for `id` as the current section, and only that one. */
function markCurrent(root: Element | null, id: string) {
    root?.querySelectorAll('a[href^="#"]').forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}

/**
 * The reading progress bar along the top of the screen, and the "read" mark
 * once the reader reaches the end of the text. `sectionIds` are the section
 * anchors in page order, so an old "#section-3" link still lands on the
 * fourth section. `accent` is the lesson group's accent, so the bar matches
 * the figures.
 */
export function ReadingProgress({ slug, accent, sectionIds }: { slug: string; accent: string; sectionIds: string[] }) {
    const bar = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const follow = () => {
            const legacy = /^#section-(\d+)$/.exec(window.location.hash);
            const target = legacy ? document.getElementById(sectionIds[Number(legacy[1])] ?? '') : null;
            if (target) {
                history.replaceState(history.state, '', `#${target.id}`);
                target.scrollIntoView();
            }
        };
        follow();
        window.addEventListener('hashchange', follow);
        return () => window.removeEventListener('hashchange', follow);
    }, [sectionIds]);

    useEffect(() => {
        let marked = false;
        return subscribeReading((frame) => {
            const progress = frame.max > 0 ? Math.min(1, Math.max(0, frame.y / frame.max)) : 0;
            if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
            if (!marked) {
                const end = frame.top('article-end');
                if (end !== undefined && end < frame.y + frame.vh) {
                    marked = true;
                    markRead(slug);
                }
            }
        });
    }, [slug]);

    return (
        <div
            ref={bar}
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 origin-left"
            style={{ background: accent, transform: 'scaleX(0)' }}
        />
    );
}

/**
 * Wraps the side outline (server-rendered links) on wide screens and marks
 * the section being read. Below lg the outline is not shown, and this does
 * no work at all.
 */
export function OutlineTracker({ ids, children }: { ids: string[]; children: ReactNode }) {
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wide = window.matchMedia('(min-width: 1024px)');
        let stop: (() => void) | null = null;
        let active = '';
        let shown = '';
        const start = () => {
            stop?.();
            stop = null;
            if (!wide.matches) return;
            const percent = box.current?.querySelector<HTMLElement>('[data-percent]');
            stop = subscribeReading((frame) => {
                const next = currentSection(frame, ids) || ids[0] || '';
                if (next !== active) {
                    active = next;
                    markCurrent(box.current, next);
                }
                const text = `${Math.round(frame.max > 0 ? Math.min(100, Math.max(0, (frame.y / frame.max) * 100)) : 0)}% read`;
                if (percent && text !== shown) {
                    shown = text;
                    percent.textContent = text;
                }
            });
        };
        start();
        wide.addEventListener('change', start);
        return () => {
            wide.removeEventListener('change', start);
            stop?.();
        };
    }, [ids]);

    return <div ref={box}>{children}</div>;
}

/**
 * Phones have no outline beside the text, so once the reader is past the
 * inline "In this article" list a small Contents button stays in reach,
 * above the bottom navigation. It opens the section list as a popover with
 * focus on the section being read, and closes again when focus leaves it.
 * It shows when the reader scrolls up and steps aside again after two
 * seconds without scrolling, so it never sits over the text for long. It
 * sits right after the inline list in the tab order, and shows whenever it
 * has keyboard focus.
 */
export function MobileContents({ headings }: { headings: OutlineItem[] }) {
    const button = useRef<HTMLButtonElement>(null);
    const sheet = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const btn = button.current;
        const pop = sheet.current;
        if (!btn || !pop) return;
        const ids = headings.map((h) => h.id);
        const narrow = window.matchMedia('(max-width: 1023.98px)');
        let stop: (() => void) | null = null;
        let idle = 0;
        let lastY = window.scrollY;
        let available = false;
        let shown = false;

        const paint = () => btn.toggleAttribute('data-visible', available && shown);
        const hideSoon = () => {
            window.clearTimeout(idle);
            idle = window.setTimeout(() => {
                if (btn.matches(':hover')) return hideSoon();
                shown = false;
                paint();
            }, 2000);
        };
        const start = () => {
            stop?.();
            stop = null;
            if (!narrow.matches) return;
            lastY = window.scrollY;
            stop = subscribeReading((frame) => {
                const pastList = frame.bottom('article-outline-inline');
                const end = frame.top('article-end');
                available = (pastList !== undefined ? pastList < frame.y : frame.y > 600) && (end === undefined || end - frame.y > frame.vh * 0.6);
                if (Math.abs(frame.y - lastY) > 8) {
                    shown = frame.y < lastY;
                    lastY = frame.y;
                    if (shown) hideSoon();
                }
                paint();
            });
        };

        const onToggle = (event: Event) => {
            const open = (event as Event & { newState?: string }).newState === 'open';
            btn.setAttribute('aria-expanded', String(open));
            if (!open) return;
            const current = currentSection(readNow(), ids) || ids[0];
            markCurrent(pop, current);
            pop.querySelector<HTMLElement>('a[aria-current]')?.focus();
        };

        start();
        narrow.addEventListener('change', start);
        pop.addEventListener('toggle', onToggle);
        // Tab past the last section closes the sheet, so focus never moves on underneath it.
        const stopFocus = closeWhenFocusLeaves(pop);
        return () => {
            narrow.removeEventListener('change', start);
            pop.removeEventListener('toggle', onToggle);
            stopFocus();
            window.clearTimeout(idle);
            stop?.();
        };
    }, [headings]);

    if (headings.length < 2) return null;

    // React 19 renders popover attributes; the React 18 typings in this repo do not list them.
    const popover = { popover: 'auto' } as Record<string, string>;
    const opens = { popoverTarget: 'article-contents' } as Record<string, string>;
    const closes = { popoverTarget: 'article-contents', popoverTargetAction: 'hide' } as Record<string, string>;

    return (
        <div className="lg:hidden">
            <button
                ref={button}
                type="button"
                {...opens}
                aria-haspopup="dialog"
                aria-expanded="false"
                className="vgp-contents-button vgp-focus fixed right-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-white/15 bg-[var(--surface-strong)] px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
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
                {...popover}
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
                        {...closes}
                        className="vgp-focus -mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] text-sm text-white/70 hover:text-white"
                    >
                        Close
                    </button>
                </div>
                <OutlineList headings={headings} touch />
            </div>
        </div>
    );
}

/**
 * In-page jumps on a lesson. The page itself never scrolls smoothly, so a
 * deep link, a shared #section or a reload lands at once; a Contents or
 * outline link the reader clicks glides there instead (not with reduced
 * motion), then lands with a real fragment jump, which has nowhere left to
 * move but sets the address, :target and where Tab goes next. Collapsed
 * lists open when the reader needs what is inside them: the Sources list
 * when the address or a link points at #sources, and every collapsed list
 * while the page prints (closed again afterwards).
 */
export function LessonAnchors() {
    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        const idFrom = (hash: string | null) => {
            if (!hash || hash.length < 2 || !hash.startsWith('#')) return '';
            try {
                return decodeURIComponent(hash.slice(1));
            } catch {
                return hash.slice(1);
            }
        };
        const openFor = (id: string) => {
            const next = id ? document.getElementById(id)?.nextElementSibling : null;
            if (next instanceof HTMLDetailsElement) next.open = true;
        };
        const onHash = () => openFor(idFrom(window.location.hash));

        let cancelGlide: (() => void) | null = null;
        const glide = (id: string, target: HTMLElement) => {
            cancelGlide?.();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // A wheel, touch or key during the glide hands the page back to the reader:
            // then the address changes without the jump, which would pull them back.
            let interrupted = false;
            const stop = () => {
                interrupted = true;
            };
            const kinds = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
            kinds.forEach((kind) => window.addEventListener(kind, stop, { passive: true, capture: true }));
            let last = Number.NaN;
            let still = 0;
            let frames = 0;
            let frame = 0;
            const finish = () => {
                cancelAnimationFrame(frame);
                kinds.forEach((kind) => window.removeEventListener(kind, stop, { capture: true }));
                cancelGlide = null;
            };
            const tick = () => {
                const y = window.scrollY;
                still = y === last ? still + 1 : 0;
                last = y;
                if (still < 6 && ++frames < 240) {
                    frame = requestAnimationFrame(tick);
                    return;
                }
                finish();
                if (!interrupted) window.location.hash = id;
                else history.pushState(history.state, '', `#${encodeURIComponent(id)}`);
            };
            frame = requestAnimationFrame(tick);
            cancelGlide = finish;
        };

        // Capture, so this runs before the Contents sheet closes itself on the same click.
        const onClick = (event: MouseEvent) => {
            const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('main a[href^="#"]') : null;
            if (!link) return;
            const id = idFrom(link.getAttribute('href'));
            openFor(id);
            const target = id ? document.getElementById(id) : null;
            if (!target || reduce.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            glide(id, target);
        };

        let printed: HTMLDetailsElement[] = [];
        const beforePrint = () => {
            // The inline contents list is left out of print, so it stays as it is on screen.
            printed = Array.from(document.querySelectorAll<HTMLDetailsElement>('main details:not([open]):not(#article-outline-inline)'));
            printed.forEach((details) => {
                details.open = true;
            });
        };
        const afterPrint = () => {
            printed.forEach((details) => {
                details.open = false;
            });
            printed = [];
        };

        onHash();
        window.addEventListener('hashchange', onHash);
        document.addEventListener('click', onClick, true);
        window.addEventListener('beforeprint', beforePrint);
        window.addEventListener('afterprint', afterPrint);
        return () => {
            cancelGlide?.();
            window.removeEventListener('hashchange', onHash);
            document.removeEventListener('click', onClick, true);
            window.removeEventListener('beforeprint', beforePrint);
            window.removeEventListener('afterprint', afterPrint);
        };
    }, []);

    return null;
}
