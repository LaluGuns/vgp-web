export type FounderOsErrorCode =
    | 'FOUNDER_OS_NOT_PROVISIONED'
    | 'FOUNDER_OS_CONFLICT'
    | 'FOUNDER_OS_NOT_FOUND'
    | 'FOUNDER_OS_CONTENT_CHANGED'
    | 'FOUNDER_OS_INVALID_TRANSITION'
    | 'FOUNDER_OS_POLICY_BLOCKED'
    | 'FOUNDER_OS_INVALID_DATA';

export class FounderOsError extends Error {
    readonly code: FounderOsErrorCode;
    readonly status: number;
    readonly details?: Record<string, unknown>;

    constructor(
        code: FounderOsErrorCode,
        message: string,
        status: number,
        details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'FounderOsError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

export function isFounderOsError(error: unknown): error is FounderOsError {
    return error instanceof FounderOsError;
}

export function isMissingFounderOsSchemaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const code = 'code' in error ? String(error.code) : '';
    const message = 'message' in error ? String(error.message) : '';

    return (
        code === '3F000'
        || code === '42P01'
        || message.includes('schema "founder_internal" does not exist')
        || message.includes('relation "founder_internal.')
    );
}
