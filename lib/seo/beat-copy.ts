import type { BeatProduct } from '@/lib/catalog';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

function localizedTitle(beat: BeatProduct, locale: BeatLocale) {
    return beat.localizedTitle?.[locale] || beat.title;
}

export function getBeatSummary(beat: BeatProduct, locale: BeatLocale) {
    const titleCue = getTitleCue(beat.title, locale);
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

    const endings = {
        'en-US': 'Preview it, then choose the license for your release.',
        'ja-JP': '試聴して、合えばリリース用のライセンスを選べます。',
        'de-DE': 'Hör rein und wähle dann die passende Lizenz für deinen Release.',
    } as const;

    const localizedPitches = pitches[locale] as Record<string, string>;
    const summary = localizedPitches[beat.primaryGenre] || localizedPitches.default;
    return `${titleCue} ${summary} ${endings[locale]}`;
}

function titleSeed(value: string) {
    return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function getTitleCue(title: string, locale: BeatLocale) {
    const lowerTitle = title.toLowerCase();

    if (locale === 'ja-JP') {
        if (/(night|zero|dark|hardcore)/.test(lowerTitle)) return '夜の緊張感を軸にしたタイトルです。';
        if (/(summer|dance|club|party)/.test(lowerTitle)) return '動きのある場面を連想させるタイトルです。';
        if (/(memory|flower|christmas|love)/.test(lowerTitle)) return '余韻のあるイメージを持つタイトルです。';
        return `${title}というタイトルから曲の空気を作り始められます。`;
    }

    if (locale === 'de-DE') {
        if (/(night|zero|dark|hardcore)/.test(lowerTitle)) return 'Der Titel setzt einen nächtlichen, angespannten Rahmen.';
        if (/(summer|dance|club|party)/.test(lowerTitle)) return 'Der Titel deutet auf Bewegung und einen offenen Moment hin.';
        if (/(memory|flower|christmas|love)/.test(lowerTitle)) return 'Der Titel gibt dem Track eine nachdenklichere Bildsprache.';
        return `${title} gibt dem Record einen klaren Ausgangspunkt.`;
    }

    if (/(night|zero|dark|hardcore)/.test(lowerTitle)) return 'The title sets a tense, after-hours frame.';
    if (/(summer|dance|club|party)/.test(lowerTitle)) return 'The title points toward movement and an open-room moment.';
    if (/(memory|flower|christmas|love)/.test(lowerTitle)) return 'The title gives the record a more reflective image.';
    return `${title} gives the record a clear place to start.`;
}

export function getBeatStory(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const genre = beat.primaryGenre;
    const subgenres = beat.subgenres.join(', ');
    const moods = beat.moods.join(', ').toLowerCase();
    const variations = titleSeed(beat.id) % 3;

    if (locale === 'ja-JP') {
        const uses = [
            '短いフレーズを重ねていくボーカルにも、フックから入る曲にも合わせやすい構成です。',
            'タイトなバースを置いてからサビを広げたいときに、曲の骨格として使えます。',
            'ボーカルの言葉を前に出しつつ、世界観を薄くしないための土台になります。',
        ];
        return `${title}は${genre}を軸に、${subgenres}の要素を持つビートです。ムードは${moods}。${getTitleCue(beat.title, locale)} ${uses[variations]} 公式プレビューで声との相性を確認し、必要なライセンスをBeatStarsで選べます。`;
    }

    if (locale === 'de-DE') {
        const uses = [
            'Er passt zu einer Vocal mit kurzen, präzisen Phrasen und zu einem Refrain, der direkt einsetzt.',
            'Du kannst ihn als Grundgerüst für enge Verse nutzen und den Refrain danach weiter öffnen.',
            'Er lässt der Vocal Platz, ohne dass der Track seine eigene Atmosphäre verliert.',
        ];
        return `${title} ist ein ${genre}-Instrumental mit den Untergenres ${subgenres}. Die Stimmung ist ${moods}. ${getTitleCue(beat.title, locale)} ${uses[variations]} Hör die offizielle Vorschau mit deiner Vocalidee an und wähle danach die passende BeatStars-Lizenz.`;
    }

    const uses = [
        'It fits a vocal built from short, direct phrases as well as a hook that enters early.',
        'Use it as the frame for tight verses, then leave the chorus room to open up.',
        'It keeps enough space around the vocal without flattening the track’s atmosphere.',
    ];
    return `${title} is a ${genre} instrumental with ${subgenres} cues. Its mood is ${moods}. ${getTitleCue(beat.title, locale)} ${uses[variations]} Preview it with your vocal idea, then choose the BeatStars license that fits the release.`;
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
