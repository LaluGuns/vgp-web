const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/;
const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;
const REQUEST_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/;
const FORBIDDEN_KEYS = /(approve|execut|send|publish|upload|reply|direct.?message|oauth|disconnect|token|secret|authorization|credential)/i;

const objectSchema = (properties = {}, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

const text = (description, maxLength = 500) => ({ type: "string", description, maxLength });
const limit = { type: "integer", minimum: 1, maximum: 100, default: 20 };
const catalogLimit = { type: "integer", minimum: 1, maximum: 20, default: 10 };

export const TOOL_DEFINITIONS = Object.freeze([
  {
    name: "founder_get_brief",
    description: "Read the sanitized Founder OS daily brief, priorities, data gaps, and safety state.",
    inputSchema: objectSchema(),
  },
  {
    name: "founder_search_catalog",
    description: "Search the verified VGP catalog without changing catalog data.",
    inputSchema: objectSchema({ query: text("Title, genre, mood, or catalog query.", 200), limit: catalogLimit }, ["query"]),
  },
  {
    name: "founder_search_prospects",
    description: "Search stored evidence-backed prospect candidates using bounded filters.",
    inputSchema: objectSchema({
      query: text("Name, handle, or evidence query.", 200),
      segment: { type: "string", enum: ["rapper", "game-developer", "content-creator"] },
      market: { type: "string", enum: ["en-US", "ja-JP", "de-DE"] },
      platform: { type: "string", enum: ["instagram", "tiktok", "youtube", "website", "other"] },
      limit,
    }),
  },
  {
    name: "founder_save_prospect_candidate",
    description: "Save one source-backed prospect candidate for internal review; never guess contact data.",
    inputSchema: objectSchema({
      requestKey: text("Stable idempotency key.", 120),
      displayName: text("Observed public display name.", 500),
      handle: { type: ["string", "null"], maxLength: 255 },
      segment: { type: "string", enum: ["rapper", "game-developer", "content-creator"] },
      market: { type: "string", enum: ["en-US", "ja-JP", "de-DE"] },
      platform: { type: "string", enum: ["instagram", "tiktok", "youtube", "website", "other"] },
      profileUrl: { type: ["string", "null"], format: "uri", maxLength: 2048 },
      contact: { type: "object", description: "Source-provided contact basis only." },
      evidence: { type: "array", minItems: 1, maxItems: 20, items: { type: "object" } },
      qualificationSignals: { type: "object" },
      beatMatches: { type: "array", maxItems: 10, items: { type: "object" } },
    }, ["requestKey", "displayName", "segment", "market", "platform", "profileUrl", "contact", "evidence", "qualificationSignals", "beatMatches"]),
  },
  {
    name: "founder_create_draft",
    description: "Create a server-supported internal DRAFT only; no provider or external action is performed.",
    inputSchema: {
      ...objectSchema({
      requestKey: text("Stable idempotency key.", 120),
      kind: { type: "string", enum: ["email-outreach", "instagram-reel", "tiktok-draft-upload"] },
      targetLabel: text("Human-readable review target.", 1000),
      payloadSummary: text("Short payload summary.", 10000),
      evidenceIds: { type: "array", maxItems: 20, items: text("Evidence ID.", 160) },
      prospectId: text("Evidence-backed prospect ID for email outreach.", 160),
      subject: text("Email draft subject.", 998),
      body: text("Email draft body.", 20000),
      videoUrl: { type: "string", format: "uri", maxLength: 2048 },
      caption: text("Instagram Reel caption.", 2200),
      shareToFeed: { type: "boolean" },
      founderConfirmedUpload: { type: "boolean", const: true },
    }, ["requestKey", "kind", "targetLabel", "payloadSummary", "evidenceIds"]),
      oneOf: [
        { properties: { kind: { const: "email-outreach" } }, required: ["prospectId", "subject", "body"] },
        { properties: { kind: { const: "instagram-reel" } }, required: ["videoUrl", "caption", "shareToFeed"] },
        { properties: { kind: { const: "tiktok-draft-upload" } }, required: ["videoUrl", "founderConfirmedUpload"] }
      ]
    },
  },
  {
    name: "founder_request_review",
    description: "Move an exact DRAFT revision into founder review; never approve or execute it.",
    inputSchema: objectSchema({
      requestKey: text("Stable idempotency key.", 120),
      approvalId: text("DRAFT approval record ID.", 160),
      expectedContentHash: text("Exact sha256 content hash.", 71),
    }, ["requestKey", "approvalId", "expectedContentHash"]),
  },
  {
    name: "founder_list_approvals",
    description: "List approval queue status without changing any approval.",
    inputSchema: objectSchema({
      status: { type: "string", enum: ["DRAFT", "READY_FOR_APPROVAL", "APPROVED", "EXECUTING", "SUCCEEDED", "FAILED", "UNKNOWN"] },
      limit,
    }),
  },
  {
    name: "founder_get_approval",
    description: "Read one sanitized approval summary, exact content hash, status, and recorded outcome fields.",
    inputSchema: objectSchema({ approvalId: text("Approval record ID.", 160) }, ["approvalId"]),
  },
  {
    name: "founder_get_provider_health",
    description: "Read all provider health adapters, including explicit not-implemented states, without changing providers.",
    inputSchema: objectSchema(),
  },
  {
    name: "founder_get_provider_analytics",
    description: "Read sanitized analytics from an explicitly permitted owned provider account.",
    inputSchema: objectSchema({ provider: { type: "string", enum: ["meta", "tiktok"] } }, ["provider"]),
  },
  {
    name: "founder_get_audit_log",
    description: "Read sanitized Founder OS audit entries; private message bodies and credentials are excluded server-side.",
    inputSchema: objectSchema({
      entityType: text("Optional audit entity type.", 80),
      beforeId: { type: "string", pattern: "^\\d+$", maxLength: 32 },
      limit,
    }),
  },
]);

export const TOOL_NAMES = Object.freeze(TOOL_DEFINITIONS.map((tool) => tool.name));

const TOOL_ARGUMENT_KEYS = Object.freeze({
  founder_get_brief: [],
  founder_search_catalog: ["query", "limit"],
  founder_search_prospects: ["query", "segment", "market", "platform", "limit"],
  founder_save_prospect_candidate: [
    "requestKey", "displayName", "handle", "segment", "market", "platform",
    "profileUrl", "contact", "evidence", "qualificationSignals", "beatMatches",
  ],
  founder_create_draft: [
    "requestKey", "kind", "targetLabel", "payloadSummary", "evidenceIds",
    "prospectId", "subject", "body", "videoUrl", "caption", "shareToFeed",
    "founderConfirmedUpload",
  ],
  founder_request_review: ["requestKey", "approvalId", "expectedContentHash"],
  founder_list_approvals: ["status", "limit"],
  founder_get_approval: ["approvalId"],
  founder_get_provider_health: [],
  founder_get_provider_analytics: ["provider"],
  founder_get_audit_log: ["entityType", "beforeId", "limit"],
});

function plainRecord(value, label = "arguments") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function rejectForbiddenKeys(value, path = "arguments") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const consentField = path === "arguments" && key === "founderConfirmedUpload";
    if (!consentField && FORBIDDEN_KEYS.test(key)) throw new Error(`Forbidden external-action field: ${path}.${key}`);
    rejectForbiddenKeys(child, `${path}.${key}`);
  }
}

