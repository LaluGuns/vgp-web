'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useNewsletter } from '@/components/context/NewsletterContext';

export function SubscribePopup() {
    const { isOpen, openPopup, closePopup } = useNewsletter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Auto-show logic (only if not manually opened/closed)
    useEffect(() => {
        const hasSubscribed = localStorage.getItem('vgp_newsletter_subscribed');
        const hasSeenPopup = sessionStorage.getItem('vgp_popup_seen');

        if (!hasSubscribed && !hasSeenPopup && !isOpen) {
            const timer = setTimeout(() => {
                openPopup();
                sessionStorage.setItem('vgp_popup_seen', 'true');
            }, 10000); // Show after 10s (delayed for better UX)

            return () => clearTimeout(timer);
        }
    }, [openPopup, isOpen]);

    const handleClose = () => {
        closePopup();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            // Updated to use Local Next.js API Route for Hostinger SMTP
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'VGP Subscriber', // Default name or add field if needed
                    email: email,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                localStorage.setItem('vgp_newsletter_subscribed', 'true');
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
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Popup Card */}
                    <m.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)]"
                    >
                        {/* Artistic Header */}
                        <div className="relative h-32 bg-zinc-900 overflow-hidden">
                            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                            <div className="absolute bottom-4 left-6">
                                <p className="mono-label text-primary text-xs mb-1">VGP INNER CIRCLE</p>
                                <h3 className="text-xl font-bold text-white tracking-wide">Join the Movement</h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Get exclusive access to <strong className="text-primary">Free Beats</strong>, HealingWave updates, and production tips.
                                No spam, just pure signal.
                            </p>

                            {status === 'success' ? (
                                <m.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center"
                                >
                                    <p className="text-green-400 font-semibold mb-1">Welcome aboard! 🚀</p>
                                    <p className="text-gray-400 text-xs">Check your email for confirmation.</p>
                                </m.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your best email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-400 text-xs">{errorMessage}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'loading' ? (
                                            <span className="animate-pulse">Processing...</span>
                                        ) : (
                                            <>
                                                <span>JOIN NOW</span>
                                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-[10px] text-gray-600">
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
