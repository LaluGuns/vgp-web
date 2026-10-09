/**
 * Figure dialects (docs/DESIGN.md, "Figure dialects"). Every lesson group
 * draws its figures and demo displays in one dialect of the same figure
 * language: its own accent and a small set of drawing choices that say
 * what kind of lesson it is. Data, numbers and layout never change between
 * dialects; only how the marks are drawn does.
 *
 * Pure data, so the server (figures, article and category pages) and the
 * client (listening demos) read the same tokens. Anything without a known
 * category falls back to the technical dialect, which is the site accent.
 */

import type { BlogArticle } from '@/lib/blog-data';

export type DialectName = 'technical' | 'music' | 'mind' | 'business';

export interface Dialect {
    name: DialectName;
    /** The data the caption asks you to look at. Contrast on --surface: see ACCENT_CONTRAST. */
    accent: string;
    /** Width of an accent line, in figure units (about px). */
    line: number;
    /** Ends and corners of lines. */
    cap: 'butt' | 'round';
    join: 'miter' | 'round';
    /**
     * Grid rules. `dash` empty is a solid hairline. `minor` and `major` are
     * white opacities, kept low so the rules stay texture, never content.
     */
    rule: { dash: string; cap: 'butt' | 'round'; width: number; minor: number; major: number };
    /** Dash of reference and "before" lines. Always dashed, in every dialect. */
    refDash: string;
    /** Corner of bars, cells, notes and hits: a radius, or 'pill' for half the height. */
    corner: number | 'pill';
    /** Corner of flow steps. */
    node: number | 'pill';
    /**
     * How a single value is marked: `square` a measured point, `head` a note
     * head, `ring` a point held in focus, `tick` an entry on a ruled line.
     */
    marker: 'square' | 'head' | 'ring' | 'tick';
    /** Tabular numerals line up like a meter or a ledger column. */
    tabular: boolean;
    /** Axis titles set in italic, the way a score sets expression marks. */
    italicTitles: boolean;
}

export const DIALECTS: Record<DialectName, Dialect> = {
    /** An instrument panel: hairline graticule, measured points, square ends. */
    technical: {
        name: 'technical',
        accent: '#7dd3fc',
        line: 1.75,
        cap: 'butt',
        join: 'miter',
        rule: { dash: '', cap: 'butt', width: 1, minor: 0.045, major: 0.1 },
        refDash: '4 3',
        corner: 1,
        node: 2,
        marker: 'square',
        tabular: true,
        italicTitles: false,
    },
    /** Score paper: staff rulings, bar lines, note heads, round ends. */
    music: {
        name: 'music',
        accent: '#fdba74',
        line: 2.25,
        cap: 'round',
        join: 'round',
        rule: { dash: '', cap: 'round', width: 1, minor: 0.07, major: 0.16 },
        refDash: '6 4',
        corner: 'pill',
        node: 7,
        marker: 'head',
        tabular: false,
        italicTitles: true,
    },
    /** A field of attention: dotted rules, soft nodes, points held in a focus ring. */
    mind: {
        name: 'mind',
        accent: '#f9abcb',
        line: 2,
        cap: 'round',
        join: 'round',
        rule: { dash: '0 4', cap: 'round', width: 1.4, minor: 0.2, major: 0.34 },
        refDash: '5 4',
        corner: 4,
        node: 'pill',
        marker: 'ring',
        tabular: false,
        italicTitles: false,
    },
    /** A ledger: ruled rows, a closing double rule, square ends, figures in a column. */
    business: {
        name: 'business',
        accent: '#8ad8af',
        line: 1.75,
        cap: 'butt',
        join: 'miter',
        rule: { dash: '', cap: 'butt', width: 1, minor: 0.07, major: 0.3 },
        refDash: '3 3',
        corner: 0,
        node: 0,
        marker: 'tick',
        tabular: true,
        italicTitles: false,
    },
};

const GROUP: Record<BlogArticle['category'], DialectName> = {
    'mixing-mastering': 'technical',
    'audio-science': 'technical',
    'sound-design': 'technical',
    'vocal-production': 'technical',
    'production-tips': 'technical',
    songwriting: 'music',
    'arrangement-groove': 'music',
    'genre-guides': 'music',
    'music-psychology': 'mind',
    'producer-psychology': 'mind',
    'licensing-guide': 'business',
};

const has = (record: object, key: string | undefined): boolean => key !== undefined && Object.prototype.hasOwnProperty.call(record, key);

/** The dialect for a category slug. Unknown or missing: technical. */
export function dialectForCategory(category: string | undefined): Dialect {
    return DIALECTS[has(GROUP, category) ? GROUP[category as BlogArticle['category']] : 'technical'];
}

/** A dialect by name, or an already resolved one. Unknown or missing: technical. */
export function resolveDialect(dialect: Dialect | string | undefined): Dialect {
    if (dialect && typeof dialect === 'object') return dialect;
    return DIALECTS[has(DIALECTS, dialect) ? (dialect as DialectName) : 'technical'];
}
