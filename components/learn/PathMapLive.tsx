'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readArticles, subscribeRead } from '@/components/blog/article/reading-state';

/** Room kept between the readout and a mark that takes keyboard focus or a first tap. */
const FOCUS_GAP = 8;

/**
 * The live layer of the path map (PathMap renders everything on the
 * server). After hydration it fills the marks of the lessons read on this
 * device, says so in their names and in each path's count, and turns the
 * readout above the map into the lesson under the pointer, the keyboard
 * focus or a first tap. It only sets attributes and text on the server's
 * markup, in boxes that already have their size, so nothing moves; React
 * never re-renders the map.
 *
 * A finger has no hover, so on a touch screen the first tap on a mark
 * chooses it: the readout shows its title and becomes one "Open lesson"
 * link, and a second tap on the mark (or anywhere on the readout) opens
 * it. A mouse click, a key and a screen reader's activation open the
 * lesson at once, as before.
 *
 * The readout stays under the site header while the map scrolls beneath
 * it (on a touch screen under 1024 px it is a card over the tab bar that
 * shows the chosen mark), so a mark the Tab key reaches, or a tap chooses
 * low on the screen, is brought out from under it.
 *
 * The map's links are plain anchors (one per lesson and path), so this also
 * gives them what next/link would: a plain click goes through the app router
 * (no full page load), and a lesson is prefetched when the pointer or the
 * focus reaches it. A click with a modifier key, or with no script, is an
 * ordinary link.
 */
