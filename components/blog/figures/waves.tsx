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
    accentFill,
    clamp,
    dialectOf,
    draw,
    legend,
    linePath,
    textWidth,
    type Dialect,
    type DialectProp,
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

function SignalPlot({ row, x, y, w, h, delay, d }: { row: SignalRow; x: number; y: number; w: number; h: number; delay: number; d: Dialect }) {
    const pad = 6;
    const mid = row.unipolar ? y + h - 4 : y + h / 2;
    const half = row.unipolar ? h - 10 : h / 2 - 5;
    const tx = (t: number) => x + pad + t * (w - pad * 2);
    const vy = (v: number) => mid - clamp(v, -1.08, 1.08) * half;
    const steps = Math.round(w * 1.5);
    // Waveforms are dense, so their lines are a touch lighter than a curve's.
    const traceW = d.line * 0.9;

    const paths = row.traces.map((trace) => {
        const fn = traceFn(trace);
        if (trace.kind === 'hits' && trace.outline) {
            const top: [number, number][] = [];
            for (let i = 0; i <= steps; i++) top.push([tx(i / steps), vy(fn(i / steps))]);
            if (row.unipolar) return { trace, lines: [linePath(top)], area: `${linePath(top)}L${tx(1)},${mid}L${tx(0)},${mid}Z` };
            // Top and mirrored bottom edge as two paths, so both draw left to right together.
            const bottom = top.map(([px, py]) => [px, mid + (mid - py)] as [number, number]);
            return {
                trace,
                lines: [linePath(top), linePath(bottom)],
                area: `${linePath(top)}L${linePath([...bottom].reverse()).slice(1)}Z`,
            };
        }
        const pts: [number, number][] = [];
        if (trace.kind === 'envelope') {
            for (const [t, v] of trace.points) pts.push([tx(t), vy(v)]);
        } else {
            for (let i = 0; i <= steps; i++) pts.push([tx(i / steps), vy(fn(i / steps))]);
        }
        return { trace, lines: [linePath(pts)], area: undefined as string | undefined };
    });

    const samples = row.samples;
    const sampled = samples
        ? (() => {
              const fn = traceFn(row.traces[samples.trace ?? 0]);
              return Array.from({ length: samples.count + 1 }, (_, k) => {
                  const t = k / samples.count;
                  return { t, v: fn(t) };
              });
          })()
        : [];

    // The slower wave that fits the same samples: cycles folded around the sample count.
    const aliasPath = (() => {
        if (!samples?.alias) return null;
        const source = row.traces[samples.trace ?? 0];
        if (source.kind !== 'sine') return null;
        const folded = source.cycles - samples.count * Math.round(source.cycles / samples.count);
        const fn = traceFn({ ...source, cycles: folded, label: undefined });
        const pts: [number, number][] = [];
        for (let i = 0; i <= steps; i++) pts.push([tx(i / steps), vy(fn(i / steps))]);
        return linePath(pts);
    })();

    return (
        <g>
            <SignalField d={d} x={x} y={y} w={w} h={h} mid={mid} vy={vy} unipolar={row.unipolar} />
            {row.lines?.map((line) => (
                <RefLine key={line.label} d={d} x1={x} x2={x + w} y1={vy(line.y)} y2={vy(line.y)} />
            ))}
            {row.marks?.map((mark) => {
                const mx = tx(mark.t);
                const anchor = mx < x + 30 ? 'start' : mx > x + w - 30 ? 'end' : 'middle';
                return (
                    <g key={mark.label}>
                        <RefLine d={d} x1={mx} x2={mx} y1={y} y2={y + h + 4} />
                        <Label x={mx} y={y + h + 18} anchor={anchor} fill={C.text}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            {paths.map(({ trace, lines, area }, i) => {
                // Grey traces are context and stay put. A solid accent trace draws along its length; a dashed one fades.
                const motion = trace.muted ? {} : draw(trace.dashed ? 'fade' : 'line', delay + i * 80);
                return (
                    <g key={i}>
                        {area && (trace.muted || d.fillUnder) ? (
                            <path d={area} {...(trace.muted ? { fill: C.lane } : { ...accentFill(), ...draw('fade', delay + 200) })} />
                        ) : null}
                        {lines.map((path, k) => (
                            <path
                                key={k}
                                d={path}
                                fill="none"
                                stroke={trace.muted ? C.faint : C.accent}
                                strokeWidth={trace.muted ? 1.4 : traceW}
                                strokeDasharray={trace.dashed ? d.refDash : undefined}
                                strokeLinecap={d.cap}
                                strokeLinejoin="round"
                                {...motion}
                            />
                        ))}
                    </g>
                );
            })}
            {aliasPath ? (
                <path d={aliasPath} fill="none" stroke={C.accent} strokeWidth={traceW} strokeDasharray={d.refDash} strokeLinecap={d.cap} {...draw('fade', delay + 300)} />
            ) : null}
            {samples?.hold ? (
                <path
                    d={sampled
                        .map(({ t, v }, k) => {
                            const next = k < sampled.length - 1 ? sampled[k + 1].t : 1;
                            return `${k === 0 ? 'M' : 'L'}${tx(t).toFixed(1)},${vy(v).toFixed(1)}L${tx(next).toFixed(1)},${vy(v).toFixed(1)}`;
                        })
                        .join('')}
                    fill="none"
                    stroke={C.strong}
                    strokeWidth={1.6}
                    strokeLinejoin={d.join}
                />
            ) : null}
            {sampled.map(({ t, v }, k) => (
                <g key={k}>
                    <line x1={tx(t)} x2={tx(t)} y1={mid} y2={vy(v)} stroke={C.faint} />
                    <Point d={d} x={tx(t)} y={vy(v)} r={3} tone="ink" />
                </g>
            ))}
            {/* Line labels sit on top of the traces, on a backing plate, so a waveform never hides them. */}
            {row.lines?.map((line) => {
                const ly = vy(line.y);
                const above = ly - 17 > y;
                const ty = above ? ly - 5 : ly + 14;
                return (
                    <g key={`label-${line.label}`}>
                        <rect x={x + w - textWidth(line.label) - 12} y={ty - 12} width={textWidth(line.label) + 10} height={15} rx={2} fill={C.surface} opacity={0.9} />
                        <Label x={x + w - 4} y={ty} anchor="end" fill={C.text}>
                            {line.label}
                        </Label>
                    </g>
                );
            })}
        </g>
    );
}

export function Signal({ spec, w, dialect }: { spec: SignalFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const plotH = narrow ? 92 : 112;
    const labelH = 22;
    const gap = 14;
    const rows: { row: SignalRow; top: number; plotY: number; leg: ReturnType<typeof legend> }[] = [];
    let y = 0;
    for (const row of spec.rows) {
        const named = row.traces
            .filter((t) => t.label)
            .map((t) => ({ label: t.label!, dashed: t.dashed, muted: t.muted }));
        const top = y;
        const hasLabel = Boolean(row.label);
        const leg = legend(named, 0, top + (hasLabel ? labelH + 14 : 14), w, d);
        const plotY = top + (hasLabel ? labelH : 0) + leg.height + (leg.height ? 8 : 0);
        rows.push({ row, top, plotY, leg });
        y = plotY + (row.unipolar ? plotH * 0.85 : plotH) + (row.marks?.length ? 24 : 0) + gap;
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
                    <SignalPlot row={row} x={0} y={plotY} w={w} h={row.unipolar ? plotH * 0.85 : plotH} delay={120 + i * 100} d={d} />
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
    const named = spec.curves.filter((c) => c.label).map((c) => ({ label: c.label!, dashed: c.dashed, muted: c.muted }));
    const leg = legend(named, 0, 14, w, d);
    const gainMode = spec.mode === 'gain';
    const left = gainMode ? 40 : 4;
    const right = w - 4;
    // Room above the plot for band or mark labels, or for the dB unit in gain mode.
    const top = leg.height + (spec.bands?.length || spec.marks?.length ? 30 : gainMode ? 24 : 12);
    const plotH = narrow ? 150 : 180;
    const bottom = top + plotH;
    const ledger = d.name === 'business';
    const h = bottom + 26 + (ledger ? 8 : 0);
    const fx = (f: number) => left + ((Math.log10(f) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * (right - left);
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
    const N = Math.round(w * 1.2);
    const freqs = Array.from({ length: N + 1 }, (_, i) => lo * (hi / lo) ** (i / N));

    const clipId = `spectrum-clip-${++clipCounter}`;
    const curveNode = (curve: SpectrumCurve, i: number) => {
        const stroke = curve.muted ? C.faint : C.accent;
        const dash = curve.dashed ? d.refDash : undefined;
        if (curve.kind === 'harmonics') {
            const roll = curve.rolloff ?? 1;
            const level = curve.level ?? 0.95;
            return (
                <g key={i}>
                    {Array.from({ length: curve.count }, (_, n) => {
                        const k = curve.odd ? 2 * n + 1 : n + 1;
                        const f = curve.f0 * k;
                        if (f > hi) return null;
                        const v = level / k ** roll;
                        // Accent harmonics rise from the floor, lowest first.
                        const motion = curve.muted ? {} : draw(curve.dashed ? 'fade' : 'rise', 120 + (300 * (fx(f) - left)) / (right - left));
                        return (
                            <line key={n} x1={fx(f)} x2={fx(f)} y1={bottom} y2={ly(v)} stroke={stroke} strokeWidth={2.2} strokeDasharray={dash} strokeLinecap={d.cap} {...motion} />
                        );
                    })}
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
        const pts = sampleAt.map((f) => [fx(f), gainMode ? gy(value(f)) : ly(value(f))] as [number, number]);
        const path = linePath(pts);
        const fill = curve.kind === 'hump' && !curve.dashed && (curve.muted || d.fillUnder);
        // Grey curves are context and stay put. A solid accent curve draws left to right; a dashed one fades.
        const motion = curve.muted ? {} : draw(curve.dashed ? 'fade' : 'line', 120 + i * 100);
        return (
            <g key={i}>
                {fill ? (
                    <path d={`${path}L${right},${bottom}L${left},${bottom}Z`} {...(curve.muted ? { fill: C.lane } : { ...accentFill(), ...draw('fade', 200 + i * 100) })} />
                ) : null}
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
    // Level mode has no value scale, so music and the ledger add plain quarter rulings for the eye.
    const levelRules = !gainMode && (d.name === 'music' || ledger) ? [1, 2, 3, 4].map((k) => bottom - (k * (plotH - 8)) / 4) : [];

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {leg.node}
            {spec.bands?.map((band) => {
                const a = fx(band.from);
                const b = fx(band.to);
                const mid = (a + b) / 2;
                return (
                    <g key={band.label}>
                        <rect x={a} y={top} width={b - a} height={plotH} rx={d.name === 'mind' ? 6 : 0} fill={C.fill} />
                        <Label x={clamp(mid, textWidth(band.label) / 2, w - textWidth(band.label) / 2)} y={top - 10} anchor="middle" fill={C.ink}>
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
                    {f === ticks[ticks.length - 1] ? `${fmtHz(f)} Hz` : fmtHz(f)}
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
                const flip = x > w - textWidth(mark.label) - 10;
                return (
                    <g key={`${mi}-${mark.label}`}>
                        <RefLine d={d} x1={x} x2={x} y1={top} y2={bottom} />
                        <Label x={flip ? x - 5 : x + 5} y={top - 10} anchor={flip ? 'end' : 'start'} fill={C.ink}>
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
    const oy = 12;
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
    const named = spec.curves.filter((c) => c.label).map((c) => ({ label: c.label!, dashed: c.dashed || c.kind === 'linear', muted: c.kind === 'linear' }));
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
                    <Label x={px(t)} y={oy + size + 16} anchor="middle">
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
            <Title dialect={d} x={10} y={oy + size / 2} anchor="middle" transform={`rotate(-90 10 ${oy + size / 2})`}>
                {db ? 'Output level (dB)' : 'Output'}
            </Title>
            {spec.curves.map((c, i) => {
                const pts: [number, number][] = [];
                for (let k = 0; k <= N; k++) {
                    const x = lo + ((hi - lo) * k) / N;
                    pts.push([px(x), py(out(c, x))]);
                }
                const linear = c.kind === 'linear';
                // The unity line is a reference and stays put; accent curves draw from quiet to loud.
                const motion = linear ? {} : draw(c.dashed ? 'fade' : 'line', 120 + i * 100);
                return (
                    <path
                        key={i}
                        d={linePath(pts)}
                        fill="none"
                        stroke={linear ? C.faint : C.accent}
                        strokeWidth={linear ? 1.4 : d.line}
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
                        <RefLine d={d} x1={px(c.threshold!)} x2={px(c.threshold!)} y1={oy} y2={oy + size} />
                        <Label x={px(c.threshold!) - 5} y={oy + 14} anchor="end" fill={C.text}>
                            Threshold
                        </Label>
                    </g>
                ))}
            {leg.node}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}
