import {
    ArrowRight,
    Bot,
    CircleAlert,
    ClipboardCheck,
    Radar,
    ShieldCheck,
    UserRoundSearch,
} from 'lucide-react';
import type { FounderDashboardSnapshot } from '@/lib/founder-os/contracts';
import type { FounderOsSection } from './types';
import {
    ApprovalStatusPill,
    MetricCard,
    SafetyNotice,
    SectionHeading,
    Surface,
} from './FounderOsPrimitives';

function timeLabel(value: string | null, referenceAt: string) {
    if (!value) return 'Never run';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.max(
            -1,
            Math.round(
                (new Date(value).getTime() - new Date(referenceAt).getTime()) /
                    60000,
            ),
        ),
        'minute',
    );
}

export function OverviewPanel({
    snapshot,
    onNavigate,
}: {
    snapshot: FounderDashboardSnapshot;
    onNavigate: (section: FounderOsSection) => void;
}) {
    const readyApprovals = snapshot.approvals.filter(
        (approval) => approval.status === 'READY_FOR_APPROVAL',
    );
    const qualifiedProspects = snapshot.prospects.filter(
        (prospect) => prospect.score >= snapshot.settings.scoreThreshold,
    );
    const activeAgents = snapshot.agents.filter(
        (agent) => agent.status === 'working' || agent.status === 'waiting-for-approval',
    );
    const connectedIntegrations = Object.values(snapshot.settings.integrations).filter(
        (status) => status === 'connected' || status === 'configured',
    ).length;
    const isLive = snapshot.mode === 'live';

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Command center"
                title="One screen for the work that needs your judgment."
                description="The agents can research, analyze, and draft. You remain the execution boundary for every email, reply, post, and material settings change."
                action={
                    <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            isLive
                                ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-100'
                                : 'border-sky-300/15 bg-sky-300/[0.06] text-sky-100'
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isLive ? 'bg-emerald-300' : 'bg-amber-300'
                            }`}
                        />
                        {isLive ? 'Live control plane' : 'Demo control plane'}
                    </span>
                }
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Qualified prospects"
                    value={String(qualifiedProspects.length)}
                    helper="Rapper-first queue above the current score threshold"
                    icon={<UserRoundSearch className="h-4 w-4" />}
                    tone="sky"
                />
                <MetricCard
                    label="Awaiting approval"
                    value={String(readyApprovals.length)}
                    helper="Nothing external can run until these are reviewed"
                    icon={<ClipboardCheck className="h-4 w-4" />}
                    tone="amber"
                />
                <MetricCard
                    label="Agents in motion"
                    value={`${activeAgents.length}/${snapshot.agents.length}`}
                    helper="Working or waiting for founder judgment"
                    icon={<Bot className="h-4 w-4" />}
                    tone="violet"
                />
                <MetricCard
                    label="Integration coverage"
                    value={`${connectedIntegrations}/4`}
                    helper="Meta and TikTok remain intentionally disconnected"
                    icon={<Radar className="h-4 w-4" />}
                    tone="emerald"
                />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                <Surface className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold">Today’s founder queue</p>
                            <p className="mt-1 text-xs text-white/40">
                                Ordered by actionability and risk, not vanity metrics.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNavigate('approvals')}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                        >
                            View all
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mt-5 space-y-3">
                        {readyApprovals.map((approval, index) => (
                            <button
                                key={approval.id}
                                type="button"
                                onClick={() => onNavigate('approvals')}
                                className="flex w-full items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-sky-300/20 hover:bg-sky-300/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            >
                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 font-mono text-xs text-white/45">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span className="truncate text-sm font-semibold">
                                            {approval.targetLabel}
                                        </span>
                                        <ApprovalStatusPill status={approval.status} />
                                    </span>
                                    <span className="mt-1.5 block text-xs leading-5 text-white/45">
                                        {approval.payloadSummary}
                                    </span>
                                </span>
                                <ArrowRight
                                    className="mt-2 h-4 w-4 shrink-0 text-white/25"
                                    aria-hidden="true"
                                />
                            </button>
                        ))}
                    </div>
                </Surface>

                <Surface className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-violet-200" aria-hidden="true" />
                        <p className="text-sm font-semibold">AI team pulse</p>
                    </div>
                    <div className="mt-5 space-y-4">
                        {snapshot.agents.slice(0, 3).map((agent) => (
                            <button
                                key={agent.id}
                                type="button"
                                onClick={() => onNavigate('agents-skills')}
                                className="block w-full rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-left transition hover:border-violet-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                            >
                                <span className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium">{agent.name}</span>
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            agent.status === 'working'
                                                ? 'bg-emerald-300'
                                                : agent.status === 'blocked'
                                                    ? 'bg-rose-300'
                                                    : 'bg-amber-300'
                                        }`}
                                        aria-label={agent.status}
                                    />
                                </span>
                                <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-white/40">
                                    {agent.currentTask}
                                </span>
                                <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">
                                    {timeLabel(agent.lastRunAt, snapshot.generatedAt)} ·{' '}
                                    {agent.evidenceCount} evidence items
                                </span>
                            </button>
                        ))}
                    </div>
                </Surface>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <SafetyNotice title="Guardrails are enforced, not suggested" tone="safe">
                    Approval is mandatory for every external action. Unverified contacts, scraping, and
                    cold social DMs remain disabled even if an agent prompt asks for them.
                </SafetyNotice>
                <SafetyNotice title="Coverage gaps are visible" tone="warning">
                    <span className="inline-flex items-start gap-1.5">
                        <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {isLive
                            ? 'Provider connection and scope are checked live in Settings. Without verified owned performance, the system makes no FYP claim.'
                            : 'Meta and TikTok are not connected, so the system makes no FYP claim and does not fabricate audience performance.'}
                    </span>
                </SafetyNotice>
            </div>

            <Surface className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold">
                            {isLive
                                ? 'External execution is approval-gated'
                                : 'External execution is locked'}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/40">
                            {isLive
                                ? 'Only exact-revision approved actions may proceed, and provider eligibility, suppression, idempotency, and audit reconciliation still apply.'
                                : 'This demo snapshot is UI-only. No send, reply, publish, or provider mutation is wired.'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    Review safety settings
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </Surface>
        </div>
    );
}
