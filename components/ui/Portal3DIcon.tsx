'use client';

/**
 * Portal3DIcon — Custom animated 3D-style icons for each portal section.
 * Built with pure CSS 3D transforms + SVG — no external dependencies.
 * Each icon is unique and representative of its portal's purpose.
 */

import { useEffect, useRef } from 'react';

type PortalId = 'studio' | 'lab' | 'masterclass' | 'blog' | 'about';

interface Portal3DIconProps {
    portalId: PortalId;
    color: string;
    size?: number;
    className?: string;
}

/* ─── STUDIO ICON: Vinyl Record + Waveform ─── */
function StudioIcon({ color, size }: { color: string; size: number }) {
    return (
        <div className="portal-icon-wrapper" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-icon-svg">
                {/* Outer vinyl ring */}
                <circle cx="100" cy="100" r="88" stroke={color} strokeWidth="2" strokeOpacity="0.3" className="animate-spin-slow" style={{ transformOrigin: 'center' }} />
                <circle cx="100" cy="100" r="78" stroke={color} strokeWidth="1" strokeOpacity="0.15" className="animate-spin-slow" style={{ transformOrigin: 'center', animationDirection: 'reverse' }} />

                {/* Grooves */}
                <circle cx="100" cy="100" r="68" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3 5" className="animate-spin-slow" style={{ transformOrigin: 'center' }} />
                <circle cx="100" cy="100" r="58" stroke={color} strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="2 4" className="animate-spin-slow" style={{ transformOrigin: 'center', animationDirection: 'reverse' }} />

                {/* Center label */}
                <circle cx="100" cy="100" r="22" fill={`${color}15`} stroke={color} strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="100" cy="100" r="4" fill={color} fillOpacity="0.6" />

                {/* Waveform bars animating */}
                {[...Array(7)].map((_, i) => {
                    const x = 65 + i * 10;
                    const heights = [16, 28, 38, 45, 35, 24, 14];
                    return (
                        <rect
                            key={i}
                            x={x}
                            y={100 - heights[i] / 2}
                            width="4"
                            height={heights[i]}
                            rx="2"
                            fill={color}
                            fillOpacity="0.5"
                            className="animate-waveform"
                            style={{ animationDelay: `${i * 0.12}s` }}
                        />
                    );
                })}

                {/* Musical note floating */}
                <g className="animate-float" style={{ transformOrigin: '155px 40px' }}>
                    <path d="M155 50V28l18-6v6l-14 4.5V52a6 6 0 11-4-5.6z" fill={color} fillOpacity="0.5" />
                </g>
            </svg>
        </div>
    );
}

/* ─── LAB ICON: DNA Helix + Frequency Wave ─── */
function LabIcon({ color, size }: { color: string; size: number }) {
    return (
        <div className="portal-icon-wrapper" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-icon-svg">
                {/* Sine wave */}
                <path
                    d="M20 100 Q50 50 80 100 T140 100 T200 100"
                    stroke={color}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    fill="none"
                    className="animate-wave-path"
                />
                <path
                    d="M0 100 Q30 140 60 100 T120 100 T180 100"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeOpacity="0.2"
                    fill="none"
                    className="animate-wave-path"
                    style={{ animationDelay: '0.5s' }}
                />

                {/* DNA strands */}
                <g className="animate-dna-rotate" style={{ transformOrigin: '100px 100px' }}>
                    {[...Array(8)].map((_, i) => {
                        const y = 25 + i * 22;
                        const phase = Math.sin(i * 0.8) * 25;
                        return (
                            <g key={i}>
                                <circle cx={100 + phase} cy={y} r="4" fill={color} fillOpacity={0.3 + i * 0.06} />
                                <circle cx={100 - phase} cy={y} r="4" fill={color} fillOpacity={0.3 + i * 0.06} />
                                <line x1={100 + phase} y1={y} x2={100 - phase} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.15" strokeDasharray="3 3" />
                            </g>
                        );
                    })}
                </g>

                {/* Pulse circle */}
                <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="1" strokeOpacity="0.2" className="animate-pulse-ring" />
                <circle cx="100" cy="100" r="8" fill={color} fillOpacity="0.3" className="animate-pulse-core" />

                {/* Frequency label */}
                <text x="100" y="165" textAnchor="middle" fill={color} fillOpacity="0.25" fontSize="8" fontFamily="monospace" letterSpacing="3">432 Hz</text>
            </svg>
        </div>
    );
}

