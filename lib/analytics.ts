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

export type OrganicEventName = 'seo_landing_view' | 'seo_cta_clicked' | 'music_preview_started' | 'collection_selected' | 'outbound_clicked';
export interface OrganicEventProperties {
    site_scope: 'root';
    funnel: 'cadenz' | 'root';
    route_key: string;
    locale: string;
    intent: string;
    bpm: number | null;
    destination_type: string;
    source_position: string;
    [key: string]: string | number | boolean | null | undefined;
}

function organicDistinctId(): string {
    const key = 'vgp_organic_distinct_id_v1';
    try {
        const saved = window.localStorage.getItem(key);
        if (saved) return saved;
        const next = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
        window.localStorage.setItem(key, next);
        return next;
    } catch {
        return 'anonymous';
    }
}

export function trackOrganicEvent(eventName: OrganicEventName, properties: Partial<OrganicEventProperties> = {}): void {
    if (typeof window === 'undefined') return;
    const route = window.location.pathname;
    const payload: OrganicEventProperties = {
        site_scope: 'root',
        funnel: route.startsWith('/cadenz') ? 'cadenz' : 'root',
        route_key: route,
        locale: 'en',
        intent: route.includes('running-music') ? 'running music by BPM' : 'organic discovery',
        bpm: null,
        destination_type: 'none',
        source_position: 'page',
        ...properties,
    };
    try {
        trackBeatEvent(eventName, payload);
        const body = JSON.stringify({ event: eventName, distinct_id: organicDistinctId(), properties: payload });
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics/organic', blob)) return;
        void fetch('/api/analytics/organic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    } catch {
        // Analytics must never affect navigation or playback.
    }
}
