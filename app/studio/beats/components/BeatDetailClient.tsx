'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Check, Gift, Mail, Instagram, Pause, Play, ShoppingBag } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { formatBeatTitle } from '@/lib/beat-title';
import { type BeatLicense, BeatProduct, beatsCatalog } from '@/lib/catalog';
import {
    getEditorialBeatWorld,
    getOfficialBeatStarsGenres,
} from '@/lib/catalog/beatstars-genre-index';
import { trackBeatEvent } from '@/lib/analytics';
import { getBeatStory } from '@/lib/seo/beat-copy';
import { getFounderGmailComposeUrl } from '@/lib/founder-contact';
import { getGenreTheme } from '@/lib/genre-theme';
import { StorePlayerProvider, useStorePlayer, type StoreTrack } from './BeatStorePlayer';
import { BeatStoreRow } from './BeatStoreRow';
import { toBeatRow } from './beat-row-data';
import BeatStarsCheckoutModal from './BeatStarsCheckoutModal';
import BeatStarsTrackArtwork from './BeatStarsTrackArtwork';
import BeatStarsTrackMeta from './BeatStarsTrackMeta';
import { getBeatStarsTrack } from './beatstars-track-data';

interface BeatDetailClientProps {
    beat: BeatProduct;
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const instagramDmUrl = 'https://ig.me/m/virzyguns';

function toOfficialLicense(contract: Awaited<ReturnType<typeof getBeatStarsTrack>>['contracts'][number]): BeatLicense {
    const streamFeature = contract.features.find((feature) => /stream/i.test(feature));
    const salesFeature = contract.features.find((feature) => /copies|units/i.test(feature));

    return {
        id: `beatstars-${contract.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: contract.title,
        price: typeof contract.price === 'number' ? `$${contract.price}` : 'See BeatStars',
        priceValue: contract.price || 0,
        currency: 'USD',
        type: 'non-exclusive',
        fileFormats: contract.deliverables.length ? contract.deliverables : ['See BeatStars contract'],
        includesStems: contract.deliverables.some((deliverable) => deliverable.toLowerCase().includes('stem')),
        commercialUse: contract.features.some((feature) => /profit|commercial/i.test(feature)),
        streamingLimit: streamFeature || 'See BeatStars contract',
        salesLimit: salesFeature || 'See BeatStars contract',
        musicVideoLimit: contract.features.find((feature) => /music video/i.test(feature)) || 'See BeatStars contract',
        paidPerformances: contract.features.some((feature) => /profit.*performance|live performance/i.test(feature)),
        contentIdAllowed: false,
        creditRequired: false,
        creditString: 'See BeatStars contract',
        source: 'beatstars-api',
    };
}

const detailCopy = {
    'en-US': {
        home: 'Home', beats: 'Beats', officialRelease: 'Official release', previewUnavailable: 'Preview unavailable. Use the official BeatStars link below.',
        producer: 'Producer', powered: 'Preview via BeatStars', ready: 'Ready to license', selectTier: 'Choose a license tier',
        promoTitle: 'Buy 2, get 1 free',
        promoText: 'Add every qualifying beat with the same eligible license. BeatStars confirms and applies the discount in its cart.',
        promoCheckout: 'Confirm current bulk-deal eligibility in the embedded BeatStars cart.',
        includes: (name: string) => `Included with ${name}`, formats: 'Formats', streams: 'Streams', sales: 'Sales', stems: 'Stems',
        stemsIncluded: 'Included', stemsNotIncluded: 'Not included', checkout: (name: string, price: string) => `License ${name} for ${price}`,
        exclusiveEyebrow: 'Exclusive license inquiry', exclusiveText: 'Ask about current availability and terms for an exclusive license. Details are confirmed directly in writing before purchase.',
        instagram: 'Instagram DM (@virzyguns)', email: 'Email founder', sound: 'Sound character', tags: 'Tags', credit: 'Credit line',
        licensing: 'License summary', selected: 'Selected license', formatsIncluded: 'Included formats', officialCheckout: 'Official checkout',
        officialCheckoutDetail: 'Complete the official BeatStars purchase inside the embedded checkout on this page.', related: (genre: string) => `More ${genre} beats`, relatedCta: 'Preview & license',
        emailSubject: (title: string) => `Exclusive license inquiry: ${title}`,
        emailBody: (title: string) => `Hi Virzy Guns,\n\nI would like to ask about an exclusive license for ${title}.\n\nProject details:`,
    },
    'ja-JP': {
        home: 'ホーム', beats: 'ビート', officialRelease: '公式リリース', previewUnavailable: 'プレビューを再生できません。下のBeatStars公式リンクをご利用ください。',
        producer: 'プロデューサー', powered: 'BeatStars提供のプレビュー', ready: 'ライセンス購入可能', selectTier: 'ライセンスを選ぶ',
        promoTitle: '2曲購入で1曲無料',
        promoText: '対象曲を同じ対象ライセンスで追加してください。割引条件と適用結果はBeatStarsのカートで確認されます。',
        promoCheckout: '最新のキャンペーン対象条件は、埋め込みBeatStarsカートで確認してください。',
        includes: (name: string) => `${name}に含まれる内容`, formats: 'ファイル形式', streams: 'ストリーミング', sales: '販売数', stems: 'ステム',
        stemsIncluded: '含まれます', stemsNotIncluded: '含まれません', checkout: (name: string, price: string) => `${name}を${price}で購入`,
        exclusiveEyebrow: '独占ライセンスのお問い合わせ', exclusiveText: '独占ライセンスの現在の提供状況と条件についてお問い合わせください。購入前に詳細を書面で直接ご案内します。',
        instagram: 'Instagram DM (@virzyguns)', email: 'メールで問い合わせ', sound: 'サウンドの特徴', tags: 'タグ', credit: 'クレジット表記',
        licensing: 'ライセンス概要', selected: '選択したライセンス', formatsIncluded: '含まれるファイル形式', officialCheckout: '公式決済',
        officialCheckoutDetail: 'このページ内のBeatStars公式チェックアウトで購入を完了できます。', related: (genre: string) => `関連する${genre}ビート`, relatedCta: '試聴してライセンスを選ぶ',
        emailSubject: (title: string) => `独占ライセンスのお問い合わせ: ${title}`,
        emailBody: (title: string) => `Virzy Guns様\n\n${title}の独占ライセンスについて伺いたいです。\n\nプロジェクトの詳細:`,
    },
    'de-DE': {
        home: 'Startseite', beats: 'Beats', officialRelease: 'Offizieller Release', previewUnavailable: 'Vorschau nicht verfügbar. Bitte nutze unten den offiziellen BeatStars-Link.',
        producer: 'Produzent', powered: 'Vorschau via BeatStars', ready: 'Lizenz verfügbar', selectTier: 'Lizenz auswählen',
        promoTitle: '2 kaufen, 1 gratis',
        promoText: 'Lege alle qualifizierten Beats mit derselben berechtigten Lizenz in den Warenkorb. BeatStars bestätigt und verrechnet den Rabatt dort.',
        promoCheckout: 'Prüfe die aktuellen Rabattbedingungen im eingebetteten BeatStars-Warenkorb.',
        includes: (name: string) => `Enthalten in ${name}`, formats: 'Dateiformate', streams: 'Streams', sales: 'Verkäufe', stems: 'Stems',
        stemsIncluded: 'Enthalten', stemsNotIncluded: 'Nicht enthalten', checkout: (name: string, price: string) => `${name} für ${price} lizenzieren`,
        exclusiveEyebrow: 'Anfrage zu einer Exklusivlizenz', exclusiveText: 'Frag nach aktueller Verfügbarkeit und den Bedingungen einer Exklusivlizenz. Alle Details werden vor dem Kauf direkt schriftlich bestätigt.',
        instagram: 'Instagram-DM (@virzyguns)', email: 'E-Mail an den Founder', sound: 'Sound-Charakter', tags: 'Tags', credit: 'Credit-Zeile',
        licensing: 'Lizenzübersicht', selected: 'Gewählte Lizenz', formatsIncluded: 'Enthaltene Dateiformate', officialCheckout: 'Offizieller Checkout',
        officialCheckoutDetail: 'Schließe den offiziellen BeatStars-Kauf im eingebetteten Checkout auf dieser Seite ab.', related: (genre: string) => `Mehr ${genre}-Beats`, relatedCta: 'Anhören & lizenzieren',
        emailSubject: (title: string) => `Anfrage zu einer Exklusivlizenz: ${title}`,
        emailBody: (title: string) => `Hallo Virzy Guns,\n\nich möchte mich nach einer Exklusivlizenz für ${title} erkundigen.\n\nProjektdetails:`,
    },
} as const;

export default function BeatDetailClient({ beat, locale = 'en-US' }: BeatDetailClientProps) {
    const text = detailCopy[locale];
    const [selectedLicense, setSelectedLicense] = useState(beat.licenses[0] || beat.licenses[1]);
    const [officialLicenses, setOfficialLicenses] = useState<BeatLicense[]>();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
    const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
    const genreTheme = getGenreTheme(editorialWorld);
    const relatedBeats = beatsCatalog
        .filter((candidate) => (
            candidate.id !== beat.id
            && getEditorialBeatWorld(candidate.beatstarsTrackId) === editorialWorld
        ))
        .slice(0, 3);

    const description = getBeatStory(beat, locale);

    useEffect(() => {
        let cancelled = false;

        getBeatStarsTrack(beat.beatstarsTrackId)
            .then((track) => {
                const licenses = track.contracts
                    .filter((contract) => !contract.offerOnly && typeof contract.price === 'number' && contract.price > 0)
                    .map(toOfficialLicense);

                if (!cancelled && licenses.length) {
                    setOfficialLicenses(licenses);
                    setSelectedLicense((current) => licenses.find((license) => license.name.toLowerCase() === current.name.toLowerCase()) || licenses[0]);
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [beat.beatstarsTrackId]);

    const licenseOptions = officialLicenses || beat.licenses;

    const handleCheckoutClick = (licenseName: string, price: string) => {
        setCheckoutOpen(true);
        trackBeatEvent('beatstars_checkout_click', {
            beatId: beat.id,
            beatSlug: beat.slug,
            beatTitle: beat.title,
            licenseName,
            displayedPrice: price,
            destinationUrl: 'embedded-beatstars-blaze-player',
        });
    };

    const handleLicenseSelection = (license: BeatLicense) => {
        setSelectedLicense(license);
        trackBeatEvent('beat_license_selected', {
            beatId: beat.id,
            beatSlug: beat.slug,
            beatTitle: beat.title,
            primaryGenre: editorialWorld,
            locale,
            licenseId: license.id,
            licenseName: license.name,
            displayedPrice: license.price,
            currency: license.currency,
            sourcePage: 'beat-detail',
        });
    };

    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    const { name: displayName, detail: displayDetail } = formatBeatTitle(beat.title);
    const thisRow = toBeatRow(beat, getLocalePath(`/studio/beats/${beat.slug}`));
    const relatedRows = relatedBeats.map((related) => toBeatRow(related, getLocalePath(`/studio/beats/${related.slug}`)));
    const queue = [thisRow, ...relatedRows];
    const [checkoutBeat, setCheckoutBeat] = useState(beat);
    const openCheckoutFor = (beatId: string) => {
        const target = beatsCatalog.find((item) => item.id === beatId) || beat;
        setCheckoutBeat(target);
        setCheckoutOpen(true);
    };
    const rowLabels = {
        play: playLabel[locale].play,
        pause: playLabel[locale].pause,
        license: playLabel[locale].license,
        shortlist: '',
        shortlisted: '',
        shortlistFull: '',
        details: text.relatedCta,
    };

    return (
        <StorePlayerProvider locale={locale} onLicense={openCheckoutFor}>
        <PageTransition>
            <article className="editorial-shell min-h-screen pb-28 pt-6 text-white sm:pt-10">
                <div className="px-4 sm:px-6">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-white/55">
                        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
                            <Link href={getLocalePath('/studio/beats')} className="shrink-0 transition-colors hover:text-white">{text.beats}</Link>
                            <span aria-hidden="true">/</span>
                            <span className="truncate text-white/80">{displayName}</span>
                        </nav>
                        <div className="flex items-center gap-4" aria-label="Language">
                            {([
                                ['en-US', `/studio/beats/${beat.slug}`, 'EN'],
                                ['ja-JP', `/ja-JP/studio/beats/${beat.slug}`, 'JA'],
                                ['de-DE', `/de-DE/studio/beats/${beat.slug}`, 'DE'],
                            ] as const).map(([code, href, label]) => (
                                <Link
                                    key={code}
                                    href={href}
                                    hrefLang={code}
                                    aria-current={locale === code ? 'page' : undefined}
                                    className={`inline-flex min-h-11 items-center transition-colors hover:text-white ${locale === code ? 'text-white underline decoration-white/40 underline-offset-[6px]' : ''}`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <section className="px-4 pb-16 pt-8 sm:px-6 lg:pb-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:gap-14">
                        {/* Artwork and preview */}
                        <div data-enter="" className="lg:col-span-5">
                            <div className="relative aspect-square w-full overflow-hidden rounded-[6px] border border-white/10 bg-[#0a0e12]">
                                <BeatStarsTrackArtwork
                                    trackId={beat.beatstarsTrackId}
                                    title={beat.title}
                                    fallback={
                                        <div className="flex h-full flex-col justify-end p-7">
                                            <span className="h-1 w-12 rounded-full" style={{ backgroundColor: genreTheme.accentHex }} aria-hidden="true" />
                                            <p className="mt-4 max-w-sm font-display text-3xl font-semibold leading-tight tracking-tight text-white">{displayName}</p>
                                        </div>
                                    }
                                />
                            </div>
                            <PreviewButton row={thisRow} queue={queue} labels={playLabel[locale]} />
                            <p className="mt-3 text-xs text-white/50">
                                {text.producer}: <span className="text-white/80">{beat.producer}</span> · {text.powered}
                            </p>
                        </div>

                        {/* Details and license */}
                        <div data-enter="" style={{ '--enter-delay': '120ms' } as CSSProperties} className="lg:col-span-7">
                            <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: genreTheme.accentHex }} aria-hidden="true" />
                                {[editorialWorld, ...officialGenres.slice(0, 3)].join(' · ')}
                            </p>
                            <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                                {displayName}
                            </h1>
                            {displayDetail ? <p className="mt-3 text-lg text-white/60">{displayDetail}</p> : null}
                            <div className="mt-5">
                                <BeatStarsTrackMeta trackId={beat.beatstarsTrackId} locale={locale} />
                            </div>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{description}</p>

                            <div className="mt-10 border-t border-white/10 pt-8">
                                <h2 className="text-sm font-medium text-white/60">{text.selectTier}</h2>
                                <ul className="mt-4 divide-y divide-white/[0.08] overflow-hidden rounded-[6px] border border-white/10" role="radiogroup" aria-label={text.selectTier}>
                                    {licenseOptions.map((lic) => {
                                        const isSelected = selectedLicense.id === lic.id;
                                        return (
                                            <li key={lic.id}>
                                                <button
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={isSelected}
                                                    onClick={() => handleLicenseSelection(lic)}
                                                    className={`flex w-full items-center gap-4 px-4 py-4 text-left transition-colors focus:outline-none focus-visible:bg-white/[0.06] ${
                                                        isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-sky-300' : 'border-white/30'}`}
                                                        aria-hidden="true"
                                                    >
                                                        {isSelected ? <span className="h-2 w-2 rounded-full bg-sky-300" /> : null}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-semibold text-white">{lic.name}</span>
                                                        <span className="block truncate text-xs text-white/50">{lic.streamingLimit}</span>
                                                    </span>
                                                    <span className="font-display text-xl font-semibold tabular-nums text-white">{lic.price}</span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <dl className="mt-6 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                                    {[
                                        [text.formats, selectedLicense.fileFormats.join(', ')],
                                        [text.streams, selectedLicense.streamingLimit],
                                        [text.sales, selectedLicense.salesLimit],
                                        [text.stems, selectedLicense.includesStems ? text.stemsIncluded : text.stemsNotIncluded],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex gap-2">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
                                            <dt className="text-white/55">{label}:</dt>
                                            <dd className="text-white/85">{value}</dd>
                                        </div>
                                    ))}
                                </dl>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setCheckoutBeat(beat);
                                        handleCheckoutClick(selectedLicense.name, selectedLicense.price);
                                    }}
                                    className="group/button mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-[background-color,transform] duration-200 hover:bg-white/85 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607] sm:w-auto"
                                >
                                    {text.checkout(selectedLicense.name, selectedLicense.price)}
                                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <p className="mt-4 flex items-start gap-2 text-sm text-white/55">
                                    <Gift className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span><span className="text-white/80">{text.promoTitle}.</span> {text.promoText}</span>
                                </p>
                            </div>

                            <div className="mt-10 border-t border-white/10 pt-8">
                                <h2 className="text-sm font-medium text-white/60">{text.exclusiveEyebrow}</h2>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">{text.exclusiveText}</p>
                                <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3">
                                    <a href={instagramDmUrl} target="_blank" rel="noopener noreferrer" className="vgp-link inline-flex items-center gap-2 text-sm font-medium text-white">
                                        <Instagram className="h-4 w-4" aria-hidden="true" />
                                        {text.instagram}
                                    </a>
                                    <a
                                        href={getFounderGmailComposeUrl(text.emailSubject(beat.title), text.emailBody(beat.title))}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="vgp-link inline-flex items-center gap-2 text-sm font-medium text-white"
                                    >
                                        <Mail className="h-4 w-4" aria-hidden="true" />
                                        {text.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section data-reveal="" className="border-t border-white/10 px-4 py-14 sm:px-6">
                    <dl className="mx-auto grid max-w-7xl gap-6 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-white/50">{text.tags}</dt>
                            <dd className="mt-1 text-white/80">{beat.tags.join(', ')}</dd>
                        </div>
                        <div>
                            <dt className="text-white/50">{text.credit}</dt>
                            <dd className="mt-1 text-white/80">{selectedLicense.creditString}</dd>
                        </div>
                    </dl>
                </section>

                {relatedRows.length > 0 ? (
                    <section data-reveal="" aria-labelledby="related-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                        <div className="mx-auto max-w-7xl">
                            <h2 id="related-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                {text.related(editorialWorld)}
                            </h2>
                            <ol className="mt-8 divide-y divide-white/[0.06] border-y border-white/10">
                                {relatedRows.map((row, index) => (
                                    <BeatStoreRow
                                        key={row.beatId}
                                        beat={row}
                                        queue={queue}
                                        index={index + 1}
                                        labels={rowLabels}
                                        onLicense={() => openCheckoutFor(row.beatId)}
                                    />
                                ))}
                            </ol>
                        </div>
                    </section>
                ) : null}

                <BeatStarsCheckoutModal
                    open={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    locale={locale}
                    beatSelections={[{
                        trackId: checkoutBeat.beatstarsTrackId,
                        title: checkoutBeat.title,
                        productUrl: checkoutBeat.beatstarsProductUrl,
                    }]}
                />
            </article>
        </PageTransition>
        </StorePlayerProvider>
    );
}

const playLabel = {
    'en-US': { play: 'Play preview', pause: 'Pause preview', license: 'License' },
    'ja-JP': { play: 'プレビューを再生', pause: 'プレビューを一時停止', license: 'ライセンス' },
    'de-DE': { play: 'Vorschau abspielen', pause: 'Vorschau pausieren', license: 'Lizenz' },
} as const;

/** Big preview button under the artwork, wired to the shared store player. */
function PreviewButton({ row, queue, labels }: { row: StoreTrack; queue: StoreTrack[]; labels: { play: string; pause: string } }) {
    const { current, isPlaying, isLoading, play } = useStorePlayer();
    const active = current?.trackId === row.trackId && (isPlaying || isLoading);
    return (
        <button
            type="button"
            onClick={() => play(row, queue)}
            className="group/button mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-[border-color,transform] duration-200 hover:border-white/60 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
            {active ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
            {active ? labels.pause : labels.play}
        </button>
    );
}
