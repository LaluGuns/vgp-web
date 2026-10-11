import type { EqBand, SignalFigure, SignalRow, SignalTrace, SineSpec, SpectrumCurve, SpectrumFigure, TransferFigure } from '@/lib/blog/types';
import {
    Axis,
    C,
    ClosingRule,
    Corners,
    Label,
    Point,
    RefLine,
    Rule,
    Svg,
    Title,
    areaFill,
    clamp,
    dialectOf,
    dots,
    draw,
    legend,
    linePath,
    placeInRows,
    textWidth,
    type Anchor,
    type Dialect,
    type DialectProp,
    type LegendItem,
    type Placed,
} from './svg';

const TAU = Math.PI * 2;

// ── Signal: waveforms over time, one plot per row ──

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * A feed-forward compressor run over a level envelope: static curve in dB,
 * then one-pole attack and release smoothing on the gain reduction.
 * Returns the linear gain at any t from 0 to 1.
 */
function compressorGain(
    level: (t: number) => number,
    c: { threshold: number; ratio: number; attack: number; release: number },
): (t: number) => number {
    const n = 2000;
    const gains = new Float64Array(n + 1);
    const toDb = (v: number) => 20 * Math.log10(Math.max(1e-5, v));
    const thresholdDb = toDb(c.threshold);
    const coef = (time: number) => (time <= 0 ? 0 : Math.exp(-1 / (time * n)));
    const aA = coef(c.attack);
    const aR = coef(c.release);
    let gr = 0;
    for (let i = 0; i <= n; i++) {
        const over = toDb(level(i / n)) - thresholdDb;
        const target = over > 0 ? over * (1 - 1 / c.ratio) : 0;
        const a = target > gr ? aA : aR;
        gr = a * gr + (1 - a) * target;
        gains[i] = 10 ** (-gr / 20);
    }
    return (t) => gains[Math.min(n, Math.max(0, Math.round(t * n)))];
}

const sine = (s: SineSpec, t: number) => (s.amp ?? 1) * Math.sin(TAU * s.cycles * t + ((s.phase ?? 0) * Math.PI) / 180);

function traceFn(trace: SignalTrace): (t: number) => number {
    let base: (t: number) => number;
    switch (trace.kind) {
        case 'sine':
            base = (t) => sine(trace, t) * (trace.decay ? Math.exp(-trace.decay * t) : 1);
            break;
        case 'sum':
            base = (t) => trace.parts.reduce((sum, part) => sum + sine(part, t), 0);
            break;
        case 'envelope': {
            const pts = trace.points;
            base = (t) => {
                if (t <= pts[0][0]) return pts[0][1];
                for (let i = 1; i < pts.length; i++) {
                    if (t <= pts[i][0]) {
                        const [x0, y0] = pts[i - 1];
                        const [x1, y1] = pts[i];
                        return y0 + ((t - x0) / Math.max(1e-6, x1 - x0)) * (y1 - y0);
                    }
                }
                return pts[pts.length - 1][1];
            };
            break;
        }
        case 'hits': {
            const decay = trace.decay ?? 18;
            const cycles = trace.cycles ?? 40;
            const envelope = (t: number) =>
                trace.at.reduce((sum, at, i) => (t < at ? sum : sum + (trace.amp?.[i] ?? 1) * Math.exp(-decay * (t - at))), 0);
            const gain = trace.compress ? compressorGain(envelope, trace.compress) : () => 1;
            base = (t) => {
                const g = gain(t);
                if (trace.outline) return envelope(t) * g;
                return trace.at.reduce((sum, at, i) => {
                    if (t < at) return sum;
                    const dt = t - at;
                    return sum + (trace.amp?.[i] ?? 1) * Math.exp(-decay * dt) * Math.sin(TAU * cycles * dt);
                }, 0) * g;
            };
            break;
        }
        case 'noise': {
            const rand = mulberry32(trace.seed ?? 7);
            const cache = new Map<number, number>();
            base = (t) => {
                const k = Math.round(t * 2000);
                if (!cache.has(k)) cache.set(k, (rand() * 2 - 1) * trace.amp);
                return cache.get(k)!;
            };
            break;
        }
    }
    const gain = trace.gain ?? 1;
    const ceiling = trace.clip;
    const steps = trace.quantize ? 2 ** (trace.quantize - 1) : 0;
    return (t) => {
        let v = base(t) * gain;
        if (ceiling !== undefined) v = trace.soft ? ceiling * Math.tanh(v / ceiling) : clamp(v, -ceiling, ceiling);
        return steps ? Math.round(v * steps) / steps : v;
    };
}

/**
 * The plot field behind a waveform. Technical: an oscilloscope screen with
 * ten divisions, a subdivided centre line and registration corners. Music:
 * five rulings at full, half and zero level, a staff. Mind: a dotted centre
 * line and nothing else. Business: the row's rules.
 */
function SignalField({ d, x, y, w, h, mid, vy, unipolar }: { d: Dialect; x: number; y: number; w: number; h: number; mid: number; vy: (v: number) => number; unipolar?: boolean }) {
    const levels = unipolar ? [0.25, 0.5, 0.75, 1] : [-1, -0.5, 0.5, 1];
    switch (d.name) {
        case 'technical':
            return (
                <g>
                    <rect x={x} y={y} width={w} height={h} fill={C.lane} />
                    {Array.from({ length: 9 }, (_, i) => (
                        <Rule key={`v${i}`} d={d} x1={x + ((i + 1) * w) / 10} x2={x + ((i + 1) * w) / 10} y1={y} y2={y + h} />
                    ))}
                    {(unipolar ? [0.5] : [-0.5, 0.5]).map((v) => (
                        <Rule key={`h${v}`} d={d} x1={x} x2={x + w} y1={vy(v)} y2={vy(v)} />
                    ))}
                    <Rule d={d} x1={x} x2={x + w} y1={mid} y2={mid} major />
                    {/* The centre line is subdivided, five ticks to a division, as on a scope. */}
                    <path
                        d={Array.from({ length: 49 }, (_, i) => (i + 1) % 5 === 0 ? '' : `M${(x + ((i + 1) * w) / 50).toFixed(1)},${mid - 2}v4`).join('')}
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth={1}
                    />
                    <Corners d={d} x={x} y={y} w={w} h={h} />
                </g>
            );
        case 'music':
            return (
                <g>
                    {levels.map((v) => (
                        <Rule key={v} d={d} x1={x} x2={x + w} y1={vy(v)} y2={vy(v)} />
                    ))}
                    <Rule d={d} x1={x} x2={x + w} y1={mid} y2={mid} major />
                </g>
            );
        case 'mind':
            return <Rule d={d} x1={x} x2={x + w} y1={mid} y2={mid} major />;
        case 'business':
            return (
                <g>
                    <line x1={x} x2={x + w} y1={y} y2={y} stroke={C.grid} />
                    <line x1={x} x2={x + w} y1={y + h} y2={y + h} stroke={C.grid} />
                    <Rule d={d} x1={x} x2={x + w} y1={mid} y2={mid} />
                </g>
            );
    }
}

