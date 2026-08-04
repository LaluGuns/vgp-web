export const PROVIDER_IDS = ['meta', 'tiktok'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type ProviderConnectionStatus =
    | 'pending'
    | 'connected'
    | 'refresh_required'
    | 'revoked'
    | 'error'
    | 'not_connected';

export type ProviderGrantType = 'scope' | 'capability';
export type ProviderGrantStatus =
    | 'granted'
    | 'declined'
    | 'expired'
    | 'revoked'
    | 'unknown';

export interface ProviderGrant {
    type: ProviderGrantType;
    name: string;
    status: ProviderGrantStatus;
    grantedAt: string | null;
    expiresAt: string | null;
    lastVerifiedAt: string | null;
}

export interface ProviderConnectionSummary {
    id: string;
    provider: ProviderId;
    providerAccountId: string;
    displayName: string;
    username: string | null;
    accountType: string | null;
    profileUrl: string | null;
    status: ProviderConnectionStatus;
    grants: ProviderGrant[];
    connectedAt: string | null;
    lastVerifiedAt: string | null;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProviderTokenInput {
    accessToken: string;
    refreshToken?: string | null;
    tokenType?: string | null;
    accessTokenExpiresAt?: string | null;
    refreshTokenExpiresAt?: string | null;
    issuedAt?: string | null;
}

export interface SaveProviderConnectionInput {
    provider: ProviderId;
    providerAccountId: string;
    displayName: string;
    username?: string | null;
    accountType?: string | null;
    profileUrl?: string | null;
    metadata?: Record<string, unknown>;
    grants: Array<{
        type: ProviderGrantType;
        name: string;
        status: ProviderGrantStatus;
        grantedAt?: string | null;
        expiresAt?: string | null;
        lastVerifiedAt?: string | null;
        metadata?: Record<string, unknown>;
    }>;
    credentials: ProviderTokenInput;
    requestId: string;
}

const REDACTED_INSPECT = Symbol.for('nodejs.util.inspect.custom');

export class DecryptedProviderCredentials {
    readonly #accessToken: string;
    readonly #refreshToken: string | null;
    readonly tokenType: string | null;
    readonly accessTokenExpiresAt: string | null;
    readonly refreshTokenExpiresAt: string | null;
    readonly issuedAt: string | null;

    constructor(input: {
        accessToken: string;
        refreshToken: string | null;
        tokenType: string | null;
        accessTokenExpiresAt: string | null;
        refreshTokenExpiresAt: string | null;
        issuedAt: string | null;
    }) {
        this.#accessToken = input.accessToken;
        this.#refreshToken = input.refreshToken;
        this.tokenType = input.tokenType;
        this.accessTokenExpiresAt = input.accessTokenExpiresAt;
        this.refreshTokenExpiresAt = input.refreshTokenExpiresAt;
        this.issuedAt = input.issuedAt;
    }

    get accessToken(): string {
        return this.#accessToken;
    }

    get refreshToken(): string | null {
        return this.#refreshToken;
    }

    toJSON(): Record<string, unknown> {
        return {
            redacted: true,
            tokenType: this.tokenType,
            accessTokenExpiresAt: this.accessTokenExpiresAt,
            refreshTokenExpiresAt: this.refreshTokenExpiresAt,
            issuedAt: this.issuedAt,
        };
    }

    [REDACTED_INSPECT](): string {
        return '[DecryptedProviderCredentials REDACTED]';
    }
}

export interface OAuthAuthorizationState {
    provider: ProviderId;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
    nonce: string;
    expiresAt: string;
}

export class ConsumedOAuthState {
    readonly #codeVerifier: string;
    readonly provider: ProviderId;
    readonly redirectUri: string;
    readonly returnTo: string | null;

    constructor(input: {
        codeVerifier: string;
        provider: ProviderId;
        redirectUri: string;
        returnTo: string | null;
    }) {
        this.#codeVerifier = input.codeVerifier;
        this.provider = input.provider;
        this.redirectUri = input.redirectUri;
        this.returnTo = input.returnTo;
    }

    get codeVerifier(): string {
        return this.#codeVerifier;
    }

    toJSON(): Record<string, unknown> {
        return {
            provider: this.provider,
            redirectUri: this.redirectUri,
            returnTo: this.returnTo,
            codeVerifier: '[REDACTED]',
        };
    }

    [REDACTED_INSPECT](): string {
        return '[ConsumedOAuthState PKCE_REDACTED]';
    }
}

export type ProviderJobType =
    | 'token_refresh'
    | 'account_sync'
    | 'insights_sync'
    | 'content_publish'
    | 'social_reply'
    | 'reconcile_unknown';

export type ProviderJobStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'SUCCEEDED'
    | 'FAILED'
    | 'UNKNOWN'
    | 'CANCELLED';

export interface ProviderJobSummary {
    id: string;
    provider: ProviderId;
    connectionId: string;
    jobType: ProviderJobType;
    approvalId: string | null;
    approvalContentHash: string | null;
    inboundEventId: string | null;
    idempotencyKey: string;
    status: ProviderJobStatus;
    attemptCount: number;
    maxAttempts: number;
    nextAttemptAt: string | null;
    remoteReference: string | null;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
}

export interface ProviderExecutionClaim {
    jobId: string;
    idempotencyKey: string;
    connectionId: string;
    outboxId: string;
    provider: ProviderId;
    jobType: Extract<ProviderJobType, 'content_publish' | 'social_reply'>;
    approval: {
        id: string;
        actionType: 'social-reply' | 'social-publish';
        channel: 'instagram' | 'tiktok';
        contentHash: string;
        targetLabel: string;
        payloadSummary: string;
        payload: Record<string, unknown>;
    };
}

export interface InboundReplyClaim {
    inboundEventId: string;
    webhookEventId: string;
    connectionId: string;
    provider: ProviderId;
    providerEventId: string;
    recipientScopedId: string;
    windowExpiresAt: string;
    claimedAt: string;
    approvalId: string;
}

export interface ProviderReconciliationSummary {
    id: string;
    jobId: string;
    status:
        | 'OPEN'
        | 'CHECKING'
        | 'CONFIRMED_SUCCEEDED'
        | 'CONFIRMED_FAILED'
        | 'MANUAL_REVIEW';
    attemptCount: number;
    nextCheckAt: string | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
