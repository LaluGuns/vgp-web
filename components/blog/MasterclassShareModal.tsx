'use client';

/**
 * "Share this lesson": a share card to download (landscape or portrait, with
 * a QR code to the lesson), links to post it, and the link to copy.
 *
 * A native <dialog> opened with showModal(): the browser keeps focus inside,
 * makes the page behind it inert, closes it on Escape and hands focus back
 * to the Share button. ArticleActions loads this file on its own, once the
 * page is idle or when the reader reaches for Share, so html-to-image and the
 * QR code stay out of the lesson bundle; html-to-image itself loads on the
 * first download.
 */

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Download, Mail, Share2 } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { copyToClipboard } from '@/components/blog/article/clipboard';

type Format = 'landscape' | 'portrait';

const SIZE: Record<Format, { width: number; height: number }> = {
    landscape: { width: 1200, height: 630 },
    portrait: { width: 1080, height: 1440 },
};

// The card is drawn with the system stack only, so the exported PNG needs no
// embedded web fonts and matches the page.
const CARD_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export type MasterclassShareArticle = {
    title: string;
    excerpt?: string | null;
    slug: string;
};

export type MasterclassShareModalProps = {
    onClose: () => void;
    article: MasterclassShareArticle;
    categoryName?: string | null;
    readingTime?: string;
    /** The lesson group's accent, for the one coloured mark on the card. */
    accent?: string;
    siteUrl?: string;
};

function lessonUrl(siteUrl: string, slug: string) {
    return `${siteUrl.replace(/\/+$/, '')}/blog/${slug.replace(/^\/+/, '')}`;
}

function filename(slug: string, format: Format) {
    const safe = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'lesson';
    return `virzy-guns-${safe}-${format}.png`;
}

