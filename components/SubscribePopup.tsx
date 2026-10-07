'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNewsletter } from '@/components/context/NewsletterContext';

export function SubscribePopup() {
    const { isOpen, closePopup } = useNewsletter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const requestControllerRef = useRef<AbortController | null>(null);
    const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pathname = usePathname();
    // subscriberName and tags feed segmentation in the founder dashboard, so
    // they stay fixed even when the visible copy changes.
    const popupCopy = (() => {
        if (pathname.startsWith('/cadenz')) {
            return {
                title: 'CADENZ updates by email',
                description: 'New tempo collections, app updates and running music from VGP.',
                button: 'Get CADENZ updates',
                subscriberName: 'CADENZ Waitlist',
                tags: ['cadenz'],
            };
        }

        if (pathname.startsWith('/healingwave')) {
            return {
                title: 'HealingWave updates',
                description: 'New releases, CADENZ and Flow updates, and what the research turns up.',
                button: 'Get updates',
                subscriberName: 'HealingWave Subscriber',
                tags: ['cadenz'],
            };
        }

        if (pathname.startsWith('/book') || pathname.startsWith('/books')) {
            return {
                title: 'Get the book launch email',
                description: 'One email when the Trap Edition guide comes out, plus new production articles.',
                button: 'Notify me',
                subscriberName: 'Book Waitlist',
                tags: ['book_buyer'],
            };
        }

        if (pathname.startsWith('/blog')) {
            return {
                title: 'New articles by email',
                description: 'Production notes from the studio when a new article goes up.',
                button: 'Get new articles',
                subscriberName: 'VGP Blog Subscriber',
                tags: [] as string[],
            };
        }

        return {
            title: 'Follow the build',
            description: 'News from Virzy Guns: HealingWave, CADENZ and Flow updates, new beats and the producer guides.',
            button: 'Get updates',
            subscriberName: 'VGP Subscriber',
            tags: [] as string[],
        };
    })();

    const handleClose = useCallback(() => {
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;

        if (successTimerRef.current) {
            clearTimeout(successTimerRef.current);
            successTimerRef.current = null;
        }

        closePopup();
        setStatus('idle');
        setErrorMessage('');
        setEmail('');
    }, [closePopup]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
                return;
            }

            if (e.key === 'Tab' && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
                );
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const activeElement = document.activeElement;

                if (!dialogRef.current.contains(activeElement)) {
                    e.preventDefault();
                    (e.shiftKey ? last : first).focus();
                    return;
                }

                if (e.shiftKey && activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleClose]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        const focusTimer = setTimeout(() => emailInputRef.current?.focus(), 80);

        return () => {
            clearTimeout(focusTimer);
            document.body.style.overflow = previousOverflow;
            const previouslyFocused = previouslyFocusedRef.current;
            previouslyFocusedRef.current = null;

            if (previouslyFocused?.isConnected) {
                setTimeout(() => previouslyFocused.focus(), 0);
            }
        };
    }, [isOpen]);

    useEffect(() => () => {
        requestControllerRef.current?.abort();
        if (successTimerRef.current) clearTimeout(successTimerRef.current);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');
        requestControllerRef.current?.abort();
        const controller = new AbortController();
        requestControllerRef.current = controller;

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: popupCopy.subscriberName,
                    email,
                    website: '',
                    tags: popupCopy.tags,
                }),
                signal: controller.signal,
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                localStorage.setItem('vgp_newsletter_subscribed_v2', 'true');
                successTimerRef.current = setTimeout(handleClose, 3000);
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Something went wrong.');
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            setStatus('error');
            setErrorMessage('Check your connection and try again.');
        } finally {
            if (requestControllerRef.current === controller) {
                requestControllerRef.current = null;
            }
        }
    };

    const statusMessage = status === 'loading'
        ? 'Subscription request is processing.'
        : status === 'success'
            ? 'You are on the list. Check your email for confirmation.'
            : status === 'error'
                ? errorMessage
                : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleClose}
                        aria-hidden="true"
                        className="absolute inset-0 bg-black/70"
                    />

                    <m.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="popup-title"
                        aria-describedby="popup-description"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="relative w-full max-w-md rounded-lg border border-white/10 bg-[#0a0e12] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] sm:p-8"
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close"
                            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-md text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>

                        <h2 id="popup-title" className="pr-10 text-2xl font-semibold leading-tight tracking-[-0.02em] text-white">
                            {popupCopy.title}
                        </h2>
                        <p id="popup-description" className="mt-3 text-sm leading-6 text-white/70">
                            {popupCopy.description}
                        </p>
                        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                            {statusMessage}
                        </p>

                        {status === 'success' ? (
                            <div className="mt-6 border-t border-white/10 pt-5">
                                <p className="font-semibold text-white">You are on the list.</p>
                                <p className="mt-1 text-sm text-white/65">Check your inbox for the confirmation email.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <input
                                    type="text"
                                    name="website"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    className="hidden"
                                    aria-hidden="true"
                                />
                                <div>
                                    <label htmlFor="newsletter-email" className="text-sm font-medium text-white">
                                        Email
                                    </label>
                                    <input
                                        ref={emailInputRef}
                                        id="newsletter-email"
                                        name="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        spellCheck={false}
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-invalid={status === 'error' ? true : undefined}
                                        aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                                        className="mt-2 w-full rounded-md border border-white/15 bg-[#050607] px-4 py-3 text-white placeholder-white/35 transition-colors focus:border-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                    />
                                </div>

                                {status === 'error' && (
                                    <p id="newsletter-error" className="text-sm text-red-300">
                                        <span className="font-semibold">Not sent.</span> {errorMessage}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e12] disabled:cursor-wait disabled:opacity-60"
                                >
                                    {status === 'loading' ? 'Sending…' : popupCopy.button}
                                </button>

                                <p className="text-xs leading-5 text-white/50">
                                    Every email has an unsubscribe link. See the{' '}
                                    <a href="/privacy" className="underline decoration-white/30 underline-offset-2 hover:text-white">
                                        privacy policy
                                    </a>
                                    .
                                </p>
                            </form>
                        )}
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
