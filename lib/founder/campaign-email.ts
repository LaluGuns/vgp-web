export const CAMPAIGN_TEMPLATE_TYPES = ['beat_promo', 'cadenz_update', 'inner_circle', 'book_reader'] as const;

export type CampaignTemplateType = (typeof CAMPAIGN_TEMPLATE_TYPES)[number];

export interface CampaignEmailRenderInput {
    recipientName: string;
    recipientEmail?: string;
    subject: string;
    templateType: string;
    bodyContent: string;
    baseUrl?: string;
    unsubscribeUrl?: string;
    logId?: number;
    includeTrackingPixel?: boolean;
}

interface TemplateConfig {
    badge: string;
    greeting: (name: string) => string;
    defaultBody: string;
    ctaLabel: string;
    ctaHref: (baseUrl: string) => string;
    badgeStyle: string;
    buttonStyle: string;
}

const TEMPLATE_CONFIG: Record<CampaignTemplateType, TemplateConfig> = {
    beat_promo: {
        badge: 'BEAT PROMO',
        greeting: (name) => `Yo ${name},`,
        defaultBody: 'A new premium beat has just dropped in the studio. Get first access and special rates before public release.',
        ctaLabel: 'LISTEN & SECURE LICENSE',
        ctaHref: (baseUrl) => `${baseUrl}/studio/beats`,
        badgeStyle: 'background-color: rgba(0, 229, 255, 0.12); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3);',
        buttonStyle: 'background-color: #00E5FF; background: linear-gradient(135deg, #00E5FF 0%, #008cff 100%); color: #030712; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.35);',
    },
    cadenz_update: {
        badge: 'CADENZ R&D',
        greeting: (name) => `${name} - quick CADENZ update.`,
        defaultBody: 'We are pushing the boundaries of spatial audio and bio-resonance beat science. Check out our latest project logs.',
        ctaLabel: 'READ DEVELOPMENT LOG',
        ctaHref: (baseUrl) => `${baseUrl}/cadenz`,
        badgeStyle: 'background-color: rgba(112, 0, 255, 0.12); color: #a855f7; border: 1px solid rgba(112, 0, 255, 0.3);',
        buttonStyle: 'background-color: #7000FF; background: linear-gradient(135deg, #7000FF 0%, #a855f7 100%); color: #ffffff; box-shadow: 0 4px 15px rgba(112, 0, 255, 0.35);',
    },
    book_reader: {
        badge: 'VGP LIBRARY',
        greeting: (name) => `What's good ${name},`,
        defaultBody: 'The new production guide is ready. No fluff - just real technique and workflow breakdowns straight from the studio.',
        ctaLabel: 'READ THE GUIDE',
        ctaHref: (baseUrl) => `${baseUrl}/books`,
        badgeStyle: 'background-color: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);',
        buttonStyle: 'background-color: #f59e0b; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #030712; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);',
    },
    inner_circle: {
        badge: 'INNER CIRCLE',
        greeting: (name) => `${name},`,
        defaultBody: '',
        ctaLabel: 'ACCESS PRIVATE PORTAL',
        ctaHref: (baseUrl) => baseUrl || '#',
        badgeStyle: 'background-color: rgba(255, 255, 255, 0.05); color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.3);',
        buttonStyle: 'background-color: #0c1220; color: #00E5FF; border: 1px solid rgba(0, 229, 255, 0.4); box-shadow: 0 4px 15px rgba(0, 229, 255, 0.05);',
    },
};

