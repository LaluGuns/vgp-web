'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, Send, Smartphone, Database, Mail, Gauge,
    Search, Plus, Pencil, Ban, Pause, Play, Radio, X, CheckCircle2,
    AlertTriangle, Loader2, RefreshCw, ShieldCheck, TrendingUp, Inbox,
    Bell, User, LogOut, Globe, Eye, Upload
} from 'lucide-react';
import { revealUp, staggerParent, staggerChild } from '@/lib/motion-presets';

// ── Types ──────────────────────────────────────────────────────────────
interface Stats { total: number; subscribed: number; unsubscribed: number; new24h: number; }
interface GrowthPoint { date: string; total: number; new: number; }
interface Subscriber {
    id: number;
    name: string;
    email: string;
    status: string;
    created_at: string;
    tags?: string[];
    first_name?: string;
    last_name?: string;
    account_type?: string;
    username?: string;
    user_profile?: string;
    location?: string;
    product_type?: string;
    license_name?: string;
    product_title?: string;
}
interface Campaign {
    id: number;
    subject: string;
    template_type: string;
    status: string;
    created_at: string;
    target_tags?: string[];
    sent_recipients?: number;
    opened_recipients?: number;
    clicked_recipients?: number;
    scheduled_for?: string | null;
}
interface HealthState {
    checkedAt: string;
    db: { ok: boolean; latencyMs: number | null; detail: string };
    smtp: { ok: boolean; configured: boolean; detail: string };
    queue: { pending: number; sending: number; failed: number; sentToday: number; activeCampaigns: number; lastDeliveryAt: string | null };
}
interface MetricSet {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    fcp: string;
    lcp: string;
    tbt: string;
    cls: string;
    speedIndex: string;
}
interface PerfMetrics {
    desktop: MetricSet | null;
    mobile: MetricSet | null;
    auditTime?: string;
    isMock?: boolean;
    unavailable?: boolean;
    score?: number;
    fcp?: string;
    lcp?: string;
    tbt?: string;
    cls?: string;
}

const standardTags = ['cadenz', 'beat_buyer', 'book_buyer'];
const tagLabelMap: Record<string, string> = {
    cadenz: 'CADENZ',
    beat_buyer: 'Beat Buyer',
    book_buyer: 'Book Buyer'
};

type TabKey = 'overview' | 'subscribers' | 'broadcasts' | 'seo' | 'cadenz';

function getDefaultNameFromEmail(email: string): string {
    if (!email || typeof email !== 'string') return 'Producer';
    const parts = email.split('@');
    if (parts.length < 2) return 'Producer';
    const username = parts[0];
    const cleanUsername = username.replace(/[._-]/g, ' ').trim();
    return cleanUsername
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Producer';
}

function getEmailPreviewHtml(subject: string, templateType: string, bodyContent: string, name: string, email: string = ''): string {
    const title = (subject || 'VGP BROADCAST').toUpperCase();
    const currentYear = new Date().getFullYear();
    const cleanName = name && name.trim() && name !== 'Producer'
        ? name.trim() 
        : (email ? getDefaultNameFromEmail(email) : 'Producer');
    let defaultBody = 'Write your email body…';
    if (!bodyContent || bodyContent.trim() === '') {
        if (templateType === 'beat_promo') {
            defaultBody = 'A new premium beat has just dropped in the studio. Get first access and special rates before public release.';
        } else if (templateType === 'cadenz_update') {
            defaultBody = 'We are pushing the boundaries of spatial audio and bio-resonance beat science. Check out our latest project logs.';
        } else if (templateType === 'book_reader') {
            defaultBody = 'The new production guide is ready. No fluff — just real technique and workflow breakdowns straight from the studio.';
        }
    } else {
        defaultBody = bodyContent;
    }

    const cleanBody = defaultBody
        .replace(/\{\{name\}\}/gi, cleanName)
        .replace(/\[Name\]/gi, cleanName);

    let mainContentHtml = '';

    if (templateType === 'beat_promo') {
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(0, 229, 255, 0.12); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    BEAT PROMO
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Yo ${cleanName},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanBody}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <span style="background-color: #00E5FF; background: linear-gradient(135deg, #00E5FF 0%, #008cff 100%); color: #030712; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.35); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    LISTEN & SECURE LICENSE
                </span>
            </div>
        `;
    } else if (templateType === 'cadenz_update') {
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(112, 0, 255, 0.12); color: #a855f7; border: 1px solid rgba(112, 0, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    CADENZ R&D
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanName} — quick CADENZ update.
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanBody}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <span style="background-color: #7000FF; background: linear-gradient(135deg, #7000FF 0%, #a855f7 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(112, 0, 255, 0.35); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    READ DEVELOPMENT LOG
                </span>
            </div>
        `;
    } else if (templateType === 'book_reader') {
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    VGP LIBRARY
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                What's good ${cleanName},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanBody}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <span style="background-color: #f59e0b; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #030712; padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    READ THE GUIDE
                </span>
            </div>
        `;
    } else { // inner_circle
        mainContentHtml = `
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 10px; background-color: rgba(255, 255, 255, 0.05); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3); padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                    INNER CIRCLE
                </span>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanName},
            </p>
            <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${cleanBody}
            </div>
            <div style="text-align: center; margin: 35px 0 15px 0;">
                <span style="background-color: #0c1220; color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.4); padding: 13px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.05); cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    ACCESS PRIVATE PORTAL
                </span>
            </div>
        `;
    }

    return `
        <div style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px 10px; min-height: 100%; box-sizing: border-box;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #060b13; border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); margin-top: 20px;">
                <!-- Glowing top border -->
                <tr>
                    <td height="4" style="background: linear-gradient(90deg, #00E5FF 0%, #7000FF 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="padding: 30px 25px; background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.04), transparent 75%);">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <div style="margin-bottom: 12px;">
                                <img src="/branding/logo-tg.png" alt="VGP" style="height: 48px; width: auto; max-width: 120px; object-fit: contain; display: inline-block;" />
                            </div>
                            <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 3px; margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">VIRZY GUNS PRODUCTION</h1>
                            <div style="color: #00E5FF; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">100% Art. 100% Science.</div>
                        </div>
                        
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-bottom: 25px; height: 1px;"></div>
                        
                        ${mainContentHtml}
                        
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-top: 30px; margin-bottom: 20px; height: 1px;"></div>
                        
                        <div style="text-align: center; font-size: 10px; color: #475569; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            © ${currentYear} Virzy Guns Production. All rights reserved.<br>
                            You are receiving this because you are part of the VGP Inner Circle.<br><br>
                            To stop receiving these emails, <span style="color: #00E5FF; text-decoration: underline; cursor: pointer; font-weight: 600;">unsubscribe here</span>.
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    `;
}

// ── Small UI helpers ───────────────────────────────────────────────────
function Eyebrow({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/55">{children}</p>;
}

function StatCard({ label, value, Icon, accent = 'text-white' }: { label: string; value: React.ReactNode; Icon: typeof Users; accent?: string }) {
    return (
        <motion.div variants={staggerChild} className="liquid-glass-soft rounded-lg p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/55">{label}</p>
                <Icon className="h-4 w-4 text-sky-200/40" aria-hidden="true" />
            </div>
            <p className={`mt-3 font-display text-3xl font-semibold ${accent}`}>{value}</p>
        </motion.div>
    );
}

function fmtDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function relativeTime(iso: string | null) {
    if (!iso) return 'never';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ── Real subscriber growth chart (data derived from created_at) ─────────
function GrowthChart({ data, loading }: { data: GrowthPoint[]; loading: boolean }) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    if (loading) {
        return (
            <div className="liquid-glass rounded-lg p-6">
                <Eyebrow>Subscriber growth</Eyebrow>
                <div className="mt-6 flex h-[170px] items-center justify-center text-white/40">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            </div>
        );
    }

    if (!data || data.length < 2) {
        return (
            <div className="liquid-glass rounded-lg p-6">
                <Eyebrow>Subscriber growth</Eyebrow>
                <div className="mt-6 flex h-[170px] flex-col items-center justify-center text-center">
                    <TrendingUp className="mb-3 h-6 w-6 text-sky-200/40" />
                    <p className="text-sm text-white/55">Not enough history yet.</p>
                    <p className="mt-1 text-xs text-white/35">The curve fills in from real signup dates as subscribers join.</p>
                </div>
            </div>
        );
    }

    const W = 600, H = 200, P = 24;
    const totals = data.map((d) => d.total);
    const max = Math.max(...totals);
    const min = Math.min(...totals);
    const range = max - min || 1;
    const xOf = (i: number) => P + (i * (W - 2 * P)) / (data.length - 1);
    const yOf = (v: number) => H - P - ((v - min) * (H - 2 * P)) / range;

    const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.total) }));
    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i - 1].x + pts[i].x) / 2;
        line += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${H - P} L ${pts[0].x} ${H - P} Z`;

    const gained = data[data.length - 1].total - data[0].total;
    const labelIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1];

    return (
        <div className="liquid-glass rounded-lg p-6">
            <div className="flex items-end justify-between">
                <div>
                    <Eyebrow>Subscriber growth</Eyebrow>
                    <p className="mt-2 font-display text-3xl font-semibold text-white">{data[data.length - 1].total}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-xs font-semibold text-sky-100">
                    <TrendingUp className="h-3.5 w-3.5" /> +{gained} / 30d
                </span>
            </div>

            <div className="relative mt-5">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Subscriber growth over the last 30 days">
                    <defs>
                        <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={area} fill="url(#growthFill)" />
                    <path d={line} fill="none" stroke="#7dd3fc" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    {hoverIdx !== null && (
                        <>
                            <line x1={pts[hoverIdx].x} y1={P / 2} x2={pts[hoverIdx].x} y2={H - P} stroke="rgba(125,211,252,0.4)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <circle cx={pts[hoverIdx].x} cy={pts[hoverIdx].y} r="4" fill="#030405" stroke="#7dd3fc" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </>
                    )}
                </svg>

                {/* hover hit-areas */}
                <div className="absolute inset-0 flex">
                    {data.map((_, i) => (
                        <div key={i} className="flex-1" onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
                    ))}
                </div>

                {hoverIdx !== null && (
                    <div
                        className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-md border border-white/10 bg-[#030405]/95 px-2.5 py-1.5 text-center shadow-lg"
                        style={{ left: `${(xOf(hoverIdx) / W) * 100}%` }}
                    >
                        <p className="text-xs font-semibold text-white">{data[hoverIdx].total} total</p>
                        <p className="text-[10px] text-sky-200/70">{fmtDate(data[hoverIdx].date)} · +{data[hoverIdx].new} new</p>
                    </div>
                )}
            </div>

            <div className="mt-2 flex justify-between text-[10px] text-white/35">
                {labelIdx.map((i) => <span key={i}>{fmtDate(data[i].date)}</span>)}
            </div>
        </div>
    );
}

function SeoChart({ data }: { data: any[] }) {
    if (!data || data.length < 2) return null;
    const W = 600, H = 100, P = 12;
    const clicks = data.map(d => d.clicks);
    const maxClicks = Math.max(...clicks);
    const minClicks = Math.min(...clicks);
    const rangeClicks = maxClicks - minClicks || 1;
    const xOf = (i: number) => P + (i * (W - 2 * P)) / (data.length - 1);
    const yOf = (v: number) => H - P - ((v - minClicks) * (H - 2 * P)) / rangeClicks;

    const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.clicks) }));
    let line = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const cx = (pts[i - 1].x + pts[i].x) / 2;
        line += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
    }
    const area = `${line} L ${pts[pts.length - 1].x} ${H - P} L ${pts[0].x} ${H - P} Z`;

    return (
        <div className="relative mt-2 h-[100px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="SEO Click growth over 30 days" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="seoFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#seoFill)" />
                <path d={line} fill="none" stroke="#38bdf8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
}

// ── Small ScoreGauge UI helper ─────────────────────────────────────────
function ScoreGauge({ score, label }: { score: number; label: string }) {
    const radius = 20;
    const circ = 2 * Math.PI * radius;
    let stroke = '#10b981'; // emerald-500
    if (score < 50) stroke = '#FF3B5C'; // red-500
    else if (score < 90) stroke = '#FFB800'; // amber-500
    const offset = circ - (score / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative h-12 w-12">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4.5" fill="none" />
                    <circle cx="25" cy="25" r={radius} stroke={stroke} strokeWidth="4.5" fill="none" strokeLinecap="round"
                        strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[11px] font-semibold text-white">{score}</span>
                </div>
            </div>
            <span className="text-[9px] font-medium tracking-tight text-white/55 text-center leading-tight whitespace-nowrap">{label}</span>
        </div>
    );
}