/** Where the labels of a row's marks go: under the plot, centred on their line, in a second row when two would touch. */
function signalMarkLabels(row: SignalRow, pw: number, w: number): Placed[] {
    const pad = 6;
    return placeInRows(
        (row.marks ?? []).map((mark) => ({ x: pad + mark.t * (pw - pad * 2), width: textWidth(mark.label), prefer: ['middle', 'start', 'end'] as Anchor[] })),
        0,
        w,
        { offset: 4 },
    );
}

const MARK_ROW = 15;

type Pt = [number, number];

/** A row's drawing in plot coordinates: x from 0 to the plot's width, y from 0 at its top. */
interface RowShape {
    mid: number;
    tx: (t: number) => number;
    vy: (v: number) => number;
    traces: { trace: SignalTrace; lines: Pt[][]; area?: Pt[] }[];
    sampled: { t: number; v: number }[];
    /** The slower wave that fits the same samples. */
    alias: Pt[] | null;
    /** Each sample held until the next. */
    hold: Pt[] | null;
}

function rowShape(row: SignalRow, pw: number, h: number): RowShape {
    const pad = 6;
    const mid = row.unipolar ? h - 4 : h / 2;
    const half = row.unipolar ? h - 10 : h / 2 - 5;
    const tx = (t: number) => pad + t * (pw - pad * 2);
    const vy = (v: number) => mid - clamp(v, -1.08, 1.08) * half;
    const steps = Math.round(pw * 1.5);
    const sweep = (fn: (t: number) => number) => Array.from({ length: steps + 1 }, (_, i) => [tx(i / steps), vy(fn(i / steps))] as Pt);

    const traces = row.traces.map((trace) => {
        if (trace.kind === 'envelope') return { trace, lines: [trace.points.map(([t, v]) => [tx(t), vy(v)] as Pt)] };
        const top = sweep(traceFn(trace));
        if (trace.kind !== 'hits' || !trace.outline) return { trace, lines: [top] };
        if (row.unipolar) return { trace, lines: [top], area: [...top, [tx(1), mid], [tx(0), mid]] as Pt[] };
        // Top and mirrored bottom edge as two lines, so both draw left to right together.
        const bottom = top.map(([px, py]) => [px, mid + (mid - py)] as Pt);
        return { trace, lines: [top, bottom], area: [...top, ...[...bottom].reverse()] };
    });

    const samples = row.samples;
    const sampled = samples
        ? (() => {
              const fn = traceFn(row.traces[samples.trace ?? 0]);
              // `count` dots, one per sample period: the plot is count periods wide, so the dot a period past the
              // last one (the first dot of the next window) is not drawn.
              return Array.from({ length: samples.count }, (_, k) => ({ t: k / samples.count, v: fn(k / samples.count) }));
          })()
        : [];

    const alias = (() => {
        if (!samples?.alias) return null;
        const source = row.traces[samples.trace ?? 0];
        if (source.kind !== 'sine') return null;
        const folded = source.cycles - samples.count * Math.round(source.cycles / samples.count);
        return sweep(traceFn({ ...source, cycles: folded, label: undefined }));
    })();

    const hold = samples?.hold
        ? sampled.flatMap(({ t, v }, k) => [[tx(t), vy(v)] as Pt, [tx(k < sampled.length - 1 ? sampled[k + 1].t : 1), vy(v)] as Pt])
        : null;

    return { mid, tx, vy, traces, sampled, alias, hold };
}

// ── Line labels: beside their line, never over a trace ──

type Box = { x0: number; x1: number; y0: number; y1: number };
type Seg = [number, number, number, number];

/** A label's glyph box around its baseline, at FS. */
const ASCENT = 9.5;
const DESCENT = 3;
/** Clear space round a line label, to the middle of a trace: no trace comes nearer, so a label stands apart from the data. */
const CLEAR = 6;
const COLUMN = 8;

/** Does the segment pass through the box? (Liang-Barsky) */
function segmentHits([ax, ay, bx, by]: Seg, b: Box): boolean {
    const dx = bx - ax;
    const dy = by - ay;
    const p = [-dx, dx, -dy, dy];
    const q = [ax - b.x0, b.x1 - ax, ay - b.y0, b.y1 - ay];
    let t0 = 0;
    let t1 = 1;
    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i] < 0) return false;
            continue;
        }
        const r = q[i] / p[i];
        if (p[i] < 0) {
            if (r > t1) return false;
            t0 = Math.max(t0, r);
        } else {
            if (r < t0) return false;
            t1 = Math.min(t1, r);
        }
    }
    return t0 <= t1;
}

