'use client';

import {
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

import {
    ArrowUpRight,
    Check,
    Copy,
    Download,
    ExternalLink,
    Mail,
    Share2,
    X,
} from 'lucide-react';

import {
    FaFacebookF,
    FaLinkedinIn,
    FaTelegram,
    FaWhatsapp,
    FaXTwitter,
} from 'react-icons/fa6';

/* ==========================================================================
   Constants
   ========================================================================== */

const LANDSCAPE_WIDTH = 1200;
const LANDSCAPE_HEIGHT = 630;

const VERTICAL_WIDTH = 1080;
const VERTICAL_HEIGHT = 1440;

const DEFAULT_LOGO_SRC = '/branding/logo-tg.png';
const DEFAULT_SITE_URL = 'https://www.virzyguns.com';

const SHARE_CARD_COPY = {
    brand: 'VIRZY GUNS PRODUCTION',
    subtitle: 'AUDIO AND MUSIC PRODUCTION',
    kicker: 'ARTICLE',
    footerLabel: 'READ THE FULL ARTICLE',
    footerTitle: 'Continue on virzyguns.com',
    qrLabel: 'SCAN TO OPEN',
} as const;

/* ==========================================================================
   Types
   ========================================================================== */

export type MasterclassShareFormat = 'landscape' | 'vertical';

export type ShareCardVariant = 'landscape' | 'vertical';

export type MasterclassShareArticle = {
    title: string;
    excerpt?: string | null;
    slug: string;
};

export type MasterclassShareModalProps = {
    open: boolean;
    onClose: () => void;
    article: MasterclassShareArticle;
    categoryName?: string | null;
    readingTime?: string;
    logoSrc?: string;
    siteUrl?: string;
};

type CardProps = {
    id?: string;
    article: MasterclassShareArticle;
    categoryName: string;
    readingTime: string;
    logoSrc: string;
    siteUrl: string;
    rounded?: boolean;
};

/* ==========================================================================
   Helpers
   ========================================================================== */

function clampText(value: string, fallback: string) {
    const cleaned = value.trim();
    return cleaned || fallback;
}

function sanitizeFilename(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100);
}

function getArticleUrl(siteUrl: string, slug: string) {
    const normalizedSiteUrl = siteUrl.replace(/\/+$/, '');
    const normalizedSlug = slug.replace(/^\/+/, '');

    return `${normalizedSiteUrl}/blog/${normalizedSlug}`;
}

function getDisplayUrl(siteUrl: string, slug: string) {
    const hostname = siteUrl
        .replace(/^https?:\/\//, '')
        .replace(/\/+$/, '');

    return `${hostname}/blog/${slug.replace(/^\/+/, '')}`;
}

function nextPaint() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

async function waitForImages(element: HTMLElement) {
    const images = Array.from(element.querySelectorAll('img'));

    await Promise.all(
        images.map(async (image) => {
            if (image.complete && image.naturalWidth > 0) {
                try {
                    await image.decode();
                } catch {
                    // Image is already available enough for export.
                }

                return;
            }

            await new Promise<void>((resolve) => {
                const finish = () => resolve();

                image.addEventListener('load', finish, { once: true });
                image.addEventListener('error', finish, { once: true });
            });
        }),
    );
}

async function copyText(value: string) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea = document.createElement('textarea');

    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    textarea.remove();

    if (!copied) {
        throw new Error('Unable to copy link.');
    }
}

function openShareWindow(url: string) {
    const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;

    if (isSmallScreen) {
        const newTab = window.open(url, '_blank', 'noopener,noreferrer');

        if (newTab) {
            newTab.opener = null;
        }

        return;
    }

    const popupWidth = 760;
    const popupHeight = 680;

    const left = Math.max(
        0,
        window.screenX + (window.outerWidth - popupWidth) / 2,
    );

    const top = Math.max(
        0,
        window.screenY + (window.outerHeight - popupHeight) / 2,
    );

    const popup = window.open(
        url,
        'masterclass-share',
        [
            'noopener',
            'noreferrer',
            `width=${popupWidth}`,
            `height=${popupHeight}`,
            `left=${Math.round(left)}`,
            `top=${Math.round(top)}`,
            'resizable=yes',
            'scrollbars=yes',
        ].join(','),
    );

    if (popup) {
        popup.opener = null;
        popup.focus();
    }
}

/* ==========================================================================
   Hooks
   ========================================================================== */

function useViewportSize() {
    const [viewport, setViewport] = useState(() =>
        typeof window !== 'undefined'
            ? { width: window.innerWidth, height: window.innerHeight }
            : { width: 1440, height: 900 }
    );

    useEffect(() => {
        const updateViewport = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();

        window.addEventListener('resize', updateViewport);

        return () => {
            window.removeEventListener('resize', updateViewport);
        };
    }, []);

    return viewport;
}

/* ==========================================================================
   Brand icon
   ========================================================================== */

function SonicSignatureIcon({
    size = 32,
    className = '',
}: {
    size?: number;
    className?: string;
}) {
    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            className={className}
        >
            <rect
                x="1.5"
                y="1.5"
                width="29"
                height="29"
                rx="9"
                stroke="currentColor"
                strokeOpacity="0.32"
            />

            <path
                d="M6.8 17.1H10.2L12.4 10L15.5 23.1L18.4 7.7L20.9 17.1H25.2"
                stroke="currentColor"
                strokeWidth="2.15"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx="25.1"
                cy="17.1"
                r="1.65"
                fill="currentColor"
            />
        </svg>
    );
}

/* ==========================================================================
   Shared card subcomponents
   ========================================================================== */