function assertAllowedTopLevelKeys(name, args) {
  const allowed = new Set(TOOL_ARGUMENT_KEYS[name] ?? []);
  for (const key of Object.keys(args)) {
    if (!allowed.has(key)) throw new Error(`Unexpected argument field: ${key}`);
  }
}

function boundedString(value, label, { required = false, max = 500, pattern } = {}) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${label} is required.`);
    return undefined;
  }
  if (typeof value !== "string" || value.length > max || (pattern && !pattern.test(value))) {
    throw new Error(`${label} is invalid.`);
  }
  return value;
}

function boundedLimit(value) {
  if (value === undefined) return 20;
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error("limit must be an integer from 1 to 100.");
  return value;
}

function boundedCatalogLimit(value) {
  const parsed = value === undefined ? 10 : value;
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) throw new Error("catalog limit must be an integer from 1 to 20.");
  return parsed;
}

function requireHttpsUrl(value, label) {
  const raw = boundedString(value, label, { required: true, max: 2048 });
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} is invalid.`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
}

function validateDraft(args) {
  const kinds = ["email-outreach", "instagram-reel", "tiktok-draft-upload"];
  if (!kinds.includes(args.kind)) throw new Error("kind is invalid.");
  boundedString(args.targetLabel, "targetLabel", { required: true, max: 1000 });
  boundedString(args.payloadSummary, "payloadSummary", { required: true, max: 10000 });
  if (!Array.isArray(args.evidenceIds) || args.evidenceIds.length > 20) throw new Error("evidenceIds is invalid.");
  if (args.kind === "email-outreach") {
    boundedString(args.prospectId, "prospectId", { required: true, max: 160, pattern: ID_PATTERN });
    boundedString(args.subject, "subject", { required: true, max: 998 });
    boundedString(args.body, "body", { required: true, max: 20000 });
  } else {
    requireHttpsUrl(args.videoUrl, "videoUrl");
    if (args.kind === "instagram-reel") {
      boundedString(args.caption, "caption", { required: true, max: 2200 });
      if (typeof args.shareToFeed !== "boolean") throw new Error("shareToFeed is required.");
    } else if (args.founderConfirmedUpload !== true) {
      throw new Error("founderConfirmedUpload must be true for a TikTok DRAFT request.");
    }
  }
}

