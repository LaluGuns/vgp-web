'use client';

import {
    CheckCircle2,
    ChevronRight,
    CircleAlert,
    ExternalLink,
    Instagram,
    ListChecks,
    LoaderCircle,
    Music2,
    RefreshCw,
    ShieldCheck,
    Unplug,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FounderSettings } from '@/lib/founder-os/contracts';
import { IntegrationStatusPill } from './FounderOsPrimitives';
import {
    parseProviderStatusPayload,
    PROVIDER_DEFINITIONS,
    providerStatusesFromSnapshot,
    type ProviderCapabilityState,
    type ProviderId,
    type ProviderRuntimeStatus,
} from './ProviderSetupModel';

const PROVIDER_STATUS_ENDPOINT = '/api/founder/os/providers/status';

const CAPABILITY_STATE_LABELS: Record<ProviderCapabilityState, string> = {
    available: 'Available',
    'not-connected': 'Not connected',
    'missing-scope': 'Missing scope',
    disabled: 'Disabled',
    error: 'Error',
    'manual-only': 'Manual only',
    unknown: 'Not verified',
};

const CAPABILITY_STATE_STYLES: Record<ProviderCapabilityState, string> = {
    available: 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100',
    'not-connected': 'border-white/10 bg-white/[0.04] text-white/45',
    'missing-scope': 'border-amber-300/20 bg-amber-300/[0.08] text-amber-100',
    disabled: 'border-white/10 bg-black/25 text-white/35',
    error: 'border-rose-300/20 bg-rose-300/[0.08] text-rose-100',
    'manual-only': 'border-violet-300/20 bg-violet-300/[0.08] text-violet-100',
    unknown: 'border-sky-300/20 bg-sky-300/[0.07] text-sky-100',
};

type StatusRequestState =
    | { kind: 'loading'; message: string }
    | { kind: 'ready'; message: string }
    | { kind: 'unavailable'; message: string }
    | { kind: 'error'; message: string };

