/**
 * Server-side search text for the lesson library. Built once per server
 * process and sent as two short lowercase strings per lesson, so the browser
 * filters and ranks without loading any article bodies:
 * - headings: words from the section headings,
 * - terms: words from the SEO keywords and the glossary terms the lesson uses.
 * A title match outranks the excerpt, the excerpt outranks a heading and a
 * heading outranks a keyword (search-match.ts, `scoreLesson`).
 *
 * The lesson bodies reach search through a separate digest
 * (/blog/search-digest.json, `searchDigest`): the words a lesson's text uses
 * that few other lessons do, and each commoner word in the lessons that use
 * it most. The list fetches it only once the reader starts a search, so
 * /blog itself stays as light as before.
 */

import type { BlogArticle } from '@/lib/blog-data';
import { termsIn } from '@/lib/blog/glossary';
import { findsWord, searchText, wordMatchers, writeDigest } from './search-match';

const ROLE_PREFIX = /^(?:hook|why it matters(?: in the (?:mix|session|room))?|science model|daw experiment|common mistake|producer takeaway)\s*:?\s*/i;

function headings(content: string): string[] {
    return [...content.matchAll(/^#{2,3}\s+(.+)$/gm)]
        .map((m) => m[1].replace(/\*\*/g, '').replace(ROLE_PREFIX, '').trim())
        .filter((h) => h && !/^(?:references|sources)$/i.test(h));
}

const STOP = new Set('an of to in on is it by or at as be do if so up we my me no the and for with you your are was were what when why how not from that this into than then its can does'.split(' '));
const tokens = (text: string) =>
    text
        .toLowerCase()
        .split(/[\s,;:!?·()"“”'‘’/]+/)
        .filter((w) => w.length > 1 && !STOP.has(w));

/**
 * True when `word` can be left out because `other` already finds it as a
 * whole word. The browser ranks a whole word (or its plural) above the start
 * of a longer one (search-match.ts), so "limiter" can go when "limiters" is
 * there, but "comp" stays beside "compression" and "pad" beside "padding".
 */
const covers = (other: string, word: string) => other === word || other === `${word}s` || other === `${word}es`;

/** The words not already found through a stronger field or their plural in the same one. */
function fresh(words: string[], stronger: string[]): string[] {
    const unique = [...new Set(words)].filter((w) => !stronger.some((s) => covers(s, w)));
    return unique.filter((w) => !unique.some((other) => other !== w && covers(other, w)));
}

function searchFields(article: BlogArticle): { headings: string; terms: string } {
    const shown = tokens(`${article.title} ${article.excerpt}`);
    const headingWords = fresh(tokens(headings(article.content).join(' ')), shown);
    const glossaryTerms = termsIn(article.content, article.category).flatMap((t) => [t.term, ...t.forms]);
    const termWords = fresh(tokens([...article.seo.keywords, ...glossaryTerms].join(' ')), [...shown, ...headingWords]);
    return { headings: headingWords.join(' '), terms: termWords.join(' ') };
}

// Keyed by the article object, so an edited lesson (a new object) is indexed again.
const cache = new WeakMap<BlogArticle, { headings: string; terms: string }>();

export function lessonSearchFields(article: BlogArticle): { headings: string; terms: string } {
    let fields = cache.get(article);
    if (fields === undefined) {
        fields = searchFields(article);
        cache.set(article, fields);
    }
    return fields;
}

/** A body word goes into the digest of every lesson that uses it while at most this many lessons do. */
const DIGEST_MAX_LESSONS = 5;

/**
 * A commoner body word still finds at least this many lessons (or every
 * lesson that uses it, if fewer do): it goes into the digest of the lessons
 * that use it most, until the search finds that many with the title,
 * excerpt, headings and terms. Without it "piano" (17 lessons), "hi-hat"
 * (19) and "rms" (8) found nothing, and "threshold" (31) three.
 */
const COMMON_WORD_LESSONS = 8;

/**
 * Numbers that are the names of instruments (drum machines, a bass synth): a reader searching "808"
 * means the sound, so these stay in the digest however many lessons use them.
 */
const NAMED_NUMBERS = new Set(['808', '909', '303']);

/**
 * Everyday words nobody searches a music library for. They stay in the
 * digest when a few lessons use them (they cost little there), but a common
 * one is not spread over the lessons that use it most. Words that are also
 * music terms (bar, key, hook, drop, space, behind, ahead, dry, warm) are not
 * here. Adverbs in -ly go the same way (`isEveryday`).
 */
const EVERYDAY = new Set(
    (
        'about above across after afterwards again against all almost alone along already also although always among another any anyone ' +
        'anything anyway anywhere apart around ask asked asking asks became because become becomes becoming been before began begin being ' +
        'below best better between beyond both bring brings came cannot case cases certain chance come comes coming could did different does ' +
        'doing done during each easier easy either else enough especially even ever every everyone everything everywhere exact except far ' +
        'few find finding finds fine found further gave get gets getting give given gives giving goes going gone good got great had happen ' +
        'happened happens has have having here however idea ideas instead itself just keep keeping keeps kept kind kinds knew know knowing ' +
        'known knows last later least less let lets like likely little lot lots made make makes making many may maybe mean means meant ' +
        'might more most much must near need needed needs neither never next nobody none nor nothing now nowhere often once one only onto ' +
        'other others otherwise our out over own perhaps plenty possible quite rather reason reasons said same saw say saying says see seeing ' +
        'seem seemed seems seen several should since some someone something sometimes somewhere soon such sure take taken takes taking tell ' +
        'telling tells than their them themselves there therefore these they thing things think thinking those though thought through thus ' +
        'together told too took toward towards tried tries try trying twice under unless until upon use used uses using usual usually very ' +
        'via want wanted wants way ways well went whatever whenever where whereas wherever whether which while who whole whom whose will ' +
        'within without worked working works would yet yours yourself two three four five six seven eight nine ten eleven twelve ' +
        'twenty thirty forty fifty hundred but yes see lesson lessons mistake mistakes people example examples including includes ' +
        'included following looking putting starting leaving noticing assuming watching touching letting meaning depending whichever ' +
        'general specific obvious ordinary similar standard useful worth current spent remember suggest suggests describe describes ' +
        'described evidence advice trouble day days hour hours weeks years written result results number numbers percent fewer ' +
        'friend authors colleagues adults'
    ).split(' '),
);
const isEveryday = (word: string) => EVERYDAY.has(word) || (word.length > 5 && word.endsWith('ly') && word !== 'early');

/**
 * The plain forms a past tense or a superlative comes from ("compared" from "compare", "pushed" from
 * "push", "biggest" from "big", "heavier" is left alone): a reader searches those, not this form.
 */
function plainForms(word: string): string[] {
    const m = word.match(/^(.{3,}?)(e?d|e?st)$/);
    if (!m) return [];
    const stem = m[1];
    const forms = [stem, `${stem}e`];
    if (/(.)\1$/.test(stem)) forms.push(stem.slice(0, -1));
    if (stem.endsWith('i')) forms.push(`${stem.slice(0, -1)}y`);
    return forms;
}

/** An in-text citation, "(Huron, 2006)" or "Juslin and Västfjäll (2008)": the names find nothing a reader looks for. */
const CITATION =
    /(?:\p{Lu}[\p{L}'’-]+(?:(?:,\s*|\s+and\s+|\s+&\s+)\p{Lu}[\p{L}'’-]+){0,5}(?:\s+and colleagues|\s+et al\.?)?\s*)?\((?:\p{Lu}[^()]*?)?\b(?:19|20)\d{2}[a-z]?(?:[;,][^()]*)?\)/gu;

/** A figure's caption and the labels drawn in it ("Bridge", "Ring"), at any depth of its spec. */
function figureText(value: unknown, key = ''): string[] {
    if (typeof value === 'string') return key === 'caption' || key === 'label' ? [value] : [];
    if (Array.isArray(value)) return value.flatMap((item) => figureText(item, key));
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => figureText(v, k));
    return [];
}

/**
 * The text a reader sees in a lesson besides its title, excerpt and
 * headings: the prose (no headings, which are indexed already, no sources
 * or citations, figure and demo lines, maths, code or link targets), the
 * "In short" points, the figures' captions and labels, and the quiz.
 */
function lessonText(article: BlogArticle): { prose: string; rest: string } {
    const prose = article.content
        .replace(/^#{2,3}\s+(?:references|sources)\s*$[\s\S]*?(?=^#{2}\s|(?![\s\S]))/gim, ' ')
        .replace(/^#{2,3}\s+.*$/gm, ' ')
        .replace(/^::.*$/gm, ' ')
        .replace(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/\]\([^)]*\)/g, ' ')
        .replace(/https?:\/\/\S+/g, ' ');
    const captions = Object.values(article.figures ?? {}).flatMap((figure) => figureText(figure));
    const quiz = (article.quiz ?? []).flatMap((question) => [question.q, ...question.options, question.why]);
    return { prose: prose.replace(CITATION, ' '), rest: [...(article.summary ?? []), ...captions, ...quiz].join('\n') };
}

/** Each word of a text from `lessonText` with how many times it is used there. */
function bodyWords(text: string): Map<string, number> {
    const words = new Map<string, number>();
    for (const raw of text.toLowerCase().split(/[^\p{L}\p{N}'’-]+/u)) {
        const word = raw.replace(/^['’-]+|['’-]+$/g, '').replace(/['’]s$/, '');
        if (word.length < 3 || STOP.has(word)) continue;
        // Bare numbers (years, pages, frequencies) find nothing useful; "sm7b", "la-2a" and an 808 stay.
        if (/^[\d.,-]+$/.test(word) && !NAMED_NUMBERS.has(word)) continue;
        words.set(word, (words.get(word) ?? 0) + 1);
    }
    return words;
}

let digestCache: { source: readonly BlogArticle[]; digest: Record<string, string> } | undefined;

/**
 * The digest (/blog/search-digest.json, read with `readDigest` in
 * search-match.ts): the words from each lesson's text that its title,
 * excerpt, headings and terms do not already find.
 * - Every word that at most DIGEST_MAX_LESSONS lessons use (counted in
 *   their prose when the lesson's prose has it), and any NAMED_NUMBERS,
 *   under the lesson's slug.
 * - Each commoner word in the lessons that use it most, until the search
 *   finds it in COMMON_WORD_LESSONS of them, listed once with those lessons.
 * The browser searches it last, so a body match never outranks a title.
 */
export function searchDigest(articles: readonly BlogArticle[]): Record<string, string> {
    if (digestCache?.source === articles) return digestCache.digest;
    const texts = articles.map(lessonText);
    const bodies = texts.map(({ prose, rest }) => bodyWords(`${prose}\n${rest}`));
    const lessonsUsing = new Map<string, number>();
    for (const words of bodies) for (const word of words.keys()) lessonsUsing.set(word, (lessonsUsing.get(word) ?? 0) + 1);
    // A word in a lesson's prose is rare by the prose that uses it, so a quiz or a caption elsewhere never moves it
    // out of that lesson's digest; one only in its quiz, captions or "In short" points is rare by all of its text.
    const proseWords = texts.map(({ prose }) => new Set(bodyWords(prose).keys()));
    const proseUsing = new Map<string, number>();
    for (const words of proseWords) for (const word of words) proseUsing.set(word, (proseUsing.get(word) ?? 0) + 1);
    const isRare = (word: string) => (lessonsUsing.get(word) ?? 0) <= DIGEST_MAX_LESSONS || NAMED_NUMBERS.has(word);
    const isRareIn = (i: number, word: string) => isRare(word) || (proseWords[i].has(word) && (proseUsing.get(word) ?? 0) <= DIGEST_MAX_LESSONS);
    const stronger = articles.map((article) => {
        const fields = lessonSearchFields(article);
        return { fields, indexed: [...tokens(`${article.title} ${article.excerpt}`), ...`${fields.headings} ${fields.terms}`.split(' ')] };
    });
    const rare = bodies.map((words, i) => fresh([...words.keys()].filter((word) => isRareIn(i, word)), stronger[i].indexed));

    // What the browser searches (search-match.ts): the list's fields and the digest so far, one text per lesson.
    const searched = articles.map((article, i) => {
        const { fields } = stronger[i];
        return searchText([article.title, article.excerpt, fields.headings, fields.terms, ...rare[i]].join('\n'));
    });
    // Each lesson's words by their first three letters, to find the forms a typed word matches ("skip": skips, skipped).
    const byStart = bodies.map((words) => {
        const groups = new Map<string, string[]>();
        for (const word of words.keys()) {
            const key = word.replace(/[-/]/g, '').slice(0, 3);
            groups.set(key, [...(groups.get(key) ?? []), word]);
        }
        return groups;
    });
    // A past tense or superlative of a word the lessons also use plainly ("compared", "biggest") is left to that word.
    const inflected = (word: string) => plainForms(word).some((form) => lessonsUsing.has(form));
    const common = new Map<string, number[]>();
    const candidates = [...lessonsUsing]
        .filter(([word]) => !isRare(word) && !isEveryday(word) && !inflected(word))
        .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    for (const [word] of candidates) {
        const [matcher] = wordMatchers(word);
        const key = matcher.word.slice(0, 3);
        let found = 0;
        // Lessons the search misses that use a form the word matches, with the form they use most.
        const missed: { i: number; form: string; uses: number }[] = [];
        searched.forEach((text, i) => {
            if (findsWord(text, matcher)) {
                found += 1;
                return;
            }
            let form = '';
            let uses = 0;
            let best = 0;
            for (const candidate of byStart[i].get(key) ?? []) {
                if (!findsWord(searchText(` ${candidate}`), matcher)) continue;
                const n = bodies[i].get(candidate) ?? 0;
                uses += n;
                if (n > best) [form, best] = [candidate, n];
            }
            if (form) missed.push({ i, form, uses });
        });
        const missing = Math.min(COMMON_WORD_LESSONS, found + missed.length) - found;
        if (missing <= 0) continue;
        missed.sort((a, b) => b.uses - a.uses || a.i - b.i);
        for (const { i, form } of missed.slice(0, missing)) {
            common.set(form, [...(common.get(form) ?? []), i]);
            searched[i] += ` ${searchText(form)}`;
        }
    }

    const words: Record<string, string> = {};
    articles.forEach((article, i) => {
        words[article.slug] = rare[i].join(' ');
    });
    // Positions count the slugs in the order the browser reads them back.
    const position = new Map(Object.keys(words).map((slug, at) => [slug, at]));
    const digest = writeDigest(words, new Map([...common].map(([word, lessons]) => [word, lessons.map((i) => position.get(articles[i].slug) ?? 0)])));
    digestCache = { source: articles, digest };
    return digest;
}
