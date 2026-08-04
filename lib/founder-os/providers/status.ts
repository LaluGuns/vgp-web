import type {
    ProviderCapability,
    ProviderConnectionSummary,
    ProviderId,
} from './contracts';
import { isProviderConfigured } from './config';

export type CapabilityState =
    | 'available'
    | 'not-connected'
    | 'missing-scope'
    | 'disabled'
    | 'error'
    | 'manual-only'
    | 'unknown';

export interface ProviderStatusCapability {
    id: string;
    label: string;
    state: CapabilityState;
    detail?: string;
}

export interface ProviderStatus {
    status: 'connected' | 'configured' | 'not-connected' | 'error';
    configured: boolean;
    oauthAvailable: boolean;
    accountLabel: string | null;
    lastCheckedAt: string | null;
    error: string | null;
    redirectUri: string | null;
    capabilities: ProviderStatusCapability[];
}

const CAPABILITY_LABELS: Record<ProviderCapability, string> = {
    'owned-analytics': 'Owned account analytics',
    'reel-container': 'Create Instagram Reel container',
    'reel-publish': 'Publish approved Instagram Reel',
    'inbound-reply': 'Reply to eligible inbound Instagram message',
    'creator-info': 'Read TikTok creator posting options',
    'draft-init': 'Send approved TikTok draft',
    'direct-post-init': 'Initialize approved TikTok direct post',
    'post-status': 'Read TikTok post status',
};

const PROVIDER_CAPABILITIES: Record<ProviderId, ProviderCapability[]> = {
    meta: ['owned-analytics', 'reel-container', 'reel-publish', 'inbound-reply'],
    tiktok: ['owned-analytics', 'creator-info', 'draft-init', 'direct-post-init', 'post-status'],
};

export function buildProviderStatus(
    provider: ProviderId,
    summary: ProviderConnectionSummary | null
): ProviderStatus {
    const configured = isProviderConfigured(provider);
    const connected = summary?.status === 'connected';
    const available = new Set(summary?.capabilities ?? []);
    const status: ProviderStatus['status'] = !configured
        ? 'not-connected'
        : summary?.status === 'error' || summary?.status === 'expired'
            ? 'error'
            : connected
                ? 'connected'
                : 'configured';

    const directPostAuditEnabled =
        process.env.TIKTOK_DIRECT_POST_ENABLED === 'true';
    const capabilities: ProviderStatusCapability[] = PROVIDER_CAPABILITIES[provider].map((capability) => ({
        id: capability,
        label: CAPABILITY_LABELS[capability],
        state: (
            capability === 'direct-post-init' && !directPostAuditEnabled
                ? 'disabled'
                : !configured
                ? 'disabled'
                : !connected
                    ? 'not-connected'
                    : available.has(capability)
                        ? 'available'
                        : 'missing-scope'
        ) as CapabilityState,
        detail:
            capability === 'inbound-reply'
                ? 'Only verified inbound conversations inside the response window; cold DM is blocked.'
                : capability === 'direct-post-init' && !directPostAuditEnabled
                    ? 'Disabled until TikTok Direct Post audit approval and explicit server feature flag.'
                : undefined,
    }));

    capabilities.push({
        id: 'cold-social-dm',
        label: 'Cold social direct messages',
        state: 'disabled',
        detail: 'Founder OS policy permanently blocks cold social DM.',
    });

    return {
        status,
        configured,
        oauthAvailable: configured,
        accountLabel: summary?.accountLabel ?? null,
        lastCheckedAt: summary?.lastVerifiedAt ?? null,
        error: summary?.status === 'error' || summary?.status === 'expired'
            ? 'Provider connection requires attention.'
            : null,
        redirectUri: provider === 'meta'
            ? process.env.META_REDIRECT_URI ?? null
            : process.env.TIKTOK_REDIRECT_URI ?? null,
        capabilities,
    };
}
