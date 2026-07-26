import type { BeatProduct } from '@/lib/catalog';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

function localizedTitle(beat: BeatProduct, locale: BeatLocale) {
    return beat.localizedTitle?.[locale] || beat.title;
}

export function getBeatSummary(beat: BeatProduct, locale: BeatLocale) {
    const pitches = {
        'en-US': {
            'Cyberpunk Trap': 'Cold synths, heavy 808s, and room for a hook that needs to hit hard.',
            'Cyberpunk Phonk': 'Distorted drums, deep bass, and late-night drift energy for an aggressive vocal.',
            'Synthwave Trap': 'Retro synth color, modern trap weight, and space for melodies that stay in your head.',
            House: 'Club-ready drums and clean movement for a vocal that needs lift.',
            Drill: 'Tight drums, dark tension, and enough air for sharp bars.',
            'Lo-fi': 'Soft texture, warm keys, and a relaxed pocket for understated vocals.',
            'R&B': 'Late-night chords, clean drums, and a pocket made for a melodic vocal.',
            default: 'A focused production with room for the vocal and enough character to carry the record.',
        },
        'ja-JP': {
            'Cyberpunk Trap': '冷たいシンセと重い808。強いフックが抜ける余白も残したサウンドです。',
            'Cyberpunk Phonk': '歪んだドラム、深いベース、攻めたボーカルに合う深夜のドリフト感。',
            'Synthwave Trap': 'レトロなシンセの色彩と現代的なトラップの重さ。耳に残るメロディーのための余白があります。',
            House: 'クラブで動くドラムと、ボーカルを持ち上げる軽やかなグルーヴ。',
            Drill: 'タイトなドラム、暗い緊張感、鋭いバースが映える余白。',
            'Lo-fi': '柔らかな質感、温かい鍵盤、抑えたボーカルに合う落ち着いたポケット。',
            'R&B': '深夜のコード、クリーンなドラム、メロディックなボーカルが乗るための空間。',
            default: 'ボーカルの居場所を残しながら、曲を前に進める個性を持ったプロダクションです。',
        },
        'de-DE': {
            'Cyberpunk Trap': 'Kalte Synths, schwere 808s und Raum für einen Hook, der durchschneidet.',
            'Cyberpunk Phonk': 'Verzerrte Drums, tiefer Bass und nächtliche Drift-Energie für eine raue Vocal.',
            'Synthwave Trap': 'Retro-Synths, modernes Trap-Gewicht und Platz für Melodien, die hängen bleiben.',
            House: 'Clubtaugliche Drums und sauberer Drive für eine Vocal, die nach oben will.',
            Drill: 'Enge Drums, dunkle Spannung und genug Luft für präzise Bars.',
            'Lo-fi': 'Weiche Texturen, warme Keys und ein entspannter Raum für zurückhaltende Vocals.',
            'R&B': 'Späte Akkorde, klare Drums und ein Pocket für eine melodische Vocal.',
            default: 'Eine fokussierte Produktion mit Platz für die Vocal und genug Charakter für den Record.',
        },
    } as const;

    const ending = {
        'en-US': 'Preview it, then choose the license for your release.',
        'ja-JP': '試聴して、合えばリリース用のライセンスを選べます。',
        'de-DE': 'Hör rein und wähle dann die passende Lizenz für deinen Release.',
    } as const;

    const localizedPitches = pitches[locale] as Record<string, string>;
    return `${localizedPitches[beat.primaryGenre] || localizedPitches.default} ${ending[locale]}`;
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
