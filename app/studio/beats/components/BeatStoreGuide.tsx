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
        storeTitle: 'From first listen to a licensed release.',
        finderTitle: 'Start with the job your beat needs to do.',
        finderBody: 'Pick the closest direction. We will apply a practical vibe filter, take you to the catalog, and leave BPM, key and length open for fine-tuning.',
        close: 'Close guide',
        start: 'Browse all beats',
        apply: 'Show matching beats',
        selected: 'Selected direction',
        steps: [
            {
                eyebrow: 'Find',
                title: 'Narrow it to your voice.',
                body: 'Pick a genre, then use Filters for tempo, key, vibe and length. Search works on titles, moods and tags.',
            },
            {
                eyebrow: 'Listen',
                title: 'Press play on any row.',
                body: 'The player stays pinned to the bottom while you scroll, and skips to the next beat when one ends. Bookmark up to three beats in your release kit.',
            },
            {
                eyebrow: 'Choose',
                title: 'Pick the license your release needs.',
                body: 'Each tier sets how many streams, sales and videos you can do.',
            },
            {
                eyebrow: 'License',
                title: 'Pay in the official BeatStars checkout.',
                body: 'It opens right here on the page. BeatStars takes the payment and delivers your files and license.',
            },
        ],
        licensesTitle: 'Licenses at a glance',
        licensesNote: 'Full terms are on the licensing page and in the BeatStars checkout.',
        dealTitle: 'Buy 2, get 1 free',
        dealBody: 'Add qualifying beats with the same license. BeatStars applies the discount in its cart.',
        exclusiveTitle: 'Need it exclusive?',
        exclusiveBody: 'Ask about availability first. Exclusive terms are confirmed in writing before you pay.',
        licensingLink: 'Read the licensing terms',
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
                eyebrow: '探す',
                title: '声に合う条件で絞る。',
                body: 'ジャンルを選び、フィルターでテンポ、キー、バイブ、長さを調整します。検索はタイトル、ムード、タグに対応しています。',
            },
            {
                eyebrow: '聴く',
                title: '気になる曲の再生ボタンを押す。',
                body: 'プレーヤーは画面下に固定され、スクロール中も再生が続きます。曲が終わると次のビートへ進みます。最大3曲をリリース候補に保存できます。',
            },
            {
                eyebrow: '選ぶ',
                title: 'リリースに合うライセンスを選ぶ。',
                body: 'ストリーミング数、販売数、ミュージックビデオの本数はライセンスごとに決まっています。',
            },
            {
                eyebrow: '購入',
                title: 'BeatStars公式チェックアウトで支払う。',
                body: 'このページ内で開きます。決済とファイル・ライセンスの受け渡しはBeatStarsが行います。',
            },
        ],
        licensesTitle: 'ライセンス一覧',
        licensesNote: '詳細な条件はライセンスページとBeatStarsのチェックアウトで確認できます。',
        dealTitle: '2曲購入で1曲無料',
        dealBody: '対象曲を同じライセンスで追加してください。割引はBeatStarsのカートで適用されます。',
        exclusiveTitle: '独占ライセンスをご希望ですか？',
        exclusiveBody: 'まず提供状況をお問い合わせください。条件は支払い前に書面で確定します。',
        licensingLink: 'ライセンス条件を読む',
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
                eyebrow: 'Finden',
                title: 'Auf deine Stimme eingrenzen.',
                body: 'Wähle ein Genre und nutze die Filter für Tempo, Tonart, Vibe und Länge. Die Suche findet Titel, Stimmungen und Tags.',
            },
            {
                eyebrow: 'Anhören',
                title: 'Bei jedem Beat auf Play drücken.',
                body: 'Der Player bleibt unten fixiert, während du scrollst, und springt am Ende zum nächsten Beat. Bis zu drei Beats kannst du im Release-Kit merken.',
            },
            {
                eyebrow: 'Wählen',
                title: 'Die Lizenz für deinen Release wählen.',
                body: 'Jede Stufe legt fest, wie viele Streams, Verkäufe und Videos erlaubt sind.',
            },
            {
                eyebrow: 'Lizenzieren',
                title: 'Im offiziellen BeatStars-Checkout bezahlen.',
                body: 'Er öffnet sich direkt auf dieser Seite. BeatStars wickelt die Zahlung ab und liefert Dateien und Lizenz.',
            },
        ],
        licensesTitle: 'Lizenzen im Überblick',
        licensesNote: 'Die vollständigen Bedingungen stehen auf der Lizenzseite und im BeatStars-Checkout.',
        dealTitle: '2 kaufen, 1 gratis',
        dealBody: 'Lege qualifizierte Beats mit derselben Lizenz in den Warenkorb. BeatStars verrechnet den Rabatt dort.',
        exclusiveTitle: 'Exklusiv gewünscht?',
        exclusiveBody: 'Frag zuerst nach der Verfügbarkeit. Exklusive Bedingungen werden vor der Zahlung schriftlich bestätigt.',
        licensingLink: 'Lizenzbedingungen lesen',
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

const stepIcons = [ListFilter, AudioLines, Check, ShoppingBag];
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
    /** License tiers to summarise, already localised by the store. */
    licenses?: Array<{ name: string; price: string; streams: string; features: readonly string[] }>;
    licensingHref?: string;
}