/* ─── MASTERCLASS ICON: Graduation Cap + Knowledge Grid ─── */
function MasterclassIcon({ color, size }: { color: string; size: number }) {
    return (
        <div className="portal-icon-wrapper" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-icon-svg">
                {/* 3D cube wireframe */}
                <g className="animate-rotate-3d" style={{ transformOrigin: '100px 90px' }}>
                    {/* Front face */}
                    <path d="M65 65 L135 65 L135 115 L65 115 Z" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" fill={`${color}08`} />
                    {/* Top face */}
                    <path d="M65 65 L85 45 L155 45 L135 65 Z" stroke={color} strokeWidth="1" strokeOpacity="0.2" fill={`${color}05`} />
                    {/* Right face */}
                    <path d="M135 65 L155 45 L155 95 L135 115 Z" stroke={color} strokeWidth="1" strokeOpacity="0.2" fill={`${color}05`} />
                </g>

                {/* Graduation cap */}
                <g className="animate-float">
                    <polygon points="100,50 140,70 100,90 60,70" fill={`${color}25`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
                    <line x1="100" y1="90" x2="100" y2="110" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
                    <circle cx="100" cy="112" r="3" fill={color} fillOpacity="0.4" />
                    <line x1="140" y1="70" x2="140" y2="95" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
                    <path d="M80 82 Q100 95 120 82" stroke={color} strokeWidth="1" strokeOpacity="0.2" fill="none" />
                </g>

                {/* Orbiting particles */}
                {[0, 1, 2].map((i) => (
                    <circle
                        key={i}
                        cx="100"
                        cy="100"
                        r="3"
                        fill={color}
                        fillOpacity="0.4"
                        className="animate-orbit"
                        style={{ animationDelay: `${i * 1.2}s`, transformOrigin: '100px 100px' }}
                    />
                ))}

                {/* Knowledge grid dots */}
                {[...Array(5)].map((_, row) =>
                    [...Array(5)].map((_, col) => (
                        <circle
                            key={`${row}-${col}`}
                            cx={55 + col * 22}
                            cy={135 + row * 12}
                            r="1.5"
                            fill={color}
                            fillOpacity={0.08 + (row + col) * 0.02}
                        />
                    ))
                )}
            </svg>
        </div>
    );
}

/* ─── BLOG ICON: Terminal / Article + Cursor ─── */
function BlogIcon({ color, size }: { color: string; size: number }) {
    return (
        <div className="portal-icon-wrapper" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-icon-svg">
                {/* Terminal window */}
                <rect x="35" y="40" width="130" height="120" rx="8" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" fill={`${color}06`} />
                {/* Title bar */}
                <line x1="35" y1="58" x2="165" y2="58" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
                <circle cx="50" cy="49" r="3" fill={color} fillOpacity="0.3" />
                <circle cx="60" cy="49" r="3" fill={color} fillOpacity="0.2" />
                <circle cx="70" cy="49" r="3" fill={color} fillOpacity="0.1" />

                {/* Code/text lines */}
                <rect x="50" y="70" width="45" height="3" rx="1.5" fill={color} fillOpacity="0.35" />
                <rect x="50" y="80" width="80" height="3" rx="1.5" fill={color} fillOpacity="0.2" />
                <rect x="50" y="90" width="65" height="3" rx="1.5" fill={color} fillOpacity="0.15" />
                <rect x="50" y="100" width="90" height="3" rx="1.5" fill={color} fillOpacity="0.2" />
                <rect x="50" y="110" width="50" height="3" rx="1.5" fill={color} fillOpacity="0.12" />
                <rect x="50" y="120" width="70" height="3" rx="1.5" fill={color} fillOpacity="0.18" />

                {/* Blinking cursor */}
                <rect x="50" y="132" width="2" height="12" fill={color} fillOpacity="0.6" className="animate-cursor-blink" />

                {/* Floating code brackets */}
                <g className="animate-float" style={{ animationDelay: '0.3s' }}>
                    <text x="155" y="38" fill={color} fillOpacity="0.2" fontSize="20" fontFamily="monospace">{'{'}</text>
                </g>
                <g className="animate-float" style={{ animationDelay: '0.8s' }}>
                    <text x="25" y="170" fill={color} fillOpacity="0.15" fontSize="20" fontFamily="monospace">{'}'}</text>
                </g>

                {/* Data stream particles */}
                {[...Array(4)].map((_, i) => (
                    <circle
                        key={i}
                        cx={170}
                        cy={65 + i * 25}
                        r="2"
                        fill={color}
                        fillOpacity="0.3"
                        className="animate-data-stream"
                        style={{ animationDelay: `${i * 0.4}s` }}
                    />
                ))}
            </svg>
        </div>
    );
}

/* ─── ABOUT ICON: Person / Shield Identity ─── */
function AboutIcon({ color, size }: { color: string; size: number }) {
    return (
        <div className="portal-icon-wrapper" style={{ width: size, height: size }}>
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="portal-icon-svg">
                {/* Shield outline */}
                <path
                    d="M100 30 L150 55 L150 110 Q150 150 100 175 Q50 150 50 110 L50 55 Z"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeOpacity="0.25"
                    fill={`${color}05`}
                    className="animate-shield-pulse"
                />
                <path
                    d="M100 40 L142 60 L142 108 Q142 142 100 163 Q58 142 58 108 L58 60 Z"
                    stroke={color}
                    strokeWidth="0.5"
                    strokeOpacity="0.1"
                    fill="none"
                />

                {/* Person silhouette */}
                <circle cx="100" cy="80" r="16" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" fill={`${color}10`} />
                <path d="M72 130 Q72 108 100 108 Q128 108 128 130" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" fill={`${color}08`} />

                {/* Signal rings */}
                <circle cx="100" cy="95" r="40" stroke={color} strokeWidth="0.5" strokeOpacity="0.1" className="animate-pulse-ring" />
                <circle cx="100" cy="95" r="55" stroke={color} strokeWidth="0.5" strokeOpacity="0.06" className="animate-pulse-ring" style={{ animationDelay: '0.5s' }} />

                {/* Orbiting badge dots */}
                {[0, 1, 2, 3].map(i => (
                    <circle
                        key={i}
                        cx="100"
                        cy="95"
                        r="2.5"
                        fill={color}
                        fillOpacity="0.3"
                        className="animate-orbit"
                        style={{ animationDelay: `${i * 0.9}s`, transformOrigin: '100px 95px' }}
                    />
                ))}

                {/* ID tag */}
                <text x="100" y="155" textAnchor="middle" fill={color} fillOpacity="0.2" fontSize="7" fontFamily="monospace" letterSpacing="4">VGP</text>
            </svg>
        </div>
    );
}

/* ─── MAIN EXPORT ─── */
export function Portal3DIcon({ portalId, color, size = 160, className = '' }: Portal3DIconProps) {
    const icons: Record<PortalId, JSX.Element> = {
        studio: <StudioIcon color={color} size={size} />,
        lab: <LabIcon color={color} size={size} />,
        masterclass: <MasterclassIcon color={color} size={size} />,
        blog: <BlogIcon color={color} size={size} />,
        about: <AboutIcon color={color} size={size} />,
    };

    return (
        <div className={`relative ${className}`} style={{ width: size, height: size }}>
            {/* Ambient glow behind the icon */}
            <div
                className="absolute inset-0 rounded-full blur-[60px] opacity-25 pointer-events-none -z-10"
                style={{ backgroundColor: color }}
            />
            {icons[portalId]}
        </div>
    );
}
