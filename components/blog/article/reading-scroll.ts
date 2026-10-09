/**
 * One passive scroll listener for everything on a lesson page that follows
 * the reader: the progress bar, the side outline, the Contents button and
 * the "read" mark. Each subscriber gets the scroll position once per frame.
 *
 * Element positions are measured in document coordinates and cached, so a
 * scroll frame reads no layout. The cache is dropped when the page resizes
 * or its height changes (a demo loading, a font arriving).
 */

export interface ReadingFrame {
    /** window.scrollY */
    y: number;
    /** Viewport height. */
    vh: number;
    /** Largest scrollY. */
    max: number;
    /** Document y of an element's top, by id; undefined when it is not on the page. */
    top: (id: string) => number | undefined;
    /** Document y of an element's bottom, by id. */
    bottom: (id: string) => number | undefined;
}

type Listener = (frame: ReadingFrame) => void;

const listeners = new Set<Listener>();
const boxes = new Map<string, { top: number; bottom: number } | null>();
let frame = 0;
let max = 0;
let dirty = true;
let observer: ResizeObserver | null = null;

function box(id: string) {
    if (!boxes.has(id)) {
        const el = document.getElementById(id);
        if (!el) {
            boxes.set(id, null);
        } else {
            const rect = el.getBoundingClientRect();
            boxes.set(id, { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY });
        }
    }
    return boxes.get(id) ?? undefined;
}

const reading: ReadingFrame = {
    y: 0,
    vh: 0,
    max: 0,
    top: (id) => box(id)?.top,
    bottom: (id) => box(id)?.bottom,
};

function run() {
    frame = 0;
    if (dirty) {
        dirty = false;
        boxes.clear();
        max = document.documentElement.scrollHeight - window.innerHeight;
    }
    reading.y = window.scrollY;
    reading.vh = window.innerHeight;
    reading.max = max;
    listeners.forEach((listener) => listener(reading));
}

function schedule() {
    if (!frame) frame = requestAnimationFrame(run);
}

function invalidate() {
    dirty = true;
    schedule();
}

/** Call `listener` on every scroll frame (and once now). Returns the unsubscribe. */
export function subscribeReading(listener: Listener): () => void {
    listeners.add(listener);
    if (listeners.size === 1) {
        dirty = true;
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', invalidate, { passive: true });
        observer = new ResizeObserver(invalidate);
        observer.observe(document.body);
    }
    schedule();
    return () => {
        listeners.delete(listener);
        if (listeners.size > 0) return;
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', invalidate);
        observer?.disconnect();
        observer = null;
        cancelAnimationFrame(frame);
        frame = 0;
    };
}

/** The id of the section the reader is in: the last heading whose top has passed 140 px. */
export function currentSection(frame: ReadingFrame, ids: string[]): string {
    let current = '';
    for (const id of ids) {
        const top = frame.top(id);
        if (top !== undefined && top - frame.y <= 140) current = id;
    }
    return current;
}

/** The current frame, measured now, for one-off reads (opening the Contents sheet). */
export function readNow(): ReadingFrame {
    if (dirty || listeners.size === 0) {
        dirty = false;
        boxes.clear();
        max = document.documentElement.scrollHeight - window.innerHeight;
    }
    reading.y = window.scrollY;
    reading.vh = window.innerHeight;
    reading.max = max;
    return reading;
}
