export type ProviderId = 'meta' | 'tiktok';

export type ProviderConnectionStatus =
    | 'connected'
    | 'configured'
    | 'not-connected'
    | 'error';

export type ProviderCapabilityState =
    | 'available'
    | 'not-connected'
    | 'missing-scope'
    | 'disabled'
    | 'error'
    | 'manual-only'
    | 'unknown';

export interface ProviderCapability {
    id: string;
    label: string;
    state: ProviderCapabilityState;
    detail: string;
}

export interface ProviderRuntimeStatus {
    provider: ProviderId;
    status: ProviderConnectionStatus;
    configured: boolean;
    oauthAvailable: boolean;
    accountLabel: string | null;
    lastCheckedAt: string | null;
    error: string | null;
    redirectUri: string | null;
    source: 'snapshot' | 'live';
    capabilities: ProviderCapability[];
}

export interface ProviderDefinition {
    id: ProviderId;
    label: string;
    shortLabel: string;
    description: string;
    oauthStartHref: string;
    manualChecklist: string[];
    capabilities: Array<Omit<ProviderCapability, 'state'>>;
}

export interface ParsedProviderStatus {
    providers: Record<ProviderId, ProviderRuntimeStatus>;
    recognizedProviders: number;
}

const CONNECTION_STATUSES = new Set<ProviderConnectionStatus>([
    'connected',
    'configured',
    'not-connected',
    'error',
]);

const CAPABILITY_STATES = new Set<ProviderCapabilityState>([
    'available',
    'not-connected',
    'missing-scope',
    'disabled',
    'error',
    'manual-only',
    'unknown',
]);

export const PROVIDER_DEFINITIONS: Record<ProviderId, ProviderDefinition> = {
    meta: {
        id: 'meta',
        label: 'Meta / Instagram',
        shortLabel: 'Meta',
        description:
            'Connect an owned professional Instagram account for explicitly granted analytics, Reel publishing, and eligible inbound replies.',
        oauthStartHref: '/api/founder/os/providers/meta/oauth/start',
        manualChecklist: [
            'Create or select the Meta developer app owned by VGP and configure its app credentials on the server.',
            'Link the professional Instagram account to the correct Facebook Page and Business portfolio.',
            'Copy the callback URL reported by the provider backend into the Meta developer console.',
            'Request only the scopes required for owned analytics, Reel publishing, and eligible inbound replies.',
            'Complete Meta app review or business verification where the selected capabilities require it.',
            'Run a test-account connection, then confirm each capability below from the live status response.',
        ],
        capabilities: [
            {
                id: 'owned-analytics',
                label: 'Owned account analytics',
                detail:
                    'Requires an eligible professional account plus the corresponding analytics permission.',
            },
            {
                id: 'reel-container',
                label: 'Create Instagram Reel container',
                detail:
                    'Creates a provider-side container for an approved Reel using media from an explicitly allowed HTTPS host.',
            },
            {
                id: 'reel-publish',
                label: 'Publish approved Instagram Reel',
                detail:
                    'Requires publishing scope, an eligible container, and Founder OS approval for the exact content revision.',
            },
            {
                id: 'inbound-reply',
                label: 'Reply to eligible inbound Instagram message',
                detail:
                    'Limited to conversations and reply windows the official API marks eligible; it is not permission to message every contact.',
            },
            {
                id: 'cold-social-dm',
                label: 'Cold outbound social DM',
                detail:
                    'Founder OS policy keeps cold social outreach manual-only even if a provider exposes messaging features.',
            },
        ],
    },
    tiktok: {
        id: 'tiktok',
        label: 'TikTok',
        shortLabel: 'TikTok',
        description:
            'Connect an owned TikTok account for explicitly approved analytics and content-posting capabilities.',
        oauthStartHref: '/api/founder/os/providers/tiktok/oauth/start',
        manualChecklist: [
            'Create or select the TikTok for Developers app owned by VGP and configure its app credentials on the server.',
            'Add the callback URL reported by the provider backend to the TikTok Login Kit configuration.',
            'Request the minimum scopes for account identity, owned analytics, and the intended posting workflow.',
            'Complete TikTok app review for Direct Post or other restricted capabilities before enabling them.',
            'Use a test account to verify Upload to Draft and Direct Post separately; one does not prove the other.',
            'Confirm each granted capability from the live status response before an agent relies on it.',
        ],
        capabilities: [
            {
                id: 'owned-analytics',
                label: 'Owned account analytics',
                detail:
                    'Requires an approved analytics scope and only covers data the official API returns for the connected account.',
            },
            {
                id: 'creator-info',
                label: 'Read TikTok creator posting options',
                detail:
                    'Reads provider-returned posting options for the connected creator before a draft or direct-post request is prepared.',
            },
            {
                id: 'draft-init',
                label: 'Send approved TikTok draft',
                detail:
                    'Requires the applicable Content Posting API permission and still leaves final publishing inside TikTok.',
            },
            {
                id: 'direct-post-init',
                label: 'Initialize approved TikTok direct post',
                detail:
                    'Kept disabled until the backend confirms TikTok app review, scope, account eligibility, and exact-revision approval.',
            },
            {
                id: 'post-status',
                label: 'Read TikTok post status',
                detail:
                    'Reads official processing state for a provider reference returned by an approved posting action.',
            },
            {
                id: 'inbound-reply',
                label: 'TikTok inbound replies',
                detail:
                    'Not implemented by the current connector. Connecting TikTok does not authorize replies to contacts.',
            },
            {
                id: 'cold-social-dm',
                label: 'Cold outbound social DM',
                detail:
                    'Founder OS policy keeps cold social outreach manual-only even if a provider exposes messaging features.',
            },
        ],
    },
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, maxLength = 240): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized ? normalized.slice(0, maxLength) : null;
}

