import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';
import { signToken } from '@/lib/tokens';

// In-memory rate limiting map for newsletter signups (basic protection)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;      // Max 3 signups per IP per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const clientData = rateLimitMap.get(ip);

    if (!clientData) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
        return false;
    }

    if (now - clientData.lastReset > RATE_LIMIT_WINDOW_MS) {
        clientData.count = 1;
        clientData.lastReset = now;
        return false;
    }

    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }

    clientData.count++;
    return false;
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
    try {
        // CSRF check: verify Origin header matches this domain
        const origin = request.headers.get('origin');
        const host = request.headers.get('host') || 'www.virzyguns.com';
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const baseUrl = `${protocol}://${host}`;

        if (origin && origin !== baseUrl && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
            return NextResponse.json({ error: 'Forbidden cross-origin request' }, { status: 403 });
        }

        // Test database pool connection first
        try {
            const client = await pool.connect();
            client.release();
        } catch (dbError) {
            console.error('Database connection test failed:', dbError);
            return NextResponse.json(
                { error: 'Newsletter is temporarily unavailable.' },
                { status: 503 }
            );
        }

        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const { email, name, website } = await request.json();

        // Honeypot field for simple bot submissions.
        if (website) {
            return NextResponse.json({ success: true });
        }

        // 1. Basic validation
        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // 2. Sanitization
        const rawName = name && typeof name === 'string' ? name : 'Producer';
        const subscriberName = escapeHtml(rawName.trim().slice(0, 80) || 'Producer');
        const subscriberEmail = escapeHtml(normalizedEmail);

        // 3. Database Insertion (handling upsert/re-subscribe)
        let subscriberId: number;
        try {
            const result = await pool.query(
                `INSERT INTO vgp_subscribers (name, email, status, unsubscribed_at)
                 VALUES ($1, $2, 'subscribed', NULL)
                 ON CONFLICT (email)
                 DO UPDATE SET status = 'subscribed', name = EXCLUDED.name, unsubscribed_at = NULL
                 RETURNING id`,
                [subscriberName, subscriberEmail]
            );
            subscriberId = result.rows[0].id;
        } catch (dbInsertError) {
            console.error('Database subscriber insert failed:', dbInsertError);
            return NextResponse.json(
                { error: 'Failed to record subscription. Please try again.' },
                { status: 500 }
            );
        }

        // 4. Generate secure signed unsubscribe token
        const unsubscribeToken = signToken({
            subscriber_id: subscriberId,
            email: normalizedEmail,
            purpose: 'unsubscribe'
        });

        const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;

        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        if (!smtpUser || !smtpPass) {
            throw new Error('CRITICAL ENVIRONMENT ERROR: SMTP credentials (SMTP_USER/SMTP_PASS) are missing.');
        }

        // Configure Hostinger SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // 1. Send Notification to Admin
        await transporter.sendMail({
            from: `"VGP System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New Subscriber: ${subscriberName}`,
            text: `Name: ${subscriberName}\nEmail: ${normalizedEmail}\nDate: ${new Date().toLocaleString()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #333; background: #111; color: #fff; border-radius: 8px;">
                    <h2 style="color: #00E5FF;">New VGP Subscriber! 🚀</h2>
                    <p><strong>Name:</strong> ${subscriberName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${subscriberEmail}" style="color: #00E5FF;">${subscriberEmail}</a></p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `,
        });

        // 2. Send Welcome Email to Subscriber
        await transporter.sendMail({
            from: `"Virzy Guns Production" <${process.env.SMTP_USER}>`,
            to: normalizedEmail,
            subject: `Welcome to the Inner Circle 🛡️`,
            text: `Welcome to VGP, ${subscriberName}. You're now on the list for exclusive beats and updates. Unsubscribe here: ${unsubscribeUrl}`,
            html: `
                <div style="background-color: #000000; color: #ffffff; font-family: 'Courier New', monospace; padding: 40px 20px;">
                    <div style="max-w-md mx-auto border border-gray-800 p-8 rounded-lg" style="border: 1px solid #333;">
                        <h1 style="color: #00E5FF; text-align: center; letter-spacing: 2px; margin-bottom: 30px;">VIRZY GUNS PRODUCTION</h1>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                            Welcome, <strong>${subscriberName}</strong>.
                        </p>
                        
                        <p style="font-size: 16px; line-height: 1.6; color: #cccccc;">
                            You've successfully joined the VGP Inner Circle. You are now prioritized for:
                        </p>
                        
                        <ul style="color: #888888; padding-left: 20px; margin-bottom: 30px;">
                            <li style="margin-bottom: 10px;">Exclusive Beat Drops 🎹</li>
                            <li style="margin-bottom: 10px;">HealingWave R&D Updates 🧠</li>
                            <li style="margin-bottom: 10px;">Private Promo Codes 💎</li>
                        </ul>
                        
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="${baseUrl}/studio/beats" style="background-color: #00E5FF; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; font-family: sans-serif; border-radius: 4px; display: inline-block;">
                                BROWSE STUDIO
                            </a>
                        </div>
                        
                        <hr style="border-color: #333; margin-top: 60px; margin-bottom: 20px;">
                        
                        <div style="text-align: center; font-size: 11px; color: #555555;">
                            © ${new Date().getFullYear()} Virzy Guns Production.<br>
                            To unsubscribe, <a href="${unsubscribeUrl}" style="color: #00E5FF; text-decoration: underline;">click here</a>.
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send welcome email. Please try again later.' },
            { status: 500 }
        );
    }
}
