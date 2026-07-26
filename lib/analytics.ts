/**
 * Analytics Event Helper for Virzy Guns Beat Store
 */

export interface TrackBeatEventParams {
    beatId?: string;
    beatSlug?: string;
    beatTitle?: string;
    primaryGenre?: string;
    categorySlug?: string;
    locale?: string;
    licenseId?: string;
    licenseName?: string;
    displayedPrice?: string;
    currency?: string;
    sourcePage?: string;
    destinationUrl?: string;
    action?: string;
    beatIds?: string;
    beatCount?: number;
    preset?: string;
    vibe?: string;
}

export function trackBeatEvent(eventName: string, params: TrackBeatEventParams = {}) {
    if (typeof window === 'undefined') return;

    try {
        // PostHog support if initialized
        if ((window as unknown as { posthog?: { capture: (name: string, data?: Record<string, unknown>) => void } }).posthog) {
            (window as unknown as { posthog: { capture: (name: string, data?: Record<string, unknown>) => void } }).posthog.capture(
                eventName,
                params as Record<string, unknown>
            );
        }

        // Google Analytics (gtag) support if initialized
        if (typeof (window as unknown as { gtag?: Function }).gtag === 'function') {
            (window as unknown as { gtag: Function }).gtag('event', eventName, params);
        }
    } catch {
        // Analytics error safety wrapper
    }
}
