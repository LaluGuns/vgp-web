#!/usr/bin/env node
import readline from "node:readline";
import { createBridgeClient, FounderOsBridgeError } from "./lib/bridge-client.mjs";
import { invokeTool, TOOL_DEFINITIONS } from "./lib/tool-registry.mjs";

const SERVER_INFO = { name: "vgp-founder-os-bridge", version: "0.1.0" };
const PROTOCOL_VERSION = "2025-06-18";

function write(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id, value) {
  write({ jsonrpc: "2.0", id, result: value });
}

function rpcError(id, code, message) {
  write({ jsonrpc: "2.0", id, error: { code, message } });
}

function safeToolError(error) {
  if (error instanceof FounderOsBridgeError) {
    return {
      error: error.code,
      message: error.message,
      status: error.status,
      requestId: error.requestId,
    };
  }
  return {
    error: "INVALID_TOOL_REQUEST",
    message: error instanceof Error ? error.message.slice(0, 500) : "Tool request failed.",
  };
}

let client;
function getClient() {
  client ??= createBridgeClient();
  return client;
}

async function handle(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    rpcError(message?.id ?? null, -32600, "Invalid JSON-RPC request.");
    return;
  }
  const { id, method, params } = message;
  if (method.startsWith("notifications/")) return;

  if (method === "initialize") {
    result(id, {
      protocolVersion: typeof params?.protocolVersion === "string" ? params.protocolVersion : PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: SERVER_INFO,
      instructions: "Read sanitized Founder OS state and create DRAFT/review requests only. No external action tools exist.",
    });
    return;
  }
  if (method === "ping") {
    result(id, {});
    return;
  }
  if (method === "tools/list") {
    result(id, { tools: TOOL_DEFINITIONS });
    return;
  }
  if (method === "tools/call") {
    try {
      const payload = await invokeTool(params?.name, params?.arguments ?? {}, getClient());
      result(id, {
        content: [{ type: "text", text: JSON.stringify(payload) }],
        structuredContent: payload,
        isError: false,
      });
    } catch (error) {
      const safe = safeToolError(error);
      result(id, {
        content: [{ type: "text", text: JSON.stringify(safe) }],
        structuredContent: safe,
        isError: true,
      });
    }
    return;
  }
  rpcError(id, -32601, "Method not found.");
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });
lines.on("line", async (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    rpcError(null, -32700, "Parse error.");
    return;
  }
  try {
    await handle(message);
  } catch {
    rpcError(message.id ?? null, -32603, "Internal error.");
  }
});
