'use client';

import { useEffect, useRef, useState } from 'react';
import { useChipRow } from '@/components/blog/paths/useChipRow';

/**
 * The sticky A-Z bar. It marks the letter being read (scroll position or a
 * #term deep link), keeps that letter in view when the bar scrolls sideways
 * on a phone, and fades its right edge while more letters sit past it.
 */
export function GlossaryLetters({ letters }: { letters: string[] }) {
    const row = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState('');
    useChipRow(row, current);

    useEffect(() => {
        const sections = letters.flatMap((letter) => {
            const section = document.getElementById(`letter-${letter}`)?.closest('section');
            return section ? [{ letter, section }] : [];
        });
        const inBand = new Set<Element>();
        // A letter is current while its section crosses a band just under the header and this bar.
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) inBand.add(entry.target);
                    else inBand.delete(entry.target);
                }
                const first = sections.find(({ section }) => inBand.has(section));
                if (first) setCurrent(first.letter);
            },
            { rootMargin: '-140px 0px -55% 0px' },
        );
        sections.forEach(({ section }) => observer.observe(section));
        return () => observer.disconnect();
    }, [letters]);

    return (
        <nav aria-label="Jump to letter" className="sticky top-16 z-10 -mx-4 border-y border-white/10 bg-[var(--bg)] sm:mx-0">
            <div ref={row} className="vgp-scroll flex gap-0.5 overflow-x-auto px-4 py-1.5 sm:flex-wrap sm:px-1.5">
                {letters.map((letter) => (
                    <a
                        key={letter}
                        href={`#letter-${letter}`}
                        aria-current={letter === current ? 'location' : undefined}
                        className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-white/[0.05] hover:text-white vgp-focus ${
                            letter === current ? 'bg-white/[0.07] text-white' : 'text-white/65'
                        }`}
                    >
                        {letter}
                    </a>
                ))}
            </div>
        </nav>
    );
}