function insidePolygon([x, y]: Pt, poly: Pt[]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

/** Everything drawn as data in a row (traces, shaded areas, samples, marks, the baseline), indexed by column for quick box tests. */
function dataObstacles(row: SignalRow, shape: RowShape, pw: number, h: number) {
    const columns = new Map<number, Seg[]>();
    const add = (s: Seg) => {
        for (let c = Math.floor(Math.min(s[0], s[2]) / COLUMN); c <= Math.floor(Math.max(s[0], s[2]) / COLUMN); c++) {
            const list = columns.get(c);
            if (list) list.push(s);
            else columns.set(c, [s]);
        }
    };
    const addLine = (pts: Pt[]) => {
        for (let i = 1; i < pts.length; i++) add([pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]]);
    };
    const areas: Pt[][] = [];
    for (const { lines, area } of shape.traces) {
        lines.forEach(addLine);
        if (area) {
            addLine([...area, area[0]]);
            areas.push(area);
        }
    }
    if (shape.alias) addLine(shape.alias);
    if (shape.hold) addLine(shape.hold);
    for (const { t, v } of shape.sampled) {
        const [x, y] = [shape.tx(t), shape.vy(v)];
        add([x, shape.mid, x, y]);
        addLine([[x - 4, y - 4], [x + 4, y - 4], [x + 4, y + 4], [x - 4, y + 4], [x - 4, y - 4]]);
    }
    for (const mark of row.marks ?? []) add([shape.tx(mark.t), 0, shape.tx(mark.t), h]);
    // The zero line, or the floor of a level plot: values are read from it.
    add([0, shape.mid, pw, shape.mid]);
    return (b: Box) => {
        for (let c = Math.floor(b.x0 / COLUMN); c <= Math.floor(b.x1 / COLUMN); c++) {
            if (columns.get(c)?.some((s) => segmentHits(s, b))) return true;
        }
        const centre: Pt = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
        return areas.some((area) => insidePolygon(centre, area));
    };
}

interface LineLabel {
    text: string;
    x: number;
    /** Baseline, in plot coordinates. */
    y: number;
    anchor: Anchor;
}

const lineText = (line: { label: string; short?: string }, narrow: boolean) => (narrow && line.short) || line.label;

/** One line per label: a plus and minus pair (full scale, a clip level) is labelled once, on its upper line first. */
function labelGroups(row: SignalRow) {
    const lines = row.lines ?? [];
    return Array.from(new Set(lines.map((l) => l.label))).map((label) => lines.filter((l) => l.label === label).sort((a, b) => b.y - a.y));
}

/**
 * Labels for a row's lines, each just above or below its line where no
 * trace, shaded area, sample or mark comes within CLEAR of it: at the
 * line's right end, else its left end, else the clear spot nearest the
 * right. One entry per label group, null
 * where the label found no spot, or where `skip` holds it (it is named in
 * the legend). The row then names that line in its legend, or labels its
 * lines past their ends (endLabels).
 */
function placeLineLabels(row: SignalRow, shape: RowShape, pw: number, h: number, narrow: boolean, skip: Set<string>): (LineLabel | null)[] {
    const lines = row.lines ?? [];
    const blocked = dataObstacles(row, shape, pw, h);
    const taken: Box[] = [];
    return labelGroups(row).map((members) => {
        if (skip.has(members[0].label)) return null;
        const text = lineText(members[0], narrow);
        const tw = textWidth(text);
        // The ends stay clear of the registration corners.
        const spots: { x0: number; x: number; anchor: Anchor }[] = [
            { x0: pw - 7 - tw, x: pw - 7, anchor: 'end' },
            { x0: 7, x: 7, anchor: 'start' },
        ];
        for (let x0 = pw - 10 - tw; x0 > 7; x0 -= 3) spots.push({ x0, x: x0 + tw / 2, anchor: 'middle' });
        for (const line of members) {
            const ly = shape.vy(line.y);
            const others = lines.filter((l) => l !== line).map((l) => shape.vy(l.y));
            for (const spot of spots) {
                for (const base of [ly - 5, ly + 13]) {
                    const box = { x0: spot.x0, x1: spot.x0 + tw, y0: base - ASCENT, y1: base + DESCENT };
                    if (box.y0 < -3 || box.y1 > h + 3) continue;
                    if (others.some((oy) => oy > box.y0 - 1 && oy < box.y1 + 1)) continue;
                    if (taken.some((t) => t.x0 < box.x1 + 4 && box.x0 < t.x1 + 4 && t.y0 < box.y1 + 2 && box.y0 < t.y1 + 2)) continue;
                    if (blocked({ x0: box.x0 - CLEAR, x1: box.x1 + CLEAR, y0: box.y0 - CLEAR, y1: box.y1 + CLEAR })) continue;
                    taken.push(box);
                    return { text, x: spot.x, y: base, anchor: spot.anchor };
                }
            }
        }
        return null;
    });
}

/** Labels past the ends of a row's lines, in the margin right of the plot, kept a line apart. */
function endLabels(row: SignalRow, shape: RowShape, pw: number, h: number, narrow: boolean): LineLabel[] {
    const labels = labelGroups(row)
        .map((members) => ({ text: lineText(members[0], narrow), x: pw + 6, y: shape.vy(members[0].y) + 4, anchor: 'start' as Anchor }))
        .sort((a, b) => a.y - b.y);
    labels.forEach((label, i) => {
        if (i > 0) label.y = Math.max(label.y, labels[i - 1].y + 13);
    });
    const over = labels.length ? labels[labels.length - 1].y - (h + 3) : 0;
    if (over > 0) labels.forEach((label) => (label.y -= over));
    return labels;
}

