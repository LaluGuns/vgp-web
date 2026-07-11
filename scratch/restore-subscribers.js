const fs = require('fs');
const readline = require('readline');

const logPath = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\20a78390-0ffc-4626-9d56-f61d7f35d80b\\.system_generated\\logs\\transcript_full.jsonl';

async function main() {
    if (!fs.existsSync(logPath)) {
        console.error("Log file does not exist at:", logPath);
        process.exit(1);
    }

    console.log("Reading full log file...");
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const recovered = new Map(); // email -> { name, email, status, tags, created_at }

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const step = JSON.parse(line);
            const content = JSON.stringify(step);
            
            // Search for JSON structures representing subscriber rows
            // e.g. { "name": "...", "email": "...", "tags": [...] }
            // or pg query results like { "rows": [...] }
            const matches = content.match(/"email":"([^"]+)","(name|status|created_at|tags)"/g);
            
            // Let's also look for any array of subscribers or objects with email and name
            // We can scan the text for JSON patterns
            // Let's parse objects recursively or using regex
            findSubscribersInObject(step, recovered);

        } catch (err) {
            // Ignore JSON parse errors for incomplete lines
        }
    }

    console.log(`Total unique subscribers recovered: ${recovered.size}`);
    const list = Array.from(recovered.values());
    
    // Save to scratch/recovered_subscribers.json
    fs.writeFileSync('scratch/recovered_subscribers.json', JSON.stringify(list, null, 2));
    console.log("Saved recovered subscribers to scratch/recovered_subscribers.json");

    // Print breakdown by tags
    const breakdown = {};
    for (const sub of list) {
        for (const tag of (sub.tags || [])) {
            breakdown[tag] = (breakdown[tag] || 0) + 1;
        }
    }
    console.log("Breakdown by tags:", breakdown);
}

function findSubscribersInObject(obj, recovered) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
        for (const item of obj) {
            findSubscribersInObject(item, recovered);
        }
        return;
    }

    // Check if this object looks like a subscriber
    if (obj.email && typeof obj.email === 'string' && obj.email.includes('@')) {
        const email = obj.email.trim().toLowerCase();
        const name = obj.name || '';
        const tags = Array.isArray(obj.tags) ? obj.tags : [];
        const status = obj.status || 'subscribed';
        const created_at = obj.created_at || obj.registered || new Date().toISOString();

        if (email && email.includes('.') && !email.includes(' ') && email.length > 5) {
            // If we already have this email, merge the tags
            if (recovered.has(email)) {
                const existing = recovered.get(email);
                const mergedTags = Array.from(new Set([...existing.tags, ...tags]));
                recovered.set(email, {
                    name: name && name !== 'Producer' ? name : existing.name,
                    email,
                    status: status || existing.status,
                    tags: mergedTags,
                    created_at: created_at || existing.created_at
                });
            } else {
                recovered.set(email, { name, email, status, tags, created_at });
            }
        }
    }

    // Recurse into properties
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            findSubscribersInObject(obj[key], recovered);
        }
    }
}

main();
