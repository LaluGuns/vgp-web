import {
    BarChart3,
    CircleAlert,
    Database,
    FlaskConical,
    Instagram,
    Lightbulb,
    Music2,
    Radar,
    ShieldAlert,
} from 'lucide-react';
import type { FounderSettings } from '@/lib/founder-os/contracts';
import type { IntelligenceSignal } from '@/app/founder/os/demo-data';
import {
    IntegrationStatusPill,
    SafetyNotice,
    SectionHeading,
    Surface,
} from './FounderOsPrimitives';
import { OwnedAnalyticsPanel } from './OwnedAnalyticsPanel';

const SIGNAL_STYLES: Record<IntelligenceSignal['status'], string> = {
    available: 'border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-100',
    partial: 'border-amber-300/15 bg-amber-300/[0.05] text-amber-100',
    blocked: 'border-white/[0.08] bg-white/[0.025] text-white/55',
};

const EXPERIMENT_STEPS = [
    {
        number: '01',
        title: 'Evidence',
        body: 'Owned post metrics, source freshness, audience context, and catalog fit.',
    },
    {
        number: '02',
        title: 'Hypothesis',
        body: 'A falsifiable reason why one hook, format, or creative direction may outperform.',
    },
    {
        number: '03',
        title: 'Founder review',
        body: 'You review the claim, copy, target channel, media, and success metric.',
    },
    {
        number: '04',
        title: 'Postmortem',
        body: 'Actual provider results are compared with the baseline after data arrives.',
    },
];

export function IntelligencePanel({
    signals,
    settings,
    dataGaps,
}: {
    signals: IntelligenceSignal[];
    settings: FounderSettings;
    dataGaps: string[];
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Growth intelligence"
                title="Make better content bets without pretending to know the algorithm."
                description="Recommendations become visible only with their source, freshness, confidence, missing data, target metric, and evaluation plan."
                action={
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/[0.06] px-3 py-2 text-xs text-sky-100">
                        <Radar className="h-4 w-4" aria-hidden="true" />
                        Evidence first
                    </span>
                }
            />

            <SafetyNotice title="No FYP guarantee" tone="warning">
                The system can analyze owned Meta and TikTok performance after authorization and propose
                experiments. It cannot guarantee virality, reverse-engineer the full ranking system, or use
                restricted commercial research data.
            </SafetyNotice>

            <OwnedAnalyticsPanel />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {signals.map((signal) => (
                    <Surface key={signal.id} className="p-5">
                        <div
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${SIGNAL_STYLES[signal.status]}`}
                        >
                            {signal.id === 'catalog' ? (
                                <Music2 className="h-4 w-4" aria-hidden="true" />
                            ) : signal.id === 'research' ? (
                                <Database className="h-4 w-4" aria-hidden="true" />
                            ) : signal.id === 'meta' ? (
                                <Instagram className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                            )}
                        </div>
                        <p className="mt-4 text-xs text-white/40">{signal.label}</p>
                        <p className="mt-1.5 text-lg font-semibold tracking-[-0.025em]">{signal.value}</p>
                        <p className="mt-3 text-xs leading-5 text-white/40">{signal.context}</p>
                    </Surface>
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <Surface className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">Channel capability</h3>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-white/35">
                        These pills come from the dashboard snapshot. Use Settings → Social provider
                        connections for the live account, scope, and capability matrix.
                    </p>
                    <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium">Meta / Instagram</span>
                                <IntegrationStatusPill status={settings.integrations.meta} />
                            </div>
                            <p className="mt-2 text-xs leading-5 text-white/40">
                                Owned analytics, Reel publishing, and eligible inbound replies each
                                require separate provider-confirmed capability. Cold outbound DM is blocked.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium">TikTok</span>
                                <IntegrationStatusPill status={settings.integrations.tiktok} />
                            </div>
                            <p className="mt-2 text-xs leading-5 text-white/40">
                                Owned analytics, Upload to Draft, Direct Post, and post-status access
                                are verified separately. TikTok replies are not enabled by connection alone.
                            </p>
                        </div>
                    </div>
                </Surface>

                <Surface className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-violet-200" aria-hidden="true" />
                        <h3 className="text-sm font-semibold">Experiment loop</h3>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {EXPERIMENT_STEPS.map((step) => (
                            <article
                                key={step.number}
                                className="rounded-2xl border border-white/[0.06] bg-black/20 p-4"
                            >
                                <span className="font-mono text-[9px] font-semibold tracking-[0.14em] text-violet-200/70">
                                    {step.number}
                                </span>
                                <p className="mt-2 text-sm font-semibold">{step.title}</p>
                                <p className="mt-2 text-xs leading-5 text-white/40">{step.body}</p>
                            </article>
                        ))}
                    </div>
                </Surface>
            </div>

            <Surface className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-sky-200" aria-hidden="true" />
                    <h3 className="text-sm font-semibold">Hypothesis backlog</h3>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                        {
                            title: 'Rapper-first beat walkthroughs',
                            state: 'Ready for evidence',
                            body: 'Test whether a vocal-pocket demonstration produces more qualified Beat Store visits than a generic visualizer.',
                        },
                        {
                            title: 'Cyber-racing sync showcase',
                            state: 'Catalog-backed',
                            body: 'Package CYBER RUNNER as a trailer-use concept while keeping actual game rights inside custom inquiry.',
                        },
                        {
                            title: 'Creator editing prompt',
                            state: 'Blocked by channel data',
                            body: 'Do not prioritize until owned Meta or TikTok data confirms the creator audience is present.',
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-sky-200/65">
                                {item.state}
                            </p>
                            <p className="mt-3 text-xs leading-5 text-white/40">{item.body}</p>
                        </article>
                    ))}
                </div>
            </Surface>

            <Surface className="p-5 sm:p-6">
                <div className="flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                    <h3 className="text-sm font-semibold">Known data gaps</h3>
                </div>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {dataGaps.map((gap) => (
                        <li
                            key={gap}
                            className="flex gap-3 rounded-2xl border border-white/[0.06] bg-black/20 p-4 text-xs leading-5 text-white/50"
                        >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                            {gap}
                        </li>
                    ))}
                </ul>
            </Surface>
        </div>
    );
}
