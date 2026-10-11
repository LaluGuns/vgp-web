/**
 * Shared drawing helpers for article figures, on the dark surface
 * (docs/DESIGN.md, "Article figures" and "Figure dialects"). The data the
 * caption asks you to look at is drawn in the accent; text, axes, grids and
 * "before" states stay white or grey, and dashed lines mark reference
 * states. Each lesson group draws in its own dialect (lib/blog/dialects.ts):
 * the helpers below take the dialect and draw rules, markers, bars, steps
 * and arrows its way, so every figure type speaks every dialect.
 *
 * Accent marks are drawn in `currentColor`, and the root <svg> carries the
 * dialect's accent as its `color` attribute, so a figure is complete with
 * no stylesheet (the offline renderer) and needs no CSS on the page.
 */

import type { CSSProperties, ReactNode, SVGProps } from 'react';
import { resolveDialect, type Dialect, type DialectName } from '@/lib/blog/dialects';

export type { Dialect, DialectName };

/** What a figure component accepts: a dialect name or resolved tokens. Missing: technical. */
export type DialectProp = Dialect | DialectName;

export const dialectOf = (dialect?: DialectProp | string) => resolveDialect(dialect);

/**
 * White at an opacity, already laid over the figure surface, as an opaque
 * colour. Grey fills use these, so a rule or a staff line behind a bar or a
 * cell never shows through it.
 */
export const solid = (opacity: number) => {
    const mix = (base: number) => Math.round(base + (255 - base) * opacity);
    return `rgb(${mix(10)},${mix(14)},${mix(18)})`;
};

export const C = {
    ink: 'rgba(255,255,255,0.92)',
    strong: 'rgba(255,255,255,0.75)',
    text: 'rgba(255,255,255,0.72)',
    soft: 'rgba(255,255,255,0.52)',
    /** Ticks, stems and other marks that only hold the drawing together. */
    faint: 'rgba(255,255,255,0.3)',
    /**
     * A grey data line: a "before" trace, a muted curve, the unity line. It
     * carries meaning, so it keeps 3:1 on the surface (3.7:1) while staying
     * well under the accent.
     */
    dataGrey: 'rgba(255,255,255,0.4)',
    grid: 'rgba(255,255,255,0.1)',
    lane: 'rgba(255,255,255,0.035)',
    fill: 'rgba(255,255,255,0.08)',
    fillStrong: 'rgba(255,255,255,0.18)',
    /** A grey bar or cell: context, solid so nothing behind it shows through. */
    dim: solid(0.18),
    /** A grey cell that still reads as a part playing, next to the accent ones. */
    muted: solid(0.34),
    /** The figure surface, for plates behind labels. */
    surface: '#0a0e12',
    /** The data in focus, in the accent set on the root <svg>. */
    accent: 'currentColor',
};

/** Fill in the accent at an opacity. 0.12 is the area under a focus curve. */
export const accentFill = (opacity = 0.12) => ({ fill: C.accent, fillOpacity: Number(opacity.toFixed(2)) });

/** The faint area under a focus line in the lit dialects (technical, mind). */
export const areaFill = (d: Dialect) => accentFill(d.area);

/** Stroke in the accent at an opacity. */
export const accentStroke = (opacity = 1) => ({ stroke: C.accent, strokeOpacity: Number(opacity.toFixed(2)) });

/**
 * The fourth line style. Beside a solid accent line (look here), a dashed line (a reference) and a grey
 * one (context), a line of accent dots is a second line the caption also names: also look here. The
 * dots are round in every dialect and a touch heavier than a line, and the space between two dots is
 * at least as long as the dialect's dash (every dash is longer than a dot is wide), so a dotted line
 * never reads as a finer dash. A dotted line fades in like a dashed one (a dash pattern cannot draw
 * along its length) and has no area under it.
 */
export function dots(d: Dialect, muted?: boolean) {
    const width = Number((d.line + 0.65).toFixed(2));
    return {
        stroke: muted ? C.dataGrey : C.accent,
        strokeWidth: width,
        strokeDasharray: `0 ${dotPeriod(d)}`,
        strokeLinecap: 'round' as const,
    };
}

/** Centre to centre of two dots: a dash's length of space between them, and never tighter than 2.4 dot widths. */
export function dotPeriod(d: Dialect) {
    const width = d.line + 0.65;
    const dash = Number(d.refDash.split(' ')[0]);
    return Number(Math.max(width * 2.4, dash + width).toFixed(1));
}

/** White at an opacity, for rules. */
const white = (opacity: number) => `rgba(255,255,255,${Number(opacity.toFixed(3))})`;

