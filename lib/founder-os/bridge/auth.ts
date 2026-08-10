import { createHash, timingSafeEqual } from 'node:crypto';

export const BRIDGE_SCOPES = [
    'bridge:read',
    'bridge:draft',
    'bridge:request-review',
] as const;
export type BridgeScope = (typeof BRIDGE_SCOPES)[number];
export const BRIDGE_PRINCIPAL_ID = 'codex-plugin' as const;

export type BridgeAuthResult =
    | {
        ok: true;
        principalId: typeof BRIDGE_PRINCIPAL_ID;
        scopes: readonly BridgeScope[];
    }
    | {
        ok: false;
        status: 401 | 503;
        code: 'UNAUTHORIZED' | 'NOT_CONFIGURED';
    };

function digest(value: string): Buffer {
    return createHash('sha256').update(value, 'utf8').digest();
}

export function authenticateFounderOsBridge(headers: Headers): BridgeAuthResult {
    const expected = process.env.FOUNDER_OS_BRIDGE_SECRET?.trim();
    if (!expected || expected.length < 32) {
        return { ok: false, status: 503, code: 'NOT_CONFIGURED' };
    }

    const authorization = headers.get('authorization') ?? '';
    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) {
        return { ok: false, status: 401, code: 'UNAUTHORIZED' };
    }

    if (!timingSafeEqual(digest(match[1]), digest(expected))) {
        return { ok: false, status: 401, code: 'UNAUTHORIZED' };
    }

    return {
        ok: true,
        principalId: BRIDGE_PRINCIPAL_ID,
        scopes: BRIDGE_SCOPES,
    };
}

export function bridgePrincipalHasScope(
    result: Extract<BridgeAuthResult, { ok: true }>,
    requiredScope: BridgeScope
): boolean {
    return result.scopes.includes(requiredScope);
}
