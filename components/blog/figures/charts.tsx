import type { ArrangementFigure, BarsFigure, CurveFigure, ScaleFigure } from '@/lib/blog/types';
import {
    Arrowhead,
    Axis,
    Bar,
    Barline,
    C,
    ClosingRule,
    Corners,
    FS,
    Label,
    Point,
    RefLine,
    Rule,
    Svg,
    Title,
    Track,
    accentFill,
    clamp,
    cornerOf,
    dialectOf,
    draw,
    legend,
    linePath,
    smoothPath,
    textWidth,
    type DialectProp,
} from './svg';

// ── Curve: a qualitative shape over named points (energy, tension) ──

export function Curve({ spec, w, dialect }: { spec: CurveFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const labels = narrow && spec.xShort ? spec.xShort : spec.x;
    const named = spec.series.filter((s) => s.label).map((s) => ({ label: s.label!, dashed: s.dashed, stroke: s.dashed ? C.soft : undefined }));
    const leg = legend(named, 0, 14, w, d);
    const top = leg.height + 30;
    const h = top + (narrow ? 150 : 180) + 34 + (spec.xLabel ? 18 : 0);
    const left = 4;
    const right = w - 4;
    const bottom = h - 34 - (spec.xLabel ? 18 : 0);
    const n = spec.x.length;
    const xAt = (i: number) => left + (i * (right - left)) / Math.max(1, n - 1);
    const yAt = (v: number) => bottom - clamp(v, 0, 1) * (bottom - top);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {leg.node}
            <Title dialect={d} x={0} y={top - 12}>
                {spec.yLabel} ↑
            </Title>
            {/* The grid. These are shapes, not measurements, so no dialect adds a value scale. Technical and mind
                rule each point; music draws them as bar lines, a section to a bar; the ledger rules rows instead. */}
            {d.name === 'business'
                ? [0, 1, 2, 3].map((k) => <Rule key={`r${k}`} d={d} x1={0} x2={w} y1={top + (k * (bottom - top)) / 4} y2={top + (k * (bottom - top)) / 4} />)
                : spec.x.map((_, i) => <Rule key={i} d={d} x1={xAt(i)} x2={xAt(i)} y1={top} y2={bottom} major={d.name !== 'mind'} opacity={d.name === 'music' ? 0.14 : undefined} />)}
            <Corners d={d} x={0} y={top} w={w} h={bottom - top} />
            <Axis x1={0} x2={w} y1={bottom} y2={bottom} />
            {spec.marks?.map((mark) => {
                const x = xAt(mark.at);
                const flip = x > w - textWidth(mark.label) - 12;
                return (
                    <g key={mark.label}>
                        {d.name === 'music' ? (
                            // A section change in a score is a double bar.
                            <Barline x={x} y1={top} y2={bottom} kind="double" opacity={0.45} />
                        ) : (
                            <RefLine d={d} x1={x} x2={x} y1={top} y2={bottom} />
                        )}
                        <Label x={flip ? x - 7 : x + 7} y={top + 12} anchor={flip ? 'end' : 'start'} fill={C.ink}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            {spec.series.map((s, si) => {
                const pts = s.values.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
                const path = spec.straight ? linePath(pts) : smoothPath(pts);
                const focus = si === 0 && !s.dashed;
                return (
                    <g key={si}>
                        {focus && d.fillUnder ? (
                            <path d={`${path}L${pts[pts.length - 1][0]},${bottom}L${pts[0][0]},${bottom}Z`} {...accentFill()} {...draw('fade', 200)} />
                        ) : null}
                        {s.dashed ? (
                            <path d={path} fill="none" stroke={C.soft} strokeWidth={1.6} strokeDasharray={d.refDash} strokeLinecap={d.cap} />
                        ) : (
                            <path
                                d={path}
                                fill="none"
                                stroke={C.accent}
                                strokeWidth={d.line}
                                strokeLinecap={d.cap}
                                strokeLinejoin={d.join}
                                {...draw('line', 120 + si * 120)}
                            />
                        )}
                        {focus
                            ? pts.map(([x, y], i) => (
                                  <Point key={i} d={d} x={x} y={y} r={d.marker === 'head' ? 3.1 : 2.6} delay={160 + (420 * i) / Math.max(1, n - 1)} />
                              ))
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
                <Title dialect={d} x={w - 4} y={bottom + 40} anchor="end" fill={C.soft}>
                    {spec.xLabel} →
                </Title>
            ) : null}
        </Svg>
    );
}

// ── Bars: horizontal bars on a shared scale ──

/** Bar thickness by dialect: a meter, a held note, a soft bar, a ledger line. The value is always the bar's right edge. */
const BAR_H = { technical: 14, music: 10, mind: 6, business: 10 } as const;

export function Bars({ spec, w, dialect }: { spec: BarsFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const ledger = d.name === 'business';
    const fmt = (v: number) => `${v}${spec.unit ? ` ${spec.unit}` : ''}`;
    const shown = (bar: BarsFigure['bars'][number]) => bar.display ?? fmt(bar.value);
    const labelCol = narrow ? 0 : Math.min(200, Math.max(...spec.bars.map((b) => textWidth(b.label))) + 16);
    // A ledger prints its figures in their own right-aligned column; elsewhere a value sits after its bar.
    // On a phone the column shares the label's line, so a label too long to share it sends every value back after its bar.
    const column = ledger && !(narrow && spec.bars.some((b) => textWidth(b.label) + textWidth(shown(b)) + 16 > w));
    const valueCol = column ? (narrow ? 0 : Math.max(64, Math.max(...spec.bars.map((b) => textWidth(shown(b)))) + 20)) : 64;
    const x0 = labelCol;
    const x1 = w - valueCol;
    const xAt = (v: number) => x0 + ((clamp(v, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * (x1 - x0);
    const rowH = narrow ? 46 : 34;
    const top = spec.reference ? 26 : ledger ? 8 : 4;
    const h = top + spec.bars.length * rowH + (narrow ? 0 : 6) + (ledger ? 8 : 0);
    const base = xAt(spec.min);
    const bh = BAR_H[d.name];
    // Mind holds each value in a focus ring at the bar's end, so its value label steps past the ring.
    const ring = d.marker === 'ring';
    const after = ring ? 7 : 0;

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {ledger ? <line x1={0} x2={w} y1={top - 4} y2={top - 4} stroke={C.faint} /> : null}
            {spec.bars.map((bar, i) => {
                const y = top + i * rowH;
                const slotY = narrow ? y + 22 : y + 9;
                const barY = slotY + (14 - bh) / 2;
                const end = xAt(bar.value);
                // Accent bars grow in a light stagger; their values fade in as each bar lands. Dim bars are context and stay put.
                const delay = 120 + (240 * i) / Math.max(1, spec.bars.length - 1);
                const value = bar.dim ? {} : draw('fade', delay + 380);
                const text = shown(bar);
                return (
                    <g key={bar.label}>
                        <Label x={0} y={narrow ? y + 14 : slotY + 11} fill={C.text}>
                            {bar.label}
                        </Label>
                        <Track d={d} x={x0} y={slotY} w={x1 - x0} h={14} />
                        <Bar d={d} x={base} y={barY} w={Math.max(2, end - base)} h={bh} tone={bar.dim ? 'dim' : 'accent'} delay={delay} />
                        {ring ? <Point d={d} x={end} y={slotY + 7} r={3} tone={bar.dim ? 'muted' : 'accent'} delay={bar.dim ? undefined : delay + 420} /> : null}
                        {column ? (
                            <Label x={w} y={narrow ? y + 14 : slotY + 11} anchor="end" fill={bar.dim ? C.soft : C.ink} {...value}>
                                {text}
                            </Label>
                        ) : (
                            <g {...value}>
                                <rect x={end + 4 + after} y={slotY - 1} width={textWidth(text) + 8} height={16} rx={2} fill={C.surface} />
                                <Label x={end + 8 + after} y={slotY + 11} fill={bar.dim ? C.soft : C.ink}>
                                    {text}
                                </Label>
                            </g>
                        )}
                        {ledger ? <line x1={0} x2={w} y1={y + rowH - (narrow ? 2 : 1)} y2={y + rowH - (narrow ? 2 : 1)} stroke={C.grid} /> : null}
                    </g>
                );
            })}
            {spec.reference ? (
                <g>
                    {narrow ? (
                        spec.bars.map((_, i) => (
                            <RefLine
                                key={i}
                                d={d}
                                x1={xAt(spec.reference!.value)}
                                x2={xAt(spec.reference!.value)}
                                y1={top + i * rowH + 18}
                                y2={top + i * rowH + 40}
                                stroke={C.ink}
                            />
                        ))
                    ) : (
                        <RefLine d={d} x1={xAt(spec.reference.value)} x2={xAt(spec.reference.value)} y1={18} y2={h - (ledger ? 10 : 0)} stroke={C.ink} />
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
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}

// ── Scale: markers and ranges along one number line ──

export function Scale({ spec, w, dialect }: { spec: ScaleFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
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
    const h = rangeTop + (spec.ranges?.length ?? 0) * 26 + 2 + (d.name === 'business' ? 6 : 0);
    const tickLabel = (t: number) => (spec.unit && t === ticks[ticks.length - 1] ? `${t} ${spec.unit}` : `${t}`);
    // An instrument scale is graduated: unlabelled minor ticks between the numbered ones, when the step divides evenly.
    const minor = d.name === 'technical' && !spec.ticks ? minorTicks(ticks, spec.min, spec.max) : [];

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            <Axis x1={pad} x2={w - pad} y1={axisY} y2={axisY} width={1.5} />
            {minor.map((t) => (
                <line key={`m${t}`} x1={xAt(t)} x2={xAt(t)} y1={axisY - 2.5} y2={axisY + 2.5} stroke={C.faint} />
            ))}
            {ticks.map((t) => (
                <g key={t}>
                    {d.name === 'mind' ? (
                        <circle cx={xAt(t)} cy={axisY} r={1.8} fill={C.soft} />
                    ) : d.name === 'music' ? (
                        <line x1={xAt(t)} x2={xAt(t)} y1={axisY - 6} y2={axisY + 6} stroke={C.faint} />
                    ) : d.name === 'business' ? (
                        <line x1={xAt(t)} x2={xAt(t)} y1={axisY} y2={axisY + 6} stroke={C.soft} />
                    ) : (
                        <line x1={xAt(t)} x2={xAt(t)} y1={axisY - 4} y2={axisY + 4} stroke={C.soft} />
                    )}
                    <Label x={xAt(t)} y={axisY + 20} anchor={xAt(t) < 20 ? 'start' : xAt(t) > w - 40 ? 'end' : 'middle'}>
                        {tickLabel(t)}
                    </Label>
                </g>
            ))}
            {placed.map(({ marker, x, anchor, lane }) => {
                const ly = axisY - 12 - lane * laneH;
                return (
                    <g key={`${marker.label}-${marker.value}`}>
                        {lane > 0 ? <line x1={x} x2={x} y1={ly + 4} y2={axisY - 7} stroke={C.grid} /> : null}
                        {marker.strong ? (
                            <Point d={d} x={x} y={axisY} r={4.5} delay={160 + (300 * x) / w} />
                        ) : (
                            <Point d={d} x={x} y={axisY} r={3.5} tone="muted" />
                        )}
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
                const path = `M${x1},${y} C${x1},${y + depth} ${x2},${y + depth} ${x2},${y + 6}`;
                return (
                    <g key={i}>
                        <path d={path} fill="none" stroke={C.soft} strokeWidth={1.5} strokeLinecap={d.cap} />
                        <Arrowhead d={d} x={x2} y={y + 1} angle={-90} />
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
                        <rect x={a} y={y} width={Math.max(2, b - a)} height={16} rx={cornerOf(d, 16, b - a)} fill={C.fillStrong} />
                        <Label x={inside ? a + 6 : after ? b + 6 : a - 6} y={y + 12} anchor={inside || after ? 'start' : 'end'} fill={C.text}>
                            {range.label}
                        </Label>
                    </g>
                );
            })}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
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

/** Unlabelled ticks between evenly spaced labelled ones: fifths of a step of 1, 5 or 10, halves of 2 or 2.5. */
function minorTicks(ticks: number[], min: number, max: number): number[] {
    if (ticks.length < 2) return [];
    const step = ticks[1] - ticks[0];
    const mag = 10 ** Math.floor(Math.log10(step));
    const lead = Number((step / mag).toFixed(6));
    const parts = lead === 1 || lead === 5 || lead === 10 ? 5 : lead === 2 || lead === 2.5 ? 2 : 0;
    if (!parts) return [];
    const sub = step / parts;
    const out: number[] = [];
    for (let t = Math.ceil(min / sub) * sub; t <= max + 1e-9; t += sub) {
        const v = Number(t.toFixed(6));
        if (!ticks.some((k) => Math.abs(k - v) < sub / 10)) out.push(v);
    }
    return out;
}

// ── Arrangement: which layers play in which section ──

export function Arrangement({ spec, w, dialect }: { spec: ArrangementFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const labelCol = narrow ? 62 : 96;
    const size = narrow ? 11 : FS;
    const rowH = narrow ? 20 : 22;
    const densityH = spec.density ? 40 : 0;
    const headY = densityH + 16;
    const gridTop = headY + 10;
    const gridBottom = gridTop + spec.layers.length * (rowH + 4);
    const h = gridBottom + 2 + (d.name === 'business' ? 6 : 0);
    const totalBars = spec.sections.reduce((sum, s) => sum + (s.bars ?? 8), 0);
    const music = d.name === 'music';
    // The score closes on a final bar line, so its grid stops short of the edge to leave room for it.
    const gridRight = music ? w - 6 : w;
    const avail = gridRight - labelCol;
    const cols: { x: number; width: number; label: string }[] = [];
    for (let i = 0, acc = 0; i < spec.sections.length; i++) {
        const s = spec.sections[i];
        cols.push({ x: labelCol + (acc / totalBars) * avail, width: ((s.bars ?? 8) / totalBars) * avail, label: narrow && s.short ? s.short : s.label });
        acc += s.bars ?? 8;
    }
    const density = spec.sections.map((_, i) => spec.layers.reduce((sum, layer) => sum + (layer.levels[i] ?? 0), 0));
    const maxDensity = Math.max(1, ...density);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {spec.density ? (
                <g>
                    <Label x={0} y={densityH - 6} size={size} fill={C.text}>
                        Density
                    </Label>
                    {cols.map((col, i) => {
                        const bh = (density[i] / maxDensity) * (densityH - 10);
                        return <rect key={i} x={col.x + 3} y={densityH - bh} width={col.width - 6} height={bh} rx={cornerOf(d, Math.min(bh, 6), col.width - 6)} fill={C.fillStrong} />;
                    })}
                </g>
            ) : null}
            {cols.map((col, i) => (
                <Label key={i} x={col.x + col.width / 2} y={headY} anchor="middle" size={size} fill={C.text}>
                    {col.label}
                </Label>
            ))}
            {d.name === 'business' ? <line x1={0} x2={w} y1={gridTop - 4} y2={gridTop - 4} stroke={C.faint} /> : null}
            {spec.layers.map((layer, li) => {
                const y = gridTop + li * (rowH + 4);
                return (
                    <g key={layer.label}>
                        <Label x={0} y={y + rowH * 0.7} size={size} fill={C.text}>
                            {layer.label}
                        </Label>
                        {d.name === 'technical' ? <rect x={labelCol} y={y} width={avail} height={rowH} rx={cornerOf(d, rowH)} fill={C.lane} /> : null}
                        {music || d.name === 'mind' ? <Rule d={d} x1={labelCol} x2={gridRight} y1={y + rowH / 2} y2={y + rowH / 2} major={music} /> : null}
                        {d.name === 'business' ? <line x1={0} x2={w} y1={y + rowH + 2} y2={y + rowH + 2} stroke={C.grid} /> : null}
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
                                    rx={cornerOf(d, rowH - 4, col.width - 4)}
                                    {...accentFill(0.14 + 0.76 * clamp(level, 0, 1))}
                                    {...draw('fade', 120 + (360 * ci) / Math.max(1, cols.length - 1))}
                                />
                            );
                        })}
                    </g>
                );
            })}
            {music ? (
                // Sections are bars of a score: a bar line between them, a final bar at the end.
                <g>
                    {cols.slice(1).map((col, i) => (
                        <Barline key={i} x={col.x} y1={gridTop - 4} y2={gridBottom} opacity={0.22} />
                    ))}
                    <Barline x={w} y1={gridTop - 4} y2={gridBottom} kind="final" opacity={0.4} />
                </g>
            ) : (
                cols.slice(1).map((col, i) => <Rule key={i} d={d} x1={col.x} x2={col.x} y1={gridTop - 4} y2={gridBottom} major />)
            )}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}
