import type { FlowFigure, NotesFigure, RhythmFigure, StereoFigure } from '@/lib/blog/types';
import { Arrowhead, C, DASH, FS, Label, Lines, Svg, textWidth, wrapText } from './svg';

// ── Rhythm: hits on a step grid, with swing and timing offsets ──

export function Rhythm({ spec, w }: { spec: RhythmFigure; w: number }) {
    const narrow = w < 480;
    const steps = spec.steps ?? 16;
    const perBeat = spec.perBeat ?? 4;
    const labelCol = narrow ? 0 : Math.min(170, Math.max(...spec.rows.map((r) => Math.max(textWidth(r.label), r.note ? textWidth(r.note, 11) : 0))) + 16);
    const laneH = narrow ? 26 : 30;
    const rowH = narrow ? laneH + 24 : laneH + 12;
    const top = 22;
    const gridX = labelCol;
    const gridW = w - labelCol;
    const stepW = gridW / steps;
    const h = top + spec.rows.length * rowH - (narrow ? 0 : 6);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {Array.from({ length: Math.ceil(steps / perBeat) }, (_, b) => (
                <Label key={b} x={gridX + b * perBeat * stepW + 3} y={12} fill={C.text}>
                    {b + 1}
                </Label>
            ))}
            {spec.rows.map((row, ri) => {
                const y = top + ri * rowH;
                const laneY = narrow ? y + 20 : y;
                const swingShift = ((row.swing ?? 0.5) - 0.5) * 2;
                return (
                    <g key={row.label}>
                        {narrow ? (
                            <text x={0} y={y + 13} fontSize={FS}>
                                <tspan fill={C.text}>{row.label}</tspan>
                                {row.note ? <tspan fill={C.soft}>{`  ${row.note}`}</tspan> : null}
                            </text>
                        ) : (
                            <g>
                                <Label x={0} y={laneY + (row.note ? 12 : laneH / 2 + 4)} fill={C.text}>
                                    {row.label}
                                </Label>
                                {row.note ? (
                                    <Label x={0} y={laneY + 27} size={11}>
                                        {row.note}
                                    </Label>
                                ) : null}
                            </g>
                        )}
                        <rect x={gridX} y={laneY} width={gridW} height={laneH} rx={2} fill={C.lane} />
                        {Array.from({ length: steps + 1 }, (_, s) => (
                            <line
                                key={s}
                                x1={gridX + s * stepW}
                                x2={gridX + s * stepW}
                                y1={laneY}
                                y2={laneY + laneH}
                                stroke={s % perBeat === 0 ? C.faint : C.grid}
                            />
                        ))}
                        {row.hits.map((hit, hi) => {
                            const step = typeof hit === 'number' ? hit : hit.step;
                            const offset = typeof hit === 'number' ? 0 : (hit.offset ?? 0);
                            const level = typeof hit === 'number' ? 1 : (hit.level ?? 1);
                            const shift = (step % 2 === 1 ? swingShift : 0) + offset;
                            const bw = Math.max(4, stepW * 0.5);
                            const bh = (laneH - 6) * (0.35 + 0.65 * level);
                            const gx = gridX + step * stepW + 2;
                            const x = gx + shift * stepW;
                            return (
                                <g key={hi}>
                                    {Math.abs(shift) > 0.02 ? (
                                        <rect x={gx} y={laneY + laneH - 3 - bh} width={bw} height={bh} rx={1.5} fill="none" stroke={C.faint} strokeDasharray="2 2" />
                                    ) : null}
                                    <rect x={x} y={laneY + laneH - 3 - bh} width={bw} height={bh} rx={1.5} fill={level < 0.6 ? C.soft : C.ink} />
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </Svg>
    );
}

// ── Stereo: a top-down view of the mix between two speakers ──

export function Stereo({ spec, w }: { spec: StereoFigure; w: number }) {
    const narrow = w < 480;
    const h = narrow ? 240 : 270;
    const cx = w / 2;
    const span = w * (narrow ? 0.36 : 0.32);
    const front = h - 58;
    const back = 64;
    const speakerY = 30;

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {spec.title ? (
                <Label x={0} y={14} fill={C.ink} weight={600}>
                    {spec.title}
                </Label>
            ) : null}
            {[-1, 1].map((side) => (
                <g key={side}>
                    <rect x={cx + side * span - 9} y={speakerY - 9} width={18} height={18} rx={3} fill="none" stroke={C.soft} />
                    <circle cx={cx + side * span} cy={speakerY} r={4} fill={C.soft} />
                    <Label x={cx + side * span + side * 16} y={speakerY + 4} anchor={side < 0 ? 'end' : 'start'}>
                        {side < 0 ? 'Left' : 'Right'}
                    </Label>
                </g>
            ))}
            <line x1={cx} x2={cx} y1={back - 10} y2={front + 10} stroke={C.grid} strokeDasharray={DASH} />
            <Label x={0} y={back + 4}>
                Back
            </Label>
            <Label x={0} y={front + 4}>
                Front
            </Label>
            <path d={`M${cx - 10},${h - 14} L${cx},${h - 30} L${cx + 10},${h - 14} Z`} fill={C.strong} />
            <Label x={cx + 16} y={h - 16}>
                You
            </Label>
            {spec.items.map((item) => {
                const x = cx + item.pan * span;
                const y = front - (item.depth ?? 0.3) * (front - back);
                const alpha = 1 - (item.fade ?? 0) * 0.78;
                const color = `rgba(255,255,255,${(0.92 * alpha).toFixed(2)})`;
                const widthPx = (item.width ?? 0) * span;
                const right = item.pan > 0.45;
                const labelX = right ? x - Math.max(10, widthPx) - 6 : x + Math.max(10, widthPx) + 6;
                return (
                    <g key={item.label}>
                        {widthPx > 0 ? (
                            <g>
                                <line x1={x - widthPx} x2={x + widthPx} y1={y} y2={y} stroke={color} strokeWidth={2} />
                                <line x1={x - widthPx} x2={x - widthPx} y1={y - 5} y2={y + 5} stroke={color} strokeWidth={2} />
                                <line x1={x + widthPx} x2={x + widthPx} y1={y - 5} y2={y + 5} stroke={color} strokeWidth={2} />
                            </g>
                        ) : null}
                        <circle cx={x} cy={y} r={5.5} fill={color} />
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

export function Flow({ spec, w }: { spec: FlowFigure; w: number }) {
    const narrow = w < 480 || spec.steps.length > 5;
    return narrow ? <FlowVertical spec={spec} w={w} /> : <FlowHorizontal spec={spec} w={w} />;
}

function FlowHorizontal({ spec, w }: { spec: FlowFigure; w: number }) {
    const n = spec.steps.length;
    const gap = 30;
    const bw = (w - gap * (n - 1)) / n;
    const labels = spec.steps.map((s) => wrapText(s.label, bw - 16));
    const notes = spec.steps.map((s) => (s.note ? wrapText(s.note, bw - 4, 11) : []));
    const bh = Math.max(...labels.map((l) => l.length)) * 16 + 22;
    const noteH = Math.max(0, ...notes.map((l) => l.length)) * 15;
    // The loop runs above the boxes so it never crosses the notes below them.
    const loopH = spec.loop ? (spec.loop.label ? 40 : 26) : 0;
    const top = loopH;
    const h = top + bh + (noteH ? noteH + 12 : 0) + 4;
    const bx = (i: number) => i * (bw + gap);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {spec.steps.map((step, i) => (
                <g key={step.label}>
                    <rect x={bx(i) + 0.5} y={top + 0.5} width={bw - 1} height={bh - 1} rx={6} fill={C.lane} stroke={C.faint} />
                    <Lines
                        x={bx(i) + bw / 2}
                        y={top + bh / 2 - ((labels[i].length - 1) * 16) / 2 + 4}
                        lines={labels[i]}
                        anchor="middle"
                        fill={C.ink}
                        lineHeight={16 / FS}
                    />
                    {notes[i].length ? <Lines x={bx(i) + bw / 2} y={top + bh + 18} lines={notes[i]} anchor="middle" size={11} lineHeight={15 / 11} /> : null}
                    {i < n - 1 ? (
                        <g>
                            <line x1={bx(i) + bw + 4} x2={bx(i + 1) - 6} y1={top + bh / 2} y2={top + bh / 2} stroke={C.soft} strokeWidth={1.5} />
                            <Arrowhead x={bx(i + 1) - 4} y={top + bh / 2} angle={0} />
                        </g>
                    ) : null}
                </g>
            ))}
            {spec.loop
                ? (() => {
                      const from = bx(n - 1) + bw / 2;
                      const to = bx(spec.loop.to) + bw / 2;
                      const y1 = spec.loop.label ? 22 : 8;
                      return (
                          <g>
                              <path d={`M${from},${top - 2} L${from},${y1} L${to},${y1} L${to},${top - 8}`} fill="none" stroke={C.soft} strokeWidth={1.5} />
                              <Arrowhead x={to} y={top - 3} angle={90} />
                              {spec.loop.label ? (
                                  <Label x={(from + to) / 2} y={y1 - 8} anchor="middle" fill={C.text}>
                                      {spec.loop.label}
                                  </Label>
                              ) : null}
                          </g>
                      );
                  })()
                : null}
        </Svg>
    );
}

function FlowVertical({ spec, w }: { spec: FlowFigure; w: number }) {
    const loopW = spec.loop ? (spec.loop.label ? 42 : 26) : 0;
    const bw = w - loopW;
    const gap = 26;
    const boxes: { step: FlowFigure['steps'][number]; labels: string[]; notes: string[]; y: number; bh: number }[] = [];
    let y = 0;
    for (const step of spec.steps) {
        const labels = wrapText(step.label, bw - 28);
        const notes = step.note ? wrapText(step.note, bw - 28, 11) : [];
        const bh = labels.length * 16 + notes.length * 15 + (notes.length ? 6 : 0) + 22;
        boxes.push({ step, labels, notes, y, bh });
        y += bh + gap;
    }
    const h = y - gap + 2;

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {boxes.map((box, i) => (
                <g key={box.step.label}>
                    <rect x={0.5} y={box.y + 0.5} width={bw - 1} height={box.bh - 1} rx={6} fill={C.lane} stroke={C.faint} />
                    <Lines x={14} y={box.y + 26} lines={box.labels} fill={C.ink} lineHeight={16 / FS} />
                    {box.notes.length ? <Lines x={14} y={box.y + 26 + box.labels.length * 16 + 4} lines={box.notes} size={11} lineHeight={15 / 11} /> : null}
                    {i < boxes.length - 1 ? (
                        <g>
                            <line x1={bw / 2} x2={bw / 2} y1={box.y + box.bh + 3} y2={box.y + box.bh + gap - 6} stroke={C.soft} strokeWidth={1.5} />
                            <Arrowhead x={bw / 2} y={box.y + box.bh + gap - 3} angle={90} />
                        </g>
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
                      return (
                          <g>
                              <path d={`M${bw + 2},${y0} L${x},${y0} L${x},${y1} L${bw + 6},${y1}`} fill="none" stroke={C.soft} strokeWidth={1.5} />
                              <Arrowhead x={bw + 3} y={y1} angle={180} />
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
        </Svg>
    );
}

// ── Notes: a small piano roll for melodies and bass lines ──

const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const noteName = (midi: number) => `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);

export function Notes({ spec, w }: { spec: NotesFigure; w: number }) {
    const narrow = w < 480;
    const perBar = spec.perBar ?? 4;
    const pitches = spec.notes.map((n) => n.pitch);
    const lo = Math.min(...pitches) - 1;
    const hi = Math.max(...pitches) + 1;
    const rows = hi - lo + 1;
    const rowH = Math.max(9, Math.min(narrow ? 13 : 15, 260 / rows));
    const labelCol = narrow ? 34 : 40;
    const chordH = spec.chords?.length ? 22 : 4;
    const totalBeats = Math.ceil(Math.max(...spec.notes.map((n) => n.start + n.length)) / perBar) * perBar;
    const gridW = w - labelCol;
    const beatW = gridW / totalBeats;
    const top = chordH;
    const h = top + rows * rowH + 2;
    const yOf = (pitch: number) => top + (hi - pitch) * rowH;
    const used = Array.from(new Set(pitches)).sort((a, b) => b - a);

    return (
        <Svg w={w} h={h} label={spec.alt}>
            {Array.from({ length: rows }, (_, r) => {
                const pitch = hi - r;
                return <rect key={r} x={labelCol} y={yOf(pitch)} width={gridW} height={rowH} fill={isBlack(pitch) ? 'rgba(0,0,0,0.28)' : C.lane} />;
            })}
            {Array.from({ length: totalBeats + 1 }, (_, b) => (
                <line key={b} x1={labelCol + b * beatW} x2={labelCol + b * beatW} y1={top} y2={h - 2} stroke={b % perBar === 0 ? C.faint : C.grid} />
            ))}
            {/* Skip a pitch name that would sit on top of the one above it. */}
            {used
                .filter((pitch, i) => used.slice(0, i).every((kept) => yOf(pitch) - yOf(kept) >= 12))
                .map((pitch) => (
                    <Label key={pitch} x={labelCol - 6} y={yOf(pitch) + rowH / 2 + 4} anchor="end" size={narrow ? 10 : 11}>
                        {noteName(pitch)}
                    </Label>
                ))}
            {spec.chords?.map((chord) => (
                <Label key={`${chord.at}-${chord.label}`} x={labelCol + chord.at * beatW + 3} y={14} fill={C.ink} weight={600} size={narrow ? 11 : FS}>
                    {chord.label}
                </Label>
            ))}
            {spec.notes.map((note, i) => {
                const x = labelCol + note.start * beatW + 1;
                const width = Math.max(3, note.length * beatW - 2);
                const y = yOf(note.pitch) + 1;
                const fits = note.label && textWidth(note.label, 10) + 6 < width && rowH >= 11;
                return (
                    <g key={i}>
                        <rect x={x} y={y} width={width} height={rowH - 2} rx={2} fill={note.muted ? 'rgba(255,255,255,0.38)' : C.strong} />
                        {fits ? (
                            <Label x={x + 4} y={y + rowH / 2 + 2.5} size={10} fill="#050607" weight={600}>
                                {note.label}
                            </Label>
                        ) : null}
                    </g>
                );
            })}
        </Svg>
    );
}
