const fs = require('fs');
const path = require('path');

function walk(dir) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        const full = path.join(dir, entry);
        if (entry === 'node_modules' || entry === '.next') continue;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            walk(full);
        } else if (full.endsWith('.tsx')) {
            let content = fs.readFileSync(full, 'utf8');
            if (content.includes('glow="subtle"')) {
                content = content.replace(/glow="subtle"/g, 'glow="cyan"');
                fs.writeFileSync(full, content);
                console.log('Fixed:', full);
            }
        }
    }
}

walk('.');
