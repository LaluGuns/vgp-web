'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Gift, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import {
    beatStarsBlazePlayerUrl,
    beatStarsStoreUrl,
    getBeatStarsBlazeTrackUrl,
} from '@/lib/beatstars';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

const copy = {
    'en-US': {
        eyebrow: 'Secure checkout by BeatStars',
        title: 'Choose the license for your track.',
        description: 'Review the current license options, add the beat to cart and pay securely without leaving this page. BeatStars handles payment and file delivery.',
        catalogDescription: 'Browse the official Virzy Guns catalog and choose the track you want to license.',
        selected: 'Release kit',
        empty: 'No beat selected yet. Search the catalog inside the player or close this window and build a release kit first.',
        dealTitle: 'Buy 2, get 1 free',
        dealText: 'Add every qualifying beat with the same eligible license before checkout. BeatStars applies and confirms the discount in its cart.',
        close: 'Close checkout',
        external: 'Open BeatStars in a new tab',
        loading: 'Loading secure BeatStars checkout',
        footer: 'Official BeatStars cart, payment and file delivery',
    },
    'ja-JP': {
        eyebrow: 'BeatStars公式チェックアウト',
        title: 'このビートのライセンスを選択',
        description: '最新のライセンス条件を確認し、このページを離れずにカート追加と安全な決済まで進めます。決済とファイル配信はBeatStarsが行います。',
        catalogDescription: 'Virzy Guns公式カタログからライセンスする曲を選んでください。',
        selected: 'リリース候補',
        empty: 'まだ曲が選択されていません。プレイヤー内で検索するか、この画面を閉じて候補を作成してください。',
        dealTitle: '2曲購入で1曲無料',
        dealText: '対象曲を同じ対象ライセンスでカートに追加してください。割引条件と適用結果はBeatStarsのカートで確認されます。',
        close: 'チェックアウトを閉じる',
        external: 'BeatStarsを新しいタブで開く',
        loading: 'BeatStarsの安全なチェックアウトを読み込み中',
        footer: 'BeatStars公式カート、決済、ファイル配信',
    },
    'de-DE': {
        eyebrow: 'Sicherer Checkout mit BeatStars',
        title: 'Lizenz für diesen Beat wählen.',
        description: 'Prüfe die aktuellen Lizenzoptionen, lege den Beat in den Warenkorb und bezahle sicher, ohne diese Seite zu verlassen. BeatStars übernimmt Zahlung und Dateiversand.',
        catalogDescription: 'Wähle im offiziellen Virzy Guns Katalog den Track aus, den du lizenzieren möchtest.',
        selected: 'Release-Kit',
        empty: 'Noch kein Beat ausgewählt. Suche im Player oder schließe dieses Fenster und stelle zuerst dein Release-Kit zusammen.',
        dealTitle: '2 kaufen, 1 gratis',
        dealText: 'Lege alle qualifizierten Beats mit derselben berechtigten Lizenz vor dem Checkout in den Warenkorb. BeatStars bestätigt und verrechnet den Rabatt im Warenkorb.',
        close: 'Checkout schließen',
        external: 'BeatStars in neuem Tab öffnen',
        loading: 'Sicheren BeatStars-Checkout laden',
        footer: 'Offizieller BeatStars-Warenkorb, Zahlung und Dateizustellung',
    },
} as const;

interface BeatStarsCheckoutModalProps {
    open: boolean;
    onClose: () => void;
    locale: BeatLocale;
    beatSelections?: Array<{
        trackId: string;
        title: string;
        productUrl: string;
    }>;
}

