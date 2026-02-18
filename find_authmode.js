const fs = require('fs');
const path = 'node_modules/@_davideast/stitch-mcp/dist/cli.js';
const searchString = 'authMode:'; // Searching for property assignment in object

const buffer = fs.readFileSync(path);
let index = buffer.indexOf(searchString);

while (index !== -1) {
    console.log(`Found "authMode:" at index: ${index}`);
    const start = Math.max(0, index - 100);
    const end = Math.min(buffer.length, index + 300);
    console.log(buffer.slice(start, end).toString());
    console.log('-----------------------------------');
    index = buffer.indexOf(searchString, index + 1);
    if (index > 5000000 && index < 5400000) break; // Optimization to focus on relevant area if possible, but let's just show first few
    if (index > -1) {
        // Just show first 5 occurrences to avoid spam
        // Actually, let's just show a few.
    }
}