// ── PageSpeed gauge (real; honest unavailable state) ────────────────────
function PerformancePanel({ perf, loading, onRun }: { perf: PerfMetrics | null; loading: boolean; onRun: () => void }) {
    const [strategy, setStrategy] = useState<'desktop' | 'mobile'>('desktop');
    
    // Support legacy/fallback metrics format if we have old data
    const isLegacy = perf && (perf as any).score !== undefined;
    
    let activeMetrics: any = null;
    let unavailable = perf ? !!perf.unavailable : false;

    if (perf && !perf.unavailable) {
        if (isLegacy) {
            activeMetrics = {
                performance: (perf as any).score || 0,
                accessibility: 100,
                bestPractices: 100,
                seo: 100,
                fcp: (perf as any).fcp || 'N/A',
                lcp: (perf as any).lcp || 'N/A',
                tbt: (perf as any).tbt || 'N/A',
                cls: (perf as any).cls || 'N/A',
                speedIndex: 'N/A'
            };
        } else {
            const set = strategy === 'desktop' ? perf.desktop : perf.mobile;
            if (set) {
                activeMetrics = set;
            } else {
                unavailable = true;
            }
        }
    }

    return (
        <div className="liquid-glass flex h-full flex-col rounded-lg p-6">
            <div className="flex items-center justify-between">
                <Eyebrow>Site performance</Eyebrow>
                {perf && !unavailable && (
                    <div className="flex gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5">
                        <button
                            onClick={() => setStrategy('desktop')}
                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                                strategy === 'desktop' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
                            }`}
                        >
                            Desktop
                        </button>
                        <button
                            onClick={() => setStrategy('mobile')}
                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition ${
                                strategy === 'mobile' ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white'
                            }`}
                        >
                            Mobile
                        </button>
                    </div>
                )}
            </div>

            {perf === null && loading ? (
                <div className="flex flex-1 items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-sky-200/50" /></div>
            ) : unavailable || !activeMetrics ? (
                <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                    <AlertTriangle className="mb-3 h-6 w-6 text-amber-400/70" />
                    <p className="text-sm text-white/60">Audit unavailable</p>
                    <p className="mt-1 text-xs text-white/35">PageSpeed API did not respond. No score is shown rather than a guessed one.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-2 py-5 justify-items-center">
                        <ScoreGauge score={activeMetrics.performance} label="Performance" />
                        <ScoreGauge score={activeMetrics.accessibility} label="Accessibility" />
                        <ScoreGauge score={activeMetrics.bestPractices} label="Best Practices" />
                        <ScoreGauge score={activeMetrics.seo} label="SEO" />
                    </div>
                    <div className="space-y-2 text-xs">
                        {[
                            ['FCP', activeMetrics.fcp],
                            ['LCP', activeMetrics.lcp],
                            ['TBT', activeMetrics.tbt],
                            ['CLS', activeMetrics.cls],
                            ['Speed Index', activeMetrics.speedIndex]
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between border-b border-white/5 pb-1.5 text-white/55">
                                <span>{k}</span><span className="font-medium text-white">{v}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button onClick={onRun} disabled={loading}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 py-2 text-xs font-semibold text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/15 disabled:opacity-50">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {loading ? 'Running audit…' : 'Run Lighthouse audit'}
            </button>
        </div>
    );
}

// ── Real system health ──────────────────────────────────────────────────
function HealthRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
    return (
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
                {ok
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <AlertTriangle className="h-4 w-4 text-rose-400" />}
            </div>
            <p className={`mt-2 text-sm font-medium ${ok ? 'text-emerald-300/90' : 'text-rose-300/90'}`}>{ok ? 'Operational' : 'Attention'}</p>
            <p className="mt-1 break-words text-[11px] leading-relaxed text-white/40">{detail}</p>
        </div>
    );
}

function HealthPanel({ health, loading, onRefresh }: { health: HealthState | null; loading: boolean; onRefresh: () => void }) {
    return (
        <div className="liquid-glass rounded-lg p-6">
            <div className="mb-5 flex items-center justify-between">
                <Eyebrow>System health</Eyebrow>
                <button onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/45 transition hover:text-sky-100 disabled:opacity-50">
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {health ? `checked ${relativeTime(health.checkedAt)}` : 'check'}
                </button>
            </div>
            {!health ? (
                <div className="flex h-24 items-center justify-center text-white/40"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <HealthRow ok={health.db.ok} label="Database" detail={health.db.ok ? `Supabase · ${health.db.detail}` : health.db.detail} />
                    <HealthRow ok={health.smtp.ok} label="SMTP" detail={health.smtp.detail} />
                    <HealthRow
                        ok={health.queue.failed === 0}
                        label="Email queue"
                        detail={`${health.queue.pending} pending · ${health.queue.sending} sending · ${health.queue.failed} failed · ${health.queue.sentToday} sent today · last delivery ${relativeTime(health.queue.lastDeliveryAt)}`}
                    />
                </div>
            )}
        </div>
    );
}

interface SpamAnalysis {
    score: number;
    triggers: string[];
    risk: 'low' | 'medium' | 'high';
}

function analyzeSpamScore(body: string): SpamAnalysis {
    const triggers: string[] = [];
    let score = 0;
    
    if (!body || body.trim() === '') {
        return { score: 0, triggers: [], risk: 'low' };
    }

    const cleanBody = body.trim();

    // 1. Check ALL CAPS words count (at least 3 words, and more than 30% of words are CAPS)
    const words = cleanBody.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 3) {
        const capsWords = words.filter(w => /^[A-Z!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]+$/.test(w) && /[A-Z]/.test(w));
        if (capsWords.length / words.length > 0.3) {
            score += 2;
            triggers.push('Excessive ALL CAPS words');
        }
    }

    // 2. Excessive exclamation marks
    if (/!!!|!{4,}/.test(cleanBody)) {
        score += 1.5;
        triggers.push('Excessive exclamation marks (e.g. "!!!")');
    }

    // 3. Known spam trigger phrases
    const spamPhrases = [
        "free", "buy now", "limited time", "act now", "click here", 
        "congratulations", "winner", "guaranteed", "no obligation", 
        "make money", "get paid", "earn cash", "special offer", "risk free"
    ];
    let foundPhrasesCount = 0;
    const bodyLower = cleanBody.toLowerCase();
    spamPhrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (regex.test(bodyLower)) {
            foundPhrasesCount++;
        }
    });
    if (foundPhrasesCount > 0) {
        score += foundPhrasesCount * 1;
        const matched = spamPhrases.filter(p => new RegExp(`\\b${p}\\b`, 'gi').test(bodyLower));
        triggers.push(`Contains spam trigger phrase(s): ${matched.join(', ')}`);
    }

    // 4. Missing personalization
    if (!/\{\{\s*name\s*\}\}/i.test(cleanBody) && !/\[\s*Name\s*\]/i.test(cleanBody)) {
        score += 2;
        triggers.push('Missing {{name}} or [Name] personalization tag');
    }

    // 5. Very short body (< 50 chars)
    if (cleanBody.length < 50) {
        score += 1;
        triggers.push('Very short email content (< 50 characters)');
    }

    // 6. Body contains only links
    const linkRegex = /https?:\/\/[^\s]+/g;
    const links = cleanBody.match(linkRegex) || [];
    const textWithoutLinks = cleanBody.replace(linkRegex, '').replace(/\s+/g, '').trim();
    if (links.length > 0 && textWithoutLinks.length < 15) {
        score += 3;
        triggers.push('Email contains mostly/only links');
    }

    let risk: 'low' | 'medium' | 'high' = 'low';
    if (score >= 6) {
        risk = 'high';
    } else if (score >= 3) {
        risk = 'medium';
    }

    return { score, triggers, risk };
}