/**
 * Draw-in on scroll (docs/DESIGN.md, Motion). The figure frame carries
 * `data-reveal="draw"`, and app/globals.css plays these classes once when
 * MotionObserver reveals it. With no script, under reduced motion, in
 * print, or when the figure starts on screen, they do nothing.
 *
 * - `line`: a solid accent stroke draws along its length. Sets
 *   `pathLength={1}`, so never use it on a dashed stroke.
 * - `grow`: a bar grows from its left edge. `rise`: from its bottom edge.
 * - `pop`: a dot fades and scales in. `fade`: fades in.
 * - `focus`: a ring closes in on its point, the way attention settles.
 * - `slide`: a moved hit slides from its grid step (`--draw-from`, in
 *   user units) to where it lands.
 *
 * The element must not have its own `transform` attribute. Its animation
 * events never arrive: MotionObserver stops them at the window (see
 * Figure.tsx), so nothing in a figure can wait on onAnimationEnd.
 */
export type DrawKind = 'line' | 'grow' | 'rise' | 'pop' | 'fade' | 'focus' | 'slide';

export function draw(kind: DrawKind, delayMs = 0, vars?: Record<`--${string}`, string>) {
    const style = { '--draw-delay': `${Math.round(delayMs)}ms`, ...vars } as CSSProperties;
    return kind === 'line' ? { className: 'vgp-draw-line', pathLength: 1, style } : { className: `vgp-draw-${kind}`, style };
}

/**
 * Label size in figure units. Phones draw the narrow layout 270 wide into a
 * box 270 px wide at a 320 px screen (248 px inside an indented "Try it" or
 * "Common mistake" block), so 12 renders at 11 to 12 px there and about
 * 15 px at 390; nothing in a figure is set smaller.
 */
export const FS = 12;

/** Width the narrow (phone) layout is drawn at. Figure.tsx draws it; figures switch layout below 480. */
export const NARROW_W = 270;

/**
 * Width of a label in the system UI font, from rough widths per kind of
 * character (in em). Numbers are set in tabular figures in some dialects,
 * which run wider than text, so a digit counts as 0.62.
 */
export function textWidth(text: string, size = FS) {
    let em = 0;
    for (const ch of text) {
        if (ch >= '0' && ch <= '9') em += 0.62;
        else if (ch === ' ') em += 0.27;
        else if ('il.,:;!|\'’()[]'.includes(ch)) em += 0.27;
        else if ('mwMW%'.includes(ch)) em += 0.84;
        else if (ch >= 'A' && ch <= 'Z') em += 0.66;
        else if (ch >= 'a' && ch <= 'z') em += 0.54;
        else em += 0.62;
    }
    return em * size;
}

export function wrapText(text: string, maxWidth: number, size = FS): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (textWidth(next, size) > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = next;
        }
    }
    if (line) lines.push(line);
    return lines;
}

export function Svg({ w, h, label, d, children }: { w: number; h: number; label: string; d: Dialect; children: ReactNode }) {
    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            role="img"
            aria-label={label}
            color={d.accent}
            fontSize={FS}
            data-dialect={d.name}
            className="vgp-fig block h-auto overflow-visible"
            style={{ fontFamily: 'var(--font-display)', fontVariantNumeric: d.tabular ? 'tabular-nums' : undefined }}
        >
            {/* The image's name is the whole description (alt). Chrome keeps the drawing's text under the img role, so a
                screen reader read its labels again after it; this group takes them out of the accessibility tree. */}
            <g aria-hidden="true">{children}</g>
        </svg>
    );
}

export function Label({
    x,
    y,
    children,
    anchor = 'start',
    size = FS,
    fill = C.soft,
    weight,
    ...rest
}: {
    x: number;
    y: number;
    children: ReactNode;
    anchor?: 'start' | 'middle' | 'end';
    size?: number;
    fill?: string;
    weight?: number;
} & Omit<SVGProps<SVGTextElement>, 'x' | 'y' | 'fill'>) {
    return (
        <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} {...rest}>
            {children}
        </text>
    );
}

/** An axis title ("Energy ↑", "Input level (dB)"). Music sets it in italic, like the expression text in a score. */
export function Title({ dialect, ...props }: { dialect: Dialect } & Parameters<typeof Label>[0]) {
    return <Label fill={C.text} fontStyle={dialect.italic ? 'italic' : undefined} {...props} />;
}