function SignalPlot({
    row,
    shape,
    labels,
    y,
    pw,
    w,
    h,
    delay,
    d,
}: {
    row: SignalRow;
    shape: RowShape;
    labels: LineLabel[];
    y: number;
    pw: number;
    w: number;
    h: number;
    delay: number;
    d: Dialect;
}) {
    const { mid, tx, vy } = shape;
    const markLabels = signalMarkLabels(row, pw, w);
    // Waveforms are dense, so their lines are a touch lighter than a curve's.
    const traceW = d.line * 0.9;
    return (
        <g transform={`translate(0 ${y})`}>
            <SignalField d={d} x={0} y={0} w={pw} h={h} mid={mid} vy={vy} unipolar={row.unipolar} />
            {row.lines?.map((line, li) => (
                <RefLine key={li} d={d} x1={0} x2={pw} y1={vy(line.y)} y2={vy(line.y)} />
            ))}
            {row.marks?.map((mark, mi) => {
                const mx = tx(mark.t);
                const place = markLabels[mi];
                return (
                    <g key={mark.label}>
                        <RefLine d={d} x1={mx} x2={mx} y1={0} y2={h + 4 + place.row * MARK_ROW} />
                        <Label x={place.tx} y={h + 18 + place.row * MARK_ROW} anchor={place.anchor} fill={C.text}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            {shape.traces.map(({ trace, lines, area }, i) => {
                // Grey traces are context and stay put. A solid accent trace draws along its length; a dashed or dotted one fades.
                const motion = trace.muted ? {} : draw(trace.dashed || trace.dotted ? 'fade' : 'line', delay + i * 80);
                return (
                    <g key={i}>
                        {area && !trace.dotted && (trace.muted || d.fillUnder) ? (
                            // The area fades in once its outline has drawn, never ahead of it.
                            <path d={`${linePath(area)}Z`} {...(trace.muted ? { fill: C.lane } : { ...areaFill(d), ...draw('fade', delay + i * 80 + 760) })} />
                        ) : null}
                        {lines.map((pts, k) =>
                            trace.dotted ? (
                                <path key={k} d={linePath(pts)} fill="none" {...dots(d, trace.muted)} {...motion} />
                            ) : (
                                <path
                                    key={k}
                                    d={linePath(pts)}
                                    fill="none"
                                    stroke={trace.muted ? C.dataGrey : C.accent}
                                    strokeWidth={trace.muted ? 1.4 : traceW}
                                    strokeDasharray={trace.dashed ? d.refDash : undefined}
                                    strokeLinecap={d.cap}
                                    strokeLinejoin="round"
                                    {...motion}
                                />
                            ),
                        )}
                    </g>
                );
            })}
            {shape.alias ? (
                // The slower wave the dots also fit is what a converter plays back: a solid accent line, named in the legend.
                <path d={linePath(shape.alias)} fill="none" stroke={C.accent} strokeWidth={traceW} strokeLinecap={d.cap} strokeLinejoin="round" {...draw('line', delay + 300)} />
            ) : null}
            {shape.hold ? <path d={linePath(shape.hold)} fill="none" stroke={C.strong} strokeWidth={1.6} strokeLinejoin={d.join} /> : null}
            {shape.sampled.map(({ t, v }, k) => (
                <g key={k}>
                    <line x1={tx(t)} x2={tx(t)} y1={mid} y2={vy(v)} stroke={C.faint} />
                    <Point d={d} x={tx(t)} y={vy(v)} r={3} tone="ink" />
                </g>
            ))}
            {/* Line labels sit where no trace comes near them, so they never hide the data; no plate needed. */}
            {labels.map((label) => (
                <Label key={label.text} x={label.x} y={label.y} anchor={label.anchor} fill={C.text}>
                    {label.text}
                </Label>
            ))}
        </g>
    );
}

export function Signal({ spec, w, dialect }: { spec: SignalFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const plotH = narrow ? 92 : 112;
    const heightOf = (row: SignalRow) => (row.unipolar ? plotH * 0.85 : plotH);
    const labelH = 22;
    const gap = 14;

    // Line labels go beside their lines where the traces leave room. A row where one line finds no room
    // names that line in its legend instead, a dashed sample like the line itself, when nothing else there
    // is a grey dash; the row's other lines keep their labels beside them, so the one in the legend is the
    // dashed line left unnamed. Otherwise the row labels its lines past their ends, in a margin right of the
    // plot; every row then gives up the same margin, so the rows keep one time axis. A line's label is
    // treated the same way in every row it appears in: once it goes to a legend (or the margin) in one row,
    // it goes there in all of them, so the same line is never named inline in one row and in the legend
    // of the next.
    const RANK = { inline: 0, legend: 1, end: 2 } as const;
    const mode = new Map<string, keyof typeof RANK>();
    const inLegend = new Map<number, string>();
    const ends = new Set<number>();
    let margin = 0;
    let shapes: RowShape[] = [];
    let labels: LineLabel[][] = [];
    for (let pass = 0; pass < 8; pass++) {
        const pw = w - margin;
        shapes = spec.rows.map((row) => rowShape(row, pw, heightOf(row)));
        labels = spec.rows.map((row, i) => {
            inLegend.delete(i);
            const groups = labelGroups(row);
            if (!groups.length) return [];
            if (!ends.has(i) && !groups.some((g) => mode.get(g[0].label) === 'end')) {
                const forced = new Set(groups.filter((g) => mode.get(g[0].label) === 'legend').map((g) => g[0].label));
                const placed = placeLineLabels(row, shapes[i], pw, heightOf(row), narrow, forced);
                const missing = groups.filter((_, k) => !placed[k]);
                if (!missing.length) return placed as LineLabel[];
                if (missing.length === 1 && !row.traces.some((t) => t.label && t.dashed && t.muted)) {
                    inLegend.set(i, missing[0][0].label);
                    return placed.filter((label) => label !== null);
                }
            }
            ends.add(i);
            return endLabels(row, shapes[i], pw, heightOf(row), narrow);
        });
        let changed = false;
        spec.rows.forEach((row, i) =>
            labelGroups(row).forEach((g) => {
                const label = g[0].label;
                const now = ends.has(i) ? 'end' : inLegend.get(i) === label ? 'legend' : 'inline';
                if (RANK[now] > RANK[mode.get(label) ?? 'inline']) {
                    mode.set(label, now);
                    changed = true;
                }
            }),
        );
        const need = ends.size ? Math.max(...[...ends].flatMap((i) => spec.rows[i].lines!.map((l) => textWidth(lineText(l, narrow))))) + 10 : 0;
        // Modes only ever step up and the margin only grows, so this settles in a few passes.
        if ((!changed && need <= margin) || pass === 7) break;
        margin = Math.max(margin, need);
    }
    const pw = w - margin;

    const rows: { row: SignalRow; top: number; plotY: number; leg: ReturnType<typeof legend> }[] = [];
    let y = 0;
    for (const row of spec.rows) {
        const named: LegendItem[] = row.traces
            .filter((t) => t.label)
            .map((t) => ({ label: t.label!, dashed: t.dashed, dotted: t.dotted, muted: t.muted }));
        if (shapes[rows.length].alias) named.push({ label: row.samples?.aliasLabel ?? 'Alias' });
        const lineInLegend = inLegend.get(rows.length);
        if (lineInLegend) named.push({ label: lineInLegend, dashed: true, stroke: C.soft, width: 1.2 });
        const top = y;
        const hasLabel = Boolean(row.label);
        const leg = legend(named, 0, top + (hasLabel ? labelH + 14 : 14), w, d);
        const plotY = top + (hasLabel ? labelH : 0) + leg.height + (leg.height ? 8 : 0);
        rows.push({ row, top, plotY, leg });
        const markRows = row.marks?.length ? Math.max(...signalMarkLabels(row, pw, w).map((p) => p.row)) + 1 : 0;
        y = plotY + heightOf(row) + (markRows ? 24 + (markRows - 1) * MARK_ROW : 0) + gap;
    }
    const ledger = d.name === 'business';
    const h = y - gap + (ledger ? 10 : 0);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {rows.map(({ row, top, plotY, leg }, i) => (
                <g key={i}>
                    {row.label ? (
                        <Label x={0} y={top + 14} fill={C.ink} weight={600}>
                            {row.label}
                        </Label>
                    ) : null}
                    {leg.node}
                    <SignalPlot row={row} shape={shapes[i]} labels={labels[i]} y={plotY} pw={pw} w={w} h={heightOf(row)} delay={120 + i * 100} d={d} />
                </g>
            ))}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}

// ── Spectrum: energy or EQ gain across a log frequency axis ──

const FS_RATE = 48000;

function biquadDb(band: EqBand, f: number): number {
    const w0 = (TAU * band.freq) / FS_RATE;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const q = band.q ?? 0.707;
    const alpha = sin / (2 * q);
    const A = 10 ** ((band.gain ?? 0) / 40);
    const sq = 2 * Math.sqrt(A) * alpha;
    let b: [number, number, number];
    let a: [number, number, number];
    if (band.type === 'highpass1' || band.type === 'lowpass1') {
        // First-order bilinear filter: 6 dB per octave, 3 dB down at freq.
        const k = Math.tan((Math.PI * band.freq) / FS_RATE);
        const wf = (TAU * f) / FS_RATE;
        const z = { re: Math.cos(wf), im: -Math.sin(wf) };
        const num = band.type === 'lowpass1' ? { re: k * (1 + z.re), im: k * z.im } : { re: 1 - z.re, im: -z.im };
        const den = { re: k + 1 + (k - 1) * z.re, im: (k - 1) * z.im };
        return 20 * Math.log10(Math.hypot(num.re, num.im) / Math.hypot(den.re, den.im));
    }
    switch (band.type) {
        case 'bell':
            b = [1 + alpha * A, -2 * cos, 1 - alpha * A];
            a = [1 + alpha / A, -2 * cos, 1 - alpha / A];
            break;
        case 'lowpass':
            b = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2];
            a = [1 + alpha, -2 * cos, 1 - alpha];
            break;
        case 'highpass':
            b = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2];
            a = [1 + alpha, -2 * cos, 1 - alpha];
            break;
        case 'lowshelf':
            b = [A * (A + 1 - (A - 1) * cos + sq), 2 * A * (A - 1 - (A + 1) * cos), A * (A + 1 - (A - 1) * cos - sq)];
            a = [A + 1 + (A - 1) * cos + sq, -2 * (A - 1 + (A + 1) * cos), A + 1 + (A - 1) * cos - sq];
            break;
        case 'highshelf':
            b = [A * (A + 1 + (A - 1) * cos + sq), -2 * A * (A - 1 + (A + 1) * cos), A * (A + 1 + (A - 1) * cos - sq)];
            a = [A + 1 - (A - 1) * cos + sq, 2 * (A - 1 - (A + 1) * cos), A + 1 - (A - 1) * cos - sq];
            break;
    }
    const w = (TAU * f) / FS_RATE;
    const mag = (c: [number, number, number]) => {
        const re = c[0] + c[1] * Math.cos(w) + c[2] * Math.cos(2 * w);
        const im = -(c[1] * Math.sin(w) + c[2] * Math.sin(2 * w));
        return Math.hypot(re, im);
    };
    return 20 * Math.log10(mag(b) / mag(a));
}

let clipCounter = 0;

const fmtHz = (f: number) => (f >= 1000 ? `${Number((f / 1000).toFixed(1))}k` : `${f}`);

/**
 * Every 1-to-9 step of each decade inside the range: the lines of a log
 * graticule. Where the steps crowd together near the top of a decade, a
 * line closer than 5 px to the last one is left out, so the grid stays a
 * texture at phone width.
 */
function logLines(lo: number, hi: number, fx: (f: number) => number): number[] {
    const out: number[] = [];
    for (let dec = 10 ** Math.floor(Math.log10(lo)); dec <= hi; dec *= 10) {
        for (let k = 1; k <= 9; k++) {
            const f = k * dec;
            if (f < lo || f > hi) continue;
            // 1, 2 and 5 carry the labels, so they always stay.
            const minor = k !== 1 && k !== 2 && k !== 5;
            if (minor && ((out.length && fx(f) - fx(out[out.length - 1]) < 5) || fx(dec * 10) - fx(f) < 5)) continue;
            out.push(f);
        }
    }
    return out;
}

export function Spectrum({ spec, w, dialect }: { spec: SpectrumFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const [lo, hi] = spec.range ?? [20, 20000];
    // A hump is filled under in the lit dialects (and in grey when muted) unless dashed or dotted.
    const filled = (c: SpectrumCurve) => c.kind === 'hump' && !c.dashed && !c.dotted && (c.muted || d.fillUnder);
    // Harmonics and humps get samples in their own shape, so a key of spikes and a band never shows two like lines.
    // A dashed hump keeps the straight dashed sample: the dialect's dash breaks a hump that small into pieces. A single
    // harmonic (a clean note) is one tick, as it is drawn.
    const named = spec.curves
        .filter((c) => c.label)
        .map((c) => ({
            label: c.label!,
            dashed: c.dashed,
            dotted: c.dotted,
            muted: c.muted,
            sample: c.kind === 'harmonics' ? (c.count === 1 ? ('tick' as const) : ('ticks' as const)) : c.kind === 'hump' && !c.dashed ? (filled(c) ? ('area' as const) : ('hump' as const)) : undefined,
        }));
    const leg = legend(named, 0, 14, w, d);
    const gainMode = spec.mode === 'gain';
    const left = gainMode ? 40 : 4;
    const right = w - 4;
    const fx = (f: number) => left + ((Math.log10(f) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (right - left);
    // Band labels sit centred over their band; mark labels beside their line, the left one of a close pair
    // to its left and the right one to its right, and up a row when they would still touch. In gain mode the
    // dB unit sits on the same line, left of the plot: every label keeps two letters' width (24 units) clear
    // of it, so the two never read as one phrase ("dB Rumble", "dB 264 Hz").
    const unitRight = left - 6;
    const unitSpan: [number, number] = [unitRight - textWidth('dB'), unitRight];
    const firstX = gainMode ? unitRight + 24 : 0;
    const bandLabels = (spec.bands ?? []).map((band) => {
        const width = textWidth(band.label);
        const cx = clamp((fx(band.from) + fx(band.to)) / 2, firstX + width / 2, w - width / 2);
        return { cx, span: [cx - width / 2, cx + width / 2] as [number, number] };
    });
    // placeInRows keeps 8 units from a taken span; the unit's span is widened by 16 to make that 24.
    const markLabels = placeInRows(
        (spec.marks ?? []).map((mark) => ({ x: fx(mark.f), width: textWidth(mark.label), prefer: ['start', 'end'] as Anchor[] })),
        0,
        w,
        { taken: [...bandLabels.map((b) => b.span), ...(gainMode ? [[unitSpan[0] - 16, unitSpan[1] + 16] as [number, number]] : [])] },
    );
    const labelRows = Math.max(0, ...markLabels.map((p) => p.row)) + 1;
    // Room above the plot for band or mark labels, or for the dB unit in gain mode.
    const top = leg.height + (spec.bands?.length || spec.marks?.length ? 30 + (labelRows - 1) * 16 : gainMode ? 24 : 12);
    const plotH = narrow ? 150 : 180;
    const bottom = top + plotH;
    const ledger = d.name === 'business';
    const h = bottom + 26 + (ledger ? 8 : 0);
    const [dbLo, dbHi] = spec.dbRange ?? [-(spec.db ?? 12), spec.db ?? 12];
    const span = dbHi - dbLo;
    const gy = (db: number) => top + 4 + ((dbHi - clamp(db, dbLo - span * 0.25, dbHi + span * 0.25)) / span) * (plotH - 8);
    // Uneven ranges get round ticks (multiples of 3, 6, 10 or 20 dB) that always include 0.
    const tickStep = [3, 6, 10, 12, 20, 24].find((st) => span / st <= 5) ?? 30;
    const dbTicks = spec.dbRange
        ? Array.from({ length: Math.floor(dbHi / tickStep) - Math.ceil(dbLo / tickStep) + 1 }, (_, i) => (Math.floor(dbHi / tickStep) - i) * tickStep)
        : [dbHi, dbHi / 2, 0, -dbHi / 2, -dbHi];
    const ly = (v: number) => bottom - clamp(v, 0, 1.05) * (plotH - 8);
    const ticks = (narrow ? [20, 100, 500, 2000, 10000] : [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]).filter(
        (f) => f >= lo && f <= hi,
    );
    // The unit rides on the last frequency, or on the first when the last has no room for it.
    const unitAt = (() => {
        const last = ticks[ticks.length - 1];
        const prev = ticks[ticks.length - 2];
        if (prev === undefined) return last;
        const lastFrom = last === hi ? fx(last) - textWidth(`${fmtHz(last)} Hz`) : fx(last) - textWidth(`${fmtHz(last)} Hz`) / 2;
        const prevTo = fx(prev) + textWidth(fmtHz(prev)) / 2;
        return lastFrom - prevTo >= 8 ? last : ticks[0];
    })();
    const N = Math.round(w * 1.2);
    const freqs = Array.from({ length: N + 1 }, (_, i) => lo * (hi / lo) ** (i / N));

    const clipId = `spectrum-clip-${++clipCounter}`;
    const curveNode = (curve: SpectrumCurve, i: number) => {
        const stroke = curve.muted ? C.dataGrey : C.accent;
        const dash = curve.dashed ? d.refDash : undefined;
        if (curve.kind === 'harmonics') {
            const roll = curve.rolloff ?? 1;
            const level = curve.level ?? 0.95;
            const lines = Array.from({ length: curve.count }, (_, n) => {
                const k = curve.odd ? 2 * n + 1 : n + 1;
                const f = curve.f0 * k;
                return f > hi ? null : { n, x: fx(f), y: ly(level / k ** roll) };
            }).filter((line) => line !== null);
            // Accent harmonics rise from the floor in four groups, lowest first: a handful of animations, not one
            // per harmonic, so a dense spectrum still draws in smoothly. Flat ends in every dialect, so a harmonic
            // stops exactly at its level and never reaches below the floor.
            const quarters = [0, 1, 2, 3].map((q) => lines.filter((line) => Math.min(3, Math.floor((4 * (line.x - left)) / (right - left))) === q));
            return (
                <g key={i}>
                    {quarters.map((group, q) =>
                        group.length ? (
                            <g key={q} {...(curve.muted ? {} : draw(curve.dashed || curve.dotted ? 'fade' : 'rise', 120 + q * 90))}>
                                {group.map((line) =>
                                    curve.dotted ? (
                                        <line key={line.n} x1={line.x} x2={line.x} y1={bottom} y2={line.y} {...dots(d, curve.muted)} />
                                    ) : (
                                        <line key={line.n} x1={line.x} x2={line.x} y1={bottom} y2={line.y} stroke={stroke} strokeWidth={2.2} strokeDasharray={dash} />
                                    ),
                                )}
                            </g>
                        ) : null,
                    )}
                </g>
            );
        }
        const value = (f: number) => {
            switch (curve.kind) {
                case 'hump':
                    return (curve.level ?? 0.9) * Math.exp(-0.5 * (Math.log2(f / curve.center) / curve.width) ** 2);
                case 'slope':
                    return (curve.level ?? 0.9) * (1 + (curve.dbPerOct * Math.log2(f / lo)) / 36);
                case 'eq':
                    return curve.bands.reduce((sum, band) => sum + biquadDb(band, f), 0);
                case 'comb': {
                    const g = curve.mix ?? 1;
                    const phase = TAU * f * (curve.delayMs / 1000);
                    // |1 + g·e^(-jωτ)|: +6 dB peaks and deep notches when the copy is at equal level.
                    return 10 * Math.log10(Math.max(1e-9, 1 + g * g + 2 * g * Math.cos(phase)));
                }
            }
        };
        // A comb's notches get narrower than a pixel at high frequencies, so sample it on a linear grid fine enough to reach every notch.
        const combSteps = curve.kind === 'comb' ? Math.max(N, Math.ceil(Math.min(20000, hi * (curve.delayMs / 1000) * 24))) : 0;
        const sampleAt = combSteps ? Array.from({ length: combSteps + 1 }, (_, i) => lo + ((hi - lo) * i) / combSteps) : freqs;
        // A curve that leaves the plot stops just past its edge, under the clip, so nothing of it reaches the labels round the plot.
        const pts = sampleAt.map((f) => [fx(f), clamp(gainMode ? gy(value(f)) : ly(value(f)), top - 3, bottom + 3)] as [number, number]);
        const path = linePath(pts);
        const fill = filled(curve);
        // Grey curves are context and stay put. A solid accent curve draws left to right; a dashed or dotted one fades.
        const lineDelay = 120 + i * 100;
        const motion = curve.muted ? {} : draw(curve.dashed || curve.dotted ? 'fade' : 'line', lineDelay);
        // A solid accent curve that runs along the whole 0 dB axis (a filter that cancels another's boost) would read
        // as the axis itself, a bright rule with nothing to tell it from the grid. It carries measured points, one on
        // each labelled frequency, as a focus curve does elsewhere: a value in the dialect's own mark.
        const flatOnZero =
            gainMode && !curve.muted && !curve.dashed && !curve.dotted && pts.every(([, y]) => Math.abs(y - gy(0)) < 1);
        return (
            <g key={i}>
                {fill ? (
                    // The area fades in once its line has drawn, never ahead of it.
                    <path d={`${path}L${right},${bottom}L${left},${bottom}Z`} {...(curve.muted ? { fill: C.lane } : { ...areaFill(d), ...draw('fade', 120 + i * 100 + 760) })} />
                ) : null}
                {curve.dotted ? (
                    <path d={path} fill="none" {...dots(d, curve.muted)} {...motion} />
                ) : (
                    <path
                        d={path}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={curve.muted ? 1.4 : d.line}
                        strokeDasharray={dash}
                        strokeLinecap={d.cap}
                        strokeLinejoin="round"
                        {...motion}
                    />
                )}
                {flatOnZero
                    ? ticks
                          .filter((f) => f > lo && f < hi)
                          .map((f) => <Point key={f} d={d} x={fx(f)} y={gy(value(f))} r={3} delay={lineDelay + (700 * (fx(f) - left)) / (right - left)} />)
                    : null}
            </g>
        );
    };

    // The frequency grid. Technical draws every 1-to-9 step of each decade, as an analyser does, with the labelled
    // frequencies stronger; music and mind rule only the labelled ones; the ledger keeps its rules horizontal and
    // marks the frequencies with short ticks on the floor, like a ruler.
    const freqGrid =
        d.name === 'technical'
            ? logLines(lo, hi, fx).map((f) => <Rule key={f} d={d} x1={fx(f)} x2={fx(f)} y1={top} y2={bottom} major={ticks.includes(f)} />)
            : ledger
              ? ticks.map((f) => <line key={f} x1={fx(f)} x2={fx(f)} y1={bottom} y2={bottom + 5} stroke={C.soft} />)
              : ticks.map((f) => <Rule key={f} d={d} x1={fx(f)} x2={fx(f)} y1={top} y2={bottom} major={d.name === 'music'} opacity={d.name === 'music' ? 0.1 : undefined} />);
    // Level mode has no value scale. The ledger still rules its rows, plain quarters for the eye.
    const levelRules = !gainMode && ledger ? [1, 2, 3, 4].map((k) => bottom - (k * (plotH - 8)) / 4) : [];

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {leg.node}
            {spec.bands?.map((band, bi) => {
                const a = fx(band.from);
                const b = fx(band.to);
                return (
                    <g key={band.label}>
                        <rect x={a} y={top} width={b - a} height={plotH} rx={d.name === 'mind' ? 6 : 0} fill={C.fill} />
                        <Label x={bandLabels[bi].cx} y={top - 10} anchor="middle" fill={C.ink}>
                            {band.label}
                        </Label>
                    </g>
                );
            })}
            {freqGrid}
            {levelRules.map((y) => (
                <Rule key={y} d={d} x1={left} x2={right} y1={y} y2={y} />
            ))}
            {ticks.map((f) => (
                <Label key={f} x={fx(f)} y={bottom + 18} anchor={f === lo ? 'start' : f === hi ? 'end' : 'middle'}>
                    {f === unitAt ? `${fmtHz(f)} Hz` : fmtHz(f)}
                </Label>
            ))}
            {gainMode ? (
                <g>
                    {dbTicks.map((db) => (
                        <g key={db}>
                            {db === 0 ? (
                                <Axis x1={left} x2={right} y1={gy(db)} y2={gy(db)} />
                            ) : (
                                <Rule d={d} x1={left} x2={right} y1={gy(db)} y2={gy(db)} major={d.name !== 'mind'} opacity={d.name === 'technical' ? 0.1 : undefined} />
                            )}
                            <Label x={left - 6} y={gy(db) + 4} anchor="end">
                                {db > 0 ? `+${db}` : db}
                            </Label>
                        </g>
                    ))}
                    <Label x={left - 6} y={top - 8} anchor="end">
                        dB
                    </Label>
                </g>
            ) : (
                <Axis x1={left} x2={right} y1={bottom} y2={bottom} />
            )}
            <Corners d={d} x={left} y={top} w={right - left} h={plotH} />
            {spec.marks?.map((mark, mi) => {
                const x = fx(mark.f);
                const place = markLabels[mi];
                const ly = top - 10 - place.row * 16;
                return (
                    <g key={`${mi}-${mark.label}`}>
                        {/* A label up a row keeps its line running up to it. */}
                        <RefLine d={d} x1={x} x2={x} y1={place.row ? ly - 4 : top} y2={bottom} />
                        <Label x={place.tx} y={ly} anchor={place.anchor} fill={C.ink}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            <defs>
                <clipPath id={clipId}>
                    <rect x={left - 2} y={top} width={right - left + 4} height={plotH} />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>{spec.curves.map(curveNode)}</g>
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}

// ── Transfer: input level in, output level out ──

export function Transfer({ spec, w, dialect }: { spec: TransferFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const size = narrow ? w - 56 : 300;
    const ox = 52;
    // Room above the plot for the threshold's label, so it never sits on the grid or the curve.
    const oy = 20;
    const db = spec.domain === 'db';
    const [lo, hi] = db ? [-48, 0] : [-1, 1];
    const px = (v: number) => ox + ((v - lo) / (hi - lo)) * size;
    const py = (v: number) => oy + size - ((clamp(v, lo, hi) - lo) / (hi - lo)) * size;
    const ticks = db ? [-48, -36, -24, -12, 0] : [-1, -0.5, 0, 0.5, 1];
    // Technical subdivides each 12 dB (or 0.5) division in four, like a measuring grid.
    const minor = d.name === 'technical' ? Array.from({ length: 15 }, (_, i) => lo + ((i + 1) * (hi - lo)) / 16).filter((v) => !ticks.some((t) => Math.abs(t - v) < 1e-9)) : [];
    const ledger = d.name === 'business';
    const legendX = narrow ? 0 : ox + size + 28;
    const legendY = narrow ? oy + size + 58 : oy + 16;
    const named = spec.curves
        .filter((c) => c.label)
        .map((c) => ({ label: c.label!, dashed: c.dashed || c.kind === 'linear', dotted: c.dotted && c.kind !== 'linear', muted: c.kind === 'linear' || c.muted }));
    const leg = legend(named, legendX, legendY, narrow ? w : w - legendX, d, !narrow);
    const h = (narrow ? legendY + leg.height : oy + size + 40) + (ledger ? 8 : 0);

    const out = (c: TransferFigure['curves'][number], x: number) => {
        switch (c.kind) {
            case 'linear':
                return x;
            case 'compressor': {
                const t = c.threshold ?? -24;
                const r = c.ratio ?? 4;
                const k = c.knee ?? 0;
                if (k > 0 && x > t - k / 2 && x < t + k / 2) return x + ((1 / r - 1) * (x - t + k / 2) ** 2) / (2 * k);
                return x <= t ? x : t + (x - t) / r;
            }
            case 'hardclip':
                return clamp(x, -(c.ceiling ?? 0.6), c.ceiling ?? 0.6);
            case 'softclip':
                return (c.ceiling ?? 0.6) * Math.tanh(x / (c.ceiling ?? 0.6));
        }
    };

    const N = 160;
    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {d.name === 'technical' ? <rect x={ox} y={oy} width={size} height={size} fill={C.lane} /> : null}
            {minor.map((t) => (
                <g key={`m${t}`}>
                    <Rule d={d} x1={px(t)} x2={px(t)} y1={oy} y2={oy + size} />
                    <Rule d={d} x1={ox} x2={ox + size} y1={py(t)} y2={py(t)} />
                </g>
            ))}
            {ticks.map((t) => (
                <g key={t}>
                    {ledger ? null : <Rule d={d} x1={px(t)} x2={px(t)} y1={oy} y2={oy + size} major={d.name !== 'mind'} opacity={d.name === 'technical' ? 0.1 : undefined} />}
                    {ledger && t === lo ? (
                        <Axis x1={ox} x2={ox + size} y1={py(t)} y2={py(t)} />
                    ) : (
                        <Rule d={d} x1={ox} x2={ox + size} y1={py(t)} y2={py(t)} major={d.name !== 'mind'} opacity={d.name === 'technical' ? 0.1 : ledger ? 0.1 : undefined} />
                    )}
                    {ledger ? <line x1={px(t)} x2={px(t)} y1={oy + size} y2={oy + size + 5} stroke={C.soft} /> : null}
                    {/* The first input value starts at its tick, so it clears the lowest output value beside the corner. */}
                    <Label x={t === lo ? px(t) - 1 : px(t)} y={oy + size + 16} anchor={t === lo ? 'start' : 'middle'}>
                        {t}
                    </Label>
                    <Label x={ox - 6} y={py(t) + 4} anchor="end">
                        {t}
                    </Label>
                </g>
            ))}
            <Corners d={d} x={ox} y={oy} w={size} h={size} />
            <Title dialect={d} x={ox + size / 2} y={oy + size + 34} anchor="middle">
                {db ? 'Input level (dB)' : 'Input'}
            </Title>
            <Title dialect={d} x={13} y={oy + size / 2} anchor="middle" transform={`rotate(-90 13 ${oy + size / 2})`}>
                {db ? 'Output level (dB)' : 'Output'}
            </Title>
            {spec.curves.map((c, i) => {
                const pts: [number, number][] = [];
                for (let k = 0; k <= N; k++) {
                    const x = lo + ((hi - lo) * k) / N;
                    pts.push([px(x), py(out(c, x))]);
                }
                const linear = c.kind === 'linear';
                // The unity line is a reference (dashed grey) and a muted curve is grey context (solid): both stay put.
                // Accent curves draw from quiet to loud, a dashed or dotted one fades.
                const grey = linear || c.muted;
                const motion = grey ? {} : draw(c.dashed || c.dotted ? 'fade' : 'line', 120 + i * 100);
                if (c.dotted && !linear) return <path key={i} d={linePath(pts)} fill="none" {...dots(d, c.muted)} {...motion} />;
                return (
                    <path
                        key={i}
                        d={linePath(pts)}
                        fill="none"
                        stroke={grey ? C.dataGrey : C.accent}
                        strokeWidth={grey ? 1.4 : d.line}
                        strokeDasharray={linear || c.dashed ? d.refDash : undefined}
                        strokeLinecap={d.cap}
                        strokeLinejoin={d.join}
                        {...motion}
                    />
                );
            })}
            {spec.curves
                .filter((c) => c.kind === 'compressor' && c.threshold !== undefined)
                .slice(0, 1)
                .map((c) => (
                    <g key="threshold">
                        <RefLine d={d} x1={px(c.threshold!)} x2={px(c.threshold!)} y1={oy - 4} y2={oy + size} />
                        <Label x={clamp(px(c.threshold!), ox + textWidth('Threshold') / 2, ox + size - textWidth('Threshold') / 2)} y={oy - 8} anchor="middle" fill={C.text}>
                            Threshold
                        </Label>
                    </g>
                ))}
            {leg.node}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}
