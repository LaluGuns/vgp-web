'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import {
    ChevronRight,
    Filter,
    Gamepad2,
    MailCheck,
    Mic2,
    Search,
    UserRoundSearch,
    Video,
} from 'lucide-react';
import type { FounderMarket, Prospect, ProspectSegment } from '@/lib/founder-os/contracts';
import type { BeatMatchSummary } from '@/app/founder/os/demo-data';
import { ProspectDetailDrawer } from './ProspectDetailDrawer';
import { SafetyNotice, SectionHeading, Surface } from './FounderOsPrimitives';

type SegmentFilter = ProspectSegment | 'all';
type MarketFilter = FounderMarket | 'all';

const SEGMENT_OPTIONS: Array<{ id: SegmentFilter; label: string }> = [
    { id: 'all', label: 'All lanes' },
    { id: 'rapper', label: 'Rappers' },
    { id: 'game-developer', label: 'Game dev' },
    { id: 'content-creator', label: 'Creators' },
];

function segmentIcon(segment: ProspectSegment) {
    if (segment === 'rapper') return <Mic2 className="h-4 w-4" aria-hidden="true" />;
    if (segment === 'game-developer') return <Gamepad2 className="h-4 w-4" aria-hidden="true" />;
    return <Video className="h-4 w-4" aria-hidden="true" />;
}

function segmentLabel(segment: ProspectSegment) {
    if (segment === 'rapper') return 'Rapper';
    if (segment === 'game-developer') return 'Game developer';
    return 'Content creator';
}

function scoreTone(score: number) {
    if (score >= 80) return 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100';
    if (score >= 70) return 'border-sky-300/20 bg-sky-300/10 text-sky-100';
    return 'border-amber-300/20 bg-amber-300/10 text-amber-100';
}

function missingBeatSummary(id: string): BeatMatchSummary {
    return {
        id,
        title: `Unresolved beat reference: ${id}`,
        genre: 'Canonical catalog match missing',
        reason:
            'This prospect references a beat ID that is absent from the loaded canonical directory. Review the source before outreach.',
        href: null,
        offerLabel:
            'No license or availability claim is shown until the catalog identity is resolved.',
        resolution: 'missing',
    };
}

