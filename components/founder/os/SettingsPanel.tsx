'use client';

import { useMemo, useState } from 'react';
import {
    Check,
    CircleAlert,
    Cloud,
    Database,
    Languages,
    LockKeyhole,
    Mail,
    Save,
    ShieldCheck,
    SlidersHorizontal,
} from 'lucide-react';
import type {
    FounderMarket,
    FounderSettings,
} from '@/lib/founder-os/contracts';
import {
    IntegrationStatusPill,
    SafetyNotice,
    SectionHeading,
    Surface,
} from './FounderOsPrimitives';
import { LiveWorkspaceActivation } from './LiveWorkspaceActivation';
import { ProviderConnections } from './ProviderConnections';

const MARKET_OPTIONS: Array<{
    id: FounderMarket;
    label: string;
    description: string;
}> = [
    { id: 'en-US', label: 'English', description: 'Global English copy and research' },
    { id: 'ja-JP', label: 'Japanese', description: 'Japanese draft plus English back-translation' },
    { id: 'de-DE', label: 'German', description: 'German draft plus English back-translation' },
];

const EXECUTION_INTEGRATIONS: Array<{
    id: 'hostinger-email' | 'cloudflare-agent';
    label: string;
    icon: typeof Cloud;
    description: string;
}> = [
    {
        id: 'hostinger-email',
        label: 'Hostinger email',
        icon: Mail,
        description: 'Configured transport; execution remains behind approval and suppression checks.',
    },
    {
        id: 'cloudflare-agent',
        label: 'Cloudflare Agent',
        icon: Cloud,
        description: 'Bounded analysis and draft orchestration. No provider write credentials.',
    },
];

