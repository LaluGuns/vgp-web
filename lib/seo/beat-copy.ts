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
    if (locale === 'de-DE') {
        return `${title} ist ein offizielles ${genre}-Instrumental von ${beat.producer}. Hör die Vorschau an, prüfe die Lizenzstufen und kaufe bei BeatStars.`;
    }

    if (locale === 'ja-JP') {
        return `${title} は${beat.producer}による公式${genre}インストゥルメンタルです。試聴し、ライセンス内容を確認してBeatStarsで購入できます。`;
    }

    return `${title} is an official ${genre} instrumental by ${beat.producer}. Preview the track, review the license tiers, then purchase on BeatStars.`;
}

export function getBeatMetaDescription(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const firstLicense = beat.licenses[0]?.name;

    if (locale === 'de-DE') {
        return `${title}: ${beat.primaryGenre}-Beat von ${beat.producer}. Vorschau anhören,${firstLicense ? ` ${firstLicense}-Lizenz` : ' Lizenz'} prüfen und bei BeatStars kaufen.`;
    }

    if (locale === 'ja-JP') {
        return `${title}: ${beat.producer}による${beat.primaryGenre}ビート。プレビューを聴き、BeatStarsでライセンス内容を確認して購入できます。`;
    }

    return `${title}: ${beat.primaryGenre} beat by ${beat.producer}. Preview the official track, review${firstLicense ? ` the ${firstLicense} license` : ' the available licenses'}, and purchase on BeatStars.`;
}
