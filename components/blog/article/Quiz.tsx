'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';
import type { QuizQuestion } from '@/lib/blog/types';

/**
 * Three questions at the end of an article. Picking an option only selects
 * it (arrow keys move between options as usual); "Check answer" locks the
 * question, shows the explanation and moves focus to it. Without
 * JavaScript, each question offers its answer in a "Show the answer" box
 * instead of a button that could never work.
 */
export function Quiz({ questions, id: headingId }: { questions: QuizQuestion[]; id?: string }) {
    const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
    const [checked, setChecked] = useState<boolean[]>(() => questions.map(() => false));
    const feedback = useRef<(HTMLParagraphElement | null)[]>([]);
    const heading = useRef<HTMLHeadingElement>(null);
    const id = useId();
    const titleId = headingId ?? `${id}-title`;
    const answered = checked.filter(Boolean).length;
    const correct = checked.filter((done, i) => done && picked[i] === questions[i].answer).length;

    const check = (qi: number) => (event: FormEvent) => {
        event.preventDefault();
        if (picked[qi] === null) return;
        setChecked((current) => current.map((c, i) => (i === qi ? true : c)));
        // Wait for the explanation to render, then read it out by moving focus to it.
        requestAnimationFrame(() => feedback.current[qi]?.focus());
    };

    const reset = () => {
        setPicked(questions.map(() => null));
        setChecked(questions.map(() => false));
        requestAnimationFrame(() => heading.current?.focus());
    };

    return (
        <section aria-labelledby={titleId} className="mt-16 border-t border-white/10 pt-10">
            <p className="mb-2 text-sm font-medium text-white/50">{questions.length} questions</p>
            <h2 id={titleId} ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-[-0.02em] text-white focus:outline-none sm:text-3xl">
                Check yourself
            </h2>
            <ol className="mt-8 space-y-10">
                {questions.map((question, qi) => {
                    const choice = picked[qi];
                    const done = checked[qi];
                    const right = done && choice === question.answer;
                    return (
                        <li key={qi}>
                            <form onSubmit={check(qi)}>
                                <fieldset disabled={done}>
                                    <legend className="text-lg font-medium leading-7 text-white">
                                        <span className="mr-2 tabular-nums text-white/55" aria-hidden="true">
                                            {qi + 1}.
                                        </span>
                                        {question.q}
                                    </legend>
                                    <div className="mt-4 space-y-2">
                                        {question.options.map((option, oi) => {
                                            const isAnswer = oi === question.answer;
                                            const isChoice = oi === choice;
                                            const state = !done ? (isChoice ? 'picked' : 'idle') : isAnswer ? 'right' : isChoice ? 'wrong' : 'rest';
                                            return (
                                                // The radio covers its whole option (transparent), so keyboard focus scrolls
                                                // the full option into view and draws its ring around it.
                                                <label
                                                    key={oi}
                                                    className={`relative flex items-start gap-3 rounded-[6px] border px-4 py-3 text-base leading-7 transition-colors ${
                                                        state === 'idle'
                                                            ? 'cursor-pointer border-white/10 text-white/80 hover:border-white/35 hover:text-white'
                                                            : state === 'picked'
                                                              ? 'cursor-pointer border-white/60 text-white'
                                                              : state === 'right'
                                                                ? 'border-white/70 text-white'
                                                                : state === 'wrong'
                                                                  ? 'border-white/20 text-white/55'
                                                                  : 'border-white/[0.06] text-white/55'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`${id}-${qi}`}
                                                        className="vgp-focus absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-[6px] bg-transparent disabled:cursor-default"
                                                        checked={isChoice}
                                                        onChange={() => setPicked((current) => current.map((p, i) => (i === qi ? oi : p)))}
                                                    />
                                                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
                                                        {state === 'right' ? (
                                                            <Check size={18} strokeWidth={2.5} />
                                                        ) : state === 'wrong' ? (
                                                            <X size={18} strokeWidth={2.5} />
                                                        ) : state === 'picked' ? (
                                                            <span className="h-3.5 w-3.5 rounded-full border-[4px] border-current" />
                                                        ) : (
                                                            <span className="h-3.5 w-3.5 rounded-full border border-current opacity-60" />
                                                        )}
                                                    </span>
                                                    <span>
                                                        {option}
                                                        {done && isAnswer ? <span className="sr-only"> (correct answer)</span> : null}
                                                        {done && isChoice ? <span className="sr-only"> (your answer)</span> : null}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                                {done ? (
                                    <p
                                        ref={(el) => {
                                            feedback.current[qi] = el;
                                        }}
                                        tabIndex={-1}
                                        className="vgp-focus mt-4 rounded-sm text-base leading-7 text-white/75"
                                    >
                                        <span className="font-semibold text-white">{right ? 'Right. ' : 'Not quite. '}</span>
                                        {question.why}
                                    </p>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={choice === null}
                                            className="vgp-focus mt-4 inline-flex min-h-11 items-center rounded-md border border-white/25 px-4 text-sm font-semibold text-white transition-colors hover:border-white/60 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/50 [@media(scripting:none)]:hidden"
                                        >
                                            Check answer
                                        </button>
                                        <details className="group mt-4 hidden [@media(scripting:none)]:block">
                                            <summary className="vgp-focus inline-flex min-h-11 cursor-pointer list-none items-center rounded-sm text-sm font-medium text-white/75 hover:text-white [&::-webkit-details-marker]:hidden">
                                                <span className="vgp-link group-open:hidden">Show the answer</span>
                                                <span className="vgp-link hidden group-open:inline">Hide the answer</span>
                                            </summary>
                                            <p className="mt-2 text-base font-semibold leading-7 text-white">{question.options[question.answer]}</p>
                                            <p className="mt-1 text-base leading-7 text-white/75">{question.why}</p>
                                        </details>
                                    </>
                                )}
                            </form>
                        </li>
                    );
                })}
            </ol>
            {/* Mounted from the start, so the final score is announced when it appears. */}
            <div className={answered === questions.length ? 'mt-10 flex min-h-11 flex-wrap items-center gap-x-6 gap-y-3' : ''}>
                <p className="text-base text-white" aria-live="polite">
                    {answered === questions.length ? `${correct} of ${questions.length} right.` : ''}
                </p>
                {answered === questions.length ? (
                    <button
                        type="button"
                        onClick={reset}
                        className="vgp-focus inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-white/75 hover:text-white"
                    >
                        <span className="vgp-link">Try again</span>
                    </button>
                ) : null}
            </div>
        </section>
    );
}