function normalizeTemplateType(templateType: string): CampaignTemplateType {
    return CAMPAIGN_TEMPLATE_TYPES.includes(templateType as CampaignTemplateType)
        ? (templateType as CampaignTemplateType)
        : 'inner_circle';
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttribute(value: string): string {
    return escapeHtml(value).replace(/`/g, '&#096;');
}

function absolutizeBaseUrl(baseUrl?: string): string {
    return (baseUrl || '').replace(/\/$/, '');
}

function withNamePlaceholders(body: string, name: string): string {
    return body
        .replace(/\{\{\s*name\s*\}\}/gi, name)
        .replace(/\[\s*Name\s*\]/gi, name);
}

function safeDisplayName(name: string, email?: string): string {
    const clean = name && name.trim() && name.trim() !== 'Producer' ? name.trim() : '';
    if (clean) return clean;

    if (!email || !email.includes('@')) return 'Producer';
    const username = email.split('@')[0].replace(/[._-]/g, ' ').trim();
    return username
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Producer';
}

function trackedUrl(url: string, baseUrl: string, logId?: number): string {
    if (!logId || !baseUrl || url.includes('/api/newsletter/track') || url.includes('/unsubscribe')) {
        return url;
    }
    return `${baseUrl}/api/newsletter/track/click?logId=${logId}&url=${encodeURIComponent(url)}`;
}

function renderBodyHtml(text: string, baseUrl: string, logId?: number): string {
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part) => {
        if (!part) return '';
        if (/^https?:\/\//.test(part)) {
            const cleanUrl = part.replace(/[),.;!?]+$/, '');
            const suffix = part.slice(cleanUrl.length);
            const href = trackedUrl(cleanUrl, baseUrl, logId);
            return `<a href="${escapeAttribute(href)}" style="color: #00E5FF; text-decoration: underline; font-weight: 600;">${escapeHtml(cleanUrl)}</a>${escapeHtml(suffix)}`;
        }
        return escapeHtml(part);
    }).join('');
}

function renderCta(config: TemplateConfig, baseUrl: string, logId?: number): string {
    const rawHref = config.ctaHref(baseUrl);
    const href = rawHref === '#' ? '#' : trackedUrl(rawHref, baseUrl, logId);
    return `
        <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="${escapeAttribute(href)}" style="${config.buttonStyle} padding: 14px 32px; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 8px; display: inline-block; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                ${config.ctaLabel}
            </a>
        </div>
    `;
}

export function renderCampaignEmail(input: CampaignEmailRenderInput): { html: string; text: string } {
    const baseUrl = absolutizeBaseUrl(input.baseUrl);
    const currentYear = new Date().getFullYear();
    const templateType = normalizeTemplateType(input.templateType);
    const config = TEMPLATE_CONFIG[templateType];
    const displayName = safeDisplayName(input.recipientName, input.recipientEmail);
    const rawBody = input.bodyContent && input.bodyContent.trim() ? input.bodyContent : config.defaultBody;
    const personalizedBody = withNamePlaceholders(rawBody, displayName);
    const safeName = escapeHtml(displayName);
    const bodyHtml = renderBodyHtml(personalizedBody, baseUrl, input.logId);
    const logoSrc = baseUrl ? `${baseUrl}/branding/logo-tg.png` : '/branding/logo-tg.png';
    const unsubscribeHtml = input.unsubscribeUrl
        ? `<a href="${escapeAttribute(input.unsubscribeUrl)}" style="color: #00E5FF; text-decoration: underline; font-weight: 600;">unsubscribe here</a>`
        : '<span style="color: #00E5FF; text-decoration: underline; font-weight: 600;">unsubscribe here</span>';
    const trackingPixel = input.includeTrackingPixel && baseUrl && input.logId
        ? `<img src="${baseUrl}/api/newsletter/track/open?logId=${input.logId}" width="1" height="1" alt="" style="display:none;" />`
        : '';

    const html = `
        <div style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; min-height: 100%; box-sizing: border-box;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #060b13; border: 1px solid rgba(56, 189, 248, 0.12); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); margin-top: 20px;">
                <tr>
                    <td height="4" style="background: linear-gradient(90deg, #00E5FF 0%, #7000FF 100%); line-height: 4px; font-size: 0px;">&nbsp;</td>
                </tr>
                <tr>
                    <td style="padding: 40px 35px; background: radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.04), transparent 75%);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="margin-bottom: 12px;">
                                <img src="${escapeAttribute(logoSrc)}" alt="VGP" style="height: 48px; width: auto; max-width: 120px; object-fit: contain; display: inline-block;" />
                            </div>
                            <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 3px; margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">VIRZY GUNS PRODUCTION</h1>
                            <div style="color: #00E5FF; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">100% Art. 100% Science.</div>
                        </div>
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-bottom: 30px; height: 1px;"></div>
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span style="font-size: 10px; ${config.badgeStyle} padding: 5px 12px; font-weight: 800; letter-spacing: 2px; border-radius: 9999px; text-transform: uppercase; display: inline-block;">
                                ${config.badge}
                            </span>
                        </div>
                        <p style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin-bottom: 20px; font-weight: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ${config.greeting(safeName)}
                        </p>
                        <div style="font-size: 15px; line-height: 1.7; color: #94a3b8; margin-bottom: 30px; white-space: pre-line; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            ${bodyHtml}
                        </div>
                        ${renderCta(config, baseUrl, input.logId)}
                        <div style="border-top: 1px solid rgba(56, 189, 248, 0.08); margin-top: 40px; margin-bottom: 25px; height: 1px;"></div>
                        <div style="text-align: center; font-size: 11px; color: #475569; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            &copy; ${currentYear} Virzy Guns Production. All rights reserved.<br>
                            You are receiving this because you are part of the VGP Inner Circle.<br><br>
                            To stop receiving these emails, ${unsubscribeHtml}.
                        </div>
                    </td>
                </tr>
            </table>
            ${trackingPixel}
        </div>
    `;

    const text = `${input.subject || 'VGP Broadcast'}\n\nGreetings ${displayName},\n\n${personalizedBody}\n\nTo unsubscribe: ${input.unsubscribeUrl || 'unsubscribe from the footer link'}`;

    return { html, text };
}
