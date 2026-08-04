import {
    Bot,
    BrainCircuit,
    Check,
    CircleAlert,
    Clock3,
    Eye,
    FilePenLine,
    LockKeyhole,
    Workflow,
    X,
} from 'lucide-react';
import type { AgentCard } from '@/lib/founder-os/contracts';
import { SafetyNotice, SectionHeading, Surface } from './FounderOsPrimitives';

const AGENT_ACCENTS: Record<AgentCard['id'], string> = {
    'chief-of-staff': 'from-sky-300/20 to-sky-300/[0.02] text-sky-100',
    'lead-scout': 'from-emerald-300/20 to-emerald-300/[0.02] text-emerald-100',
    'growth-analyst': 'from-violet-300/20 to-violet-300/[0.02] text-violet-100',
    'content-strategist': 'from-fuchsia-300/20 to-fuchsia-300/[0.02] text-fuchsia-100',
    'outreach-operator': 'from-amber-300/20 to-amber-300/[0.02] text-amber-100',
};

function agentStatusStyle(status: AgentCard['status']) {
    if (status === 'working') return 'bg-emerald-300 text-emerald-100';
    if (status === 'waiting-for-approval') return 'bg-amber-300 text-amber-100';
    if (status === 'blocked') return 'bg-rose-300 text-rose-100';
    return 'bg-white/30 text-white/50';
}

function lastRunLabel(value: string | null) {
    if (!value) return 'No completed run';
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    }).format(new Date(value));
}

export function AgentsPanel({ agents }: { agents: AgentCard[] }) {
    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Bounded AI workforce"
                title="Specialists with evidence, quotas, and hard permission limits."
                description="The Chief of Staff delegates research and drafting work. No role can grant itself provider access or bypass the approval service."
                action={
                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-3 py-2 text-xs text-violet-100">
                        <Workflow className="h-4 w-4" aria-hidden="true" />
                        {agents.length} roles
                    </span>
                }
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {agents.map((agent) => (
                    <Surface key={agent.id} className="relative overflow-hidden p-5">
                        <div
                            className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${AGENT_ACCENTS[agent.id]}`}
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <div className="flex items-start justify-between gap-4">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-white/75">
                                    {agent.id === 'chief-of-staff' ? (
                                        <BrainCircuit className="h-5 w-5" aria-hidden="true" />
                                    ) : (
                                        <Bot className="h-5 w-5" aria-hidden="true" />
                                    )}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-black/25 px-2.5 py-1 text-[10px] capitalize text-white/55">
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${agentStatusStyle(agent.status).split(' ')[0]}`}
                                    />
                                    {agent.status.replaceAll('-', ' ')}
                                </span>
                            </div>
                            <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em]">{agent.name}</h3>
                            <p className="mt-2 min-h-12 text-xs leading-5 text-white/45">{agent.role}</p>

                            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
                                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-white/30">
                                    Current assignment
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/70">{agent.currentTask}</p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                                    <span className="flex items-center gap-1.5 text-white/35">
                                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                        Last run
                                    </span>
                                    <p className="mt-2 font-medium text-white/65">
                                        {lastRunLabel(agent.lastRunAt)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                                    <span className="flex items-center gap-1.5 text-white/35">
                                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                        Evidence
                                    </span>
                                    <p className="mt-2 font-medium text-white/65">
                                        {agent.evidenceCount} items
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Surface>
                ))}
            </div>

            <Surface className="overflow-hidden">
                <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6">
                    <p className="text-sm font-semibold">Effective permissions</p>
                    <p className="mt-1 text-xs text-white/35">
                        Server policy wins over prompts and user-editable agent instructions.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[720px] w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-white/35">
                                <th className="px-6 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Read evidence</th>
                                <th className="px-4 py-3 font-medium">Create drafts</th>
                                <th className="px-4 py-3 font-medium">Change settings</th>
                                <th className="px-4 py-3 font-medium">Send / publish</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {agents.map((agent) => (
                                <tr key={agent.id}>
                                    <td className="px-6 py-4 font-medium text-white/75">{agent.name}</td>
                                    <td className="px-4 py-4">
                                        <Check className="h-4 w-4 text-emerald-200" aria-label="Allowed" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <FilePenLine className="h-4 w-4 text-sky-200" aria-label="Allowed" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <X className="h-4 w-4 text-white/25" aria-label="Not allowed" />
                                    </td>
                                    <td className="px-4 py-4">
                                        <LockKeyhole
                                            className="h-4 w-4 text-amber-200"
                                            aria-label="Founder approval required; agent cannot execute"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Surface>

            <SafetyNotice title="Blocked means honest" tone="warning">
                <span className="inline-flex items-start gap-1.5">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Growth Intelligence remains blocked while Meta and TikTok are disconnected. It will not
                    substitute generic advice for owned-account evidence.
                </span>
            </SafetyNotice>
        </div>
    );
}
