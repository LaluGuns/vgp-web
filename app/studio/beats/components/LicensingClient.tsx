'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell, PageHeader } from '@/components/editorial/EditorialPrimitives';
import { defaultLicenses, BeatLicense } from '@/lib/catalog';

interface LicensingClientProps {
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const licensingCopy = {
    'en-US': {
        home: 'Home', beats: 'Beats', eyebrow: 'Virzy Guns licensing', title: 'Beat licensing guide', muted: 'clear before you release.',
        description: 'Compare the available release tiers before you purchase. Your final license terms are supplied on the official BeatStars checkout page.',
        files: 'Files', streams: 'Streams', sales: 'Sales', videos: 'Music videos', browse: (name: string) => `Browse beats for ${name}`,
        faq: 'Frequently asked questions', exclusiveQ: 'How do exclusive licenses work?', exclusiveA: 'Availability and terms for an exclusive license are confirmed directly before purchase. Ask first; do not assume a beat is available until you receive written confirmation.',
        platformsQ: 'Can I release music on Spotify or Apple Music?', platformsA: 'Check the current stream allowance and terms shown for your chosen license on BeatStars before release. Those terms control permitted distribution.',
        stemsQ: 'Are stems included?', stemsA: 'Included files vary by license tier. Review the product-page terms for the selected beat before checkout.',
    },
    'ja-JP': {
        home: 'ホーム', beats: 'ビート', eyebrow: 'Virzy Guns ライセンス', title: 'ビートライセンスガイド', muted: 'リリース前に明確に。',
        description: '購入前に利用可能なライセンスを比較できます。最終的なライセンス条件はBeatStars公式決済ページで提示されます。',
        files: 'ファイル', streams: 'ストリーミング', sales: '販売数', videos: 'ミュージックビデオ', browse: (name: string) => `${name}向けビートを見る`,
        faq: 'よくある質問', exclusiveQ: '独占ライセンスはどのように扱われますか？', exclusiveA: '独占ライセンスの提供状況と条件は、購入前に直接確認します。書面での確認を受けるまで、利用可能とは見なさないでください。',
        platformsQ: 'SpotifyやApple Musicでリリースできますか？', platformsA: 'リリース前に、選択したライセンスに表示されるストリーミング上限とBeatStarsの条件をご確認ください。配信の可否はその条件に従います。',
        stemsQ: 'ステムは含まれますか？', stemsA: '含まれるファイルはライセンスによって異なります。決済前に選択したビートの商品ページで条件をご確認ください。',
    },
    'de-DE': {
        home: 'Startseite', beats: 'Beats', eyebrow: 'Virzy Guns Lizenzen', title: 'Beat-Lizenzguide', muted: 'klar vor dem Release.',
        description: 'Vergleiche die verfügbaren Lizenzstufen vor dem Kauf. Die endgültigen Lizenzbedingungen stehen auf der offiziellen BeatStars-Checkout-Seite.',
        files: 'Dateien', streams: 'Streams', sales: 'Verkäufe', videos: 'Musikvideos', browse: (name: string) => `Beats für ${name} ansehen`,
        faq: 'Häufige Fragen', exclusiveQ: 'Wie funktionieren Exklusivlizenzen?', exclusiveA: 'Verfügbarkeit und Bedingungen einer Exklusivlizenz werden vor dem Kauf direkt bestätigt. Geh erst nach schriftlicher Bestätigung von Verfügbarkeit aus.',
        platformsQ: 'Kann ich bei Spotify oder Apple Music veröffentlichen?', platformsA: 'Prüfe vor dem Release die bei deiner Lizenz auf BeatStars angegebene Stream-Grenze und die aktuellen Bedingungen. Diese regeln die erlaubte Distribution.',
        stemsQ: 'Sind Stems enthalten?', stemsA: 'Die enthaltenen Dateien unterscheiden sich je nach Lizenzstufe. Prüfe vor dem Checkout die Bedingungen auf der Produktseite des gewählten Beats.',
    },
} as const;

export default function LicensingClient({ locale = 'en-US' }: LicensingClientProps) {
    const text = licensingCopy[locale];
    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
                <div className="mx-auto max-w-5xl px-6 mb-8 flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <Link href={getLocalePath('/')} className="hover:text-white transition">{text.home}</Link>
                        <span>/</span>
                        <Link href={getLocalePath('/studio/beats')} className="hover:text-white transition">{text.beats}</Link>
                        <span>/</span>
                        <span className="text-sky-200/80">{text.title}</span>
                    </nav>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Link href="/studio/beats/licensing" className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>EN</Link>
                        <span>|</span>
                        <Link href="/ja-JP/studio/beats/licensing" className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>JA</Link>
                        <span>|</span>
                        <Link href="/de-DE/studio/beats/licensing" className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>DE</Link>
                    </div>
                </div>

                <PageHeader
                    eyebrow={text.eyebrow}
                    title={text.title}
                    mutedTitle={text.muted}
                    description={text.description}
                />

                {/* License Matrix */}
                <SectionShell id="license-matrix" className="py-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {defaultLicenses.map((lic: BeatLicense) => (
                                <div
                                    key={lic.id}
                                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">{lic.name}</h3>
                                            <span className="text-xl font-bold text-sky-200">{lic.price}</span>
                                        </div>
                                        <div className="mt-4 space-y-2 text-xs text-white/70">
                                            <p className="font-semibold text-white">{text.files}: {lic.fileFormats.join(', ')}</p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>{text.streams}: {lic.streamingLimit}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>{text.sales}: {lic.salesLimit}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>{text.videos}: {lic.musicVideoLimit}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={getLocalePath('/studio/beats')}
                                        className="mt-6 flex items-center justify-center gap-1 rounded-lg border border-sky-200/30 bg-sky-300/10 py-2.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-300/20"
                                    >
                                        {text.browse(lic.name)}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                {/* FAQ Section */}
                <SectionShell id="faq" className="border-t border-white/10 py-14">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <h2 className="font-display text-2xl font-semibold text-white text-center">{text.faq}</h2>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">{text.exclusiveQ}</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    {text.exclusiveA}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">{text.platformsQ}</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    {text.platformsA}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">{text.stemsQ}</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    {text.stemsA}
                                </p>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
