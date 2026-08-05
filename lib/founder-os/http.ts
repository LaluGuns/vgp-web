import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { checkFounderSession, hasValidRequestOrigin } from '@/lib/auth';
import { isFounderOsError } from './errors';

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;

export function getFounderOsRequestId(request: NextRequest): string {
    const supplied = request.headers.get('x-request-id');
    return supplied && SAFE_REQUEST_ID.test(supplied) ? supplied : randomUUID();
}

export async function authorizeFounderOsRequest(
    request: NextRequest,
    mutation: boolean
): Promise<NextResponse | null> {
    if (!(await checkFounderSession(request))) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    if (mutation && !hasValidRequestOrigin(request)) {
        return NextResponse.json(
            { success: false, error: 'Forbidden cross-origin request' },
            { status: 403 }
        );
    }

    return null;
}

export function founderOsJson(
    body: unknown,
    init: ResponseInit = {}
): NextResponse {
    const headers = new Headers(init.headers);
    headers.set('Cache-Control', 'private, no-store, max-age=0');
    return NextResponse.json(body, { ...init, headers });
}

export function founderOsErrorResponse(
    error: unknown,
    requestId: string
): NextResponse {
    if (isFounderOsError(error)) {
        return founderOsJson(
            {
                success: false,
                error: error.message,
                code: error.code,
                requestId,
                ...(error.details ? { details: error.details } : {}),
            },
            { status: error.status }
        );
    }

    console.error('Founder OS request failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
    });
    return founderOsJson(
        {
            success: false,
            error: 'Internal server error.',
            requestId,
        },
        { status: 500 }
    );
}
