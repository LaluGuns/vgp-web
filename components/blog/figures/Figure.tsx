import type { FigureSpec } from '@/lib/blog/types';
import { resolveDialect, type Dialect } from '@/lib/blog/dialects';
import { Arrangement, Bars, Curve, Scale } from './charts';
import { Flow, Notes, Rhythm, Stereo } from './diagrams';
import { Signal, Spectrum, Transfer } from './waves';
import { NARROW_W } from './svg';

function draw(spec: FigureSpec, w: number, dialect: Dialect) {
    switch (spec.type) {
        case 'curve':
            return <Curve spec={spec} w={w} dialect={dialect} />;
        case 'bars':
            return <Bars spec={spec} w={w} dialect={dialect} />;
        case 'rhythm':
            return <Rhythm spec={spec} w={w} dialect={dialect} />;
        case 'signal':
            return <Signal spec={spec} w={w} dialect={dialect} />;
        case 'spectrum':
            return <Spectrum spec={spec} w={w} dialect={dialect} />;
        case 'transfer':
            return <Transfer spec={spec} w={w} dialect={dialect} />;
        case 'stereo':
            return <Stereo spec={spec} w={w} dialect={dialect} />;
        case 'flow':
            return <Flow spec={spec} w={w} dialect={dialect} />;
        case 'arrangement':
            return <Arrangement spec={spec} w={w} dialect={dialect} />;
        case 'scale':
            return <Scale spec={spec} w={w} dialect={dialect} />;
        case 'notes':
            return <Notes spec={spec} w={w} dialect={dialect} />;
    }
}

/**
 * A diagram drawn twice: a narrow layout for phones and a wide one for
 * larger screens, so labels stay readable at both sizes instead of
 * shrinking with the drawing. The narrow one is drawn 280 wide, a little
 * wider than the box it gets on a 320 px phone, so its 12-unit labels
 * render at 11 px or more there. `dialect` is the lesson group's figure
 * language (lib/blog/dialects.ts); without one it is technical.
 *
 * `data-reveal="draw"`: when the figure scrolls into view, its accent data
 * draws in once (see `draw` in ./svg). Remove the attribute to turn that off.
 */
export function Figure({ spec, number, dialect }: { spec: FigureSpec; number: number; dialect?: Dialect | string }) {
    const d = resolveDialect(dialect);
    return (
        <figure className="my-10">
            <div data-reveal="draw" data-dialect={d.name} className="rounded-[6px] border border-white/10 bg-[var(--surface)] px-3 py-4 sm:px-5 sm:py-5">
                <div className="sm:hidden">{draw(spec, NARROW_W, d)}</div>
                <div className="hidden sm:block">{draw(spec, 600, d)}</div>
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-white/60">
                <span className="font-medium text-white/80">Figure {number}.</span> {spec.caption}
            </figcaption>
        </figure>
    );
}