/** Cut at a word boundary with an ellipsis; the PNG export does not draw line-clamp's own. */
function shorten(text: string, max: number) {
    const clean = text.trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max).replace(/\s+\S*$/, '').replace(/[,;:.]$/, '')}…`;
}

/**
 * The chrome logo (public/branding/vgp-logo-chrome-full.png, 1254 px square,
 * the mark above the wordmark), through the image optimizer so the dialog
 * does not fetch the 1.4 MB original. `crop` is the mark's box in the
 * original's pixels; the rest of the square is cut away by the frame.
 */
const CHROME_LOGO = {
    src: `/_next/image?url=${encodeURIComponent('/branding/vgp-logo-chrome-full.png')}&w=384&q=75`,
    size: 1254,
    crop: { x: 340, y: 340, width: 730, height: 360 },
};

// The logo's own glow is a shade lighter than the card; faded out at the edges of the
// crop it reads as the glow, not as a box.
const MARK_FADE = 'radial-gradient(ellipse 60% 62% at 50% 50%, #000 70%, transparent 100%)';

/**
 * The mark in its own chrome. Its dark ground is blended away (lighten) and
 * faded at the crop's edges, so only the metal and its glow show on the
 * card, in the preview and in the PNG.
 */
function ChromeMark({ height }: { height: number }) {
    const k = height / CHROME_LOGO.crop.height;
    return (
        <div
            style={{
                position: 'relative',
                width: Math.round(CHROME_LOGO.crop.width * k),
                height,
                overflow: 'hidden',
                flexShrink: 0,
                maskImage: MARK_FADE,
                WebkitMaskImage: MARK_FADE,
            }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element -- exported to PNG by html-to-image */}
            <img
                src={CHROME_LOGO.src}
                alt=""
                draggable={false}
                style={{
                    position: 'absolute',
                    left: -CHROME_LOGO.crop.x * k,
                    top: -CHROME_LOGO.crop.y * k,
                    width: CHROME_LOGO.size * k,
                    height: CHROME_LOGO.size * k,
                    maxWidth: 'none',
                    mixBlendMode: 'lighten',
                }}
            />
        </div>
    );
}

/** The lesson address, allowed to wrap after "/blog/" and at the slug's hyphens. */
function CardUrl({ display, style }: { display: string; style: CSSProperties }) {
    const cut = display.indexOf('/blog/');
    const head = cut >= 0 ? display.slice(0, cut + 6) : '';
    const tail = cut >= 0 ? display.slice(cut + 6) : display;
    return (
        <div style={{ ...style, overflowWrap: 'anywhere' }}>
            {head}
            {head ? <wbr /> : null}
            {tail}
        </div>
    );
}

function titleSize(title: string, format: Format) {
    const n = title.trim().length;
    if (format === 'portrait') return n <= 40 ? 104 : n <= 60 ? 92 : n <= 80 ? 82 : n <= 110 ? 72 : 62;
    return n <= 40 ? 64 : n <= 60 ? 56 : n <= 80 ? 50 : n <= 110 ? 44 : 38;
}

async function imagesReady(element: HTMLElement) {
    await Promise.all(
        Array.from(element.querySelectorAll('img')).map((image) =>
            image.complete && image.naturalWidth > 0
                ? image.decode().catch(() => undefined)
                : new Promise<void>((resolve) => {
                      image.addEventListener('load', () => resolve(), { once: true });
                      image.addEventListener('error', () => resolve(), { once: true });
                  }),
        ),
    );
}

/* ── The card ─────────────────────────────────────────────────────────── */

interface CardProps {
    format: Format;
    article: MasterclassShareArticle;
    categoryName: string;
    readingTime: string;
    accent: string;
    url: string;
}

/**
 * Drawn at its export size (1200x630 or 1080x1440) with inline pixel values,
 * then scaled down for the preview. Flat, like the site's link cards: one
 * accent dot, white type, a hairline, the QR code on a white tile.
 */
function ShareCard({ format, article, categoryName, readingTime, accent, url, cardRef }: CardProps & { cardRef?: Ref<HTMLDivElement> }) {
    const portrait = format === 'portrait';
    const { width, height } = SIZE[format];
    const k = portrait ? 1.5 : 1; // type and spacing step for the larger card
    const display = url.replace(/^https?:\/\//, '');
    const size = titleSize(article.title, format);

    return (
        <div
            ref={cardRef}
            style={{
                width,
                height,
                fontFamily: CARD_FONT,
                background: '#050607',
                color: '#ffffff',
                padding: portrait ? '88px 80px 80px' : '56px 72px 52px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: portrait ? 'column' : 'row',
                    alignItems: portrait ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    gap: portrait ? 28 : 32,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 * k, fontSize: 22 * k, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>
                    <ChromeMark height={Math.round(30 * k)} />
                    Virzy Guns Production
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 * k, fontSize: 22 * k, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 12 * k, height: 12 * k, borderRadius: 999, background: accent }} />
                    {categoryName} · {readingTime}
                </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: size, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.025em', maxWidth: portrait ? 920 : 1000, textWrap: 'balance' }}>
                    {article.title}
                </div>
                {article.excerpt?.trim() ? (
                    <div
                        style={{
                            marginTop: portrait ? 36 : 22,
                            fontSize: portrait ? 36 : 24,
                            lineHeight: 1.4,
                            color: 'rgba(255,255,255,0.65)',
                            maxWidth: portrait ? 900 : 1000,
                            display: '-webkit-box',
                            WebkitLineClamp: portrait ? 5 : 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {shorten(article.excerpt, portrait ? 260 : 190)}
                    </div>
                ) : null}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 40 * k,
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    paddingTop: 24 * k,
                }}
            >
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 24 * k, fontWeight: 600 }}>Read the full lesson</div>
                    {/* The whole address, on two lines (or three) if it needs them: the card is a
                        picture, so a cut-off address could not be read anywhere else. */}
                    <CardUrl
                        display={display}
                        style={{ marginTop: 8 * k, fontSize: 18 * k, lineHeight: 1.35, color: 'rgba(255,255,255,0.6)', maxWidth: portrait ? 620 : 860 }}
                    />
                </div>
                <div style={{ background: '#ffffff', borderRadius: 6, padding: portrait ? 14 : 8, lineHeight: 0, flexShrink: 0 }}>
                    <QRCodeSVG value={url} size={portrait ? 196 : 112} level="M" bgColor="#ffffff" fgColor="#050607" title={`QR code for ${display}`} />
                </div>
            </div>
        </div>
    );
}

/** Shows a card drawn at full size, scaled to fit the space it is given. */
function ScaledPreview({ width, height, maxHeight, children }: { width: number; height: number; maxHeight: number; children: ReactNode }) {
    const box = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.3);

    useLayoutEffect(() => {
        const el = box.current;
        if (!el) return;
        const update = () => setScale(Math.min(el.clientWidth / width, maxHeight / height, 1));
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, [width, height, maxHeight]);

    return (
        <div ref={box} className="flex w-full justify-center">
            <div className="relative shrink-0 overflow-hidden rounded-[6px] border border-white/10" style={{ width: width * scale, height: height * scale }}>
                <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
            </div>
        </div>
    );
}

/* ── The dialog ───────────────────────────────────────────────────────── */

const control =
    'vgp-focus inline-flex min-h-11 items-center gap-3 rounded-[6px] border border-white/15 px-3 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white';

/** Height at lg of everything in the left column but the card: header, stage padding, card size and download. */
const DIALOG_CHROME = 61 + 48 + 150;

export function MasterclassShareModal({
    onClose,
    article,
    categoryName,
    readingTime = '4 min read',
    accent = '#7dd3fc',
    siteUrl = 'https://www.virzyguns.com',
}: MasterclassShareModalProps) {
    const dialog = useRef<HTMLDialogElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const card = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const formatLabelId = useId();
    const [format, setFormat] = useState<Format>('landscape');
    const [saving, setSaving] = useState(false);
    const [imageStatus, setImageStatus] = useState('');
    const [linkStatus, setLinkStatus] = useState('');
    const [copied, setCopied] = useState(false);
    // Rendered only in the browser: ArticleActions imports this file on demand and mounts it once Share is pressed, so window is there.
    const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
    const [canShare] = useState(() => typeof navigator.share === 'function');
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    const url = lessonUrl(siteUrl, article.slug);
    const category = categoryName?.trim() || 'Lessons';
    const encoded = { title: encodeURIComponent(article.title), url: encodeURIComponent(url) };
    const targets = [
        { label: 'X', href: `https://twitter.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`, icon: <FaXTwitter size={14} /> },
        { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`, icon: <FaFacebookF size={14} /> },
        { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`, icon: <FaLinkedinIn size={14} /> },
        { label: 'Telegram', href: `https://t.me/share/url?url=${encoded.url}&text=${encoded.title}`, icon: <FaTelegram size={15} /> },
        { label: 'WhatsApp', href: `https://wa.me/?text=${encoded.title}%0A${encoded.url}`, icon: <FaWhatsapp size={15} /> },
        {
            label: 'Email',
            href: `mailto:?subject=${encoded.title}&body=${encodeURIComponent(article.excerpt?.trim() || article.title)}%0A%0A${encoded.url}`,
            icon: <Mail size={15} strokeWidth={2} />,
        },
    ];

    // Open as a modal on mount. Escape and Close both end in the native close event.
    useEffect(() => {
        const el = dialog.current;
        if (!el) return;
        const root = document.documentElement;
        const previousOverflow = root.style.overflow;
        root.style.overflow = 'hidden';
        if (!el.open) el.showModal();
        closeButton.current?.focus();
        const onDialogClose = () => {
            // A strict-mode remount reopens the dialog before this queued event lands.
            if (!el.open) onCloseRef.current();
        };
        el.addEventListener('close', onDialogClose);
        return () => {
            el.removeEventListener('close', onDialogClose);
            root.style.overflow = previousOverflow;
            if (el.open) el.close();
        };
    }, []);

    useEffect(() => {
        const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const close = () => dialog.current?.close();

    // From 1024 px the card sits above its controls in the left column, so a portrait
    // card gets the dialog's height less the header, the stage padding and those controls.
    const wide = viewport.width >= 1024;
    const previewMax =
        format === 'portrait'
            ? wide
                ? Math.max(320, Math.min(viewport.height - 48 - DIALOG_CHROME, 640))
                : Math.min(viewport.height * 0.6, 560)
            : wide
              ? 420
              : 360;

    const download = async () => {
        const el = card.current;
        if (!el) return;
        const { width, height } = SIZE[format];
        setSaving(true);
        setImageStatus('');
        try {
            const { toPng } = await import('html-to-image');
            await imagesReady(el);
            const dataUrl = await toPng(el, {
                width,
                height,
                pixelRatio: 1,
                skipFonts: true,
                backgroundColor: '#050607',
                style: { transform: 'none', margin: '0' },
            });
            const link = document.createElement('a');
            link.download = filename(article.slug, format);
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setImageStatus(`Image saved: ${link.download}`);
        } catch (error) {
            console.error('Share card export failed:', error);
            setImageStatus('The image could not be made. Reload the page and try again.');
        } finally {
            setSaving(false);
        }
    };

    const copyLink = async () => {
        try {
            await copyToClipboard(url);
            setCopied(true);
            setLinkStatus('Link copied');
            window.setTimeout(() => {
                setCopied(false);
                setLinkStatus('');
            }, 2200);
        } catch {
            setLinkStatus('Copy failed. Select the link and copy it.');
        }
    };

    const shareWithApp = async () => {
        try {
            await navigator.share({ title: article.title, text: article.excerpt?.trim() || article.title, url });
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            await copyLink();
        }
    };

    // What is being shared. Shown once: under the card on phones, above the links from 1024 px.
    const lessonLine = (
        <>
            <p className="text-base font-medium leading-snug text-white">{article.title}</p>
            <p className="mt-1 text-sm text-white/60">
                {category} · {readingTime}
            </p>
        </>
    );

    const formatButton = (value: Format, label: string) => {
        const { width, height } = SIZE[value];
        const on = format === value;
        return (
            <button
                type="button"
                aria-pressed={on}
                onClick={() => setFormat(value)}
                className={`vgp-focus inline-flex min-h-11 flex-col items-center justify-center rounded-[4px] px-2 py-1.5 text-sm transition-colors ${
                    on ? 'bg-white/10 font-semibold text-white' : 'text-white/70 hover:text-white'
                }`}
            >
                {label}
                <span className="text-xs font-normal tabular-nums text-white/60">
                    {width} × {height}
                </span>
            </button>
        );
    };

    return (
        <dialog
            ref={dialog}
            aria-labelledby={titleId}
            onClick={(event) => {
                if (event.target === dialog.current) close();
            }}
            onKeyDown={(event) => {
                // The page behind is inert; Tab past the last control comes back to the first
                // instead of leaving for the browser's own controls.
                if (event.key !== 'Tab' || !dialog.current) return;
                const items = Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
                const first = items[0];
                const last = items[items.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }}
            className="vgp-share m-0 h-[100dvh] max-h-none w-full max-w-none overflow-y-auto border-0 bg-[var(--surface)] p-0 text-white backdrop:bg-black/75 lg:m-auto lg:h-fit lg:max-h-[calc(100dvh-48px)] lg:w-[min(1080px,calc(100vw-48px))] lg:overflow-hidden lg:rounded-[6px] lg:border lg:border-white/10 lg:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
        >
            <div className="flex min-h-full flex-col lg:max-h-[calc(100dvh-48px)]">
                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 py-2 pl-[max(16px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] pt-[max(8px,env(safe-area-inset-top))] sm:pl-6 sm:pr-4">
                    <h2 id={titleId} className="text-lg font-semibold text-white">
                        Share this lesson
                    </h2>
                    <button
                        ref={closeButton}
                        type="button"
                        onClick={close}
                        className="vgp-focus inline-flex min-h-11 min-w-11 items-center justify-center rounded-[4px] px-2 text-sm font-medium text-white/75 hover:text-white"
                    >
                        Close
                    </button>
                </header>

                {/* Phones: card, then what to do with it, top to bottom. From 1024 px: the card with
                    its size and download under it on the left, the links on the right, so the
                    columns end close together whichever card is shown. */}
                <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="flex min-w-0 flex-col lg:overflow-y-auto lg:border-r lg:border-white/10">
                        <section aria-label="Card preview" className="flex items-center justify-center border-b border-white/10 bg-[var(--bg)] px-4 py-6 sm:px-6 lg:px-8">
                            <ScaledPreview width={SIZE[format].width} height={SIZE[format].height} maxHeight={previewMax}>
                                <ShareCard
                                    cardRef={card}
                                    format={format}
                                    article={article}
                                    categoryName={category}
                                    readingTime={readingTime}
                                    accent={accent}
                                    url={url}
                                />
                            </ScaledPreview>
                        </section>

                        <div className="px-4 pt-5 sm:px-6 lg:px-8 lg:pb-3">
                            <div className="mb-6 lg:hidden">{lessonLine}</div>
                            <div className="lg:flex lg:items-end lg:gap-4">
                                <div role="group" aria-labelledby={formatLabelId} className="lg:w-72 lg:shrink-0">
                                    <p id={formatLabelId} className="text-sm text-white/60">
                                        Card size
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-1 rounded-[6px] border border-white/15 p-1">
                                        {formatButton('landscape', 'Landscape')}
                                        {formatButton('portrait', 'Portrait')}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={download}
                                    disabled={saving}
                                    className="vgp-focus mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-wait disabled:bg-white/70 lg:mb-1 lg:mt-0 lg:min-w-0 lg:flex-1"
                                >
                                    <Download size={16} aria-hidden="true" />
                                    {saving ? 'Making the image…' : 'Download image'}
                                </button>
                            </div>
                            <p aria-live="polite" className="mt-2 min-h-5 break-words text-sm text-white/70">
                                {imageStatus}
                            </p>
                        </div>
                    </div>

                    <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] sm:px-6 lg:overflow-y-auto lg:py-6">
                        <div className="hidden lg:block">{lessonLine}</div>

                        <div className="mt-4 border-t border-white/10 pt-5 lg:mt-6">
                            <h3 className="text-sm text-white/60">Post the link</h3>
                            <ul className="mt-2 grid grid-cols-2 gap-2">
                                {targets.map((target) => (
                                    <li key={target.label}>
                                        <a
                                            href={target.href}
                                            {...(target.label === 'Email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                                            className={`${control} w-full`}
                                        >
                                            <span aria-hidden="true" className="text-white/70">
                                                {target.icon}
                                            </span>
                                            {target.label}
                                            {target.label === 'Email' ? null : <span className="sr-only"> (opens in a new tab)</span>}
                                        </a>
                                    </li>
                                ))}
                                {canShare ? (
                                    <li className="col-span-2">
                                        <button type="button" onClick={shareWithApp} className={`${control} w-full`}>
                                            <Share2 size={15} aria-hidden="true" className="text-white/70" />
                                            Another app
                                        </button>
                                    </li>
                                ) : null}
                            </ul>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                            <h3 className="text-sm text-white/60">Copy the link</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <p className="min-w-0 flex-1 truncate text-sm text-white/75" title={url}>
                                    {url.replace(/^https?:\/\//, '')}
                                </p>
                                <button type="button" onClick={copyLink} className={`${control} shrink-0`}>
                                    {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                                    {copied ? 'Copied' : 'Copy link'}
                                </button>
                            </div>
                            <p aria-live="polite" className="mt-2 min-h-5 text-sm text-white/70">
                                {linkStatus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    );
}

