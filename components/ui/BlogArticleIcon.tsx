'use client';

import React from 'react';

interface BlogArticleIconProps {
    slug: string;
    category: string;
    size?: number;
    className?: string;
}

/* Category color mapping — matches BlogIndex CAT */
const CAT_COLORS: Record<string, { primary: string; accent: string }> = {
    'production-tips': { primary: '#00D4FF', accent: '#0066FF' },
    'licensing-guide': { primary: '#FF3CAC', accent: '#FF0066' },
    'genre-guides': { primary: '#FFD700', accent: '#FF6B00' },
};
const fallbackColor = { primary: '#00D4FF', accent: '#0066FF' };
const getColors = (cat: string) => CAT_COLORS[cat] ?? fallbackColor;

/**
 * Animated SVG icons for individual blog articles.
 * Each article gets a unique animated icon based on its slug.
 * Colors are derived from the article's category to stay consistent.
 */
export function BlogArticleIcon({ slug, category, size = 48, className = '' }: BlogArticleIconProps) {
    const { primary: c, accent: a } = getColors(category);

    const getIcon = () => {
        switch (slug) {
            case 'how-to-choose-the-perfect-beat':
                return <BeatSelectionIcon size={size} c={c} a={a} />;
            case 'essential-mixing-tips-for-home-recording':
                return <MixingConsoleIcon size={size} c={c} a={a} />;
            case 'understanding-bpm-and-key-matching':
                return <MetronomeIcon size={size} c={c} a={a} />;
            case 'beat-licensing-explained':
                return <LicenseDocIcon size={size} c={c} a={a} />;
            case 'what-rights-do-you-get-with-each-license':
                return <ShieldCheckIcon size={size} c={c} a={a} />;
            case 'commercial-use-vs-personal-use':
                return <BalanceScaleIcon size={size} c={c} a={a} />;
            case 'trap-beats-anatomy-of-the-perfect-808':
                return <Bass808Icon size={size} c={c} a={a} />;
            case 'cyberphonk-production-dark-melodies':
                return <CyberSkullIcon size={size} c={c} a={a} />;
            default:
                return getCategoryFallback(category, size, c, a);
        }
    };

    return (
        <div className={`blog-article-icon ${className}`} style={{ width: size, height: size }}>
            {getIcon()}
        </div>
    );
}

function getCategoryFallback(category: string, size: number, c: string, a: string) {
    switch (category) {
        case 'production-tips': return <MixingConsoleIcon size={size} c={c} a={a} />;
        case 'licensing-guide': return <LicenseDocIcon size={size} c={c} a={a} />;
        case 'genre-guides': return <Bass808Icon size={size} c={c} a={a} />;
        default: return <MixingConsoleIcon size={size} c={c} a={a} />;
    }
}

type P = { size: number; c: string; a: string };

// ── BEAT SELECTION (Headphones + Musical Note) ───────────────────────
function BeatSelectionIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Headphone arc */}
            <path d="M25 55 C25 30, 75 30, 75 55" stroke={c} strokeWidth="3" strokeLinecap="round"
                className="animate-float"
            />
            {/* Left earpad */}
            <rect x="20" y="52" width="10" height="18" rx="4" fill={c} opacity="0.3" stroke={c} strokeWidth="1.5" />
            {/* Right earpad */}
            <rect x="70" y="52" width="10" height="18" rx="4" fill={c} opacity="0.3" stroke={c} strokeWidth="1.5" />
            {/* Musical note */}
            <g className="animate-float" style={{ animationDelay: '0.3s' }}>
                <circle cx="45" cy="78" r="4" fill={a} opacity="0.8" />
                <line x1="49" y1="78" x2="49" y2="58" stroke={a} strokeWidth="2" />
                <line x1="49" y1="58" x2="58" y2="62" stroke={a} strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* Sound waves */}
            <path d="M58 42 C62 38, 62 48, 58 44" stroke={c} strokeWidth="1.5" opacity="0.5" className="animate-pulse-core" />
            <path d="M63 38 C69 32, 69 52, 63 46" stroke={c} strokeWidth="1.5" opacity="0.3" className="animate-pulse-core" style={{ animationDelay: '0.5s' }} />
        </svg>
    );
}

