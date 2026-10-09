/**
 * Trims a drawn figure before it is sent. A figure is drawn on the server
 * twice (phone and wide layouts) and goes out twice more, as HTML and in
 * the page's RSC payload, so its markup is a large share of a lesson's
 * bytes. This pass changes nothing that is drawn:
 *
 * - The figure's components are plain functions with no hooks, so they are
 *   called here and only SVG elements remain.
 * - Numbers keep the precision a drawing can show: one decimal from 10
 *   up, two below 10, three below 1 (opacities, gradient stops), in
 *   attributes and inside path data, points and transforms (the viewBox is
 *   left exact, so the figure keeps its size). Text is never
 *   touched.
 * - Props left undefined are dropped (the payload would carry each one).
 * - An inherited presentation attribute (fill, stroke, widths, ends, text
 *   anchor and size) is dropped where it repeats what the element already
 *   inherits, or the SVG default when nothing above sets it.
 *
 * Keys and the shape of every children list are kept, so React sees the
 * same tree.
 */

import { Fragment, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

const round = (v: number) => {
    const a = Math.abs(v);
    const k = a >= 10 ? 10 : a >= 1 ? 100 : 1000;
    const r = Math.round(v * k) / k;
    return r === 0 ? 0 : r;
};

const NUMBER = /-?(?:\d+\.\d+|\.\d+)(?:e-?\d+)?/g;
const roundIn = (s: string) => s.replace(NUMBER, (m) => String(round(Number(m))));

/** Attributes whose numbers are geometry. */
const GEOMETRY = new Set(['d', 'points', 'transform']);

/** Inherited presentation attributes, with their SVG initial values. */
const INHERITED: Record<string, string | number> = {
    fill: 'black',
    stroke: 'none',
    strokeWidth: 1,
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeDasharray: 'none',
    fillOpacity: 1,
    strokeOpacity: 1,
    textAnchor: 'start',
    fontStyle: 'normal',
    fontSize: 'medium',
};

type Inherited = Record<string, string | number>;

function compactStyle(style: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(style)) if (v !== undefined && v !== null) out[k] = v;
    return Object.keys(out).length ? out : undefined;
}

type Store = { _store?: { validated?: number } };

/** `slot`: the element that held this place in its parent's children, when a component was called to draw it. */
function compactNode(node: ReactNode, inherited: Inherited, slot: ReactElement | null = null): ReactNode {
    if (Array.isArray(node)) {
        // Empty slots (a condition that drew nothing) are dropped; keyed elements keep their keys.
        return node.filter((child) => child !== null && child !== undefined && typeof child !== 'boolean').map((child) => compactNode(child, inherited));
    }
    if (!isValidElement(node)) return node;
    const element = node as ReactElement<Record<string, unknown>>;
    const { type } = element;
    if (type === Fragment) return compactNode(element.props.children as ReactNode, inherited);
    // A component's place in its parent (its key, and whether React checked it) passes to the element it draws.
    if (typeof type === 'function') return compactNode((type as (props: unknown) => ReactNode)(element.props), inherited, slot ?? element);
    if (typeof type !== 'string') return node;

    const props: Record<string, unknown> = {};
    const own: Inherited = { ...inherited };
    for (const [name, raw] of Object.entries(element.props)) {
        if (name === 'children' || raw === undefined || raw === null) continue;
        let value: unknown = raw;
        if (typeof value === 'number') value = round(value);
        else if (typeof value === 'string' && GEOMETRY.has(name)) value = roundIn(value);
        else if (name === 'style' && typeof value === 'object') {
            value = compactStyle(value as Record<string, unknown>);
            if (value === undefined) continue;
        }
        if (name in INHERITED) {
            if (String(value) === String(inherited[name])) continue;
            own[name] = value as string | number;
        }
        props[name] = value;
    }
    const children = element.props.children;
    if (children !== undefined && children !== null) props.children = compactNode(children as ReactNode, own);
    // Children go in as a prop, as JSX passes them, so React checks their keys exactly as it did before.
    const place = slot ?? element;
    const key = place.key ?? element.key;
    if (key !== null) props.key = key;
    const created = createElement(type, props);
    // Dev builds track whether an element in a child list was checked for a key; keep the answer of the element that
    // held this place, so React warns exactly where it did before (nowhere).
    const from = (place as unknown as Store)._store;
    const to = (created as unknown as Store)._store;
    if (from && to) to.validated = from.validated;
    return created;
}

/** The figure as plain SVG elements, with nothing in it that the drawing does not need. */
export function compactFigure(node: ReactNode): ReactNode {
    return compactNode(node, INHERITED);
}