function assertPayloadSize(value) {
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > 64 * 1024) {
    throw new Error("Tool payload exceeds 64 KiB.");
  }
}

export async function invokeTool(name, rawArguments, client) {
  if (!TOOL_NAMES.includes(name)) throw new Error(`Unknown or prohibited tool: ${name}`);
  const args = plainRecord(rawArguments ?? {});
  rejectForbiddenKeys(args);
  assertAllowedTopLevelKeys(name, args);
  assertPayloadSize(args);

  switch (name) {
    case "founder_get_brief":
      return client.request({ path: "/api/founder/os/bridge/v1/brief" });
    case "founder_search_catalog":
      return client.request({
        path: "/api/founder/os/bridge/v1/catalog",
        query: {
          query: boundedString(args.query, "query", { required: true, max: 200 }),
          limit: boundedCatalogLimit(args.limit),
        },
      });
    case "founder_search_prospects":
      return client.request({
        path: "/api/founder/os/bridge/v1/prospects",
        query: { ...args, limit: boundedLimit(args.limit) },
      });
    case "founder_save_prospect_candidate": {
      const requestKey = boundedString(args.requestKey, "requestKey", { required: true, max: 120, pattern: REQUEST_KEY_PATTERN });
      return client.request({ method: "POST", path: "/api/founder/os/bridge/v1/prospects", body: args, requestKey });
    }
    case "founder_create_draft": {
      const requestKey = boundedString(args.requestKey, "requestKey", { required: true, max: 120, pattern: REQUEST_KEY_PATTERN });
      validateDraft(args);
      return client.request({ method: "POST", path: "/api/founder/os/bridge/v1/drafts", body: args, requestKey });
    }
    case "founder_request_review": {
      const requestKey = boundedString(args.requestKey, "requestKey", { required: true, max: 120, pattern: REQUEST_KEY_PATTERN });
      boundedString(args.approvalId, "approvalId", { required: true, max: 160, pattern: ID_PATTERN });
      boundedString(args.expectedContentHash, "expectedContentHash", { required: true, max: 71, pattern: HASH_PATTERN });
      return client.request({
        method: "POST",
        path: `/api/founder/os/bridge/v1/approvals/${encodeURIComponent(args.approvalId)}/request-review`,
        body: { expectedContentHash: args.expectedContentHash },
        requestKey,
      });
    }
    case "founder_list_approvals":
      return client.request({ path: "/api/founder/os/bridge/v1/approvals", query: { status: args.status, limit: boundedLimit(args.limit) } });
    case "founder_get_approval": {
      const id = boundedString(args.approvalId, "approvalId", { required: true, max: 160, pattern: ID_PATTERN });
      return client.request({ path: `/api/founder/os/bridge/v1/approvals/${encodeURIComponent(id)}` });
    }
    case "founder_get_provider_health":
      return client.request({ path: "/api/founder/os/bridge/v1/providers" });
    case "founder_get_provider_analytics": {
      const provider = boundedString(args.provider, "provider", { required: true, max: 20 });
      if (!["meta", "tiktok"].includes(provider)) throw new Error("provider analytics supports only meta or tiktok.");
      return client.request({ path: `/api/founder/os/bridge/v1/providers/${encodeURIComponent(provider)}/analytics` });
    }
    case "founder_get_audit_log":
      if (args.beforeId !== undefined) {
        boundedString(args.beforeId, "beforeId", { max: 32, pattern: /^\d+$/ });
      }
      return client.request({ path: "/api/founder/os/bridge/v1/audit", query: { ...args, limit: boundedLimit(args.limit) } });
    default:
      throw new Error(`Unknown or prohibited tool: ${name}`);
  }
}