/** Multi-line label; `y` is the first baseline. */
export function Lines({
    x,
    y,
    lines,
    anchor = 'start',
    size = FS,
    fill = C.soft,
    lineHeight = 1.35,
    weight,
    italic,
}: {
    x: number;
    y: number;
    lines: string[];
    anchor?: 'start' | 'middle' | 'end';
    size?: number;
    fill?: string;
    lineHeight?: number;
    weight?: number;
    italic?: boolean;
}) {
    return (
        <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} fontStyle={italic ? 'italic' : undefined}>
            {lines.map((line, i) => (
                <tspan key={i} x={x} dy={i === 0 ? 0 : size * lineHeight}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

// ── Rules: the grid texture of each dialect ──

/** A grid rule. `major` for main divisions, beats and bar lines. Solid, or dotted in the mind dialect. */
export function Rule({
    d,
    x1,
    y1,
    x2,
    y2,
    major,
    opacity,
}: {
    d: Dialect;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    major?: boolean;
    /** Overrides the dialect's opacity, for rules that must sit lower still. */
    opacity?: number;
}) {
    return (
        <line
            x1={x1}
            x2={x2}
            y1={y1}
            y2={y2}
            stroke={white(opacity ?? (major ? d.rule.major : d.rule.minor))}
            strokeWidth={d.rule.width}
            strokeDasharray={d.rule.dash || undefined}
            strokeLinecap={d.rule.cap}
        />
    );
}

/** An axis or baseline: solid in every dialect, because it is where values are read from. */
export function Axis({ x1, y1, x2, y2, width = 1 }: { x1: number; y1: number; x2: number; y2: number; width?: number }) {
    return <line x1={x1} x2={x2} y1={y1} y2={y2} stroke={C.faint} strokeWidth={width} />;
}

/** A dashed reference line (a threshold, a mark, a "before" state). Grey in every dialect. */
export function RefLine({
    d,
    x1,
    y1,
    x2,
    y2,
    stroke = C.soft,
    width = 1,
}: {
    d: Dialect;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    width?: number;
}) {
    return <line x1={x1} x2={x2} y1={y1} y2={y2} stroke={stroke} strokeWidth={width} strokeDasharray={d.refDash} strokeLinecap={d.cap} />;
}

/**
 * Registration ticks at the corners of a plot, as on an instrument display.
 * Technical only; other dialects frame their plots with their own rules.
 */
export function Corners({ d, x, y, w, h, arm = 5 }: { d: Dialect; x: number; y: number; w: number; h: number; arm?: number }) {
    if (d.name !== 'technical') return null;
    const p = (cx: number, cy: number, sx: number, sy: number) => `M${cx + sx * arm},${cy}H${cx}V${cy + sy * arm}`;
    return (
        <path
            d={`${p(x, y, 1, 1)}${p(x + w, y, -1, 1)}${p(x, y + h, 1, -1)}${p(x + w, y + h, -1, -1)}`}
            fill="none"
            stroke={white(0.34)}
            strokeWidth={1}
            strokeLinecap="square"
        />
    );
}

/** The ledger's closing double rule under a figure. Business only. */
export function ClosingRule({ d, x1, x2, y }: { d: Dialect; x1: number; x2: number; y: number }) {
    if (d.name !== 'business') return null;
    return (
        <g stroke={white(d.rule.major)} strokeWidth={1}>
            <line x1={x1} x2={x2} y1={y} y2={y} />
            <line x1={x1} x2={x2} y1={y + 3} y2={y + 3} />
        </g>
    );
}

/** A bar line. `double` marks a section change, `final` closes the piece (thin then thick). Music only. */
export function Barline({ x, y1, y2, kind = 'single', opacity = 0.5 }: { x: number; y1: number; y2: number; kind?: 'single' | 'double' | 'final'; opacity?: number }) {
    const stroke = white(opacity);
    if (kind === 'single') return <line x1={x} x2={x} y1={y1} y2={y2} stroke={stroke} strokeWidth={1} />;
    if (kind === 'double')
        return (
            <g stroke={stroke} strokeWidth={1}>
                <line x1={x - 1.5} x2={x - 1.5} y1={y1} y2={y2} />
                <line x1={x + 1.5} x2={x + 1.5} y1={y1} y2={y2} />
            </g>
        );
    return (
        <g stroke={stroke}>
            <line x1={x - 4} x2={x - 4} y1={y1} y2={y2} strokeWidth={1} />
            <line x1={x - 1} x2={x - 1} y1={y1} y2={y2} strokeWidth={2.5} />
        </g>
    );
}

// ── Marks: points, bars, steps and arrows in each dialect ──

export type Tone = 'accent' | 'muted' | 'ink';

// Grey marks are solid, so an axis or a rule behind one never shows through it.
const toneFill = (tone: Tone, opacity = 1) =>
    tone === 'accent' ? accentFill(opacity) : { fill: solid(tone === 'ink' ? 0.92 : 0.75), fillOpacity: opacity < 1 ? opacity : undefined };

/**
 * One value marked on a line or an axis. `r` is the size of a plain dot.
 * Technical: a measured square. Music: a note head, hollow when not in
 * focus. Mind: a dot held in a focus ring. Business: a tick, as on a ledger.
 */
export function Point({
    d,
    x,
    y,
    r = 2.6,
    tone = 'accent',
    opacity = 1,
    delay,
}: {
    d: Dialect;
    x: number;
    y: number;
    r?: number;
    tone?: Tone;
    opacity?: number;
    /** Draw-in delay in ms; omit to keep the mark still. */
    delay?: number;
}) {
    const motion = delay === undefined ? {} : draw('pop', delay);
    switch (d.marker) {
        case 'square': {
            const s = r * 1.8;
            return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} {...toneFill(tone, opacity)} {...motion} />;
        }
        case 'head': {
            const path = headPath(x, y, r);
            // An engraved head sits on the paper with a hair of space round it, so a line running into it reads as joining.
            return tone === 'accent' ? (
                <path d={path} {...accentFill(opacity)} stroke={C.surface} strokeWidth={1.2} paintOrder="stroke" {...motion} />
            ) : (
                <path d={path} fill={C.surface} stroke={tone === 'ink' ? C.ink : C.strong} strokeOpacity={opacity < 1 ? opacity : undefined} strokeWidth={1.3} {...motion} />
            );
        }
        case 'ring': {
            if (tone !== 'accent') return <circle cx={x} cy={y} r={r} {...toneFill(tone, opacity)} {...motion} />;
            return (
                <g>
                    <circle cx={x} cy={y} r={r * 2.3} fill="none" {...accentStroke(0.55 * opacity)} strokeWidth={1} {...(delay === undefined ? {} : draw('focus', delay + 60))} />
                    <circle cx={x} cy={y} r={r} {...accentFill(opacity)} {...motion} />
                </g>
            );
        }
        case 'tick': {
            const hh = r * 1.9;
            return <rect x={x - 1} y={y - hh} width={2} height={hh * 2} {...toneFill(tone, opacity)} {...motion} />;
        }
    }
}

/**
 * A note head centred on x, y, as wide as a dot of radius `r` is high times
 * 3.2. It leans back like an engraved head; the tilt is drawn into the path,
 * so the element keeps no transform attribute and can still be animated.
 */
export const headPath = (x: number, y: number, r: number) => ellipsePath(x, y, r * 1.6, r * 1.15, -20);

/** An ellipse rotated by `deg`, as a path (four arcs), so it needs no transform. */
function ellipsePath(cx: number, cy: number, rx: number, ry: number, deg: number) {
    const a = (deg * Math.PI) / 180;
    const pt = (t: number) => {
        const ex = rx * Math.cos(t);
        const ey = ry * Math.sin(t);
        return `${(cx + ex * Math.cos(a) - ey * Math.sin(a)).toFixed(2)},${(cy + ex * Math.sin(a) + ey * Math.cos(a)).toFixed(2)}`;
    };
    const arc = `A${rx},${ry} ${deg} 0 1 `;
    return `M${pt(0)}${arc}${pt(Math.PI / 2)}${arc}${pt(Math.PI)}${arc}${pt(Math.PI * 1.5)}${arc}${pt(0)}Z`;
}

/** Corner radius of a bar, cell or note `h` high in this dialect. */
export const cornerOf = (d: Dialect, h: number, w = Infinity) => Math.min(d.corner === 'pill' ? h / 2 : d.corner, h / 2, w / 2);

/**
 * A horizontal bar. Its value is its right edge, in every dialect.
 * Business adds a tick at that edge, the way a ledger marks an entry.
 * An `open` bar has no upper limit: it fades out over its last stretch and
 * has no end mark, so it never reads as a number.
 */
export function Bar({
    d,
    x,
    y,
    w,
    h,
    tone = 'accent',
    opacity = 1,
    delay,
    open,
}: {
    d: Dialect;
    x: number;
    y: number;
    w: number;
    h: number;
    tone?: Tone | 'dim';
    opacity?: number;
    delay?: number;
    open?: boolean;
}) {
    const rx = cornerOf(d, h, w);
    const paint = tone === 'dim' ? { fill: C.dim } : toneFill(tone, opacity);
    const motion = delay === undefined || tone === 'dim' ? {} : draw('grow', delay);
    const fadeId = open ? `bar-open-${++fadeCounter}` : '';
    // The fade runs over the last 56 units, or under half of a short bar.
    const fadeFrom = Number((1 - Math.min(0.45, 56 / Math.max(1, w))).toFixed(3));
    const colour = tone === 'dim' ? C.dim : tone === 'accent' ? 'currentColor' : paint.fill;
    return (
        <g>
            {open ? (
                <defs>
                    <linearGradient id={fadeId} x1="0" x2="1" y1="0" y2="0">
                        <stop offset={0} stopColor={colour} stopOpacity={tone === 'accent' ? opacity : 1} />
                        <stop offset={fadeFrom} stopColor={colour} stopOpacity={tone === 'accent' ? opacity : 1} />
                        <stop offset={1} stopColor={colour} stopOpacity={0} />
                    </linearGradient>
                </defs>
            ) : null}
            <rect x={x} y={y} width={w} height={h} rx={rx} {...(open ? { fill: `url(#${fadeId})` } : paint)} {...motion} />
            {d.name === 'business' && !open ? (
                <rect
                    x={x + w - 2}
                    y={y - 3}
                    width={2}
                    height={h + 6}
                    {...(tone === 'dim' ? { fill: C.soft } : toneFill(tone, 1))}
                    {...(delay === undefined || tone === 'dim' ? {} : draw('fade', delay + 420))}
                />
            ) : null}
        </g>
    );
}

let fadeCounter = 0;

/** The track a bar runs along: a faint field (technical), a staff line (music), a dotted line (mind), nothing (business: the row rules carry it). */
export function Track({ d, x, y, w, h }: { d: Dialect; x: number; y: number; w: number; h: number }) {
    switch (d.name) {
        case 'technical':
            return <rect x={x} y={y} width={w} height={h} rx={cornerOf(d, h)} fill={C.lane} />;
        case 'music':
            return <line x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} stroke={white(d.rule.major)} strokeLinecap="round" />;
        case 'mind':
            return <Rule d={d} x1={x} x2={x + w} y1={y + h / 2} y2={y + h / 2} />;
        case 'business':
            return null;
    }
}

/** Arrowhead pointing along `angle` (degrees, 0 = right) with its tip at x, y. */
export function Arrowhead({ x, y, angle, size = 6, fill = C.soft, d }: { x: number; y: number; angle: number; size?: number; fill?: string; d?: Dialect }) {
    const a = (angle * Math.PI) / 180;
    const p = (da: number, s = size) => `${(x - s * Math.cos(a + da)).toFixed(2)},${(y - s * Math.sin(a + da)).toFixed(2)}`;
    if (!d || d.name === 'technical') return <polygon points={`${x},${y} ${p(0.45)} ${p(-0.45)}`} fill={fill} />;
    // Open heads elsewhere: a drawn chevron, round in music and mind, sharp and thin in the ledger.
    const spread = d.name === 'mind' ? 0.62 : 0.5;
    const s = d.name === 'business' ? size * 0.95 : size * 1.05;
    return (
        <polyline
            points={`${p(spread, s)} ${x},${y} ${p(-spread, s)}`}
            fill="none"
            stroke={fill}
            strokeWidth={d.name === 'business' ? 1.25 : 1.5}
            strokeLinecap={d.cap}
            strokeLinejoin={d.join}
        />
    );
}

/** Where a line into an arrowhead should stop: a filled head covers its own length, an open head needs the line to reach the tip. */
export const arrowInset = (d: Dialect, size = 6) => (d.name === 'technical' ? size - 1 : 1);

/**
 * A flow step's box. Technical: a module. Music: a hand-set card. Mind: a
 * soft node. Business: a ruled entry. A step in focus is outlined in the
 * accent (and lit faintly in technical and mind); its outline draws round
 * the box once the step is in.
 */
export function Node({ d, x, y, w, h, focus, delay }: { d: Dialect; x: number; y: number; w: number; h: number; focus?: boolean; delay?: number }) {
    const rx = d.node === 'pill' ? Math.min(h / 2, 22) : d.node;
    if (!focus) return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={rx} fill={C.lane} stroke={d.name === 'technical' ? white(0.26) : C.faint} />;
    const inset = 0.75;
    return (
        <g>
            <rect x={x + inset} y={y + inset} width={w - inset * 2} height={h - inset * 2} rx={rx} {...(d.fillUnder ? accentFill(d.area * 0.8) : { fill: C.lane })} />
            <path
                d={roundRectPath(x + inset, y + inset, w - inset * 2, h - inset * 2, rx)}
                fill="none"
                stroke={C.accent}
                strokeWidth={1.5}
                strokeLinejoin={d.join}
                {...(delay === undefined ? {} : draw('line', delay))}
            />
        </g>
    );
}

/** A rounded rectangle as one path, starting at the top-left corner, so its outline can draw round it. */
function roundRectPath(x: number, y: number, w: number, h: number, rx: number) {
    const r = Math.max(0, Math.min(rx, w / 2, h / 2));
    const f = (v: number) => Number(v.toFixed(2));
    if (r === 0) return `M${f(x)},${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;
    return (
        `M${f(x + r)},${f(y)}H${f(x + w - r)}A${f(r)},${f(r)} 0 0 1 ${f(x + w)},${f(y + r)}V${f(y + h - r)}` +
        `A${f(r)},${f(r)} 0 0 1 ${f(x + w - r)},${f(y + h)}H${f(x + r)}A${f(r)},${f(r)} 0 0 1 ${f(x)},${f(y + h - r)}V${f(y + r)}A${f(r)},${f(r)} 0 0 1 ${f(x + r)},${f(y)}Z`
    );
}

// ── Label placement ──

export type Anchor = 'start' | 'middle' | 'end';

export interface RowItem {
    /** Where the label belongs: a mark's line. */
    x: number;
    width: number;
    /** Anchors to try, in order. start sits right of x, end left of it, middle centred on it. */
    prefer: Anchor[];
}

export interface Placed {
    anchor: Anchor;
    row: number;
    /** The label's x for its anchor. */
    tx: number;
    from: number;
    to: number;
}

/**
 * Labels for marks along one axis (lines on a spectrum, marks under a
 * waveform), placed in rows. Each label tries its anchors in order, then the
 * next row. A label never overlaps another, never leaves lo to hi, and a
 * label in an outer row never sits over the line of a mark whose label is
 * in an inner row (that line runs out to its label), so leaders never cross
 * text. When two marks are close, the left one's label goes to its left
 * and the right one's to its right. `taken` holds spans already used in the
 * first row (band labels).
 *
 * One anchor rule: once the labels need more than one row, they all take
 * the same side of their lines (the first anchor every item prefers that
 * needs no more rows), so a stacked set never mixes left and right.
 */
export function placeInRows(items: RowItem[], lo: number, hi: number, { offset = 5, gap = 8, taken = [] as [number, number][] } = {}): Placed[] {
    const mixed = placeRows(items, lo, hi, offset, gap, taken);
    const rows = (placed: Placed[]) => placed.reduce((m, p) => Math.max(m, p.row + 1), 0);
    if (rows(mixed) < 2 || new Set(mixed.map((p) => p.anchor)).size < 2) return mixed;
    for (const anchor of items[0].prefer.filter((a) => items.every((item) => item.prefer.includes(a)))) {
        const uniform = placeRows(items, lo, hi, offset, gap, taken, anchor);
        if (rows(uniform) <= rows(mixed) && uniform.every((p) => p.anchor === anchor)) return uniform;
    }
    return mixed;
}

function placeRows(items: RowItem[], lo: number, hi: number, offset: number, gap: number, taken: [number, number][], only?: Anchor): Placed[] {
    const order = items.map((_, i) => i).sort((a, b) => items[a].x - items[b].x);
    const out: Placed[] = new Array(items.length);
    const placed: (Placed & { x: number })[] = [];
    const span = (item: RowItem, anchor: Anchor) => {
        const tx = anchor === 'start' ? item.x + offset : anchor === 'end' ? item.x - offset : item.x;
        const from = anchor === 'start' ? tx : anchor === 'end' ? tx - item.width : tx - item.width / 2;
        return { tx, from, to: from + item.width };
    };
    order.forEach((index, k) => {
        const item = items[index];
        const next = order[k + 1] === undefined ? undefined : items[order[k + 1]];
        // A start label would run into the next mark: try its left side first. In the first row, where every
        // mark's line reaches up to the labels, it never takes the right side then: it would end against the
        // next mark's line and read as one phrase with the next label ("Rumble | Box"). It goes up a row instead.
        // With one anchor for all (`only`), the same holds for every mark's line, not just the next one's.
        const crowded = !only && next && next.x - item.x < item.width + offset + gap;
        const prefer = only ? [only] : crowded && item.prefer.includes('end') ? (['end', ...item.prefer.filter((a) => a !== 'end')] as Anchor[]) : item.prefer;
        for (let row = 0; row < items.length + 1; row++) {
            const fit = prefer
                .filter((anchor) => !(crowded && row === 0 && anchor === 'start' && prefer.includes('end')))
                .map((anchor) => ({ anchor, ...span(item, anchor) }))
                .find(
                    (c) =>
                        c.from >= lo - 0.5 &&
                        c.to <= hi + 0.5 &&
                        (row > 0 || taken.every(([a, b]) => c.to + gap <= a || c.from >= b + gap)) &&
                        (row > 0 || !only || items.every((other, oi) => oi === index || other.x < c.from - gap || other.x > c.to + gap)) &&
                        // A label up a row has its line run down past the first row: never through a taken span.
                        (row === 0 || taken.every(([a, b]) => item.x < a - 3 || item.x > b + 3)) &&
                        placed.every((p) => {
                            if (p.row === row) return c.to + gap <= p.from || c.from >= p.to + gap;
                            // An outer label's line must not run under an inner label, and the other way round.
                            if (p.row < row) return item.x < p.from - 3 || item.x > p.to + 3;
                            return p.x < c.from - 3 || p.x > c.to + 3;
                        }),
                );
            if (fit) {
                const p = { anchor: fit.anchor, row, tx: fit.tx, from: fit.from, to: fit.to };
                out[index] = p;
                placed.push({ ...p, x: item.x });
                return;
            }
        }
        // No room at all (more marks than the plot can label): keep the first choice in a row of its own.
        const c = span(item, prefer[0]);
        const p = { anchor: prefer[0], row: placed.reduce((m, q) => Math.max(m, q.row + 1), 0), ...c };
        out[index] = p;
        placed.push({ ...p, x: item.x });
    });
    return out;
}

const num = (v: number) => String(Math.round(v * 10) / 10);

/** Drops points that sit within `tolerance` px of the line between their neighbours (Ramer-Douglas-Peucker). */
function simplify(points: [number, number][], tolerance = 0.2): [number, number][] {
    if (points.length < 3) return points;
    const keep = new Uint8Array(points.length);
    keep[0] = keep[points.length - 1] = 1;
    const stack: [number, number][] = [[0, points.length - 1]];
    while (stack.length) {
        const [a, b] = stack.pop()!;
        const [ax, ay] = points[a];
        const dx = points[b][0] - ax;
        const dy = points[b][1] - ay;
        const len = Math.hypot(dx, dy) || 1;
        let max = 0;
        let at = -1;
        for (let i = a + 1; i < b; i++) {
            const dd = Math.abs(dy * (points[i][0] - ax) - dx * (points[i][1] - ay)) / len;
            if (dd > max) {
                max = dd;
                at = i;
            }
        }
        if (max > tolerance) {
            keep[at] = 1;
            stack.push([a, at], [at, b]);
        }
    }
    return points.filter((_, i) => keep[i]);
}

export function linePath(points: [number, number][]): string {
    return simplify(points)
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${num(x)},${num(y)}`)
        .join('');
}

/** Monotone cubic curve through the points: smooth, never overshoots. */
export function smoothPath(points: [number, number][]): string {
    const n = points.length;
    if (n < 3) return linePath(points);
    const x = points.map((p) => p[0]);
    const y = points.map((p) => p[1]);
    const dx: number[] = [];
    const m: number[] = [];
    for (let i = 0; i < n - 1; i++) {
        dx[i] = x[i + 1] - x[i];
        m[i] = (y[i + 1] - y[i]) / dx[i];
    }
    const t: number[] = [m[0]];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    t[n - 1] = m[n - 2];
    for (let i = 0; i < n - 1; i++) {
        if (m[i] === 0) {
            t[i] = 0;
            t[i + 1] = 0;
            continue;
        }
        const a = t[i] / m[i];
        const b = t[i + 1] / m[i];
        const s = a * a + b * b;
        if (s > 9) {
            const k = 3 / Math.sqrt(s);
            t[i] = k * a * m[i];
            t[i + 1] = k * b * m[i];
        }
    }
    let path = `M${x[0].toFixed(1)},${y[0].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
        const h = dx[i] / 3;
        path += `C${(x[i] + h).toFixed(1)},${(y[i] + t[i] * h).toFixed(1)} ${(x[i + 1] - h).toFixed(1)},${(y[i + 1] - t[i + 1] * h).toFixed(1)} ${x[i + 1].toFixed(1)},${y[i + 1].toFixed(1)}`;
    }
    return path;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface LegendItem {
    label: string;
    dashed?: boolean;
    /** A line of accent dots (`dots`). */
    dotted?: boolean;
    muted?: boolean;
    /** Line colour when it is neither the accent nor muted. */
    stroke?: string;
    /** Draw a filled swatch instead of a line. */
    swatch?: string;
    /**
     * A sample in the shape of the mark, where a line would not tell two kinds apart (spectrum curves): `ticks`,
     * three falling lines, for harmonics (`tick`, one, for a single one); `hump` for a hump, and `area` for one the
     * plot fills under.
     */
    sample?: 'ticks' | 'tick' | 'hump' | 'area';
    /** Line width of the sample. A reference line's sample is as thin as the line. */
    width?: number;
}

/** A hump 18 units wide and 10 high, standing on the label's baseline. */
const humpPath = (x: number, y: number) => `M${x},${y + 0.5}C${x + 5},${y + 0.5} ${x + 6},${y - 9.5} ${x + 9},${y - 9.5}C${x + 12},${y - 9.5} ${x + 13},${y + 0.5} ${x + 18},${y + 0.5}`;

/** A sample in the shape of its mark (LegendItem `sample`), in the item's line style. */
function shapedSample(item: LegendItem, x: number, y: number, d: Dialect): ReactNode {
    const stroke = item.muted ? C.dataGrey : C.accent;
    const style = item.dotted ? dots(d, item.muted) : { stroke, strokeDasharray: item.dashed ? d.refDash : undefined };
    if (item.sample === 'ticks' || item.sample === 'tick') {
        // Falling like a harmonic series, with flat ends, as the plot draws them; a single harmonic is one tick.
        return (
            <g>
                {(item.sample === 'tick' ? [10] : [10, 6, 4]).map((height, i) => (
                    <line key={i} x1={x + 2 + i * 6} x2={x + 2 + i * 6} y1={y + 0.5} y2={y + 0.5 - height} strokeWidth={item.dotted ? undefined : 2} {...style} />
                ))}
            </g>
        );
    }
    const path = humpPath(x, y);
    return (
        <g>
            {item.sample === 'area' ? <path d={`${path}Z`} {...(item.muted ? { fill: C.lane } : areaFill(d))} /> : null}
            <path d={path} fill="none" strokeWidth={item.dotted ? undefined : 1.8} strokeLinecap={item.dotted ? undefined : d.cap} strokeLinejoin="round" {...style} />
        </g>
    );
}

/** Legend of line samples that wraps to the available width. Samples take the dialect's line ends and dashes. */
export function legend(
    items: LegendItem[],
    x: number,
    y: number,
    maxWidth: number,
    d: Dialect,
    column = false,
): { node: ReactNode; height: number } {
    if (items.length === 0) return { node: null, height: 0 };
    const rowH = column ? 22 : 18;
    let cx = x;
    let row = 0;
    // A dotted sample is three dots, which in the wider-spaced dialects runs past a line sample: its label steps
    // right to keep the same air after the sample.
    const dotW = d.line + 0.65;
    const labelAt = (item: LegendItem) => (item.dotted && !item.swatch && !item.sample ? Math.max(24, Math.ceil(dotPeriod(d) * 2 + dotW + 6)) : 24);
    const placed = items.map((item, i) => {
        const w = labelAt(item) + textWidth(item.label) + 16;
        // A few units of slack, since label widths are estimated.
        if (column ? i > 0 : cx + w - 12 > x + maxWidth && cx > x) {
            cx = x;
            row++;
        }
        const at = { item, x: cx, y: y + row * rowH };
        cx += w;
        return at;
    });
    const node = (
        <g>
            {placed.map(({ item, x: lx, y: ly }) => (
                <g key={item.label}>
                    {item.swatch ? (
                        <rect x={lx} y={ly - 10} width={16} height={10} rx={cornerOf(d, 10, 16)} fill={item.swatch} />
                    ) : item.sample ? (
                        shapedSample(item, lx, ly, d)
                    ) : item.dotted ? (
                        // The same dots as on the line, a row of three from the sample's left edge. The line runs half a unit
                        // past the third dot, so rounding its end never drops that dot.
                        <line x1={lx + dotW / 2} x2={lx + dotW / 2 + dotPeriod(d) * 2 + 0.5} y1={ly - 4} y2={ly - 4} {...dots(d, item.muted)} />
                    ) : (
                        <line
                            x1={lx + (d.cap === 'round' ? 1 : 0)}
                            x2={lx + (d.cap === 'round' ? 17 : 18)}
                            y1={ly - 4}
                            y2={ly - 4}
                            stroke={item.stroke ?? (item.muted ? C.dataGrey : C.accent)}
                            strokeWidth={item.width ?? 1.8}
                            strokeDasharray={item.dashed ? d.refDash : undefined}
                            strokeLinecap={d.cap}
                        />
                    )}
                    <Label x={lx + labelAt(item)} y={ly} fill={C.text}>
                        {item.label}
                    </Label>
                </g>
            ))}
        </g>
    );
    return { node, height: (row + 1) * rowH };
}
