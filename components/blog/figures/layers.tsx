/**
 * Splits a drawn figure into stacked SVG layers so its draw-in repaints little.
 *
 * A draw-in animates stroke offsets, scales and opacities of a few marks, and
 * the browser repaints the whole SVG for every frame of it: the grid, the
 * labels and the grey context with it. Here every run of marks that never
 * animates (rules, labels, grey data) goes in a layer of its own that is
 * painted once, and the animated marks, with whatever is drawn right after
 * them, go in the layers above. Layers are SVGs with the same viewBox stacked
 * in one grid cell in paint order, so the picture is the same pixel for pixel:
 * every mark keeps its place in the paint order and its chain of parent
 * groups (transforms, clip paths), and anything that cannot be split safely
 * (a group with its own opacity, mask or filter) leaves the figure whole.
 *
 * Run after `compactFigure`, on the page only: the figure components still
 * draw one complete SVG, which is what the offline renderer and print use.
 * The first layer is the figure (role img, named); the others are hidden from
 * assistive technology. Ids that a mark refers to (clip paths, gradients) sit
 * in the first layer that draws them and are found by id across the layers.
 */

import { cloneElement, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

type El = ReactElement<Record<string, unknown>>;

interface Item {
    /** Ancestors below the root, outermost first. */
    chain: El[];
    node: El;
    anim: boolean;
}

/** A run of static marks shorter than this, between animated ones, is painted with them. */
const MIN_STATIC = 10;
/** A figure with less static drawing than this is left whole: there is nothing worth keeping out of the repaint. */
const MIN_TOTAL_STATIC = 24;

const DRAW = /(?:^|\s)vgp-draw-/;
const isDraw = (el: El) => typeof el.props.className === 'string' && DRAW.test(el.props.className);

/** Containers that are drawn or referenced as one piece, never split. */
const ATOMIC = new Set(['defs', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'pattern', 'style', 'title', 'desc']);

/** A group with one of these cannot have its children painted in different layers. */
const GROUP_EFFECTS = ['opacity', 'mask', 'filter', 'mixBlendMode', 'isolation'];

const childrenOf = (el: El): ReactNode[] => {
    const out: ReactNode[] = [];
    const walk = (node: ReactNode) => {
        if (Array.isArray(node)) node.forEach(walk);
        else if (node !== null && node !== undefined && typeof node !== 'boolean') out.push(node);
    };
    walk(el.props.children as ReactNode);
    return out;
};

/** The marks of a figure in paint order, or null when it cannot be split. */
function collect(root: El): Item[] | null {
    const items: Item[] = [];
    let ok = true;
    const visit = (el: El, chain: El[]) => {
        if (!ok) return;
        if (isDraw(el)) {
            items.push({ chain, node: el, anim: true });
            return;
        }
        const kids = childrenOf(el);
        const elementKids = kids.filter(isValidElement) as El[];
        if (ATOMIC.has(el.type as string) || elementKids.length === 0) {
            // A leaf, or a piece that is never split. Animated marks inside it would be lost to the static layer.
            if (ATOMIC.has(el.type as string) && JSON.stringify(el.props).includes('vgp-draw-')) ok = false;
            items.push({ chain, node: el, anim: false });
            return;
        }
        // Text between elements of a group has no place in a layer.
        if (kids.some((kid) => !isValidElement(kid) && String(kid).trim() !== '')) {
            ok = false;
            return;
        }
        if (GROUP_EFFECTS.some((name) => el.props[name] !== undefined) || (typeof el.props.style === 'object' && el.props.style !== null && GROUP_EFFECTS.some((name) => name in (el.props.style as object)))) {
            ok = false;
            return;
        }
        for (const kid of elementKids) visit(kid, [...chain, el]);
    };
    for (const kid of childrenOf(root)) {
        if (!isValidElement(kid)) {
            if (String(kid).trim() !== '') return null;
            continue;
        }
        visit(kid as El, []);
    }
    return ok ? items : null;
}

/** Rebuilds the parent groups of a run of consecutive items, sharing a group between neighbours that had it in common. */
function build(items: Item[], depth: number, key: { n: number }): ReactNode[] {
    const out: ReactNode[] = [];
    for (let i = 0; i < items.length; ) {
        const item = items[i];
        if (item.chain.length === depth) {
            out.push(cloneElement(item.node, { key: key.n++ }));
            i++;
            continue;
        }
        const group = item.chain[depth];
        let j = i;
        while (j < items.length && items[j].chain.length > depth && items[j].chain[depth] === group) j++;
        const at = key.n++;
        out.push(cloneElement(group, { key: at }, build(items.slice(i, j), depth + 1, key)));
        i = j;
    }
    return out;
}

/** Layers as runs of items: each static run that is long enough on its own, the animated marks and short static runs together. */
function planLayers(items: Item[]): { anim: boolean; items: Item[] }[] | null {
    const runs: { anim: boolean; items: Item[] }[] = [];
    for (const item of items) {
        const last = runs[runs.length - 1];
        if (last && last.anim === item.anim) last.items.push(item);
        else runs.push({ anim: item.anim, items: [item] });
    }
    if (!runs.some((run) => run.anim)) return null;
    // A short static run is painted with the animated marks beside it.
    const kept = runs.map((run) => ({ ...run, anim: run.anim || run.items.length < MIN_STATIC }));
    const merged: { anim: boolean; items: Item[] }[] = [];
    for (const run of kept) {
        const last = merged[merged.length - 1];
        if (last && last.anim === run.anim) last.items = last.items.concat(run.items);
        else merged.push({ anim: run.anim, items: run.items.slice() });
    }
    const staticItems = merged.filter((run) => !run.anim).reduce((sum, run) => sum + run.items.length, 0);
    return staticItems >= MIN_TOTAL_STATIC && merged.length > 1 ? merged : null;
}

export function layeredFigure(node: ReactNode): ReactNode {
    if (!isValidElement(node) || (node as El).type !== 'svg') return node;
    const root = node as El;
    const items = collect(root);
    const plan = items && planLayers(items);
    if (!plan) return node;
    const rest = { ...root.props };
    delete rest.children;
    const layerClass = `${rest.className ?? ''} vgp-fig-layer`.trim();
    const key = { n: 0 };
    return createElement(
        'div',
        { className: 'vgp-fig-stack' },
        plan.map((layer, i) =>
            createElement(
                'svg',
                // The first layer is the figure; the rest repeat its viewBox and are hidden from assistive technology.
                i === 0 ? { ...rest, className: layerClass, key: i } : { ...rest, className: layerClass, role: undefined, 'aria-label': undefined, 'aria-hidden': true, key: i },
                build(layer.items, 0, key),
            ),
        ),
    );
}
