/**
 * How a typed query matches a lesson in the library search (BlogIndex.tsx).
 *
 * A typed word of four or more letters matches anywhere in a word; a shorter
 * one ("eq", "808") only at the start of a word, so "eq" does not find every
 * lesson that says "frequency". On top of the word as typed:
 * - a plural also searches its singular ("hooks" finds "hook", "808s" finds
 *   "808", "melodies" finds "melody"), from the start of a word only, and a
 *   singular of three letters or fewer only as a whole word, so "pads" never
 *   finds "padding" and "ears" never finds "early";
 * - a singular ending in a consonant and y also searches its -ies plural
 *   ("melody" finds "melodies");
 * - British and American spellings find each other (colour/color,
 *   centre/center, licence/license, -ise/-ize, -yse/-yze, -isation/-ization),
 *   so the house spelling never hides a lesson from a reader who types the other.
 */

export interface WordMatcher {
    /** The word as typed (lowercase). */
    word: string;
    /** Every accepted form at the start of a word. */
    start: RegExp;
    /** Forms that may also match inside a word (typed words of four or more letters and their spellings). */
    inside: string[];
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** British and American forms of the same word, tried in this order (longer ones first); the first pair that fits wins. */
const SPELLINGS: [string, string][] = [
    ['centred', 'centered'],
    ['centring', 'centering'],
    ['centre', 'center'],
    ['colour', 'color'],
    ['behaviour', 'behavior'],
    ['favour', 'favor'],
    ['flavour', 'flavor'],
    ['humour', 'humor'],
    ['licenc', 'licens'],
    ['defenc', 'defens'],
    ['practis', 'practic'],
    ['analogue', 'analog'],
    ['catalogue', 'catalog'],
    ['dialogue', 'dialog'],
    ['programme', 'program'],
    ['artefact', 'artifact'],
    ['grey', 'gray'],
    ['fibre', 'fiber'],
    ['modelling', 'modeling'],
    ['modelled', 'modeled'],
    ['labelling', 'labeling'],
    ['labelled', 'labeled'],
    ['levelling', 'leveling'],
    ['levelled', 'leveled'],
    ['signalling', 'signaling'],
    ['travelling', 'traveling'],
    ['channelling', 'channeling'],
    ['cancelled', 'canceled'],
];

/** -ise/-ize and -isation/-ization (also while still being typed: "normalis", "quantisa"), after a stem of four letters or more. */
const ISE = /^(\p{L}{4,})i([sz])(e[sdr]?|ers|ing?|a(?:t(?:i(?:o(?:ns?)?)?)?)?|able)?$/u;
/** -yse/-yze: analyse, analyser, paralysed. */
const YSE = /^(\p{L}{3,})y([sz])(e[sdr]?|ers|ing?)?$/u;

function spellings(word: string): string[] {
    const out: string[] = [];
    for (const [uk, us] of SPELLINGS) {
        if (word.includes(uk)) {
            out.push(word.replace(uk, us));
            break;
        }
        if (word.includes(us)) {
            out.push(word.replace(us, uk));
            break;
        }
    }
    const swap = (m: RegExpMatchArray, middle: string) => `${m[1]}${middle}${m[2] === 's' ? 'z' : 's'}${m[3] ?? ''}`;
    const ise = word.match(ISE);
    if (ise) out.push(swap(ise, 'i'));
    const yse = word.match(YSE);
    if (yse) out.push(swap(yse, 'y'));
    return out;
}

/** Words that end in s without being plurals, where the cut form would find a different common word. */
const NOT_PLURAL = new Set(['its', 'news']);

/**
 * Singular forms of a plural: melodies -> melody, patches -> patch, buses -> bus,
 * hooks -> hook, eqs -> eq. Never cuts "ss", "us" or "is". A cut form of three
 * letters or fewer is only ever searched as a whole word (see `matcher`).
 */
function singulars(word: string): string[] {
    const out: string[] = [];
    if (word.length > 4 && word.endsWith('ies')) out.push(`${word.slice(0, -3)}y`);
    if (word.length > 4 && /(?:ch|sh|x|z|s)es$/.test(word)) out.push(word.slice(0, -2));
    if (word.length > 2 && word.endsWith('s') && !/(?:ss|us|is)$/.test(word) && !NOT_PLURAL.has(word)) out.push(word.slice(0, -1));
    return out;
}

const WORD_START = '(?:^|[^\\p{L}\\p{N}])';
/** A whole word, or that word plus a plural ending. */
const whole = (form: string) => `${escapeRegExp(form)}(?:e?s)?(?![\\p{L}\\p{N}])`;

function matcher(word: string): WordMatcher {
    const typed = [word, ...spellings(word)];
    const fromStart = new Set<string>();
    const wholeWords = new Set<string>();
    for (const singular of singulars(word)) {
        for (const form of [singular, ...spellings(singular)]) {
            if (form.length >= 4) fromStart.add(form);
            else wholeWords.add(form);
        }
    }
    if (word.length > 3 && /[^aeiou]y$/.test(word)) fromStart.add(`${word.slice(0, -1)}ies`);
    const alternatives = [...new Set([...typed, ...fromStart])].map(escapeRegExp);
    alternatives.push(...[...wholeWords].map(whole));
    return {
        word,
        start: new RegExp(`${WORD_START}(?:${alternatives.join('|')})`, 'u'),
        inside: typed.filter((form) => form.length >= 4),
    };
}

/** One matcher per distinct word; a trailing "'s" and stray punctuation around a word are ignored. */
export function wordMatchers(query: string): WordMatcher[] {
    const words = query
        .toLowerCase()
        .split(/\s+/)
        .map((raw) => {
            const word = raw.replace(/^["'“‘(]+|[.,;:!?"'”’)]+$/g, '').replace(/['’]s$/, '');
            return word || raw;
        })
        .filter(Boolean);
    return [...new Set(words)].map(matcher);
}

/** Points per field (title, excerpt, headings, keywords and terms, body digest): [at a word start, inside a word]. */
const FIELD_POINTS: [number, number][] = [
    [10, 7],
    [5, 4],
    [3, 2],
    [1.5, 1],
    [1, 0.5],
];

/** 0 when a word matches nowhere; otherwise each word scores its best field, plus a bonus for the whole phrase in the title. */
export function scoreLesson(fields: string[], words: WordMatcher[], phrase: string): number {
    let total = 0;
    for (const m of words) {
        let best = 0;
        fields.forEach((text, i) => {
            if (!text || FIELD_POINTS[i][0] <= best) return;
            if (m.start.test(text)) best = FIELD_POINTS[i][0];
            else if (FIELD_POINTS[i][1] > best && m.inside.some((form) => text.includes(form))) best = FIELD_POINTS[i][1];
        });
        if (best === 0) return 0;
        total += best;
    }
    return words.length > 1 && fields[0].includes(phrase) ? total + 5 : total;
}
