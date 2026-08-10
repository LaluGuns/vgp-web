const SENSITIVE_KEY = /authorization|bearer|token|secret|password|cookie|credential|private.?key|(?:request|response|message)?body|payload|recipient|email/i;
const CREDENTIAL_VALUE = /(?:\bBearer\s+[A-Za-z0-9._~+/=-]{12,}|\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{12,}|-----BEGIN [^-]*PRIVATE KEY-----)/i;
const MAX_AUDIT_STRING_LENGTH = 512;
const MAX_AUDIT_DEPTH = 6;
const MAX_AUDIT_ARRAY_ITEMS = 50;
const PRIVATE_CONTENT_KEYS = new Set([
    'message',
    'caption',
    'subject',
    'text',
    'content',
]);

export type RedactedAuditValue =
    | string
    | number
    | boolean
    | null
    | RedactedAuditValue[]
    | { [key: string]: RedactedAuditValue };

function isSensitiveAuditKey(key: string): boolean {
    const normalized = key.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    if (normalized === 'contenthash' || normalized.endsWith('contenthash')) {
        return false;
    }
    return PRIVATE_CONTENT_KEYS.has(normalized) || SENSITIVE_KEY.test(normalized);
}

export function redactBridgeAuditValue(
    value: unknown,
    depth = 0
): RedactedAuditValue {
    if (depth >= MAX_AUDIT_DEPTH) return '[TRUNCATED]';
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string') {
        if (CREDENTIAL_VALUE.test(value)) return '[REDACTED]';
        return value.length <= MAX_AUDIT_STRING_LENGTH
            ? value
            : `${value.slice(0, MAX_AUDIT_STRING_LENGTH)}…`;
    }
    if (Array.isArray(value)) {
        return value
            .slice(0, MAX_AUDIT_ARRAY_ITEMS)
            .map((item) => redactBridgeAuditValue(item, depth + 1));
    }
    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, item]) => [
                key,
                isSensitiveAuditKey(key)
                    ? '[REDACTED]'
                    : redactBridgeAuditValue(item, depth + 1),
            ])
        );
    }
    return String(value).slice(0, MAX_AUDIT_STRING_LENGTH);
}
