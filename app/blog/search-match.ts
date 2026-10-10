/**
 * How a typed query matches a lesson in the library search (BlogIndex.tsx).
 *
 * A typed word matches at the start of a word ("comp" finds "compression").
 * One of five or more letters also matches inside a word ("chain" finds
 * "sidechain"), scored far below a word start; a shorter one never does, so
 * "eq" does not find every lesson that says "frequency" and "ears" does not
 * find "hears". A whole word scores above the start of a longer one, so
 * "ear" lists "Fresh ears" before "Early reflections". Hyphens do not count:
 * "lofi" finds "lo-fi", "deesser" finds "de-esser" and "midside" finds
 * "mid/side" (`searchText` adds the joined form of each hyphenated or
 * slashed word to the text searched, and a typed word loses its hyphens).
 * On top of the word as typed:
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
    /** The word as typed (lowercase, without hyphens). */
    word: string;
    /** Every accepted form as a whole word (or with a plural ending). */
    whole: RegExp;
    /** Every accepted form at the start of a word. */
    start: RegExp;
    /** Forms that may also match inside a word (typed words of five or more letters and their spellings). */
    inside: string[];
}

/** A hyphen between two letters or digits ("lo-fi", "la-2a"). */
const INNER_HYPHEN = /(?<=[\p{L}\p{N}])-(?=[\p{L}\p{N}])/gu;
/** A hyphen or slash between two letters or digits ("lo-fi", "mid/side"). */
const INNER_JOIN = /(?<=[\p{L}\p{N}])[-/](?=[\p{L}\p{N}])/gu;
/** Words joined by hyphens or a slash ("de-esser", "mid/side"). */
const COMPOUND = /[\p{L}\p{N}]+(?:[-/][\p{L}\p{N}]+)+/gu;

/**
 * Lowercase text as the search reads it: the text itself, then the joined
 * form of each hyphenated (or slashed) word ("lo-fi" adds "lofi", "mid/side"
 * adds "midside"), so a reader who types either form finds it and "fi"
 * still finds "lo-fi".
 */
export function searchText(text: string): string {
    const lower = text.toLowerCase();
    const compounds = lower.match(COMPOUND);
    if (!compounds) return lower;
    return `${lower} ${[...new Set(compounds)].map((word) => word.replace(/[-/]/g, '')).join(' ')}`;
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
        whole: new RegExp(`${WORD_START}(?:${alternatives.join('|')})(?:e?s)?(?![\\p{L}\\p{N}])`, 'u'),
        start: new RegExp(`${WORD_START}(?:${alternatives.join('|')})`, 'u'),
        inside: typed.filter((form) => form.length >= 5),
    };
}

/**
 * One matcher per distinct word; a trailing "'s", stray punctuation around a
 * word and its hyphens are ignored ("de-esser" searches "deesser", which
 * `searchText` adds for every "de-esser" in a lesson).
 */
export function wordMatchers(query: string): WordMatcher[] {
    const words = query
        .toLowerCase()
        .split(/\s+/)
        .map((raw) => {
            const word = raw.replace(/^["'“‘(]+|[.,;:!?"'”’)-]+$/g, '').replace(/['’]s$/, '').replace(INNER_HYPHEN, '');
            return word || raw;
        })
        .filter(Boolean);
    return [...new Set(words)].map(matcher);
}

/**
 * Points per field (title, excerpt, headings, keywords and terms, body
 * digest): [as a whole word, at the start of a longer word, inside a word].
 * Inside a word is worth less than a word start in any later field but the
 * digest, so "hears" in a title never outranks "ears" in an excerpt.
 */
const FIELD_POINTS: [number, number, number][] = [
    [10, 7, 2],
    [5, 3.5, 1],
    [3, 2, 0.6],
    [1.5, 1, 0.3],
    [1, 0.7, 0.2],
];

/** A word as the typo fallback knows it: four or more letters or digits, at least one of them a letter. */
const VOCAB_WORD = /(?=[\p{N}]*\p{L})[\p{L}\p{N}]{4,}/gu;

/**
 * The words a typo can be corrected to (`correctWord`): every word of four
 * or more characters in the text searched, with how many lessons use it.
 * Pass each lesson's fields as `searchText` returns them.
 */
export function searchVocabulary(lessons: Iterable<string[]>): Map<string, number> {
    const counts = new Map<string, number>();
    for (const fields of lessons) {
        for (const word of new Set(fields.join(' ').match(VOCAB_WORD) ?? [])) counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    return counts;
}

/** True when b is a with one letter added, dropped or changed, or two neighbours swapped. */
function oneEditApart(a: string, b: string): boolean {
    if (a === b || Math.abs(a.length - b.length) > 1) return false;
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (a.length === b.length) {
        if (a.slice(i + 1) === b.slice(i + 1)) return true;
        return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
    }
    return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

/**
 * The search's typo fallback (BlogIndex uses it only when a query finds no
 * lesson at all): the word one edit away from `word` that the most lessons
 * use ("compresion" -> "compression"), or null. A word under four letters
 * is left alone, since one edit turns it into too many others, and so is
 * one that starts with a different letter, where typos are rare.
 */
export function correctWord(word: string, vocabulary: Map<string, number>): string | null {
    if (word.length < 4 || !/\p{L}/u.test(word)) return null;
    let best: string | null = null;
    let uses = 0;
    for (const [candidate, count] of vocabulary) {
        if (candidate[0] !== word[0] || count < uses || !oneEditApart(word, candidate)) continue;
        if (count > uses || (best !== null && candidate < best)) {
            best = candidate;
            uses = count;
        }
    }
    return best;
}

/** 0 when a word matches nowhere; otherwise each word scores its best field, plus a bonus for the whole phrase in the title. */
export function scoreLesson(fields: string[], words: WordMatcher[], phrase: string): number {
    let total = 0;
    for (const m of words) {
        let best = 0;
        fields.forEach((text, i) => {
            const [whole, start, inside] = FIELD_POINTS[i];
            if (!text || whole <= best) return;
            if (m.whole.test(text)) best = whole;
            else if (start > best && m.start.test(text)) best = start;
            else if (inside > best && m.inside.some((form) => text.includes(form))) best = inside;
        });
        if (best === 0) return 0;
        total += best;
    }
    if (words.length < 2) return total;
    // "lo-fi beats" in a title is the phrase "lofi beats" as typed with a hyphen, or "lo fi beats" typed with a space.
    const title = fields[0];
    const inTitle = title.includes(phrase) || title.replace(INNER_JOIN, '').includes(phrase) || title.replace(INNER_JOIN, ' ').includes(phrase);
    return inTitle ? total + 5 : total;
}
