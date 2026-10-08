/**
 * Which articles this reader has finished. Kept in this browser only; it
 * is a convenience, not an account feature.
 */

const KEY = 'vgp_read_articles';
const EVENT = 'vgp:read-articles';

export function readArticles(): string[] {
    try {
        const value = JSON.parse(localStorage.getItem(KEY) || '[]');
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

export function markRead(slug: string) {
    try {
        const current = readArticles();
        if (current.includes(slug)) return;
        localStorage.setItem(KEY, JSON.stringify([...current, slug]));
        window.dispatchEvent(new Event(EVENT));
    } catch {
        // Progress is optional when storage is unavailable.
    }
}

/** Subscribe to changes, for useSyncExternalStore. */
export function subscribeRead(callback: () => void) {
    window.addEventListener(EVENT, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}
