const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\20a78390-0ffc-4626-9d56-f61d7f35d80b\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    console.log("Searching for kbfwise@gmail.com...");
    let lineCount = 0;
    for await (const line of rl) {
        lineCount++;
        if (line.includes('kbfwise@gmail.com')) {
            console.log(`Line ${lineCount} matches!`);
            console.log(line.slice(0, 500)); // Print first 500 chars of the line
        }
    }
}

main();
