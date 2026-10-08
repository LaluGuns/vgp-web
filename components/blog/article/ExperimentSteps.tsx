'use client';

import { useEffect, useId, useState } from 'react';
import { Check } from 'lucide-react';

const STORAGE = 'vgp_experiment_steps';

function load(key: string): number[] {
    try {
        const all = JSON.parse(localStorage.getItem(STORAGE) || '{}') as Record<string, number[]>;
        return Array.isArray(all[key]) ? all[key] : [];
    } catch {
        return [];
    }
}

function save(key: string, done: number[]) {
    try {
        const all = JSON.parse(localStorage.getItem(STORAGE) || '{}') as Record<string, number[]>;
        if (done.length) all[key] = done;
        else delete all[key];
        localStorage.setItem(STORAGE, JSON.stringify(all));
    } catch {
        // Ticking steps still works for this visit without storage.
    }
}

/** A DAW experiment as a checklist the reader can tick off at the desk. */
export function ExperimentSteps({ steps, storageKey }: { steps: string[]; storageKey: string }) {
    const [done, setDone] = useState<number[]>([]);
    const id = useId();

    useEffect(() => {
        const saved = load(storageKey);
        if (saved.length) requestAnimationFrame(() => setDone(saved));
    }, [storageKey]);

    const toggle = (i: number) => {
        setDone((current) => {
            const next = current.includes(i) ? current.filter((n) => n !== i) : [...current, i].sort((a, b) => a - b);
            save(storageKey, next);
            return next;
        });
    };

    return (
        <div className="my-6">
            <ol className="space-y-1">
                {steps.map((step, i) => {
                    const checked = done.includes(i);
                    const inputId = `${id}-${i}`;
                    return (
                        <li key={i}>
                            <label
                                htmlFor={inputId}
                                className="group flex cursor-pointer gap-4 rounded-[6px] py-2.5 pr-2 transition-colors hover:bg-white/[0.03]"
                            >
                                <input
                                    id={inputId}
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={checked}
                                    onChange={() => toggle(i)}
                                />
                                <span
                                    aria-hidden="true"
                                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] ${
                                        checked ? 'border-white bg-white text-black' : 'border-white/30 text-white/60 group-hover:border-white/60'
                                    }`}
                                >
                                    {checked ? <Check size={14} strokeWidth={3} /> : i + 1}
                                </span>
                                <span
                                    className={`transition-colors ${checked ? 'text-white/55 line-through decoration-white/25' : 'text-white/85'}`}
                                    dangerouslySetInnerHTML={{ __html: step }}
                                />
                            </label>
                        </li>
                    );
                })}
            </ol>
            <p className="mt-4 text-sm text-white/50" aria-live="polite">
                {done.length === steps.length ? 'All steps done.' : `${done.length} of ${steps.length} steps done`}
            </p>
        </div>
    );
}
