'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readArticles, subscribeRead } from '@/components/blog/article/reading-state';

/**
 * The live layer of the path map (PathMap renders everything on the
 * server). After hydration it fills the marks of the lessons read on this
 * device, says so in their names and in each path's count, and turns the
 * key line under the map into a readout of the lesson under the pointer or
 * the keyboard focus. It only sets attributes and text on the server's
 * markup, in boxes that already have their size, so nothing moves; React
 * never re-renders the map.
 *
 * The map's links are plain anchors (one per lesson and path), so this also
 * gives them what next/link would: a plain click goes through the app router
 * (no full page load), and a lesson is prefetched when the pointer or the
 * focus reaches it. A click with a modifier key, or with no script, is an
 * ordinary link.
 */
export function PathMapLive({ mapId, readoutId }: { mapId: string; readoutId: string }) {
    const router = useRouter();

    useEffect(() => {
        const map = document.getElementById(mapId);
        const readout = document.getElementById(readoutId);
        if (!map) return;
        const links = Array.from(map.querySelectorAll<HTMLAnchorElement>('a[data-slug]'));
        const counts = Array.from(map.querySelectorAll<HTMLElement>('[data-map-count]'));
        const names = new Map(links.map((link) => [link, link.getAttribute('aria-label') ?? '']));

        const paint = () => {
            const read = new Set(readArticles());
            for (const link of links) {
                const isRead = read.has(link.dataset.slug ?? '');
                link.toggleAttribute('data-read', isRead);
                const name = names.get(link) ?? '';
                link.setAttribute('aria-label', isRead ? name.replace(/^Lesson (\d+):/, 'Lesson $1, read:') : name);
            }
            for (const count of counts) {
                const track = count.closest('.vgp-map-path');
                const total = Number(count.dataset.total);
                const done = track ? track.querySelectorAll('a[data-read]').length : 0;
                count.textContent = done > 0 ? `${done} of ${total} read` : `${total} lessons`;
            }
        };

        // The readout: the path, the lesson's place in it and its reading time, then its title.
        const line = readout?.querySelector<HTMLElement>('[data-line]');
        const title = readout?.querySelector<HTMLElement>('[data-title]');
        const rest = line && title ? { line: line.textContent ?? '', title: title.textContent ?? '' } : null;
        let shown: HTMLAnchorElement | null = null;
        const show = (link: HTMLAnchorElement | null) => {
            if (!line || !title || !rest || link === shown) return;
            shown = link;
            if (!link) {
                line.textContent = rest.line;
                title.textContent = rest.title;
                readout?.removeAttribute('data-active');
                return;
            }
            const track = link.closest('ol');
            line.textContent = `${track?.dataset.name ?? ''} · lesson ${link.dataset.n} of ${track?.childElementCount ?? 0} · ${link.dataset.min} min${link.hasAttribute('data-read') ? ' · read' : ''}`;
            title.textContent = (names.get(link) ?? '').replace(/^Lesson \d+: /, '');
            readout?.setAttribute('data-active', '');
        };
        const lessonAt = (target: EventTarget | null) => (target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-slug]') : null);
        // Only the map's own page links ("Skip past the map" is an in-page link).
        const pageLinkAt = (target: EventTarget | null) => {
            const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href^="/"]') : null;
            return link && map.contains(link) ? link : null;
        };
        const prefetched = new Set<string>();
        const prefetch = (link: HTMLAnchorElement | null) => {
            const href = link?.getAttribute('href');
            if (!href || prefetched.has(href)) return;
            prefetched.add(href);
            router.prefetch(href);
        };
        const onOver = (event: PointerEvent) => {
            if (event.pointerType !== 'mouse') return;
            show(lessonAt(event.target));
            prefetch(pageLinkAt(event.target));
        };
        const onLeave = () => {
            if (!map.contains(document.activeElement)) show(null);
        };
        const onFocus = (event: FocusEvent) => {
            show(lessonAt(event.target));
            prefetch(pageLinkAt(event.target));
        };
        const onBlur = (event: FocusEvent) => {
            if (!lessonAt(event.relatedTarget)) show(null);
        };
        const onClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const href = pageLinkAt(event.target)?.getAttribute('href');
            if (!href) return;
            event.preventDefault();
            router.push(href);
        };

        const frame = requestAnimationFrame(paint);
        const unsubscribe = subscribeRead(paint);
        map.addEventListener('pointerover', onOver);
        map.addEventListener('pointerleave', onLeave);
        map.addEventListener('focusin', onFocus);
        map.addEventListener('focusout', onBlur);
        map.addEventListener('click', onClick);
        return () => {
            cancelAnimationFrame(frame);
            unsubscribe();
            map.removeEventListener('pointerover', onOver);
            map.removeEventListener('pointerleave', onLeave);
            map.removeEventListener('focusin', onFocus);
            map.removeEventListener('focusout', onBlur);
            map.removeEventListener('click', onClick);
        };
    }, [mapId, readoutId, router]);

    return null;
}
