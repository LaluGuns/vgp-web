// Optional per-lesson copy. Everything not set here comes from the lesson.
//
// cover:   head/sub for the first slide, the figure it shows, and for a
//          signal figure which rows (the cover figure gets no slide of its own).
// figures: per figure id, a shorter headline, the one-line note under the
//          drawing, rows to keep, or skip.
// quiz:    which quiz question to use (default 0).
export interface FigureOverride {
    head?: string;
    note?: string;
    rows?: number[];
    skip?: boolean;
}

export interface CarouselOverride {
    cover?: { head?: string; sub?: string; figure?: string; rows?: number[] };
    figures?: Record<string, FigureOverride>;
    quiz?: number;
}

export const overrides: Record<string, CarouselOverride> = {
    'sampling-is-taking-photos-of-air': {
        cover: {
            head: 'Why 44.1 kHz stops at 22 kHz',
            sub: 'The sample rate sets the highest frequency a file can hold: half of it, and nothing above.',
        },
    },
    'how-compression-changes-motion-not-level': {
        cover: {
            head: 'Same compressor. Two different snares.',
            sub: 'Attack time decides whether the crack of a hit gets through.',
            figure: 'attack',
            rows: [1, 2],
        },
        figures: {
            curve: { head: '4:1 lets 1 dB out for every 4 dB in', note: '' },
            release: { head: 'Release decides if it breathes', note: 'Let gain reduction return to zero before the next hit, or every hit after the first is held down.' },
        },
    },
};
