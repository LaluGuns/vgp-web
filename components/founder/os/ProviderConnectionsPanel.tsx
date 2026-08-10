import { CircleAlert, PlugZap } from 'lucide-react';
import type { FounderSettings } from '@/lib/founder-os/contracts';
import {
    IntegrationStatusPill,
    SectionHeading,
    Surface,
} from './FounderOsPrimitives';
import { ProviderConnections } from './ProviderConnections';

const UNKNOWN_ADAPTERS = [
    ['Google Search Console', 'No Founder OS Bridge health adapter is implemented. Property authorization and ingestion health are unknown.'],
    ['PostHog', 'No Founder OS Bridge health adapter is implemented. Capture and query health are unknown.'],
    ['Vercel', 'No Founder OS Bridge health adapter is implemented. Deployment readiness is unknown from this snapshot.'],
] as const;

export function ProviderConnectionsPanel({
    settings,
    live,
}: {
    settings: FounderSettings;
    live: boolean;
}) {
    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Provider connections"
                title="Connection, authorization, scope, and health stay separate."
                description="Meta and TikTok refresh from the server-backed provider ledger. A configured preference never becomes a connected account by inference."
                action={(
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
                        <PlugZap className="h-4 w-4" aria-hidden="true" />
                        {live ? 'Live workspace' : 'Demo snapshot'}
                    </span>
                )}
            />

            <Surface className="overflow-hidden">
                <ProviderConnections
                    initialStatuses={{
                        meta: settings.integrations.meta,
                        tiktok: settings.integrations.tiktok,
                    }}
                    live={live}
                />
            </Surface>

            <div className="grid gap-4 lg:grid-cols-3">
                {UNKNOWN_ADAPTERS.map(([label, note]) => (
                    <Surface key={label} className="p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{label}</p>
                            <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.05] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-sky-100">
                                Unknown
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-white/40">{note}</p>
                    </Surface>
                ))}
            </div>

            <Surface className="p-5">
                <div className="flex gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
                    <div>
                        <p className="text-sm font-semibold">Execution infrastructure is not provider authorization</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/45">
                            <span className="inline-flex items-center gap-2">Hostinger email <IntegrationStatusPill status={settings.integrations['hostinger-email']} /></span>
                            <span className="inline-flex items-center gap-2">Codex plugin preference <IntegrationStatusPill status={settings.integrations['codex-plugin']} /></span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-white/40">
                            TikTok Upload to Draft is preferred. Direct Post remains disabled unless the audited server flag, required scope, and exact founder approval all exist.
                        </p>
                    </div>
                </div>
            </Surface>
        </div>
    );
}