function CapabilityStatePill({ state }: { state: ProviderCapabilityState }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] ${CAPABILITY_STATE_STYLES[state]}`}
        >
            {CAPABILITY_STATE_LABELS[state]}
        </span>
    );
}

function checkedAtLabel(value: string | null) {
    if (!value) return 'No timestamp returned';
    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

async function responseErrorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const body = (await response.json()) as unknown;
        if (typeof body === 'object' && body !== null) {
            const record = body as Record<string, unknown>;
            if (typeof record.error === 'string' && record.error.trim()) {
                return record.error.trim().slice(0, 280);
            }
            if (typeof record.message === 'string' && record.message.trim()) {
                return record.message.trim().slice(0, 280);
            }
        }
    } catch {
        // The status code remains the source of truth when the body is not JSON.
    }
    return fallback;
}

function ProviderCapabilityDrawer({
    provider,
    dialogRef,
    onClose,
}: {
    provider: ProviderRuntimeStatus | null;
    dialogRef: React.RefObject<HTMLDialogElement>;
    onClose: () => void;
}) {
    const definition = provider ? PROVIDER_DEFINITIONS[provider.provider] : null;

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onCancel={onClose}
            aria-labelledby="provider-capability-title"
            className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#030b11] p-0 text-white shadow-[-32px_0_90px_rgba(0,0,0,0.65)] backdrop:bg-black/75 backdrop:backdrop-blur-sm"
        >
            {provider && definition ? (
                <div className="min-h-full">
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/[0.08] bg-[#030b11]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                        <div>
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/70">
                                Provider capability detail
                            </p>
                            <h3
                                id="provider-capability-title"
                                className="mt-2 text-xl font-semibold tracking-[-0.025em]"
                            >
                                {definition.label}
                            </h3>
                            <p className="mt-2 max-w-xl text-xs leading-5 text-white/45">
                                This table reports connection and scope state only. It contains no
                                inferred reach, FYP score, or performance metric.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                            aria-label="Close capability detail"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="space-y-6 px-5 py-6 sm:px-7">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                                    Connection
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <IntegrationStatusPill status={provider.status} />
                                    <span className="text-xs text-white/40">
                                        {provider.source === 'live'
                                            ? 'Live provider check'
                                            : 'Dashboard snapshot only'}
                                    </span>
                                </div>
                                {provider.accountLabel ? (
                                    <p className="mt-3 text-sm text-white/70">
                                        Account: {provider.accountLabel}
                                    </p>
                                ) : null}
                            </div>
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                                    Last checked
                                </p>
                                <p className="mt-3 text-sm text-white/70">
                                    {checkedAtLabel(provider.lastCheckedAt)}
                                </p>
                                <p className="mt-1 text-xs text-white/35">
                                    Missing timestamps are shown as missing, never substituted.
                                </p>
                            </div>
                        </div>

                        {provider.redirectUri ? (
                            <div className="rounded-2xl border border-sky-300/15 bg-sky-300/[0.05] p-4">
                                <p className="text-xs font-semibold text-sky-100">
                                    OAuth callback reported by the backend
                                </p>
                                <code className="mt-2 block select-all overflow-x-auto rounded-xl bg-black/25 px-3 py-2 text-[11px] leading-5 text-sky-100/70">
                                    {provider.redirectUri}
                                </code>
                            </div>
                        ) : null}

                        <section aria-labelledby="capability-table-title">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                                <h4 id="capability-table-title" className="text-sm font-semibold">
                                    Verified capability matrix
                                </h4>
                            </div>
                            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
                                <table className="min-w-[42rem] w-full border-collapse text-left">
                                    <thead className="bg-white/[0.035]">
                                        <tr className="text-[10px] uppercase tracking-[0.12em] text-white/35">
                                            <th scope="col" className="px-4 py-3 font-medium">
                                                Capability
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-medium">
                                                State
                                            </th>
                                            <th scope="col" className="px-4 py-3 font-medium">
                                                Requirement / limit
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.06]">
                                        {provider.capabilities.map((capability) => (
                                            <tr key={capability.id} className="align-top">
                                                <th
                                                    scope="row"
                                                    className="px-4 py-4 text-xs font-semibold text-white/75"
                                                >
                                                    {capability.label}
                                                </th>
                                                <td className="px-4 py-4">
                                                    <CapabilityStatePill state={capability.state} />
                                                </td>
                                                <td className="max-w-md px-4 py-4 text-xs leading-5 text-white/45">
                                                    {capability.detail}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section
                            aria-labelledby="provider-manual-checklist-title"
                            className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5"
                        >
                            <div className="flex items-center gap-2 text-amber-100">
                                <ListChecks className="h-4 w-4" aria-hidden="true" />
                                <h4 id="provider-manual-checklist-title" className="text-sm font-semibold">
                                    Manual setup checklist
                                </h4>
                            </div>
                            <ol className="mt-4 space-y-3">
                                {definition.manualChecklist.map((item, index) => (
                                    <li key={item} className="flex gap-3 text-xs leading-5 text-white/55">
                                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/[0.07] font-mono text-[9px] text-amber-100">
                                            {index + 1}
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-4 border-t border-amber-300/10 pt-4 text-[11px] leading-5 text-white/35">
                                Keep client secrets in server-side environment bindings. Do not paste
                                provider secrets into this browser panel.
                            </p>
                        </section>
                    </div>
                </div>
            ) : null}
        </dialog>
    );
}

function ProviderCard({
    provider,
    statusRequest,
    actionPending,
    actionError,
    onOpenCapabilities,
    onDisconnect,
}: {
    provider: ProviderRuntimeStatus;
    statusRequest: StatusRequestState;
    actionPending: boolean;
    actionError: string | null;
    onOpenCapabilities: () => void;
    onDisconnect: () => void;
}) {
    const definition = PROVIDER_DEFINITIONS[provider.provider];
    const Icon = provider.provider === 'meta' ? Instagram : Music2;
    const statusReady = statusRequest.kind === 'ready' && provider.source === 'live';
    const canStartOauth =
        statusReady && provider.configured && provider.oauthAvailable && !actionPending;
    const canDisconnect =
        statusReady && provider.status === 'connected' && !actionPending;
    const connectLabel =
        provider.status === 'connected' || provider.status === 'error'
            ? `Reconnect ${definition.shortLabel}`
            : `Connect ${definition.shortLabel}`;

    return (
        <article className="rounded-[1.35rem] border border-white/[0.08] bg-black/20 p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/60">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold">{definition.label}</h4>
                        <IntegrationStatusPill status={provider.status} />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/42">
                        {definition.description}
                    </p>
                </div>
            </div>

            <dl className="mt-4 grid gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs sm:grid-cols-2">
                <div>
                    <dt className="text-[10px] uppercase tracking-[0.1em] text-white/25">
                        Status source
                    </dt>
                    <dd className="mt-1 text-white/60">
                        {provider.source === 'live' ? 'Live provider check' : 'Dashboard snapshot'}
                    </dd>
                </div>
                <div>
                    <dt className="text-[10px] uppercase tracking-[0.1em] text-white/25">
                        Last checked
                    </dt>
                    <dd className="mt-1 text-white/60">
                        {checkedAtLabel(provider.lastCheckedAt)}
                    </dd>
                </div>
                {provider.accountLabel ? (
                    <div className="sm:col-span-2">
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-white/25">
                            Connected account
                        </dt>
                        <dd className="mt-1 break-words text-white/70">{provider.accountLabel}</dd>
                    </div>
                ) : null}
            </dl>

            {provider.error ? (
                <div className="mt-3 flex gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-xs leading-5 text-rose-100/80">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{provider.error}</span>
                </div>
            ) : null}

            {actionError ? (
                <p
                    role="alert"
                    className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.05] p-3 text-xs leading-5 text-rose-100/80"
                >
                    {actionError}
                </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
                {canStartOauth ? (
                    <a
                        href={definition.oauthStartHref}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-300/25 bg-sky-300/[0.09] px-4 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                    >
                        {connectLabel}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                ) : (
                    <button
                        type="button"
                        disabled
                        title={
                            statusRequest.kind === 'loading'
                                ? 'Waiting for the provider status check.'
                                : !provider.configured
                                    ? 'Provider credentials are not configured on the server.'
                                    : 'OAuth start is not available from the verified provider status.'
                        }
                        className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs font-semibold text-white/30"
                    >
                        {actionPending ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : null}
                        {connectLabel}
                    </button>
                )}

                <button
                    type="button"
                    onClick={onOpenCapabilities}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 text-xs font-medium text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    More details
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {provider.status === 'connected' ? (
                    <button
                        type="button"
                        onClick={onDisconnect}
                        disabled={!canDisconnect}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] px-4 text-xs font-medium text-rose-100/70 transition hover:bg-rose-300/[0.08] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                        <Unplug className="h-3.5 w-3.5" aria-hidden="true" />
                        Disconnect
                    </button>
                ) : null}
            </div>

            {!canStartOauth ? (
                <p className="mt-3 text-[11px] leading-5 text-white/35">
                    {statusRequest.kind === 'loading'
                        ? 'Checking server configuration before enabling OAuth.'
                        : !provider.configured
                            ? 'Server credentials or provider app configuration are incomplete.'
                            : provider.source !== 'live'
                                ? 'A live status response is required before OAuth can start.'
                                : 'The backend reports that OAuth start is unavailable.'}
                </p>
            ) : null}

            <details className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <summary className="cursor-pointer list-none px-3 py-3 text-xs font-medium text-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300">
                    <span className="inline-flex items-center gap-2">
                        <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                        Manual setup checklist
                    </span>
                </summary>
                <ol className="space-y-2 border-t border-white/[0.05] px-3 py-3">
                    {definition.manualChecklist.map((item, index) => (
                        <li key={item} className="flex gap-2 text-[11px] leading-5 text-white/40">
                            <span className="font-mono text-sky-200/60">{index + 1}.</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ol>
            </details>
        </article>
    );
}

export function ProviderConnections({
    initialStatuses,
    live,
}: {
    initialStatuses: Pick<FounderSettings['integrations'], 'meta' | 'tiktok'>;
    live: boolean;
}) {
    const snapshotProviders = useMemo(
        () =>
            providerStatusesFromSnapshot({
                meta: initialStatuses.meta,
                tiktok: initialStatuses.tiktok,
            }),
        [initialStatuses.meta, initialStatuses.tiktok],
    );
    const [providers, setProviders] = useState(snapshotProviders);
    const [statusRequest, setStatusRequest] = useState<StatusRequestState>(() =>
        live
            ? { kind: 'loading', message: 'Checking official provider status…' }
            : {
                  kind: 'unavailable',
                  message:
                      'Demo mode shows the dashboard snapshot only. OAuth and disconnect actions remain disabled.',
              },
    );
    const [selectedProviderId, setSelectedProviderId] = useState<ProviderId | null>(null);
    const [pendingProviderId, setPendingProviderId] = useState<ProviderId | null>(null);
    const [actionError, setActionError] = useState<{
        provider: ProviderId;
        message: string;
    } | null>(null);
    const capabilityDialogRef = useRef<HTMLDialogElement>(null);

    const refreshProviders = useCallback(
        async (signal?: AbortSignal) => {
            if (!live) {
                setProviders(snapshotProviders);
                setStatusRequest({
                    kind: 'unavailable',
                    message:
                        'Demo mode shows the dashboard snapshot only. OAuth and disconnect actions remain disabled.',
                });
                return;
            }

            setStatusRequest({
                kind: 'loading',
                message: 'Checking official provider status…',
            });
            try {
                const response = await fetch(PROVIDER_STATUS_ENDPOINT, {
                    method: 'GET',
                    cache: 'no-store',
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                    signal,
                });

                if (response.status === 404 || response.status === 501) {
                    setProviders(snapshotProviders);
                    setStatusRequest({
                        kind: 'unavailable',
                        message:
                            'Provider setup service is not available yet. Complete the manual checklist and deploy the backend routes before connecting.',
                    });
                    return;
                }

                if (!response.ok) {
                    const message = await responseErrorMessage(
                        response,
                        `Provider status check failed with HTTP ${response.status}.`,
                    );
                    throw new Error(message);
                }

                const payload = (await response.json()) as unknown;
                const parsed = parseProviderStatusPayload(payload, snapshotProviders);
                if (parsed.recognizedProviders === 0) {
                    throw new Error(
                        'Provider status response did not include Meta or TikTok state.',
                    );
                }

                setProviders(parsed.providers);
                setStatusRequest({
                    kind: 'ready',
                    message:
                        parsed.recognizedProviders === 2
                            ? 'Live status checked. Connect actions follow backend configuration and granted scopes.'
                            : 'Live status is partial. Missing providers remain on the snapshot and cannot start OAuth.',
                });
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setProviders(snapshotProviders);
                setStatusRequest({
                    kind: 'error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Provider status could not be checked.',
                });
            }
        },
        [live, snapshotProviders],
    );

    useEffect(() => {
        const controller = new AbortController();
        const refreshTimer = window.setTimeout(() => {
            void refreshProviders(controller.signal);
        }, 0);
        return () => {
            window.clearTimeout(refreshTimer);
            controller.abort();
        };
    }, [refreshProviders]);

    const openCapabilities = (provider: ProviderId) => {
        setSelectedProviderId(provider);
        window.requestAnimationFrame(() => capabilityDialogRef.current?.showModal());
    };

    const disconnectProvider = async (provider: ProviderId) => {
        const definition = PROVIDER_DEFINITIONS[provider];
        const confirmed = window.confirm(
            `Disconnect ${definition.label}? Founder OS will lose its verified provider capabilities until you reconnect.`,
        );
        if (!confirmed) return;

        setPendingProviderId(provider);
        setActionError(null);
        try {
            const response = await fetch(
                `/api/founder/os/providers/${provider}/disconnect`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                },
            );
            if (!response.ok) {
                const message = await responseErrorMessage(
                    response,
                    `Disconnect failed with HTTP ${response.status}.`,
                );
                throw new Error(message);
            }

            await refreshProviders();
        } catch (error) {
            setActionError({
                provider,
                message:
                    error instanceof Error
                        ? error.message
                        : `${definition.label} could not be disconnected.`,
            });
        } finally {
            setPendingProviderId(null);
        }
    };

    const selectedProvider = selectedProviderId
        ? providers[selectedProviderId]
        : null;
    const StatusIcon =
        statusRequest.kind === 'loading'
            ? LoaderCircle
            : statusRequest.kind === 'ready'
                ? CheckCircle2
                : CircleAlert;
    const statusTone =
        statusRequest.kind === 'ready'
            ? 'border-emerald-300/15 bg-emerald-300/[0.05] text-emerald-100'
            : statusRequest.kind === 'loading'
                ? 'border-sky-300/15 bg-sky-300/[0.05] text-sky-100'
                : 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100';

    return (
        <section aria-labelledby="social-provider-title" className="p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 id="social-provider-title" className="text-sm font-semibold">
                        Social provider connections
                    </h3>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-white/38">
                        Connection state comes from the provider backend. Capability access is shown
                        separately because a token alone does not grant analytics, replies, or
                        publishing.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => void refreshProviders()}
                    disabled={!live || statusRequest.kind === 'loading'}
                    className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-xs font-medium text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    <RefreshCw
                        className={`h-3.5 w-3.5 ${
                            statusRequest.kind === 'loading' ? 'animate-spin' : ''
                        }`}
                        aria-hidden="true"
                    />
                    Refresh status
                </button>
            </div>

            <div
                className={`mt-4 flex gap-3 rounded-2xl border p-4 ${statusTone}`}
                aria-live="polite"
            >
                <StatusIcon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                        statusRequest.kind === 'loading' ? 'animate-spin' : ''
                    }`}
                    aria-hidden="true"
                />
                <div>
                    <p className="text-xs font-semibold">
                        {statusRequest.kind === 'ready'
                            ? 'Provider status available'
                            : statusRequest.kind === 'loading'
                                ? 'Checking provider setup'
                                : statusRequest.kind === 'error'
                                    ? 'Provider status check failed'
                                    : 'Provider setup unavailable'}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-white/50">
                        {statusRequest.message}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-4 2xl:grid-cols-2">
                {(['meta', 'tiktok'] as const).map((provider) => (
                    <ProviderCard
                        key={provider}
                        provider={providers[provider]}
                        statusRequest={statusRequest}
                        actionPending={pendingProviderId === provider}
                        actionError={
                            actionError?.provider === provider ? actionError.message : null
                        }
                        onOpenCapabilities={() => openCapabilities(provider)}
                        onDisconnect={() => void disconnectProvider(provider)}
                    />
                ))}
            </div>

            <ProviderCapabilityDrawer
                provider={selectedProvider}
                dialogRef={capabilityDialogRef}
                onClose={() => setSelectedProviderId(null)}
            />
        </section>
    );
}
