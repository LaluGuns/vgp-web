'use client';

import { m } from 'framer-motion';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNewsletter } from '@/components/context/NewsletterContext';

interface RnDLockProps {
    children: ReactNode;
    variant?: 'studio' | 'lab';
    moduleName?: string;
    status?: string;
    eta?: string;
    showWaitlist?: boolean;
}

export function RnDLock({
    children,
    variant = 'lab',
    moduleName = 'Unknown module',
    status = 'In development',
    eta,
    showWaitlist = true,
}: RnDLockProps) {
    const { openPopup } = useNewsletter();
    const isStudio = variant === 'studio';
    const accentClass = isStudio ? 'text-sky-100' : 'text-cyan-100';
    const accentBorderClass = isStudio ? 'border-sky-200/25' : 'border-cyan-200/25';

    return (
        <div className="relative h-full overflow-hidden rounded-lg">
            <div className="h-full select-none opacity-25" aria-hidden="true" inert>
                {children}
            </div>

            <m.div
                role="status"
                aria-label={`${moduleName}. ${status}. Access is pre-launch.${eta ? ` Expected ${eta}.` : ''}`}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border border-white/[0.1] bg-[#03080d]/90 px-5 py-7 text-center backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
            >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg border bg-white/[0.035] ${accentBorderClass} ${accentClass}`}>
                    <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                </div>

                <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>Pre-launch access</p>
                <h3 className="mt-3 max-w-[18rem] text-base font-semibold leading-6 text-white">{moduleName}</h3>
                <p className="mt-2 text-sm text-white/70">{status}</p>
                {eta ? <p className="mt-1 text-xs text-white/50">Expected {eta}</p> : null}

                {showWaitlist ? (
                    <button
                        type="button"
                        onClick={openPopup}
                        className={`mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border bg-white/[0.035] px-4 py-2.5 text-sm font-semibold transition hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 ${accentBorderClass} ${accentClass}`}
                    >
                        Join waitlist
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                ) : null}
            </m.div>
        </div>
    );
}
