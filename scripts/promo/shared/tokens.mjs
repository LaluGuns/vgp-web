// Brand tokens for promo renders, from docs/DESIGN.md. Plain JS so both the
// carousel (TypeScript, via tsx) and the film renderer (Node) can use it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const REPO = path.resolve(ROOT, '../..');
export const LOGO = path.join(REPO, 'public/branding/logo-tg.png');

export const T = {
    bg: '#050607',
    surface: '#0a0e12',
    line: 'rgba(255,255,255,0.10)',
    text: '#ffffff',
    text75: 'rgba(255,255,255,0.75)',
    text60: 'rgba(255,255,255,0.60)',
    text50: 'rgba(255,255,255,0.50)',
    faint: 'rgba(255,255,255,0.30)',
    accent: '#7dd3fc',
    accentFill: 'rgba(125,211,252,0.12)',
    display: "'VGP Inter Display', 'VGP Inter', sans-serif",
    body: "'VGP Inter', sans-serif",
};

const FACES = [
    ['Inter', 'Inter-Regular.woff2', 400],
    ['Inter', 'Inter-Medium.woff2', 500],
    ['Inter', 'Inter-SemiBold.woff2', 600],
    ['Inter Display', 'InterDisplay-Medium.woff2', 500],
    ['Inter Display', 'InterDisplay-SemiBold.woff2', 600],
    ['Inter Display', 'InterDisplay-ExtraBold.woff2', 800],
];

/**
 * Bundled Inter (OFL), embedded as data URLs: pages built with setContent
 * cannot fetch file:// URLs, and an installed Inter would hide that.
 * Family names are prefixed so a system copy can never stand in.
 */
export const FONTS_CSS = FACES.map(
    ([family, file, weight]) =>
        `@font-face{font-family:'VGP ${family}';src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'fonts', file)).toString('base64')}) format('woff2');font-weight:${weight};font-style:normal;font-display:block}`,
).join('\n');

/** The figures read `--font-display`; point it at the bundled face. */
export const BASE_CSS = `${FONTS_CSS}
:root{--font-display:${T.display};--surface:${T.surface};--accent:${T.accent}}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:${T.bg};color:${T.text};font-family:${T.body};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}`;
