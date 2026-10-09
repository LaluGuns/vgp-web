import type { FlowFigure, NotesFigure, RhythmFigure, StereoFigure } from '@/lib/blog/types';
import {
    Arrowhead,
    Barline,
    C,
    ClosingRule,
    Corners,
    FS,
    Label,
    Lines,
    Node,
    Point,
    Rule,
    Svg,
    accentFill,
    accentStroke,
    arrowInset,
    cornerOf,
    dialectOf,
    draw,
    headPath,
    textWidth,
    wrapText,
    type Dialect,
    type DialectProp,
} from './svg';

// ── Rhythm: hits on a step grid, with swing and timing offsets ──

/**
 * One hit. Its onset is its left edge and its level its height, in every
 * dialect. Music writes it as a note head on the line with a stem up to
 * that height, the way a drum part is written.
 */
function Hit({
    d,
    x,
    floor,
    bw,
    bh,
    tone,
    opacity = 1,
    ghost,
    motion,
}: {
    d: Dialect;
    x: number;
    /** Bottom of the hit's slot. */
    floor: number;
    bw: number;
    bh: number;
    tone: 'accent' | 'ink' | 'soft';
    opacity?: number;
    /** A hit's grid position before it was moved: an outline only. */
    ghost?: boolean;
    motion?: object;
}) {
    const paint =
        tone === 'accent' ? accentFill(opacity) : { fill: tone === 'ink' ? C.ink : C.soft, fillOpacity: opacity < 1 ? opacity : undefined };
    const stroke = tone === 'accent' ? accentStroke(opacity) : { stroke: tone === 'ink' ? C.ink : C.soft, strokeOpacity: opacity < 1 ? opacity : undefined };
    if (d.name === 'music') {
        // The same head as a music point, at most 9 wide, sitting on the drum line.
        const r = Math.min(bw, 9) / 3.2;
        const cx = x + r * 1.6;
        const cy = floor - r * 1.25;
        const stemX = cx + r * 1.38;
        if (ghost) return <path d={headPath(cx, cy, r)} fill={C.surface} stroke={C.faint} strokeWidth={1.2} strokeDasharray="2 2" />;
        return (
            <g {...motion}>
                {/* The stem's round end stops at the hit's level, not past it. */}
                <line x1={stemX} x2={stemX} y1={cy - r * 0.35} y2={floor - bh + 0.75} {...stroke} strokeWidth={1.5} strokeLinecap="round" />
                <path d={headPath(cx, cy, r)} {...paint} />
            </g>
        );
    }
    const rx = d.name === 'mind' ? bw / 2 : cornerOf(d, bh, bw);
    if (ghost)
        return (
            <rect
                x={x}
                y={floor - bh}
                width={bw}
                height={bh}
                rx={rx}
                fill="none"
                stroke={C.faint}
                strokeDasharray={d.name === 'mind' ? '0 3' : '2 2'}
                strokeLinecap={d.name === 'mind' ? 'round' : 'butt'}
                strokeWidth={d.name === 'mind' ? 1.4 : 1}
            />
        );
    return <rect x={x} y={floor - bh} width={bw} height={bh} rx={rx} {...paint} {...motion} />;
}

