const fs = require('fs');
const path = 'node_modules/@_davideast/stitch-mcp/dist/cli.js';
const searchString = 'STITCH_API_KEY';

const buffer = fs.readFileSync(path);
let index = buffer.indexOf(searchString);

while (index !== -1) {
    console.log(`Found "${searchString}" at index: ${index}`);
    const start = Math.max(0, index - 200);
    const end = Math.min(buffer.length, index + 200);
    console.log(buffer.slice(start, end).toString());
    console.log('-----------------------------------');
    index = buffer.indexOf(searchString, index + 1);
}
