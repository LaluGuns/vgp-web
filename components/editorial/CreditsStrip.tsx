import type { ReactNode } from 'react';
import { catalogCredentials } from '@/lib/vgp-ecosystem';

export const MUSO_PROFILE_URL = catalogCredentials[0].href;

/**
 * Full-width row of the verified Muso.ai credits. Every number links back to
 * the public profile, so the claim can be checked.
 */
export function CreditsStrip({
    heading,
    id = 'credits-heading',
    className = '',
}: {
    heading?: ReactNode;
    id?: string;
    className?: string;
}) {
    return (
        <section aria-labelledby={id} className={`border-y border-white/10 px-4 sm:px-6 ${className}`}>
            <div className="mx-auto flex max-w-7xl flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
                <h2 id={id} className="text-sm text-white/60">
                    {heading ?? (
                        <>
                            Verified credits on{' '}
                            <a
                                href={MUSO_PROFILE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                            >
                                Muso.ai
                            </a>
                        </>
                    )}
                </h2>
                <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:gap-x-14">
                    {catalogCredentials.map((item) => (
                        <div key={item.label}>
                            <dt className="text-xs text-white/55">{item.label}</dt>
                            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