function validTimestamp(value: unknown): string | null {
    const candidate = boundedString(value, 80);
    if (!candidate || Number.isNaN(Date.parse(candidate))) return null;
    return candidate;
}

function connectionStatus(
    raw: Record<string, unknown>,
): ProviderConnectionStatus {
    const explicit = boundedString(raw.status ?? raw.connectionStatus, 40);
    if (
        explicit &&
        CONNECTION_STATUSES.has(explicit as ProviderConnectionStatus)
    ) {
        return explicit as ProviderConnectionStatus;
    }
    if (raw.connected === true) return 'connected';
    if (raw.error || raw.errorMessage) return 'error';
    if (raw.configured === true) return 'configured';
    return 'not-connected';
}

function capabilityState(value: unknown): ProviderCapabilityState | null {
    const candidate = boundedString(value, 40);
    if (
        candidate &&
        CAPABILITY_STATES.has(candidate as ProviderCapabilityState)
    ) {
        return candidate as ProviderCapabilityState;
    }
    return null;
}

function defaultCapabilityState(
    provider: ProviderId,
    capabilityId: string,
    status: ProviderConnectionStatus,
): ProviderCapabilityState {
    if (capabilityId === 'cold-social-dm') return 'manual-only';
    if (
        provider === 'tiktok' &&
        (capabilityId === 'direct-post-init' || capabilityId === 'inbound-reply')
    ) {
        return 'disabled';
    }
    if (status === 'error') return 'error';
    if (status !== 'connected') return 'not-connected';
    return 'unknown';
}

function looksLikeColdOutbound(id: string, label: string) {
    const normalized = `${id} ${label}`.toLowerCase();
    return (
        normalized.includes('cold') &&
        (normalized.includes('dm') ||
            normalized.includes('direct message') ||
            normalized.includes('outbound'))
    );
}

function rawCapabilityEntries(
    value: unknown,
): Array<{ id: string; value: unknown }> {
    if (Array.isArray(value)) {
        return value.flatMap((item) => {
            if (!isRecord(item)) return [];
            const id = boundedString(item.id ?? item.key ?? item.name, 80);
            return id ? [{ id, value: item }] : [];
        });
    }
    if (!isRecord(value)) return [];
    return Object.entries(value)
        .slice(0, 50)
        .map(([id, item]) => ({ id: id.slice(0, 80), value: item }));
}

