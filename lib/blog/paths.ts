/**
 * Learning paths: each category read in a deliberate order, so a reader
 * can start at lesson one and keep going. Articles not listed in an
 * order follow the listed ones in catalogue order, unless OFF_PATH
 * keeps them out of every path.
 */

import { articles, categories, type BlogArticle, type Category } from '../blog-data';

/** Curated reading order per category. Slugs only. */
const ORDER: Partial<Record<BlogArticle['category'], string[]>> = {
    'songwriting': [
        'why-the-first-3-seconds-decide-the-whole-song',
        'the-one-note-hook-that-still-works',
        'how-tension-makes-a-melody-ask-a-question',
        'why-repetition-becomes-addictive-instead-of-boring',
        'how-lyric-rhythm-carries-emotion-before-meaning',
        'why-your-verse-may-be-too-complete',
        'the-science-of-leaving-space-before-the-title',
        'how-contrast-makes-a-chorus-feel-expensive',
        'the-chorus-trick-that-feels-bigger-without-getting-louder',
        'why-familiar-chords-can-still-feel-fresh',
    ],
    'arrangement-groove': [
        'the-hidden-energy-curve-behind-professional-songs',
        'the-density-ladder-producers-use-without-naming-it',
        'why-intros-fail-when-they-explain-too-much',
        'why-pre-choruses-are-pressure-cookers',
        'why-the-second-verse-needs-a-mutation-not-more-stuff',
        'why-removing-one-layer-can-make-the-drop-hit-harder',
        'how-silence-becomes-a-production-weapon',
        'how-one-percussion-sound-can-reset-attention',
        'why-background-details-should-enter-like-plot-twists',
        'the-outro-mistake-that-weakens-replay-value',
        'why-tiny-timing-differences-create-human-feel',
        'swing-explained-without-mystical-language',
        'why-groove-lives-between-grid-and-body',
        'why-syncopation-wakes-up-the-listener',
        'the-math-of-a-head-nod',
        'how-tempo-changes-perceived-emotion',
        'how-kick-placement-changes-perceived-weight',
        'the-late-snare-illusion-in-modern-records',
        'why-rushed-vocals-can-feel-more-urgent',
        'why-silence-before-the-beat-feels-physical',
    ],
    'sound-design': [
        'why-timbre-tells-the-brain-what-this-is',
        'warm-dark-and-dull-are-not-the-same-sound',
        'why-brightness-is-not-the-same-as-clarity',
        'why-attack-time-changes-emotional-intent',
        'why-noise-can-make-synths-feel-alive',
        'how-distortion-creates-size-without-volume',
        'the-physics-of-bass-on-small-speakers',
        'why-layered-sounds-often-get-smaller',
        'the-sound-design-reason-a-hook-feels-branded',
        'how-one-texture-can-imply-an-entire-world',
    ],
    'vocal-production': [
        'why-a-great-vocal-starts-before-the-microphone',
        'how-headphone-balance-changes-performance',
        'room-reflections-eq-your-vocal-recording',
        'a-clipped-take-stays-clipped',
        'why-proximity-effect-is-friend-and-trap',
        'how-breath-can-make-a-vocal-feel-closer',
        'the-emotion-hidden-in-consonants',
        'the-vocal-comp-mistake-that-kills-humanity',
        'how-pitch-correction-changes-perceived-confidence',
        'why-doubling-works-when-listeners-do-not-notice',
        'why-ad-libs-are-arrangement-not-decoration',
        'the-quiet-vocal-detail-that-sounds-expensive',
    ],
    'mixing-mastering': [
        'why-louder-is-not-always-bigger',
        'monitoring-level-changes-the-balance-you-hear',
        'why-reference-tracks-are-calibration-not-imitation',
        'the-masking-problem-producers-hear-as-mud',
        'masking-why-vocals-drown-even-when-fader-goes-up',
        'the-solo-button-lies-about-eq',
        'hard-panning-does-not-cure-masking',
        'how-eq-becomes-attention-design',
        'stop-high-passing-everything-by-default',
        'why-depth-is-a-contrast-illusion',
        'why-mono-reveals-what-stereo-hides',
        'mid-side-widening-moves-the-center-too',
        'stereo-low-end-is-a-translation-decision',
        'phase-vs-polarity-kick-bass-will-thank-you',
        'compression-ratio-what-4-to-1-actually-means',
        'how-compression-changes-motion-not-level',
        'clip-gain-and-automation-before-compression',
        'parallel-compression-is-not-half-compression',
        'transient-shaper-vs-compressor-punch-is-a-shape',
        'what-bus-compression-glue-actually-does',
        'sidechain-is-more-than-kick-ducking-bass',
        'dynamic-eq-vs-multiband-compression',
        'the-mix-decision-that-makes-vocals-feel-expensive',
        'plugin-order-changes-what-each-processor-hears',
        'why-reverb-can-push-emotion-forward-or-backward',
        'early-reflections-place-a-sound-the-tail-sets-the-room',
        'when-reverb-masks-the-next-line',
        'reverb-on-bass-is-not-forbidden',
        'the-too-clean-problem-in-digital-mixes',
        'saturation-clipping-limiting-three-flavors-of-loud',
        'why-lufs-is-not-a-magic-number',
        'loudness-and-dynamic-range-are-different-readings',
        'the-streaming-loudness-myth-that-refuses-to-die',
        'why-loud-masters-can-sound-smaller-after-normalization',
        'the-difference-between-impact-and-level',
        'the-final-loudness-push-that-can-cost-emotion',
        'limiter-release-reaches-into-the-groove',
        'heavy-limiting-changes-the-tone-of-a-master',
        'why-clipping-can-be-aesthetic-but-risky',
        'why-true-peak-matters-after-encoding',
        'how-mastering-changes-translation-not-personality',
        'mastering-eq-starts-with-the-big-picture',
        'how-sequencing-changes-perceived-quality',
        'why-delivery-specs-save-the-song',
    ],
    'audio-science': [
        'sampling-is-taking-photos-of-air',
        'bit-depth-is-about-noise-not-magic-warmth',
        'architecture-of-infinite-headroom-32-bit-float',
        'why-aliasing-is-a-ghost-frequency-problem',
        'fourier-turns-sound-into-ingredients',
        'fft-for-producers-how-to-read-spectrum-analyzer',
        'filters-are-shape-machines',
        'why-resonance-can-sing-or-destroy-a-mix',
        'phase-explained-without-panic',
        'what-a-correlation-meter-actually-tells-you',
        'what-convolution-reverb-is-doing',
        'why-latency-changes-performance-feel',
        'why-your-low-end-lies-in-a-small-room',
        'every-plugin-is-math-wearing-an-interface',
    ],
    'music-psychology': [
        'why-expectation-drives-musical-emotion',
        'why-the-brain-loves-patterns-that-almost-break',
        'how-surprise-works-without-confusing-the-listener',
        'listeners-bring-genre-expectations-into-your-song',
        'major-happy-minor-sad-is-too-simple',
        'why-a-hook-must-be-predictable-and-unstable',
        'why-a-song-grows-on-you-with-repeated-plays',
        'why-repeated-speech-starts-sounding-like-song',
        'how-attention-moves-through-a-mix',
        'why-sonic-contrast-resets-fatigue',
        'how-music-creates-tension-before-lyrics-explain-it',
        'the-memory-trigger-inside-familiar-sounds',
        'why-sad-music-can-feel-good',
        'emotion-felt-and-emotion-recognized-are-different',
    ],
    'producer-psychology': [
        'why-fresh-ears-are-a-real-production-tool',
        'how-references-reduce-ego-in-the-room',
        'why-endless-tweaking-is-often-fear',
        'the-brain-cost-of-too-many-plugin-choices',
        'how-constraints-make-taste-sharper',
        'why-vibe-needs-measurable-decisions',
        'psychology-of-trusting-a-rough-idea',
        'danger-of-mixing-attached-to-the-demo',
        'why-finishing-is-separate-from-creating',
        'why-great-producers-protect-momentum',
    ],
    'production-tips': [
        'how-to-choose-the-perfect-beat',
        'understanding-bpm-and-key-matching',
        'essential-mixing-tips-for-home-recording',
    ],
    'genre-guides': [
        'trap-beats-anatomy-of-the-perfect-808',
        'phonk-production-dark-melodies',
        'rnb-instrumentals-smooth-progressions',
        'producing-city-pop-background-music-for-creators',
        'cyberpunk-jazz-production-for-creator-videos',
        'neo-synthwave-music-for-coding-and-tech-content',
    ],
    'licensing-guide': [
        'beat-licensing-explained',
        'what-rights-do-you-get-with-each-license',
        'spotify-streaming-vs-flow-creator-license',
        'commercial-use-vs-personal-use',
    ],
};