// ── MIXING CONSOLE (Sliders + VU Meter) ──────────────────────────────
function MixingConsoleIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Console body */}
            <rect x="15" y="25" width="70" height="55" rx="6" stroke={c} strokeWidth="2" opacity="0.4" />
            {/* Fader tracks */}
            {[30, 42, 54, 66].map((x, i) => (
                <g key={x}>
                    <line x1={x} y1="35" x2={x} y2="70" stroke={c} strokeWidth="1" opacity="0.3" />
                    <rect
                        x={x - 3} y={40 + i * 5} width="6" height="8" rx="1.5"
                        fill={c} opacity="0.7"
                        className="animate-waveform"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                </g>
            ))}
            {/* VU meter indicator */}
            <circle cx="50" cy="30" r="2" fill={a} className="animate-pulse-core" />
        </svg>
    );
}

// ── METRONOME (BPM/Key) ──────────────────────────────────────────────
function MetronomeIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Metronome body (triangle) */}
            <path d="M50 20 L30 80 L70 80 Z" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.08" />
            {/* Pendulum arm */}
            <line x1="50" y1="30" x2="38" y2="65" stroke={c} strokeWidth="2.5" strokeLinecap="round"
                className="blog-icon-pendulum"
            />
            {/* Pendulum weight */}
            <circle cx="38" cy="65" r="4" fill={c} opacity="0.8" className="blog-icon-pendulum" />
            {/* BPM text */}
            <text x="50" y="78" textAnchor="middle" fill={c} fontSize="8" fontFamily="monospace" opacity="0.6">BPM</text>
            {/* Tick marks */}
            <circle cx="44" cy="44" r="1.5" fill={a} opacity="0.4" className="animate-pulse-core" />
            <circle cx="56" cy="44" r="1.5" fill={a} opacity="0.4" className="animate-pulse-core" style={{ animationDelay: '0.5s' }} />
        </svg>
    );
}

// ── LICENSE DOCUMENT (Contract + Seal) ───────────────────────────────
function LicenseDocIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Document */}
            <rect x="25" y="15" width="50" height="65" rx="4" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.05" />
            {/* Folded corner */}
            <path d="M65 15 L75 25" stroke={c} strokeWidth="1.5" opacity="0.4" />
            <path d="M65 15 L65 25 L75 25" fill={c} fillOpacity="0.1" stroke={c} strokeWidth="1" />
            {/* Text lines */}
            {[30, 38, 46, 54].map((y, i) => (
                <line key={y} x1="32" y1={y} x2={60 - i * 5} y2={y}
                    stroke={c} strokeWidth="1.5" opacity={0.4 - i * 0.08}
                    className="animate-waveform" style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
            {/* Seal/stamp */}
            <circle cx="55" cy="68" r="8"
                stroke={a} strokeWidth="1.5" strokeDasharray="3 2"
                className="animate-spin-slow"
                style={{ transformOrigin: '55px 68px' }}
            />
            <text x="55" y="71" textAnchor="middle" fill={a} fontSize="6" fontFamily="monospace" opacity="0.8">✓</text>
        </svg>
    );
}

// ── SHIELD CHECK (Rights/Protection) ─────────────────────────────────
function ShieldCheckIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Shield */}
            <path
                d="M50 15 L75 30 L75 55 C75 70, 50 85, 50 85 C50 85, 25 70, 25 55 L25 30 Z"
                stroke={c} strokeWidth="2" fill={c} fillOpacity="0.06"
                className="animate-float"
            />
            {/* Check mark */}
            <path
                d="M38 52 L46 60 L62 42"
                stroke={a} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                className="animate-pulse-core"
            />
            {/* Glow ring */}
            <circle cx="50" cy="50" r="22" stroke={c} strokeWidth="1" opacity="0.2"
                className="animate-pulse-ring"
            />
        </svg>
    );
}

