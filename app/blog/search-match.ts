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
 *   so the house spelling never hides a lesson from a reader who types the other;
 * - a few words find what the lessons call by another name ("equaliser"
 *   finds "EQ", "procrastination" the lessons about being stuck and
 *   finishing, `SYNONYMS`), and a compound typed with a space reads as one
 *   word ("lo fi", "hi hat", `PHRASES`);
 * - a derived word also finds its plain word, scored a little lower
 *   ("muddy" finds "mud", "punchy" finds "punch", "moved" finds "move", `stems`);
 * - in a query of several words, one of three letters or fewer ("eq",
 *   "car", "mud") matches as a whole word or with an ending ("cars",
 *   "mixing", "muddy"), except a last word of one or two letters that may
 *   still be typed.
 * A query is read the way a reader asks it (`planQuery`): question words
 * ("how", "is", "my") are left out, and words like "fix" or "bad" rank the
 * lessons without being required. `searchLessons` lists the lessons with
 * every remaining word, rarer words weighing more, and falls back to typo
 * corrections and then to the lessons with most of the words.
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
    /** The plain word of a derived one ("mud" for "muddy", `stems`), scored below the word itself; null when there is none. */
    stem: RegExp | null;
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

/**
 * Words that find what the lessons call by another name, as whole words (a
 * trailing "*": from the start of a word). "equaliser" finds "EQ"; the
 * mindset words find the Producer Mindset lessons, which speak of
 * momentum, finishing, tweaking, perfection and constraints rather than of
 * motivation, procrastination or a block; "auto tune" finds pitch
 * correction; "sibilance" de-essing; "tinny" finds lessons about a thin sound; "wider" finds width; "hi-hat"
 * also finds "the hats"; "sub-bass" finds "sub"; "metronome" finds playing to the grid or a click track.
 */
const SYNONYMS: Record<string, string[]> = {
    equalizer: ['eq'],
    equaliser: ['eq'],
    equalization: ['eq'],
    equalisation: ['eq'],
    eq: ['eqing', 'eqed', 'equaliz*', 'equalis*'],
    tinny: ['thin'],
    sibilance: ['deess*'],
    sibilant: ['deess*'],
    autotune: ['retune*', 'pitch correct*'],
    motivation: ['momentum', 'finishing'],
    motivated: ['momentum', 'finishing'],
    unmotivated: ['momentum', 'finishing'],
    procrastination: ['momentum', 'finishing', 'tweak*'],
    procrastinate: ['momentum', 'finishing', 'tweak*'],
    procrastinating: ['momentum', 'finishing', 'tweak*'],
    overthinking: ['tweak*', 'perfection*', 'fear of commit*', 'choices'],
    overthink: ['tweak*', 'perfection*', 'fear of commit*', 'choices'],
    perfectionism: ['perfection*', 'tweak*'],
    perfectionist: ['perfection*', 'tweak*'],
    writersblock: ['blank', 'momentum', 'constraint*', 'rough idea*'],
    restbreak: ['fresh ears', 'ear fatigue', 'tired'],
    hitharder: ['impact*', 'punch*', 'bigger', 'contrast', 'weight'],
    sitinmix: ['pocket', 'buried', 'blend*', 'masking'],
    memorable: ['catchy', 'stick*', 'memor*', 'remember*'],
    catchy: ['memorable', 'stick*'],
    wider: ['wide', 'widen*', 'width'],
    widen: ['wide', 'widen*', 'width'],
    hihat: ['hat'],
    subbass: ['sub'],
    metronome: ['grid', 'click track'],
    metronomes: ['grid', 'click track'],
};

/**
 * Phrases read as one word: "writer's block" (and "creative block") for its
 * synonyms, and a compound typed with a space, which the lessons write
 * hyphenated or joined ("lo fi", "hi hat", "de esser", "side chain", "mid side"),
 * "take a break" for the lessons on fresh ears, "hit harder" for impact and
 * "sit in the mix" for the vocal pocket and masking.
 */
