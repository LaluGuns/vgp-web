import { NextRequest, NextResponse } from 'next/server';
import {
    founderOsErrorResponse,
    founderOsJson,
    getFounderOsRequestId,
} from '../http';
import {
    authenticateFounderOsBridge,
    bridgePrincipalHasScope,
} from './auth';
import type { BridgeRequestContext, BridgeScope } from './contracts';
import {
    consumePersistentBridgeRateLimit,
    recordBridgeRequestOutcome,
} from './repository';

interface BridgeHandlerOptions {
    operation: string;
    scope: BridgeScope;
    rateClass: 'read' | 'draft' | 'request-review';
}
type BridgeHandler = (
    context: BridgeRequestContext
) => Promise<NextResponse> | NextResponse;

const RATE_LIMITS: Record<BridgeHandlerOptions['rateClass'], number> = {
    read: 60,
    draft: 12,
    'request-review': 12,
};

function bridgeAuthFailure(
    status: 401 | 403 | 503,
    code: string,
    requestId: string
): NextResponse {
    return founderOsJson(
        {
            success: false,
            code,
            error: status === 503
                ? 'Founder OS Bridge is not configured.'
                : status === 403
                    ? 'Bridge scope is not permitted.'
                    : 'Unauthorized.',
            requestId,
        },
        {
            status,
            headers: status === 401
                ? { 'WWW-Authenticate': 'Bearer realm="Founder OS Bridge"' }
                : undefined,
        }
    );
}

export async function handleFounderOsBridgeRequest(
    request: NextRequest,
    options: BridgeHandlerOptions,
    handler: BridgeHandler
): Promise<NextResponse> {
    const requestId = getFounderOsRequestId(request);
    const auth = authenticateFounderOsBridge(request.headers);
    if (!auth.ok) {
        return bridgeAuthFailure(auth.status, auth.code, requestId);
    }
    if (!bridgePrincipalHasScope(auth, options.scope)) {
        return bridgeAuthFailure(403, 'SCOPE_FORBIDDEN', requestId);
    }
    if (process.env.FOUNDER_OS_ENABLE_DATABASE !== 'true') {
        return bridgeAuthFailure(503, 'FOUNDER_OS_DATABASE_DISABLED', requestId);
    }

    let rateLimit: Awaited<ReturnType<typeof consumePersistentBridgeRateLimit>>;
    try {
        rateLimit = await consumePersistentBridgeRateLimit({
            requestId,
            principalId: auth.principalId,
            rateClass: options.rateClass,
            operation: options.operation,
            method: request.method,
            limit: RATE_LIMITS[options.rateClass],
        });
    } catch {
        return founderOsJson(
            {
                success: false,
                code: 'BRIDGE_RATE_LIMIT_UNAVAILABLE',
                error: 'Founder OS Bridge safety ledger is unavailable.',
                requestId,
            },
            { status: 503 }
        );
    }
    if (!rateLimit.allowed) {
        return founderOsJson(
            {
                success: false,
                code: 'BRIDGE_RATE_LIMITED',
                error: 'Founder OS Bridge rate limit exceeded.',
                requestId,
            },
            {
                status: 429,
                headers: { 'Retry-After': '60' },
            }
        );
    }

    const context: BridgeRequestContext = {
        requestId,
        principalId: auth.principalId,
        scopes: auth.scopes,
        operation: options.operation,
    };
    let response: NextResponse;
    try {
        response = await handler(context);
    } catch (error) {
        response = founderOsErrorResponse(error, requestId);
    }

    try {
        await recordBridgeRequestOutcome({
            requestId,
            principalId: auth.principalId,
            operation: options.operation,
            statusCode: response.status,
        });
    } catch {
        // Authorization/rate-limit metadata was already committed before the
        // operation. Mutations additionally audit inside their DB transaction.
        console.error('Founder OS Bridge outcome audit failed', { requestId });
    }
    return response;
}
