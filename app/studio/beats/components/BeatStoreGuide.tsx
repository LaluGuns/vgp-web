'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import {
    AudioLines,
    Check,
    Disc3,
    ListFilter,
    MoonStar,
    ShoppingBag,
    Sparkles,
    X,
    Zap,
} from 'lucide-react';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';
export type BeatFinderPreset = 'aggressive' | 'melodic' | 'club' | 'chill';
export type BeatGuideMode = 'store' | 'finder';

const copy = {
    'en-US': {
        eyebrow: 'Virzy Guns beat store guide',
        storeTab: 'How the store works',
        finderTab: 'Beat finder',
        storeTitle: 'From first listen to licensed files.',
        finderTitle: 'Start with the job your beat needs to do.',
        finderBody: 'Pick the closest direction. We will apply a practical vibe filter, take you to the catalog, and leave BPM, key and length open for fine-tuning.',
        close: 'Close guide',
        start: 'Browse all beats',
        apply: 'Show matching beats',
        selected: 'Selected direction',
        steps: [
            {
                eyebrow: '01 / Shape the search',
                title: 'Filter around the vocal.',
                body: 'Use genre, BPM, key, vibe and duration to find the pocket that fits your writing pace.',
            },
            {
                eyebrow: '02 / Audition and compare',
                title: 'Save only the beats that create ideas.',
                body: 'Preview directly from every card, inspect official track data, and keep up to three finalists in a release kit.',
            },
            {
                eyebrow: '03 / License securely',
                title: 'Checkout through the official BeatStars player.',
                body: 'Choose the exact track, review its current license options, add it to cart and pay without leaving this page.',
            },
        ],
        presets: {
            aggressive: {
                title: 'Dark & aggressive',
                description: 'Hard drums, pressure and space for sharp bars or an urgent hook.',
                cue: 'Best starting filter: Aggressive',
            },
            melodic: {
                title: 'Melodic & cinematic',
                description: 'Synth color, emotional movement and room for a memorable topline.',
                cue: 'Best starting filter: Melodic',
            },
            club: {
                title: 'Club & high-energy',
                description: 'Forward motion, dance-floor rhythm and a structure built for lift and drop.',
                cue: 'Best starting filter: Club',
            },
            chill: {
                title: 'Chill & intimate',
                description: 'Softer texture, more negative space and a pocket for understated vocals.',
                cue: 'Best starting filter: Chill',
            },
        },
    },
    'ja-JP': {
        eyebrow: 'Virzy Guns ビートストアガイド',
        storeTab: 'ストアの使い方',
        finderTab: 'ビート検索',
        storeTitle: '試聴からライセンス取得まで。',
        finderTitle: 'ビートに求める役割から選ぶ。',
        finderBody: '近い方向性を選ぶと、実用的なバイブフィルターを適用してカタログへ移動します。BPM、キー、長さはその後さらに調整できます。',
        close: 'ガイドを閉じる',
        start: '全ビートを見る',
        apply: '該当ビートを表示',
        selected: '選択中の方向性',
        steps: [
            {
                eyebrow: '01 / 検索を整える',
                title: 'ボーカルに合う条件で絞る。',
                body: 'ジャンル、BPM、キー、バイブ、長さから、作詞テンポと声に合うポケットを探します。',
            },
            {
                eyebrow: '02 / 試聴して比較',
                title: 'アイデアが生まれるビートだけを残す。',
                body: '各カードで試聴し、公式データを確認。最大3曲をリリース候補として比較できます。',
            },
            {
                eyebrow: '03 / 安全にライセンス取得',
                title: 'BeatStars公式プレーヤーで決済。',
                body: '正しい曲の最新ライセンスを確認し、ページを離れずカート追加と決済を行えます。',
            },
        ],
        presets: {
            aggressive: {
                title: 'ダーク＆アグレッシブ',
                description: '強いドラムと圧力感。鋭いバースや緊迫したフックに向く方向性。',
                cue: '開始フィルター：Aggressive',
            },
            melodic: {
                title: 'メロディック＆シネマティック',
                description: 'シンセの色彩と感情的な展開。印象的なトップラインを置きやすい方向性。',
                cue: '開始フィルター：Melodic',
            },
            club: {
                title: 'クラブ＆ハイエナジー',
                description: '前へ進むリズムと、ビルドアップからドロップへ向かう構成。',
                cue: '開始フィルター：Club',
            },
            chill: {
                title: 'チル＆インティメート',
                description: '柔らかな質感と広い余白。抑えたボーカルを置きやすい方向性。',
                cue: '開始フィルター：Chill',
            },
        },
    },
    'de-DE': {
        eyebrow: 'Virzy Guns Beat-Store-Guide',
        storeTab: 'So funktioniert der Store',
        finderTab: 'Beat-Finder',
        storeTitle: 'Vom ersten Anhören bis zu den lizenzierten Dateien.',
        finderTitle: 'Starte mit der Aufgabe, die der Beat erfüllen soll.',
        finderBody: 'Wähle die passendste Richtung. Wir setzen einen praktischen Vibe-Filter, springen zum Katalog und lassen BPM, Tonart und Länge zur Feinabstimmung offen.',
        close: 'Guide schließen',
        start: 'Alle Beats durchsuchen',
        apply: 'Passende Beats anzeigen',
        selected: 'Gewählte Richtung',
        steps: [
            {
                eyebrow: '01 / Suche formen',
                title: 'Rund um die Vocal filtern.',
                body: 'Genre, BPM, Tonart, Vibe und Länge helfen, den passenden Pocket für dein Schreibtempo zu finden.',
            },
            {
                eyebrow: '02 / Anhören und vergleichen',
                title: 'Nur Beats speichern, die sofort Ideen auslösen.',
                body: 'Direkt auf jeder Karte anhören, offizielle Trackdaten prüfen und bis zu drei Favoriten im Release-Kit vergleichen.',
            },
            {
                eyebrow: '03 / Sicher lizenzieren',
                title: 'Checkout im offiziellen BeatStars-Player.',
                body: 'Den exakten Track öffnen, aktuelle Lizenzoptionen prüfen, in den Warenkorb legen und auf dieser Seite bezahlen.',
            },
        ],
        presets: {
            aggressive: {
                title: 'Dunkel & aggressiv',
                description: 'Harte Drums, Druck und Raum für präzise Bars oder eine dringliche Hook.',
                cue: 'Startfilter: Aggressive',
            },
            melodic: {
                title: 'Melodisch & filmisch',
                description: 'Synth-Farbe, emotionale Bewegung und Platz für eine einprägsame Topline.',
                cue: 'Startfilter: Melodic',
            },
            club: {
                title: 'Club & energiegeladen',
                description: 'Vorwärtsdrang, Dancefloor-Rhythmus und eine Form für Aufbau und Drop.',
                cue: 'Startfilter: Club',
            },
            chill: {
                title: 'Chill & intim',
                description: 'Weiche Texturen, mehr Freiraum und ein Pocket für zurückhaltende Vocals.',
                cue: 'Startfilter: Chill',
            },
        },
    },
} as const;

