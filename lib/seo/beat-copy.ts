import type { BeatProduct } from '@/lib/catalog';
import beatStarsFilterIndexJson from '@/data/beatstars-filter-index.json';
import { getEditorialBeatWorld } from '@/lib/catalog/beatstars-genre-index';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';
type OfficialTrackMetadata = {
    bpm: number | null;
    key: string | null;
    duration: number | null;
    genres: string[];
    tags: string[];
};

const beatStarsFilterIndex = beatStarsFilterIndexJson as Record<string, OfficialTrackMetadata>;

function officialTrackMetadata(beat: BeatProduct) {
    return beatStarsFilterIndex[beat.beatstarsTrackId];
}

/** Prefer the official-metadata-derived world over legacy catalog copy. */
function displayGenre(beat: BeatProduct) {
    return getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
}

function formatDuration(seconds?: number | null) {
    if (!seconds) return undefined;
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function trackFactLine(beat: BeatProduct, locale: BeatLocale) {
    const metadata = officialTrackMetadata(beat);
    if (!metadata) return '';

    const facts = [
        metadata.bpm ? `${metadata.bpm} BPM` : undefined,
        metadata.key && metadata.key !== 'None' ? metadata.key : undefined,
        formatDuration(metadata.duration),
    ].filter(Boolean);
    const genres = metadata.genres.slice(0, 3).join(', ');

    if (locale === 'ja-JP') {
        return `${facts.join('・')}${genres ? `。BeatStars公式ジャンルは${genres}` : ''}。`;
    }
    if (locale === 'de-DE') {
        return `${facts.join(' · ')}${genres ? `; offizielle BeatStars-Genres: ${genres}` : ''}.`;
    }
    return `${facts.join(' · ')}${genres ? `; official BeatStars genres: ${genres}` : ''}.`;
}

function arrangementCue(beat: BeatProduct, locale: BeatLocale) {
    const metadata = officialTrackMetadata(beat);
    const bpm = metadata?.bpm || 100;
    const duration = metadata?.duration || 210;
    const source = [beat.title, ...(metadata?.genres || []), ...(metadata?.tags || [])].join(' ');
    const isClub = /house|club|dance|jersey|techno|edm/i.test(source);
    const isDark = /dark|cyberpunk|phonk|drill|grime|hard/i.test(source);

    if (locale === 'ja-JP') {
        if (isClub) return 'キックの流れを保ちやすく、フックやドロップを中心に組み立てるクラブ志向のリリースに向きます。';
        if (isDark) return bpm >= 120 ? '速いテンポの緊張感と低域の圧力を活かし、短いバーと強いフックを交互に置けます。' : '重いポケットと暗い余白を活かし、言葉を前に出すタイトなバースに向きます。';
        return duration >= 240 ? '長めの展開を使い、バースから大きなコーラスへ段階的に広げられます。' : '無駄を抑えた展開で、早い段階からフックを印象づけやすい構成です。';
    }
    if (locale === 'de-DE') {
        if (isClub) return 'Der konstante Kick-Flow eignet sich für Club-Releases, die auf Hook, Build-up und Drop setzen.';
        if (isDark) return bpm >= 120 ? 'Das schnelle Spannungsfeld und der Druck im Low-End tragen kurze Bars und einen harten Hook-Wechsel.' : 'Der schwere Pocket und die dunklen Freiräume geben präzisen Verses Platz.';
        return duration >= 240 ? 'Die längere Form lässt Verse schrittweise in einen größeren Refrain wachsen.' : 'Die kompakte Form bringt den Hook früh auf den Punkt.';
    }
    if (isClub) return 'Its steady kick flow suits club-facing releases built around a hook, build-up and drop.';
    if (isDark) return bpm >= 120 ? 'The fast tension and low-end pressure support short bars with a hard hook switch.' : 'The heavy pocket and darker negative space leave room for precise verses.';
    return duration >= 240 ? 'The longer arrangement can move gradually from close verses into a wider chorus.' : 'The compact arrangement gets the hook into focus early.';
}

function localizedTitle(beat: BeatProduct, locale: BeatLocale) {
    return beat.localizedTitle?.[locale] || beat.title;
}

export function getBeatSummary(beat: BeatProduct, locale: BeatLocale) {
    const metadata = officialTrackMetadata(beat);
    const fact = [
        metadata?.bpm ? `${metadata.bpm} BPM` : undefined,
        metadata?.key && metadata.key !== 'None' ? metadata.key : undefined,
        metadata?.genres[0],
    ].filter(Boolean).join(' · ');
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
    const summary = localizedPitches[displayGenre(beat)] || localizedPitches.default;
    return `${fact ? `${fact}. ` : ''}${summary} ${endings[locale]}`;
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
    const genre = displayGenre(beat);
    const factLine = trackFactLine(beat, locale);
    const arrangement = arrangementCue(beat, locale);
    const variations = titleSeed(beat.id) % 3;

    if (locale === 'ja-JP') {
        const uses = [
            '語尾を切るラップ、レイヤーしたアドリブ、輪郭の強いメロディーを試すとポケットを判断しやすくなります。',
            '最初は8小節のバースを録り、次にサビの音域を重ねると声との相性を確認できます。',
            '低域と競合しない声の位置を探しながら、フックのキーワードを早めに置く使い方が効果的です。',
        ];
        return `${title}はVirzy Gunsによる${genre}インストゥルメンタルです。${factLine} ${getTitleCue(beat.title, locale)} ${arrangement} ${uses[variations]} プレビューで声との相性を確認し、最新ライセンス条件をこのページ内のBeatStars公式チェックアウトで確定できます。`;
    }

    if (locale === 'de-DE') {
        const uses = [
            'Teste kurze Phrasen, gestapelte Ad-libs und eine klar gezeichnete Melodie, um den Vocal-Pocket schnell zu prüfen.',
            'Nimm zuerst acht Takte Verse auf und lege danach die Hook-Lage darüber, um den Stimmumfang zu testen.',
            'Setze die Schlüsselzeile der Hook früh und suche einen Vocal-Bereich, der nicht mit dem Low-End kollidiert.',
        ];
        return `${title} ist ein ${genre}-Instrumental von Virzy Guns. ${factLine} ${getTitleCue(beat.title, locale)} ${arrangement} ${uses[variations]} Hör die Vorschau mit deiner Vocalidee an und bestätige die aktuellen Lizenzbedingungen im eingebetteten offiziellen BeatStars-Checkout.`;
    }

    const uses = [
        'Test short phrases, stacked ad-libs and one clearly shaped melody to find the vocal pocket quickly.',
        'Record an eight-bar verse first, then layer the hook range over it to check how the track carries your voice.',
        'Place the hook’s key line early and find a vocal register that stays clear of the low end.',
    ];
    return `${title} is a ${genre} instrumental produced by Virzy Guns. ${factLine} ${getTitleCue(beat.title, locale)} ${arrangement} ${uses[variations]} Preview it with your vocal idea, then confirm the current license terms in the embedded official BeatStars checkout.`;
}

export function getBeatMetaDescription(beat: BeatProduct, locale: BeatLocale) {
    const title = localizedTitle(beat, locale);
    const firstLicense = beat.licenses[0]?.name;

    if (locale === 'de-DE') {
        return `${title}: ${displayGenre(beat)}-Beat von ${beat.producer}. Vorschau anhören,${firstLicense ? ` ${firstLicense}-Lizenz` : ' Lizenz'} prüfen und im eingebetteten BeatStars-Checkout kaufen.`;
    }

    if (locale === 'ja-JP') {
        return `${title}: ${beat.producer}による${displayGenre(beat)}ビート。試聴し、このページ内のBeatStars公式チェックアウトでライセンスを購入できます。`;
    }

    return `${title}: ${displayGenre(beat)} beat by ${beat.producer}. Preview the track, review${firstLicense ? ` the ${firstLicense} license` : ' the available licenses'}, and buy through the embedded BeatStars checkout.`;
}