export function ProspectsPanel({
    prospects,
    beatDirectory,
    threshold,
}: {
    prospects: Prospect[];
    beatDirectory: Record<string, BeatMatchSummary>;
    threshold: number;
}) {
    const [segment, setSegment] = useState<SegmentFilter>('all');
    const [market, setMarket] = useState<MarketFilter>('all');
    const [query, setQuery] = useState('');
    const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
    const deferredQuery = useDeferredValue(query.trim().toLowerCase());

    const filteredProspects = useMemo(
        () =>
            prospects.filter((prospect) => {
                if (segment !== 'all' && prospect.segment !== segment) return false;
                if (market !== 'all' && prospect.market !== market) return false;
                if (
                    deferredQuery &&
                    !`${prospect.displayName} ${prospect.handle || ''} ${prospect.signals.join(' ')}`
                        .toLowerCase()
                        .includes(deferredQuery)
                ) {
                    return false;
                }
                return true;
            }),
        [deferredQuery, market, prospects, segment],
    );

    const selectedBeats = selectedProspect
        ? selectedProspect.matchedBeatIds.map(
              (id) => beatDirectory[id] ?? missingBeatSummary(id),
          )
        : [];

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Buyer pipeline"
                title="Qualified prospects, not a scraped contact dump."
                description="Rappers are the primary lane. Every lead shows evidence, freshness, missing information, contact permission, and the specific beats behind its score."
                action={
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-2 text-xs text-emerald-100">
                        <UserRoundSearch className="h-4 w-4" aria-hidden="true" />
                        {prospects.filter((prospect) => prospect.score >= threshold).length} qualified
                    </div>
                }
            />

            <SafetyNotice title="Outbound policy is locked" tone="safe">
                Agents may find public business contact paths and prepare drafts. They may not guess
                contact details, initiate cold social DMs, or send any message without founder approval.
            </SafetyNotice>

            <Surface className="p-4 sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_auto_auto]">
                    <label className="relative block">
                        <span className="sr-only">Search prospects</span>
                        <Search
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search name, handle, or signal"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-sky-300/40 focus:outline-none focus:ring-2 focus:ring-sky-300/15"
                        />
                    </label>

                    <div
                        className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1"
                        aria-label="Filter prospects by segment"
                    >
                        {SEGMENT_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSegment(option.id)}
                                aria-pressed={segment === option.id}
                                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                                    segment === option.id
                                        ? 'bg-white text-[#061019]'
                                        : 'text-white/45 hover:bg-white/[0.05] hover:text-white'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <label className="relative">
                        <span className="sr-only">Filter prospects by market</span>
                        <Filter
                            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35"
                            aria-hidden="true"
                        />
                        <select
                            value={market}
                            onChange={(event) => setMarket(event.target.value as MarketFilter)}
                            className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#07121b] pl-9 pr-8 text-xs text-white/70 focus:border-sky-300/40 focus:outline-none focus:ring-2 focus:ring-sky-300/15 lg:w-36"
                        >
                            <option value="all">All markets</option>
                            <option value="en-US">English</option>
                            <option value="ja-JP">Japanese</option>
                            <option value="de-DE">German</option>
                        </select>
                    </label>
                </div>
            </Surface>

            <div className="space-y-3">
                {filteredProspects.length > 0 ? (
                    filteredProspects.map((prospect) => (
                        <Surface key={prospect.id} className="overflow-hidden">
                            <article className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(13rem,0.65fr)_auto] lg:items-center">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-white/55">
                                            {segmentIcon(prospect.segment)}
                                            {segmentLabel(prospect.segment)}
                                        </span>
                                        {prospect.segment === 'rapper' ? (
                                            <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-sky-200">
                                                Priority lane
                                            </span>
                                        ) : null}
                                        <span className="text-[11px] text-white/35">{prospect.market}</span>
                                    </div>
                                    <h3 className="mt-3 truncate text-lg font-semibold tracking-[-0.025em]">
                                        {prospect.displayName}
                                    </h3>
                                    <p className="mt-1 text-xs text-white/40">
                                        {prospect.handle || 'No verified handle'} · {prospect.platform}
                                    </p>
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">
                                        {prospect.signals[0]}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white/40">Fit score</span>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 font-mono text-xs font-semibold ${scoreTone(prospect.score)}`}
                                        >
                                            {prospect.score}/100
                                        </span>
                                    </div>
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-300"
                                            style={{ width: `${prospect.score}%` }}
                                        />
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${
                                                prospect.contactPermission === 'public-business-email'
                                                    ? 'border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-100'
                                                    : 'border-amber-300/15 bg-amber-300/[0.06] text-amber-100'
                                            }`}
                                        >
                                            <MailCheck className="h-3 w-3" aria-hidden="true" />
                                            {prospect.contactPermission.replaceAll('-', ' ')}
                                        </span>
                                        <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/45">
                                            {prospect.matchedBeatIds.length} beat references
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedProspect(prospect)}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.08] px-4 text-sm font-medium text-sky-100 transition hover:border-sky-300/35 hover:bg-sky-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                                >
                                    More detail
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </article>
                        </Surface>
                    ))
                ) : (
                    <Surface className="p-8 text-center">
                        <p className="text-sm font-medium">No prospects match these filters.</p>
                        <p className="mt-2 text-xs text-white/40">
                            Broaden the market or segment filter. No source data was discarded.
                        </p>
                    </Surface>
                )}
            </div>

            {selectedProspect ? (
                <ProspectDetailDrawer
                    prospect={selectedProspect}
                    beats={selectedBeats}
                    onClose={() => setSelectedProspect(null)}
                />
            ) : null}
        </div>
    );
}
