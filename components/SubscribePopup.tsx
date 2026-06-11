'use client';

import { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNewsletter } from '@/components/context/NewsletterContext';

export function SubscribePopup() {
    const { isOpen, openPopup, closePopup } = useNewsletter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const popupCopy = (() => {
        if (pathname.startsWith('/cadenz')) {
            return {
                eyebrow: 'CADENZ updates',
                title: 'Join the CADENZ waitlist',
                description:
                    'Get CADENZ release notes, HealingWave progress, and VGP music-tech updates. No spam, no hard selling.',
                button: 'Join CADENZ waitlist',
                subscriberName: 'CADENZ Waitlist',
            };
        }

        if (pathname.startsWith('/lab/healingwave')) {
            return {
                eyebrow: 'HealingWave updates',
                title: 'Join HealingWave updates',
                description:
                    'Get CADENZ progress, functional audio notes, and release updates from VGP. No spam, no hard selling.',
                button: 'Join updates',
                subscriberName: 'HealingWave Subscriber',
            };
        }

        if (pathname.startsWith('/book') || pathname.startsWith('/books') || pathname.startsWith('/blog')) {
            return {
                eyebrow: 'VGP Library',
                title: 'Join the book waitlist',
                description:
                    'Get the launch note for the Trap Edition guide, plus practical production articles from VGP. No spam, no hard selling.',
                button: 'Join book waitlist',
                subscriberName: 'Book Waitlist',
            };
        }

        return {
            eyebrow: 'VGP updates',
            title: 'Join VGP updates',
            description:
                'Get CADENZ release notes, new beats, books, and practical production updates from Virzy Guns. No spam, no hard selling.',
            button: 'Join updates',
            subscriberName: 'VGP Subscriber',
        };
    })();

    useEffect(() => {
        const hasSubscribed = localStorage.getItem('vgp_newsletter_subscribed_v2');
        const hasSeenPopup = sessionStorage.getItem('vgp_popup_seen_v2');

        if (pathname.startsWith('/blog')) return;

        if (!hasSubscribed && !hasSeenPopup && !isOpen) {
            const timer = setTimeout(() => {
                openPopup();
                sessionStorage.setItem('vgp_popup_seen_v2', 'true');
            }, 45000);

            return () => clearTimeout(timer);
        }
    }, [openPopup, isOpen, pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closePopup();
                return;
            }

            if (e.key === 'Tab' && isOpen && dialogRef.current) {
                const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
                );
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePopup]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => emailInputRef.current?.focus(), 80);
        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: popupCopy.subscriberName,
                    email,
                    website: '',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                localStorage.setItem('vgp_newsletter_subscribed_v2', 'true');
                setTimeout(() => {
                    closePopup();
                    setStatus('idle');
                    setEmail('');
                }, 3000);
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Something went wrong.');
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePopup}
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                    />

                    <m.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="popup-title"
                        aria-describedby="popup-description"
                        initial={{ opacity: 0, scale: 0.96, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 18 }}
                        className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-[#08090d] shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
                    >
                        <div className="relative border-b border-white/10 bg-white/[0.035] px-6 py-5">
                            <p className="mb-2 text-sm font-medium text-white/45">{popupCopy.eyebrow}</p>
                            <h3 id="popup-title" className="text-2xl font-semibold leading-tight text-white">
                                {popupCopy.title}
                            </h3>
                            <button
                                onClick={closePopup}
                                aria-label="Close dialog"
                                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            <p id="popup-description" className="mb-6 text-sm leading-7 text-white/58">
                                {popupCopy.description}
                            </p>

                            {status === 'success' ? (
                                <m.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center"
                                >
                                    <p className="mb-1 font-semibold text-emerald-800">You are on the list.</p>
                                    <p className="text-xs text-emerald-700">Check your email for confirmation.</p>
                                </m.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        name="website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        className="hidden"
                                        aria-hidden="true"
                                    />
                                    <div>
                                        <label htmlFor="newsletter-email" className="sr-only">
                                            Email address
                                        </label>
                                        <input
                                            ref={emailInputRef}
                                            id="newsletter-email"
                                            type="email"
                                            required
                                            placeholder="Enter your best email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 transition-colors focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-xs text-red-600">{errorMessage}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-semibold text-[#1d1d1f] transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {status === 'loading' ? (
                                            <span>Processing...</span>
                                        ) : (
                                            <>
                                                <span>{popupCopy.button}</span>
                                                <ArrowRight size={17} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs text-white/35">
                                        We respect your privacy. Unsubscribe at any time.
                                    </p>
                                </form>
                            )}
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );
}
