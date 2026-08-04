'use client';

import { useEffect, useRef } from 'react';
import {
    CalendarClock,
    CircleAlert,
    ExternalLink,
    Mail,
    Music2,
    ShieldCheck,
    X,
} from 'lucide-react';
import type { Prospect } from '@/lib/founder-os/contracts';
import type { BeatMatchSummary } from '@/app/founder/os/demo-data';
import {
    FreshnessPill,
    SafetyNotice,
    ScoreBar,
    TextLink,
} from './FounderOsPrimitives';

const SCORE_FIELDS = [
    ['Audience fit', 'audienceFit', 20],
    ['Style fit', 'styleFit', 30],
    ['Purchase intent', 'purchaseIntent', 20],
    ['Contactability', 'contactability', 20],
    ['Freshness', 'freshness', 10],
] as const;

function formatObservedAt(value: string | null) {
    if (!value) return 'Observation time unavailable';
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(new Date(value));
}

function contactPermissionLabel(permission: Prospect['contactPermission']) {
    const labels: Record<Prospect['contactPermission'], string> = {
        'public-business-email': 'Public business email',
        'verified-opt-in': 'Verified opt-in',
        'manual-only': 'Manual handoff only',
        blocked: 'Contact blocked',
    };
    return labels[permission];
}

export function ProspectDetailDrawer({
    prospect,
    beats,
    onClose,
}: {
    prospect: Prospect;
    beats: BeatMatchSummary[];
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = `prospect-detail-${prospect.id}`;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();

        return () => {
            if (dialog.open) dialog.close();
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
            className="m-0 ml-auto h-dvh max-h-none w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#030b11] p-0 text-white shadow-[-32px_0_100px_rgba(0,0,0,0.65)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#030b11]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-200">
                            {prospect.segment.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-white/35">{prospect.market}</span>
                    </div>
                    <h2 id={titleId} className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                        {prospect.displayName}
                    </h2>
                    <p className="mt-1 text-sm text-white/45">
                        {prospect.handle || 'No verified public handle'} · {prospect.platform}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    aria-label="Close prospect details"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <p className="text-xs text-white/40">Qualification score</p>
                        <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{prospect.score}</p>
                        <p className="mt-1 text-[11px] text-emerald-200">Qualified ≥ 70</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <p className="text-xs text-white/40">Contact path</p>
                        <p className="mt-2 text-sm font-semibold text-white/85">
                            {contactPermissionLabel(prospect.contactPermission)}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-white/35">
                            {prospect.businessEmail || 'No email stored'}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                        <p className="text-xs text-white/40">Last observed</p>
                        <p className="mt-2 text-sm font-semibold text-white/85">
                            {formatObservedAt(prospect.lastObservedAt)}
                        </p>
                        <p className="mt-1 text-[11px] text-white/35">UTC · source freshness applies</p>
                    </div>
                </div>

                <section className="rounded-[1.3rem] border border-white/[0.07] bg-white/[0.02] p-5">
                    <h3 className="text-sm font-semibold">Why this lead scored {prospect.score}</h3>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {SCORE_FIELDS.map(([label, key, max]) => (
                            <ScoreBar
                                key={key}
                                label={label}
                                value={prospect.scoreBreakdown[key]}
                                max={max}
                            />
                        ))}
                    </div>
                </section>

                <section className="rounded-[1.3rem] border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">Evidence-backed signals</h3>
                    </div>
                    <ul className="mt-4 space-y-3">
                        {prospect.signals.map((signal) => (
                            <li key={signal} className="flex gap-3 text-sm leading-6 text-white/65">
                                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                                {signal}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-[1.3rem] border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                        <CircleAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">Gaps before outreach</h3>
                    </div>
                    <ul className="mt-4 space-y-3">
                        {prospect.gaps.map((gap) => (
                            <li key={gap} className="flex gap-3 text-sm leading-6 text-white/60">
                                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                                {gap}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-[1.3rem] border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Music2 className="h-4 w-4 text-sky-200" aria-hidden="true" />
                            <h3 className="text-sm font-semibold">Matched beats</h3>
                        </div>
                        <span className="text-[11px] text-white/35">Maximum 3 per outreach</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {beats.length > 0 ? (
                            beats.map((beat) => (
                                <article
                                    key={beat.id}
                                    className="rounded-2xl border border-white/[0.07] bg-black/20 p-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold">{beat.title}</p>
                                            <p className="mt-0.5 text-xs text-sky-200/70">
                                                {beat.genre}
                                            </p>
                                        </div>
                                        {beat.href ? (
                                            <TextLink href={beat.href}>Store</TextLink>
                                        ) : (
                                            <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-2 py-1 text-[10px] text-amber-100">
                                                Catalog link missing
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-3 text-xs leading-5 text-white/50">
                                        {beat.reason}
                                    </p>
                                    <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-white/45">
                                        {beat.offerLabel}
                                    </p>
                                </article>
                            ))
                        ) : (
                            <p className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-xs leading-5 text-white/40">
                                No canonical beat reference is stored for this prospect.
                            </p>
                        )}
                    </div>
                </section>

                <section className="rounded-[1.3rem] border border-white/[0.07] bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-sky-200" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">Evidence and freshness</h3>
                    </div>
                    <div className="mt-4 space-y-3">
                        {prospect.evidence.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium">{item.label}</p>
                                        <p className="mt-1 text-[11px] text-white/35">
                                            {item.sourceType.replaceAll('-', ' ')} ·{' '}
                                            {formatObservedAt(item.observedAt)}
                                        </p>
                                    </div>
                                    <FreshnessPill freshness={item.freshness} />
                                </div>
                                {item.note ? (
                                    <p className="mt-3 text-xs leading-5 text-white/45">{item.note}</p>
                                ) : null}
                                {item.url ? (
                                    <div className="mt-3">
                                        <TextLink href={item.url}>
                                            Inspect source
                                            <ExternalLink className="sr-only" />
                                        </TextLink>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-[11px] text-amber-100/65">
                                        Source URL missing — keep this evidence out of automated
                                        qualification until a canonical URL is stored.
                                    </p>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <SafetyNotice
                    title={
                        prospect.contactPermission === 'manual-only'
                            ? 'Manual handoff only'
                            : 'Approval is still mandatory'
                    }
                    tone={prospect.contactPermission === 'manual-only' ? 'warning' : 'safe'}
                >
                    {prospect.contactPermission === 'manual-only' ? (
                        <>
                            The agent may prepare copy, but it cannot initiate a cold Instagram or TikTok DM.
                        </>
                    ) : (
                        <>
                            <span className="inline-flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                A public business email permits drafting, never automatic sending. The founder
                                must approve the exact recipient, content hash, links, and offer.
                            </span>
                        </>
                    )}
                </SafetyNotice>

                <SafetyNotice title="Canonical recording offer" tone="info">
                    Basic MP3 is $15 for music recording, up to 2,000 copies, 5,000 online audio streams,
                    and one music video. Game or creator use stays in the custom-inquiry lane.
                </SafetyNotice>
            </div>
        </dialog>
    );
}
