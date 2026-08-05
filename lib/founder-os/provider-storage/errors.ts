export type ProviderStorageErrorCode =
    | 'PROVIDER_STORAGE_NOT_PROVISIONED'
    | 'PROVIDER_STORAGE_NOT_FOUND'
    | 'PROVIDER_STORAGE_CONFLICT'
    | 'PROVIDER_STORAGE_POLICY_BLOCKED'
    | 'PROVIDER_STORAGE_INVALID_INPUT'
    | 'PROVIDER_STORAGE_ENCRYPTION_KEY_MISSING'
    | 'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID'
    | 'PROVIDER_STORAGE_KEY_VERSION_MISMATCH'
    | 'PROVIDER_STORAGE_DECRYPTION_FAILED'
    | 'PROVIDER_STORAGE_OAUTH_STATE_INVALID'
    | 'PROVIDER_STORAGE_REPLY_WINDOW_CLOSED';

export class ProviderStorageError extends Error {
    readonly code: ProviderStorageErrorCode;
    readonly status: number;
    readonly details?: Record<string, unknown>;

    constructor(
        code: ProviderStorageErrorCode,
        message: string,
        status = 500,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ProviderStorageError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

export function isProviderStorageError(
    error: unknown
): error is ProviderStorageError {
    return error instanceof ProviderStorageError;
}
