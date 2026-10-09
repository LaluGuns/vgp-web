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
    areaFill,
    clamp,
    cornerOf,
    dialectOf,
    dots,
    draw,
    legend,
    linePath,
    smoothPath,
    placeInRows,
    solid,
    textWidth,
    type Anchor,
    type DialectProp,
} from './svg';

// ── Curve: a qualitative shape over named points (energy, tension) ──

export function Curve({ spec, w, dialect }: { spec: CurveFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const labels = narrow && spec.xShort ? spec.xShort : spec.x;
    const named = spec.series.filter((s) => s.label).map((s) => ({ label: s.label!, dashed: s.dashed, dotted: s.dotted && !s.dashed, stroke: s.dashed ? C.soft : undefined }));
    const leg = legend(named, 0, 14, w, d);
    // A note head or a focus ring is wider than a square, so the first and last points sit further in.
    const inset = d.marker === 'head' || d.marker === 'ring' ? 8 : 4;
    const left = inset;
    const right = w - inset;
    const n = spec.x.length;
    const xAt = (i: number) => left + (i * (right - left)) / Math.max(1, n - 1);
    // Mark labels sit above the plot, never over the curve: on the axis title's line when they clear it,
    // else a row higher, each beside its mark's line, which runs up to it.
    const marks = spec.marks ?? [];
    const titleW = textWidth(`${spec.yLabel} ↑`) + (d.italic ? 2 : 0);
    const markLabels = placeInRows(
        marks.map((mark) => ({ x: xAt(mark.at), width: textWidth(mark.label), prefer: ['start', 'end'] as Anchor[] })),
        0,
        w,
        { offset: 7, taken: [[0, titleW]] },
    );
    const markRows = marks.length ? Math.max(...markLabels.map((p) => p.row)) + 1 : 1;
    const top = leg.height + 30 + (markRows - 1) * 15;
    const xAnchor = (i: number): Anchor => (i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle');
    // Point names that would nearly touch take turns on two rows.
    const spans = labels.map((label, i) => {
        const tw = textWidth(label);
        const from = xAnchor(i) === 'start' ? xAt(i) : xAnchor(i) === 'end' ? xAt(i) - tw : xAt(i) - tw / 2;
        return [from, from + tw];
    });
    const stagger = spans.some((sp, i) => i > 0 && sp[0] - spans[i - 1][1] < 8);
    const below = 34 + (stagger ? 15 : 0) + (spec.xLabel ? 18 : 0);
    const h = top + (narrow ? 150 : 180) + below;
    const bottom = h - below;
    const yAt = (v: number) => bottom - clamp(v, 0, 1) * (bottom - top);
    const music = d.name === 'music';

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {leg.node}
            {/* Italic leans out past its start, so it starts a hair in. */}
            <Title dialect={d} x={d.italic ? 2 : 0} y={top - 12}>
                {spec.yLabel} ↑
            </Title>
            {/* The grid. These are shapes, not measurements, so no dialect adds a value scale. Technical and mind
                rule each point; music draws them as bar lines, a section to a bar, on three faint staff rulings;
                the ledger rules rows instead. */}
            {d.name === 'business'
                ? [0, 1, 2, 3].map((k) => <Rule key={`r${k}`} d={d} x1={0} x2={w} y1={top + (k * (bottom - top)) / 4} y2={top + (k * (bottom - top)) / 4} />)
                : spec.x.map((_, i) => <Rule key={i} d={d} x1={xAt(i)} x2={xAt(i)} y1={top} y2={bottom} major={d.name !== 'mind'} opacity={music ? 0.12 : undefined} />)}
            {music
                ? [1, 2, 3].map((k) => <Rule key={`s${k}`} d={d} x1={0} x2={w} y1={top + (k * (bottom - top)) / 4} y2={top + (k * (bottom - top)) / 4} opacity={0.075} />)
                : null}
            <Corners d={d} x={0} y={top} w={w} h={bottom - top} />
            <Axis x1={0} x2={w} y1={bottom} y2={bottom} />
            {marks.map((mark, mi) => {
                const x = xAt(mark.at);
                const place = markLabels[mi];
                const ly = top - 12 - place.row * 15;
                // The mark's line runs up beside its label, so the two read as one.
                const y1 = ly - 4;
                return (
                    <g key={`${mi}-${mark.label}`}>
                        {music ? (
                            // A section change in a score is a double bar.
                            <Barline x={x} y1={y1} y2={bottom} kind="double" opacity={0.45} />
                        ) : (
                            <RefLine d={d} x1={x} x2={x} y1={y1} y2={bottom} />
                        )}
                        <Label x={place.tx} y={ly} anchor={place.anchor} fill={C.ink}>
                            {mark.label}
                        </Label>
                    </g>
                );
            })}
            {spec.series.map((s, si) => {
                const pts = s.values.map((v, i) => [xAt(i), yAt(v)] as [number, number]);
                const path = spec.straight ? linePath(pts) : smoothPath(pts);
                const focus = si === 0 && !s.dashed && !s.dotted;
                const lineDelay = 120 + si * 120;
                return (
                    <g key={si}>
                        {focus && d.fillUnder ? (
                            // The area follows its line: it fades in once the line has drawn, never ahead of it.
                            <path d={`${path}L${pts[pts.length - 1][0]},${bottom}L${pts[0][0]},${bottom}Z`} {...areaFill(d)} {...draw('fade', lineDelay + 760)} />
                        ) : null}
                        {s.dashed ? (
                            <path d={path} fill="none" stroke={C.soft} strokeWidth={1.6} strokeDasharray={d.refDash} strokeLinecap={d.cap} />
                        ) : s.dotted ? (
                            // A second line the caption also names: accent dots, fading in with the line beside it.
                            <path d={path} fill="none" {...dots(d)} {...draw('fade', lineDelay)} />
                        ) : (
                            <path
                                d={path}
                                fill="none"
                                stroke={C.accent}
                                strokeWidth={d.line}
                                strokeLinecap={d.cap}
                                strokeLinejoin={d.join}
                                {...draw('line', lineDelay)}
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
                <Label key={i} x={xAt(i)} y={bottom + 20 + (stagger && i % 2 === 1 ? 15 : 0)} anchor={xAnchor(i)} fill={C.text}>
                    {label}
                </Label>
            ))}
            {spec.xLabel ? (
                <Title dialect={d} x={w - 4} y={bottom + 40 + (stagger ? 15 : 0)} anchor="end" fill={C.soft}>
                    {spec.xLabel} →
                </Title>
            ) : null}
        </Svg>
    );
}

// ── Bars: horizontal bars on a shared scale ──

/** Bar thickness by dialect: a meter, a held note, a soft bar, a ledger line. The value is always the bar's right edge. */
const BAR_H = { technical: 14, music: 10, mind: 6, business: 10 } as const;

/** A power of ten, short: 3 is 1k, 6 is 1M. */
const powerLabel = (k: number) => {
    const v = 10 ** k;
    return v >= 1e9 ? `${v / 1e9}B` : v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}k` : `${v}`;
};

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
    // Mind holds each value in a focus ring at the bar's end, so its value label steps past the ring,
    // and a bar at the bottom of the scale starts a ring's width in, so its ring stays inside the figure.
    const ring = d.marker === 'ring';
    const after = ring ? 7 : 0;
    const valueCol = column
        ? narrow
            ? 0
            : Math.max(64, Math.max(...spec.bars.map((b) => textWidth(shown(b)))) + 20)
        : Math.max(64, ...spec.bars.map((b) => textWidth(shown(b)) + 10 + after));
    const x0 = labelCol + (ring && narrow ? 7 : 0);
    const x1 = w - valueCol;
    const xAt = (v: number) => x0 + ((clamp(v, spec.min, spec.max) - spec.min) / (spec.max - spec.min)) * (x1 - x0);
    const rowH = narrow ? 46 : 34;
    const top = spec.reference ? 26 : ledger ? 8 : 4;
    const rowsBottom = top + spec.bars.length * rowH;
    // A log scale gets a tick at each power of ten under the rows, and says so.
    const powers = spec.log ? Array.from({ length: Math.floor(spec.max) - Math.ceil(spec.min) + 1 }, (_, i) => Math.ceil(spec.min) + i) : [];
    const scaleTitleBelow = spec.log && labelCol < textWidth('Log scale') + 12;
    const scaleH = spec.log ? (narrow ? 8 : 4) + 22 + (scaleTitleBelow ? 16 : 0) : 0;
    const h = rowsBottom + (narrow ? 0 : 6) + scaleH + (ledger ? 8 : 0);
    const base = xAt(spec.min);
    const bh = BAR_H[d.name];
    const lineTrack = d.name === 'music' || d.name === 'mind';
    // An open bar has no upper limit: it runs to the end of the scale.
    const endOf = (bar: BarsFigure['bars'][number]) => (bar.open ? x1 : xAt(bar.value));
    // Where a value starts when it follows its bar. One that would sit on the dashed reference line steps over
    // it, so the line never runs through a number.
    const valueX = (bar: BarsFigure['bars'][number]) => {
        const at = endOf(bar) + 8 + after;
        const tw = textWidth(shown(bar));
        const refX = spec.reference ? xAt(spec.reference.value) : -Infinity;
        return Math.abs(refX - (at + tw / 2)) < tw / 2 + 5 ? Math.max(at, refX + 7) : at;
    };

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {ledger ? <line x1={0} x2={w} y1={top - 4} y2={top - 4} stroke={C.faint} /> : null}
            {spec.log && !ledger
                ? // A power-of-ten rule stays under the bars: on a phone it runs only through each bar's slot, so it never
                  // crosses the label above it, and it stops short of a value written across it.
                  powers.flatMap((k) =>
                      spec.bars.map((bar, i) => {
                          const y = top + i * rowH;
                          const slotY = narrow ? y + 22 : y + 9;
                          const x = xAt(k);
                          const textX = valueX(bar);
                          if (!column && x > textX - 4 && x < textX + textWidth(shown(bar)) + 4) return null;
                          const last = i === spec.bars.length - 1;
                          return (
                              <Rule
                                  key={`g${k}-${i}`}
                                  d={d}
                                  x1={x}
                                  x2={x}
                                  y1={narrow ? slotY - 2 : y}
                                  y2={narrow ? slotY + (last ? 18 : 16) : y + rowH + (last ? 4 : 0)}
                              />
                          );
                      }),
                  )
                : null}
            {spec.bars.map((bar, i) => {
                const y = top + i * rowH;
                const slotY = narrow ? y + 22 : y + 9;
                const barY = slotY + (14 - bh) / 2;
                const end = endOf(bar);
                // Accent bars grow in a light stagger; their values fade in as each bar lands. Dim bars are context and stay put.
                const delay = 120 + (240 * i) / Math.max(1, spec.bars.length - 1);
                const value = bar.dim ? {} : draw('fade', delay + 380);
                const text = shown(bar);
                const textX = valueX(bar);
                // A staff line or dotted track runs on past the value, never through the bar or under its number.
                const trackFrom = column ? x0 : textX + textWidth(text) + 6;
                return (
                    <g key={bar.label}>
                        <Label x={0} y={narrow ? y + 14 : slotY + 11} fill={C.text}>
                            {bar.label}
                        </Label>
                        {lineTrack ? (
                            trackFrom < x1 - 4 ? <Track d={d} x={trackFrom} y={slotY} w={x1 - trackFrom} h={14} /> : null
                        ) : (
                            <Track d={d} x={x0} y={slotY} w={x1 - x0} h={14} />
                        )}
                        <Bar d={d} x={base} y={barY} w={Math.max(2, end - base)} h={bh} tone={bar.dim ? 'dim' : 'accent'} delay={delay} open={bar.open} />
                        {ring && !bar.open ? <Point d={d} x={end} y={slotY + 7} r={3} tone={bar.dim ? 'muted' : 'accent'} delay={bar.dim ? undefined : delay + 420} /> : null}
                        {column ? (
                            <Label x={w} y={narrow ? y + 14 : slotY + 11} anchor="end" fill={bar.dim ? C.soft : C.ink} {...value}>
                                {text}
                            </Label>
                        ) : (
                            <Label x={textX} y={slotY + 11} fill={bar.dim ? C.soft : C.ink} {...value}>
                                {text}
                            </Label>
                        )}
                        {ledger ? <line x1={0} x2={w} y1={y + rowH - (narrow ? 2 : 1)} y2={y + rowH - (narrow ? 2 : 1)} stroke={C.grid} /> : null}
                    </g>
                );
            })}
            {spec.log ? (
                <g>
                    {powers.map((k) => {
                        const x = xAt(k);
                        const ty = rowsBottom + (narrow ? 8 : 4);
                        return (
                            <g key={k}>
                                <line x1={x} x2={x} y1={ty} y2={ty + 5} stroke={C.soft} />
                                <Label x={x} y={ty + 18} anchor={k === powers[0] && x - textWidth(powerLabel(k)) / 2 < 0 ? 'start' : 'middle'}>
                                    {powerLabel(k)}
                                </Label>
                            </g>
                        );
                    })}
                    <Title dialect={d} x={scaleTitleBelow ? w : 0} y={rowsBottom + (narrow ? 8 : 4) + 18 + (scaleTitleBelow ? 16 : 0)} anchor={scaleTitleBelow ? 'end' : 'start'} fill={C.soft}>
                        Log scale
                    </Title>
                </g>
            ) : null}
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
                        <RefLine d={d} x1={xAt(spec.reference.value)} x2={xAt(spec.reference.value)} y1={18} y2={rowsBottom + (ledger ? 4 : 6)} stroke={C.ink} />
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

interface ScaleLabel {
    lane: number;
    anchor: Anchor;
    from: number;
    to: number;
    tx: number;
}

/**
 * Lanes for the labels above a number line. Every label sits over its own
 * dot (centred on it, or starting or ending at it near an edge); a label in
 * an upper lane hangs on a leader straight down to its dot. The search
 * keeps labels in the lowest lanes it can, under three rules: labels in a
 * lane never overlap, no dot sits under a label nearer the line than its
 * own (so a leader never crosses text, and a label never looks centred
 * over a dot that is not its own), and everything stays inside the figure.
 */
function placeScaleLabels(items: { x: number; width: number; strong?: boolean }[], w: number): ScaleLabel[] {
    const gap = 8;
    const n = items.length;
    const options = items.map((item) =>
        (['middle', 'start', 'end'] as Anchor[])
            .map((anchor) => {
                const tx = anchor === 'start' ? item.x - 2 : anchor === 'end' ? item.x + 2 : item.x;
                const from = anchor === 'start' ? tx : anchor === 'end' ? tx - item.width : tx - item.width / 2;
                return { anchor, tx, from, to: from + item.width };
            })
            .filter((o) => o.from >= 0 && o.to <= w),
    );
    const fits = (i: number, a: ScaleLabel, j: number, b: ScaleLabel) => {
        if (a.lane === b.lane) return a.to + gap <= b.from || b.to + gap <= a.from;
        const [lower, upperX] = a.lane < b.lane ? [a, items[j].x] : [b, items[i].x];
        return upperX < lower.from - 4 || upperX > lower.to + 4;
    };
    let best: ScaleLabel[] | null = null;
    let bestCost = Infinity;
    const chosen: ScaleLabel[] = [];
    // A handful of markers searches in microseconds; the cap only guards against a pathological spec.
    let visits = 0;
    const search = (i: number, cost: number, maxLane: number) => {
        if (cost >= bestCost || ++visits > 50000) return;
        if (i === n) {
            best = chosen.slice();
            bestCost = cost;
            return;
        }
        for (let lane = 0; lane <= maxLane; lane++) {
            for (const o of options[i]) {
                const label = { lane, ...o };
                if (!chosen.every((other, j) => fits(i, label, j, other))) continue;
                chosen.push(label);
                search(i + 1, cost + lane * 10 + (o.anchor === 'middle' ? 0 : 1) + (items[i].strong && lane ? 3 : 0), maxLane);
                chosen.pop();
            }
        }
    };
    for (let maxLane = 1; maxLane <= n && !best; maxLane++) search(0, 0, Math.min(maxLane, n - 1));
    return (
        best ??
        items.map((item, i) => ({ lane: i, anchor: 'middle' as Anchor, tx: clamp(item.x, item.width / 2, w - item.width / 2), from: 0, to: 0 }))
    );
}

export function Scale({ spec, w, dialect }: { spec: ScaleFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    // A focus ring or a note head at either end of the line stays inside the figure.
    const pad = d.marker === 'ring' ? 12 : d.marker === 'head' ? 10 : 8;
    const xAt = (v: number) => pad + ((v - spec.min) / (spec.max - spec.min)) * (w - pad * 2);
    const sorted = [...spec.markers].sort((a, b) => a.value - b.value);
    const placed = placeScaleLabels(
        sorted.map((marker) => ({ x: xAt(marker.value), width: textWidth(marker.label), strong: marker.strong })),
        w,
    );
    const lanes = Math.max(0, ...placed.map((p) => p.lane)) + 1;
    const laneH = 18;
    const axisY = 14 + lanes * laneH + 6;
    const laneY = (lane: number) => axisY - 16 - lane * laneH;
    const ticks = spec.ticks ?? niceTicks(spec.min, spec.max, w < 480 ? 4 : 7);
    const arrows = spec.arrows ?? [];
    const span = (a: number, b: number) => Math.abs(xAt(a) - xAt(b));
    const arcDepth = (a: number, b: number) => Math.min(54, 16 + span(a, b) * 0.18);
    const arcTop = axisY + 30;
    const arcsH = arrows.length ? Math.max(...arrows.map((a) => arcDepth(a.from, a.to))) * 0.75 + 8 : 0;
    const rangeTop = arcTop + arcsH + 4;
    const h = rangeTop + (spec.ranges?.length ?? 0) * 26 + 2 + (d.name === 'business' ? 6 : 0);
    const tickLabel = (t: number) => (spec.unit && t === ticks[ticks.length - 1] ? `${t} ${spec.unit}` : `${t}`);
    const tickAnchor = (t: number): Anchor => (xAt(t) < 20 ? 'start' : xAt(t) > w - 40 ? 'end' : 'middle');
    // Tick numbers that would run into each other on a phone are thinned: the ticks stay, every number that
    // fits keeps its place, and the last one (it carries the unit) wins over its neighbour.
    const labelled = (() => {
        const span = (t: number) => {
            const tw = textWidth(tickLabel(t));
            const a = tickAnchor(t);
            const from = a === 'start' ? xAt(t) : a === 'end' ? xAt(t) - tw : xAt(t) - tw / 2;
            return [from, from + tw] as const;
        };
        const kept: number[] = [];
        ticks.forEach((t, i) => {
            const prev = kept[kept.length - 1];
            if (prev === undefined || span(t)[0] - span(prev)[1] >= 8) kept.push(t);
            else if (i === ticks.length - 1 && kept.length > 1) {
                kept.pop();
                if (span(t)[0] - span(kept[kept.length - 1])[1] >= 8) kept.push(t);
            }
        });
        return new Set(kept);
    })();
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
                    {labelled.has(t) ? (
                        <Label x={xAt(t)} y={axisY + 20} anchor={tickAnchor(t)}>
                            {tickLabel(t)}
                        </Label>
                    ) : null}
                </g>
            ))}
            {sorted.map((marker, i) => {
                const x = xAt(marker.value);
                const { lane, anchor, tx } = placed[i];
                const ly = laneY(lane);
                return (
                    <g key={`${marker.label}-${marker.value}`}>
                        {/* A label above its lowest lane hangs on a leader straight down to its own dot. */}
                        {lane > 0 ? <line x1={x} x2={x} y1={ly + 4} y2={axisY - 8} stroke={C.faint} /> : null}
                        {marker.strong ? (
                            <Point d={d} x={x} y={axisY} r={4.5} delay={160 + (300 * x) / w} />
                        ) : (
                            <Point d={d} x={x} y={axisY} r={3.5} tone="muted" />
                        )}
                        <Label x={tx} y={ly} anchor={anchor} fill={marker.strong ? C.ink : C.text} weight={marker.strong ? 600 : undefined}>
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
                const tw = textWidth(range.label);
                // Inside the range when it fits, else after it, else before it; with no room on either side it starts
                // inside and runs on over the grey, which it reads clearly against.
                const inside = tw + 12 < b - a;
                const after = b + 6 + tw < w;
                const before = a - 6 - tw >= 0;
                const at = inside ? { x: a + 6, anchor: 'start' as const } : after ? { x: b + 6, anchor: 'start' as const } : before ? { x: a - 6, anchor: 'end' as const } : { x: Math.min(a + 6, w - tw), anchor: 'start' as const };
                return (
                    <g key={range.label}>
                        <rect x={a} y={y} width={Math.max(2, b - a)} height={16} rx={cornerOf(d, 16, b - a)} fill={C.dim} />
                        <Label x={at.x} y={y + 12} anchor={at.anchor} fill={inside ? C.ink : C.text}>
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
    const size = FS;
    const labelCol = Math.min(narrow ? 76 : 110, Math.max(...spec.layers.map((l) => textWidth(l.label, size))) + 10);
    const rowH = narrow ? 22 : 24;
    const densityH = spec.density ? 40 : 0;
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
    // Section names centred over their columns; when two would nearly touch on a phone, every other one steps up a row.
    const heads = cols.map((col) => {
        const width = textWidth(col.label, size);
        const x = clamp(col.x + col.width / 2, width / 2, w - width / 2);
        return { x, from: x - width / 2, to: x + width / 2 };
    });
    const stagger = heads.some((head, i) => i > 0 && head.from - heads[i - 1].to < 10);
    const density = spec.sections.map((_, i) => spec.layers.reduce((sum, layer) => sum + (layer.levels[i] ?? 0), 0));
    const maxDensity = Math.max(1, ...density);
    const headY = densityH + 16 + (stagger ? 15 : 0);
    const gridTop = headY + 10;
    const gridBottom = gridTop + spec.layers.length * (rowH + 4);
    const h = gridBottom + 2 + (d.name === 'business' ? 6 : 0);
    // With a layer in focus, the others are context and turn grey.
    const anyFocus = spec.layers.some((layer) => layer.focus);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {spec.density ? (
                <g>
                    <Label x={0} y={densityH - 6} size={size} fill={C.text}>
                        Density
                    </Label>
                    {cols.map((col, i) => {
                        const bh = (density[i] / maxDensity) * (densityH - 10);
                        return <rect key={i} x={col.x + 3} y={densityH - bh} width={col.width - 6} height={bh} rx={cornerOf(d, Math.min(bh, 6), col.width - 6)} fill={C.dim} />;
                    })}
                </g>
            ) : null}
            {cols.map((col, i) => (
                <Label key={i} x={heads[i].x} y={stagger && i % 2 === 0 ? headY - 15 : headY} anchor="middle" size={size} fill={C.text}>
                    {col.label}
                </Label>
            ))}
            {d.name === 'business' ? <line x1={0} x2={w} y1={gridTop - 4} y2={gridTop - 4} stroke={C.faint} /> : null}
            {spec.layers.map((layer, li) => {
                const y = gridTop + li * (rowH + 4);
                // Each cell stands on the row's baseline; its height is the layer's level in that section.
                const floor = y + rowH - 2;
                const full = rowH - 4;
                const accent = anyFocus ? layer.focus : true;
                return (
                    <g key={layer.label}>
                        <Label x={0} y={y + rowH * 0.68} size={size} fill={accent && anyFocus ? C.ink : C.text}>
                            {layer.label}
                        </Label>
                        {d.name === 'technical' ? <rect x={labelCol} y={y} width={avail} height={rowH} rx={cornerOf(d, rowH)} fill={C.lane} /> : null}
                        {/* Music writes the row as a line its cells stand on; mind dots it; the ledger rules under it. */}
                        {music || d.name === 'mind' ? <Rule d={d} x1={labelCol} x2={gridRight} y1={floor + 0.5} y2={floor + 0.5} major={music} /> : null}
                        {d.name === 'business' ? <line x1={0} x2={w} y1={y + rowH + 2} y2={y + rowH + 2} stroke={C.grid} /> : null}
                        {/* An accent row's cells rise into it together, one animation per row, staggered down the rows. */}
                        <g {...(accent ? draw('rise', 120 + li * 70) : {})}>
                            {cols.map((col, ci) => {
                                const level = clamp(layer.levels[ci] ?? 0, 0, 1);
                                if (level <= 0) return null;
                                const ch = Math.max(3, full * level);
                                const cw = col.width - 4;
                                return (
                                    <rect
                                        key={ci}
                                        x={col.x + 2}
                                        y={floor - ch}
                                        width={cw}
                                        height={ch}
                                        rx={cornerOf(d, Math.min(ch, full), cw)}
                                        {...(accent ? accentFill(1) : { fill: C.muted })}
                                    />
                                );
                            })}
                        </g>
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
