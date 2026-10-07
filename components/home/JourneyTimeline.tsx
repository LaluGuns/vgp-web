'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type JourneyChapter = {
    marker: string;
    title: string;
    body: string;
    image: { src: string; alt: string; className?: string };
};

/**
 * Chapters scroll on the right while one image stays pinned on the left and
 * cross-fades to the chapter in view. On small screens each chapter carries
 * its own image instead.
 */
export function JourneyTimeline({ chapters }: { chapters: JourneyChapter[] }) {
    const [active, setActive] = useState(0);
    const chapterRefs = useRef<Array<HTMLLIElement | null>>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActive(Number((entry.target as HTMLElement).dataset.index));
                    }
                }
            },
            { rootMargin: '-45% 0px -45% 0px' },
        );
        chapterRefs.current.forEach((element) => element && observer.observe(element));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="hidden lg:col-span-5 lg:block">
                <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[6px] border border-white/10 bg-black">
                    {chapters.map((chapter, index) => (
                        <Image
                            key={chapter.image.src}
                            src={chapter.image.src}
                            alt={index === active ? chapter.image.alt : ''}
                            aria-hidden={index === active ? undefined : true}
                            fill
                            sizes="40vw"
                            className={`object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                chapter.image.className ?? ''
                            } ${index === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'}`}
                        />
                    ))}
                </div>
            </div>

            <ol className="relative lg:col-span-6 lg:col-start-7">
                {/* The rail fills up to the chapter in view. */}
                <span className="absolute bottom-0 left-[5px] top-2 w-px bg-white/10" aria-hidden="true" />
                <span
                    className="absolute left-[5px] top-2 w-px origin-top bg-sky-300 transition-transform duration-700 ease-out"
                    style={{ height: 'calc(100% - 0.5rem)', transform: `scaleY(${(active + 1) / chapters.length})` }}
                    aria-hidden="true"
                />
                {chapters.map((chapter, index) => (
                    <li
                        key={chapter.marker}
                        ref={(element) => {
                            chapterRefs.current[index] = element;
                        }}
                        data-index={index}
                        className="relative pb-16 pl-10 last:pb-0 lg:min-h-[60vh] lg:pb-0"
                    >
                        <span
                            className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border transition-colors duration-500 ${
                                index <= active ? 'border-sky-300 bg-sky-300' : 'border-white/30 bg-[#050607]'
                            }`}
                            aria-hidden="true"
                        />
                        <p className={`text-sm tabular-nums transition-colors duration-500 ${index === active ? 'text-sky-300' : 'text-white/50'}`}>
                            {chapter.marker}
                        </p>
                        <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                            {chapter.title}
                        </h3>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">{chapter.body}</p>
                        <div className="relative mt-8 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[6px] border border-white/10 bg-black lg:hidden">
                            <Image
                                src={chapter.image.src}
                                alt={chapter.image.alt}
                                fill
                                sizes="90vw"
                                className={`object-cover ${chapter.image.className ?? ''}`}
                            />
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
}