export default function BeatStoreGuide({
    open,
    onClose,
    locale,
    initialMode = 'store',
    onApplyPreset,
    licenses = [],
    licensingHref = '/studio/beats/licensing',
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

    const tabClass = (active: boolean) =>
        `relative min-h-11 px-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
            active ? 'text-white after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-white' : 'text-white/55 hover:text-white'
        }`;

    return createPortal(
        <div
            className="fixed inset-0 z-[190] flex items-stretch justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-6"
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
                className="vgp-pop relative h-[100dvh] w-full max-w-5xl overflow-y-auto bg-[#0a0e12] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[0_30px_80px_rgba(0,0,0,0.6)] outline-none sm:h-auto sm:max-h-[90dvh] sm:rounded-[8px] sm:border sm:border-white/10 sm:p-9"
            >
                <button
                    type="button"
                    onClick={closeGuide}
                    aria-label={text.close}
                    className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-full text-white/55 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-6 sm:top-6"
                >
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>

                <div className="pr-12">
                    <p className="text-sm text-white/55">{text.eyebrow}</p>
                    <h2 id={titleId} className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl">
                        {mode === 'store' ? text.storeTitle : text.finderTitle}
                    </h2>
                </div>

                <div className="sticky top-0 z-10 -mx-5 mt-6 flex gap-7 border-b border-white/10 bg-[#0a0e12] px-5 sm:-mx-9 sm:px-9" role="tablist">
                    <button type="button" role="tab" aria-selected={mode === 'store'} onClick={() => setMode('store')} className={tabClass(mode === 'store')}>
                        {text.storeTab}
                    </button>
                    <button type="button" role="tab" aria-selected={mode === 'finder'} onClick={() => setMode('finder')} className={tabClass(mode === 'finder')}>
                        {text.finderTab}
                    </button>
                </div>

                {mode === 'store' ? (
                    <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
                        <ol className="relative lg:col-span-7">
                            <span className="absolute bottom-3 left-[13px] top-3 w-px bg-white/10" aria-hidden="true" />
                            {text.steps.map((item, index) => {
                                const Icon = stepIcons[index] ?? Check;
                                return (
                                    <li key={item.eyebrow} className="relative grid grid-cols-[1.75rem_1fr] gap-x-5 pb-8 last:pb-0">
                                        <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0a0e12] text-xs font-semibold tabular-nums text-white">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="inline-flex items-center gap-2 text-xs text-sky-300">
                                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                                {item.eyebrow}
                                            </p>
                                            <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white">{item.title}</h3>
                                            <p className="mt-1.5 max-w-xl text-sm leading-6 text-white/65">{item.body}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>

                        <div className="space-y-8 lg:col-span-5">
                            {licenses.length ? (
                                <div>
                                    <h3 className="text-sm font-medium text-white/60">{text.licensesTitle}</h3>
                                    <dl className="mt-3 divide-y divide-white/[0.08] border-y border-white/10">
                                        {licenses.map((license) => (
                                            <div key={license.name} className="flex items-baseline justify-between gap-4 py-3">
                                                <dt className="min-w-0">
                                                    <span className="block text-sm font-semibold text-white">{license.name}</span>
                                                    <span className="block truncate text-xs text-white/50">{[license.features[0], license.streams].filter(Boolean).join(' · ')}</span>
                                                </dt>
                                                <dd className="font-display text-lg font-semibold tabular-nums text-white">{license.price}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                    <p className="mt-3 text-xs leading-5 text-white/50">
                                        {text.licensesNote}{' '}
                                        <a href={licensingHref} className="vgp-link text-white/80">{text.licensingLink}</a>
                                    </p>
                                </div>
                            ) : null}

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{text.dealTitle}</h3>
                                    <p className="mt-1 text-sm leading-6 text-white/60">{text.dealBody}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{text.exclusiveTitle}</h3>
                                    <p className="mt-1 text-sm leading-6 text-white/60">{text.exclusiveBody}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/10 pt-6 lg:col-span-12">
                            <button
                                type="button"
                                onClick={browseCatalog}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-[background-color,transform] duration-200 hover:bg-white/85 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e12]"
                            >
                                {text.start}
                            </button>
                            <button type="button" onClick={() => setMode('finder')} className="vgp-link text-sm font-medium text-white">
                                {text.finderTab}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8">
                        <p className="max-w-2xl text-base leading-7 text-white/65">{text.finderBody}</p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={text.finderTab}>
                            {(Object.keys(text.presets) as BeatFinderPreset[]).map((presetId) => {
                                const item = text.presets[presetId];
                                const Icon = presetIcons[presetId];
                                const isSelected = preset === presetId;
                                return (
                                    <button
                                        key={presetId}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setPreset(presetId)}
                                        className={`flex items-start gap-4 rounded-[6px] border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:p-5 ${
                                            isSelected ? 'border-white/60 bg-white/[0.05]' : 'border-white/10 hover:border-white/30'
                                        }`}
                                    >
                                        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isSelected ? 'text-sky-300' : 'text-white/50'}`} aria-hidden="true" />
                                        <span>
                                            <span className="block text-base font-semibold text-white">{item.title}</span>
                                            <span className="mt-1 block text-sm leading-6 text-white/60">{item.description}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-white/10 pt-6">
                            <button
                                type="button"
                                onClick={applyPreset}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-[background-color,transform] duration-200 hover:bg-white/85 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e12]"
                            >
                                {text.apply}
                            </button>
                            <p className="text-sm text-white/55">
                                {text.selected}: <span className="text-white">{text.presets[preset].title}</span>
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>,
        document.body,
    );
}