const PHRASES: [RegExp, string][] = [
    [/\b(?:writer['’]?s?|creative)\s+block\b/gu, 'writersblock'],
    [/\b(?:take|taking|took)\s+(?:a\s+)?breaks?\b/gu, 'restbreak'],
    [/\bmid\s+side\b/gu, 'midside'],
    [/\bhip\s+hop\b/gu, 'hiphop'],
    [/\bhits?\s+(?:harder|hard)\b/gu, 'hitharder'],
    [/\b(?:sit|sits|sitting)\s+(?:in\s+)?(?:the\s+)?mix\b/gu, 'sitinmix'],
    [/\bsub\s+bass\b/gu, 'subbass'],
    [/\b(lo|hi|de|auto|side|pre|high|low)\s+(fi|hats?|ess(?:er|ers|ing)|tuned?|chain(?:ed|ing)?|delay|pass(?:es)?)\b/gu, '$1$2'],
];

/**
 * Words a question is built from ("how", "is", "my", "a"): left out of the
 * search while another word is left, so "how loud should my master be"
 * searches "loud master".
 */
const QUESTION_WORDS = new Set(
    (
        'a an the is are am be been being was were to of in on at for from with without by about into onto over under ' +
        'and or but if than then as so too very just not no vs versus my your our their his her its i me we you they ' +
        'it this that these those there here how what why when where which who whom whose do does did doing done can ' +
        'could should would will shall may might must ever also have has had having less more much cant can’t dont ' +
        'doesnt isnt wont im ive between whats hows whys wheres whos thats theres 2 4 u ur'
    ).split(' '),
);

/**
 * Words that say what the reader wants done with the subject ("fix", "write",
 * "make", "use", "sound", "bad", "everything"): they rank a lesson that has them higher
 * but a lesson does not need them, so "how to fix a muddy mix" finds the
 * lessons about a muddy mix.
 */
const WANT_WORDS = new Set(
    (
        'make makes making made use uses using used fix fixes fixing fixed get gets getting got stop stopping need needs ' +
        'want wants help helps work works working good bad best better worse worst right wrong way ways tip tips trick ' +
        'tricks guide sound sounds sounding really actually properly correctly start starting improve improving learn ' +
        'learning thing things problem problems issue issues mistake mistakes aim set put try keep mean means matter ' +
        'matters happen happens go goes know tell explain explained explanation difference different rid remove ' +
        'removing reduce reducing avoid avoiding prevent deal handle music song songs track tracks ok okay setting settings ' +
        'write writes writing wrote written create creates creating everything anything something all always every'
    ).split(' '),
);

/** Words that end like a derived form without being one: "busy" is not "bus" with a y, "evening" not "even" with -ing. */
const NOT_DERIVED = new Set(
    (
        'busy tiny only very body many any every easy lazy crazy ready copy city party duty pretty entry early sorry worry ' +
        'hurry carry marry query story study business evening morning nothing something anything everything thing things ' +
        'string strings spring ring king during ceiling moment'
    ).split(' '),
);

/**
 * The plain word a derived one comes from, searched beside it and scored
 * below it: muddy and muddiness -> mud, boomy and boominess -> boom, punchy
 * -> punch, airy -> air, noisy -> noise, harshness -> harsh, muddier ->
 * muddy, louder -> loud, mixing -> mix, moved -> move, clipped -> clip, sibilant -> sibilance, memorable -> memory. A form of three letters is
 * searched as a whole word only ("airy" finds "air", not "airport"),
 * longer ones from the start of a word.
 */
function stems(word: string): { start: string[]; whole: string[] } {
    const start = new Set<string>();
    const wholeWords = new Set<string>();
    // A base of three letters or more; one ending in a doubled letter is also tried single ("mudd" -> "mud").
    const add = (base: string, addE = false) => {
        for (const form of /(.)\1$/.test(base) ? [base, base.slice(0, -1)] : [base]) {
            if (form.length >= 4) start.add(form);
            else if (form.length === 3) {
                wholeWords.add(form);
                if (addE && form === base) wholeWords.add(`${form}e`);
            }
        }
    };
    const fromY = (base: string) => {
        start.add(base);
        // "carried" also finds "carries".
        if (/[^aeiouy]y$/.test(base)) start.add(`${base.slice(0, -1)}ie`);
        if (!NOT_DERIVED.has(base) && /[^aeiouy]y$/.test(base) && !base.endsWith('ly')) add(base.slice(0, -1), true);
    };
    if (NOT_DERIVED.has(word) || word.length < 4) return { start: [], whole: [] };
    if (word.length >= 7 && word.endsWith('iness')) fromY(`${word.slice(0, -5)}y`);
    else if (word.length >= 7 && word.endsWith('ness')) add(word.slice(0, -4));
    else if (word.length >= 6 && /iest$/.test(word)) fromY(`${word.slice(0, -4)}y`);
    else if (word.length >= 5 && /ier$/.test(word)) fromY(`${word.slice(0, -3)}y`);
    else if (/[^aeiouy]y$/.test(word) && !word.endsWith('ly')) add(word.slice(0, -1), true);
    else if (word.length >= 6 && word.endsWith('ing')) add(word.slice(0, -3), true);
    else if (word.length >= 5 && word.endsWith('ied')) fromY(`${word.slice(0, -3)}y`);
    else if (word.length >= 5 && /[^e]ed$/.test(word)) add(word.slice(0, -2), true);
    else if (word.length >= 6 && /[ae]nt$/.test(word)) start.add(word.slice(0, -1));
    else if (word.length >= 8 && /[ai]ble$/.test(word)) add(word.slice(0, -4));
    else if (word.length >= 6 && /[^aeiou]est$/.test(word)) add(word.slice(0, -3));
    else if (word.length >= 6 && /[^aeiou]er$/.test(word)) add(word.slice(0, -2));
    start.delete(word);
    return { start: [...start], whole: [...wholeWords] };
}

const WORD_START = '(?:^|[^\\p{L}\\p{N}])';
/** A whole word, or that word plus a plural ending. */
const whole = (form: string) => `${escapeRegExp(form)}(?:e?s)?(?![\\p{L}\\p{N}])`;
/** A synonym as a pattern: a whole word, or from the start of a word with a trailing "*". */
const synonymPattern = (other: string) => (other.endsWith('*') ? escapeRegExp(other.slice(0, -1)) : whole(other));

function matcher(word: string, exact = false, synonyms = true): WordMatcher {
    // In a query of several words, a short one ("eq", "car", "sub") is a whole word, or one with an ending ("cars",
    // "mixing"): from a word start it would find almost anything ("car" in "careful"). Alone, it is still being typed.
    const short = exact && word.length <= 3;
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
    const named = new Set<string>();
    if (synonyms) for (const form of [...typed, ...fromStart]) for (const other of SYNONYMS[form] ?? []) named.add(synonymPattern(other));
    const startForms = [...new Set([...(short ? [] : typed), ...fromStart])].map(escapeRegExp);
    // Its endings, also the derived ones ("mud": muddy, muddier, muddiness), but never a NOT_DERIVED word ("bus": busy).
    const inflected = (form: string) => {
        const unlike = [...NOT_DERIVED].filter((other) => other.startsWith(form) && other !== form).map(escapeRegExp);
        const guard = unlike.length ? `(?!(?:${unlike.join('|')})(?![\\p{L}\\p{N}]))` : '';
        return `${guard}${escapeRegExp(form)}(?:${escapeRegExp(form.slice(-1))}?(?:ing|ed|er|ers|est|y|ier|iest|iness))?(?:e?s)?(?![\\p{L}\\p{N}])`;
    };
    const wholeForms = [...(short ? typed.map(inflected) : []), ...[...wholeWords].map(whole), ...named];
    const alternatives = [...startForms, ...wholeForms];
    const base = stems(word);
    const stemForms = [...base.start.map(escapeRegExp), ...base.whole.map(whole)];
    return {
        word,
        whole: new RegExp(`${WORD_START}(?:${[...startForms.map((f) => `${f}(?:e?s)?(?![\\p{L}\\p{N}])`), ...wholeForms].join('|')})`, 'u'),
        start: new RegExp(`${WORD_START}(?:${alternatives.join('|')})`, 'u'),
        inside: short ? [] : typed.filter((form) => form.length >= 5),
        stem: stemForms.length ? new RegExp(`${WORD_START}(?:${stemForms.join('|')})`, 'u') : null,
    };
}

/**
 * The words of a query, lowercase: a trailing "'s", stray punctuation
 * around a word and its hyphens are ignored ("de-esser" searches
 * "deesser", which `searchText` adds for every "de-esser" in a lesson),
 * and the PHRASES are joined.
 */
function queryTokens(query: string): string[] {
    let text = query.toLowerCase();
    for (const [pattern, joined] of PHRASES) text = text.replace(pattern, joined);
    const words = text
        .split(/\s+/)
        .map((raw) => {
            const word = raw.replace(/^["'“‘(]+|[.,;:!?"'”’)-]+$/g, '').replace(/['’]s$/, '').replace(INNER_HYPHEN, '');
            return word || raw;
        })
        .filter(Boolean);
    return [...new Set(words)];
}

/** One matcher per distinct word of the query, every word kept (see `planQuery` for what the list searches). */
export function wordMatchers(query: string): WordMatcher[] {
    return queryTokens(query).map((word) => matcher(word));
}

/**
 * What the digest makes sure a word of a lesson finds (search-index.ts): the word's own forms, without its SYNONYMS
 * ("hat" for "hi-hat") or the plain word of a derived one ("mud" for "muddy"), which the browser adds on top, and a
 * short word ("sub") as a whole word, the way a query of several words searches it.
 */
export function digestMatcher(word: string): WordMatcher {
    const [token = word] = queryTokens(word);
    return { ...matcher(token, true, false), stem: null };
}

/** What a query searches: the words a lesson must have, the words that only rank, and the phrase for the title bonus. */
export interface QueryPlan {
    required: WordMatcher[];
    optional: WordMatcher[];
    /** The searched words in the order typed, for the bonus when the title has them together. */
    phrase: string;
}

/**
 * Question words are left out while another word is left, and the WANT_WORDS
 * only rank while a subject is left: "is clipping bad" needs "clipping",
 * ranks "bad", and leaves out "is". A query of nothing else searches those.
 */
export function planQuery(query: string): QueryPlan {
    const tokens = queryTokens(query);
    const kept = tokens.filter((word) => !QUESTION_WORDS.has(word));
    const words = kept.length ? kept : tokens;
    const subject = words.filter((word) => !WANT_WORDS.has(word));
    const required = subject.length ? subject : words;
    const optional = subject.length ? words.filter((word) => WANT_WORDS.has(word)) : [];
    // The last word while it is still being typed ("how to fix a mu") keeps finding words that start with it.
    const typing = /\S$/.test(query) ? tokens[tokens.length - 1] : null;
    const make = (word: string) => matcher(word, words.length > 1 && !(word === typing && word.length <= 2));
    return { required: required.map(make), optional: optional.map(make), phrase: words.join(' ') };
}

/**
 * Points per field (title, excerpt, headings, keywords and terms, words the
 * lesson text uses three times or more, the rest of the lesson text):
 * [as a whole word, at the start of a longer word, inside a word, as the
 * plain word of a derived one]. Inside a word is worth less than a word
 * start in any later field but the lesson text, so "hears" in a title never
 * outranks "ears" in an excerpt; the plain word ("mud" for "muddy") scores
 * a little over half the word itself.
 */
const FIELD_POINTS: [number, number, number, number][] = [
    [10, 7, 2, 6],
    [5, 3.5, 1, 3],
    [3, 2, 0.6, 1.8],
    [1.5, 1, 0.3, 0.9],
    [1.25, 0.9, 0.25, 0.75],
    [1, 0.7, 0.2, 0.6],
];

/** A word as the typo fallback knows it: four or more letters or digits, at least one of them a letter. */
const VOCAB_WORD = /(?=[\p{N}]*\p{L})[\p{L}\p{N}]{4,}/gu;

/**
 * The words a typo can be corrected to (`correctWord`): every word of four
 * or more characters in the text searched (a hyphenated one as written),
 * with how many lessons use it,
 * and each word in SYNONYMS with how many lessons use what it stands for
 * ("eqalizer" becomes "equalizer", which finds every lesson about EQ).
 * Pass each lesson's fields as `searchText` returns them.
 */
export function searchVocabulary(lessons: Iterable<string[]>): Map<string, number> {
    const counts = new Map<string, number>();
    const names = [...new Set(Object.values(SYNONYMS).flat())].map((name) => ({ name, pattern: new RegExp(`${WORD_START}${synonymPattern(name)}`, 'u') }));
    const named = new Map<string, number>();
    for (const fields of lessons) {
        const text = fields.join(' ');
        const tokens = new Map<string, number>();
        for (const word of text.match(VOCAB_WORD) ?? []) tokens.set(word, (tokens.get(word) ?? 0) + 1);
        // The joined form `searchText` adds once for "de-esser" counts as "de-esser", the way the lesson writes it,
        // and as itself only where the lesson also writes it that way.
        for (const compound of new Set(text.match(COMPOUND) ?? [])) {
            const joined = compound.replace(/[-/]/g, '');
            const left = (tokens.get(joined) ?? 0) - 1;
            if (left < 0) continue;
            tokens.set(compound, 1);
            if (left > 0) tokens.set(joined, left);
            else tokens.delete(joined);
        }
        for (const word of tokens.keys()) counts.set(word, (counts.get(word) ?? 0) + 1);
        for (const { name, pattern } of names) if (pattern.test(text)) named.set(name, (named.get(name) ?? 0) + 1);
    }
    for (const [word, others] of Object.entries(SYNONYMS)) {
        const n = Math.max(counts.get(word) ?? 0, ...others.map((other) => named.get(other) ?? 0));
        if (n > 0) counts.set(word, n);
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

/** True when b is a with one letter doubled ("paning", "panning") or a doubled letter made single ("threshhold"). */
function doubledApart(a: string, b: string): boolean {
    if (Math.abs(a.length - b.length) !== 1) return false;
    const [short, long] = a.length < b.length ? [a, b] : [b, a];
    let i = 0;
    while (i < short.length && short[i] === long[i]) i++;
    return long.slice(i + 1) === short.slice(i) && (long[i] === long[i - 1] || long[i] === long[i + 1]);
}

/** Between two words as many lessons use, the one written without a hyphen ("sidechain", not "side-chain"), then the alphabet. */
const spelledBefore = (a: string, b: string) => {
    const [ja, jb] = [/[-/]/.test(a), /[-/]/.test(b)];
    return ja !== jb ? jb : a < b;
};

/**
 * The search's typo fallback (BlogIndex uses it only when a query finds no
 * lesson at all): the word one edit away from `word` that the most lessons
 * use ("compresion" -> "compression", "deeser" -> "de-esser"), or null. A letter typed once where
 * the word has it twice, or twice where it has it once, is the commonest
 * slip, so that edit wins over any other ("deeser" is "de-esser", not
 * "denser"). A word under four letters is left alone, since one edit turns
 * it into too many others, and so is one that starts with a different
 * letter, where typos are rare.
 */
export function correctWord(word: string, vocabulary: Map<string, number>): string | null {
    if (word.length < 4 || !/\p{L}/u.test(word)) return null;
    let best: string | null = null;
    let bestDoubled = false;
    let uses = 0;
    for (const [candidate, count] of vocabulary) {
        // "de-esser" is compared as typed without its hyphen, and given back as the lesson writes it.
        const joined = candidate.replace(/[-/]/g, '');
        if (joined[0] !== word[0] || !oneEditApart(word, joined)) continue;
        const doubled = doubledApart(word, joined);
        if (best !== null && (doubled !== bestDoubled ? !doubled : count < uses || (count === uses && !spelledBefore(candidate, best)))) continue;
        best = candidate;
        bestDoubled = doubled;
        uses = count;
    }
    return best;
}

/** The key of the digest (/blog/search-digest.json) that is not a lesson; a slug never starts with "#". */
const DIGEST_COMMON = '#common';

/**
 * Lesson positions (ascending) as capital letters, each the step from the one before:
 * "Z" for every 25 and one of "A"-"Y" for the rest, so 0, 3, 40 is "ADZO".
 */
function encodePositions(positions: number[]): string {
    let out = '';
    let last = 0;
    for (const position of positions) {
        const step = position - last;
        out += 'Z'.repeat(Math.floor(step / 25)) + String.fromCharCode(65 + (step % 25));
        last = position;
    }
    return out;
}

function decodePositions(code: string): number[] {
    const out: number[] = [];
    let at = 0;
    for (const letter of code) {
        if (letter === 'Z') {
            at += 25;
        } else {
            at += letter.charCodeAt(0) - 65;
            out.push(at);
        }
    }
    return out;
}

/**
 * The digest as search-index.ts (`searchDigest`) writes it: one key per
 * lesson in catalogue order, with the words few lessons use, those the
 * lesson uses three times or more first ("piano tape|cassette hiss"); and
 * under "#common" each commoner word once, followed by the positions of the
 * lessons that use it three times or more, a dot and the positions of the
 * others ("pianoAF.ZC", `encodePositions`).
 */
export function writeDigest(
    words: Record<string, { strong: string[]; rest: string[] }>,
    common: Map<string, { strong: number[]; rest: number[] }>,
): Record<string, string> {
    const code = (positions: number[]) => encodePositions([...positions].sort((a, b) => a - b));
    const lessons = Object.fromEntries(
        Object.entries(words).map(([slug, { strong, rest }]) => [slug, strong.length ? `${strong.join(' ')}|${rest.join(' ')}` : rest.join(' ')]),
    );
    return {
        ...lessons,
        [DIGEST_COMMON]: [...common].map(([word, { strong, rest }]) => `${word}${code(strong)}.${code(rest)}`).join(' '),
    };
}

/** A lesson's text in the digest: the words it uses three times or more, and the rest. */
export interface DigestWords {
    strong: string;
    rest: string;
}

/** slug -> the lowercase words from the lesson's text that the digest (`writeDigest`) carries. Anything else is left out. */
export function readDigest(data: Record<string, unknown>): Record<string, DigestWords> {
    const words: Record<string, DigestWords> = {};
    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('#') || typeof value !== 'string') continue;
        const cut = value.indexOf('|');
        words[key] = cut < 0 ? { strong: '', rest: value } : { strong: value.slice(0, cut), rest: value.slice(cut + 1) };
    }
    const slugs = Object.keys(words);
    const add = (positions: string, word: string, field: keyof DigestWords) => {
        for (const position of decodePositions(positions)) {
            const lesson = words[slugs[position]];
            if (lesson) lesson[field] = lesson[field] ? `${lesson[field]} ${word}` : word;
        }
    };
    const common = data[DIGEST_COMMON];
    if (typeof common === 'string') {
        for (const entry of common.split(' ')) {
            // "pianoAF.ZC"; one without a dot (an older digest) has no strong lessons.
            const m = entry.match(/^([^A-Z.]+)([A-Z]*)(?:\.([A-Z]*))?$/);
            if (!m) continue;
            if (m[3] === undefined) add(m[2], m[1], 'rest');
            else {
                add(m[2], m[1], 'strong');
                add(m[3], m[1], 'rest');
            }
        }
    }
    return words;
}

/** True when `text` (as `searchText` returns it) has a match for the word anywhere, as `scoreLesson` would count it. */
export function findsWord(text: string, m: WordMatcher): boolean {
    return m.start.test(text) || m.inside.some((form) => text.includes(form)) || (m.stem?.test(text) ?? false);
}

/**
 * A word's points in a lesson's fields (FIELD_POINTS): its best field, plus a trace of what it scores in the others,
 * too little to pass any other difference, so of two lessons that tie, the one that also has the word elsewhere
 * comes first ("sibilance" in the excerpt and the text before "sibilance" in the excerpt only). 0 where it matches
 * nowhere.
 */
function wordPoints(fields: string[], m: WordMatcher): number {
    let best = 0;
    let sum = 0;
    fields.forEach((text, i) => {
        if (!text) return;
        const [whole, start, inside, stem] = FIELD_POINTS[i];
        let points = 0;
        if (m.whole.test(text)) points = whole;
        else if (m.start.test(text)) points = start;
        else if (m.stem?.test(text)) points = stem;
        else if (m.inside.some((form) => text.includes(form))) points = inside;
        best = Math.max(best, points);
        sum += points;
    });
    return best + 0.0001 * (sum - best);
}

/** True when the title has the searched words together ("lo-fi beats" is "lofi beats" or "lo fi beats" as typed). */
function phraseInTitle(title: string, phrase: string): boolean {
    return title.includes(phrase) || title.replace(INNER_JOIN, '').includes(phrase) || title.replace(INNER_JOIN, ' ').includes(phrase);
}

/** 0 when a word matches nowhere; otherwise each word scores its best field, plus a bonus for the whole phrase in the title. */
export function scoreLesson(fields: string[], words: WordMatcher[], phrase: string): number {
    let total = 0;
    for (const m of words) {
        const points = wordPoints(fields, m);
        if (points === 0) return 0;
        total += points;
    }
    return words.length > 1 && phraseInTitle(fields[0], phrase) ? total + 5 : total;
}

/** What the list shows for a query (`searchLessons`). */
export interface SearchResult {
    /** One score per lesson, in the order given: 0 for a lesson the list leaves out. */
    scores: number[];
    /** The query with its typos corrected ("compresion" -> "compression"), when that is what found the lessons. */
    corrected: string | null;
    /** True when no lesson has every word, and the scores list the lessons with the most of them. */
    partial: boolean;
}

/**
 * A word that more than this share of the lessons has ("mix", "vocal", "sound") cannot tell them apart: it ranks
 * them but is not required, as long as the query has a rarer word.
 */
const COMMON_SHARE = 0.4;

/**
 * The library search (BlogIndex). `lessons` holds each lesson's fields as
 * `searchText` returns them, in FIELD_POINTS order. A query is read with
 * `planQuery`, and a word most lessons have only ranks (COMMON_SHARE). A
 * lesson is listed when it has the words the query needs: every one of up
 * to two, all but one of three or more. It scores each word's best field,
 * weighted by how few lessons have that word, so in "how do i finish a
 * song" the lessons about finishing come before those that only say
 * "song"; a lesson with every word, the words together in its title, or a
 * title made mostly of them ("Phase is timing with consequences" for
 * "phase") scores more, and a ranking-only word adds a little. With
 * `fallbacks` (once the lesson text has been searched): a query that finds
 * nothing is tried again with each word that finds nothing corrected
 * (`correctWord`, from `vocabulary`); if that finds nothing either, the
 * lessons with the most of the words are listed (`partial`).
 */
export function searchLessons(lessons: string[][], query: string, fallbacks: boolean, vocabulary: () => Map<string, number>): SearchResult {
    const none: SearchResult = { scores: lessons.map(() => 0), corrected: null, partial: false };
    const plan = planQuery(query);
    if (!plan.required.length) return none;
    const N = lessons.length;
    const pointsOf = (m: WordMatcher) => lessons.map((fields) => wordPoints(fields, m));
    const weightOf = (row: number[]) => {
        const n = row.filter((p) => p > 0).length;
        return n ? Math.log(1 + N / n) : 0;
    };
    const run = (words: WordMatcher[]) => {
        let rows = words.map(pointsOf);
        let optional = plan.optional.map(pointsOf);
        // The words most lessons have only rank, while a rarer one is left.
        const common = rows.map((row) => row.filter((p) => p > 0).length > COMMON_SHARE * N);
        if (common.some((c) => !c) && common.some(Boolean)) {
            optional = [...optional, ...rows.filter((_, w) => common[w])];
            rows = rows.filter((_, w) => !common[w]);
        }
        const weights = rows.map(weightOf);
        const extras = optional.map((row) => ({ row, weight: 0.15 * weightOf(row) }));
        const meanWeight = weights.reduce((a, b) => a + b, 0) / (weights.length || 1);
        const needed = rows.length <= 2 ? rows.length : rows.length - 1;
        const scores = lessons.map((fields, i) => {
            let total = 0;
            let hits = 0;
            rows.forEach((row, w) => {
                if (row[i] > 0) {
                    hits += 1;
                    total += weights[w] * row[i];
                }
            });
            for (const { row, weight } of extras) total += weight * row[i];
            if (hits === rows.length && rows.length > 2) total += 2 * meanWeight;
            if (hits > 1 && phraseInTitle(fields[0], plan.phrase)) total += 5 * meanWeight;
            // A short title the words fill comes first among equals: "Phase is timing ..." before "Phase and polarity ...".
            const titleWords = fields[0].split(/\s+/).filter(Boolean).length || 1;
            const inTitle = words.filter((m) => m.start.test(fields[0]) || m.stem?.test(fields[0])).length;
            if (inTitle) total += (0.4 * inTitle) / titleWords;
            return { total, hits };
        });
        return { scores, needed, found: rows.map((row) => row.some((p) => p > 0)), all: words.map((m) => pointsOf(m).some((p) => p > 0)) };
    };
    const listed = (result: ReturnType<typeof run>, need: number) => result.scores.map(({ total, hits }) => (hits >= need && hits > 0 ? total : 0));
    const first = run(plan.required);
    const found = listed(first, first.needed);
    if (found.some((s) => s > 0) || !fallbacks) return { ...none, scores: found };

    // Each word that finds nothing, corrected by one letter; the query is shown with the corrections in place.
    let result = first;
    if (first.all.some((ok) => !ok)) {
        const words = vocabulary();
        let shown = query.toLowerCase().trim();
        const fixed = plan.required.map((m, w) => {
            const to = first.all[w] ? null : correctWord(m.word, words);
            if (!to) return m;
            shown = shown.replace(new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(m.word)}(?![\\p{L}\\p{N}])`, 'u'), `$1${to}`);
            return matcher(to.replace(INNER_HYPHEN, ''), plan.required.length + plan.optional.length > 1);
        });
        if (fixed.some((m, w) => m !== plan.required[w])) {
            const again = run(fixed);
            const scores = listed(again, again.needed);
            if (scores.some((s) => s > 0)) return { scores, corrected: shown, partial: false };
            result = again;
        }
    }
    // The lessons with the most of the words.
    const most = Math.max(...result.scores.map(({ hits }) => hits));
    if (most === 0 || plan.required.length < 2) return none;
    return { scores: listed(result, most), corrected: null, partial: true };
}
