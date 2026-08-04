'use client';

import {
    BarChart3,
    ChevronDown,
    CircleAlert,
    LoaderCircle,
    RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Surface } from './FounderOsPrimitives';

type MetricValue = string | number | boolean | null;
type ProviderId = 'meta' | 'tiktok';

interface AnalyticsSnapshot {
    provider: ProviderId;
    observedAt: string;
    account: Record<string, MetricValue>;
    content: Array<Record<string, MetricValue>>;
    nextCursor: string | null;
}

type ProviderAnalyticsState =
    | { status: 'loading' }
    | { status: 'ready'; analytics: AnalyticsSnapshot }
    | { status: 'unavailable'; message: string }
    | { status: 'error'; message: string };

const PROVIDERS: Array<{ id: ProviderId; label: string }> = [
    { id: 'meta', label: 'Meta / Instagram' },
    { id: 'tiktok', label: 'TikTok' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMetricValue(value: unknown): value is MetricValue {
    return (
        value === null
        || typeof value === 'string'
        || typeof value === 'number'
        || typeof value === 'boolean'
    );
}

function metricRecord(value: unknown): Record<string, MetricValue> | null {
    if (!isRecord(value)) return null;
    const entries = Object.entries(value);
    if (!entries.every(([, item]) => isMetricValue(item))) return null;
    return Object.fromEntries(entries) as Record<string, MetricValue>;
}

function parseAnalytics(
    value: unknown,
    expectedProvider: ProviderId
): AnalyticsSnapshot | null {
    if (!isRecord(value) || value.provider !== expectedProvider) return null;
    const account = metricRecord(value.account);
    if (!account || !Array.isArray(value.content)) return null;
    const content = value.content.map(metricRecord);
    if (content.some((item) => item === null)) return null;
    if (
        typeof value.observedAt !== 'string'
        || Number.isNaN(Date.parse(value.observedAt))
        || (value.nextCursor !== null && typeof value.nextCursor !== 'string')
    ) {
        return null;
    }
    return {
        provider: expectedProvider,
        observedAt: value.observedAt,
        account,
        content: content as Array<Record<string, MetricValue>>,
        nextCursor: value.nextCursor,
    };
}

function safeErrorMessage(value: unknown): string | null {
    if (!isRecord(value)) return null;
    return typeof value.error === 'string' && value.error.length <= 500
        ? value.error
        : null;
}

async function fetchProviderAnalytics(
    provider: ProviderId,
    signal: AbortSignal
): Promise<ProviderAnalyticsState> {
    try {
        const response = await fetch(
            `/api/founder/os/providers/${provider}/analytics`,
            {
                method: 'GET',
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
                cache: 'no-store',
                signal,
            }
        );
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
            const message = safeErrorMessage(payload);
            if (response.status === 404 || response.status === 409) {
                return {
                    status: 'unavailable',
                    message: message || 'Connect this provider and grant owned analytics access.',
                };
            }
            return {
                status: 'error',
                message: message || `Analytics request failed with HTTP ${response.status}.`,
            };
        }
        const analytics = isRecord(payload)
            ? parseAnalytics(payload.analytics, provider)
            : null;
        return analytics
            ? { status: 'ready', analytics }
            : { status: 'error', message: 'Provider returned an invalid analytics payload.' };
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        return {
            status: 'error',
            message: 'Analytics could not be loaded. No metric was inferred.',
        };
    }
}

function humanizeMetricKey(value: string): string {
    return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatMetricValue(value: MetricValue): string {
    if (value === null) return 'Unavailable';
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
            notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
            maximumFractionDigits: 1,
        }).format(value);
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
}

function observedAtLabel(value: string): string {
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
    }).format(new Date(value));
}

