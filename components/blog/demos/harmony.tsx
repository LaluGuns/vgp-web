'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, midi, pad, pluck, sequence, type Engine } from './engine';
import { NoteRoll, PlayButton, Segmented, StepStrip, useFrame, usePlayer, type RollNote } from './ui';

type Ending = 'tonic' | 'dominant';

// C, Am, F, then G or C. The melody ends on the 2nd degree over G, or the 1st over C.
const BARS = [
    { chord: [60, 64, 67], root: 36, name: 'C' },
    { chord: [57, 60, 64], root: 33, name: 'Am' },
    { chord: [53, 57, 60], root: 29, name: 'F' },
];
const ENDINGS: Record<Ending, { chord: number[]; root: number; name: string; last: number }> = {
    dominant: { chord: [55, 59, 62], root: 31, name: 'G', last: 74 },
    tonic: { chord: [60, 64, 67], root: 36, name: 'C', last: 72 },
};
// One melody note per eighth, chord tones on the beats so it sits on each chord.
const PHRASE: number[][] = [
    [76, 0, 79, 0, 76, 0, 74, 0, 72, 0, 74, 0, 76, 0, 0, 0],
    [72, 0, 76, 0, 72, 0, 71, 0, 69, 0, 71, 0, 72, 0, 0, 0],
    [72, 0, 69, 0, 72, 0, 74, 0, 77, 0, 76, 0, 74, 0, 0, 0],
];

/** The melody on a 64-step roll: each note lasts until the next one, the last note of each bar a half note. */
const ROLL: RollNote[] = PHRASE.flatMap((bar, b) =>
    bar.flatMap((pitch, i) => {
        if (!pitch) return [];
        let len = 1;
        while (i + len < 16 && !bar[i + len] && len < 4) len++;
        return [{ at: b * 16 + i, len, pitch }];
    }),
);

/**
 * A four-bar phrase that ends on the home chord or stops on the
 * dominant. The same melody, a statement or a question.
 */
export function CadenceDemo() {
    const [ending, setEnding] = useState<Ending>('dominant');
    const live = useRef(ending);
    useEffect(() => {
        live.current = ending;
    }, [ending]);
    const [step, setStep] = useState(-1);
    const clock = useRef<{ ctx: AudioContext; start: number; stepDur: number } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.connect(out);
        const bpm = 84;
        const stepDur = 60 / bpm / 4;
        clock.current = { ctx, start: ctx.currentTime + 0.08, stepDur };
        const seq = sequence(ctx, bpm, 64, (step, time) => {
            const barNo = Math.floor(step / 16);
            const inBar = step % 16;
            const end = ENDINGS[live.current];
            const harmony = barNo < 3 ? BARS[barNo] : end;
            if (inBar === 0) {
                pad(ctx, bus, time, harmony.chord.map(midi), stepDur * 16, 1.1, 1500);
                bass(ctx, bus, time, midi(harmony.root), stepDur * 14, 0.5);
            }
            if (barNo < 3) {
                const n = PHRASE[barNo][inBar];
                if (n) pluck(ctx, bus, time, midi(n), stepDur * 1.8, 1.3);
            } else if (inBar === 0) {
                pluck(ctx, bus, time, midi(end.last), stepDur * 12, 1.4);
            }
        });
        return () => {
            seq.stop();
            clock.current = null;
            setStep(-1);
            fadeOut(ctx, bus);
        };
    });

    useFrame(player.playing, () => {
        const c = clock.current;
        if (!c) return;
        const elapsed = c.ctx.currentTime - c.start;
        if (elapsed >= 0) setStep(Math.floor(elapsed / c.stepDur) % 64);
    });

    const end = ENDINGS[ending];
    const bar = step < 0 ? -1 : Math.floor(step / 16);
    const last = ending === 'dominant' ? 'D, which leaves it open' : 'C, the home note';
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Phrase ending"
                    value={ending}
                    onChange={setEnding}
                    options={[
                        { value: 'dominant', label: 'Ends on V (G)' },
                        { value: 'tonic', label: 'Ends on I (C)' },
                    ]}
                />
            </div>
            <div className="space-y-2">
                <StepStrip current={bar} steps={[...BARS.map((b, i) => ({ key: `${i}`, label: b.name })), { key: 'end', label: end.name, focus: true }]} />
                <NoteRoll
                    notes={[...ROLL, { at: 48, len: 12, pitch: end.last, focus: true }]}
                    slots={64}
                    bars={[16, 32, 48]}
                    current={step}
                    label={`The melody over C, Am, F and ${end.name}. The last note is ${last}.`}
                />
            </div>
            <p className="text-sm leading-6 text-white/60">
                Stopping on G leaves the phrase asking a question, so the next phrase feels needed. Landing on C answers it.
            </p>
        </div>
    );
}