/**
 * Posts that stay in the library but on no learning path: studio notes
 * and product stories, which are not lessons and should never be a
 * path's "next lesson" or its last one.
 */
const OFF_PATH = new Set<string>(['i-built-flow-deep-work-music-and-a-pomodoro-timer']);

export interface LearningPath {
    category: Category;
    articles: BlogArticle[];
}

function buildPath(category: Category): LearningPath {
    const order = ORDER[category.slug as BlogArticle['category']] ?? [];
    const rank = (slug: string) => {
        const i = order.indexOf(slug);
        return i === -1 ? order.length : i;
    };
    const sorted = articles
        .map((article, index) => ({ article, index }))
        .filter(({ article }) => article.category === category.slug && !OFF_PATH.has(article.slug))
        .sort((a, b) => rank(a.article.slug) - rank(b.article.slug) || a.index - b.index)
        .map(({ article }) => article);
    return { category, articles: sorted };
}

export const learningPaths: LearningPath[] = categories.map(buildPath).filter((p) => p.articles.length > 0);

export function getPath(categorySlug: string): LearningPath | undefined {
    return learningPaths.find((p) => p.category.slug === categorySlug);
}

export interface PathPosition {
    path: LearningPath;
    index: number;
    prev?: BlogArticle;
    next?: BlogArticle;
}

export function getPathPosition(article: BlogArticle): PathPosition | undefined {
    const path = getPath(article.category);
    if (!path) return undefined;
    const index = path.articles.findIndex((a) => a.slug === article.slug);
    if (index === -1) return undefined;
    return { path, index, prev: path.articles[index - 1], next: path.articles[index + 1] };
}

/** What a lesson contains, for path listings: "3 diagrams · listening demo · quiz". */
export function lessonFeatures(article: BlogArticle): string[] {
    const figures = (article.content.match(/^::figure\s+\S+/gm) ?? []).length;
    const demos = (article.content.match(/^::demo\s+\S+/gm) ?? []).length;
    const features: string[] = [];
    if (figures) features.push(figures === 1 ? '1 diagram' : `${figures} diagrams`);
    if (demos) features.push(demos === 1 ? 'listening demo' : `${demos} listening demos`);
    if (article.quiz?.length) features.push('quiz');
    return features;
}
