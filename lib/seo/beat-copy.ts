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
        return `${title} ist ein offizielles ${genre}-Instrumental von ${beat.producer}. Höre die Vorschau, wähle eine passende Lizenz und kaufe direkt im offiziellen BeatStars Store.`;
    }

    if (locale === 'ja-JP') {
        return `${title} は、${beat.producer}による公式 ${genre} インストゥルメンタルです。プレビューを聴き、用途に合うライセンスを選んで、公式 BeatStars ストアから購入できます。`;
    }

    return `${title} is an official ${genre} instrumental by ${beat.producer}. Preview the track, choose the license that fits your release, and buy directly through the official BeatStars store.`;
}

export function getBeatMetaDescription(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const firstLicense = beat.licenses[0]?.name;

    if (locale === 'de-DE') {
        return `${title}: offizielles ${beat.primaryGenre}-Instrumental von ${beat.producer}. Vorschau anhören und${firstLicense ? ` ${firstLicense}-Lizenz` : ' Lizenzen'} im BeatStars Store auswählen.`;
    }

    if (locale === 'ja-JP') {
        return `${title}: ${beat.producer}の公式 ${beat.primaryGenre} インストゥルメンタル。プレビューを聴き、BeatStars でライセンスを選ぶ。`;
    }

    return `${title}: official ${beat.primaryGenre} instrumental by ${beat.producer}. Preview the track and choose${firstLicense ? ` a ${firstLicense} license` : ' a license'} on BeatStars.`;
}
