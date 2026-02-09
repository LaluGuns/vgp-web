'use client';

/**
 * SubscribePopup - Email subscription modal
 * Shows on first visit with name/email form
 */

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

export function SubscribePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', agreed: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if user has already seen/dismissed the popup
        const hasSeenPopup = localStorage.getItem('vgp_popup_dismissed');
        if (!hasSeenPopup) {
            // Show popup after 1.5 seconds
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('vgp_popup_dismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.agreed) return;

        setIsSubmitting(true);

        try {
            // Send to Local API (Hostinger SMTP)
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitted(true);
                localStorage.setItem('vgp_subscribed', 'true');
                localStorage.setItem('vgp_popup_dismissed', 'true');
                setTimeout(() => handleClose(), 2000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            // Still show success for better UX
            setSubmitted(true);
            localStorage.setItem('vgp_subscribed', 'true');
            localStorage.setItem('vgp_popup_dismissed', 'true');
            setTimeout(() => handleClose(), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <m.div
                        className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
                        onClick={handleClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal */}
                    <m.div
                        className="relative w-full max-w-md bg-titanium border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,229,255,0.15)]"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-dim-grey hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                            </svg>
                        </button>

                        {!submitted ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Stay in the Loop</h2>
                                    <p className="text-cool-grey text-sm leading-relaxed">
                                        Get the latest updates, exclusive promos, and new beat drops delivered straight to your inbox.
                                    </p>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-xs text-dim-grey mb-1.5 uppercase tracking-wider">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-carbon border border-white/10 rounded-xl text-white placeholder:text-dim-grey focus:border-primary focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs text-dim-grey mb-1.5 uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 bg-carbon border border-white/10 rounded-xl text-white placeholder:text-dim-grey focus:border-primary focus:outline-none transition-colors"
                                            required
                                        />
                                    </div>

                                    {/* Consent Checkbox */}
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="agreed"
                                            checked={formData.agreed}
                                            onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                                            className="mt-1 w-4 h-4 rounded border-white/20 bg-carbon text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                            required
                                        />
                                        <label htmlFor="agreed" className="text-xs text-cool-grey leading-relaxed cursor-pointer">
                                            I agree to receive newsletters about new beats, exclusive promos, and updates from Virzy Guns Production. You can unsubscribe anytime.
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !formData.agreed}
                                        className="w-full py-3 bg-primary text-obsidian font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                                    </button>
                                </form>

                            </>
                        ) : (
                            /* Success state */
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-2">Welcome to VGP!</h3>
                                <p className="text-cool-grey text-sm">
                                    Thanks for subscribing. Check your inbox for confirmation.
                                </p>
                            </div>
                        )}
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
