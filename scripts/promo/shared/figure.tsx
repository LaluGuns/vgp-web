// The site's own figure renderers, drawn to static SVG at a chosen width.
import { renderToStaticMarkup } from 'react-dom/server';
import type { FigureSpec } from '@/lib/blog/types';
import { Arrangement, Bars, Curve, Scale } from '@/components/blog/figures/charts';
import { Flow, Notes, Rhythm, Stereo } from '@/components/blog/figures/diagrams';
import { Signal, Spectrum, Transfer } from '@/components/blog/figures/waves';

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
 * SVG markup for a figure. `w` is the drawing's own coordinate width: the
 * site uses 320 (phone) and 600 (desktop). The SVG scales to its box, so a
 * 600-wide drawing shown 920 px wide keeps the desktop proportions with
 * labels 1.5x larger.
 */
export function figureSvg(spec: FigureSpec, w = 600): string {
    return renderToStaticMarkup(draw(spec, w));
}