function ToggleRow({
    label,
    description,
    checked,
    onChange,
    disabled = false,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <label
            className={`flex items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-4 ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
        >
            <span>
                <span className="block text-sm font-medium text-white/75">{label}</span>
                <span className="mt-1 block text-xs leading-5 text-white/40">{description}</span>
            </span>
            <span className="relative mt-0.5 inline-flex shrink-0">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => onChange(event.target.checked)}
                />
                <span className="h-6 w-11 rounded-full border border-white/10 bg-white/[0.06] transition peer-checked:border-sky-300/25 peer-checked:bg-sky-300/20 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-300 peer-disabled:opacity-50" />
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white/50 transition peer-checked:translate-x-5 peer-checked:bg-sky-100 peer-disabled:opacity-50" />
            </span>
        </label>
    );
}

export function SettingsPanel({
    initialSettings,
    live,
    canActivateLiveWorkspace,
}: {
    initialSettings: FounderSettings;
    live: boolean;
    canActivateLiveWorkspace: boolean;
}) {
    const [scoreThreshold, setScoreThreshold] = useState(initialSettings.scoreThreshold);
    const [markets, setMarkets] = useState<FounderMarket[]>(initialSettings.markets);
    const [ownedAnalytics, setOwnedAnalytics] = useState(
        initialSettings.trendSources.ownedAnalytics,
    );
    const [officialApis, setOfficialApis] = useState(
        initialSettings.trendSources.officialPlatformApis,
    );
    const [manualResearch, setManualResearch] = useState(
        initialSettings.trendSources.manualResearch,
    );
    const [stagedAt, setStagedAt] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<
        { status: 'idle' | 'saving' | 'saved' | 'error'; message: string | null }
    >({ status: 'idle', message: null });

    const currentSignature = useMemo(() => JSON.stringify({
        scoreThreshold,
        markets: [...markets].sort(),
        ownedAnalytics,
        officialApis,
        manualResearch,
    }), [
        manualResearch,
        markets,
        officialApis,
        ownedAnalytics,
        scoreThreshold,
    ]);
    const [savedSignature, setSavedSignature] = useState(() => JSON.stringify({
        scoreThreshold: initialSettings.scoreThreshold,
        markets: [...initialSettings.markets].sort(),
        ownedAnalytics: initialSettings.trendSources.ownedAnalytics,
        officialApis: initialSettings.trendSources.officialPlatformApis,
        manualResearch: initialSettings.trendSources.manualResearch,
    }));
    const hasChanges = useMemo(() => {
        return currentSignature !== savedSignature;
    }, [
        currentSignature,
        savedSignature,
    ]);

    const toggleMarket = (market: FounderMarket) => {
        setMarkets((current) =>
            current.includes(market)
                ? current.length > 1
                    ? current.filter((item) => item !== market)
                    : current
                : [...current, market],
        );
        setStagedAt(null);
        setSaveState({ status: 'idle', message: null });
    };

    const saveSettings = async () => {
        if (!hasChanges) return;

        if (!live) {
            setStagedAt(
                new Intl.DateTimeFormat('en', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(new Date()),
            );
            return;
        }

        setSaveState({ status: 'saving', message: null });
        try {
            const response = await fetch('/api/founder/os/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...initialSettings,
                    markets,
                    scoreThreshold,
                    trendSources: {
                        ownedAnalytics,
                        officialPlatformApis: officialApis,
                        manualResearch,
                        scraping: false,
                    },
                }),
            });
            const result = (await response.json()) as {
                success?: boolean;
                error?: string;
            };
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Settings could not be saved.');
            }
            setSaveState({
                status: 'saved',
                message: 'Settings saved to the Founder OS audit trail.',
            });
            setSavedSignature(currentSignature);
        } catch (error) {
            setSaveState({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'Settings could not be saved.',
            });
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeading
                eyebrow="Founder controls"
                title="Tune the workforce without weakening the safety boundary."
                description="Editable strategy lives here. Execution permissions, scraping prohibition, and approval requirements remain enforced server-side."
                action={
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/55">
                        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                        Contract {initialSettings.contractVersion}
                    </span>
                }
            />

            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                    <Surface className="p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-sky-200" aria-hidden="true" />
                            <h3 className="text-sm font-semibold">Qualification policy</h3>
                        </div>
                        <div className="mt-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <label htmlFor="score-threshold" className="text-sm font-medium text-white/75">
                                        Minimum qualified score
                                    </label>
                                    <p className="mt-1 text-xs text-white/40">
                                        Leads below this score remain visible but do not enter the approval queue.
                                    </p>
                                </div>
                                <span className="rounded-xl border border-sky-300/15 bg-sky-300/[0.06] px-3 py-2 font-mono text-sm font-semibold text-sky-100">
                                    {scoreThreshold}
                                </span>
                            </div>
                            <input
                                id="score-threshold"
                                type="range"
                                min={50}
                                max={90}
                                step={1}
                                value={scoreThreshold}
                                onChange={(event) => {
                                    setScoreThreshold(Number(event.target.value));
                                    setStagedAt(null);
                                }}
                                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky-300"
                            />
                            <div className="mt-2 flex justify-between font-mono text-[9px] text-white/25">
                                <span>50 · exploratory</span>
                                <span>90 · strict</span>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-white/[0.06] pt-5">
                            <div className="flex items-center gap-2">
                                <Languages className="h-4 w-4 text-violet-200" aria-hidden="true" />
                                <p className="text-sm font-medium">Markets and languages</p>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                {MARKET_OPTIONS.map((option) => {
                                    const checked = markets.includes(option.id);
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => toggleMarket(option.id)}
                                            aria-pressed={checked}
                                            className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 ${
                                                checked
                                                    ? 'border-sky-300/25 bg-sky-300/[0.08]'
                                                    : 'border-white/[0.07] bg-black/20'
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-3">
                                                <span className="text-sm font-semibold">{option.label}</span>
                                                <span
                                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                                                        checked
                                                            ? 'border-sky-200 bg-sky-200 text-[#061019]'
                                                            : 'border-white/15 text-transparent'
                                                    }`}
                                                >
                                                    <Check className="h-3 w-3" aria-hidden="true" />
                                                </span>
                                            </span>
                                            <span className="mt-2 block text-[11px] leading-5 text-white/40">
                                                {option.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </Surface>

                    <Surface className="p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                            <h3 className="text-sm font-semibold">Research sources</h3>
                        </div>
                        <div className="mt-5 space-y-3">
                            <ToggleRow
                                label="Owned analytics"
                                description="Use authorized first-party performance when a provider is connected."
                                checked={ownedAnalytics}
                                onChange={(checked) => {
                                    setOwnedAnalytics(checked);
                                    setStagedAt(null);
                                }}
                            />
                            <ToggleRow
                                label="Official platform APIs"
                                description="Use only capabilities and scopes the connected account actually grants."
                                checked={officialApis}
                                onChange={(checked) => {
                                    setOfficialApis(checked);
                                    setStagedAt(null);
                                }}
                            />
                            <ToggleRow
                                label="Manual research"
                                description="Allow founder-reviewed public evidence with URL and observation time."
                                checked={manualResearch}
                                onChange={(checked) => {
                                    setManualResearch(checked);
                                    setStagedAt(null);
                                }}
                            />
                            <ToggleRow
                                label="Scraping"
                                description="Hard-disabled. Agents may not bypass login walls, robots, CAPTCHA, or provider restrictions."
                                checked={false}
                                onChange={() => undefined}
                                disabled
                            />
                        </div>
                    </Surface>
                </div>

                <div className="space-y-5">
                    <Surface className="p-5 sm:p-6">
                        <div className="flex items-center gap-2">
                            <LockKeyhole className="h-4 w-4 text-amber-200" aria-hidden="true" />
                            <h3 className="text-sm font-semibold">Non-negotiable guardrails</h3>
                        </div>
                        <div className="mt-5 space-y-3">
                            <ToggleRow
                                label="Approval for every external action"
                                description="Email, reply, and publish actions require exact-revision approval."
                                checked
                                onChange={() => undefined}
                                disabled
                            />
                            <ToggleRow
                                label="Cold social DMs"
                                description="Hard-disabled. Social profiles can only become manual handoffs."
                                checked={false}
                                onChange={() => undefined}
                                disabled
                            />
                            <ToggleRow
                                label="Unverified contact details"
                                description="Hard-disabled. Agents may not infer or guess email addresses."
                                checked={false}
                                onChange={() => undefined}
                                disabled
                            />
                        </div>
                    </Surface>

                    <Surface className="overflow-hidden">
                        <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6">
                            <h3 className="text-sm font-semibold">Integrations</h3>
                            <p className="mt-1 text-xs text-white/35">
                                Status reflects capability, not merely the presence of a token.
                            </p>
                        </div>
                        <ProviderConnections
                            initialStatuses={{
                                meta: initialSettings.integrations.meta,
                                tiktok: initialSettings.integrations.tiktok,
                            }}
                            live={live}
                        />
                        <div className="border-t border-white/[0.07] px-5 pb-2 pt-5 sm:px-6">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
                                Execution infrastructure
                            </h4>
                            <p className="mt-1 text-[11px] leading-5 text-white/30">
                                Server-side services remain bound by approval, suppression, and
                                audit controls.
                            </p>
                        </div>
                        <div className="divide-y divide-white/[0.05]">
                            {EXECUTION_INTEGRATIONS.map((integration) => {
                                const Icon = integration.icon;
                                const status = initialSettings.integrations[integration.id];
                                return (
                                    <article key={integration.id} className="p-5 sm:px-6">
                                        <div className="flex items-start gap-3">
                                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/55">
                                                <Icon className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold">{integration.label}</p>
                                                    <IntegrationStatusPill status={status} />
                                                </div>
                                                <p className="mt-2 text-xs leading-5 text-white/40">
                                                    {integration.description}
                                                </p>
                                                <p className="mt-3 text-[11px] leading-5 text-white/30">
                                                    Managed through server-side configuration. No
                                                    credential is exposed in this panel.
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </Surface>
                </div>
            </div>

            {canActivateLiveWorkspace ? <LiveWorkspaceActivation /> : null}

            <Surface className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <div className="flex items-center gap-2">
                        <Save className="h-4 w-4 text-sky-200" aria-hidden="true" />
                        <p className="text-sm font-semibold">Configuration draft</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/40">
                        {stagedAt
                            ? `Demo draft staged at ${stagedAt}. No server settings were changed.`
                            : !hasChanges && saveState.message
                                ? saveState.message
                            : hasChanges
                                ? live
                                    ? 'Unsaved changes are ready to save.'
                                    : 'Unsaved session changes are ready to stage.'
                                : 'No changes from the loaded snapshot.'}
                    </p>
                </div>
                <button
                    type="button"
                    disabled={!hasChanges}
                    onClick={saveSettings}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/[0.08] px-4 text-sm font-medium text-sky-100 transition hover:bg-sky-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {saveState.status === 'saving'
                        ? 'Saving...'
                        : live
                            ? 'Save settings'
                            : 'Stage demo changes'}
                </button>
            </Surface>

            <SafetyNotice title={live ? 'Persistence and audit enabled' : 'Persistence is not faked'} tone="info">
                {live
                    ? 'Editable fields are saved through the authenticated settings endpoint. Integration status and hard safety controls remain server-managed.'
                    : 'Demo changes stay in this browser session. Apply the private migration and enable database mode before expecting settings to persist.'}
            </SafetyNotice>

            <SafetyNotice title="At least one market must stay active" tone="warning">
                <span className="inline-flex items-start gap-1.5">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    The control prevents an empty market list. Rapper remains the first segment priority in
                    the frozen Founder OS contract.
                </span>
            </SafetyNotice>
        </div>
    );
}
