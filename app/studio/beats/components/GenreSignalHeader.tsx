'use client';

import { useReducedMotion } from 'framer-motion';
import { ArrowDown, ShieldCheck, ShoppingBag } from 'lucide-react';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

const copy = {
    'en-US': {
        eyebrow: 'Virzy Guns Production / Beat Store',
        allTitle: 'Find the signal for your next record.',
        genreTitle: (genre: string) => `${genre}, tuned to your next release.`,
        allDescription: 'Filter by the way you write: tempo, key, vibe and song length. Preview every beat, build a release kit, then license through BeatStars without leaving this page.',
        genreDescription: (genre: string) => `Enter the ${genre} world, narrow the pocket for your vocal, and compare BeatStars track data before you license.`,
        guide: 'How the store works',
        checkout: 'Open checkout',
        chooseBeat: 'Choose a beat first',
        browse: 'Browse the catalog',
        tracks: 'matching tracks',
        metadata: 'BeatStars track data',
        onsite: 'onsite BeatStars checkout',
        signal: 'Signal map generated from the active genre, result count and BPM range.',
        catalogView: 'Catalog view',
        genre: 'Genre',
        matches: 'Matches',
        tempoPulse: 'Tempo',
    },
    'ja-JP': {
        eyebrow: 'Virzy Guns Production / ビートストア',
        allTitle: '次の曲に必要なシグナルを見つける。',
        genreTitle: (genre: string) => `${genre}から、次のリリースへ。`,
        allDescription: 'テンポ、キー、バイブ、曲の長さで絞り込み。全曲を試聴し、候補を作り、このページを離れずBeatStars公式ライセンスを購入できます。',
        genreDescription: (genre: string) => `${genre}の世界から声に合うポケットを絞り込み、BeatStarsのトラックデータを比較してライセンスを選べます。`,
        guide: 'ストアの使い方',
        checkout: 'チェックアウトを開く',
        chooseBeat: '先にビートを選ぶ',
        browse: 'カタログを見る',
        tracks: '該当トラック',
        metadata: 'BeatStarsのトラックデータ',
        onsite: 'サイト内BeatStars決済',
        signal: '選択中のジャンル、結果数、BPM範囲から生成したシグナルマップ。',
        catalogView: 'カタログ表示',
        genre: 'ジャンル',
        matches: '該当曲数',
        tempoPulse: 'テンポ',
    },
    'de-DE': {
        eyebrow: 'Virzy Guns Production / Beat Store',
        allTitle: 'Finde das Signal für deinen nächsten Record.',
        genreTitle: (genre: string) => `${genre}, abgestimmt auf deinen nächsten Release.`,
        allDescription: 'Filtere so, wie du schreibst: Tempo, Tonart, Vibe und Songlänge. Hör jeden Beat an, baue dein Release-Kit und lizenziere über BeatStars, ohne die Seite zu verlassen.',
        genreDescription: (genre: string) => `Tauche in ${genre} ein, finde den richtigen Pocket für deine Stimme und vergleiche BeatStars-Trackdaten vor der Lizenzierung.`,
        guide: 'So funktioniert der Store',
        checkout: 'Checkout öffnen',
        chooseBeat: 'Zuerst Beat wählen',
        browse: 'Katalog durchsuchen',
        tracks: 'passende Tracks',
        metadata: 'BeatStars-Trackdaten',
        onsite: 'BeatStars-Checkout auf der Seite',
        signal: 'Signal-Map aus aktivem Genre, Trefferzahl und BPM-Bereich.',
        catalogView: 'Katalogansicht',
        genre: 'Genre',
        matches: 'Treffer',
        tempoPulse: 'Tempo',
    },
} as const;

interface GenreSignalHeaderProps {
    locale: BeatLocale;
    genreLabel: string;
    isAllGenres: boolean;
    resultCount: number;
    bpmRange: string;
    checkoutCount: number;
    onGuideOpen: () => void;
    onCheckoutOpen: () => void;
}

export default function GenreSignalHeader({
    locale,
    genreLabel,
    isAllGenres,
    resultCount,
    bpmRange,
    checkoutCount,
    onGuideOpen,
    onCheckoutOpen,
}: GenreSignalHeaderProps) {
    const text = copy[locale];
    const reduceMotion = useReducedMotion();

    return (
        <header data-enter="" className="relative border-b border-white/10 px-4 sm:px-6">
            <div className="relative mx-auto max-w-7xl pb-12 pt-6 sm:pb-16 sm:pt-8 lg:pb-20 lg:pt-10">
                <p className="text-sm text-white/55">{text.eyebrow}</p>
                <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white">
                    {isAllGenres ? text.allTitle : text.genreTitle(genreLabel)}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                    {isAllGenres ? text.allDescription : text.genreDescription(genreLabel)}
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <button
                        type="button"
                        onClick={() => document.getElementById('beats-inventory')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}
                        className="group/button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-[background-color,transform] duration-200 hover:bg-white/85 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
                    >
                        {text.browse}
                        <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-y-0.5" aria-hidden="true" />
                    </button>
                    {checkoutCount ? (
                        <button
                            type="button"
                            onClick={onCheckoutOpen}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                            {`${text.checkout} · ${checkoutCount}`}
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={onGuideOpen}
                        className="vgp-link text-sm font-medium text-white focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        {text.guide}
                    </button>
                </div>

                <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
                    <div>
                        <dt className="text-xs text-white/50">{text.tracks}</dt>
                        <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">{resultCount}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-white/50">BPM</dt>
                        <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">{bpmRange}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-white/50">{text.genre}</dt>
                        <dd className="mt-1 truncate font-display text-2xl font-semibold text-white">{genreLabel}</dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1.5 text-xs text-white/50">
                            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            {text.metadata}
                        </dt>
                        <dd className="mt-1 text-sm text-white/75">{text.onsite}</dd>
                    </div>
                </dl>
            </div>
        </header>
    );
}
