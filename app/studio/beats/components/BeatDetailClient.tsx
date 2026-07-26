'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Check, ExternalLink, Mail, Instagram } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell } from '@/components/editorial/EditorialPrimitives';
import { revealUp } from '@/lib/motion-presets';
import { BeatProduct, getBeatsByCategory } from '@/lib/catalog';
import { trackBeatEvent } from '@/lib/analytics';
import { getBeatSummary } from '@/lib/seo/beat-copy';
import { getFounderGmailComposeUrl } from '@/lib/founder-contact';
import BeatStarsAudioPlayer from './BeatStarsAudioPlayer';

interface BeatDetailClientProps {
    beat: BeatProduct;
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const instagramDmUrl = 'https://ig.me/m/virzyguns';

const detailCopy = {
    'en-US': {
        home: 'Home', beats: 'Beats', officialRelease: 'Official release', previewUnavailable: 'Preview unavailable. Use the official BeatStars link below.',
        producer: 'Producer', powered: 'Preview via BeatStars', ready: 'Ready to license', selectTier: 'Choose a license tier',
        includes: (name: string) => `Included with ${name}`, formats: 'Formats', streams: 'Streams', sales: 'Sales', stems: 'Stems',
        stemsIncluded: 'Included', stemsNotIncluded: 'Not included', checkout: (name: string, price: string) => `License ${name} — ${price}`,
        exclusiveEyebrow: 'Exclusive license inquiry', exclusiveText: 'Ask about current availability and terms for an exclusive license. Details are confirmed directly in writing before purchase.',
        instagram: 'Instagram DM (@virzyguns)', email: 'Email founder', sound: 'Sound character', tags: 'Tags', credit: 'Credit line',
        licensing: 'License summary', selected: 'Selected license', formatsIncluded: 'Included formats', officialCheckout: 'Official checkout',
        officialCheckoutDetail: 'Complete purchase on the official Virzy Guns BeatStars product page.', related: (genre: string) => `More ${genre} beats`, relatedCta: 'Preview & license',
        emailSubject: (title: string) => `Exclusive license inquiry — ${title}`,
        emailBody: (title: string) => `Hi Virzy Guns,\n\nI would like to ask about an exclusive license for ${title}.\n\nProject details:`,
    },
    'ja-JP': {
        home: 'ホーム', beats: 'ビート', officialRelease: '公式リリース', previewUnavailable: 'プレビューを再生できません。下のBeatStars公式リンクをご利用ください。',
        producer: 'プロデューサー', powered: 'BeatStars提供のプレビュー', ready: 'ライセンス購入可能', selectTier: 'ライセンスを選ぶ',
        includes: (name: string) => `${name}に含まれる内容`, formats: 'ファイル形式', streams: 'ストリーミング', sales: '販売数', stems: 'ステム',
        stemsIncluded: '含まれます', stemsNotIncluded: '含まれません', checkout: (name: string, price: string) => `${name}をライセンス — ${price}`,
        exclusiveEyebrow: '独占ライセンスのお問い合わせ', exclusiveText: '独占ライセンスの現在の提供状況と条件についてお問い合わせください。購入前に詳細を書面で直接ご案内します。',
        instagram: 'Instagram DM (@virzyguns)', email: 'メールで問い合わせ', sound: 'サウンドの特徴', tags: 'タグ', credit: 'クレジット表記',
        licensing: 'ライセンス概要', selected: '選択したライセンス', formatsIncluded: '含まれるファイル形式', officialCheckout: '公式決済',
        officialCheckoutDetail: 'Virzy GunsのBeatStars公式商品ページで購入手続きを完了します。', related: (genre: string) => `関連する${genre}ビート`, relatedCta: '試聴してライセンスを選ぶ',
        emailSubject: (title: string) => `独占ライセンスのお問い合わせ — ${title}`,
        emailBody: (title: string) => `Virzy Guns様\n\n${title}の独占ライセンスについて伺いたいです。\n\nプロジェクトの詳細:`,
    },
    'de-DE': {
        home: 'Startseite', beats: 'Beats', officialRelease: 'Offizieller Release', previewUnavailable: 'Vorschau nicht verfügbar. Bitte nutze unten den offiziellen BeatStars-Link.',
        producer: 'Produzent', powered: 'Vorschau via BeatStars', ready: 'Lizenz verfügbar', selectTier: 'Lizenz auswählen',
        includes: (name: string) => `Enthalten in ${name}`, formats: 'Dateiformate', streams: 'Streams', sales: 'Verkäufe', stems: 'Stems',
        stemsIncluded: 'Enthalten', stemsNotIncluded: 'Nicht enthalten', checkout: (name: string, price: string) => `${name} lizenzieren — ${price}`,
        exclusiveEyebrow: 'Anfrage zu einer Exklusivlizenz', exclusiveText: 'Frag nach aktueller Verfügbarkeit und den Bedingungen einer Exklusivlizenz. Alle Details werden vor dem Kauf direkt schriftlich bestätigt.',
        instagram: 'Instagram-DM (@virzyguns)', email: 'E-Mail an den Founder', sound: 'Sound-Charakter', tags: 'Tags', credit: 'Credit-Zeile',
        licensing: 'Lizenzübersicht', selected: 'Gewählte Lizenz', formatsIncluded: 'Enthaltene Dateiformate', officialCheckout: 'Offizieller Checkout',
        officialCheckoutDetail: 'Der Kauf wird auf der offiziellen Virzy Guns Produktseite bei BeatStars abgeschlossen.', related: (genre: string) => `Mehr ${genre}-Beats`, relatedCta: 'Anhören & lizenzieren',
        emailSubject: (title: string) => `Anfrage zu einer Exklusivlizenz — ${title}`,
        emailBody: (title: string) => `Hallo Virzy Guns,\n\nich möchte mich nach einer Exklusivlizenz für ${title} erkundigen.\n\nProjektdetails:`,
    },
} as const;

export default function BeatDetailClient({ beat, locale = 'en-US' }: BeatDetailClientProps) {
    const text = detailCopy[locale];
    const [selectedLicense, setSelectedLicense] = useState(beat.licenses[0] || beat.licenses[1]);
    const relatedBeats = getBeatsByCategory(beat.primaryGenre.toLowerCase().replace(/ /g, '-'))
        .filter((b) => b.id !== beat.id)
        .slice(0, 3);

    const description = getBeatSummary(beat, locale);

    const handleCheckoutClick = (licenseName: string, price: string) => {
        trackBeatEvent('beatstars_checkout_click', {
            beatId: beat.id,
            beatSlug: beat.slug,
            beatTitle: beat.title,
            licenseName,
            displayedPrice: price,
            destinationUrl: beat.beatstarsProductUrl,
        });
    };

    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    const playerTitle = locale === 'ja-JP' ? '公式ビートプレビュー' : locale === 'de-DE' ? 'Offizielle Beat-Vorschau' : 'Official beat preview';
    const playerSub = locale === 'ja-JP' ? 'BeatStars公式プレーヤー' : locale === 'de-DE' ? 'BeatStars Original-Player' : 'Preview via BeatStars';

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
                {/* Language Selector & Breadcrumbs */}
                <div className="mx-auto max-w-5xl px-6 mb-8 flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <Link href={getLocalePath('/')} className="hover:text-white transition">{text.home}</Link>
                        <span>/</span>
                        <Link href={getLocalePath('/studio/beats')} className="hover:text-white transition">{text.beats}</Link>
                        <span>/</span>
                        <span className="text-sky-200/80">{beat.title}</span>
                    </nav>

                    <div className="flex items-center gap-2 text-xs text-white/50 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
                        <Link href={`/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>EN</Link>
                        <span>|</span>
                        <Link href={`/ja-JP/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>JA</Link>
                        <span>|</span>
                        <Link href={`/de-DE/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>DE</Link>
                    </div>
                </div>

                {/* Hero Product Stage */}
                <SectionShell id="beat-hero" className="py-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-8 rounded-[1.75rem] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(9,25,35,0.92),rgba(2,8,13,0.98))] p-4 shadow-[0_35px_100px_rgba(0,0,0,0.3)] sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:p-8">
                            {/* Left: Cover Art & Integrated Track Player */}
                            <m.div
                                className="space-y-5"
                                variants={revealUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/10">
                                    {beat.coverImageUrl ? (
                                        <Image
                                            src={beat.coverImageUrl}
                                            alt={`${beat.title} cover artwork`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 400px"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_18%_16%,rgba(125,211,252,0.28),transparent_30%),radial-gradient(circle_at_86%_82%,rgba(168,85,247,0.2),transparent_34%),linear-gradient(145deg,#071923,#02070d_62%,#050a12)] p-7">
                                            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_42%,transparent_43%)]" aria-hidden="true" />
                                            <div className="relative flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100/75">
                                                <span>Virzy Guns</span>
                                                <span>{text.officialRelease}</span>
                                            </div>
                                            <div className="relative">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/70">{beat.primaryGenre}</p>
                                                <h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-[0.95] tracking-tight text-white sm:text-4xl">{beat.title}</h2>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Official Embedded BeatStars Track Player Widget */}
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black min-h-[180px]">
                                    <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/60 flex justify-between bg-black/40">
                                        <span>{playerTitle}</span>
                                        <span>{playerSub}</span>
                                    </div>
                                    {beat.beatstarsTrackId ? (
                                        <BeatStarsAudioPlayer
                                            trackId={beat.beatstarsTrackId}
                                            productUrl={beat.beatstarsProductUrl}
                                            beatTitle={beat.title}
                                            locale={locale}
                                            autoLoad
                                        />
                                    ) : (
                                        <div className="flex min-h-[140px] items-center justify-center px-4 text-center text-xs text-white/60">
                                            {text.previewUnavailable}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                                    <span>{text.producer}: <strong className="text-white">{beat.producer}</strong></span>
                                    <span>{text.powered}</span>
                                </div>
                            </m.div>

                            {/* Right: Beat Info & License Selector */}
                            <m.div variants={revealUp} initial="hidden" animate="visible" className="space-y-6 py-1 lg:pl-2">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-sky-200/30 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-200">
                                            {beat.primaryGenre}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                            {text.ready}
                                        </span>
                                    </div>
                                    <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">
                                        {beat.title}
                                    </h1>
                                    <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
                                        {description}
                                    </p>
                                </div>

                                {/* License selection matrix */}
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-widest text-sky-200/70 font-semibold">{text.selectTier}</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {beat.licenses.map((lic) => {
                                            const isSelected = selectedLicense.id === lic.id;
                                            return (
                                                <button
                                                    key={lic.id}
                                                    onClick={() => setSelectedLicense(lic)}
                                                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                                                        isSelected
                                                            ? 'border-sky-200/60 bg-sky-300/[0.12] text-white shadow-lg'
                                                            : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold">{lic.name}</p>
                                                        <p className="text-xs text-white/50">{lic.streamingLimit}</p>
                                                    </div>
                                                    <p className="text-lg font-bold text-sky-200">{lic.price}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active License Terms & Honest BeatStars CTA */}
                                <div className="rounded-2xl border border-sky-200/25 bg-sky-300/[0.06] p-5 shadow-[0_18px_44px_rgba(56,189,248,0.06)] space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <span className="text-sm font-semibold text-white">{text.includes(selectedLicense.name)}</span>
                                        <span className="text-xl font-bold text-sky-200">{selectedLicense.price}</span>
                                    </div>
                                    <ul className="grid gap-2 text-xs text-white/80 sm:grid-cols-2">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>{text.formats}: {selectedLicense.fileFormats.join(', ')}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>{text.streams}: {selectedLicense.streamingLimit}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>{text.sales}: {selectedLicense.salesLimit}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>{text.stems}: {selectedLicense.includesStems ? text.stemsIncluded : text.stemsNotIncluded}</span>
                                        </li>
                                    </ul>

                                    <a
                                        href={beat.beatstarsProductUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => handleCheckoutClick(selectedLicense.name, selectedLicense.price)}
                                        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-200 text-black font-semibold text-sm transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                    >
                                        {text.checkout(selectedLicense.name, selectedLicense.price)}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>

                                {/* Exclusive License IG DM / Email Option */}
                                <div className="rounded-xl border border-sky-200/20 bg-sky-300/[0.04] p-5 space-y-3">
                                    <p className="text-sky-200 font-semibold text-xs uppercase tracking-wider">
                                        {text.exclusiveEyebrow}
                                    </p>
                                    <p className="text-xs text-white/70 leading-5">
                                        {text.exclusiveText}
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <a
                                            href={instagramDmUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.1] px-4 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-300/[0.2] transition"
                                        >
                                            <Instagram className="h-3.5 w-3.5" />
                                            {text.instagram}
                                        </a>
                                        <a
                                            href={getFounderGmailComposeUrl(
                                                text.emailSubject(beat.title),
                                                text.emailBody(beat.title),
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            {text.email}
                                        </a>
                                    </div>
                                </div>
                            </m.div>
                        </div>
                    </div>
                </SectionShell>

                {/* Sound Character & Licensing Information */}
                <SectionShell id="specs" className="border-t border-white/10 py-14">
                    <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-2">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-white">{text.sound}</h2>
                            <p className="mt-4 text-sm leading-7 text-white/70">{description}</p>
                            <div className="mt-6 space-y-3 text-xs text-white/60">
                                <p><strong className="text-white">{text.tags}:</strong> {beat.tags.join(', ')}</p>
                                <p><strong className="text-white">{text.credit}:</strong> {selectedLicense.creditString}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-200/70">{text.licensing}</h3>
                            <div className="space-y-3 text-xs text-white/70">
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">{text.selected}</span>
                                    <span className="text-sm font-semibold text-white">{selectedLicense.name}: {selectedLicense.streamingLimit}</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">{text.formatsIncluded}</span>
                                    <span className="text-sm font-semibold text-white">{selectedLicense.fileFormats.join(', ')}</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">{text.officialCheckout}</span>
                                    <span className="text-sm font-semibold text-white">{text.officialCheckoutDetail}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                {/* Related Beats in Genre */}
                {relatedBeats.length > 0 && (
                    <SectionShell id="related-beats" className="border-t border-white/10 py-14">
                        <div className="mx-auto max-w-5xl">
                            <h2 className="mb-6 font-display text-2xl font-semibold text-white">{text.related(beat.primaryGenre)}</h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {relatedBeats.map((relBeat) => (
                                    <Link
                                        key={relBeat.id}
                                        href={getLocalePath(`/studio/beats/${relBeat.slug}`)}
                                        className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-sky-200/40 hover:bg-white/[0.04]"
                                    >
                                        <p className="text-xs text-sky-200/60 uppercase font-semibold">{relBeat.primaryGenre}</p>
                                        <h3 className="mt-1 text-base font-semibold text-white group-hover:text-sky-200 transition">{relBeat.title}</h3>
                                        <p className="mt-2 text-xs text-white/50">{text.relatedCta} →</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SectionShell>
                )}
            </article>
        </PageTransition>
    );
}
