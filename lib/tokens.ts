import crypto from 'crypto';

export interface UnsubscribePayload {
    subscriber_id: number;
    email: string;
    purpose: 'unsubscribe';
}

function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('CRITICAL ENVIRONMENT ERROR: JWT_SECRET is not configured in environment variables.');
    }
    return secret;
}

/**
 * Signs a payload using HMAC-SHA256 to create a secure JWT-like token.
 */
export function signToken(payload: any): string {
    const secret = getJwtSecret();
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${signature}`;
}

/**
 * Verifies a token's signature and returns the decoded payload, or null if invalid.
 */
export function verifyToken(token: string): any {
    try {
        const secret = getJwtSecret();
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [header, body, signature] = parts;
        
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${header}.${body}`)
            .digest('base64url');
            
        // Constant-time comparison to prevent timing attacks
        const signatureBuffer = Buffer.from(signature, 'base64url');
        const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
        
        if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            return null;
        }
        
        const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
        return decodedBody;
    } catch (e) {
        return null;
    }
}
