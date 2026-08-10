import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { TOOL_NAMES } from "./lib/tool-registry.mjs";

const serverPath = fileURLToPath(new URL("./founder-os-mcp.mjs", import.meta.url));
const child = spawn(process.execPath, [serverPath], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    FOUNDER_OS_BASE_URL: "http://127.0.0.1:9",
    FOUNDER_OS_BRIDGE_SECRET: "x".repeat(32),
  },
  windowsHide: true,
});

let stdout = "";
let stderr = "";
child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => { stdout += chunk; });
child.stderr.on("data", (chunk) => { stderr += chunk; });

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "vgp-founder-os-smoke", version: "0.1.0" },
  },
});
send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });
send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
send({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: { name: "founder_execute_approval", arguments: {} },
});

const deadline = Date.now() + 5_000;
while (Date.now() < deadline) {
  const messages = stdout.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  if (messages.some((message) => message.id === 2) && messages.some((message) => message.id === 3)) break;
  await new Promise((resolve) => setTimeout(resolve, 20));
}

child.stdin.end();
const messages = stdout.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const initialized = messages.find((message) => message.id === 1);
const listed = messages.find((message) => message.id === 2);
const prohibitedCall = messages.find((message) => message.id === 3);

assert.equal(initialized?.result?.serverInfo?.name, "vgp-founder-os-bridge");
assert.deepEqual(listed?.result?.tools?.map((tool) => tool.name), TOOL_NAMES);
assert.equal(listed.result.tools.some((tool) => /(approve|execute|send|publish|upload|reply|dm|oauth|disconnect)/i.test(tool.name)), false);
assert.equal(prohibitedCall?.result?.isError, true);
assert.equal(prohibitedCall?.result?.structuredContent?.error, "INVALID_TOOL_REQUEST");
assert.equal(stderr, "");

console.log(`MCP smoke passed: initialize + tools/list (${TOOL_NAMES.length} tools) + prohibited tools/call rejection.`);
