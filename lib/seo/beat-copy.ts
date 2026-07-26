import type { BeatProduct } from '@/lib/catalog';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

function localizedTitle(beat: BeatProduct, locale: BeatLocale) {
    return beat.localizedTitle?.[locale] || beat.title;
}

/**
 * Replaces generic production claims with copy grounded in catalog facts:
 * title, genre, producer, available license data, and the official store.
 */
export function getBeatSummary(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const genre = beat.primaryGenre;
    const mood = beat.moods[0]?.toLowerCase();

    if (locale === 'de-DE') {
        return `Mach ${title} zu deinem nächsten Release: ein offizielles ${genre}-Instrumental von ${beat.producer}${mood ? ` mit ${mood} Energie` : ''}. Vorschau starten, Lizenz sichern und direkt bei BeatStars kaufen.`;
    }

    if (locale === 'ja-JP') {
        return `${title} を次のリリースの中心に。${beat.producer}による公式 ${genre} インストゥルメンタルです。プレビューを聴き、ライセンスを確保し、BeatStars ですぐに購入。`;
    }

    return `Make ${title} the foundation of your next release. This official ${genre} instrumental by ${beat.producer}${mood ? ` brings ${mood} energy` : ''}; preview it below, lock in your license, and release with confidence.`;
}

export function getBeatMetaDescription(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const firstLicense = beat.licenses[0]?.name;

    if (locale === 'de-DE') {
        return `${title}: ${beat.primaryGenre}-Beat von ${beat.producer}. Vorschau anhören,${firstLicense ? ` ${firstLicense}-Lizenz` : ' Lizenz'} sichern und den nächsten Release bei BeatStars starten.`;
    }

    if (locale === 'ja-JP') {
        return `${title}: ${beat.producer}の ${beat.primaryGenre} ビート。プレビューを聴き、BeatStars でライセンスを確保して次のリリースへ。`;
    }

    return `${title}: ${beat.primaryGenre} beat by ${beat.producer}. Preview the official track, lock${firstLicense ? ` a ${firstLicense} license` : ' your license'}, and build your next release on BeatStars.`;
}
