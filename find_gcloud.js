const fs = require('fs');
const path = 'node_modules/@_davideast/stitch-mcp/dist/cli.js';
const searchString = 'Checking Google Cloud CLI';

const buffer = fs.readFileSync(path);
const index = buffer.indexOf(searchString);

if (index === -1) {
    console.log('String not found');
} else {
    console.log(`Found at index: ${index}`);
    // Print 500 characters before and after
    const start = Math.max(0, index - 500);
    const end = Math.min(buffer.length, index + 500);
    console.log(buffer.slice(start, end).toString());
}
