/**
 * Shared drawing helpers for article figures, on the dark surface
 * (docs/DESIGN.md). The data the caption asks you to look at is drawn in
 * the site accent; text, axes, grids and "before" states stay white or
 * grey, and dashed lines mark reference states.
 */

import type { ReactNode, SVGProps } from 'react';

export const C = {
    ink: 'rgba(255,255,255,0.92)',
    strong: 'rgba(255,255,255,0.75)',
    text: 'rgba(255,255,255,0.72)',
    soft: 'rgba(255,255,255,0.52)',
    faint: 'rgba(255,255,255,0.3)',
    grid: 'rgba(255,255,255,0.1)',
    lane: 'rgba(255,255,255,0.035)',
    fill: 'rgba(255,255,255,0.08)',
    fillStrong: 'rgba(255,255,255,0.18)',
    /** `--accent`: the data in focus. */
    accent: '#7dd3fc',
    accentFill: 'rgba(125,211,252,0.12)',
};

export const accentAlpha = (a: number) => `rgba(125,211,252,${a.toFixed(2)})`;

export const FS = 12;
export const DASH = '5 4';

/** Rough width of a label in the system UI font. */
export function textWidth(text: string, size = FS) {
    return text.length * size * 0.56;
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

export function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            role="img"
            aria-label={label}
            className="block h-auto overflow-visible"
            style={{ fontFamily: 'var(--font-display)' }}
        >
            {children}
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
}: {
    x: number;
    y: number;
    lines: string[];
    anchor?: 'start' | 'middle' | 'end';
    size?: number;
    fill?: string;
    lineHeight?: number;
    weight?: number;
}) {
    return (
        <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight}>
            {lines.map((line, i) => (
                <tspan key={i} x={x} dy={i === 0 ? 0 : size * lineHeight}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

export function Arrowhead({ x, y, angle, size = 6, fill = C.soft }: { x: number; y: number; angle: number; size?: number; fill?: string }) {
    const a = (angle * Math.PI) / 180;
    const p = (da: number) => `${x - size * Math.cos(a + da)},${y - size * Math.sin(a + da)}`;
    return <polygon points={`${x},${y} ${p(0.45)} ${p(-0.45)}`} fill={fill} />;
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
            const d = Math.abs(dy * (points[i][0] - ax) - dx * (points[i][1] - ay)) / len;
            if (d > max) {
                max = d;
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
    let d = `M${x[0].toFixed(1)},${y[0].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) {
        const h = dx[i] / 3;
        d += `C${(x[i] + h).toFixed(1)},${(y[i] + t[i] * h).toFixed(1)} ${(x[i + 1] - h).toFixed(1)},${(y[i + 1] - t[i + 1] * h).toFixed(1)} ${x[i + 1].toFixed(1)},${y[i + 1].toFixed(1)}`;
    }
    return d;
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface LegendItem {
    label: string;
    dashed?: boolean;
    muted?: boolean;
    /** Line colour when it is neither the accent nor muted. */
    stroke?: string;
    /** Draw a filled swatch instead of a line. */
    swatch?: string;
}

/** Legend of line samples that wraps to the available width. */
export function legend(
    items: LegendItem[],
    x: number,
    y: number,
    maxWidth: number,
    column = false,
): { node: ReactNode; height: number } {
    if (items.length === 0) return { node: null, height: 0 };
    const rowH = column ? 22 : 18;
    let cx = x;
    let row = 0;
    const placed = items.map((item, i) => {
        const w = 24 + textWidth(item.label) + 16;
        if (column ? i > 0 : cx + w - 16 > x + maxWidth && cx > x) {
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
                        <rect x={lx} y={ly - 10} width={16} height={10} rx={2} fill={item.swatch} />
                    ) : (
                        <line
                            x1={lx}
                            x2={lx + 18}
                            y1={ly - 4}
                            y2={ly - 4}
                            stroke={item.stroke ?? (item.muted ? C.faint : C.accent)}
                            strokeWidth={1.8}
                            strokeDasharray={item.dashed ? DASH : undefined}
                        />
                    )}
                    <Label x={lx + 24} y={ly} fill={C.text}>
                        {item.label}
                    </Label>
                </g>
            ))}
        </g>
    );
    return { node, height: (row + 1) * rowH };
}
