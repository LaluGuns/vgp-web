import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const requiredFiles = [
    'lib/ai-discovery/catalog.ts',
    'components/seo/JsonLd.tsx',
    'app/products/page.tsx',
    'app/products/catalog.json/route.ts',
    'app/products/music/page.tsx',
    'app/products/music.json/route.ts',
    'app/products/beats.json/route.ts',
    'app/products/hear-the-difference/page.tsx',
    'app/llms.txt/route.ts',
];

for (const file of requiredFiles) {
    if (!exists(file)) {
        throw new Error(`AI discovery contract missing required file: ${file}`);
    }
}

const catalog = read('lib/ai-discovery/catalog.ts');
const sitemap = read('app/sitemap.ts');

const requiredProductIds = [
    'released-music',
    'studio-beats',
    'flow',
    'cadenz',
    'trap-production-guide',
    'producer-masterclass',
    'healingwave',
    'hear-the-difference',
];

for (const id of requiredProductIds) {
    if (!catalog.includes(`id: '${id}'`)) {
        throw new Error(`AI discovery catalog missing product id: ${id}`);
    }
}

for (const route of ['/products', '/products/music', '/products/hear-the-difference']) {
    if (!sitemap.includes(`'${route}'`)) {
        throw new Error(`Sitemap missing canonical AI discovery route: ${route}`);
    }
}

const schemaPages = [
    'app/flow/page.tsx',
    'app/cadenz/page.tsx',
    'app/book/page.tsx',
    'app/studio/masterclass/page.tsx',
    'app/lab/healingwave/page.tsx',
    'app/products/music/page.tsx',
    'app/products/hear-the-difference/page.tsx',
    'app/studio/beats/[slug]/page.tsx',
    'app/ja-JP/studio/beats/[slug]/page.tsx',
    'app/de-DE/studio/beats/[slug]/page.tsx',
];

for (const file of schemaPages) {
    const source = read(file);
    if (!source.includes('JsonLd')) {
        throw new Error(`Page-level structured data is not using CSP-safe JsonLd: ${file}`);
    }
}

console.log('AI discovery contract: PASS');