function parsedCapabilities(
    provider: ProviderId,
    status: ProviderConnectionStatus,
    value: unknown,
): ProviderCapability[] {
    const defaults = PROVIDER_DEFINITIONS[provider].capabilities.map((capability) => ({
        ...capability,
        state: defaultCapabilityState(provider, capability.id, status),
    }));
    const byId = new Map(defaults.map((capability) => [capability.id, capability]));

    for (const entry of rawCapabilityEntries(value)) {
        const record = isRecord(entry.value) ? entry.value : null;
        const state = capabilityState(record ? record.state ?? record.status : entry.value);
        if (!state) continue;

        const existing = byId.get(entry.id);
        const label =
            boundedString(record?.label, 100) ??
            existing?.label ??
            entry.id.replaceAll('-', ' ');
        const detail =
            boundedString(record?.detail ?? record?.reason ?? record?.requirement, 360) ??
            existing?.detail ??
            'Reported by the provider status service without additional requirement details.';
        const safeState =
            looksLikeColdOutbound(entry.id, label) && state === 'available'
                ? 'manual-only'
                : state;

        byId.set(entry.id, {
            id: entry.id,
            label,
            detail,
            state: safeState,
        });
    }

    return [...byId.values()];
}

function providerError(raw: Record<string, unknown>): string | null {
    const direct = boundedString(raw.errorMessage ?? raw.error, 280);
    if (direct) return direct;
    if (isRecord(raw.error)) {
        return boundedString(raw.error.message, 280);
    }
    return null;
}

function providerRecord(
    payload: unknown,
    provider: ProviderId,
): Record<string, unknown> | null {
    if (!isRecord(payload)) return null;
    const data = isRecord(payload.data) ? payload.data : null;
    const containers = [
        isRecord(payload.providers) ? payload.providers : null,
        data && isRecord(data.providers) ? data.providers : null,
        data,
        payload,
    ];

    for (const container of containers) {
        if (container && isRecord(container[provider])) {
            return container[provider] as Record<string, unknown>;
        }
    }
    return null;
}

export function providerStatusesFromSnapshot(
    statuses: Record<ProviderId, ProviderConnectionStatus>,
): Record<ProviderId, ProviderRuntimeStatus> {
    return {
        meta: snapshotProviderStatus('meta', statuses.meta),
        tiktok: snapshotProviderStatus('tiktok', statuses.tiktok),
    };
}

function snapshotProviderStatus(
    provider: ProviderId,
    status: ProviderConnectionStatus,
): ProviderRuntimeStatus {
    return {
        provider,
        status,
        configured: status === 'connected' || status === 'configured',
        oauthAvailable: false,
        accountLabel: null,
        lastCheckedAt: null,
        error: status === 'error' ? 'The dashboard snapshot reports a provider error.' : null,
        redirectUri: null,
        source: 'snapshot',
        capabilities: parsedCapabilities(provider, status, null),
    };
}

function liveProviderStatus(
    provider: ProviderId,
    raw: Record<string, unknown>,
): ProviderRuntimeStatus {
    const status = connectionStatus(raw);
    const configured =
        typeof raw.configured === 'boolean'
            ? raw.configured
            : status === 'connected' || status === 'configured';
    const explicitOauthAvailability =
        typeof raw.oauthAvailable === 'boolean'
            ? raw.oauthAvailable
            : typeof raw.canConnect === 'boolean'
                ? raw.canConnect
                : null;

    return {
        provider,
        status,
        configured,
        oauthAvailable: explicitOauthAvailability ?? configured,
        accountLabel:
            boundedString(raw.accountLabel ?? raw.accountName, 120) ??
            (isRecord(raw.account) ? boundedString(raw.account.name, 120) : null),
        lastCheckedAt: validTimestamp(raw.lastCheckedAt ?? raw.checkedAt ?? raw.updatedAt),
        error: providerError(raw),
        redirectUri: boundedString(raw.redirectUri ?? raw.callbackUrl, 500),
        source: 'live',
        capabilities: parsedCapabilities(
            provider,
            status,
            raw.capabilities ?? raw.capabilityStates,
        ),
    };
}

export function parseProviderStatusPayload(
    payload: unknown,
    fallback: Record<ProviderId, ProviderRuntimeStatus>,
): ParsedProviderStatus {
    const parsed = { ...fallback };
    let recognizedProviders = 0;

    for (const provider of ['meta', 'tiktok'] as const) {
        const raw = providerRecord(payload, provider);
        if (!raw) continue;
        parsed[provider] = liveProviderStatus(provider, raw);
        recognizedProviders += 1;
    }

    return {
        providers: parsed,
        recognizedProviders,
    };
}
