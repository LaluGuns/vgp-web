import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
    timingSafeEqual,
} from 'node:crypto';
import { ProviderStorageError } from './errors';
import type { ProviderId } from './types';

export interface EncryptedEnvelope {
    algorithm: 'aes-256-gcm';
    encryptionVersion: 1;
    keyVersion: number;
    ciphertext: Buffer;
    iv: Buffer;
    authTag: Buffer;
}

interface EncryptionKeyConfig {
    key: Buffer;
    keyVersion: number;
}

function decodeEncryptionKey(encoded: string): Buffer {
    if (encoded.startsWith('hex:')) {
        const value = encoded.slice(4);
        if (!/^[0-9a-fA-F]{64}$/.test(value)) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID',
                'FOUNDER_OS_TOKEN_ENCRYPTION_KEY hex value must contain exactly 64 hex characters.'
            );
        }
        return Buffer.from(value, 'hex');
    }

    if (encoded.startsWith('base64:')) {
        const value = encoded.slice(7);
        if (!/^[A-Za-z0-9+/]{43}=$/.test(value)) {
            throw new ProviderStorageError(
                'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID',
                'FOUNDER_OS_TOKEN_ENCRYPTION_KEY base64 value must encode exactly 32 bytes.'
            );
        }
        return Buffer.from(value, 'base64');
    }

    throw new ProviderStorageError(
        'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID',
        'FOUNDER_OS_TOKEN_ENCRYPTION_KEY must use an explicit hex: or base64: prefix.'
    );
}

function loadEncryptionKey(): EncryptionKeyConfig {
    const encoded = process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY;
    if (!encoded) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_ENCRYPTION_KEY_MISSING',
            'FOUNDER_OS_TOKEN_ENCRYPTION_KEY is required for provider credentials.'
        );
    }

    const key = decodeEncryptionKey(encoded);
    if (key.byteLength !== 32) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID',
            'FOUNDER_OS_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.'
        );
    }

    const versionRaw =
        process.env.FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION?.trim() || '1';
    if (!/^[1-9][0-9]{0,8}$/.test(versionRaw)) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_ENCRYPTION_KEY_INVALID',
            'FOUNDER_OS_TOKEN_ENCRYPTION_KEY_VERSION must be a positive integer.'
        );
    }

    return { key, keyVersion: Number(versionRaw) };
}

export function makeCredentialAad(
    provider: ProviderId,
    connectionId: string,
    tokenKind: 'access' | 'refresh',
    keyVersion: number
): Buffer {
    return Buffer.from(
        `founder-os/provider-credential/v1/${provider}/${connectionId}/${tokenKind}/key-${keyVersion}`,
        'utf8'
    );
}

export function makeOAuthVerifierAad(
    provider: ProviderId,
    stateHashHex: string,
    keyVersion: number
): Buffer {
    return Buffer.from(
        `founder-os/oauth-pkce/v1/${provider}/${stateHashHex}/key-${keyVersion}`,
        'utf8'
    );
}

export function encryptSecret(
    plaintext: string,
    aadFactory: (keyVersion: number) => Buffer
): EncryptedEnvelope {
    if (!plaintext) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_INVALID_INPUT',
            'Secret plaintext must not be empty.',
            400
        );
    }

    const { key, keyVersion } = loadEncryptionKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv, {
        authTagLength: 16,
    });
    cipher.setAAD(aadFactory(keyVersion));
    const ciphertext = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);

    return {
        algorithm: 'aes-256-gcm',
        encryptionVersion: 1,
        keyVersion,
        ciphertext,
        iv,
        authTag: cipher.getAuthTag(),
    };
}

export function decryptSecret(
    envelope: EncryptedEnvelope,
    aadFactory: (keyVersion: number) => Buffer
): string {
    if (
        envelope.algorithm !== 'aes-256-gcm'
        || envelope.encryptionVersion !== 1
        || envelope.iv.byteLength !== 12
        || envelope.authTag.byteLength !== 16
        || envelope.ciphertext.byteLength === 0
    ) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_DECRYPTION_FAILED',
            'Provider credential envelope is invalid.'
        );
    }

    const { key, keyVersion } = loadEncryptionKey();
    if (envelope.keyVersion !== keyVersion) {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_KEY_VERSION_MISMATCH',
            'Stored provider credentials require a different encryption-key version.'
        );
    }

    try {
        const decipher = createDecipheriv(
            'aes-256-gcm',
            key,
            envelope.iv,
            { authTagLength: 16 }
        );
        decipher.setAAD(aadFactory(envelope.keyVersion));
        decipher.setAuthTag(envelope.authTag);
        return Buffer.concat([
            decipher.update(envelope.ciphertext),
            decipher.final(),
        ]).toString('utf8');
    } catch {
        throw new ProviderStorageError(
            'PROVIDER_STORAGE_DECRYPTION_FAILED',
            'Provider credential authentication failed.'
        );
    }
}

export function sha256(value: string | Uint8Array): Buffer {
    return createHash('sha256').update(value).digest();
}

export function base64Url(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64url');
}

export function createOAuthArtifacts(): {
    state: string;
    codeVerifier: string;
    codeChallenge: string;
    nonce: string;
} {
    const state = base64Url(randomBytes(32));
    const codeVerifier = base64Url(randomBytes(48));
    return {
        state,
        codeVerifier,
        codeChallenge: base64Url(sha256(codeVerifier)),
        nonce: base64Url(randomBytes(32)),
    };
}

export function constantTimeTextEqual(left: string, right: string): boolean {
    const leftHash = sha256(left);
    const rightHash = sha256(right);
    return timingSafeEqual(leftHash, rightHash);
}

export function constantTimeBufferEqual(
    left: Uint8Array,
    right: Uint8Array
): boolean {
    if (left.byteLength !== right.byteLength) return false;
    return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

function stableJsonValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(stableJsonValue);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, nested]) => [key, stableJsonValue(nested)])
        );
    }
    return value;
}

export function hashCanonicalJson(value: Record<string, unknown>): Buffer {
    return sha256(JSON.stringify(stableJsonValue(value)));
}
