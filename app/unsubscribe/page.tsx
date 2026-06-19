'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your unsubscribe request...');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Missing unsubscribe token. If you want to unsubscribe, please click the link at the bottom of our emails.');
            return;
        }

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
            } catch (err) {
                setStatus('error');
                setMessage('A network error occurred. Please try again later.');
            }
        };

        runUnsubscribe();
    }, [token]);

    return (
        <div className="relative z-10 w-full max-w-md p-8 border border-white/10 rounded-2xl bg-zinc-950/60 backdrop-blur-xl shadow-2xl text-center">
            <h1 className="text-2xl font-bold tracking-wider text-cyan-400 mb-6 font-mono">
                VIRZY GUNS PRODUCTION
            </h1>

            {status === 'loading' && (
                <div className="space-y-4 py-8">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 font-mono text-sm">{message}</p>
                </div>
            )}

            {status === 'success' && (
                <div className="space-y-6 py-4">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-xl font-bold">
                        ✓
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-200 font-medium font-mono text-lg">Unsubscribed Successfully</p>
                        {email && <p className="text-gray-500 text-xs font-mono bg-zinc-900 py-1 px-3 rounded-md inline-block">{email}</p>}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        You have been removed from our Inner Circle mailing list. We're sorry to see you go.
                    </p>
                    <div className="pt-4">
                        <Link 
                            href="/studio/beats"
                            className="inline-block w-full py-3 px-6 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-sm transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
                        >
                            BROWSE BEATS
                        </Link>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="space-y-6 py-4">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-400 text-xl font-bold">
                        !
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-200 font-medium font-mono text-lg">Unsubscribe Failed</p>
                        <p className="text-rose-400/90 text-sm leading-relaxed px-2">{message}</p>
                    </div>
                    <div className="pt-4 space-y-3">
                        <Link 
                            href="/"
                            className="inline-block w-full py-3 px-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold font-mono text-sm transition-all duration-200"
                        >
                            GO TO HOME
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden px-4">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <Suspense fallback={
                <div className="relative z-10 w-full max-w-md p-8 border border-white/10 rounded-2xl bg-zinc-950/60 backdrop-blur-xl shadow-2xl text-center">
                    <h1 className="text-2xl font-bold tracking-wider text-cyan-400 mb-6 font-mono">
                        VIRZY GUNS PRODUCTION
                    </h1>
                    <div className="space-y-4 py-8">
                        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-400 font-mono text-sm">Loading...</p>
                    </div>
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
        </main>
    );
}
