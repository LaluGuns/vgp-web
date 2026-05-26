import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissions = new Map<string, { count: number; resetAt: number }>();

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isRateLimited(key: string) {
    const now = Date.now();
    const current = submissions.get(key);

    if (!current || current.resetAt <= now) {
        submissions.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    current.count += 1;
    return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('Newsletter API Error: missing SMTP credentials');
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

        // Configure Hostinger SMTP Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 1. Send Notification to Admin (You)
        await transporter.sendMail({
            from: `"VGP System" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New Subscriber: ${subscriberName}`,
            text: `Name: ${rawName.trim().slice(0, 80) || 'Producer'}\nEmail: ${normalizedEmail}\nDate: ${new Date().toLocaleString()}`,
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
            text: `Welcome to VGP, ${subscriberName}. You're now on the list for exclusive beats and updates.`,
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
                            <a href="https://virzyguns.com/studio/beats" style="background-color: #00E5FF; color: #000000; padding: 15px 30px; text-decoration: none; font-weight: bold; font-family: sans-serif; border-radius: 4px; display: inline-block;">
                                BROWSE STUDIO
                            </a>
                        </div>
                        
                        <hr style="border-color: #333; margin-top: 60px; margin-bottom: 20px;">
                        
                        <div style="text-align: center; font-size: 11px; color: #555555;">
                            © ${new Date().getFullYear()} Virzy Guns Production.<br>
                            To unsubscribe, reply "UNSUBSCRIBE" to this email.
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send email. Please try again later.' },
            { status: 500 }
        );
    }
}
