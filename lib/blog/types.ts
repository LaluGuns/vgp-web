/**
 * Learning extras for articles: diagrams, quiz and summary.
 * Authoring rules live in docs/ARTICLES.md.
 */

// ── Figures ──────────────────────────────────────────────────────────
// Every figure is drawn as SVG on the server. Values are normalised
// (0 to 1) unless a unit is given. Qualitative shapes must not pretend
// to be measurements: no numeric axis on curve or arrangement figures.

interface FigureBase {
    /** One or two sentences under the figure. Says what to notice. */
    caption: string;
    /** Screen-reader description of what the drawing shows. */
    alt: string;
}

export interface CurveFigure extends FigureBase {
    type: 'curve';
    /** Point labels along the x axis, e.g. song sections. */
    x: string[];
    /** Shorter labels for phones. Same length as `x`. */
    xShort?: string[];
    /** What the vertical axis means, e.g. "Energy". */
    yLabel: string;
    /** What the points along the bottom are, e.g. "Song section" or "Exposures". */
    xLabel?: string;
    /**
     * The first solid series is the one to look at, with its points. `dotted`: a second line the caption
     * also names, in accent dots. `dashed`: a reference, in grey.
     */
    series: { label?: string; values: number[]; dashed?: boolean; dotted?: boolean }[];
    /** Vertical markers at an x index (fractions allowed). */
    marks?: { at: number; label: string }[];
    /** Straight segments instead of a smooth curve, for values that jump (a bass line, steps). */
    straight?: boolean;
}

export interface NotesFigure extends FigureBase {
    type: 'notes';
    /** Piano roll: start and length in beats, pitch as a MIDI number (60 is middle C). */
    notes: { start: number; length: number; pitch: number; label?: string; muted?: boolean }[];
    /** Beats per bar. Default 4. */
    perBar?: number;
    /** Chord symbols above the roll, at a beat. */
    chords?: { at: number; label: string }[];
}

export interface BarsFigure extends FigureBase {
    type: 'bars';
    min: number;
    max: number;
    unit?: string;
    /** `open`: no upper limit. The bar runs to the end of the scale and fades out there, with no end mark. */
    bars: { label: string; value: number; display?: string; dim?: boolean; open?: boolean }[];
    reference?: { value: number; label: string };
    /**
     * Values are powers of ten (3 is 1,000, 6 is 1,000,000). Draws a tick at
     * each power inside min to max and says "log scale", so the bar lengths
     * are read as ratios. Put the real numbers in `display`.
     */
    log?: boolean;
}

export type RhythmHit = number | { step: number; offset?: number; level?: number };

export interface RhythmFigure extends FigureBase {
    type: 'rhythm';
    /** Steps shown. Default 16 (one bar of 16ths). */
    steps?: number;
    /** Steps per beat. Default 4. */
    perBeat?: number;
    rows: {
        label: string;
        hits: RhythmHit[];
        /** 0.5 is straight, 0.66 is triplet swing. Moves every second step. */
        swing?: number;
        note?: string;
        /**
         * The row the caption asks you to look at. Its hits are drawn in the
         * accent; once any row has focus, every other row stays grey, moved
         * hits included. Without any focus, only moved hits are in the accent.
         */
        focus?: boolean;
    }[];
}

export interface SineSpec {
    cycles: number;
    amp?: number;
    /** Degrees. */
    phase?: number;
}

interface TraceBase {
    label?: string;
    dashed?: boolean;
    /** A second trace the caption also names: accent dots instead of a solid line. */
    dotted?: boolean;
    muted?: boolean;
    /** Flat ceiling at this level (0 to 1). */
    clip?: number;
    /** Round the clip with tanh instead of a hard flat top. */
    soft?: boolean;
    /** Multiply before clipping. */
    gain?: number;
    /** Round to the levels a fixed-point format of this many bits can store. */
    quantize?: number;
}

export type SignalTrace = TraceBase &
    (
        | ({ kind: 'sine'; decay?: number } & SineSpec)
        | { kind: 'sum'; parts: SineSpec[] }
        | { kind: 'envelope'; points: [number, number][] }
        | {
              kind: 'hits';
              at: number[];
              amp?: number[];
              decay?: number;
              cycles?: number;
              /** Draw the level envelope instead of the oscillation. */
              outline?: boolean;
              /**
               * Run the hits through a simulated compressor. threshold is a level from 0 to 1,
               * attack and release are fractions of the plot width.
               */
              compress?: { threshold: number; ratio: number; attack: number; release: number };
          }
        | { kind: 'noise'; amp: number; seed?: number }
    );

export interface SignalRow {
    label?: string;
    traces: SignalTrace[];
    /** Envelope rows sit on a baseline instead of a centre line. */
    unipolar?: boolean;
    /**
     * Horizontal guide lines, e.g. a threshold. y is -1 to 1 (0 to 1 when unipolar).
     * The label sits beside its line where no trace comes near it, or else past the line's
     * end, in a margin right of the plot. `short` is used on phones. Lines that share a
     * label (a plus and minus pair) are labelled once.
     */
    lines?: { y: number; label: string; short?: string }[];
    /** Vertical guide lines at a time from 0 to 1. */
    marks?: { t: number; label: string }[];
    /** Sample dots on a trace. `alias` draws the slower wave the samples also fit. */
    samples?: { count: number; trace?: number; hold?: boolean; alias?: boolean };
}

