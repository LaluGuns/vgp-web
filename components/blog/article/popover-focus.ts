/**
 * Popovers on a lesson (the Contents sheet, a glossary definition) close
 * when keyboard focus leaves them, so Tab never walks the page underneath
 * an open sheet (WCAG 2.4.11). A tap or click elsewhere is left to the
 * popover's own light dismiss, and clicking a popover's own button still
 * toggles it.
 */

let keyboard = false;
let tracking = false;

/** Follows whether the last input was a key rather than a pointer. */
function trackInput() {
    if (tracking) return;
    tracking = true;
    document.addEventListener(
        'keydown',
        () => {
            keyboard = true;
        },
        true,
    );
    document.addEventListener(
        'pointerdown',
        () => {
            keyboard = false;
        },
        true,
    );
}

/** Browsers without popovers have no `:popover-open`, and matching it would throw. */
const supportsPopover = () => 'popover' in HTMLElement.prototype;

function watch(find: () => { pop: HTMLElement; opener?: Element | null } | null): () => void {
    if (!supportsPopover()) return () => {};
    trackInput();
    const leave = (event: FocusEvent) => {
        if (!keyboard || !event.relatedTarget) return;
        const open = find();
        if (!open) return;
        const { pop, opener } = open;
        const inside = (node: EventTarget | null) => node instanceof Node && (pop.contains(node) || node === opener);
        if (inside(event.target) && !inside(event.relatedTarget)) pop.hidePopover();
    };
    document.addEventListener('focusout', leave, true);
    return () => document.removeEventListener('focusout', leave, true);
}

/**
 * Hides `pop` when a keyboard move takes focus from inside it to anywhere
 * outside, its own button included (the Contents sheet covers that button).
 * Returns a cleanup function.
 */
export function closeWhenFocusLeaves(pop: HTMLElement): () => void {
    return watch(() => (pop.matches(':popover-open') ? { pop } : null));
}

/**
 * The same for whichever popover matching `selector` is open (the glossary
 * definitions, rendered as markup). The word that opened it counts as
 * inside: Shift+Tab back to the word keeps its definition open.
 */
export function closeOpenWhenFocusLeaves(selector: string): () => void {
    return watch(() => {
        const pop = document.querySelector<HTMLElement>(`${selector}:popover-open`);
        if (!pop) return null;
        return { pop, opener: document.querySelector(`[popovertarget="${pop.id}"]:not([popovertargetaction])`) };
    });
}
