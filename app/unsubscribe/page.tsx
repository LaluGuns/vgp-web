'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { founderEmail } from '@/lib/founder-contact';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        token ? 'loading' : 'error'
    );
    const [message, setMessage] = useState(
        token
            ? 'Removing your email address from the list.'
            : 'This page needs the unsubscribe link from the bottom of a VGP email. Open that link to finish.'
    );
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!token) return;

        const runUnsubscribe = async () => {
            try {
                const res = await fetch('/api/newsletter/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    setStatus('success');
                    setEmail(data.email);
                    setMessage(data.message || 'You have been successfully unsubscribed.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Invalid or expired unsubscribe link.');
                }
            } catch {
                setStatus('error');
                setMessage('The request did not reach the server. Check your connection and open the link again.');
            }
        };

        runUnsubscribe();
    }, [token]);

    return (
        <div className="mx-auto max-w-xl" role="status" aria-live="polite">
            {status === 'loading' && (
                <>
                    <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                        Unsubscribing…
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-white/70">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                        You are unsubscribed.
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-white/75">
                        {email ? (
                            <>
                                <span className="text-white">{email}</span> will not get VGP emails anymore.
                            </>
                        ) : (
                            message
                        )}
                    </p>
                    <p className="mt-4 text-base leading-7 text-white/60">
                        Changed your mind? You can sign up again from any page on the site.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                        <TextLink href="/studio/beats">Browse beats</TextLink>
                        <TextLink href="/">Go to the home page</TextLink>
                    </div>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                        That link did not work.
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-white/75">{message}</p>
                    <p className="mt-4 text-base leading-7 text-white/60">
                        Reply to any VGP email or write to{' '}
                        <TextLink href={`mailto:${founderEmail}`} inline>
                            {founderEmail}
                        </TextLink>{' '}
                        and you will be removed by hand.
                    </p>
                    <div className="mt-9">
                        <TextLink href="/">Go to the home page</TextLink>
                    </div>
                </>
            )}
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <main className="editorial-shell min-h-[70vh] px-4 pb-24 pt-10 text-white sm:px-6 sm:pt-14">
            <Suspense
                fallback={
                    <div className="mx-auto max-w-xl">
                        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                            Unsubscribing…
                        </h1>
                    </div>
                }
            >
                <UnsubscribeContent />
            </Suspense>
        </main>
    );
}