function AnalyticsProviderCard({
    provider,
    state,
}: {
    provider: { id: ProviderId; label: string };
    state: ProviderAnalyticsState;
}) {
    if (state.status === 'loading') {
        return (
            <Surface className="min-h-52 p-5">
                <div className="flex items-center gap-2 text-white/50">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span className="text-xs">Loading {provider.label} owned analytics…</span>
                </div>
            </Surface>
        );
    }
    if (state.status === 'unavailable' || state.status === 'error') {
        return (
            <Surface className="min-h-52 p-5">
                <div className="flex items-center gap-2">
                    <CircleAlert
                        className={`h-4 w-4 ${
                            state.status === 'error'
                                ? 'text-rose-200'
                                : 'text-amber-200'
                        }`}
                        aria-hidden="true"
                    />
                    <h4 className="text-sm font-semibold">{provider.label}</h4>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/45">{state.message}</p>
                <p className="mt-3 text-[10px] leading-4 text-white/30">
                    Open Settings for the live connection, scope, and capability details.
                </p>
            </Surface>
        );
    }

    const accountMetrics = Object.entries(state.analytics.account);
    return (
        <Surface className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h4 className="text-sm font-semibold">{provider.label}</h4>
                    <p className="mt-1 text-[10px] text-white/30">
                        Observed {observedAtLabel(state.analytics.observedAt)} UTC
                    </p>
                </div>
                <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 text-[10px] text-emerald-100">
                    Owned data
                </span>
            </div>

            {accountMetrics.length > 0 ? (
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {accountMetrics.map(([key, value]) => (
                        <div
                            key={key}
                            className="rounded-xl border border-white/[0.06] bg-black/20 p-3"
                        >
                            <dt className="text-[10px] text-white/35">
                                {humanizeMetricKey(key)}
                            </dt>
                            <dd className="mt-1.5 text-base font-semibold">
                                {formatMetricValue(value)}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="mt-5 text-xs text-white/40">
                    The provider returned no account-level metric in this scope.
                </p>
            )}

            <details className="group mt-5 rounded-xl border border-white/[0.07] bg-black/20">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-xs font-semibold text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
                    More detail · {state.analytics.content.length} content records
                    <ChevronDown
                        className="h-4 w-4 transition group-open:rotate-180"
                        aria-hidden="true"
                    />
                </summary>
                <div className="border-t border-white/[0.06] p-3">
                    {state.analytics.content.length === 0 ? (
                        <p className="p-2 text-xs text-white/35">
                            No content-level rows were returned for this provider scope.
                        </p>
                    ) : (
                        <div className="max-h-96 space-y-2 overflow-y-auto">
                            {state.analytics.content.slice(0, 20).map((record, index) => (
                                <dl
                                    key={`${provider.id}-${String(record.id ?? index)}`}
                                    className="grid gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:grid-cols-2"
                                >
                                    {Object.entries(record).map(([key, value]) => (
                                        <div key={key} className="min-w-0">
                                            <dt className="text-[9px] uppercase tracking-[0.1em] text-white/25">
                                                {humanizeMetricKey(key)}
                                            </dt>
                                            <dd className="mt-1 break-words text-xs text-white/60">
                                                {formatMetricValue(value)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            ))}
                        </div>
                    )}
                    {state.analytics.nextCursor ? (
                        <p className="mt-3 text-[10px] text-white/30">
                            More provider records exist; pagination is not auto-fetched.
                        </p>
                    ) : null}
                </div>
            </details>
        </Surface>
    );
}

export function OwnedAnalyticsPanel() {
    const [refreshVersion, setRefreshVersion] = useState(0);
    const [states, setStates] = useState<Record<ProviderId, ProviderAnalyticsState>>({
        meta: { status: 'loading' },
        tiktok: { status: 'loading' },
    });

    useEffect(() => {
        const controller = new AbortController();
        void Promise.all(
            PROVIDERS.map(async (provider) => [
                provider.id,
                await fetchProviderAnalytics(provider.id, controller.signal),
            ] as const)
        ).then((results) => {
            if (controller.signal.aborted) return;
            setStates(Object.fromEntries(results) as Record<
                ProviderId,
                ProviderAnalyticsState
            >);
        }).catch((error: unknown) => {
            if (error instanceof DOMException && error.name === 'AbortError') return;
            if (!controller.signal.aborted) {
                setStates({
                    meta: { status: 'error', message: 'Analytics refresh failed safely.' },
                    tiktok: { status: 'error', message: 'Analytics refresh failed safely.' },
                });
            }
        });
        return () => controller.abort();
    }, [refreshVersion]);

    return (
        <section aria-labelledby="owned-analytics-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-sky-200" aria-hidden="true" />
                        <h3 id="owned-analytics-title" className="text-sm font-semibold">
                            Live owned analytics
                        </h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/40">
                        Read directly from the connected account when its approved scope allows it.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setStates({
                            meta: { status: 'loading' },
                            tiktok: { status: 'loading' },
                        });
                        setRefreshVersion((version) => version + 1);
                    }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs text-white/60 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    Refresh
                </button>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                {PROVIDERS.map((provider) => (
                    <AnalyticsProviderCard
                        key={provider.id}
                        provider={provider}
                        state={states[provider.id]}
                    />
                ))}
            </div>
        </section>
    );
}