export function Rhythm({ spec, w, dialect }: { spec: RhythmFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const steps = spec.steps ?? 16;
    const perBeat = spec.perBeat ?? 4;
    const noteSize = FS;
    const labelCol = narrow ? 0 : Math.min(170, Math.max(...spec.rows.map((r) => Math.max(textWidth(r.label), r.note ? textWidth(r.note, noteSize) : 0))) + 16);
    const laneH = narrow ? 26 : 30;
    // On a phone the label sits above its lane, with the note on its own line when the two do not share one.
    const noteBelow = (row: RhythmFigure['rows'][number]) => narrow && Boolean(row.note) && textWidth(row.label) + textWidth(row.note!, noteSize) + 10 > w;
    const headH = (row: RhythmFigure['rows'][number]) => (narrow ? (noteBelow(row) ? 36 : 20) : 0);
    const rowGap = narrow ? 4 : 12;
    const top = 22;
    const gridX = labelCol;
    const gridW = w - labelCol;
    const stepW = gridW / steps;
    const ledger = d.name === 'business';
    const rowTops: number[] = [];
    let acc = top;
    for (const row of spec.rows) {
        rowTops.push(acc);
        acc += headH(row) + laneH + rowGap;
    }
    const h = acc - rowGap + (narrow ? 4 : 6) + (ledger ? 8 : 0);
    // With a row in focus, only that row is in the accent; without one, the moved hits are.
    const anyFocus = spec.rows.some((row) => row.focus);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {Array.from({ length: Math.ceil(steps / perBeat) }, (_, b) => (
                <Label key={b} x={gridX + b * perBeat * stepW + 3} y={12} fill={C.text}>
                    {b + 1}
                </Label>
            ))}
            {ledger ? <line x1={0} x2={w} y1={top - 5} y2={top - 5} stroke={C.faint} /> : null}
            {spec.rows.map((row, ri) => {
                const y = rowTops[ri];
                const laneY = y + headH(row);
                const floor = laneY + laneH - 3;
                const swingShift = ((row.swing ?? 0.5) - 0.5) * 2;
                const lit = Boolean(row.focus);
                const labelFill = lit ? C.ink : C.text;
                return (
                    <g key={row.label}>
                        {narrow ? (
                            noteBelow(row) ? (
                                <g>
                                    <Label x={0} y={y + 13} fill={labelFill} weight={lit ? 600 : undefined}>
                                        {row.label}
                                    </Label>
                                    <Label x={0} y={y + 29} size={noteSize} fontStyle={d.italic ? 'italic' : undefined}>
                                        {row.note}
                                    </Label>
                                </g>
                            ) : (
                                <text x={0} y={y + 13} fontSize={FS}>
                                    <tspan fill={labelFill} fontWeight={lit ? 600 : undefined}>
                                        {row.label}
                                    </tspan>
                                    {/* An explicit gap: spaces at the start of a tspan collapse in SVG. */}
                                    {row.note ? (
                                        <tspan dx={FS * 0.7} fill={C.soft} fontStyle={d.italic ? 'italic' : undefined}>
                                            {row.note}
                                        </tspan>
                                    ) : null}
                                </text>
                            )
                        ) : (
                            <g>
                                <Label x={0} y={laneY + (row.note ? 12 : laneH / 2 + 4)} fill={labelFill} weight={lit ? 600 : undefined}>
                                    {row.label}
                                </Label>
                                {row.note ? (
                                    <Label x={0} y={laneY + 27} size={noteSize} fontStyle={d.italic ? 'italic' : undefined}>
                                        {row.note}
                                    </Label>
                                ) : null}
                            </g>
                        )}
                        <RhythmLane d={d} x={gridX} y={laneY} w={gridW} h={laneH} steps={steps} perBeat={perBeat} />
                        {row.hits.map((hit, hi) => {
                            const step = typeof hit === 'number' ? hit : hit.step;
                            const offset = typeof hit === 'number' ? 0 : (hit.offset ?? 0);
                            const level = typeof hit === 'number' ? 1 : (hit.level ?? 1);
                            const shift = (step % 2 === 1 ? swingShift : 0) + offset;
                            const bw = Math.max(4, stepW * 0.5);
                            // A hit's level is its height, in every dialect and in the accent too: no faded accent.
                            const bh = (laneH - 6) * (0.35 + 0.65 * level);
                            const gx = gridX + step * stepW + 2;
                            const x = gx + shift * stepW;
                            const moved = Math.abs(shift) > 0.02;
                            const accent = anyFocus ? lit : moved;
                            const grey = level < 0.6 ? 'soft' : 'ink';
                            const delay = 160 + (240 * step) / steps + ri * 40;
                            return (
                                <g key={hi}>
                                    {moved ? <Hit d={d} x={gx} floor={floor} bw={bw} bh={bh} tone="soft" ghost /> : null}
                                    {accent ? (
                                        <Hit
                                            d={d}
                                            x={x}
                                            floor={floor}
                                            bw={bw}
                                            bh={bh}
                                            tone="accent"
                                            // A moved hit slides from its grid step to where it lands; a hit in a row in focus rises in its place.
                                            motion={
                                                moved
                                                    ? draw('slide', delay, { '--draw-from': `${(gx - x).toFixed(1)}px` })
                                                    : draw(d.name === 'music' ? 'pop' : 'rise', delay)
                                            }
                                        />
                                    ) : (
                                        <Hit d={d} x={x} floor={floor} bw={bw} bh={bh} tone={grey} />
                                    )}
                                </g>
                            );
                        })}
                        {ledger ? <line x1={0} x2={w} y1={laneY + laneH + 4} y2={laneY + laneH + 4} stroke={C.grid} /> : null}
                    </g>
                );
            })}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}

/** The lane a row of hits sits in: a sequencer lane, a one-line drum staff, a row of dotted steps, a ruled row. */
function RhythmLane({ d, x, y, w, h, steps, perBeat }: { d: Dialect; x: number; y: number; w: number; h: number; steps: number; perBeat: number }) {
    const stepW = w / steps;
    const sx = (s: number) => x + s * stepW;
    switch (d.name) {
        case 'technical':
            return (
                <g>
                    <rect x={x} y={y} width={w} height={h} rx={cornerOf(d, h)} fill={C.lane} />
                    {Array.from({ length: steps + 1 }, (_, s) => (
                        <line key={s} x1={sx(s)} x2={sx(s)} y1={y} y2={y + h} stroke={s % perBeat === 0 ? C.faint : C.grid} />
                    ))}
                </g>
            );
        case 'music': {
            const line = y + h - 3 - 3.4;
            return (
                <g>
                    <line x1={x} x2={x + w} y1={line} y2={line} stroke="rgba(255,255,255,0.22)" />
                    {Array.from({ length: steps + 1 }, (_, s) =>
                        s % perBeat === 0 ? (
                            <Barline key={s} x={sx(s)} y1={y + 2} y2={y + h - 1} opacity={s === 0 || s === steps ? 0.34 : 0.16} />
                        ) : (
                            <line key={s} x1={sx(s)} x2={sx(s)} y1={line - 3} y2={line + 3} stroke="rgba(255,255,255,0.16)" strokeLinecap="round" />
                        ),
                    )}
                </g>
            );
        }
        case 'mind': {
            const line = y + h - 1;
            return (
                <g>
                    {Array.from({ length: steps }, (_, s) => (
                        <circle key={s} cx={sx(s) + 2 + Math.max(4, stepW * 0.5) / 2} cy={line} r={s % perBeat === 0 ? 1.7 : 1.15} fill={s % perBeat === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.26)'} />
                    ))}
                </g>
            );
        }
        case 'business':
            return (
                <g>
                    {Array.from({ length: steps + 1 }, (_, s) => (
                        <line key={s} x1={sx(s)} x2={sx(s)} y1={y} y2={y + h} stroke={s % perBeat === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'} />
                    ))}
                </g>
            );
    }
}

// ── Stereo: a top-down view of the mix between two speakers ──

export function Stereo({ spec, w, dialect }: { spec: StereoFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const h = narrow ? 240 : 270;
    const cx = w / 2;
    const span = w * (narrow ? 0.36 : 0.32);
    const front = h - 58;
    const back = 64;
    const speakerY = 30;
    // The stage starts clear of the Back and Front labels.
    const stageL = Math.max(cx - span - 14, 46);
    const stageR = w - stageL;

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {spec.title ? (
                <Label x={0} y={14} fill={C.ink} weight={600}>
                    {spec.title}
                </Label>
            ) : null}
            {/* Depth rules across the stage, in the dialect's texture: front to back in quarters. */}
            {[0, 1, 2, 3, 4].map((k) => {
                const y = front - (k * (front - back)) / 4;
                return <Rule key={k} d={d} x1={stageL} x2={stageR} y1={y} y2={y} opacity={d.name === 'mind' ? 0.16 : d.rule.minor} />;
            })}
            <Corners d={d} x={stageL} y={back} w={stageR - stageL} h={front - back} />
            {[-1, 1].map((side) => (
                <g key={side}>
                    <rect x={cx + side * span - 9} y={speakerY - 9} width={18} height={18} rx={d.name === 'mind' ? 6 : 3} fill="none" stroke={C.soft} />
                    <circle cx={cx + side * span} cy={speakerY} r={4} fill={C.soft} />
                    <Label x={cx + side * span + side * 16} y={speakerY + 4} anchor={side < 0 ? 'end' : 'start'}>
                        {side < 0 ? 'Left' : 'Right'}
                    </Label>
                </g>
            ))}
            <line x1={cx} x2={cx} y1={back - 10} y2={front + 10} stroke={C.grid} strokeDasharray={d.refDash} strokeLinecap={d.cap} />
            <Label x={0} y={back + 4}>
                Back
            </Label>
            <Label x={0} y={front + 4}>
                Front
            </Label>
            <path d={`M${cx - 10},${h - 14} L${cx},${h - 30} L${cx + 10},${h - 14} Z`} fill={C.strong} strokeLinejoin={d.join} />
            <Label x={cx + 16} y={h - 16}>
                You
            </Label>
            {spec.items.map((item, ii) => {
                const x = cx + item.pan * span;
                const y = front - (item.depth ?? 0.3) * (front - back);
                const alpha = 1 - (item.fade ?? 0) * 0.78;
                const widthPx = (item.width ?? 0) * span;
                const right = item.pan > 0.45;
                const reach = Math.max(d.marker === 'ring' ? 12 : 10, widthPx);
                const labelX = right ? x - reach - 6 : x + reach + 6;
                const stroke = accentStroke(0.95 * alpha);
                return (
                    <g key={item.label}>
                        {/* The mark pops in place; its label is already there. */}
                        <g {...draw('pop', 160 + (360 * ii) / Math.max(1, spec.items.length - 1))}>
                            {widthPx > 0 ? (
                                <g>
                                    <line x1={x - widthPx} x2={x + widthPx} y1={y} y2={y} {...stroke} strokeWidth={2} strokeLinecap={d.cap} />
                                    {d.name === 'mind' ? (
                                        [-1, 1].map((s) => <circle key={s} cx={x + s * widthPx} cy={y} r={2.6} {...accentFill(0.95 * alpha)} />)
                                    ) : (
                                        [-1, 1].map((s) => (
                                            <line key={s} x1={x + s * widthPx} x2={x + s * widthPx} y1={y - 5} y2={y + 5} {...stroke} strokeWidth={2} strokeLinecap={d.cap} />
                                        ))
                                    )}
                                </g>
                            ) : null}
                            <Point d={d} x={x} y={y} r={d.marker === 'ring' ? 4 : d.marker === 'head' ? 4.2 : d.marker === 'tick' ? 4 : 5} opacity={0.95 * alpha} />
                        </g>
                        <Label x={labelX} y={y + 4} anchor={right ? 'end' : 'start'} fill={`rgba(255,255,255,${(0.75 * alpha + 0.1).toFixed(2)})`}>
                            {item.label}
                        </Label>
                    </g>
                );
            })}
        </Svg>
    );
}

// ── Flow: steps with arrows, optionally looping back ──

export function Flow({ spec, w, dialect }: { spec: FlowFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480 || spec.steps.length > 5;
    return narrow ? <FlowVertical spec={spec} w={w} d={d} /> : <FlowHorizontal spec={spec} w={w} d={d} />;
}

/** A connector from one step to the next, ending in the dialect's arrowhead. With a delay it draws from its step to the next. */
function Link({ d, x1, y1, x2, y2, angle, delay }: { d: Dialect; x1: number; y1: number; x2: number; y2: number; angle: number; delay?: number }) {
    const a = (angle * Math.PI) / 180;
    const inset = arrowInset(d);
    const motion = (kind: 'line' | 'fade', at: number) => (delay === undefined ? {} : draw(kind, delay + at));
    return (
        <g>
            {d.name === 'mind' ? <circle cx={x1} cy={y1} r={2} fill={C.soft} {...motion('fade', 0)} /> : null}
            <line
                x1={x1}
                y1={y1}
                x2={x2 - inset * Math.cos(a)}
                y2={y2 - inset * Math.sin(a)}
                stroke={C.soft}
                strokeWidth={d.name === 'business' ? 1.25 : 1.5}
                strokeLinecap={d.cap}
                {...motion('line', 0)}
            />
            <g {...motion('fade', 260)}>
                <Arrowhead d={d} x={x2} y={y2} angle={angle} />
            </g>
        </g>
    );
}

/** When step i of a flow appears: one after another, in the order they happen. */
const stepDelay = (i: number) => 80 + i * 170;

/**
 * The path of a loop back to an earlier step, through three corners: out
 * from the last step, along, and into the target. Technical and the ledger
 * turn square corners like a block diagram; music rounds them; mind draws
 * one arc, a thought coming back round.
 */
function loopPath(d: Dialect, pts: [number, number][]): string {
    const [p0, p1, p2, p3] = pts;
    if (d.name === 'mind') return `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
    if (d.name !== 'music') return `M${p0[0]},${p0[1]} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]}`;
    const r = 9;
    const toward = (a: [number, number], b: [number, number], dist: number): [number, number] => {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const k = Math.min(dist, len / 2) / len;
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
    };
    const a1 = toward(p1, p0, r);
    const b1 = toward(p1, p2, r);
    const a2 = toward(p2, p1, r);
    const b2 = toward(p2, p3, r);
    return `M${p0[0]},${p0[1]} L${a1[0]},${a1[1]} Q${p1[0]},${p1[1]} ${b1[0]},${b1[1]} L${a2[0]},${a2[1]} Q${p2[0]},${p2[1]} ${b2[0]},${b2[1]} L${p3[0]},${p3[1]}`;
}

function FlowHorizontal({ spec, w, d }: { spec: FlowFigure; w: number; d: Dialect }) {
    const n = spec.steps.length;
    const gap = 30;
    const bw = (w - gap * (n - 1)) / n;
    const labels = spec.steps.map((s) => wrapText(s.label, bw - 16));
    const notes = spec.steps.map((s) => (s.note ? wrapText(s.note, bw - 4) : []));
    const bh = Math.max(...labels.map((l) => l.length)) * 16 + 22;
    const noteH = Math.max(0, ...notes.map((l) => l.length)) * 16;
    const ledger = d.name === 'business';
    // The ledger numbers its steps in a header row, like the clauses of a contract.
    const headH = ledger ? 24 : 0;
    // The loop runs above the boxes so it never crosses the notes below them.
    const loopH = spec.loop ? (spec.loop.label ? 40 : 26) : 0;
    const top = loopH + headH;
    const h = top + bh + (noteH ? noteH + 12 : 0) + 4 + (ledger ? 8 : 0);
    const bx = (i: number) => i * (bw + gap);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {ledger ? (
                <g>
                    {spec.steps.map((step, i) => (
                        <Label key={step.label} x={bx(i)} y={loopH + 12} fill={step.focus ? C.accent : C.soft} weight={step.focus ? 600 : undefined} {...draw('fade', stepDelay(i))}>
                            {i + 1}
                        </Label>
                    ))}
                    <line x1={0} x2={w} y1={loopH + 18} y2={loopH + 18} stroke={C.faint} />
                </g>
            ) : null}
            {spec.steps.map((step, i) => (
                <g key={step.label}>
                    <g {...draw('fade', stepDelay(i))}>
                        <Node d={d} x={bx(i)} y={top} w={bw} h={bh} focus={step.focus} delay={stepDelay(i) + 160} />
                        <Lines
                            x={bx(i) + bw / 2}
                            y={top + bh / 2 - ((labels[i].length - 1) * 16) / 2 + 4}
                            lines={labels[i]}
                            anchor="middle"
                            fill={C.ink}
                            weight={step.focus ? 600 : undefined}
                            lineHeight={16 / FS}
                        />
                        {notes[i].length ? <Lines x={bx(i) + bw / 2} y={top + bh + 18} lines={notes[i]} anchor="middle" lineHeight={16 / FS} italic={d.italic} /> : null}
                    </g>
                    {i < n - 1 ? <Link d={d} x1={bx(i) + bw + 4} y1={top + bh / 2} x2={bx(i + 1) - 4} y2={top + bh / 2} angle={0} delay={stepDelay(i) + 120} /> : null}
                </g>
            ))}
            {spec.loop
                ? (() => {
                      const from = bx(n - 1) + bw / 2;
                      const to = bx(spec.loop.to) + bw / 2;
                      const y1 = headH + (spec.loop.label ? 22 : 8);
                      const end = top - 3 - arrowInset(d) + 1;
                      const pts: [number, number][] =
                          d.name === 'mind'
                              ? [
                                    [from, top - 2],
                                    [from, y1 - 6],
                                    [to, y1 - 6],
                                    [to, end],
                                ]
                              : [
                                    [from, top - 2],
                                    [from, y1],
                                    [to, y1],
                                    [to, end],
                                ];
                      return (
                          <g {...draw('fade', stepDelay(n))}>
                              <path d={loopPath(d, pts)} fill="none" stroke={C.soft} strokeWidth={1.5} strokeLinecap={d.cap} strokeLinejoin={d.join} />
                              <Arrowhead d={d} x={to} y={top - 3} angle={90} />
                              {spec.loop.label ? (
                                  <Label x={(from + to) / 2} y={y1 - (d.name === 'mind' ? 4 : 8)} anchor="middle" fill={C.text}>
                                      {spec.loop.label}
                                  </Label>
                              ) : null}
                          </g>
                      );
                  })()
                : null}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}

function FlowVertical({ spec, w, d }: { spec: FlowFigure; w: number; d: Dialect }) {
    const loopW = spec.loop ? (spec.loop.label ? 42 : 26) : 0;
    const bw = w - loopW;
    const gap = 26;
    const ledger = d.name === 'business';
    // The ledger gives each step a numbered column of its own.
    const indent = ledger ? 34 : 14;
    const boxes: { step: FlowFigure['steps'][number]; labels: string[]; notes: string[]; y: number; bh: number }[] = [];
    let y = 0;
    for (const step of spec.steps) {
        const labels = wrapText(step.label, bw - indent - 14);
        const notes = step.note ? wrapText(step.note, bw - indent - 14) : [];
        const bh = labels.length * 16 + notes.length * 16 + (notes.length ? 6 : 0) + 22;
        boxes.push({ step, labels, notes, y, bh });
        y += bh + gap;
    }
    const h = y - gap + 2 + (ledger ? 10 : 0);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {boxes.map((box, i) => (
                <g key={box.step.label}>
                    <g {...draw('fade', stepDelay(i))}>
                        <Node d={d} x={0} y={box.y} w={bw} h={box.bh} focus={box.step.focus} delay={stepDelay(i) + 160} />
                        {ledger ? (
                            <g>
                                <Label x={14} y={box.y + 26} fill={box.step.focus ? C.accent : C.soft} weight={box.step.focus ? 600 : undefined}>
                                    {i + 1}
                                </Label>
                                <line x1={indent - 8} x2={indent - 8} y1={box.y + 1} y2={box.y + box.bh - 1} stroke={box.step.focus ? C.faint : C.grid} />
                            </g>
                        ) : null}
                        <Lines x={indent} y={box.y + 26} lines={box.labels} fill={C.ink} weight={box.step.focus ? 600 : undefined} lineHeight={16 / FS} />
                        {box.notes.length ? (
                            <Lines x={indent} y={box.y + 26 + box.labels.length * 16 + 4} lines={box.notes} lineHeight={16 / FS} italic={d.italic} />
                        ) : null}
                    </g>
                    {i < boxes.length - 1 ? (
                        <Link d={d} x1={bw / 2} y1={box.y + box.bh + 3} x2={bw / 2} y2={box.y + box.bh + gap - 3} angle={90} delay={stepDelay(i) + 120} />
                    ) : null}
                </g>
            ))}
            {spec.loop
                ? (() => {
                      const last = boxes[boxes.length - 1];
                      const target = boxes[spec.loop.to];
                      const x = bw + 12;
                      const y0 = last.y + last.bh / 2;
                      const y1 = target.y + target.bh / 2;
                      const end = bw + 3 + arrowInset(d) - 1;
                      const pts: [number, number][] =
                          d.name === 'mind'
                              ? [
                                    [bw + 2, y0],
                                    [x + 8, y0],
                                    [x + 8, y1],
                                    [end, y1],
                                ]
                              : [
                                    [bw + 2, y0],
                                    [x, y0],
                                    [x, y1],
                                    [end + 2, y1],
                                ];
                      return (
                          <g {...draw('fade', stepDelay(boxes.length))}>
                              <path d={loopPath(d, pts)} fill="none" stroke={C.soft} strokeWidth={1.5} strokeLinecap={d.cap} strokeLinejoin={d.join} />
                              <Arrowhead d={d} x={bw + 3} y={y1} angle={180} />
                              {spec.loop.label ? (
                                  <Label
                                      x={x + 16}
                                      y={(y0 + y1) / 2}
                                      anchor="middle"
                                      fill={C.text}
                                      transform={`rotate(-90 ${x + 16} ${(y0 + y1) / 2})`}
                                  >
                                      {spec.loop.label}
                                  </Label>
                              ) : null}
                          </g>
                      );
                  })()
                : null}
            <ClosingRule d={d} x1={0} x2={bw} y={h - 4} />
        </Svg>
    );
}

// ── Notes: a small piano roll for melodies and bass lines ──

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const noteName = (midi: number) => `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

export function Notes({ spec, w, dialect }: { spec: NotesFigure; w: number; dialect?: DialectProp }) {
    const d = dialectOf(dialect);
    const narrow = w < 480;
    const perBar = spec.perBar ?? 4;
    const pitches = spec.notes.map((n) => n.pitch);
    const lo = Math.min(...pitches) - 1;
    const hi = Math.max(...pitches) + 1;
    const rows = hi - lo + 1;
    const rowH = Math.max(9, Math.min(narrow ? 13 : 15, 260 / rows));
    const labelCol = narrow ? 36 : 40;
    const chordH = spec.chords?.length ? 22 : 4;
    const totalBeats = Math.ceil(Math.max(...spec.notes.map((n) => n.start + n.length)) / perBar) * perBar;
    const music = d.name === 'music';
    // The score closes on a final bar line, so its roll stops short of the edge to leave room for it.
    const gridW = w - labelCol - (music ? 6 : 0);
    const beatW = gridW / totalBeats;
    const top = chordH;
    const rollBottom = top + rows * rowH;
    const ledger = d.name === 'business';
    const h = rollBottom + 2 + (ledger ? 6 : 0);
    const yOf = (pitch: number) => top + (hi - pitch) * rowH;
    const used = Array.from(new Set(pitches)).sort((a, b) => b - a);

    return (
        <Svg w={w} h={h} label={spec.alt} d={d}>
            {Array.from({ length: rows }, (_, r) => {
                const pitch = hi - r;
                // Pitch rows: piano-roll lanes, lighter in the ledger and score, which rule them instead.
                return (
                    <rect
                        key={r}
                        x={labelCol}
                        y={yOf(pitch)}
                        width={gridW}
                        height={rowH}
                        fill={isBlack(pitch) ? 'rgba(0,0,0,0.28)' : music || ledger ? 'rgba(255,255,255,0.02)' : C.lane}
                    />
                );
            })}
            {ledger
                ? Array.from({ length: rows + 1 }, (_, r) => (
                      <line key={`r${r}`} x1={labelCol} x2={w} y1={top + r * rowH} y2={top + r * rowH} stroke="rgba(255,255,255,0.06)" />
                  ))
                : null}
            {Array.from({ length: totalBeats + 1 }, (_, b) => {
                const x = labelCol + b * beatW;
                if (music && b % perBar === 0)
                    return b === totalBeats ? (
                        <Barline key={b} x={w} y1={top} y2={rollBottom} kind="final" opacity={0.45} />
                    ) : (
                        <Barline key={b} x={x} y1={top} y2={rollBottom} opacity={0.3} />
                    );
                return <Rule key={b} d={d} x1={x} x2={x} y1={top} y2={rollBottom} major={b % perBar === 0} opacity={d.name === 'technical' ? (b % perBar === 0 ? 0.3 : 0.1) : undefined} />;
            })}
            {/* Skip a pitch name that would sit on top of the one above it. */}
            {used
                .filter((pitch, i) => used.slice(0, i).every((kept) => yOf(pitch) - yOf(kept) >= 13))
                .map((pitch) => (
                    <Label key={pitch} x={labelCol - 6} y={yOf(pitch) + rowH / 2 + 4} anchor="end">
                        {noteName(pitch)}
                    </Label>
                ))}
            {spec.chords?.map((chord) => (
                <Label key={`${chord.at}-${chord.label}`} x={labelCol + chord.at * beatW + 3} y={14} fill={C.ink} weight={600}>
                    {chord.label}
                </Label>
            ))}
            {spec.notes.map((note, i) => {
                const x = labelCol + note.start * beatW + 1;
                const width = Math.max(3, note.length * beatW - 2);
                const y = yOf(note.pitch) + 1;
                const noteSize = narrow ? FS : 11;
                const fits = note.label && textWidth(note.label, noteSize) + 6 < width && rowH >= noteSize;
                // Accent notes grow from their start in the order they play; a label fades in once its note is drawn.
                const delay = 120 + (360 * note.start) / totalBeats;
                return (
                    <g key={i}>
                        <rect
                            x={x}
                            y={y}
                            width={width}
                            height={rowH - 2}
                            rx={cornerOf(d, rowH - 2, width)}
                            fill={note.muted ? 'rgba(255,255,255,0.38)' : C.accent}
                            {...(note.muted ? {} : draw('grow', delay))}
                        />
                        {fits ? (
                            <Label
                                x={x + (music ? 5 : 4)}
                                y={y + (rowH - 2) / 2 + noteSize * 0.36}
                                size={noteSize}
                                fill="#050607"
                                weight={600}
                                {...(note.muted ? {} : draw('fade', delay + 300))}
                            >
                                {note.label}
                            </Label>
                        ) : null}
                    </g>
                );
            })}
            <ClosingRule d={d} x1={0} x2={w} y={h - 4} />
        </Svg>
    );
}
