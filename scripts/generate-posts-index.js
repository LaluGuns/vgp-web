const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../lib/blog-posts');
const indexFile = path.join(postsDir, 'index.ts');

if (!fs.existsSync(postsDir)) {
    console.error('Directory does not exist:', postsDir);
    process.exit(1);
}

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

// Sort files numerically by prefix ID
files.sort((a, b) => {
    const idA = parseInt(a.match(/^(\d+)-/)[1], 10);
    const idB = parseInt(b.match(/^(\d+)-/)[1], 10);
    return idA - idB;
});

let imports = [];
let exportsList = [];

files.forEach(file => {
    const idMatch = file.match(/^(\d+)-/);
    if (!idMatch) return;
    const id = idMatch[1];
    const exportName = `post${id}`;
    const importPath = `./${file.replace('.ts', '')}`;
    
    imports.push(`import { ${exportName} } from '${importPath}';`);
    exportsList.push(exportName);
});

const fileContent = `/**
 * AUTO-GENERATED BLOG POSTS INDEX
 * DO NOT EDIT DIRECTLY. Run scripts/generate-posts-index.js to update.
 */

import { BlogArticle } from '../blog-data';

${imports.join('\n')}

export const newArticles: BlogArticle[] = [
    ${exportsList.join(',\n    ')}
];
`;

fs.writeFileSync(indexFile, fileContent, 'utf8');
console.log(`Successfully generated index.ts with ${exportsList.length} articles.`);
