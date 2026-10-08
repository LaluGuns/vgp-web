import type { FigureSpec } from '@/lib/blog/types';
import { Arrangement, Bars, Curve, Scale } from './charts';
import { Flow, Notes, Rhythm, Stereo } from './diagrams';
import { Signal, Spectrum, Transfer } from './waves';

function draw(spec: FigureSpec, w: number) {
    switch (spec.type) {
        case 'curve':
            return <Curve spec={spec} w={w} />;
        case 'bars':
            return <Bars spec={spec} w={w} />;
        case 'rhythm':
            return <Rhythm spec={spec} w={w} />;
        case 'signal':
            return <Signal spec={spec} w={w} />;
        case 'spectrum':
            return <Spectrum spec={spec} w={w} />;
        case 'transfer':
            return <Transfer spec={spec} w={w} />;
        case 'stereo':
            return <Stereo spec={spec} w={w} />;
        case 'flow':
            return <Flow spec={spec} w={w} />;
        case 'arrangement':
            return <Arrangement spec={spec} w={w} />;
        case 'scale':
            return <Scale spec={spec} w={w} />;
        case 'notes':
            return <Notes spec={spec} w={w} />;
    }
}

/**
 * A diagram drawn twice: a narrow layout for phones and a wide one for
 * larger screens, so labels stay readable at both sizes instead of
 * shrinking with the drawing.
 */
export function Figure({ spec, number }: { spec: FigureSpec; number: number }) {
    return (
        <figure className="my-10">
            <div className="rounded-[6px] border border-white/10 bg-[var(--surface)] px-3 py-4 sm:px-5 sm:py-5">
                <div className="sm:hidden">{draw(spec, 320)}</div>
                <div className="hidden sm:block">{draw(spec, 600)}</div>
            </div>
            <figcaption className="mt-3 text-sm leading-6 text-white/60">
                <span className="font-medium text-white/80">Figure {number}.</span> {spec.caption}
            </figcaption>
        </figure>
    );
}