function ShareCardBackdrop() {
    return (
        <>
            <div
                aria-hidden="true"
                className="
                    absolute inset-0
                    bg-[radial-gradient(circle_at_82%_8%,rgba(0,194,255,0.23),transparent_30%),radial-gradient(circle_at_6%_100%,rgba(30,64,175,0.22),transparent_36%),linear-gradient(145deg,#0a1b35_0%,#06111f_50%,#03070d_100%)]
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute inset-0 opacity-[0.055]
                    [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)]
                    [background-size:46px_46px]
                    [mask-image:linear-gradient(to_bottom,black,black_65%,transparent_97%)]
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute -right-[170px] -top-[180px]
                    h-[500px] w-[500px] rounded-full
                    bg-cyan-400/[0.09] blur-[130px]
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute -bottom-[220px] -left-[180px]
                    h-[560px] w-[560px] rounded-full
                    bg-blue-600/[0.14] blur-[145px]
                "
            />

            <div
                aria-hidden="true"
                className="
                    absolute inset-x-[95px] top-0 h-px
                    bg-gradient-to-r
                    from-transparent via-cyan-200/85 to-transparent
                "
            />
        </>
    );
}

function BrandLogo({
    logoSrc,
    variant,
}: {
    logoSrc: string;
    variant: ShareCardVariant;
}) {
    const isVertical = variant === 'vertical';

    return (
        <div
            className={`
                relative flex shrink-0 items-center justify-center
                ${
                    isVertical
                        ? 'h-[82px] w-[82px]'
                        : 'h-[62px] w-[62px]'
                }
            `}
        >
            <div
                aria-hidden="true"
                className="
                    absolute inset-[20%] rounded-full
                    bg-cyan-300/[0.13] blur-[22px]
                "
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={logoSrc}
                alt="Virzy Guns Production"
                draggable={false}
                className={`
                    relative z-10 object-contain
                    ${
                        isVertical
                            ? 'h-[70px] w-[70px]'
                            : 'h-[52px] w-[52px]'
                    }
                `}
                style={{
                    transform: isVertical
                        ? 'scale(1.18)'
                        : 'scale(1.14)',
                    filter: `
                        brightness(0)
                        saturate(100%)
                        invert(91%)
                        sepia(26%)
                        saturate(1040%)
                        hue-rotate(153deg)
                        brightness(105%)
                        contrast(106%)
                        drop-shadow(0 0 12px rgba(34,211,238,0.24))
                    `,
                }}
            />
        </div>
    );
}

function ShareCardHeader({
    logoSrc,
    categoryName,
    readingTime,
    variant,
}: {
    logoSrc: string;
    categoryName: string;
    readingTime: string;
    variant: ShareCardVariant;
}) {
    const isVertical = variant === 'vertical';

    return (
        <header className="shrink-0">
            <div className="flex items-center justify-between gap-[28px]">
                <div
                    className={`
                        flex min-w-0 items-center
                        ${isVertical ? 'gap-[20px]' : 'gap-[15px]'}
                    `}
                >
                    <BrandLogo
                        logoSrc={logoSrc}
                        variant={variant}
                    />

                    <div className="min-w-0">
                        <p
                            className={`
                                whitespace-nowrap font-black
                                tracking-[0.065em] text-white
                                ${
                                    isVertical
                                        ? 'text-[27px]'
                                        : 'text-[21px]'
                                }
                            `}
                        >
                            {SHARE_CARD_COPY.brand}
                        </p>

                        <p
                            className={`
                                font-bold uppercase text-cyan-300/68
                                ${
                                    isVertical
                                        ? 'mt-[7px] text-[13px] tracking-[0.19em]'
                                        : 'mt-[5px] text-[10px] tracking-[0.18em]'
                                }
                            `}
                        >
                            {SHARE_CARD_COPY.subtitle}
                        </p>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p
                        className={`
                            max-w-[230px] font-bold uppercase
                            leading-[1.35] tracking-[0.09em]
                            text-cyan-100/76
                            ${
                                isVertical
                                    ? 'text-[14px]'
                                    : 'text-[11px]'
                            }
                        `}
                    >
                        {categoryName}
                    </p>

                    <p
                        className={`
                            font-medium text-white/42
                            ${
                                isVertical
                                    ? 'mt-[7px] text-[13px]'
                                    : 'mt-[5px] text-[10px]'
                            }
                        `}
                    >
                        {readingTime} · Free to read
                    </p>
                </div>
            </div>

            <div
                className={`
                    border-t border-white/[0.08]
                    ${
                        isVertical
                            ? 'mt-[25px]'
                            : 'mt-[17px]'
                    }
                `}
            />
        </header>
    );
}

function ShareCardKicker({
    variant,
}: {
    variant: ShareCardVariant;
}) {
    const isVertical = variant === 'vertical';

    return (
        <div
            className={`
                flex items-center
                ${isVertical ? 'gap-[15px]' : 'gap-[13px]'}
            `}
        >
            <span
                className={`
                    rounded-full bg-gradient-to-r
                    from-cyan-300 to-blue-500
                    ${
                        isVertical
                            ? 'h-[3px] w-[62px]'
                            : 'h-[3px] w-[54px]'
                    }
                `}
            />

            <span
                className={`
                    font-bold uppercase text-cyan-300
                    ${
                        isVertical
                            ? 'text-[14px] tracking-[0.21em]'
                            : 'text-[12px] tracking-[0.22em]'
                    }
                `}
            >
                {SHARE_CARD_COPY.kicker}
            </span>
        </div>
    );
}

function ShareCardQr({
    articleUrl,
    articleTitle,
    variant,
}: {
    articleUrl: string;
    articleTitle: string;
    variant: ShareCardVariant;
}) {
    const isVertical = variant === 'vertical';
    const qrSize = isVertical ? 170 : 104;

    return (
        <div className="shrink-0">
            <div
                className={`
                    border border-cyan-300/20
                    bg-cyan-300/[0.045]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_30px_rgba(34,211,238,0.14)]
                    ${
                        isVertical
                            ? 'rounded-[24px] p-[9px]'
                            : 'rounded-[19px] p-[7px]'
                    }
                `}
            >
                <div
                    className={`
                        bg-white
                        ${
                            isVertical
                                ? 'rounded-[18px] p-[10px]'
                                : 'rounded-[14px] p-[8px]'
                        }
                    `}
                >
                    <QRCodeSVG
                        value={articleUrl}
                        size={qrSize}
                        level="M"
                        bgColor="#ffffff"
                        fgColor="#03060b"
                        title={`Read ${articleTitle}`}
                        className="block"
                    />
                </div>
            </div>

            <p
                className={`
                    text-center font-bold uppercase
                    tracking-[0.15em] text-white/44
                    ${
                        isVertical
                            ? 'mt-[10px] text-[11px]'
                            : 'mt-[7px] text-[8px]'
                    }
                `}
            >
                {SHARE_CARD_COPY.qrLabel}
            </p>
        </div>
    );
}

function ShareCardFooter({
    articleUrl,
    displayUrl,
    articleTitle,
    variant,
}: {
    articleUrl: string;
    displayUrl: string;
    articleTitle: string;
    variant: ShareCardVariant;
}) {
    const isVertical = variant === 'vertical';

    return (
        <footer
            className={`
                shrink-0 border-t border-white/[0.09]
                ${isVertical ? 'pt-[28px]' : 'pt-[17px]'}
            `}
        >
            <div
                className={`
                    flex items-center justify-between
                    ${isVertical ? 'gap-[38px]' : 'gap-[28px]'}
                `}
            >
                <div className="min-w-0 flex-1">
                    <p
                        className={`
                            font-bold uppercase
                            tracking-[0.18em] text-cyan-300/76
                            ${
                                isVertical
                                    ? 'text-[13px]'
                                    : 'text-[10px]'
                            }
                        `}
                    >
                        {SHARE_CARD_COPY.footerLabel}
                    </p>

                    <p
                        className={`
                            font-black tracking-[-0.028em] text-white
                            ${
                                isVertical
                                    ? 'mt-[14px] text-[32px]'
                                    : 'mt-[9px] text-[21px]'
                            }
                        `}
                    >
                        {SHARE_CARD_COPY.footerTitle}
                    </p>

                    <div
                        className={`
                            flex min-w-0 items-center
                            ${
                                isVertical
                                    ? 'mt-[15px] gap-[10px]'
                                    : 'mt-[9px] gap-[7px]'
                            }
                        `}
                    >
                        <span
                            className={`
                                truncate font-bold text-cyan-300
                                ${
                                    isVertical
                                        ? 'max-w-[620px] text-[16px]'
                                        : 'max-w-[790px] text-[11px]'
                                }
                            `}
                        >
                            {displayUrl}
                        </span>

                        <ArrowUpRight
                            size={isVertical ? 21 : 15}
                            strokeWidth={2.5}
                            className="shrink-0 text-cyan-300"
                        />
                    </div>
                </div>

                <ShareCardQr
                    articleUrl={articleUrl}
                    articleTitle={articleTitle}
                    variant={variant}
                />
            </div>
        </footer>
    );
}

function getShareTitleStyle(
    title: string,
    variant: ShareCardVariant,
): CSSProperties {
    const length = title.trim().length;
    const isVertical = variant === 'vertical';

    if (isVertical) {
        if (length > 155) {
            return {
                fontSize: 54,
                lineHeight: 0.99,
                letterSpacing: '-0.047em',
            };
        }

        if (length > 125) {
            return {
                fontSize: 60,
                lineHeight: 0.98,
                letterSpacing: '-0.05em',
            };
        }

        if (length > 95) {
            return {
                fontSize: 68,
                lineHeight: 0.97,
                letterSpacing: '-0.052em',
            };
        }

        if (length > 68) {
            return {
                fontSize: 78,
                lineHeight: 0.95,
                letterSpacing: '-0.056em',
            };
        }

        return {
            fontSize: 90,
            lineHeight: 0.93,
            letterSpacing: '-0.06em',
        };
    }

    if (length > 155) {
        return {
            fontSize: 34,
            lineHeight: 1,
            letterSpacing: '-0.038em',
        };
    }

    if (length > 125) {
        return {
            fontSize: 38,
            lineHeight: 0.99,
            letterSpacing: '-0.041em',
        };
    }

    if (length > 100) {
        return {
            fontSize: 42,
            lineHeight: 0.98,
            letterSpacing: '-0.044em',
        };
    }

    if (length > 78) {
        return {
            fontSize: 47,
            lineHeight: 0.97,
            letterSpacing: '-0.047em',
        };
    }

    if (length > 56) {
        return {
            fontSize: 54,
            lineHeight: 0.95,
            letterSpacing: '-0.052em',
        };
    }

    return {
        fontSize: 61,
        lineHeight: 0.93,
        letterSpacing: '-0.056em',
    };
}

/* ==========================================================================
   Landscape card
   ========================================================================== */

function MasterclassLandscapeShareCard({
    id,
    article,
    categoryName,
    readingTime,
    logoSrc,
    siteUrl,
    rounded = true,
}: CardProps) {
    const articleUrl = getArticleUrl(siteUrl, article.slug);
    const displayUrl = getDisplayUrl(siteUrl, article.slug);

    return (
        <div
            id={id}
            style={{
                width: LANDSCAPE_WIDTH,
                height: LANDSCAPE_HEIGHT,
            }}
            className={`
                relative isolate shrink-0 overflow-hidden
                bg-[#03060b] text-white
                ${
                    rounded
                        ? 'rounded-[42px] border border-white/[0.11]'
                        : 'rounded-none border-0'
                }
            `}
        >
            <ShareCardBackdrop />

            <div
                className="
                    relative z-10 grid h-full
                    grid-rows-[auto_minmax(0,1fr)_auto]
                    px-[50px] pb-[30px] pt-[36px]
                "
            >
                <ShareCardHeader
                    logoSrc={logoSrc}
                    categoryName={categoryName}
                    readingTime={readingTime}
                    variant="landscape"
                />

                <main
                    className="
                        flex min-h-0 flex-col justify-center
                        pb-[18px] pt-[25px]
                    "
                >
                    <ShareCardKicker variant="landscape" />

                    <h2
                        style={getShareTitleStyle(
                            article.title,
                            'landscape',
                        )}
                        className="
                            mt-[16px] max-w-[1020px]
                            font-black text-white
                        "
                    >
                        {article.title}
                    </h2>

                    {article.excerpt?.trim() ? (
                        <div
                            className="
                                relative mt-[17px] max-w-[1000px]
                                pl-[14px]
                            "
                        >
                            <div
                                aria-hidden="true"
                                className="
                                    absolute inset-y-0 left-0
                                    w-[4px] rounded-full
                                    bg-gradient-to-b
                                    from-cyan-300 to-blue-500
                                "
                            />

                            <p
                                className="
                                    line-clamp-2 text-[15px]
                                    leading-[1.48] text-slate-200/82
                                "
                            >
                                {article.excerpt}
                            </p>
                        </div>
                    ) : null}
                </main>

                <ShareCardFooter
                    articleUrl={articleUrl}
                    displayUrl={displayUrl}
                    articleTitle={article.title}
                    variant="landscape"
                />
            </div>
        </div>
    );
}

/* ==========================================================================
   Vertical 3:4 card
   ========================================================================== */

function MasterclassVerticalShareCard({
    id,
    article,
    categoryName,
    readingTime,
    logoSrc,
    siteUrl,
    rounded = true,
}: CardProps) {
    const articleUrl = getArticleUrl(siteUrl, article.slug);
    const displayUrl = getDisplayUrl(siteUrl, article.slug);

    return (
        <div
            id={id}
            style={{
                width: VERTICAL_WIDTH,
                height: VERTICAL_HEIGHT,
            }}
            className={`
                relative isolate shrink-0 overflow-hidden
                bg-[#03060b] text-white
                ${
                    rounded
                        ? 'rounded-[48px] border border-white/[0.11]'
                        : 'rounded-none border-0'
                }
            `}
        >
            <ShareCardBackdrop />

            <div
                className="
                    relative z-10 grid h-full
                    grid-rows-[auto_minmax(0,1fr)_auto]
                    px-[64px] pb-[56px] pt-[54px]
                "
            >
                <ShareCardHeader
                    logoSrc={logoSrc}
                    categoryName={categoryName}
                    readingTime={readingTime}
                    variant="vertical"
                />

                <main
                    className="
                        flex min-h-0 flex-col justify-center
                        pb-[38px] pt-[45px]
                    "
                >
                    <ShareCardKicker variant="vertical" />

                    <h1
                        style={getShareTitleStyle(
                            article.title,
                            'vertical',
                        )}
                        className="
                            mt-[22px] max-w-[920px]
                            font-black text-white
                        "
                    >
                        {article.title}
                    </h1>

                    {article.excerpt?.trim() ? (
                        <div
                            className="
                                relative mt-[32px]
                                max-w-[900px]
                                rounded-[26px]
                                border border-white/[0.09]
                                bg-white/[0.035]
                                px-[29px] py-[25px]
                                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                            "
                        >
                            <div
                                aria-hidden="true"
                                className="
                                    absolute inset-y-[14px]
                                    left-0 w-[4px]
                                    rounded-full
                                    bg-gradient-to-b
                                    from-cyan-300 to-blue-500
                                "
                            />

                            <p
                                className="
                                    line-clamp-4
                                    text-[24px] leading-[1.5]
                                    tracking-[-0.012em]
                                    text-slate-100/86
                                "
                            >
                                {article.excerpt}
                            </p>
                        </div>
                    ) : null}
                </main>

                <ShareCardFooter
                    articleUrl={articleUrl}
                    displayUrl={displayUrl}
                    articleTitle={article.title}
                    variant="vertical"
                />
            </div>
        </div>
    );
}

/* ==========================================================================
   Responsive preview scaler
   ========================================================================== */

type ScaledCardPreviewProps = {
    children: ReactNode;
    sourceWidth: number;
    sourceHeight: number;
    maxHeight: number;
};

function ScaledCardPreview({
    children,
    sourceWidth,
    sourceHeight,
    maxHeight,
}: ScaledCardPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.3);

    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const updateScale = () => {
            const availableWidth = Math.max(
                1,
                container.clientWidth,
            );

            const widthScale = availableWidth / sourceWidth;
            const heightScale = maxHeight / sourceHeight;

            setScale(Math.min(widthScale, heightScale, 1));
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, [maxHeight, sourceHeight, sourceWidth]);

    return (
        <div
            ref={containerRef}
            className="flex w-full justify-center"
        >
            <div
                className="relative shrink-0"
                style={{
                    width: sourceWidth * scale,
                    height: sourceHeight * scale,
                }}
            >
                <div
                    style={{
                        width: sourceWidth,
                        height: sourceHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   Format selector
   ========================================================================== */

function FormatSelector({
    format,
    onChange,
}: {
    format: MasterclassShareFormat;
    onChange: (format: MasterclassShareFormat) => void;
}) {
    return (
        <div
            className="
                grid grid-cols-2 rounded-[15px]
                border border-white/[0.09]
                bg-black/25 p-[4px]
            "
        >
            <button
                type="button"
                onClick={() => onChange('landscape')}
                aria-pressed={format === 'landscape'}
                className={`
                    min-h-[44px] rounded-[11px]
                    px-[10px] text-[11px] font-bold
                    transition duration-200
                    ${
                        format === 'landscape'
                            ? 'bg-cyan-300 text-[#041015] shadow-[0_8px_22px_rgba(0,194,255,0.20)]'
                            : 'text-white/48 hover:bg-white/[0.05] hover:text-white/80'
                    }
                `}
            >
                Landscape
                <span className="ml-[5px] text-[9px] opacity-60">
                    1200×630
                </span>
            </button>

            <button
                type="button"
                onClick={() => onChange('vertical')}
                aria-pressed={format === 'vertical'}
                className={`
                    min-h-[44px] rounded-[11px]
                    px-[10px] text-[11px] font-bold
                    transition duration-200
                    ${
                        format === 'vertical'
                            ? 'bg-cyan-300 text-[#041015] shadow-[0_8px_22px_rgba(0,194,255,0.20)]'
                            : 'text-white/48 hover:bg-white/[0.05] hover:text-white/80'
                    }
                `}
            >
                Vertical
                <span className="ml-[5px] text-[9px] opacity-60">
                    1080×1440
                </span>
            </button>
        </div>
    );
}

/* ==========================================================================
   Social share buttons
   ========================================================================== */

type SocialButtonProps = {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    iconClassName: string;
};

function SocialButton({
    icon,
    label,
    onClick,
    iconClassName,
}: SocialButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group flex min-h-[54px] items-center
                gap-[11px] rounded-[16px]
                border border-white/[0.09]
                bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.024))]
                px-[13px] text-left
                shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                transition duration-200
                hover:border-cyan-300/25
                hover:bg-cyan-300/[0.055]
                active:scale-[0.985]
            "
        >
            <span
                className={`
                    flex h-[31px] w-[31px] shrink-0
                    items-center justify-center rounded-[10px]
                    border border-white/[0.10]
                    bg-black/30
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                    transition duration-200
                    ${iconClassName}
                `}
            >
                {icon}
            </span>

            <span className="truncate text-[12px] font-bold text-white/84">
                {label}
            </span>
        </button>
    );
}

