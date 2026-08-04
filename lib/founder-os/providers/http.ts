const MAX_RESPONSE_BYTES = 512 * 1024;
const DEFAULT_TIMEOUT_MS = 15_000;

export class ProviderRequestError extends Error {
    readonly providerCode: string;
    readonly httpStatus: number | null;
    readonly ambiguous: boolean;

    constructor(
        message: string,
        options: {
            providerCode: string;
            httpStatus?: number | null;
            ambiguous?: boolean;
        }
    ) {
        super(message);
        this.name = 'ProviderRequestError';
        this.providerCode = safeProviderCode(options.providerCode);
        this.httpStatus = options.httpStatus ?? null;
        this.ambiguous = options.ambiguous ?? false;
    }
}

export function safeProviderCode(value: unknown): string {
    return String(value ?? '')
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '_')
        .slice(0, 64) || 'UNCLASSIFIED';
}

async function readBoundedJson(response: Response): Promise<unknown> {
    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_RESPONSE_BYTES) {
        await response.body?.cancel();
        throw new ProviderRequestError('Provider response exceeded the size limit.', {
            providerCode: 'RESPONSE_TOO_LARGE',
            httpStatus: response.status,
        });
    }

    if (!response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new ProviderRequestError('Provider response exceeded the size limit.', {
                providerCode: 'RESPONSE_TOO_LARGE',
                httpStatus: response.status,
            });
        }
        chunks.push(value);
    }

    const merged = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }
    if (size === 0) return null;

    try {
        return JSON.parse(new TextDecoder().decode(merged));
    } catch {
        throw new ProviderRequestError('Provider returned invalid JSON.', {
            providerCode: 'INVALID_JSON',
            httpStatus: response.status,
        });
    }
}

export async function providerJsonRequest(
    fetchImpl: typeof fetch,
    url: string,
    init: RequestInit,
    options: {
        externalWrite: boolean;
        timeoutMs?: number;
    }
): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );
    let dispatched = false;

    try {
        dispatched = true;
        const response = await fetchImpl(url, {
            ...init,
            signal: controller.signal,
            redirect: 'error',
        });
        const body = await readBoundedJson(response);

        if (!response.ok) {
            const code = extractProviderErrorCode(body) ?? `HTTP_${response.status}`;
            throw new ProviderRequestError('Provider rejected the request.', {
                providerCode: code,
                httpStatus: response.status,
                ambiguous: options.externalWrite && response.status >= 500,
            });
        }

        return body;
    } catch (error) {
        if (error instanceof ProviderRequestError) {
            if (
                options.externalWrite
                && error.httpStatus !== null
                && error.providerCode === 'INVALID_JSON'
            ) {
                throw new ProviderRequestError(error.message, {
                    providerCode: error.providerCode,
                    httpStatus: error.httpStatus,
                    ambiguous: true,
                });
            }
            throw error;
        }

        throw new ProviderRequestError('Provider request did not return a conclusive response.', {
            providerCode:
                error instanceof DOMException && error.name === 'AbortError'
                    ? 'TIMEOUT'
                    : 'NETWORK_ERROR',
            ambiguous: options.externalWrite && dispatched,
        });
    } finally {
        clearTimeout(timeout);
    }
}

function extractProviderErrorCode(body: unknown): string | null {
    if (!body || typeof body !== 'object') return null;
    const record = body as Record<string, unknown>;
    if (typeof record.error === 'string') return safeProviderCode(record.error);
    if (record.error && typeof record.error === 'object') {
        const nested = record.error as Record<string, unknown>;
        if (nested.code !== undefined) return safeProviderCode(nested.code);
        if (nested.type !== undefined) return safeProviderCode(nested.type);
    }
    return null;
}
