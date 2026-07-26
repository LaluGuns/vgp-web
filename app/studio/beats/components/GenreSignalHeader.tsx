'use client';

import Image from 'next/image';
import { m, useReducedMotion } from 'framer-motion';
import { ArrowDown, CircleHelp, ShieldCheck, ShoppingBag } from 'lucide-react';
import { getGenreTheme } from '@/lib/genre-theme';

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
    totalCount: number;
    bpmRange: string;
    bpmMidpoint: number;
    checkoutCount: number;
    onGuideOpen: () => void;
    onCheckoutOpen: () => void;
}

export default function GenreSignalHeader({
    locale,
    genreLabel,
    isAllGenres,
    resultCount,
    totalCount,
    bpmRange,
    bpmMidpoint,
    checkoutCount,
    onGuideOpen,
    onCheckoutOpen,
}: GenreSignalHeaderProps) {
    const text = copy[locale];
    const theme = getGenreTheme(genreLabel);
    const reduceMotion = useReducedMotion();

    return (
        <header className={`relative overflow-hidden border-b border-white/[0.08] ${theme.world}`}>
            <div className="relative mx-auto grid max-w-6xl gap-7 px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-16 lg:pt-10">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-white/55">{text.eyebrow}</p>
                    <h1 className="mt-3 max-w-3xl font-display text-[2.65rem] font-semibold leading-[0.96] tracking-[-0.045em] text-white sm:mt-4 sm:text-6xl">
                        {isAllGenres ? text.allTitle : text.genreTitle(genreLabel)}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-white/64 sm:mt-5 sm:text-base sm:leading-7">
                        {isAllGenres ? text.allDescription : text.genreDescription(genreLabel)}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                        <button
                            type="button"
                            onClick={() => document.getElementById('beats-inventory')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-slate-950 transition hover:bg-sky-100"
                        >
                            {text.browse}
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={onGuideOpen}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/16 bg-white/[0.04] px-4 text-xs font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
                        >
                            <CircleHelp className="h-4 w-4" aria-hidden="true" />
                            {text.guide}
                        </button>
                        <button
                            type="button"
                            onClick={onCheckoutOpen}
                            disabled={checkoutCount === 0}
                            className={`col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1 ${theme.surface}`}
                        >
                            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                            {checkoutCount ? `${text.checkout} · ${checkoutCount}` : text.chooseBeat}
                        </button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-white/52 sm:flex sm:flex-wrap sm:gap-x-6 sm:pt-5">
                        <span><strong className="font-mono text-white">{resultCount}</strong> {text.tracks}</span>
                        <span><strong className="font-mono text-white">{bpmRange}</strong> BPM</span>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{text.metadata}</span>
                        <span>{text.onsite}</span>
                    </div>
                </div>

                <div className={`relative overflow-hidden rounded-3xl border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5 ${theme.surface}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/48">{text.catalogView}</p>
                            <p className="mt-1 text-sm font-semibold text-white">{genreLabel}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 font-mono text-[10px] text-white/55">{resultCount} / {totalCount}</span>
                    </div>
                    <div className="mt-4 grid items-center gap-4 sm:grid-cols-[0.82fr_1.18fr]">
                        <m.div
                            key={genreLabel}
                            className="relative mx-auto h-36 w-full max-w-[230px] sm:h-44"
                            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Image
                                src="/branding/logo-original.png"
                                alt="Virzy Guns Production"
                                fill
                                sizes="(max-width: 640px) 230px, 200px"
                                className="object-contain drop-shadow-[0_0_24px_rgba(125,211,252,0.2)]"
                            />
                        </m.div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">{text.matches}</p>
                                <p className="mt-1 font-mono text-xl font-semibold text-white">{resultCount}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">{text.tempoPulse}</p>
                                <p className="mt-1 font-mono text-sm font-semibold text-white">{bpmRange}</p>
                            </div>
                            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/15 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/38">{text.genre}</p>
                                    <span className="font-mono text-[10px] text-white/45">{Math.round(bpmMidpoint)} BPM</span>
                                </div>
                                <p className="mt-1 truncate text-sm font-semibold text-white">{genreLabel}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
