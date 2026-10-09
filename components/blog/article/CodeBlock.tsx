'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from './clipboard';

/**
 * A fenced block (an attribution line, a file name pattern). It wraps
 * instead of scrolling sideways, so the whole line is readable on a phone,
 * and a Copy button copies the exact text, byte for byte. Without
 * JavaScript the button is hidden and the text can be selected as usual.
 * The button's name says what it copies (the start of the text), so a
 * screen reader does not hear a bare "Copy" next to "Copy link".
 */
export function CodeBlock({ text }: { text: string }) {
    const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
    const start = text.trim().split(/\s+/).slice(0, 8).join(' ');
    const what = start.length < text.trim().length ? `${start.replace(/[,;:.]$/, '')}…` : start;

    const copy = () => {
        copyToClipboard(text)
            .then(() => setStatus('copied'))
            .catch(() => setStatus('failed'))
            .finally(() => window.setTimeout(() => setStatus('idle'), 2000));
    };

    return (
        <div className="my-8 rounded-[6px] border border-white/10 bg-[var(--surface)]">
            <pre className="whitespace-pre-wrap px-5 pb-2 pt-4 font-mono text-sm leading-6 text-white/85 [overflow-wrap:anywhere]">{text}</pre>
            <div className="flex justify-end px-2 pb-1 [@media(scripting:none)]:hidden print:hidden">
                <button
                    type="button"
                    onClick={copy}
                    className="vgp-focus inline-flex min-h-11 items-center gap-2 rounded-[4px] px-3 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                    {status === 'copied' ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                    <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy'}</span>
                    <span className="sr-only"> the text “{what}”</span>
                </button>
            </div>
        </div>
    );
}
