'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, hat, kick, midi, pad, sequence, snare, type Engine } from './engine';
import { PlayButton, Segmented, Slider, StepStrip, useFrame, usePlayer } from './ui';

type GrooveMode = 'swing' | 'snare' | 'tempo' | 'humanize' | 'syncopation';

interface GrooveSettings {
    swing: number;
    snareMs: number;
    bpm: number;
    humanMs: number;
    pattern: 'straight' | 'syncopated';
}

const PATTERNS = {
    straight: { kick: [0, 8], snare: [4, 12], hatAccent: [0, 4, 8, 12] },
    syncopated: { kick: [0, 3, 10], snare: [4, 12], hatAccent: [2, 6, 11, 14] },
};

// A fixed random table so "human" timing is the same every loop, like a real take.
const HUMAN = Array.from({ length: 16 }, (_, i) => Math.sin(i * 12.9898) * 43758.5453).map((v) => (v - Math.floor(v)) * 2 - 1);

/**
 * A one-bar beat with a step grid. Each article turns on the one control
 * it is about: swing, a late snare, tempo, human timing or syncopation.
 */
export function GrooveDemo({ mode }: { mode: GrooveMode }) {
    const [settings, setSettings] = useState<GrooveSettings>({
        swing: 50,
        snareMs: 0,
        bpm: mode === 'tempo' ? 90 : 92,
        humanMs: 0,
        pattern: 'straight',
    });
    const live = useRef(settings);
    useEffect(() => {
        live.current = settings;
    }, [settings]);
    const queue = useRef<{ step: number; time: number }[]>([]);
    const clock = useRef<{ ctx: AudioContext; seq: ReturnType<typeof sequence> } | null>(null);
    const [current, setCurrent] = useState(-1);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.connect(out);
        const seq = sequence(ctx, live.current.bpm, 16, (step, time, stepDur) => {
            const s = live.current;
            const p = PATTERNS[s.pattern];
            const swingDelay = step % 2 === 1 ? ((s.swing - 50) / 50) * stepDur : 0;
            const human = (s.humanMs / 1000) * HUMAN[step];
            const t = time + swingDelay;
            queue.current.push({ step, time: t });
            if (p.kick.includes(step)) kick(ctx, bus, time, 1);
            if (p.snare.includes(step)) snare(ctx, bus, Math.max(ctx.currentTime, time + s.snareMs / 1000 + human * 0.6), 0.9);
            hat(ctx, bus, Math.max(ctx.currentTime, t + human), p.hatAccent.includes(step) ? 0.75 : 0.32 + 0.12 * Math.abs(HUMAN[(step + 5) % 16]) * (s.humanMs > 0 ? 1 : 0));
            if (step === 0) bass(ctx, bus, time, midi(33), stepDur * 6, 0.5);
            if (step === 10) bass(ctx, bus, time, midi(36), stepDur * 4, 0.45);
        });
        clock.current = { ctx, seq };
        return () => {
            seq.stop();
            clock.current = null;
            queue.current = [];
            setCurrent(-1);
            fadeOut(ctx, bus);
        };
    });

    useFrame(player.playing, () => {
        const c = clock.current;
        if (!c) return;
        const now = c.ctx.currentTime;
        while (queue.current.length > 1 && queue.current[1].time <= now) queue.current.shift();
        const head = queue.current[0];
        if (head && head.time <= now) setCurrent(head.step);
    });

    const update = (patch: Partial<GrooveSettings>) => {
        setSettings((s) => ({ ...s, ...patch }));
        if (patch.bpm && clock.current) clock.current.seq.setBpm(patch.bpm);
    };

    const p = PATTERNS[settings.pattern];
    // Where each hit lands, in steps, exactly as the sequencer above plays it.
    const stepMs = 60000 / settings.bpm / 4;
    const swingShift = (settings.swing - 50) / 50;
    const drift = settings.humanMs / stepMs;
    const snareShift = settings.snareMs / stepMs;
    const syncopated = settings.pattern === 'syncopated';
    const rows: Row[] = [
        {
            label: 'Hat',
            hits: Array.from({ length: 16 }, (_, i) => {
                const shift = (i % 2 === 1 ? swingShift : 0) + drift * HUMAN[i];
                const strong = p.hatAccent.includes(i);
                return { step: i, shift, strong, focus: Math.abs(shift) > 0.004 || (syncopated && strong && i % 4 !== 0) };
            }),
        },
        {
            label: 'Snare',
            hits: p.snare.map((i) => {
                const shift = snareShift + drift * HUMAN[i] * 0.6;
                return { step: i, shift, strong: true, focus: Math.abs(shift) > 0.004 };
            }),
        },
        { label: 'Kick', hits: p.kick.map((i) => ({ step: i, shift: 0, strong: true, focus: syncopated && i % 4 !== 0 })) },
    ];

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <StepGrid current={current} rows={rows} />
            {mode === 'swing' ? (
                <div className="space-y-4">
                    <Slider label="Swing" value={settings.swing} min={50} max={75} onChange={(v) => update({ swing: v })} format={(v) => `${v}%`} hint="50% is straight. Around 66% is a triplet feel." />
                    <Segmented
                        label="Swing presets"
                        value={settings.swing === 50 ? 'straight' : settings.swing === 58 ? 'light' : settings.swing === 66 ? 'triplet' : 'custom'}
                        onChange={(v) => update({ swing: v === 'straight' ? 50 : v === 'light' ? 58 : 66 })}
                        options={[
                            { value: 'straight', label: 'Straight' },
                            { value: 'light', label: 'Light 58%' },
                            { value: 'triplet', label: 'Triplet 66%' },
                        ]}
                    />
                </div>
            ) : null}
            {mode === 'snare' ? (
                <Slider
                    label="Snare timing"
                    value={settings.snareMs}
                    min={-30}
                    max={40}
                    onChange={(v) => update({ snareMs: v })}
                    format={(v) => (v === 0 ? 'On the grid' : v > 0 ? `${v} ms late` : `${-v} ms early`)}
                    hint="Late snares feel heavier and more laid back. Early ones push forward."
                />
            ) : null}
            {mode === 'tempo' ? (
                <Slider label="Tempo" value={settings.bpm} min={60} max={160} onChange={(v) => update({ bpm: v })} format={(v) => `${v} BPM`} hint="Same pattern, same sounds. Only the tempo changes." />
            ) : null}
            {mode === 'humanize' ? (
                <Slider
                    label="Timing drift"
                    value={settings.humanMs}
                    min={0}
                    max={30}
                    onChange={(v) => update({ humanMs: v })}
                    format={(v) => (v === 0 ? 'Quantized' : `up to ${v} ms`)}
                    hint="Small, consistent drift reads as a player. Large drift reads as sloppy."
                />
            ) : null}
            {mode === 'syncopation' ? (
                <Segmented
                    label="Pattern"
                    value={settings.pattern}
                    onChange={(v) => update({ pattern: v })}
                    options={[
                        { value: 'straight', label: 'On the beat' },
                        { value: 'syncopated', label: 'Syncopated' },
                    ]}
                />
            ) : null}
        </div>
    );
}

