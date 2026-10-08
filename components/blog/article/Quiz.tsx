'use client';

import { useId, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { QuizQuestion } from '@/lib/blog/types';

/** Three questions at the end of an article. Answers lock once picked. */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
    const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
    const id = useId();
    const answered = picked.filter((p) => p !== null).length;
    const correct = picked.filter((p, i) => p === questions[i].answer).length;

    return (
        <section aria-labelledby={`${id}-title`} className="mt-16 border-t border-white/10 pt-10">
            <p className="mb-2 text-sm font-medium text-white/50">{questions.length} questions</p>
            <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                Check yourself
            </h2>
            <ol className="mt-8 space-y-10">
                {questions.map((question, qi) => {
                    const choice = picked[qi];
                    const done = choice !== null;
                    return (
                        <li key={qi}>
                            <fieldset disabled={done}>
                                <legend className="text-lg font-medium leading-7 text-white">
                                    <span className="mr-2 tabular-nums text-white/55">{qi + 1}.</span>
                                    {question.q}
                                </legend>
                                <div className="mt-4 space-y-2">
                                    {question.options.map((option, oi) => {
                                        const isAnswer = oi === question.answer;
                                        const isChoice = oi === choice;
                                        const state = !done ? 'idle' : isAnswer ? 'right' : isChoice ? 'wrong' : 'rest';
                                        return (
                                            <label
                                                key={oi}
                                                className={`flex items-start gap-3 rounded-[6px] border px-4 py-3 text-base leading-7 transition-colors ${
                                                    state === 'idle'
                                                        ? 'cursor-pointer border-white/10 text-white/80 hover:border-white/35 hover:text-white'
                                                        : state === 'right'
                                                          ? 'border-white/70 text-white'
                                                          : state === 'wrong'
                                                            ? 'border-white/20 text-white/55'
                                                            : 'border-white/[0.06] text-white/55'
                                                } has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`${id}-${qi}`}
                                                    className="sr-only"
                                                    checked={isChoice}
                                                    onChange={() =>
                                                        setPicked((current) => current.map((p, i) => (i === qi ? oi : p)))
                                                    }
                                                />
                                                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
                                                    {state === 'right' ? (
                                                        <Check size={18} strokeWidth={2.5} />
                                                    ) : state === 'wrong' ? (
                                                        <X size={18} strokeWidth={2.5} />
                                                    ) : (
                                                        <span className="h-3.5 w-3.5 rounded-full border border-current opacity-60" />
                                                    )}
                                                </span>
                                                <span>{option}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </fieldset>
                            <div aria-live="polite">
                                {done ? (
                                    <p className="mt-4 text-base leading-7 text-white/75">
                                        <span className="font-semibold text-white">{choice === question.answer ? 'Right. ' : 'Not quite. '}</span>
                                        {question.why}
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ol>
            {answered === questions.length ? (
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite">
                    <p className="text-base text-white">
                        {correct} of {questions.length} right.
                    </p>
                    <button
                        type="button"
                        onClick={() => setPicked(questions.map(() => null))}
                        className="vgp-link text-sm font-medium text-white/75 hover:text-white"
                    >
                        Try again
                    </button>
                </div>
            ) : null}
        </section>
    );
}
