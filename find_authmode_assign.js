const fs = require('fs');
const path = 'node_modules/@_davideast/stitch-mcp/dist/cli.js';
// Search for assignment
const searchStrings = ['authMode =', 'authMode: "oauth"', 'authMode:"oauth"'];

const buffer = fs.readFileSync(path);

searchStrings.forEach(str => {
    let index = buffer.indexOf(str);
    if (index !== -1) {
        console.log(`Found "${str}" at index: ${index}`);
        const start = Math.max(0, index - 200);
        const end = Math.min(buffer.length, index + 200);
        console.log(buffer.slice(start, end).toString());
        console.log('-----------------------------------');
    }
});
