import type { ArrangementFigure, BarsFigure, CurveFigure, ScaleFigure } from '@/lib/blog/types';
import { Arrowhead, C, DASH, FS, Label, Svg, accentAlpha, clamp, legend, linePath, smoothPath, textWidth } from './svg';

// ── Curve: a qualitative shape over named points (energy, tension) ──

export function Curve({ spec, w }: { spec: CurveFigure; w: number }) {
    const narrow = w < 480;
    const labels = narrow && spec.xShort ? spec.xShort : spec.x;
    const named = spec.series.filter((s) => s.label).map((s) => ({ label: s.label!, dashed: s.dashed, stroke: s.dashed ? C.soft : undefined }));
    const leg = legend(named, 0, 14, w);
    const top = leg.height + 30;
    const h = top + (narrow ? 150 : 180) + 34 + (spec.xLabel ? 18 : 0);
    const left = 4;
    const right = w - 4;
    const bottom = h - 34 - (spec.xLabel ? 18 : 0);
    const n = spec.x.length;
    const xAt = (i: number) => left + (i * (right - left)) / Math.max(1, n - 1);
    const yAt = (v: number) => bottom - clamp(v, 0, 1) * (bottom - top);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {leg.node}
            <Label x={0} y={top - 12} fill={C.text}>
                {spec.yLabel} ↑
            </Label>
            {spec.x.map((_, i) => (
                <line key={i} x1={xAt(i)} x2={xAt(i)} y1={top} y2={bottom} stroke={C.grid} />
            ))}
            <line x1={0} x2={w} y1={bottom} y2={bottom} stroke={C.faint} />
            {spec.marks?.map((mark) => {
                const x = xAt(mark.at);
                const flip = x > w - textWidth(mark.label) - 12;
                return (
                    <g key={mark.label}>
                        <line x1={x} x2={x} y1={top} y2={bottom} stroke={C.soft} strokeDasharray={DASH} />
                        <Label x={flip ? x - 6 : x + 6} y={top + 12} anchor={flip ? 'end' : 'start'} fill={C.ink}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            {spec.series.map((s, si) => {
                const pts = s.values.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
                const d = spec.straight ? linePath(pts) : smoothPath(pts);
                return (
                    <g key={si}>
                        {si === 0 && !s.dashed ? (
                            <path d={`${d}L${pts[pts.length - 1][0]},${bottom}L${pts[0][0]},${bottom}Z`} fill={C.accentFill} />
                        ) : null}
                        <path
                            d={d}
                            fill="none"
                            stroke={s.dashed ? C.soft : C.accent}
                            strokeWidth={s.dashed ? 1.6 : 2}
                            strokeDasharray={s.dashed ? DASH : undefined}
                        />
                        {si === 0 && !s.dashed
                            ? pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill={C.accent} />)
                            : null}
                    </g>
                );
            })}
            {labels.map((label, i) => (
                <Label key={i} x={xAt(i)} y={bottom + 20} anchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fill={C.text}>
                    {label}
                </Label>
            ))}
            {spec.xLabel ? (
                <Label x={w - 4} y={bottom + 40} anchor="end">
                    {spec.xLabel} →
                </Label>
            ) : null}
        </Svg>
    );
}

// ── Bars: horizontal bars on a shared scale ──

export function Bars({ spec, w }: { spec: BarsFigure; w: number }) {
    const narrow = w < 480;
    const labelCol = narrow ? 0 : Math.min(200, Math.max(...spec.bars.map((b) => textWidth(b.label))) + 16);
    const valueCol = 64;
    const x0 = labelCol;
    const x1 = w - valueCol;
    const xAt = (v: number) => x0 + ((clamp(v, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * (x1 - x0);
    const rowH = narrow ? 46 : 34;
    const top = spec.reference ? 26 : 4;
    const h = top + spec.bars.length * rowH + (narrow ? 0 : 6);
    const fmt = (v: number) => `${v}${spec.unit ? ` ${spec.unit}` : ''}`;
    const base = xAt(spec.min);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {spec.bars.map((bar, i) => {
                const y = top + i * rowH;
                const barY = narrow ? y + 22 : y + 9;
                const end = xAt(bar.value);
                return (
                    <g key={bar.label}>
                        {narrow ? (
                            <Label x={0} y={y + 14} fill={C.text}>
                                {bar.label}
                            </Label>
                        ) : (
                            <Label x={0} y={barY + 11} fill={C.text}>
                                {bar.label}
                            </Label>
                        )}
                        <rect x={x0} y={barY} width={x1 - x0} height={14} rx={2} fill={C.lane} />
                        <rect x={base} y={barY} width={Math.max(2, end - base)} height={14} rx={2} fill={bar.dim ? C.fillStrong : C.accent} />
                        <rect x={end + 4} y={barY - 1} width={textWidth(bar.display ?? fmt(bar.value)) + 8} height={16} rx={2} fill="#0a0e12" />
                        <Label x={end + 8} y={barY + 11} fill={bar.dim ? C.soft : C.ink}>
                            {bar.display ?? fmt(bar.value)}
                        </Label>
                    </g>
                );
            })}
            {spec.reference ? (
                <g>
                    {narrow ? (
                        spec.bars.map((_, i) => (
                            <line
                                key={i}
                                x1={xAt(spec.reference!.value)}
                                x2={xAt(spec.reference!.value)}
                                y1={top + i * rowH + 18}
                                y2={top + i * rowH + 40}
                                stroke={C.ink}
                                strokeDasharray="3 3"
                            />
                        ))
                    ) : (
                        <line
                            x1={xAt(spec.reference.value)}
                            x2={xAt(spec.reference.value)}
                            y1={18}
                            y2={h}
                            stroke={C.ink}
                            strokeDasharray={DASH}
                        />
                    )}
                    <Label
                        x={xAt(spec.reference.value)}
                        y={12}
                        anchor={xAt(spec.reference.value) > w * 0.7 ? 'end' : xAt(spec.reference.value) < w * 0.3 ? 'start' : 'middle'}
                        fill={C.ink}
                    >
                        {spec.reference.label}
                    </Label>
                </g>
            ) : null}
        </Svg>
    );
}

// ── Scale: markers and ranges along one number line ──

export function Scale({ spec, w }: { spec: ScaleFigure; w: number }) {
    const pad = 8;
    const xAt = (v: number) => pad + ((v - spec.min) / (spec.max - spec.min)) * (w - pad * 2);
    // Labels sit in lanes above the line; a label moves up a lane only when it would overlap.
    const lanes: number[] = [];
    const placed = [...spec.markers]
        .sort((a, b) => a.value - b.value)
        .map((marker) => {
            const x = xAt(marker.value);
            const width = textWidth(marker.label) + 12;
            const anchor: 'start' | 'middle' | 'end' = x - width / 2 < 0 ? 'start' : x + width / 2 > w ? 'end' : 'middle';
            const startX = anchor === 'start' ? x - 4 : anchor === 'end' ? x - width + 4 : x - width / 2;
            let lane = lanes.findIndex((end) => end < startX);
            if (lane === -1) {
                lanes.push(0);
                lane = lanes.length - 1;
            }
            lanes[lane] = startX + width;
            return { marker, x, anchor, lane };
        });
    const laneH = 18;
    const axisY = 10 + lanes.length * laneH + 14;
    const ticks = spec.ticks ?? niceTicks(spec.min, spec.max, w < 480 ? 4 : 7);
    const arrows = spec.arrows ?? [];
    const span = (a: number, b: number) => Math.abs(xAt(a) - xAt(b));
    const arcDepth = (a: number, b: number) => Math.min(54, 16 + span(a, b) * 0.18);
    const arcTop = axisY + 30;
    const arcsH = arrows.length ? Math.max(...arrows.map((a) => arcDepth(a.from, a.to))) * 0.75 + 8 : 0;
    const rangeTop = arcTop + arcsH + 4;
    const h = rangeTop + (spec.ranges?.length ?? 0) * 26 + 2;
    const tickLabel = (t: number) => (spec.unit && t === ticks[ticks.length - 1] ? `${t} ${spec.unit}` : `${t}`);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            <line x1={pad} x2={w - pad} y1={axisY} y2={axisY} stroke={C.faint} strokeWidth={1.5} />
            {ticks.map((t) => (
                <g key={t}>
                    <line x1={xAt(t)} x2={xAt(t)} y1={axisY - 4} y2={axisY + 4} stroke={C.faint} />
                    <Label x={xAt(t)} y={axisY + 20} anchor={xAt(t) < 20 ? 'start' : xAt(t) > w - 40 ? 'end' : 'middle'}>
                        {tickLabel(t)}
                    </Label>
                </g>
            ))}
            {placed.map(({ marker, x, anchor, lane }) => {
                const ly = axisY - 12 - lane * laneH;
                return (
                    <g key={`${marker.label}-${marker.value}`}>
                        {lane > 0 ? <line x1={x} x2={x} y1={ly + 4} y2={axisY - 5} stroke={C.grid} /> : null}
                        <circle cx={x} cy={axisY} r={marker.strong ? 4.5 : 3.5} fill={marker.strong ? C.accent : C.strong} />
                        <Label x={x} y={ly} anchor={anchor} fill={marker.strong ? C.ink : C.text} weight={marker.strong ? 600 : undefined}>
                            {marker.label}
                        </Label>
                    </g>
                );
            })}
            {arrows.map((arrow, i) => {
                const x1 = xAt(arrow.from);
                const x2 = xAt(arrow.to);
                const depth = arcDepth(arrow.from, arrow.to);
                const y = arcTop;
                const d = `M${x1},${y} C${x1},${y + depth} ${x2},${y + depth} ${x2},${y + 6}`;
                return (
                    <g key={i}>
                        <path d={d} fill="none" stroke={C.soft} strokeWidth={1.5} />
                        <Arrowhead x={x2} y={y + 1} angle={-90} />
                    </g>
                );
            })}
            {spec.ranges?.map((range, i) => {
                const y = rangeTop + i * 26;
                const a = xAt(range.from);
                const b = xAt(range.to);
                const inside = textWidth(range.label) + 12 < b - a;
                const after = b + 6 + textWidth(range.label) < w;
                return (
                    <g key={range.label}>
                        <rect x={a} y={y} width={Math.max(2, b - a)} height={16} rx={2} fill={C.fillStrong} />
                        <Label x={inside ? a + 6 : after ? b + 6 : a - 6} y={y + 12} anchor={inside || after ? 'start' : 'end'} fill={C.text}>
                            {range.label}
                        </Label>
                    </g>
                );
            })}
        </Svg>
    );
}

function niceTicks(min: number, max: number, count: number): number[] {
    const span = max - min;
    const raw = span / count;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
    const ticks: number[] = [];
    for (let t = Math.ceil(min / step) * step; t <= max + 1e-9; t += step) ticks.push(Number(t.toFixed(6)));
    return ticks;
}

// ── Arrangement: which layers play in which section ──

export function Arrangement({ spec, w }: { spec: ArrangementFigure; w: number }) {
    const narrow = w < 480;
    const labelCol = narrow ? 62 : 96;
    const size = narrow ? 11 : FS;
    const rowH = narrow ? 20 : 22;
    const densityH = spec.density ? 40 : 0;
    const headY = densityH + 16;
    const gridTop = headY + 10;
    const h = gridTop + spec.layers.length * (rowH + 4) + 2;
    const totalBars = spec.sections.reduce((sum, s) => sum + (s.bars ?? 8), 0);
    const avail = w - labelCol;
    const cols: { x: number; width: number; label: string }[] = [];
    for (let i = 0, acc = 0; i < spec.sections.length; i++) {
        const s = spec.sections[i];
        cols.push({ x: labelCol + (acc / totalBars) * avail, width: ((s.bars ?? 8) / totalBars) * avail, label: narrow && s.short ? s.short : s.label });
        acc += s.bars ?? 8;
    }
    const density = spec.sections.map((_, i) => spec.layers.reduce((sum, layer) => sum + (layer.levels[i] ?? 0), 0));
    const maxDensity = Math.max(1, ...density);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {spec.density ? (
                <g>
                    <Label x={0} y={densityH - 6} size={size} fill={C.text}>
                        Density
                    </Label>
                    {cols.map((col, i) => {
                        const bh = (density[i] / maxDensity) * (densityH - 10);
                        return <rect key={i} x={col.x + 3} y={densityH - bh} width={col.width - 6} height={bh} rx={2} fill={C.fillStrong} />;
                    })}
                </g>
            ) : null}
            {cols.map((col, i) => (
                <Label key={i} x={col.x + col.width / 2} y={headY} anchor="middle" size={size} fill={C.text}>
                    {col.label}
                </Label>
            ))}
            {spec.layers.map((layer, li) => {
                const y = gridTop + li * (rowH + 4);
                return (
                    <g key={layer.label}>
                        <Label x={0} y={y + rowH * 0.7} size={size} fill={C.text}>
                            {layer.label}
                        </Label>
                        <rect x={labelCol} y={y} width={avail} height={rowH} rx={2} fill={C.lane} />
                        {cols.map((col, ci) => {
                            const level = layer.levels[ci] ?? 0;
                            if (level <= 0) return null;
                            return (
                                <rect
                                    key={ci}
                                    x={col.x + 2}
                                    y={y + 2}
                                    width={col.width - 4}
                                    height={rowH - 4}
                                    rx={2}
                                    fill={accentAlpha(0.14 + 0.76 * clamp(level, 0, 1))}
                                />
                            );
                        })}
                    </g>
                );
            })}
            {cols.slice(1).map((col, i) => (
                <line key={i} x1={col.x} x2={col.x} y1={gridTop - 4} y2={h} stroke={C.grid} />
            ))}
        </Svg>
    );
}

