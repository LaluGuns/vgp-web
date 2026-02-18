const { spawn } = require('child_process');
const path = require('path');

// Path to the actual Stitch CLI
const stitchScript = path.join(__dirname, 'node_modules', '@_davideast', 'stitch-mcp', 'bin', 'stitch-mcp.js');

// Spawn the Stitch proxy
// We explicitly use the current node executable
const child = spawn(process.execPath, [stitchScript, 'proxy'], {
    env: {
        ...process.env,
        // Ensure API Key is passed (Must be set in environment)
        STITCH_API_KEY: process.env.STITCH_API_KEY,
        // Try to suppress interaction or color codes
        CI: 'true',
        FORCE_COLOR: '0',
        NO_COLOR: '1'
    },
    stdio: ['pipe', 'pipe', 'pipe'] // We handle stdio manually
});

// Buffer for partial JSON chunks
let buffer = '';

child.stdout.on('data', (data) => {
    const output = data.toString();

    // Check if this looks like a JSON-RPC message (starts with {)
    // Simple heuristic: if it contains "jsonrpc", it's probably protocol
    // Or if it starts with { 
    if (output.trim().startsWith('{')) {
        process.stdout.write(data);
    } else {
        // Redirect non-JSON logs to stderr so they don't break MCP protocol
        process.stderr.write(`[Stitch Log] ${output}`);
    }
});

// Pipe stdin/stderr directly
process.stdin.pipe(child.stdin);
child.stderr.pipe(process.stderr);

child.on('exit', (code) => {
    process.exit(code);
});

child.on('error', (err) => {
    console.error('[Wrapper Error]', err);
    process.exit(1);
});
