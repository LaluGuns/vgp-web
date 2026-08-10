import { Activity, CalendarDays, CircleAlert, FileSearch, ShieldCheck } from 'lucide-react';
import type { FounderDashboardSnapshot, SourceEvidence } from '@/lib/founder-os/contracts';
import { FreshnessPill, SectionHeading, Surface } from './FounderOsPrimitives';
import type { FounderOsSection } from './types';

function EvidenceDetail({ evidence }: { evidence: SourceEvidence }) {
    return (
        <article className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{evidence.label}</p>
                <FreshnessPill freshness={evidence.freshness} />
            </div>
            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div><dt className="text-white/35">Source</dt><dd className="mt-0.5 text-white/65">{evidence.sourceType}</dd></div>
                <div><dt className="text-white/35">Observed / sync</dt><dd className="mt-0.5 text-white/65">{evidence.observedAt ?? 'Not recorded'}</dd></div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-white/45">{evidence.note ?? 'No additional source note was recorded.'}</p>
            {evidence.url ? <a className="mt-3 inline-block break-all text-xs text-sky-200 hover:text-white" href={evidence.url} target="_blank" rel="noreferrer">Open source evidence</a> : <p className="mt-3 text-xs text-amber-100/75">Source URL unavailable; founder review required before external use.</p>}
        </article>
    );
}

export function OperationalDetailPanel({ section, snapshot }: { section: Extract<FounderOsSection, 'content-calendar' | 'analytics' | 'audit-log'>; snapshot: FounderDashboardSnapshot }) {
    const isCalendar = section === 'content-calendar';
    const isAnalytics = section === 'analytics';
    const icon = isCalendar ? <CalendarDays className="h-4 w-4" /> : isAnalytics ? <Activity className="h-4 w-4" /> : <FileSearch className="h-4 w-4" />;
    const title = isCalendar ? 'Content calendar needs dated source records.' : isAnalytics ? 'Analytics only reports verified evidence.' : 'Audit log exposes the recorded operational trail.';
    const description = isCalendar
        ? 'The current Founder OS contract has drafts and approvals, but no persisted publish schedule. No due date, cadence, or delivery state is inferred here.'
        : isAnalytics
            ? 'This snapshot does not convert a configured integration into audience, reach, or FYP performance. Refresh Provider Connections for live capability status.'
            : 'Approval records and evidence are shown with their actual timestamps and errors. UNKNOWN outcomes remain manual-reconciliation work.';
    const records = isCalendar ? snapshot.approvals.filter((item) => item.status === 'DRAFT' || item.status === 'READY_FOR_APPROVAL') : snapshot.approvals;
    return <div className="space-y-6">
        <SectionHeading eyebrow="Operational detail" title={title} description={description} action={<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">{icon} {snapshot.mode === 'live' ? 'Live snapshot' : 'Demo snapshot'}</span>} />
        <Surface className="p-5 sm:p-6">
            <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" /><div><p className="text-sm font-semibold">Recommended action</p><p className="mt-1 text-xs leading-5 text-white/45">{isCalendar ? 'Add a reviewed calendar record through a future audited contract before treating a draft as scheduled.' : isAnalytics ? 'Verify provider connection, scopes, and an owned-data sync before deciding on content performance.' : 'Open the matching approval and reconcile any failure or UNKNOWN outcome before creating a replacement action.'}</p></div></div>
        </Surface>
        <Surface className="overflow-hidden"><div className="border-b border-white/[0.07] px-5 py-4"><p className="text-sm font-semibold">{isCalendar ? 'Unscheduled content records' : isAnalytics ? 'Available evidence' : 'Approval audit records'}</p><p className="mt-1 text-xs text-white/35">Status, source, timestamp, and last error are kept separate from confidence.</p></div><div className="divide-y divide-white/[0.06]">{isAnalytics ? snapshot.evidence.map((evidence) => <EvidenceDetail key={evidence.id} evidence={evidence} />) : records.map((record) => <article key={record.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{record.targetLabel}</p><span className="font-mono text-[10px] text-white/45">{record.status}</span></div><p className="mt-2 text-xs leading-5 text-white/45">{record.payloadSummary}</p><dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><div><dt className="text-white/35">Last changed</dt><dd className="mt-0.5 text-white/65">{record.updatedAt}</dd></div><div><dt className="text-white/35">External reference</dt><dd className="mt-0.5 text-white/65">{record.providerReference ?? 'None recorded'}</dd></div><div><dt className="text-white/35">Last error</dt><dd className="mt-0.5 text-white/65">{record.failureReason ?? 'None recorded'}</dd></div></dl></article>)}</div></Surface>
        {snapshot.dataGaps.length ? <Surface className="p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-sky-200" /><div><p className="text-sm font-semibold">Evidence gaps remain explicit</p><p className="mt-1 text-xs leading-5 text-white/45">{snapshot.dataGaps.join(' ')}</p></div></div></Surface> : null}
    </div>;
}