const stepIcons = [ListFilter, AudioLines, ShoppingBag];
const presetIcons = {
    aggressive: Zap,
    melodic: Sparkles,
    club: Disc3,
    chill: MoonStar,
} as const;

interface BeatStoreGuideProps {
    open: boolean;
    onClose: () => void;
    locale: BeatLocale;
    initialMode?: BeatGuideMode;
    onApplyPreset?: (preset: BeatFinderPreset) => void;
}

export default function BeatStoreGuide({
    open,
    onClose,
    locale,
    initialMode = 'store',
    onApplyPreset,
}: BeatStoreGuideProps) {
    const text = copy[locale];
    const [mode, setMode] = useState<BeatGuideMode>(initialMode);
    const [preset, setPreset] = useState<BeatFinderPreset>('aggressive');
    const reduceMotion = useReducedMotion();
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);

    const closeGuide = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const previousOverflow = document.body.style.overflow;
        const previousFocus = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        window.requestAnimationFrame(() => dialogRef.current?.focus());

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeGuide();
            if (event.key !== 'Tab' || !dialogRef.current) return;

            const focusableElements = Array.from(
                dialogRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ),
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (!firstElement || !lastElement) return;

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus();
        };
    }, [closeGuide, open]);

    const browseCatalog = () => {
        closeGuide();
        window.requestAnimationFrame(() => {
            document.getElementById('beats-inventory')?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
            });
        });
    };

    const applyPreset = () => {
        onApplyPreset?.(preset);
        browseCatalog();
    };

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[190] flex items-stretch justify-center bg-[#01060b]/82 sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeGuide();
            }}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative h-[100dvh] w-full max-w-4xl overflow-y-auto bg-[#04131d] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-[0_40px_120px_rgba(0,0,0,0.65)] outline-none sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl sm:border sm:border-sky-200/20 sm:p-7"
            >
                        <button
                            type="button"
                            onClick={closeGuide}
                            aria-label={text.close}
                            className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/20 text-white/55 transition hover:border-white/25 hover:text-white"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <div className="pr-12">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/70">{text.eyebrow}</p>
                            <h2 id={titleId} className="mt-2 max-w-3xl font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                                {mode === 'store' ? text.storeTitle : text.finderTitle}
                            </h2>
                        </div>

                        <div className="sticky top-0 z-10 mt-5 grid grid-cols-2 rounded-xl border border-white/10 bg-[#04131d] p-1 sm:mt-6" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === 'store'}
                                onClick={() => setMode('store')}
                                className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition ${
                                    mode === 'store' ? 'bg-sky-200 text-slate-950' : 'text-white/55 hover:text-white'
                                }`}
                            >
                                {text.storeTab}
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={mode === 'finder'}
                                onClick={() => setMode('finder')}
                                className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition ${
                                    mode === 'finder' ? 'bg-sky-200 text-slate-950' : 'text-white/55 hover:text-white'
                                }`}
                            >
                                {text.finderTab}
                            </button>
                        </div>

                        {mode === 'store' ? (
                            <div className="mt-6">
                                <div className="grid gap-2.5 md:grid-cols-3 md:gap-3">
                                    {text.steps.map((item, index) => {
                                        const Icon = stepIcons[index];
                                        return (
                                            <article key={item.eyebrow} className="grid grid-cols-[2.5rem_1fr] gap-x-3 rounded-xl border border-white/10 bg-black/20 p-4 md:block md:rounded-2xl md:p-5">
                                                <span className="row-span-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200/20 bg-sky-300/[0.08] text-sky-200 md:h-11 md:w-11">
                                                    <Icon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                                                </span>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-200/65 md:mt-5 md:text-[10px] md:tracking-[0.18em]">{item.eyebrow}</p>
                                                <h3 className="mt-1 text-sm font-semibold leading-snug text-white md:mt-2 md:text-base">{item.title}</h3>
                                                <p className="mt-1.5 text-xs leading-5 text-white/58 md:mt-3">{item.body}</p>
                                            </article>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={browseCatalog}
                                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-200 px-5 text-xs font-semibold text-slate-950 transition hover:bg-sky-100 sm:w-auto"
                                >
                                    {text.start}
                                    <Check className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <p className="max-w-3xl text-sm leading-6 text-white/62">{text.finderBody}</p>
                                <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">
                                    {(Object.keys(text.presets) as BeatFinderPreset[]).map((presetId) => {
                                        const item = text.presets[presetId];
                                        const Icon = presetIcons[presetId];
                                        const isSelected = preset === presetId;
                                        return (
                                            <button
                                                key={presetId}
                                                type="button"
                                                aria-pressed={isSelected}
                                                onClick={() => setPreset(presetId)}
                                                className={`group rounded-xl border p-3 text-left transition sm:rounded-2xl sm:p-4 ${
                                                    isSelected
                                                        ? 'border-sky-200/55 bg-sky-300/[0.1] shadow-[0_16px_45px_rgba(14,165,233,0.12)]'
                                                        : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/[0.04]'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                                                        isSelected ? 'border-sky-200/35 bg-sky-200 text-slate-950' : 'border-white/10 bg-white/[0.04] text-white/65'
                                                    }`}>
                                                        <Icon className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                    <span>
                                                        <span className="block text-sm font-semibold text-white">{item.title}</span>
                                                        <span className="mt-1 block text-xs leading-5 text-white/55">{item.description}</span>
                                                        <span className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-200/65">{item.cue}</span>
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-white/55">
                                        {text.selected}: <strong className="text-white">{text.presets[preset].title}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        onClick={applyPreset}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-200 px-5 text-xs font-semibold text-slate-950 transition hover:bg-sky-100"
                                    >
                                        {text.apply}
                                        <ListFilter className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        )}
            </section>
        </div>,
        document.body,
    );
}