export function PathMapLive({ mapId, readoutId, announceId, hintId }: { mapId: string; readoutId: string; announceId?: string; hintId?: string }) {
    const router = useRouter();

    useEffect(() => {
        const map = document.getElementById(mapId);
        const readout = document.getElementById(readoutId);
        const announce = announceId ? document.getElementById(announceId) : null;
        const tapHint = hintId ? document.getElementById(hintId) : null;
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
                const pathLink = count.closest<HTMLElement>('a[data-map-path]');
                pathLink?.setAttribute('aria-label', `${pathLink.dataset.mapPath}, ${count.textContent}`);
            }
        };

        // The readout: the path, the lesson's place in it and its reading time, then its title, and
        // for a mark chosen by a tap, the whole readout becomes the link that opens it. With nothing
        // to show it gives its hint.
        const line = readout?.querySelector<HTMLElement>('[data-line]');
        const title = readout?.querySelector<HTMLElement>('[data-title]');
        const open = readout?.querySelector<HTMLAnchorElement>('a[data-open]');
        const openLabel = readout?.querySelector<HTMLElement>('[data-open-label]');
        const hint = line ? Array.from(line.childNodes) : [];
        const titleOf = (link: HTMLAnchorElement) => (names.get(link) ?? '').replace(/^Lesson \d+: /, '');
        let shown: HTMLAnchorElement | null = null;
        let chosen: HTMLAnchorElement | null = null;
        let shownChosen = false;
        const show = (link: HTMLAnchorElement | null) => {
            if (!line || !title) return;
            // Pointer and focus show their lesson; once they leave, the readout goes back to the tapped one.
            const next = link ?? chosen;
            const isChosen = next !== null && next === chosen;
            if (next === shown && isChosen === shownChosen) return;
            shown = next;
            shownChosen = isChosen;
            if (open) {
                if (next && isChosen) open.href = next.getAttribute('href') ?? '/blog';
                else open.removeAttribute('href');
            }
            if (openLabel) openLabel.hidden = !isChosen;
            if (!next) {
                line.replaceChildren(...hint);
                title.textContent = '';
                readout?.removeAttribute('data-active');
                return;
            }
            const track = next.closest('ol');
            const place = `${next.dataset.n} of ${track?.childElementCount ?? 0} · ${next.dataset.min} min${next.hasAttribute('data-read') ? ' · read' : ''}`;
            // A chosen mark's line leaves room for "Open lesson" ("22 of 44 · 10 min · read" fits beside it at 320 px);
            // the map names its path right above its line.
            line.textContent = isChosen ? place : `${track?.dataset.name ?? ''} · lesson ${place}`;
            title.textContent = titleOf(next);
            readout?.setAttribute('data-active', '');
        };
        // The readout where it comes to rest: the card rises 8 px into place as it shows.
        const readoutBox = () => {
            if (!readout) return null;
            const { top, bottom, left, right } = readout.getBoundingClientRect();
            const rise = new DOMMatrixReadOnly(getComputedStyle(readout).transform).m42;
            return { top: top - rise, bottom: bottom - rise, left, right, card: getComputedStyle(readout).position === 'fixed' };
        };
        // A mark the readout would cover is brought out from under it: below it while it is held under
        // the header, above it while it is the card over the tab bar (a touch screen; on a wide one the
        // card is narrower than the map, so a mark beside it stays where it is).
        const clearOfReadout = (target: HTMLElement) => {
            const box = readoutBox();
            if (!box) return;
            const { top, bottom, left, right } = target.getBoundingClientRect();
            if (box.card) {
                if (right <= box.left || left >= box.right) return;
                const clear = box.top - FOCUS_GAP;
                if (bottom > clear) window.scrollBy({ top: bottom - clear, behavior: 'instant' });
                return;
            }
            const clear = box.bottom + FOCUS_GAP;
            if (top < clear) window.scrollBy({ top: top - clear, behavior: 'instant' });
        };
        const choose = (link: HTMLAnchorElement | null) => {
            chosen?.removeAttribute('data-chosen');
            chosen = link;
            link?.setAttribute('data-chosen', '');
            show(link);
            if (!link) return;
            // A mark just tapped is on screen even where the map's top is still below the band the observer watches
            // (the first path near the bottom of a phone held sideways), so the card shows.
            readout?.removeAttribute('data-out');
            // The card shows over the lower part of the screen: a mark chosen there moves up clear of it, and a
            // second tap in the same place then lands on the card, which opens the same lesson.
            if (readoutBox()?.card) clearOfReadout(link);
            // The mark's own name, which the reader just heard, already gives the lesson and its title.
            if (announce) announce.textContent = `${link.closest('ol')?.dataset.name ?? ''}. Tap again to open.`;
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

        // Which kind of pointer pressed which lesson last, so the click that follows knows a tap from a
        // mouse click. A key or a screen reader clicks with no press before it (and event.detail 0).
        let press: { link: HTMLAnchorElement | null; type: string; at: number } | null = null;
        const onDown = (event: PointerEvent) => {
            press = { link: lessonAt(event.target), type: event.pointerType, at: event.timeStamp };
        };
        // A tap anywhere else lets go of the chosen mark (and on a phone, puts the card away).
        const onDownElsewhere = (event: PointerEvent) => {
            const target = event.target instanceof Node ? event.target : null;
            if (chosen && target && !map.contains(target) && !readout?.contains(target)) choose(null);
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
            const lesson = lessonAt(event.target);
            // A tap focuses the mark too; the click that follows decides what the readout shows.
            if (!(press && press.type !== 'mouse' && press.link === lesson && event.timeStamp - press.at < 1000)) show(lesson);
            prefetch(pageLinkAt(event.target));
            // Only for the Tab key: a tap focuses the mark too, and choosing it moves it if it needs to.
            if (event.target instanceof HTMLElement && event.target.matches(':focus-visible')) clearOfReadout(event.target);
        };
        const onBlur = (event: FocusEvent) => {
            if (!lessonAt(event.relatedTarget)) show(null);
        };
        const onClick = (event: MouseEvent) => {
            const tap = press;
            press = null;
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = pageLinkAt(event.target);
            const href = link?.getAttribute('href');
            if (!link || !href) return;
            event.preventDefault();
            const lesson = lessonAt(link);
            const tapped = tap !== null && tap.type !== 'mouse' && tap.link === lesson && event.detail > 0 && event.timeStamp - tap.at < 1000;
            if (lesson && tapped && lesson !== chosen) {
                choose(lesson);
                prefetch(lesson);
                return;
            }
            router.push(href);
        };
        const onOpen = (event: MouseEvent) => {
            const href = open?.getAttribute('href');
            if (!href || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            router.push(href);
        };

        // The hairline under the readout shows only while it is held under the header.
        let stuck = false;
        let holdAt = 0;
        const measure = () => {
            holdAt = readout ? parseFloat(getComputedStyle(readout).top) || 0 : 0;
        };
        const onScroll = () => {
            if (!readout) return;
            const next = readout.getBoundingClientRect().top <= holdAt + 0.5 && map.getBoundingClientRect().top < holdAt + readout.offsetHeight;
            if (next === stuck) return;
            stuck = next;
            readout.toggleAttribute('data-stuck', next);
        };
        const onResize = () => {
            measure();
            onScroll();
        };
        // The card over the tab bar is put away while the map is off screen: no part of it between the
        // header and the card itself.
        const onScreen = new IntersectionObserver(([entry]) => readout?.toggleAttribute('data-out', !entry.isIntersecting), {
            rootMargin: '-72px 0px -150px 0px',
        });
        onScreen.observe(map);

        readout?.setAttribute('data-live', '');
        tapHint?.setAttribute('data-live', '');
        const frame = requestAnimationFrame(() => {
            paint();
            onResize();
        });
        const unsubscribe = subscribeRead(paint);
        map.addEventListener('pointerdown', onDown);
        map.addEventListener('pointerover', onOver);
        map.addEventListener('pointerleave', onLeave);
        map.addEventListener('focusin', onFocus);
        map.addEventListener('focusout', onBlur);
        map.addEventListener('click', onClick);
        open?.addEventListener('click', onOpen);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        document.addEventListener('pointerdown', onDownElsewhere, true);
        return () => {
            cancelAnimationFrame(frame);
            unsubscribe();
            map.removeEventListener('pointerdown', onDown);
            map.removeEventListener('pointerover', onOver);
            map.removeEventListener('pointerleave', onLeave);
            map.removeEventListener('focusin', onFocus);
            map.removeEventListener('focusout', onBlur);
            map.removeEventListener('click', onClick);
            open?.removeEventListener('click', onOpen);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('pointerdown', onDownElsewhere, true);
            onScreen.disconnect();
        };
    }, [mapId, readoutId, announceId, hintId, router]);

    return null;
}
