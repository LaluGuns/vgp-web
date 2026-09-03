import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const exists = (relative) => fs.existsSync(path.join(root, relative));
const fail = (message) => {
  console.error(`FLOW MOBILE VERIFY FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const required = [
  "mobile/index.html",
  "mobile/capacitor.config.ts",
  "mobile/vite.config.ts",
  "mobile/src/main.tsx",
  "mobile/src/runtime.ts",
  "mobile/src/native-bridge.ts",
  "mobile/src/mobile-login.tsx",
  "mobile/src/mobile-shell.css",
  "app/[lang]/app/page.tsx",
  "app/globals.css",
];
for (const file of required) assert(exists(file), `missing ${file}`);

const pkg = JSON.parse(read("package.json"));
assert(pkg.dependencies?.["@capacitor/core"] === "8.5.1", "Capacitor core must stay pinned to 8.5.1");
assert(pkg.devDependencies?.["@capacitor/android"] === "8.5.1", "Capacitor Android must stay pinned to 8.5.1");
assert(pkg.devDependencies?.["@capacitor/cli"] === "8.5.1", "Capacitor CLI must stay pinned to 8.5.1");
assert(pkg.scripts?.["mobile:build"], "mobile:build script missing");
assert(pkg.scripts?.["mobile:typecheck"], "mobile:typecheck script missing");

const capacitor = read("mobile/capacitor.config.ts");
assert(capacitor.includes('appId: "com.virzyguns.flow"'), "Android package/appId drifted");
assert(capacitor.includes('webDir: "dist"'), "Capacitor must ship the local Vite bundle");
assert(!/server\s*:\s*\{[\s\S]*?url\s*:/m.test(capacitor), "remote server.url is forbidden for release builds");

const main = read("mobile/src/main.tsx");
assert(main.includes('FlowstatePage from "@/app/[lang]/app/page"'), "mobile UI must import the real Flow web workspace");
assert(main.includes('"../../app/globals.css"'), "mobile bundle must import the real Flow global design system");

const runtime = read("mobile/src/runtime.ts");
assert(runtime.includes('const FLOW_WEB_ORIGIN = "https://flow.virzyguns.com"'), "production API origin drifted");
assert(runtime.includes('const API_PREFIXES = ["/api/", "/auth/"]'), "API proxy scope drifted");
assert(!runtime.includes("service_role"), "service role material must never enter the mobile runtime");

const login = read("mobile/src/mobile-login.tsx");
assert(login.includes('com.virzyguns.flow://auth/callback'), "mobile auth callback scheme drifted");
assert(login.includes("skipBrowserRedirect: true"), "OAuth must use the native browser handoff");
assert(login.includes("exchangeCodeForSession"), "PKCE callback exchange missing");

const bridge = read("mobile/src/native-bridge.ts");
for (const plugin of ["FlowNative", "FlowBilling", "FlowAudio"]) {
  assert(bridge.includes(plugin), `${plugin} bridge contract missing`);
}

const mobileTree = fs.readdirSync(path.join(root, "mobile/src"), { recursive: true }).map(String);
const forbiddenCopies = ["timer-display", "task-list", "workspace-sidebar", "workspace-header", "atmosphere-panel"];
for (const name of forbiddenCopies) {
  assert(!mobileTree.some((entry) => entry.toLowerCase().includes(name)), `copied UI detected in mobile/src: ${name}`);
}

const secretPatterns = [
  /SUPABASE_SERVICE_ROLE/i,
  /GOOGLE_PLAY_SERVICE_ACCOUNT/i,
  /PRIVATE_KEY/i,
  /CRON_SECRET/i,
  /LEMONSQUEEZY_WEBHOOK_SECRET/i,
];
for (const relative of mobileTree) {
  const full = path.join(root, "mobile/src", relative);
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) continue;
  const content = fs.readFileSync(full, "utf8");
  for (const pattern of secretPatterns) assert(!pattern.test(content), `server secret identifier found in mobile source: ${relative}`);
}

if (!process.exitCode) {
  console.log("FLOW MOBILE SOURCE VERIFY PASS");
  console.log("UI authority: app/[lang]/app/page.tsx + app/globals.css");
  console.log("App ID: com.virzyguns.flow");
}