// ════════════════════════════════════════════════════════════════════════
export default function FounderDashboardClient() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [passcode, setPasscode] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreetingAndClock = () => {
        if (!currentTime) return { greeting: 'Good-morning', timeString: '--:-- --/--' };
        const hours = currentTime.getHours();
        let greeting = 'Good-morning';
        if (hours >= 12 && hours < 18) {
            greeting = 'Good-afternoon';
        } else if (hours >= 18 || hours < 5) {
            greeting = 'Good-evening';
        }

        const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = currentTime.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
        return { greeting, timeString: `${timeStr} ${dateStr}` };
    };

    const { greeting, timeString } = getGreetingAndClock();

    const [showNotifications, setShowNotifications] = useState(false);

    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, subscribed: 0, unsubscribed: 0, new24h: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [predefinedTagFilter, setPredefinedTagFilter] = useState('');
    const [subsLoading, setSubsLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [expandedSubId, setExpandedSubId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredCount, setFilteredCount] = useState(0);
    const [pageSize, setPageSize] = useState(50);

    const [isAddSubOpen, setIsAddSubOpen] = useState(false);
    const [newSub, setNewSub] = useState({ name: '', email: '', tags: [] as string[] });
    const [isEditSubOpen, setIsEditSubOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscriber | null>(null);
    const [subActionLoading, setSubActionLoading] = useState(false);

    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ subject: '', template_type: 'inner_circle', body_content: '', target_tags: [] as string[], scheduled_for: '' });
    const [previewActive, setPreviewActive] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importCategory, setImportCategory] = useState('');
    const [importPreviewData, setImportPreviewData] = useState<{
        name: string;
        email: string;
        tags: string[];
        quality: 'valid' | 'warning' | 'invalid';
        reason: string;
        firstName?: string;
        lastName?: string;
        accountType?: string;
        username?: string;
        userProfile?: string;
        location?: string;
        productType?: string;
        licenseName?: string;
        productTitle?: string;
    }[]>([]);
    const [importStep, setImportStep] = useState<1 | 2>(1);
    const [excludeWarnings, setExcludeWarnings] = useState(false);
    const [audienceSubTab, setAudienceSubTab] = useState<string>('all');
    const [campaignActionLoading, setCampaignActionLoading] = useState(false);

    const [monitoringCampaignId, setMonitoringCampaignId] = useState<number | null>(null);
    const [campaignProgress, setCampaignProgress] = useState<any>(null);

    const [performance, setPerformance] = useState<PerfMetrics | null>(null);
    const [auditLoading, setAuditLoading] = useState(false);

    const [growth, setGrowth] = useState<GrowthPoint[]>([]);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [health, setHealth] = useState<HealthState | null>(null);
    const [healthLoading, setHealthLoading] = useState(false);

    // SEO States
    const [seoMetrics, setSeoMetrics] = useState<any>(null);
    const [seoLoading, setSeoLoading] = useState(false);
    const [seoConnected, setSeoConnected] = useState<boolean | null>(null);
    const [seoClientEmail, setSeoClientEmail] = useState<string | null>(null);

    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
        action?: { label: string; onClick: () => void | Promise<void> };
    } | null>(null);
    const [confirmState, setConfirmState] = useState<{ message: string; onConfirm: () => void } | null>(null);

    const showToast = useCallback((
        message: string,
        type: 'success' | 'error' = 'success',
        action?: { label: string; onClick: () => void | Promise<void> },
        duration = 4000
    ) => {
        setToast({ message, type, action });
        const timer = setTimeout(() => {
            setToast(prev => {
                if (prev?.message === message) return null;
                return prev;
            });
        }, duration);
        return timer;
    }, []);
    const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ message, onConfirm });

    // Auth check on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/founder/subscribers?limit=1');
                setIsAuthenticated(res.ok);
            } catch {
                setIsAuthenticated(false);
            }
        })();
    }, []);

    // Loaders
    const loadSubscribers = async (
        pageOverride?: number, 
        sortOverride?: { key: string; direction: 'asc' | 'desc' },
        pageSizeOverride?: number
    ) => {
        setSubsLoading(true);
        try {
            const page = pageOverride !== undefined ? pageOverride : currentPage;
            const sort = sortOverride || sortConfig || { key: 'created_at', direction: 'desc' };
            const size = pageSizeOverride !== undefined ? pageSizeOverride : pageSize;

            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            if (tagFilter) params.append('tag', tagFilter);
            params.append('limit', String(size));
            params.append('offset', String((page - 1) * size));
            params.append('sortBy', sort.key);
            params.append('sortDir', sort.direction);

            const res = await fetch(`/api/founder/subscribers?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data.subscribers || []);
                setFilteredCount(data.filteredCount || 0);
                if (data.stats) setStats(data.stats);
                setSelectedIds([]);
            }
        } catch (err) {
            console.error('Failed to load subscribers:', err);
        } finally {
            setSubsLoading(false);
        }
    };

    const loadCampaigns = useCallback(async () => {
        setCampaignsLoading(true);
        try {
            const res = await fetch('/api/founder/campaigns/create');
            if (res.ok) { const data = await res.json(); setCampaigns(data.campaigns); }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        } finally {
            setCampaignsLoading(false);
        }
    }, []);

    const loadPerformance = useCallback(async (forceRun = false) => {
        setAuditLoading(true);
        try {
            const url = forceRun ? `/api/founder/performance?url=https://www.virzyguns.com` : `/api/founder/performance`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPerformance(data.metrics ? data.metrics : { unavailable: true } as PerfMetrics);
            }
        } catch (err) {
            console.error('Failed to load PageSpeed performance:', err);
            setPerformance({ unavailable: true } as PerfMetrics);
        } finally {
            setAuditLoading(false);
        }
    }, []);

    const loadMetrics = useCallback(async () => {
        setMetricsLoading(true);
        try {
            const res = await fetch('/api/founder/metrics');
            if (res.ok) { const data = await res.json(); setGrowth(data.growth || []); }
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setMetricsLoading(false);
        }
    }, []);

    const loadHealth = useCallback(async () => {
        setHealthLoading(true);
        try {
            const res = await fetch('/api/founder/health');
            if (res.ok) setHealth(await res.json());
        } catch (err) {
            console.error('Failed to load health:', err);
        } finally {
            setHealthLoading(false);
        }
    }, []);

    const loadSeo = useCallback(async () => {
        setSeoLoading(true);
        try {
            const res = await fetch('/api/founder/seo');
            if (res.ok) {
                const data = await res.json();
                setSeoConnected(data.connected);
                setSeoMetrics(data.metrics);
                setSeoClientEmail(data.clientEmail);
            }
        } catch (err) {
            console.error('Failed to load SEO analytics:', err);
        } finally {
            setSeoLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadSubscribers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, statusFilter, tagFilter, currentPage, pageSize]);

    useEffect(() => {
        if (isAuthenticated) {
            const timer = setTimeout(() => {
                loadCampaigns();
                loadPerformance();
                loadMetrics();
                loadHealth();
                loadSeo();
            }, 0);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Campaign progress polling
    useEffect(() => {
        if (!monitoringCampaignId || !isAuthenticated) return;
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/founder/campaigns/${monitoringCampaignId}/progress`);
                if (res.ok) {
                    const data = await res.json();
                    setCampaignProgress(data);
                    loadCampaigns();
                    if (['completed', 'cancelled', 'failed'].includes(data.campaign.status)) {
                        setMonitoringCampaignId(null);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchProgress();
        const interval = setInterval(fetchProgress, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monitoringCampaignId, isAuthenticated]);

    // Handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        try {
            const res = await fetch('/api/founder/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            });
            const data = await res.json();
            if (res.ok && data.success) setIsAuthenticated(true);
            else setAuthError(data.error || 'Authentication failed.');
        } catch {
            setAuthError('Server error. Try again later.');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/founder/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                setIsAuthenticated(false);
                showToast('Logged out successfully.');
            } else {
                showToast('Failed to log out.', 'error');
            }
        } catch {
            showToast('Network error while logging out.', 'error');
        }
    };

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubActionLoading(true);
        try {
            const res = await fetch('/api/founder/subscribers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSub.name, email: newSub.email, status: 'subscribed', tags: newSub.tags }),
            });
            if (res.ok) {
                setIsAddSubOpen(false);
                setNewSub({ name: '', email: '', tags: [] });
                loadSubscribers();
                showToast('Subscriber added.');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to add subscriber.', 'error');
            }
        } catch {
            showToast('Network error while adding subscriber.', 'error');
        } finally {
            setSubActionLoading(false);
        }
    };

    const handleEditSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSub) return;
        setSubActionLoading(true);
        try {
            const res = await fetch('/api/founder/subscribers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSub),
            });
            if (res.ok) {
                setIsEditSubOpen(false);
                setEditingSub(null);
                loadSubscribers();
                showToast('Subscriber updated.');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to update subscriber.', 'error');
            }
        } catch {
            showToast('Failed to update subscriber.', 'error');
        } finally {
            setSubActionLoading(false);
        }
    };

    const handleExportCSV = async () => {
        if (filteredCount === 0) {
            showToast('No subscribers to export.', 'error');
            return;
        }
        setSubActionLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);
            if (tagFilter) params.append('tag', tagFilter);
            params.append('limit', 'all');
            if (sortConfig) {
                params.append('sortBy', sortConfig.key);
                params.append('sortDir', sortConfig.direction);
            }

            const res = await fetch(`/api/founder/subscribers?${params.toString()}`);
            if (!res.ok) {
                showToast('Failed to fetch data for export.', 'error');
                return;
            }
            const data = await res.json();
            const allSubs: Subscriber[] = data.subscribers || [];

            const headers = ['Name', 'Email', 'Status', 'Registered', 'Tags'];
            const rows = allSubs.map(sub => [
                sub.name,
                sub.email,
                sub.status,
                new Date(sub.created_at).toLocaleDateString(),
                (sub.tags || []).join(';')
            ]);
            const csvContent = "\ufeff" + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `vgp_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`Exported ${allSubs.length} subscribers successfully!`);
        } catch (err) {
            console.error('Failed to export:', err);
            showToast('Failed to export subscribers.', 'error');
        } finally {
            setSubActionLoading(false);
        }
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImportLoading(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                if (lines.length === 0) {
                    showToast('The CSV file is empty.', 'error');
                    setImportLoading(false);
                    return;
                }

                const parsedLines = [];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const cols: string[] = [];
                    let current = '';
                    let inQuotes = false;
                    for (let j = 0; j < line.length; j++) {
                        const char = line[j];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            cols.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    cols.push(current.trim());
                    parsedLines.push(cols.map(c => c.replace(/^["']|["']$/g, '')));
                }

                const firstLineStr = lines[0].toLowerCase();
                const hasHeader = firstLineStr.includes('email') || firstLineStr.includes('name');
                const startIdx = hasHeader ? 1 : 0;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const suspiciousDomains = ['test.com', 'example.com', 'fake.com', 'asdf.com', 'temp-mail.org', 'mailinator.com', 'guerrillamail.com', 'throwaway.email'];

                let emailIdx = -1;
                let nameIdx = -1;
                let lastNameIdx = -1;
                let tagsIdx = -1;
                let locationIdx = -1;
                let productTypeIdx = -1;
                let licenseNameIdx = -1;
                let productTitleIdx = -1;
                let accountTypeIdx = -1;
                let usernameIdx = -1;
                let userProfileIdx = -1;

                if (hasHeader && parsedLines.length > 0) {
                    const headers = parsedLines[0].map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
                    emailIdx = headers.findIndex(h => h === 'email' || h === 'email address');
                    if (emailIdx === -1) emailIdx = headers.findIndex(h => h.includes('email'));
                    
                    nameIdx = headers.findIndex(h => h === 'name' || h === 'first name' || h === 'first_name');
                    if (nameIdx === -1) nameIdx = headers.findIndex(h => h.includes('name') && !h.includes('last'));
                    
                    lastNameIdx = headers.findIndex(h => h === 'last name' || h === 'last_name' || h === 'surname');
                    tagsIdx = headers.findIndex(h => h.includes('tag') || h.includes('group') || h.includes('category') || h.includes('segment'));

                    locationIdx = headers.findIndex(h => h === 'location' || h === 'country' || h === 'city');
                    productTypeIdx = headers.findIndex(h => h === 'product type' || h === 'product_type');
                    licenseNameIdx = headers.findIndex(h => h === 'license name' || h === 'license_name' || h === 'license');
                    productTitleIdx = headers.findIndex(h => h === 'product title' || h === 'product_title' || h === 'product');
                    accountTypeIdx = headers.findIndex(h => h === 'account type' || h === 'account_type');
                    usernameIdx = headers.findIndex(h => h === 'user username' || h === 'user_username' || h === 'username' || h.includes('username'));
                    userProfileIdx = headers.findIndex(h => h === 'user profile' || h === 'user_profile' || h === 'profile');
                }

                const previewRows: typeof importPreviewData = [];

                for (let i = startIdx; i < parsedLines.length; i++) {
                    const cleanCols = parsedLines[i];
                    if (cleanCols.length === 0 || (cleanCols.length === 1 && !cleanCols[0])) continue;

                    let name = '';
                    let email = '';
                    let tags: string[] = [];
                    let firstName = '';
                    let lastName = '';
                    let accountType = '';
                    let username = '';
                    let userProfile = '';
                    let location = '';
                    let productType = '';
                    let licenseName = '';
                    let productTitle = '';

                    if (hasHeader && (emailIdx !== -1 || nameIdx !== -1)) {
                        if (emailIdx !== -1) email = cleanCols[emailIdx] || '';
                        if (nameIdx !== -1) {
                            name = cleanCols[nameIdx] || '';
                            firstName = name;
                        }
                        if (lastNameIdx !== -1 && cleanCols[lastNameIdx]) {
                            lastName = cleanCols[lastNameIdx] || '';
                            name = name ? `${name} ${lastName}` : lastName;
                        }
                        if (tagsIdx !== -1 && cleanCols[tagsIdx]) {
                            tags = cleanCols[tagsIdx].split(/[;|]/).map(t => t.trim()).filter(Boolean);
                        }

                        if (accountTypeIdx !== -1 && cleanCols[accountTypeIdx]) {
                            accountType = cleanCols[accountTypeIdx].trim();
                        }
                        if (usernameIdx !== -1 && cleanCols[usernameIdx]) {
                            username = cleanCols[usernameIdx].trim();
                        }
                        if (userProfileIdx !== -1 && cleanCols[userProfileIdx]) {
                            userProfile = cleanCols[userProfileIdx].trim();
                        }
                        if (locationIdx !== -1 && cleanCols[locationIdx]) {
                            location = cleanCols[locationIdx].trim();
                        }
                        if (productTypeIdx !== -1 && cleanCols[productTypeIdx]) {
                            productType = cleanCols[productTypeIdx].trim();
                        }
                        if (licenseNameIdx !== -1 && cleanCols[licenseNameIdx]) {
                            licenseName = cleanCols[licenseNameIdx].trim();
                        }
                        if (productTitleIdx !== -1 && cleanCols[productTitleIdx]) {
                            productTitle = cleanCols[productTitleIdx].trim();
                        }

                        // Extract metadata columns as tags (for backwards compatibility/easy segmentation)
                        if (location) {
                            const val = location;
                            if (val && val.toLowerCase() !== 'unknown' && val.toLowerCase() !== 'null') {
                                const cleanTag = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
                            }
                        }
                        if (productType) {
                            const val = productType;
                            if (val) {
                                const cleanTag = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
                            }
                        }
                        if (licenseName) {
                            const val = licenseName;
                            if (val) {
                                const cleanTag = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
                            }
                        }
                        if (productTitle) {
                            const val = productTitle;
                            if (val) {
                                const cleanTag = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
                            }
                        }
                        if (accountType) {
                            const val = accountType;
                            if (val && val.toUpperCase() !== 'GUEST' && val.toUpperCase() !== 'ADMIN' && val.toUpperCase() !== 'PRODUCER') {
                                const cleanTag = val.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
                                if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
                            }
                        }

                        // Fallback username check (using header index to avoid locations/products)
                        if (!name.trim()) {
                            if (username) {
                                if (!username.toLowerCase().includes('http://') && !username.toLowerCase().includes('https://')) {
                                    name = username;
                                }
                            }
                            // If still empty, check the accountType column because Voloco shifts username here when name is empty
                            if (!name.trim() && accountType) {
                                if (!accountType.toLowerCase().includes('http://') && 
                                    !accountType.toLowerCase().includes('https://') &&
                                    accountType.toUpperCase() !== 'GUEST' &&
                                    accountType.toUpperCase() !== 'ADMIN' &&
                                    accountType.toUpperCase() !== 'PRODUCER'
                                ) {
                                    name = accountType;
                                }
                            }
                        }
                    } else {
                        // fallback logic
                        if (cleanCols.length === 1) {
                            email = cleanCols[0];
                        } else if (cleanCols.length >= 2) {
                            if (cleanCols[1].includes('@')) {
                                name = cleanCols[0];
                                email = cleanCols[1];
                                if (cleanCols.length >= 5) {
                                    tags = cleanCols[4].split(/[;|]/).map(t => t.trim()).filter(Boolean);
                                } else if (cleanCols.length >= 3 && !cleanCols[2].includes('sub')) {
                                    tags = cleanCols[2].split(/[;|]/).map(t => t.trim()).filter(Boolean);
                                }
                            } else if (cleanCols[0].includes('@')) {
                                email = cleanCols[0];
                                name = cleanCols[1];
                                if (cleanCols.length >= 3) {
                                    tags = cleanCols[2].split(/[;|]/).map(t => t.trim()).filter(Boolean);
                                }
                            }
                        }
                    }

                    if (importCategory) {
                        if (!tags.includes(importCategory)) {
                            tags.push(importCategory);
                        }
                    }

                    const normalizedEmail = email.trim();
                    const cleanName = name.trim();
                    let quality: 'valid' | 'warning' | 'invalid' = 'valid';
                    let reason = '';

                    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
                        quality = 'invalid';
                        reason = !normalizedEmail ? 'Missing email' : 'Malformed email address';
                    } else {
                        const domain = normalizedEmail.split('@')[1]?.toLowerCase();
                        if (!cleanName || cleanName === 'Producer') {
                            quality = 'warning';
                            reason = `Missing name (will default to "${getDefaultNameFromEmail(normalizedEmail)}")`;
                        }
                        if (domain && suspiciousDomains.includes(domain)) {
                            quality = 'warning';
                            reason = reason ? `${reason}, Suspicious domain (@${domain})` : `Suspicious domain (@${domain})`;
                        }
                    }

                    previewRows.push({
                        name: cleanName && cleanName !== 'Producer' ? cleanName : getDefaultNameFromEmail(normalizedEmail),
                        email: normalizedEmail,
                        tags,
                        quality,
                        reason,
                        firstName,
                        lastName,
                        accountType,
                        username,
                        userProfile,
                        location,
                        productType,
                        licenseName,
                        productTitle
                    });
                }

                if (previewRows.length === 0) {
                    showToast('No subscriber rows found in CSV.', 'error');
                    setImportLoading(false);
                    return;
                }

                setImportPreviewData(previewRows);
                setImportStep(2);
            } catch (err) {
                console.error(err);
                showToast('Error parsing CSV file.', 'error');
            } finally {
                setImportLoading(false);
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = async () => {
        const rowsToImport = importPreviewData.filter(r => {
            if (r.quality === 'invalid') return false;
            if (excludeWarnings && r.quality === 'warning') return false;
            return true;
        });
        if (rowsToImport.length === 0) {
            showToast('No valid rows to import.', 'error');
            return;
        }
        setImportLoading(true);
        try {
            const res = await fetch('/api/founder/subscribers/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscribers: rowsToImport.map(r => ({
                        name: r.name,
                        email: r.email,
                        tags: r.tags,
                        first_name: r.firstName,
                        last_name: r.lastName,
                        account_type: r.accountType,
                        username: r.username,
                        user_profile: r.userProfile,
                        location: r.location,
                        product_type: r.productType,
                        license_name: r.licenseName,
                        product_title: r.productTitle
                    }))
                }),
            });

            if (res.ok) {
                const data = await res.json();
                loadSubscribers();
                showToast(`Imported ${data.imported} subscribers successfully! (${data.failed} failed)`);
                setIsImportModalOpen(false);
                setImportPreviewData([]);
                setImportStep(1);
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to import subscribers.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Error uploading subscribers.', 'error');
        } finally {
            setImportLoading(false);
        }
    };

    const handleUnsubscribeSubscriber = (id: number) => {
        askConfirm('Suppress this subscriber? They will stop receiving broadcasts.', async () => {
            try {
                const res = await fetch(`/api/founder/subscribers?id=${id}`, { method: 'DELETE' });
                if (res.ok) { loadSubscribers(); showToast('Subscriber suppressed.'); }
                else { const data = await res.json(); showToast(data.error || 'Failed to suppress.', 'error'); }
            } catch {
                showToast('Failed to suppress subscriber.', 'error');
            }
        });
    };

    const handleUndoDelete = async (batchId: string) => {
        try {
            const res = await fetch('/api/founder/subscribers/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleted_batch_id: batchId })
            });
            if (res.ok) {
                const data = await res.json();
                loadSubscribers();
                showToast(`Restored ${data.restored_count || ''} subscriber(s) successfully!`);
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to undo deletion.', 'error');
            }
        } catch {
            showToast('Failed to undo deletion.', 'error');
        }
    };

    const handleDeleteAll = () => {
        const filterText = tagFilter ? `in category "${tagLabelMap[tagFilter] || tagFilter}"` : 'in the database';
        askConfirm(`Are you absolutely sure you want to DELETE ALL subscribers ${filterText}?`, async () => {
            setSubActionLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('all', 'true');
                if (searchQuery) params.append('search', searchQuery);
                if (statusFilter) params.append('status', statusFilter);
                if (tagFilter) params.append('tag', tagFilter);

                const res = await fetch(`/api/founder/subscribers?${params.toString()}`, { method: 'DELETE' });
                if (res.ok) {
                    const data = await res.json();
                    loadSubscribers();
                    if (data.deleted_batch_id && data.count > 0) {
                        showToast(
                            `Deleted ${data.count} subscriber(s).`,
                            'success',
                            {
                                label: 'Undo',
                                onClick: () => handleUndoDelete(data.deleted_batch_id)
                            },
                            8000
                        );
                    } else {
                        showToast('All matching subscribers deleted.');
                    }
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Failed to delete all.', 'error');
                }
            } catch {
                showToast('Failed to delete all.', 'error');
            } finally {
                setSubActionLoading(false);
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === subscribers.length && subscribers.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(subscribers.map(s => s.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        askConfirm(`Are you sure you want to completely DELETE ${selectedIds.length} selected subscriber(s)?`, async () => {
            setSubActionLoading(true);
            try {
                const idParam = selectedIds.join(',');
                const res = await fetch(`/api/founder/subscribers?id=${idParam}&hard=true`, { method: 'DELETE' });
                if (res.ok) {
                    const data = await res.json();
                    loadSubscribers();
                    setSelectedIds([]);
                    if (data.deleted_batch_id && data.count > 0) {
                        showToast(
                            `Deleted ${data.count} subscriber(s).`,
                            'success',
                            {
                                label: 'Undo',
                                onClick: () => handleUndoDelete(data.deleted_batch_id)
                            },
                            8000
                        );
                    } else {
                        showToast(`Deleted ${selectedIds.length} subscriber(s).`);
                    }
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Failed to delete selected.', 'error');
                }
            } catch {
                showToast('Failed to delete selected subscribers.', 'error');
            } finally {
                setSubActionLoading(false);
            }
        });
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
        loadSubscribers(1, { key, direction });
    };

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (!sortConfig || sortConfig.key !== columnKey) {
            return <span className="ml-1 inline-block text-white/20 font-sans">↕</span>;
        }
        return <span className="ml-1 inline-block text-sky-300 font-sans">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setCampaignActionLoading(true);
        try {
            const res = await fetch('/api/founder/campaigns/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign),
            });
            if (res.ok) {
                setIsCreateCampaignOpen(false);
                setNewCampaign({ subject: '', template_type: 'inner_circle', body_content: '', target_tags: [], scheduled_for: '' });
                setPreviewActive(false);
                loadCampaigns();
                showToast('Broadcast draft created.');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to create broadcast.', 'error');
            }
        } catch {
            showToast('Failed to create broadcast.', 'error');
        } finally {
            setCampaignActionLoading(false);
        }
    };

    const handleStartCampaign = (id: number) => {
        const campaign = campaigns.find(c => c.id === id);
        const targetDesc = campaign?.target_tags && campaign.target_tags.length > 0 
            ? `subscribers matching tags: ${campaign.target_tags.join(', ')}`
            : 'all active subscribers';
        askConfirm(`Queue this broadcast and start sending to ${targetDesc}?`, async () => {
            try {
                const res = await fetch(`/api/founder/campaigns/${id}/start`, { method: 'POST' });
                if (res.ok) { setMonitoringCampaignId(id); loadCampaigns(); showToast('Broadcast queued.'); }
                else { const data = await res.json(); showToast(data.error || 'Failed to start broadcast.', 'error'); }
            } catch {
                showToast('Failed to start broadcast.', 'error');
            }
        });
    };

    const handlePauseCampaign = async (id: number) => {
        try {
            const res = await fetch(`/api/founder/campaigns/${id}/pause`, { method: 'POST' });
            if (res.ok) {
                if (monitoringCampaignId === id) { setMonitoringCampaignId(null); setCampaignProgress(null); }
                loadCampaigns();
                showToast('Broadcast paused.');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to pause broadcast.', 'error');
            }
        } catch {
            showToast('Failed to pause broadcast.', 'error');
        }
    };

    const handleAbortCampaign = (id: number) => {
        askConfirm('Abort this campaign? All unsent recipient emails will be permanently cancelled.', async () => {
            try {
                const res = await fetch(`/api/founder/campaigns/${id}/abort`, { method: 'POST' });
                if (res.ok) {
                    if (monitoringCampaignId === id) { setMonitoringCampaignId(null); setCampaignProgress(null); }
                    loadCampaigns();
                    showToast('Campaign aborted and queue cancelled.');
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Failed to abort campaign.', 'error');
                }
            } catch {
                showToast('Failed to abort campaign.', 'error');
            }
        });
    };

    // ── Gate: loading / login ──────────────────────────────────────────
    if (isAuthenticated === null) {
        return (
            <main className="editorial-shell flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="editorial-shell flex min-h-screen items-center justify-center px-4">
                <motion.div variants={revealUp} initial="hidden" animate="visible" className="liquid-glass-strong w-full max-w-md rounded-lg p-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="font-display text-2xl font-semibold text-white">Founder Portal</h1>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-sky-200/50">Authorized access only</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Access passcode</label>
                            <input
                                type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
                                placeholder="••••••••" required
                                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-center tracking-[0.3em] text-white outline-none transition focus:border-sky-300/50"
                            />
                        </div>
                        {authError && (
                            <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 py-2 text-center text-xs text-rose-300">{authError}</p>
                        )}
                        <button type="submit" disabled={authLoading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white py-3 text-sm font-semibold text-[#030405] transition hover:bg-white/90 disabled:opacity-50">
                            {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {authLoading ? 'Verifying…' : 'Enter dashboard'}
                        </button>
                    </form>
                </motion.div>
            </main>
        );
    }

    const tabs: { key: TabKey; label: string; Icon: typeof Users }[] = [
        { key: 'overview', label: 'Overview', Icon: LayoutDashboard },
        { key: 'subscribers', label: 'Audience', Icon: Users },
        { key: 'broadcasts', label: 'Broadcasts', Icon: Send },
        { key: 'seo', label: 'SEO', Icon: Search },
        { key: 'cadenz', label: 'CADENZ', Icon: Smartphone },
    ];

    const refreshAll = () => { loadSubscribers(); loadCampaigns(); loadMetrics(); loadHealth(); loadPerformance(); loadSeo(); };

    // ── Dashboard ───────────────────────────────────────────────────────
    return (
        <main className="editorial-shell min-h-screen text-white md:flex">
            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex w-20 flex-col items-center justify-between border-r border-white/[0.06] bg-[#030405]/50 backdrop-blur-xl py-6 sticky top-0 h-screen z-50 shrink-0">
                <div className="flex flex-col items-center gap-8 w-full">
                    {/* Logo/Icon */}
                    <div className="h-10 w-10 flex items-center justify-center">
                        <img src="/branding/logo-tg.png" alt="VGP Logo" className="h-full w-full object-contain opacity-90" />
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-4 w-full items-center">
                        {tabs.map(({ key, label, Icon }) => {
                            const isActive = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${
                                        isActive
                                            ? 'bg-white text-[#030405] shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-105'
                                            : 'text-white/55 hover:bg-white/[0.04] hover:text-white hover:scale-105'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {/* Premium Tooltip */}
                                    <span className="absolute left-16 z-50 scale-0 rounded-md border border-white/[0.08] bg-[#07090e]/95 px-2.5 py-1 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover:scale-100 whitespace-nowrap pointer-events-none">
                                        {label}
                                    </span>
                                    {/* Active border bar */}
                                    {isActive && (
                                        <span className="absolute -left-1 h-5 w-1 rounded-r-full bg-cyan-400" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom utilities */}
                <div className="flex flex-col items-center gap-3.5 w-full border-t border-white/[0.06] pt-5">
                    {/* Hostinger Mailbox */}
                    <a
                        href="https://mail.hostinger.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-sky-400 transition-all hover:bg-sky-400/10 hover:text-sky-300 hover:scale-105"
                    >
                        <Mail className="h-4.5 w-4.5" />
                        <span className="absolute left-16 z-50 scale-0 rounded-md border border-white/[0.08] bg-[#07090e]/95 px-2.5 py-1 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover:scale-100 whitespace-nowrap pointer-events-none">
                            Hostinger Mailbox
                        </span>
                    </a>

                    {/* BeatStars Studio */}
                    <a
                        href="https://studio.beatstars.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-amber-400 transition-all hover:bg-amber-400/10 hover:text-amber-300 hover:scale-105"
                    >
                        <Radio className="h-4.5 w-4.5" />
                        <span className="absolute left-16 z-50 scale-0 rounded-md border border-white/[0.08] bg-[#07090e]/95 px-2.5 py-1 text-xs font-medium text-white shadow-xl transition-all duration-200 group-hover:scale-100 whitespace-nowrap pointer-events-none">
                            BeatStars Studio
                        </span>
                    </a>

                    <div className="w-6 h-px bg-white/[0.06] my-1" />

                    <a
                        href="https://www.virzyguns.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Go to website"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/50 transition-all hover:bg-white/[0.06] hover:text-white hover:scale-105"
                    >
                        <Globe className="h-4 w-4" />
                    </a>
                    <button
                        onClick={refreshAll}
                        title="Refresh all data"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-white/50 transition-all hover:bg-white/[0.06] hover:text-white hover:scale-105"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-rose-400/70 transition-all hover:bg-rose-500/10 hover:text-rose-300 hover:scale-105"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#030405]/70 backdrop-blur-xl">
                    {/* Desktop Header */}
                    <div className="hidden md:flex w-full items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                            <h1 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                <span>{greeting}</span>
                                <span className="text-white/30 font-light">/</span>
                                <span className="text-sm font-mono text-white/60 tracking-wider font-semibold">{timeString}</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={refreshAll}
                                title="Refresh all data"
                                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/70 transition hover:text-white hover:bg-white/[0.06]"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/70 transition hover:text-white hover:bg-white/[0.06]"
                                >
                                    <Bell className="h-4 w-4" />
                                    {/* Show warning/alert dot if queue failed or campaigns sending */}
                                    {(((health?.queue.failed ?? 0) > 0) || campaigns.some(c => ['sending', 'queued'].includes(c.status))) && (
                                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-white/[0.08] bg-[#07090e]/95 backdrop-blur-xl p-4 shadow-2xl z-50 text-left">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">Alerts & Logs</span>
                                            <button onClick={() => setShowNotifications(false)} className="text-white/30 hover:text-white text-2xs">&times;</button>
                                        </div>
                                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                            {/* Campaign logs */}
                                            {campaigns.filter(c => ['sending', 'queued'].includes(c.status)).map(c => (
                                                <div key={c.id} className="flex gap-2.5 items-start text-xs border-b border-white/[0.03] pb-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-white/90">Campaign dispatching</p>
                                                        <p className="text-white/50 text-2xs mt-0.5 truncate">{c.subject}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Queue issues */}
                                            {health && health.queue.failed > 0 && (
                                                <div className="flex gap-2.5 items-start text-xs border-b border-white/[0.03] pb-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-rose-300">Delivery Alert</p>
                                                        <p className="text-white/50 text-2xs mt-0.5">{health.queue.failed} failures in dispatch queue.</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Success dispatches */}
                                            {health && health.queue.sentToday > 0 && (
                                                <div className="flex gap-2.5 items-start text-xs border-b border-white/[0.03] pb-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-cyan-300">Queue Active</p>
                                                        <p className="text-white/50 text-2xs mt-0.5">{health.queue.sentToday} emails sent successfully today.</p>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Fallback */}
                                            {(!health || (health.queue.failed === 0 && health.queue.sentToday === 0 && !campaigns.some(c => ['sending', 'queued'].includes(c.status)))) && (
                                                <p className="text-2xs text-white/40 text-center py-2">All services operational. No active alerts.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-8 w-8 flex items-center justify-center">
                                <img src="/branding/logo-tg.png" alt="VGP Admin" className="h-full w-full object-contain opacity-90" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden mx-auto flex flex-col gap-3 px-4 py-3 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                                <span className="font-display text-sm font-semibold text-white">VGP Founder</span>
                                <span className="text-2xs text-white/35">· mission control</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href="https://mail.hostinger.com" target="_blank" rel="noopener noreferrer" title="Hostinger Mailbox" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-sky-300 transition hover:text-sky-200">
                                    <Mail className="h-3 w-3" />
                                </a>
                                <a href="https://studio.beatstars.com/dashboard" target="_blank" rel="noopener noreferrer" title="BeatStars Studio" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-amber-300 transition hover:text-amber-200">
                                    <Radio className="h-3 w-3" />
                                </a>
                                <div className="h-4 w-px bg-white/[0.08]" />
                                <a href="https://www.virzyguns.com" target="_blank" rel="noopener noreferrer" title="Go to website" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/50 transition hover:text-sky-100">
                                    <Globe className="h-3 w-3" />
                                </a>
                                <button onClick={refreshAll} title="Refresh all" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/50 transition hover:text-sky-100">
                                    <RefreshCw className="h-3 w-3" />
                                </button>
                                <button onClick={handleLogout} title="Sign out" className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-rose-400/70 transition hover:bg-rose-500/10 hover:text-rose-300">
                                    <LogOut className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                        <nav className="flex gap-1 overflow-x-auto no-scrollbar rounded-full border border-white/[0.07] bg-white/[0.02] p-1">
                            {tabs.map(({ key, label, Icon }) => (
                                <button key={key} onClick={() => setActiveTab(key)}
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold transition whitespace-nowrap ${activeTab === key ? 'bg-white text-[#030405]' : 'text-white/55 hover:text-white'}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className="w-full px-4 pt-8 sm:px-6 md:px-8 flex-1">
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <motion.div variants={staggerParent} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <StatCard label="Total registrations" value={stats.total} Icon={Users} />
                            <StatCard label="Active list" value={stats.subscribed} Icon={CheckCircle2} accent="text-sky-300" />
                            <StatCard label="Suppressed" value={stats.unsubscribed} Icon={Ban} accent="text-white/50" />
                            <StatCard label="New · 24h" value={`+${stats.new24h}`} Icon={TrendingUp} accent="text-emerald-300" />
                        </motion.div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            <div className="lg:col-span-2"><GrowthChart data={growth} loading={metricsLoading} /></div>
                            <PerformancePanel perf={performance} loading={auditLoading} onRun={() => loadPerformance(true)} />
                        </div>

                        <HealthPanel health={health} loading={healthLoading} onRefresh={loadHealth} />
                    </div>
                )}

                {/* SUBSCRIBERS */}
                {activeTab === 'subscribers' && (
                    <div className="space-y-5">
                        {/* Audience Sub-Tabs */}
                        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] p-1 w-fit">
                            {([
                                { key: 'all', label: 'All' },
                                { key: 'cadenz', label: 'CADENZ' },
                                { key: 'book_buyer', label: 'Book Buyer' },
                                { key: 'beat_buyer', label: 'Beat Buyer' },
                            ] as { key: string; label: string }[]).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setAudienceSubTab(key);
                                        setCurrentPage(1);
                                        if (key === 'all') {
                                            setPredefinedTagFilter('');
                                            setTagFilter('');
                                        } else {
                                            setPredefinedTagFilter(key);
                                            setTagFilter(key);
                                        }
                                    }}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                                        audienceSubTab === key
                                            ? 'bg-white text-[#030405] shadow-sm'
                                            : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap gap-2 items-center flex-1">
                                <div className="relative flex-1 max-w-sm min-w-[200px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text" 
                                        placeholder="Search name or email…" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setCurrentPage(1);
                                                loadSubscribers(1);
                                            }
                                        }}
                                        className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white outline-none transition focus:border-sky-300/50"
                                    />
                                </div>
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    className="h-10 rounded-lg border border-white/10 bg-[#050505] px-3 text-sm text-white/70 outline-none focus:border-sky-300/50 cursor-pointer"
                                >
                                    <option value="" className="bg-[#050505]">All statuses</option>
                                    <option value="subscribed" className="bg-[#050505]">Subscribed</option>
                                    <option value="unsubscribed" className="bg-[#050505]">Unsubscribed</option>
                                </select>
                                {audienceSubTab === 'all' && (
                                    <select 
                                        value={predefinedTagFilter} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPredefinedTagFilter(val);
                                            setCurrentPage(1);
                                            if (val !== 'custom') {
                                                setTagFilter(val);
                                            } else {
                                                setTagFilter('');
                                            }
                                        }}
                                        className="h-10 rounded-lg border border-white/10 bg-[#050505] px-3 text-sm text-white/70 outline-none focus:border-sky-300/50 cursor-pointer"
                                    >
                                        <option value="" className="bg-[#050505]">All segments</option>
                                        <option value="cadenz" className="bg-[#050505]">CADENZ</option>
                                        <option value="beat_buyer" className="bg-[#050505]">Beat Buyer</option>
                                        <option value="book_buyer" className="bg-[#050505]">Book Buyer</option>
                                        <option value="custom" className="bg-[#050505]">Other Tag...</option>
                                    </select>
                                )}
                                {audienceSubTab === 'all' && predefinedTagFilter === 'custom' && (
                                    <input
                                        type="text" 
                                        placeholder="Enter tag…" 
                                        value={tagFilter}
                                        onChange={(e) => setTagFilter(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setCurrentPage(1);
                                                loadSubscribers(1);
                                            }
                                        }}
                                        className="h-10 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-sky-300/50 max-w-[140px]"
                                    />
                                )}
                                <button 
                                    onClick={() => { setCurrentPage(1); loadSubscribers(1); }} 
                                    className="h-10 rounded-lg border border-sky-300/25 bg-sky-300/10 px-4 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15"
                                >
                                    Search
                                </button>
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                <button 
                                    onClick={handleExportCSV} 
                                    title="Export current list to CSV"
                                    className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-semibold text-white/70 transition hover:text-white hover:bg-white/[0.06]"
                                >
                                    Export CSV
                                </button>
                                <button 
                                    onClick={() => setIsImportModalOpen(true)} 
                                    title="Import subscribers from CSV"
                                    className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-semibold text-white/70 transition hover:text-white hover:bg-white/[0.06]"
                                >
                                    Import CSV
                                </button>
                                {selectedIds.length > 0 && (
                                    <button 
                                        onClick={handleDeleteSelected} 
                                        disabled={subActionLoading} 
                                        title={`Delete ${selectedIds.length} selected`}
                                        className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                                    >
                                        <Ban className="h-3.5 w-3.5" /> Delete {selectedIds.length}
                                    </button>
                                )}
                                <button 
                                    onClick={handleDeleteAll} 
                                    disabled={subActionLoading} 
                                    title="Delete ALL subscribers"
                                    className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                                >
                                    <Ban className="h-3.5 w-3.5" /> Delete All
                                </button>
                                <button 
                                    onClick={() => setIsAddSubOpen(true)}
                                    className="h-10 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white bg-white px-4 text-xs font-semibold text-[#030405] transition hover:bg-white/90"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add subscriber
                                </button>
                            </div>
                        </div>

                        <div className="liquid-glass overflow-hidden rounded-lg">
                            {subsLoading ? (
                                <div className="flex flex-col items-center justify-center p-12 text-white/40"><Loader2 className="mb-3 h-6 w-6 animate-spin" /><p className="text-xs">Querying database…</p></div>
                            ) : subscribers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-white/45">
                                    <Inbox className="mb-3 h-7 w-7 text-white/25" /><p className="text-sm">No subscribers match this query.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.12em] text-white/40 select-none">
                                                    <th className="px-6 py-4">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={subscribers.length > 0 && selectedIds.length === subscribers.length}
                                                            onChange={toggleSelectAll}
                                                            className="rounded border-white/20 bg-white/[0.03] text-sky-400 focus:ring-sky-400 focus:ring-offset-0 cursor-pointer h-4 w-4 transition"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => requestSort('name')}>Name <SortIcon columnKey="name" /></th>
                                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => requestSort('email')}>Email <SortIcon columnKey="email" /></th>
                                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => requestSort('status')}>Status <SortIcon columnKey="status" /></th>
                                                    <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition" onClick={() => requestSort('created_at')}>Registered <SortIcon columnKey="created_at" /></th>
                                                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.05]">
                                                {subscribers.map((sub) => {
                                                    const isExpanded = expandedSubId === sub.id;
                                                    const hasDetails = !!(
                                                        sub.first_name || sub.last_name || sub.account_type || 
                                                        sub.username || sub.user_profile || sub.location || 
                                                        sub.product_type || sub.license_name || sub.product_title
                                                    );

                                                    return (
                                                        <Fragment key={sub.id}>
                                                            <tr className={`transition hover:bg-white/[0.02] ${selectedIds.includes(sub.id) ? 'bg-sky-400/5' : ''} ${hasDetails ? 'cursor-pointer' : ''}`} onClick={() => {
                                                                if (hasDetails) {
                                                                    setExpandedSubId(isExpanded ? null : sub.id);
                                                                }
                                                            }}>
                                                                <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={selectedIds.includes(sub.id)}
                                                                        onChange={() => toggleSelect(sub.id)}
                                                                        className="rounded border-white/20 bg-white/[0.03] text-sky-400 focus:ring-sky-400 focus:ring-offset-0 cursor-pointer h-4 w-4 transition"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-3.5 text-white/90">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{sub.name}</span>
                                                                        {hasDetails && (
                                                                            <span className="text-white/25 hover:text-white/50 transition" title="Click to view detailed data">
                                                                                <Eye className={`h-3.5 w-3.5 ${isExpanded ? 'text-sky-400' : ''}`} />
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {sub.tags && sub.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {sub.tags.map(t => (
                                                                                <span key={t} className="rounded bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-sky-300">
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-3.5 text-white/55">{sub.email}</td>
                                                                <td className="px-6 py-3.5">
                                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sub.status === 'subscribed' ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border border-white/10 bg-white/[0.03] text-white/45'}`}>
                                                                        {sub.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3.5 text-white/40">{new Date(sub.created_at).toLocaleDateString()}</td>
                                                                <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="flex items-center justify-end gap-3">
                                                                        <button onClick={() => { setEditingSub(sub); setIsEditSubOpen(true); }} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-200/80 transition hover:text-sky-100"><Pencil className="h-3 w-3" /> Edit</button>
                                                                        {sub.status === 'subscribed' && (
                                                                            <button onClick={() => handleUnsubscribeSubscriber(sub.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-300/80 transition hover:text-rose-300"><Ban className="h-3 w-3" /> Suppress</button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {isExpanded && hasDetails && (
                                                                <tr className="bg-[#030712]/40 border-b border-white/[0.04]">
                                                                    <td colSpan={6} className="px-10 py-5 bg-sky-500/[0.01]">
                                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-xs">
                                                                            {sub.first_name && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">First Name</span>
                                                                                    <span className="text-white/80 font-medium">{sub.first_name}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.last_name && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Last Name</span>
                                                                                    <span className="text-white/80 font-medium">{sub.last_name}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.username && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Username</span>
                                                                                    <span className="text-sky-300 font-mono">@{sub.username}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.account_type && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Account Type</span>
                                                                                    <span className="text-white/80 font-medium">{sub.account_type}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.location && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Location</span>
                                                                                    <span className="text-white/80 font-medium">{sub.location}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.product_type && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Product Type</span>
                                                                                    <span className="text-white/80 font-medium">{sub.product_type}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.license_name && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">License</span>
                                                                                    <span className="text-amber-400 font-semibold">{sub.license_name}</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.product_title && (
                                                                                <div>
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-0.5 font-bold">Product Purchased</span>
                                                                                    <span className="text-sky-200 font-medium italic">"{sub.product_title}"</span>
                                                                                </div>
                                                                            )}
                                                                            {sub.user_profile && (
                                                                                <div className="col-span-2 sm:col-span-4 border-t border-white/[0.04] pt-3 mt-1">
                                                                                    <span className="block text-white/30 uppercase tracking-wider text-[9px] mb-1 font-bold">Profile Link</span>
                                                                                    <a href={sub.user_profile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 hover:underline font-medium break-all transition">
                                                                                        {sub.user_profile} <Globe className="h-3 w-3" />
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/[0.07] px-6 py-4 bg-white/[0.01]">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center gap-4 text-xs text-white/45">
                                            <span>
                                                Showing <span className="font-semibold text-white">{filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
                                                <span className="font-semibold text-white">{Math.min(filteredCount, currentPage * pageSize)}</span> of{' '}
                                                <span className="font-semibold text-white">{filteredCount}</span> subscribers
                                            </span>
                                            <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                                                <span>Show</span>
                                                <select
                                                    value={pageSize}
                                                    onChange={(e) => {
                                                        const newSize = parseInt(e.target.value);
                                                        setPageSize(newSize);
                                                        setCurrentPage(1);
                                                        loadSubscribers(1, undefined, newSize);
                                                    }}
                                                    className="rounded border border-white/10 bg-[#050505] px-1.5 py-0.5 text-xs text-white outline-none focus:border-sky-300/50 cursor-pointer"
                                                >
                                                    <option value="10">10</option>
                                                    <option value="25">25</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                                <span>entries</span>
                                            </div>
                                        </div>
                                        {filteredCount > pageSize && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={currentPage === 1 || subsLoading}
                                                    onClick={() => {
                                                        const newPage = currentPage - 1;
                                                        setCurrentPage(newPage);
                                                        loadSubscribers(newPage);
                                                    }}
                                                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    Previous
                                                </button>
                                                <div className="text-xs text-white/50 px-1">
                                                    Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
                                                    <span className="font-semibold text-white">{Math.ceil(filteredCount / pageSize)}</span>
                                                </div>
                                                <button
                                                    disabled={currentPage >= Math.ceil(filteredCount / pageSize) || subsLoading}
                                                    onClick={() => {
                                                        const newPage = currentPage + 1;
                                                        setCurrentPage(newPage);
                                                        loadSubscribers(newPage);
                                                    }}
                                                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* BROADCASTS */}
                {activeTab === 'broadcasts' && (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <div className="flex items-center justify-between">
                                <Eyebrow>Broadcast history</Eyebrow>
                                <button onClick={() => setIsCreateCampaignOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-[#030405] transition hover:bg-white/90">
                                    <Plus className="h-3.5 w-3.5" /> Create broadcast
                                </button>
                            </div>

                            {campaignProgress && (
                                <div className="liquid-glass-strong relative overflow-hidden rounded-lg p-6">
                                    <div className="absolute left-0 top-0 h-0.5 w-full animate-pulse bg-sky-300 shadow-[0_0_12px_#7dd3fc]" />
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-sky-100">
                                                <Radio className="h-3 w-3 animate-pulse" /> Live monitor
                                            </span>
                                            <h3 className="mt-2 font-display text-lg font-semibold text-white">{campaignProgress.campaign.subject}</h3>
                                        </div>
                                        <button onClick={() => { setMonitoringCampaignId(null); setCampaignProgress(null); }} className="text-white/40 transition hover:text-white"><X className="h-4 w-4" /></button>
                                    </div>
                                    {(() => {
                                        const { stats: s } = campaignProgress;
                                        const finished = s.sent + s.skipped + s.cancelled;
                                        const total = s.total || 1;
                                        const pct = Math.round((finished / total) * 100);
                                        return (
                                            <div className="space-y-4">
                                                <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/[0.07] bg-white/[0.03]">
                                                    <div className="h-full rounded-full bg-sky-300 transition-all duration-500" style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                    {[['Delivered', s.sent, 'text-white'], ['Processing', s.sending + s.pending, 'text-sky-300'], ['Failures', s.failed, s.failed > 0 ? 'text-rose-300' : 'text-white/50'], ['Complete', `${pct}%`, 'text-white']].map(([l, v, c]) => (
                                                        <div key={l as string} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                                                            <p className="text-[10px] uppercase tracking-wider text-white/40">{l}</p>
                                                            <p className={`mt-0.5 font-display text-lg font-semibold ${c}`}>{v}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {campaignsLoading ? (
                                <div className="liquid-glass flex flex-col items-center justify-center rounded-lg p-12 text-white/40"><Loader2 className="mb-3 h-6 w-6 animate-spin" /><p className="text-xs">Loading broadcasts…</p></div>
                            ) : campaigns.length === 0 ? (
                                <div className="liquid-glass flex flex-col items-center justify-center rounded-lg p-12 text-center text-white/45">
                                    <Send className="mb-3 h-7 w-7 text-white/25" /><p className="text-sm">No broadcasts yet. Create your first draft.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaigns.map((camp) => {
                                        const isScheduled = camp.status === 'queued' && camp.scheduled_for && new Date(camp.scheduled_for) > new Date();
                                        const statusText = isScheduled ? 'scheduled' : camp.status;
                                        const badge = isScheduled ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                                            : camp.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                : camp.status === 'draft' ? 'border-white/10 bg-white/[0.03] text-white/50'
                                                    : camp.status === 'paused' ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                                                        : 'border-sky-400/20 bg-sky-400/10 text-sky-300';
                                        return (
                                            <div key={camp.id} className="liquid-glass flex flex-col gap-4 rounded-lg p-5 md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${badge}`}>{statusText}</span>
                                                        <span className="text-[10px] uppercase tracking-wider text-white/40">{camp.template_type.replace('_', ' ')}</span>
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-white">{camp.subject}</h3>
                                                    {camp.target_tags && camp.target_tags.length > 0 && (
                                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                            <span className="text-[9px] text-white/40">Target:</span>
                                                            {camp.target_tags.map(t => (
                                                                <span key={t} className="rounded bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 text-[8px] font-semibold text-sky-300">
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {camp.status !== 'draft' && camp.sent_recipients !== undefined && camp.sent_recipients > 0 && (
                                                        <div className="text-[10px] text-white/50 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                            <span>Delivered: <strong className="text-white">{camp.sent_recipients}</strong></span>
                                                            <span>Opens: <strong className="text-white">{Math.round((camp.opened_recipients || 0) / camp.sent_recipients * 100)}%</strong> ({camp.opened_recipients})</span>
                                                            <span>Clicks: <strong className="text-white">{Math.round((camp.clicked_recipients || 0) / camp.sent_recipients * 100)}%</strong> ({camp.clicked_recipients})</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-[10px] text-white/35 flex-wrap">
                                                        <span>Created {new Date(camp.created_at).toLocaleString()}</span>
                                                        {isScheduled && camp.scheduled_for && (
                                                            <span className="text-amber-300/80 font-medium">· Scheduled for {new Date(camp.scheduled_for).toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {(camp.status === 'queued' || camp.status === 'sending') && (
                                                        <button onClick={() => handlePauseCampaign(camp.id)} className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/15"><Pause className="h-3 w-3" /> Pause</button>
                                                    )}
                                                    {(camp.status === 'draft' || camp.status === 'paused') && (
                                                        <button onClick={() => handleStartCampaign(camp.id)} className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/15"><Play className="h-3 w-3" /> Start</button>
                                                    )}
                                                    {(camp.status === 'queued' || camp.status === 'sending' || camp.status === 'paused') && (
                                                        <button onClick={() => handleAbortCampaign(camp.id)} className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/15"><X className="h-3 w-3" /> Cancel</button>
                                                    )}
                                                    {camp.status !== 'draft' && (
                                                        <button onClick={() => { setMonitoringCampaignId(camp.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:text-white"><Radio className="h-3 w-3" /> Monitor</button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="liquid-glass rounded-lg p-6">
                            <Eyebrow>Delivery engine</Eyebrow>
                            <ul className="mt-4 space-y-3 text-xs leading-relaxed text-white/55">
                                <li className="flex gap-2"><span className="text-sky-300">·</span> Emails go out in throttled batches of <strong className="text-white">10</strong>, driven every 10 min by a Cloudflare cron.</li>
                                <li className="flex gap-2"><span className="text-sky-300">·</span> Queue rows lock with <code className="text-sky-200">SKIP LOCKED</code> so parallel workers never double-send.</li>
                                <li className="flex gap-2"><span className="text-sky-300">·</span> SMTP sends happen outside DB transactions to protect the connection pool.</li>
                                <li className="flex gap-2"><span className="text-sky-300">·</span> Each email carries a signed unsubscribe token — no raw email is ever exposed.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* SEO Tab — Google Search Console integration */}
                {activeTab === 'seo' && (
                    <div className="space-y-6">
                        {seoLoading && !seoMetrics ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
                            </div>
                        ) : !seoMetrics ? (
                            <div className="liquid-glass-strong rounded-lg p-8 text-center">
                                <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500/80" />
                                <h2 className="font-display text-2xl font-semibold text-white">SEO Telemetry Unavailable</h2>
                                <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
                                    Could not connect to Google Search Console. Check your backend logs.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Banner for Demo Mode / Setup Guide */}
                                {!seoConnected && (
                                    <div className="liquid-glass-strong border border-amber-500/20 bg-amber-500/5 rounded-lg p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <h3 className="font-display text-base font-semibold text-amber-200">Running in Setup / Demo Mode</h3>
                                                    <p className="mt-1 text-xs text-white/55 leading-relaxed">
                                                        Showing simulated data for <strong className="text-white">virzyguns.com</strong>. Connect your real Google Search Console property by following these steps:
                                                    </p>
                                                </div>
                                                <ol className="list-decimal list-inside text-[11px] space-y-2 text-white/50 leading-relaxed pl-1">
                                                    <li>Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-sky-300 underline">Google Cloud Console</a> and enable the <strong>Google Search Console API</strong>.</li>
                                                    <li>Create a <strong>Service Account</strong> in IAM & Admin &rarr; Service Accounts. Generate and download a key in <strong>JSON</strong> format.</li>
                                                    <li>Go to your <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-sky-300 underline">Google Search Console</a>, select the property <strong>sc-domain:virzyguns.com</strong>.</li>
                                                    <li>Under Settings &rarr; Users and Permissions, add the Service Account's email (e.g., <code className="text-sky-200">my-account@...gserviceaccount.com</code>) as a user with <strong>Restricted (Read-only)</strong> permissions.</li>
                                                    <li>Add the environment variable <strong>`GOOGLE_SERVICE_ACCOUNT_JSON`</strong> in Vercel. Set its value to the exact raw text of the downloaded JSON key file, then redeploy.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {seoConnected && (
                                    <div className="liquid-glass border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-4 flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
                                        <p className="text-xs text-emerald-200">
                                            Connected successfully via Service Account: <strong className="text-white">{seoClientEmail}</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Key Metrics Cards */}
                                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                    <StatCard label="Total Clicks" value={seoMetrics.clicks} Icon={Search} />
                                    <StatCard label="Total Impressions" value={seoMetrics.impressions} Icon={Users} accent="text-sky-300" />
                                    <StatCard label="Average CTR" value={seoMetrics.ctr} Icon={TrendingUp} accent="text-emerald-300" />
                                    <StatCard label="Average Position" value={seoMetrics.position} Icon={LayoutDashboard} accent="text-amber-300" />
                                </div>

                                {/* Graph / Chart */}
                                <div className="liquid-glass rounded-lg p-6">
                                    <Eyebrow>Organic search performance (30 days)</Eyebrow>
                                    <SeoChart data={seoMetrics.chart} />
                                    <div className="mt-3 flex justify-between text-[10px] text-white/35">
                                        <span>30 days ago</span>
                                        <span>Clicks Trend</span>
                                        <span>3 days ago</span>
                                    </div>
                                </div>

                                {/* Top Keywords Table */}
                                <div className="liquid-glass overflow-hidden rounded-lg">
                                    <div className="border-b border-white/[0.07] px-6 py-4">
                                        <Eyebrow>Top Search Queries</Eyebrow>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.12em] text-white/40">
                                                    <th className="px-6 py-3 font-semibold">Search query</th>
                                                    <th className="px-6 py-3 font-semibold">Clicks</th>
                                                    <th className="px-6 py-3 font-semibold">Impressions</th>
                                                    <th className="px-6 py-3 font-semibold">CTR</th>
                                                    <th className="px-6 py-3 font-semibold">Position</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.05] text-white/80">
                                                {seoMetrics.queries?.map((q: any) => (
                                                    <tr key={q.query} className="transition hover:bg-white/[0.02]">
                                                        <td className="px-6 py-3 text-white font-medium">{q.query}</td>
                                                        <td className="px-6 py-3">{q.clicks}</td>
                                                        <td className="px-6 py-3 text-white/55">{q.impressions}</td>
                                                        <td className="px-6 py-3 text-sky-200">{q.ctr}</td>
                                                        <td className="px-6 py-3 text-amber-200">{q.position}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CADENZ — honest not-yet-connected module */}
                {activeTab === 'cadenz' && (
                    <div className="space-y-5">
                        <div className="liquid-glass-strong rounded-lg p-8 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100"><Smartphone className="h-6 w-6" /></div>
                            <h2 className="font-display text-2xl font-semibold text-white">CADENZ telemetry</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
                                Not connected yet. This panel stays empty on purpose — no placeholder numbers. It lights up once the mobile app reports events.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {([
                                { title: 'Active users', desc: 'DAU / MAU', Icon: Users },
                                { title: 'Installs & versions', desc: 'adoption per release', Icon: Smartphone },
                                { title: 'Stability', desc: 'crash-free sessions', Icon: AlertTriangle },
                            ] as { title: string; desc: string; Icon: typeof Users }[]).map(({ title, desc, Icon }) => (
                                <div key={title} className="liquid-glass-soft rounded-lg p-5 opacity-70">
                                    <Icon className="h-5 w-5 text-sky-200/50" />
                                    <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                                    <p className="mt-1 text-xs text-white/40">{desc}</p>
                                    <p className="mt-3 text-[10px] uppercase tracking-wider text-white/30">Awaiting app integration</p>
                                </div>
                            ))}
                        </div>
                        <div className="liquid-glass rounded-lg p-6">
                            <Eyebrow>Integration path</Eyebrow>
                            <p className="mt-3 text-xs leading-relaxed text-white/55">
                                CADENZ already runs on Supabase + CloudFront. To surface metrics here, the app writes events to a Supabase table (e.g. <code className="text-sky-200">cadenz_events</code>); this dashboard reads aggregates from a <code className="text-sky-200">/api/founder/cadenz</code> route. Until that emits real rows, nothing is shown.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {isAddSubOpen && (
                <ModalShell title="Add subscriber" onClose={() => setIsAddSubOpen(false)}>
                    <form onSubmit={handleAddSubscriber} className="space-y-4">
                        <Field label="Name"><input type="text" required value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className={inputClass} /></Field>
                        <Field label="Email address"><input type="email" required value={newSub.email} onChange={(e) => setNewSub({ ...newSub, email: e.target.value })} className={inputClass} /></Field>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Audience Segments</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {standardTags.map(tag => {
                                    const isChecked = newSub.tags.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => {
                                                const next = isChecked 
                                                    ? newSub.tags.filter(t => t !== tag)
                                                    : [...newSub.tags, tag];
                                                setNewSub({ ...newSub, tags: next });
                                            }}
                                            className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition ${
                                                isChecked 
                                                    ? 'border-sky-400 bg-sky-400/10 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                                                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-semibold">{tagLabelMap[tag]}</span>
                                            <span className="text-[9px] opacity-60 mt-0.5">{tag}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <Field label="Other Custom Tags (comma-separated)">
                            <input 
                                type="text" 
                                placeholder="e.g. artist, vip" 
                                value={newSub.tags.filter(t => !standardTags.includes(t)).join(', ')} 
                                onChange={(e) => {
                                    const activeStandards = newSub.tags.filter(t => standardTags.includes(t));
                                    const newCustoms = e.target.value.split(',').map(t => t.trim().toLowerCase()).filter(t => t && !standardTags.includes(t));
                                    setNewSub({ ...newSub, tags: Array.from(new Set([...activeStandards, ...newCustoms])) });
                                }} 
                                className={inputClass} 
                            />
                        </Field>
                        <SubmitButton loading={subActionLoading} label="Add subscriber" />
                    </form>
                </ModalShell>
            )}

            {isEditSubOpen && editingSub && (
                <ModalShell title="Edit subscriber" onClose={() => { setIsEditSubOpen(false); setEditingSub(null); }}>
                    <form onSubmit={handleEditSubscriber} className="space-y-4">
                        <Field label="Name"><input type="text" required value={editingSub.name} onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })} className={inputClass} /></Field>
                        <Field label="Email address"><input type="email" required value={editingSub.email} onChange={(e) => setEditingSub({ ...editingSub, email: e.target.value })} className={inputClass} /></Field>
                        <Field label="Status">
                            <select value={editingSub.status} onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value })} className={inputClass}>
                                <option value="subscribed" className="bg-[#0a1b27]">Subscribed</option>
                                <option value="unsubscribed" className="bg-[#0a1b27]">Unsubscribed</option>
                            </select>
                        </Field>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Audience Segments</label>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                {standardTags.map(tag => {
                                    const current = editingSub.tags || [];
                                    const isChecked = current.includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => {
                                                const next = isChecked 
                                                    ? current.filter(t => t !== tag)
                                                    : [...current, tag];
                                                setEditingSub({ ...editingSub, tags: next });
                                            }}
                                            className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition ${
                                                isChecked 
                                                    ? 'border-sky-400 bg-sky-400/10 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                                                    : 'border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <span className="text-xs font-semibold">{tagLabelMap[tag]}</span>
                                            <span className="text-[9px] opacity-60 mt-0.5">{tag}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <Field label="Other Custom Tags (comma-separated)">
                            <input 
                                type="text" 
                                placeholder="e.g. artist, vip" 
                                value={(editingSub.tags || []).filter(t => !standardTags.includes(t)).join(', ')} 
                                onChange={(e) => {
                                    const current = editingSub.tags || [];
                                    const activeStandards = current.filter(t => standardTags.includes(t));
                                    const newCustoms = e.target.value.split(',').map(t => t.trim().toLowerCase()).filter(t => t && !standardTags.includes(t));
                                    setEditingSub({ ...editingSub, tags: Array.from(new Set([...activeStandards, ...newCustoms])) });
                                }} 
                                className={inputClass} 
                            />
                        </Field>
                        <SubmitButton loading={subActionLoading} label="Save changes" />
                    </form>
                </ModalShell>
            )}

            {isImportModalOpen && (
                <ModalShell 
                    title="Import subscribers from CSV" 
                    wide={importStep === 2} 
                    onClose={() => { setIsImportModalOpen(false); setImportStep(1); setImportPreviewData([]); }}
                >
                    <div className="space-y-4">
                        {importStep === 1 ? (
                            <>
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Apply Category (Optional)</label>
                                    <select value={importCategory} onChange={(e) => setImportCategory(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#050505] p-3 text-sm text-white outline-none focus:border-sky-300/50 mb-4">
                                        <option value="">Detect from CSV (or None)</option>
                                        <option value="cadenz">CADENZ</option>
                                        <option value="beat_buyer">Beat Buyer</option>
                                        <option value="book_buyer">Book Buyer</option>
                                    </select>
                                </div>
                                <p className="text-xs text-white/50 leading-relaxed">
                                    Upload a CSV file containing your subscriber list. The system supports column formats like 
                                    <code className="text-sky-200"> Name, Email, Tags</code> or just <code className="text-sky-200">Email</code>. 
                                    Multiple tags can be separated by semicolons (<code className="text-sky-200">;</code>) or pipe characters (<code className="text-sky-200">|</code>).
                                </p>
                                <div className="rounded-lg border border-dashed border-white/20 p-8 text-center bg-white/[0.01]">
                                    {importLoading ? (
                                        <div className="flex flex-col items-center justify-center py-4 text-white/40">
                                            <Loader2 className="mb-3 h-6 w-6 animate-spin text-sky-300" />
                                            <p className="text-xs">Parsing database records...</p>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-white/70">
                                                <Plus className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-semibold text-white">Choose CSV File</span>
                                            <input 
                                                type="file" 
                                                accept=".csv" 
                                                onChange={handleImportCSV} 
                                                className="hidden" 
                                            />
                                        </label>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-center">
                                        <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-400">Valid</span>
                                        <p className="mt-0.5 text-lg font-bold text-emerald-300">
                                            {importPreviewData.filter(r => r.quality === 'valid').length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-center">
                                        <span className="text-2xs font-semibold uppercase tracking-wider text-amber-400">Warnings</span>
                                        <p className="mt-0.5 text-lg font-bold text-amber-300">
                                            {importPreviewData.filter(r => r.quality === 'warning').length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 text-center">
                                        <span className="text-2xs font-semibold uppercase tracking-wider text-rose-400">Invalid</span>
                                        <p className="mt-0.5 text-lg font-bold text-rose-300">
                                            {importPreviewData.filter(r => r.quality === 'invalid').length}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-[#0c0a09]/30 p-3 transition hover:bg-amber-500/[0.04]">
                                    <input 
                                        type="checkbox" 
                                        id="excludeWarnings"
                                        checked={excludeWarnings}
                                        onChange={(e) => setExcludeWarnings(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 bg-black text-sky-400 focus:ring-sky-400/50 focus:ring-2 accent-sky-400 cursor-pointer"
                                    />
                                    <label htmlFor="excludeWarnings" className="cursor-pointer text-xs font-medium text-white/80 select-none">
                                        Exclude rows with warnings (e.g. missing name or suspicious domain)
                                    </label>
                                </div>

                                <div className="max-h-60 overflow-y-auto border border-white/[0.08] rounded-lg">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-white/[0.02] border-b border-white/[0.08] text-white/40 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Name</th>
                                                <th className="px-4 py-2 font-semibold">Email</th>
                                                <th className="px-4 py-2 font-semibold">Tags</th>
                                                <th className="px-4 py-2 font-semibold">Quality</th>
                                                <th className="px-4 py-2 font-semibold">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.04]">
                                            {importPreviewData.map((row, idx) => {
                                                const isExcluded = excludeWarnings && row.quality === 'warning';
                                                return (
                                                    <tr key={idx} className={`hover:bg-white/[0.01] transition-opacity duration-200 ${isExcluded ? 'opacity-35 line-through decoration-white/10' : ''}`}>
                                                        <td className="px-4 py-2 font-medium text-white/80">{row.name}</td>
                                                        <td className="px-4 py-2 text-white/70">{row.email}</td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex flex-wrap gap-1">
                                                                {row.tags.length > 0 ? (
                                                                    row.tags.map(t => (
                                                                        <span key={t} className="rounded bg-sky-400/10 px-1 py-0.5 text-[10px] text-sky-300 font-semibold">{t}</span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-white/20 font-light italic">None</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            {row.quality === 'valid' && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                                    Valid
                                                                </span>
                                                            )}
                                                            {row.quality === 'warning' && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                                    Warning
                                                                </span>
                                                            )}
                                                            {row.quality === 'invalid' && (
                                                                <span className="inline-flex items-center gap-1 rounded bg-rose-400/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                                                    Invalid
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-white/45 truncate max-w-[150px]" title={row.reason}>
                                                            {row.reason || <span className="text-white/20">—</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => { setImportStep(1); setImportPreviewData([]); }}
                                        className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 transition hover:text-white hover:bg-white/[0.06]"
                                    >
                                        Back
                                    </button>
                                    <button
                                        disabled={
                                            importLoading || 
                                            importPreviewData.filter(r => {
                                                if (r.quality === 'invalid') return false;
                                                if (excludeWarnings && r.quality === 'warning') return false;
                                                return true;
                                            }).length === 0
                                        }
                                        onClick={handleConfirmImport}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-[#030405] transition hover:bg-sky-300 disabled:opacity-50"
                                    >
                                        {importLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                        Import {
                                            importPreviewData.filter(r => {
                                                if (r.quality === 'invalid') return false;
                                                if (excludeWarnings && r.quality === 'warning') return false;
                                                return true;
                                            }).length
                                        } Subscribers
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </ModalShell>
            )}

            {isCreateCampaignOpen && (
                <ModalShell title="Create broadcast" wide onClose={() => setIsCreateCampaignOpen(false)}>
                    <div className="flex border-b border-white/10 mb-4">
                        <button type="button" onClick={() => setPreviewActive(false)} className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${!previewActive ? 'border-sky-300 text-sky-200' : 'border-transparent text-white/50 hover:text-white'}`}>Editor</button>
                        <button type="button" onClick={() => setPreviewActive(true)} className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${previewActive ? 'border-sky-300 text-sky-200' : 'border-transparent text-white/50 hover:text-white'}`}>Live Preview</button>
                    </div>

                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                        {previewActive ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-white/10 overflow-hidden bg-black h-[400px]">
                                    <iframe 
                                        title="Email Preview"
                                        srcDoc={getEmailPreviewHtml(
                                            newCampaign.subject, 
                                            newCampaign.template_type, 
                                            newCampaign.body_content, 
                                            subscribers.length > 0 && subscribers[0].name ? subscribers[0].name : '',
                                            subscribers.length > 0 ? subscribers[0].email : ''
                                        )} 
                                        className="w-full h-full border-0 bg-[#050505]" 
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setPreviewActive(false)} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 transition hover:text-white">Back to Editor</button>
                                    <SubmitButton loading={campaignActionLoading} label="Create broadcast" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <Field label="Subject line"><input type="text" required placeholder="e.g. Welcome to the Inner Circle" value={newCampaign.subject} onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })} className={inputClass} /></Field>
                                <Field label="Template">
                                    <select value={newCampaign.template_type} onChange={(e) => setNewCampaign({ ...newCampaign, template_type: e.target.value })} className={inputClass}>
                                        <option value="inner_circle" className="bg-[#0a1b27]">Inner Circle (standard text)</option>
                                        <option value="beat_promo" className="bg-[#0a1b27]">Beat Promo (product feature)</option>
                                        <option value="cadenz_update" className="bg-[#0a1b27]">CADENZ Update (R&D)</option>
                                        <option value="book_reader" className="bg-[#0a1b27]">Book / Guide (VGP Library)</option>
                                    </select>
                                </Field>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Target Audience segments</label>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        {standardTags.map(tag => {
                                            const isChecked = newCampaign.target_tags.includes(tag);
                                            return (
                                                <button
                                                    type="button"
                                                    key={tag}
                                                    onClick={() => {
                                                        const next = isChecked 
                                                            ? newCampaign.target_tags.filter(t => t !== tag)
                                                            : [...newCampaign.target_tags, tag];
                                                        setNewCampaign({ ...newCampaign, target_tags: next });
                                                    }}
                                                    className={`flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-center transition ${
                                                        isChecked 
                                                            ? 'border-sky-400 bg-sky-400/10 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]' 
                                                            : 'border-white/10 bg-white/[0.02] text-white/50 hover:bg-white/[0.05] hover:text-white'
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold">{tagLabelMap[tag]}</span>
                                                    <span className="text-[9px] opacity-60 mt-0.5">{tag}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Field label="Other Custom Target Tags (comma-separated)">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. artist, vip" 
                                        value={newCampaign.target_tags.filter(t => !standardTags.includes(t)).join(', ')} 
                                        onChange={(e) => {
                                            const activeStandards = newCampaign.target_tags.filter(t => standardTags.includes(t));
                                            const newCustoms = e.target.value.split(',').map(t => t.trim().toLowerCase()).filter(t => t && !standardTags.includes(t));
                                            setNewCampaign({ ...newCampaign, target_tags: Array.from(new Set([...activeStandards, ...newCustoms])) });
                                        }} 
                                        className={inputClass} 
                                    />
                                    <p className="mt-1 text-[10px] text-white/40">Leave segments unselected and custom tags blank to broadcast to all subscribers.</p>
                                </Field>
                                <Field label="Schedule sending (optional, leave blank to send immediately)">
                                    <input type="datetime-local" value={newCampaign.scheduled_for} onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_for: e.target.value })} className={inputClass} />
                                </Field>
                                <Field label="Message body">
                                    <textarea rows={8} required placeholder="Write your email body…" value={newCampaign.body_content} onChange={(e) => setNewCampaign({ ...newCampaign, body_content: e.target.value })} className={`${inputClass} leading-relaxed`} />
                                    {(() => {
                                        const analysis = analyzeSpamScore(newCampaign.body_content);
                                        if (!newCampaign.body_content.trim()) return null;
                                        return (
                                            <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-2xs font-semibold uppercase tracking-wider text-white/45">Spam Potential Score</span>
                                                        {analysis.risk === 'low' && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-3xs font-bold text-emerald-400">Low Risk</span>}
                                                        {analysis.risk === 'medium' && <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-3xs font-bold text-amber-400">Medium Risk</span>}
                                                        {analysis.risk === 'high' && <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-3xs font-bold text-rose-400">High Risk</span>}
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-white/80">Score: {analysis.score.toFixed(1)}</span>
                                                </div>
                                                
                                                {/* Score Bar */}
                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${
                                                            analysis.risk === 'low' ? 'bg-emerald-400' :
                                                            analysis.risk === 'medium' ? 'bg-amber-400' : 'bg-rose-400'
                                                        }`}
                                                        style={{ width: `${Math.min((analysis.score / 8) * 100, 100)}%` }}
                                                    />
                                                </div>

                                                {analysis.triggers.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-3xs font-semibold uppercase tracking-wider text-white/30">Triggered Rules:</span>
                                                        <ul className="list-inside list-disc text-3xs text-white/50 space-y-0.5">
                                                            {analysis.triggers.map((t, idx) => (
                                                                <li key={idx}>{t}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </Field>
                                <SubmitButton loading={campaignActionLoading} label="Create broadcast" />
                            </>
                        )}
                    </form>
                </ModalShell>
            )}

            {/* ── Confirm dialog ── */}
            {confirmState && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4" onClick={() => setConfirmState(null)}>
                    <div className="liquid-glass-strong w-full max-w-sm rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-300"><AlertTriangle className="h-4 w-4" /></div>
                            <h3 className="font-display text-base font-semibold text-white">Please confirm</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-white/60">{confirmState.message}</p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setConfirmState(null)} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white/70 transition hover:text-white">Cancel</button>
                            <button onClick={() => { confirmState.onConfirm(); setConfirmState(null); }} className="rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold text-[#030405] transition hover:bg-white/90">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {toast && (
                <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 px-4">
                    <div className={`flex items-center gap-3.5 rounded-full border px-5 py-3 text-sm font-medium backdrop-blur-xl ${toast.type === 'success' ? 'border-sky-500/35 bg-[#0b1b2b]/95 text-sky-200 shadow-[0_0_20px_rgba(0,229,255,0.15)]' : 'border-rose-500/25 bg-rose-500/15 text-rose-200'}`}>
                        {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-sky-400" /> : <AlertTriangle className="h-4 w-4" />}
                        <span>{toast.message}</span>
                        {toast.action && (
                            <button
                                onClick={async () => {
                                    await toast.action?.onClick();
                                    setToast(null);
                                }}
                                className="ml-2 rounded-full bg-sky-400 px-3.5 py-1 text-xs font-bold text-black transition hover:bg-sky-300 hover:scale-105 active:scale-95"
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                </div>
            )}
            </div>
        </main>
    );
}

// ── Modal primitives ───────────────────────────────────────────────────
const inputClass = 'w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-sky-300/50';

function ModalShell({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className={`liquid-glass-strong w-full rounded-lg p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-white/40 transition hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-white/45">{label}</label>
            {children}
        </div>
    );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
    return (
        <button type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white py-2.5 text-sm font-semibold text-[#030405] transition hover:bg-white/90 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Working…' : label}
        </button>
    );
}