export default function BeatStarsCheckoutModal({
    open,
    onClose,
    locale,
    beatSelections = [],
}: BeatStarsCheckoutModalProps) {
    const text = copy[locale];
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const [activeTrackId, setActiveTrackId] = useState('');
    const activeSelection = beatSelections.find((beat) => beat.trackId === activeTrackId) || beatSelections[0];

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
            ));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.requestAnimationFrame(() => closeButtonRef.current?.focus());

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            returnFocusRef.current?.focus();
        };
    }, [onClose, open]);

    if (!open) return null;

    return createPortal(
                <div
                    className="fixed inset-0 z-[200] flex items-stretch justify-center bg-[#01060b]/82 sm:items-center sm:p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) onClose();
                    }}
                >
                    <section
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={descriptionId}
                        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#031019] shadow-[0_45px_140px_rgba(0,0,0,0.7)] outline-none sm:h-[min(92dvh,900px)] sm:max-w-6xl sm:rounded-3xl sm:border sm:border-sky-200/20"
                    >
                        <header className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-[#071923] px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:py-4">
                            <div className="min-w-0 pr-11">
                                <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                    {text.eyebrow}
                                </p>
                                <h2 id={titleId} className="mt-1.5 truncate font-display text-lg font-semibold leading-tight text-white sm:text-2xl">
                                    {activeSelection?.title || text.title}
                                </h2>
                                <p id={descriptionId} className="mt-1 hidden max-w-3xl text-xs leading-5 text-white/55 sm:block">
                                    {beatSelections.length ? text.description : text.catalogDescription}
                                </p>
                            </div>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={onClose}
                                aria-label={text.close}
                                className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/70 transition hover:border-white/30 hover:text-white sm:static"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </header>

                        <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-white/10 bg-black/20 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[10px] font-semibold text-violet-100">
                                <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                                {text.dealTitle}
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sky-200/15 bg-sky-300/[0.06] px-3 py-1.5 text-[10px] font-semibold text-sky-100">
                                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                {text.selected} · {beatSelections.length}
                            </span>
                            <span className="hidden truncate text-[10px] text-white/42 md:block">{text.dealText}</span>
                        </div>

                        <div className="relative min-h-0 flex-1 bg-[#02070d]">
                            {activeSelection ? (
                                <div className="flex h-full min-h-0 flex-col p-2 sm:p-3">
                                    {beatSelections.length > 1 ? (
                                        <div className="mb-2 flex shrink-0 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={text.selected}>
                                            {beatSelections.map((beat) => {
                                                const isActive = beat.trackId === activeSelection.trackId;
                                                return (
                                                    <button
                                                        key={beat.trackId}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={isActive}
                                                        onClick={() => setActiveTrackId(beat.trackId)}
                                                        className={`min-h-9 max-w-64 shrink-0 truncate rounded-lg border px-3 text-xs font-semibold transition ${
                                                            isActive
                                                                ? 'border-sky-200/45 bg-sky-300/[0.1] text-white'
                                                                : 'border-white/10 bg-white/[0.025] text-white/50 hover:text-white'
                                                        }`}
                                                    >
                                                        {beat.title}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-black">
                                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-3 py-2">
                                            <p className="truncate text-xs font-semibold text-white">{activeSelection.title}</p>
                                            <span className="shrink-0 font-mono text-[10px] text-white/38">#{activeSelection.trackId}</span>
                                        </div>
                                        <iframe
                                            key={activeSelection.trackId}
                                            src={getBeatStarsBlazeTrackUrl(activeSelection.trackId, activeSelection.title)}
                                            title={`${activeSelection.title} — ${text.eyebrow}`}
                                            className="block min-h-0 flex-1 w-full border-0"
                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; payment"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                        />
                                    </section>
                                </div>
                            ) : (
                                <iframe
                                    src={beatStarsBlazePlayerUrl}
                                    title={`${text.eyebrow}: Virzy Guns`}
                                    className="block h-full w-full border-0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; payment"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                />
                            )}
                        </div>

                        <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 bg-[#04131d] px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:py-2.5">
                            <p className="hidden text-[11px] text-white/42 sm:block">{text.footer}</p>
                            <a
                                href={activeSelection?.productUrl || beatStarsStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/12 px-3 text-xs font-semibold text-white/65 transition hover:border-sky-200/35 hover:text-white"
                            >
                                {text.external}
                                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </footer>
                    </section>
                </div>,
        document.body,
    );
}