export interface SignalFigure extends FigureBase {
    type: 'signal';
    rows: SignalRow[];
}

export type EqBand = {
    /** highpass1 and lowpass1 are first-order (6 dB per octave); highpass and lowpass are second-order (12 dB). */
    type: 'bell' | 'lowshelf' | 'highshelf' | 'highpass' | 'lowpass' | 'highpass1' | 'lowpass1';
    freq: number;
    gain?: number;
    q?: number;
};

/** `dotted`: a second curve the caption also names, in accent dots (solid is the main one, dashed a reference, muted grey context). */
export type SpectrumCurve = { label?: string; dashed?: boolean; dotted?: boolean; muted?: boolean } & (
    | { kind: 'hump'; center: number; width: number; level?: number }
    | { kind: 'eq'; bands: EqBand[] }
    /** A signal mixed with a delayed copy of itself. mix is the copy's level relative to the original (1 = equal, -1 = flipped). */
    | { kind: 'comb'; delayMs: number; mix?: number }
    | { kind: 'slope'; dbPerOct: number; level?: number }
    | {
          kind: 'harmonics';
          f0: number;
          count: number;
          /** Each harmonic is level / n^rolloff. Default 1 (a saw-like 1/n). */
          rolloff?: number;
          /** Height of the fundamental, 0 to 1. Default 0.95. */
          level?: number;
          /** Odd harmonics only (square and triangle waves, symmetric clipping). */
          odd?: boolean;
      }
);

export interface SpectrumFigure extends FigureBase {
    type: 'spectrum';
    /** `level` shows where energy sits; `gain` shows an EQ or filter response in dB. */
    mode: 'level' | 'gain';
    curves: SpectrumCurve[];
    bands?: { from: number; to: number; label: string }[];
    marks?: { f: number; label: string }[];
    /** Hz. Default [20, 20000]. */
    range?: [number, number];
    /** Gain mode only: the plot spans plus and minus this many dB. Default 12. */
    db?: number;
    /** Gain mode only: an uneven range such as [-36, 6], for filters that only cut. Overrides db. */
    dbRange?: [number, number];
}

export interface TransferFigure extends FigureBase {
    type: 'transfer';
    /** `db` for compressors (input level in, output level out), `linear` for clipping shapes. */
    domain: 'db' | 'linear';
    curves: {
        label?: string;
        kind: 'linear' | 'compressor' | 'hardclip' | 'softclip';
        threshold?: number;
        ratio?: number;
        knee?: number;
        ceiling?: number;
        dashed?: boolean;
        /** A second curve the caption also names, in accent dots. */
        dotted?: boolean;
    }[];
}

export interface StereoFigure extends FigureBase {
    type: 'stereo';
    /** pan -1 (left) to 1 (right); depth 0 (front) to 1 (back); width 0 to 1 spread. fade 0 to 1 shows level lost. */
    items: { label: string; pan: number; depth?: number; width?: number; fade?: number }[];
    title?: string;
}

export interface FlowFigure extends FigureBase {
    type: 'flow';
    /** `focus`: the step the caption asks you to look at, drawn in the accent. Every other step stays grey. */
    steps: { label: string; note?: string; focus?: boolean }[];
    /** Draw an arrow from the last step back to `to` (index). */
    loop?: { to: number; label?: string };
}

export interface ArrangementFigure extends FigureBase {
    type: 'arrangement';
    sections: { label: string; short?: string; bars?: number }[];
    /**
     * levels: 0 to 1 per section, drawn as the height of the cell. 0 means
     * silent. `focus`: the layer the caption asks you to look at, drawn in
     * the accent; once any layer has focus, the others are grey. Without
     * any focus every layer is in the accent.
     */
    layers: { label: string; levels: number[]; focus?: boolean }[];
    /** Draw total density per section above the grid, derived from the layers. */
    density?: boolean;
}

export interface ScaleFigure extends FigureBase {
    type: 'scale';
    min: number;
    max: number;
    unit?: string;
    ticks?: number[];
    markers: { value: number; label: string; strong?: boolean }[];
    /** Spans below the line, grey context. `strong`: the range the caption points at, drawn in the accent. */
    ranges?: { from: number; to: number; label: string; strong?: boolean }[];
    /** Curved arrows below the line, e.g. a frequency folding to its alias. */
    arrows?: { from: number; to: number }[];
}

export type FigureSpec =
    | CurveFigure
    | NotesFigure
    | BarsFigure
    | RhythmFigure
    | SignalFigure
    | SpectrumFigure
    | TransferFigure
    | StereoFigure
    | FlowFigure
    | ArrangementFigure
    | ScaleFigure;

// ── Quiz ─────────────────────────────────────────────────────────────

export interface QuizQuestion {
    q: string;
    options: string[];
    /** Index into options. */
    answer: number;
    /** Shown after any choice. Explains why the answer is right. */
    why: string;
}
