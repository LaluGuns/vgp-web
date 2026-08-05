import {
    createHash,
    timingSafeEqual,
} from 'node:crypto';

export type CustomGptAuthResult =
    | { ok: true }
    | { ok: false; status: 401 | 503; code: 'UNAUTHORIZED' | 'NOT_CONFIGURED' };

function sha256(value: string): Buffer {
    return createHash('sha256').update(value, 'utf8').digest();
}

export function authorizeCustomGptAction(headers: Headers): CustomGptAuthResult {
    const expected = process.env.FOUNDER_OS_GPT_ACTION_SECRET?.trim();
    if (!expected || expected.length < 32) {
        return { ok: false, status: 503, code: 'NOT_CONFIGURED' };
    }

    const authorization = headers.get('authorization') ?? '';
    const match = /^Bearer ([^\s]+)$/.exec(authorization);
    if (!match) {
        return { ok: false, status: 401, code: 'UNAUTHORIZED' };
    }

    const suppliedHash = sha256(match[1]);
    const expectedHash = sha256(expected);
    return timingSafeEqual(suppliedHash, expectedHash)
        ? { ok: true }
        : { ok: false, status: 401, code: 'UNAUTHORIZED' };
}
