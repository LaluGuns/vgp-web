import { PUBLIC_CONFIRMED_LICENSES, formatLicenseCount } from '@/lib/licensing-registry';

const yesNo = (value: boolean | null) => (value === null ? 'Ask first' : value ? 'Yes' : 'No');

/**
 * The current non-exclusive license tiers, read from the licensing
 * registry so articles always match the store.
 */
export function LicenseTable() {
    const tiers = PUBLIC_CONFIRMED_LICENSES;
    const rows: { label: string; value: (t: (typeof tiers)[number]) => string }[] = [
        { label: 'Price', value: (t) => (t.priceUsd === null ? 'Ask' : `$${t.priceUsd}`) },
        { label: 'Files', value: (t) => t.fileFormats.join(', ') },
        { label: 'Copies you can sell', value: (t) => formatLicenseCount(t.distributionCopies, 'copy', 'copies', t.unlimitedDistribution) },
        { label: 'Online audio streams', value: (t) => formatLicenseCount(t.onlineAudioStreams, 'stream', 'streams', t.unlimitedOnlineAudioStreams) },
        { label: 'Music videos', value: (t) => formatLicenseCount(t.musicVideos, 'video', 'videos') },
        { label: 'Radio stations', value: (t) => formatLicenseCount(t.radioStations, 'station', 'stations') },
        { label: 'Paid performances', value: (t) => yesNo(t.paidPerformances) },
        { label: 'Content ID', value: (t) => yesNo(t.contentIdAllowed) },
        { label: 'Credit', value: (t) => t.creditString ?? 'None' },
    ];
    return (
        <figure className="my-10">
            {/* Phones, held either way up (the table needs about 660 px): one block per tier, so no column hides
                behind a sideways scroll. */}
            <div className="space-y-4 md:hidden print:hidden">
                {tiers.map((t) => (
                    <div key={t.id} className="rounded-[6px] border border-white/10 px-4 py-4">
                        <p className="text-base font-semibold text-white">{t.name}</p>
                        <dl className="mt-3 space-y-1.5 text-sm leading-6">
                            {rows.map((row) => (
                                <div key={row.label} className="flex justify-between gap-4">
                                    <dt className="text-white/60">{row.label}</dt>
                                    <dd className="text-right text-white/90">{row.value(t)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
            {/* From 768 px, and in print, where it fits the page width: smaller type, cells wrap. The cells' 12 px
                sides keep it inside the text column beside the lesson outline at 1024 px too. */}
            <div className="hidden overflow-x-auto rounded-[6px] border border-white/10 md:block print:block print:overflow-visible">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm print:min-w-0 print:table-fixed print:text-[11px] print:leading-snug">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="w-36 px-3 py-3 font-semibold text-white/60 print:w-[18%] print:px-2 print:py-2">Tier</th>
                            {tiers.map((t) => (
                                <th key={t.id} className="whitespace-nowrap px-3 py-3 font-semibold text-white print:whitespace-normal print:break-words print:px-2 print:py-2">
                                    {t.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label} className="border-b border-white/[0.07] last:border-0">
                                <th scope="row" className="px-3 py-3 align-top font-medium text-white/70 print:px-2 print:py-2">
                                    {row.label}
                                </th>
                                {tiers.map((t) => (
                                    <td key={t.id} className="px-3 py-3 align-top leading-6 text-white/85 print:break-words print:px-2 print:py-2 print:leading-snug">
                                        {row.value(t)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-white/60">
                Current Virzy Guns license tiers, taken from the same source as the beat store. Exclusive rights are agreed individually.
            </figcaption>
        </figure>
    );
}
