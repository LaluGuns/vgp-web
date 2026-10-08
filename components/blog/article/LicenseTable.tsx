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
            {/* Phones: one block per tier, so no column hides behind a sideways scroll. */}
            <div className="space-y-4 sm:hidden">
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
            <div className="hidden overflow-x-auto rounded-[6px] border border-white/10 sm:block">
                <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="w-36 px-4 py-3 font-semibold text-white/60">Tier</th>
                            {tiers.map((t) => (
                                <th key={t.id} className="whitespace-nowrap px-4 py-3 font-semibold text-white">
                                    {t.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label} className="border-b border-white/[0.07] last:border-0">
                                <th scope="row" className="px-4 py-3 align-top font-medium text-white/70">
                                    {row.label}
                                </th>
                                {tiers.map((t) => (
                                    <td key={t.id} className="px-4 py-3 align-top leading-6 text-white/85">
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