// ── BALANCE SCALE (Commercial vs Personal) ───────────────────────────
function BalanceScaleIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Pillar */}
            <line x1="50" y1="25" x2="50" y2="80" stroke={c} strokeWidth="2" />
            <rect x="40" y="78" width="20" height="4" rx="2" fill={c} opacity="0.5" />
            {/* Beam */}
            <line x1="25" y1="35" x2="75" y2="35" stroke={c} strokeWidth="2" strokeLinecap="round"
                className="blog-icon-balance"
            />
            {/* Left plate — commercial */}
            <path d="M20 38 L30 38 L28 50 L22 50 Z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15"
                className="blog-icon-balance"
            />
            {/* Right plate — personal */}
            <path d="M70 38 L80 38 L78 50 L72 50 Z" stroke={a} strokeWidth="1.5" fill={a} fillOpacity="0.15"
                className="blog-icon-balance"
            />
            {/* Dollar sign */}
            <text x="25" y="47" textAnchor="middle" fill={c} fontSize="7" fontFamily="monospace" opacity="0.7">$</text>
            {/* Person icon */}
            <circle cx="75" cy="43" r="2" fill={a} opacity="0.7" />
        </svg>
    );
}

// ── 808 BASS (Trap speaker) ──────────────────────────────────────────
function Bass808Icon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Speaker cone */}
            <circle cx="50" cy="45" r="25" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.05"
                className="animate-pulse-ring"
            />
            <circle cx="50" cy="45" r="15" stroke={c} strokeWidth="1.5" opacity="0.5" />
            <circle cx="50" cy="45" r="5" fill={c} opacity="0.6"
                className="animate-pulse-core" style={{ animationDelay: '0.3s' }}
            />
            {/* Bass wave below */}
            <path
                d="M20 78 Q30 68, 40 78 Q50 88, 60 78 Q70 68, 80 78"
                stroke={a} strokeWidth="2" strokeLinecap="round" opacity="0.5"
                className="animate-waveform"
            />
            {/* 808 label */}
            <text x="50" y="90" textAnchor="middle" fill={c} fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.4">808</text>
        </svg>
    );
}

// ── CYBER SKULL (Cyberphonk) ─────────────────────────────────────────
function CyberSkullIcon({ size, c, a }: P) {
    return (
        <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
            {/* Skull outline */}
            <path
                d="M30 55 C30 30, 70 30, 70 55 C70 65, 65 70, 60 72 L60 78 L40 78 L40 72 C35 70, 30 65, 30 55Z"
                stroke={c} strokeWidth="2" fill={c} fillOpacity="0.05"
                className="animate-float"
            />
            {/* Glowing eyes */}
            <rect x="37" y="45" width="8" height="5" rx="1" fill={a} opacity="0.9"
                className="animate-cursor-blink"
            />
            <rect x="55" y="45" width="8" height="5" rx="1" fill={a} opacity="0.9"
                className="animate-cursor-blink" style={{ animationDelay: '0.2s' }}
            />
            {/* Nose */}
            <path d="M48 56 L50 52 L52 56" stroke={c} strokeWidth="1" opacity="0.5" />
            {/* Teeth */}
            {[43, 47, 51, 55].map((x) => (
                <line key={x} x1={x} y1="72" x2={x} y2="78" stroke={c} strokeWidth="1" opacity="0.3" />
            ))}
            {/* Distortion waves */}
            <path d="M22 40 L28 38 L22 36" stroke={a} strokeWidth="1" opacity="0.3" className="animate-pulse-core" />
            <path d="M78 40 L72 38 L78 36" stroke={a} strokeWidth="1" opacity="0.3" className="animate-pulse-core" style={{ animationDelay: '0.5s' }} />
        </svg>
    );
}
