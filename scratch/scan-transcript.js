const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\20a78390-0ffc-4626-9d56-f61d7f35d80b\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logPath)) {
    console.error("Log file does not exist at:", logPath);
    process.exit(1);
}

console.log("Reading log file...");
const data = fs.readFileSync(logPath, 'utf8');
const lines = data.split('\n').filter(Boolean);

console.log(`Total steps logged: ${lines.length}`);

// We will search for any arrays of subscribers imported, or any output of SQL SELECT queries of vgp_subscribers
const foundSubscribers = [];

for (const line of lines) {
    if (line.includes('cadenz') || line.includes('book_buyer') || line.includes('beat_buyer')) {
        // Let's see if we can extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = line.match(emailRegex);
        if (matches) {
            for (const email of matches) {
                if (!foundSubscribers.includes(email)) {
                    foundSubscribers.push(email);
                }
            }
        }
    }
}

console.log("Found unique emails in logs:", foundSubscribers.length);
console.log(JSON.stringify(foundSubscribers.slice(0, 100), null, 2));