interface Row {
    label: string;
    /** `shift` in steps from the grid; `focus` marks a hit the demo moves or is about, drawn in the accent. */
    hits: { step: number; shift: number; strong: boolean; focus: boolean }[];
}

function StepGrid({ current, rows }: { current: number; rows: Row[] }) {
    return (
        <div aria-hidden="true" className="space-y-1.5">
            {rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-xs text-white/50">{row.label}</span>
                    {/* The lane, steps and hits take the lesson's dialect (app/globals.css, .vgp-lane): a sequencer lane,
                        a one-line drum staff with note heads, a row of dotted steps, or a ruled row. */}
                    <div className="vgp-lane relative grid h-7 flex-1 grid-cols-16" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                        {Array.from({ length: 16 }, (_, i) => (
                            <span
                                key={i}
                                data-beat={i % 4 === 0 ? '' : undefined}
                                className={`vgp-step border-l ${i % 4 === 0 ? 'border-white/25' : 'border-white/[0.07]'} ${current === i ? 'bg-white/[0.08]' : ''}`}
                            />
                        ))}
                        {row.hits.map((hit) => (
                            <span
                                key={hit.step}
                                className={`vgp-hit absolute bottom-1 top-1 bg-current ${hit.focus ? 'text-[var(--accent)]' : hit.strong ? 'text-white/85' : 'text-white/40'}`}
                                style={{ left: `calc(${((hit.step + hit.shift) / 16) * 100}% + 2px)`, width: 'calc(100% / 16 * 0.5)' }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Two bars of build into two bars of drop. Toggle a beat of silence or a
 * stripped-back bar before the drop and hear how much harder it lands.
 */
export function DropDemo() {
    const [gap, setGap] = useState(false);
    const [strip, setStrip] = useState(false);
    const live = useRef({ gap, strip });
    useEffect(() => {
        live.current = { gap, strip };
    }, [gap, strip]);
    const [bar, setBar] = useState(-1);
    const clock = useRef<{ ctx: AudioContext; start: number; barDur: number } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.connect(out);
        const bpm = 118;
        const stepDur = 60 / bpm / 4;
        const start = ctx.currentTime + 0.08;
        clock.current = { ctx, start, barDur: stepDur * 16 };
        // sequence() starts 80 ms ahead, matching `start`.
        const seq = sequence(ctx, bpm, 64, (step, time) => {
            const { gap: g, strip: s } = live.current;
            const barNo = Math.floor(step / 16);
            const inBar = step % 16;
            const drop = barNo >= 2;
            const lastBarBeforeDrop = barNo === 1;
            if (g && lastBarBeforeDrop && inBar >= 12) return;
            const stripped = s && lastBarBeforeDrop;
            if (drop) {
                if (inBar % 4 === 0) kick(ctx, bus, time, 1);
                if (inBar === 4 || inBar === 12) snare(ctx, bus, time, 1);
                if (inBar % 2 === 1) hat(ctx, bus, time, 0.5, inBar % 4 === 3);
                if (inBar === 0) {
                    pad(ctx, bus, time, [midi(57), midi(60), midi(64), midi(69)], stepDur * 16, 1.4, 3200);
                    bass(ctx, bus, time, midi(33), stepDur * 7, 0.7);
                }
                if (inBar === 8) bass(ctx, bus, time, midi(36), stepDur * 7, 0.7);
            } else {
                if (!stripped && inBar % 8 === 0) kick(ctx, bus, time, 0.7);
                if (inBar === 4 || inBar === 12) snare(ctx, bus, time, stripped ? 0.5 : 0.6);
                if (!stripped && inBar % 2 === 0) hat(ctx, bus, time, 0.3);
                if (inBar === 0) pad(ctx, bus, time, [midi(57), midi(60), midi(64)], stepDur * 16, stripped ? 0.6 : 0.9, 1200);
            }
        });
        return () => {
            seq.stop();
            clock.current = null;
            setBar(-1);
            fadeOut(ctx, bus);
        };
    });

    useFrame(player.playing, () => {
        const c = clock.current;
        if (!c) return;
        const elapsed = c.ctx.currentTime - c.start;
        if (elapsed >= 0) setBar(Math.floor(elapsed / c.barDur) % 4);
    });

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <div>
                {/* The last beat of bar 2 drops out of its line when it is left silent. */}
                <StepStrip
                    current={bar}
                    steps={[
                        { key: 'b1', label: 'Build' },
                        { key: 'b2', label: strip ? 'Build, thinned' : 'Build', part: gap ? 0.75 : 1, focus: gap || strip },
                        { key: 'd1', label: 'Drop' },
                        { key: 'd2', label: 'Drop' },
                    ]}
                />
                <p className="mt-2 text-xs leading-5 text-white/50">Four bars at 118 BPM: two of build, two of drop.</p>
            </div>
            <div>
                <Segmented
                    label="Before the drop"
                    value={gap ? 'gap' : strip ? 'strip' : 'none'}
                    onChange={(v) => {
                        setGap(v === 'gap');
                        setStrip(v === 'strip');
                    }}
                    options={[
                        { value: 'none', label: 'Keep playing' },
                        { value: 'strip', label: 'Remove layers' },
                        { value: 'gap', label: 'One beat of silence' },
                    ]}
                />
            </div>
        </div>
    );
}