type ShareActionsProps = {
    title: string;
    excerpt?: string | null;
    url: string;
};

function ShareActions({
    title,
    excerpt,
    url,
}: ShareActionsProps) {
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState('');

    const encoded = useMemo(
        () => ({
            title: encodeURIComponent(title),
            text: encodeURIComponent(excerpt?.trim() || title),
            url: encodeURIComponent(url),
        }),
        [excerpt, title, url],
    );

    const platformUrls = useMemo(
        () => ({
            x: `https://twitter.com/intent/tweet?text=${encoded.title}&url=${encoded.url}`,

            facebook:
                `https://www.facebook.com/sharer/sharer.php?u=${encoded.url}`,

            linkedin:
                `https://www.linkedin.com/sharing/share-offsite/?url=${encoded.url}`,

            telegram:
                `https://t.me/share/url?url=${encoded.url}&text=${encoded.title}`,

            whatsapp:
                `https://wa.me/?text=${encoded.title}%0A${encoded.url}`,

            email:
                `mailto:?subject=${encoded.title}&body=${encoded.text}%0A%0A${encoded.url}`,
        }),
        [encoded],
    );

    const showMessage = (value: string) => {
        setMessage(value);

        window.setTimeout(() => {
            setMessage('');
        }, 2200);
    };

    const handleCopyLink = async () => {
        try {
            await copyText(url);

            setCopied(true);
            showMessage('Link copied');

            window.setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch {
            showMessage('Failed to copy link');
        }
    };

    const handleNativeShare = async () => {
        if (!navigator.share) {
            await handleCopyLink();
            return;
        }

        try {
            await navigator.share({
                title,
                text: excerpt?.trim() || title,
                url,
            });
        } catch (error) {
            if (
                error instanceof DOMException &&
                error.name === 'AbortError'
            ) {
                return;
            }

            await handleCopyLink();
        }
    };

    const openEmail = () => {
        window.location.href = platformUrls.email;
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleNativeShare}
                className="
                    flex min-h-[57px] w-full items-center
                    justify-center gap-[10px] rounded-[17px]
                    border border-cyan-200/30
                    bg-[linear-gradient(135deg,#2bd4e6_0%,#2e7df5_100%)]
                    px-[18px] text-[13px] font-black
                    text-[#031017]
                    shadow-[0_15px_36px_rgba(0,194,255,0.19),inset_0_1px_0_rgba(255,255,255,0.36)]
                    transition duration-200
                    hover:brightness-110
                    active:scale-[0.99]
                "
            >
                <Share2 size={18} strokeWidth={2.4} />
                Share article
            </button>

            <div className="mt-[9px] grid grid-cols-2 gap-[9px]">
                <SocialButton
                    icon={<FaXTwitter size={14} />}
                    label="Post to X"
                    onClick={() => openShareWindow(platformUrls.x)}
                    iconClassName="
                        text-white/85
                        group-hover:border-white/25
                        group-hover:text-white
                    "
                />

                <SocialButton
                    icon={<FaFacebookF size={14} />}
                    label="Facebook"
                    onClick={() =>
                        openShareWindow(platformUrls.facebook)
                    }
                    iconClassName="
                        text-[#7ba8ff]
                        group-hover:border-[#1877f2]/40
                        group-hover:bg-[#1877f2]/10
                    "
                />

                <SocialButton
                    icon={<FaLinkedinIn size={14} />}
                    label="LinkedIn"
                    onClick={() =>
                        openShareWindow(platformUrls.linkedin)
                    }
                    iconClassName="
                        text-[#6fc4ff]
                        group-hover:border-[#0a66c2]/45
                        group-hover:bg-[#0a66c2]/10
                    "
                />

                <SocialButton
                    icon={<FaTelegram size={15} />}
                    label="Telegram"
                    onClick={() =>
                        openShareWindow(platformUrls.telegram)
                    }
                    iconClassName="
                        text-[#76d2ff]
                        group-hover:border-[#2aabee]/45
                        group-hover:bg-[#2aabee]/10
                    "
                />

                <SocialButton
                    icon={<FaWhatsapp size={16} />}
                    label="WhatsApp"
                    onClick={() =>
                        openShareWindow(platformUrls.whatsapp)
                    }
                    iconClassName="
                        text-[#62e99c]
                        group-hover:border-[#25d366]/45
                        group-hover:bg-[#25d366]/10
                    "
                />

                <SocialButton
                    icon={<Mail size={15} strokeWidth={2.2} />}
                    label="Email"
                    onClick={openEmail}
                    iconClassName="
                        text-cyan-200
                        group-hover:border-cyan-300/35
                        group-hover:bg-cyan-300/10
                    "
                />
            </div>

            <div className="mt-[9px] grid grid-cols-[1fr_52px] gap-[9px]">
                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="
                        flex min-h-[52px] items-center justify-center
                        gap-[9px] rounded-[16px]
                        border border-white/[0.10]
                        bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.022))]
                        text-[12px] font-bold text-white/84
                        transition duration-200
                        hover:border-cyan-300/25
                        hover:bg-white/[0.06]
                        active:scale-[0.99]
                    "
                >
                    {copied ? (
                        <>
                            <Check
                                size={16}
                                className="text-emerald-400"
                            />
                            Link copied
                        </>
                    ) : (
                        <>
                            <Copy size={16} />
                            Copy link
                        </>
                    )}
                </button>

                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open article"
                    className="
                        flex h-[52px] w-[52px]
                        items-center justify-center rounded-[16px]
                        border border-white/[0.10]
                        bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.022))]
                        text-white/62
                        transition duration-200
                        hover:border-cyan-300/25
                        hover:text-cyan-300
                    "
                >
                    <ExternalLink size={17} />
                </a>
            </div>

            <div
                aria-live="polite"
                className={`
                    min-h-[18px] pt-[8px] text-center
                    text-[11px] font-medium transition
                    ${
                        message
                            ? 'text-cyan-200/80'
                            : 'text-transparent'
                    }
                `}
            >
                {message || 'Share status'}
            </div>
        </div>
    );
}

/* ==========================================================================
   Main modal
   ========================================================================== */

export function MasterclassShareModal({
    open,
    onClose,
    article,
    categoryName,
    readingTime = '4 min read',
    logoSrc = DEFAULT_LOGO_SRC,
    siteUrl = DEFAULT_SITE_URL,
}: MasterclassShareModalProps) {
    const [format, setFormat] =
        useState<MasterclassShareFormat>('landscape');

    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const viewport = useViewportSize();

    const instanceId = useId().replace(/:/g, '');

    const landscapeExportId =
        `masterclass-landscape-export-${instanceId}`;

    const verticalExportId =
        `masterclass-vertical-export-${instanceId}`;

    const cleanedCategory = clampText(
        categoryName || '',
        'Audio Science',
    );

    const articleUrl = getArticleUrl(siteUrl, article.slug);
    const displayUrl = getDisplayUrl(siteUrl, article.slug);

    const isDesktop = viewport.width >= 1024;

    const previewMaxHeight = useMemo(() => {
        if (isDesktop) {
            return format === 'vertical' ? 720 : 555;
        }

        const usableHeight = Math.max(
            440,
            viewport.height - 155,
        );

        if (format === 'vertical') {
            return Math.min(
                usableHeight * 0.78,
                670,
            );
        }

        return Math.min(
            usableHeight * 0.48,
            380,
        );
    }, [format, isDesktop, viewport.height]);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight =
            document.body.style.paddingRight;

        const scrollbarWidth =
            window.innerWidth -
            document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight =
                `${scrollbarWidth}px`;
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight =
                previousPaddingRight;

            window.removeEventListener(
                'keydown',
                handleEscape,
            );
        };
    }, [onClose, open]);

    const handleDownload = async () => {
        const isVertical = format === 'vertical';

        const exportElementId = isVertical
            ? verticalExportId
            : landscapeExportId;

        const width = isVertical
            ? VERTICAL_WIDTH
            : LANDSCAPE_WIDTH;

        const height = isVertical
            ? VERTICAL_HEIGHT
            : LANDSCAPE_HEIGHT;

        const element =
            document.getElementById(exportElementId);

        if (!element) {
            setDownloadError(
                'Share card export element was not found.',
            );

            return;
        }

        try {
            setDownloading(true);
            setDownloadError('');

            if (document.fonts?.ready) {
                await document.fonts.ready;
            }

            await waitForImages(element);
            await nextPaint();

            const dataUrl = await toPng(element, {
                width,
                height,
                pixelRatio: 1,
                cacheBust: true,
                skipAutoScale: true,
                backgroundColor: '#03060b',

                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: 'none',
                    transformOrigin: 'top left',
                    borderRadius: '0',
                    margin: '0',
                },
            });

            const filenameSlug =
                sanitizeFilename(article.slug) ||
                'masterclass';

            const link = document.createElement('a');

            link.download =
                `VGP-Masterclass-${filenameSlug}-${
                    isVertical
                        ? 'vertical-3x4'
                        : 'landscape'
                }.png`;

            link.href = dataUrl;

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(
                'Failed to export masterclass share card:',
                error,
            );

            setDownloadError(
                'PNG export failed. Refresh the page and try again.',
            );
        } finally {
            setDownloading(false);
        }
    };

    if (!open || typeof window === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Masterclass share card"
            className="
                fixed inset-0 z-[1000]
                overflow-hidden bg-black/85
                backdrop-blur-[20px]
                sm:p-[16px]
            "
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    viewport.width >= 640
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    relative mx-auto flex
                    h-[100dvh] min-h-[100svh]
                    w-full flex-col overflow-hidden
                    bg-[#05080f]
                    sm:h-[calc(100dvh-32px)]
                    sm:min-h-0 sm:max-w-[1180px]
                    sm:rounded-[30px]
                    sm:border sm:border-cyan-300/20
                    sm:shadow-[0_48px_150px_rgba(0,0,0,0.74),0_0_90px_rgba(0,194,255,0.10)]
                "
            >
                {/* Modal ambient background */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute inset-0
                        bg-[radial-gradient(circle_at_12%_8%,rgba(0,194,255,0.08),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(37,99,235,0.10),transparent_38%)]
                    "
                />

                {/* Mobile header */}
                <header
                    className="
                        relative z-30 flex shrink-0 items-center
                        justify-between border-b border-white/[0.08]
                        bg-[#070b12]/95
                        pb-[14px]
                        pl-[max(16px,env(safe-area-inset-left))]
                        pr-[max(16px,env(safe-area-inset-right))]
                        pt-[max(14px,env(safe-area-inset-top))]
                        backdrop-blur-xl
                        lg:hidden
                    "
                >
                    <div className="flex min-w-0 items-center gap-[11px]">
                        <SonicSignatureIcon
                            size={32}
                            className="shrink-0 text-cyan-300"
                        />

                        <div className="min-w-0">
                            <p
                                className="
                                    truncate text-[13px] font-black
                                    uppercase tracking-[0.10em]
                                    text-white
                                "
                            >
                                Masterclass share
                            </p>

                            <p className="mt-[2px] text-[10px] text-white/38">
                                Export and publish
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close share modal"
                        className="
                            flex h-[40px] w-[40px] shrink-0
                            items-center justify-center rounded-full
                            border border-white/[0.09]
                            bg-white/[0.055] text-white/58
                            transition duration-200
                            hover:bg-white/[0.10]
                            hover:text-white
                        "
                    >
                        <X size={18} />
                    </button>
                </header>

                {/* Mobile format selector */}
                <div
                    className="
                        relative z-20 shrink-0
                        border-b border-white/[0.07]
                        bg-[#070b12]/90
                        py-[11px]
                        pl-[max(16px,env(safe-area-inset-left))]
                        pr-[max(16px,env(safe-area-inset-right))]
                        backdrop-blur-xl
                        lg:hidden
                    "
                >
                    <FormatSelector
                        format={format}
                        onChange={setFormat}
                    />
                </div>

                {/* Modal body */}
                <div
                    className="
                        relative z-10 min-h-0 flex-1
                        overflow-y-auto overscroll-contain
                        [-webkit-overflow-scrolling:touch]
                        lg:grid lg:grid-cols-[minmax(0,1fr)_360px]
                        lg:overflow-hidden
                    "
                >
                    {/* Preview */}
                    <section
                        className="
                            relative flex min-h-0
                            items-center justify-center
                            overflow-hidden border-b
                            border-white/[0.08]
                            bg-black/25
                            px-[14px] py-[20px]
                            sm:p-[24px]
                            lg:min-h-0 lg:border-b-0
                            lg:border-r lg:p-[34px]
                        "
                    >
                        <div
                            aria-hidden="true"
                            className="
                                absolute inset-0 opacity-[0.065]
                                [background-image:linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)]
                                [background-size:40px_40px]
                            "
                        />

                        <div
                            aria-hidden="true"
                            className="
                                absolute left-1/2 top-1/2
                                h-[65%] w-[65%]
                                -translate-x-1/2 -translate-y-1/2
                                rounded-full bg-cyan-400/[0.045]
                                blur-[90px]
                            "
                        />

                        <div className="relative z-10 w-full">
                            {format === 'vertical' ? (
                                <ScaledCardPreview
                                    sourceWidth={VERTICAL_WIDTH}
                                    sourceHeight={VERTICAL_HEIGHT}
                                    maxHeight={previewMaxHeight}
                                >
                                    <MasterclassVerticalShareCard
                                        article={article}
                                        categoryName={cleanedCategory}
                                        readingTime={readingTime}
                                        logoSrc={logoSrc}
                                        siteUrl={siteUrl}
                                        rounded
                                    />
                                </ScaledCardPreview>
                            ) : (
                                <ScaledCardPreview
                                    sourceWidth={LANDSCAPE_WIDTH}
                                    sourceHeight={LANDSCAPE_HEIGHT}
                                    maxHeight={previewMaxHeight}
                                >
                                    <MasterclassLandscapeShareCard
                                        article={article}
                                        categoryName={cleanedCategory}
                                        readingTime={readingTime}
                                        logoSrc={logoSrc}
                                        siteUrl={siteUrl}
                                        rounded
                                    />
                                </ScaledCardPreview>
                            )}
                        </div>
                    </section>

                    {/* Control panel */}
                    <aside
                        className="
                            relative flex min-h-0 flex-col
                            bg-[#080c14]/92
                            pb-[max(24px,env(safe-area-inset-bottom))]
                            pl-[max(16px,env(safe-area-inset-left))]
                            pr-[max(16px,env(safe-area-inset-right))]
                            pt-[18px]
                            sm:px-[22px] sm:py-[22px]
                            lg:overflow-y-auto
                        "
                    >
                        {/* Desktop header */}
                        <header
                            className="
                                hidden items-center justify-between
                                border-b border-white/[0.08]
                                pb-[18px] lg:flex
                            "
                        >
                            <div className="flex min-w-0 items-center gap-[11px]">
                                <SonicSignatureIcon
                                    size={32}
                                    className="shrink-0 text-cyan-300"
                                />

                                <div className="min-w-0">
                                    <p
                                        className="
                                            truncate text-[13px]
                                            font-black uppercase
                                            tracking-[0.10em] text-white
                                        "
                                    >
                                        Masterclass share
                                    </p>

                                    <p className="mt-[2px] text-[10px] text-white/38">
                                        Export and publish
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close share modal"
                                className="
                                    flex h-[40px] w-[40px]
                                    shrink-0 items-center justify-center
                                    rounded-full border
                                    border-white/[0.09]
                                    bg-white/[0.055]
                                    text-white/58
                                    transition duration-200
                                    hover:bg-white/[0.10]
                                    hover:text-white
                                "
                            >
                                <X size={18} />
                            </button>
                        </header>

                        {/* Desktop format selector */}
                        <div className="mt-[18px] hidden lg:block">
                            <p
                                className="
                                    mb-[9px] font-mono text-[10px]
                                    font-bold uppercase
                                    tracking-[0.18em] text-white/34
                                "
                            >
                                Image format
                            </p>

                            <FormatSelector
                                format={format}
                                onChange={setFormat}
                            />
                        </div>

                        {/* Article summary */}
                        <div
                            className="
                                rounded-[17px] border
                                border-white/[0.08]
                                bg-white/[0.027] p-[14px]
                                lg:mt-[17px]
                            "
                        >
                            <p
                                className="
                                    line-clamp-2 text-[13px]
                                    font-bold leading-[1.45]
                                    text-white/84
                                "
                            >
                                {article.title}
                            </p>

                            <p
                                className="
                                    mt-[7px] truncate
                                    font-mono text-[9px]
                                    text-cyan-300/58
                                "
                            >
                                {displayUrl}
                            </p>
                        </div>

                        {/* Download button */}
                        <button
                            type="button"
                            disabled={downloading}
                            onClick={handleDownload}
                            className="
                                mt-[15px] flex min-h-[57px]
                                items-center justify-center gap-[10px]
                                rounded-[17px]
                                border border-cyan-200/30
                                bg-[linear-gradient(135deg,#2bd4e6_0%,#2e7df5_100%)]
                                px-[18px] text-[13px]
                                font-black text-[#031017]
                                shadow-[0_15px_36px_rgba(0,194,255,0.19),inset_0_1px_0_rgba(255,255,255,0.36)]
                                transition duration-200
                                hover:brightness-110
                                active:scale-[0.99]
                                disabled:cursor-wait
                                disabled:opacity-55
                            "
                        >
                            <Download size={18} strokeWidth={2.4} />

                            {downloading
                                ? 'Rendering HD PNG...'
                                : format === 'vertical'
                                  ? 'Download vertical PNG'
                                  : 'Download landscape PNG'}
                        </button>

                        <div
                            aria-live="polite"
                            className={`
                                min-h-[22px] pt-[7px]
                                text-center text-[11px]
                                font-medium
                                ${
                                    downloadError
                                        ? 'text-red-300'
                                        : 'text-transparent'
                                }
                            `}
                        >
                            {downloadError || 'Download status'}
                        </div>

                        <div className="my-[13px] h-px bg-white/[0.08]" />

                        {/* Share */}
                        <div>
                            <p
                                className="
                                    mb-[10px] font-mono text-[10px]
                                    font-bold uppercase
                                    tracking-[0.18em] text-white/34
                                "
                            >
                                Share article
                            </p>

                            <ShareActions
                                title={article.title}
                                excerpt={article.excerpt}
                                url={articleUrl}
                            />
                        </div>
                    </aside>
                </div>

                {/* Hidden fixed-size export cards */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none fixed
                        left-[-14000px] top-0
                    "
                >
                    <MasterclassLandscapeShareCard
                        id={landscapeExportId}
                        article={article}
                        categoryName={cleanedCategory}
                        readingTime={readingTime}
                        logoSrc={logoSrc}
                        siteUrl={siteUrl}
                        rounded={false}
                    />

                    <div className="mt-[40px]">
                        <MasterclassVerticalShareCard
                            id={verticalExportId}
                            article={article}
                            categoryName={cleanedCategory}
                            readingTime={readingTime}
                            logoSrc={logoSrc}
                            siteUrl={siteUrl}
                            rounded={false}
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
