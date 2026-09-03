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
  "capacitor.config.ts",
  "mobile/index.html",
  "mobile/vite.config.ts",
  "mobile/src/main.tsx",
  "mobile/src/runtime.ts",
  "mobile/src/native-bridge.ts",
  "mobile/src/mobile-login.tsx",
  "mobile/src/mobile-shell.css",
  "mobile/src/shims/hls-player.ts",
  "mobile/native/android/MainActivity.java",
  "mobile/native/android/FlowNativePlugin.java",
  "mobile/native/android/FlowBillingPlugin.java",
  "mobile/native/android/FlowAudioPlugin.java",
  "mobile/native/android/FlowPlaybackService.java",
  "mobile/native/android/FlowNotificationReceiver.java",
  "mobile/scripts/apply-android-native.mjs",
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
assert(pkg.scripts?.["mobile:apply:android"], "mobile:apply:android script missing");

const capacitor = read("capacitor.config.ts");
assert(capacitor.includes('appId: "com.virzyguns.flow"'), "Android package/appId drifted");
assert(capacitor.includes('webDir: "mobile/dist"'), "Capacitor must ship the local Vite bundle");
assert(capacitor.includes('path: "mobile/android"'), "Android native project path drifted");
assert(!/server\s*:\s*\{[\s\S]*?url\s*:/m.test(capacitor), "remote server.url is forbidden for release builds");

const main = read("mobile/src/main.tsx");
assert(main.includes('FlowstatePage from "@/app/[lang]/app/page"'), "mobile UI must import the real Flow web workspace");
assert(main.includes('"../../app/globals.css"'), "mobile bundle must import the real Flow global design system");
assert(main.includes("<AudioDriver />"), "shared audio lifecycle must mount in the mobile shell");
assert(main.includes("<AnalyticsProvider />"), "shared analytics lifecycle must mount in the mobile shell");

const vite = read("mobile/vite.config.ts");
assert(vite.includes('"@/lib/audio/hls-player"'), "mobile bundle must route shared audio calls through the native adapter");

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

const billingNative = read("mobile/native/android/FlowBillingPlugin.java");
assert(billingNative.includes("enableAutoServiceReconnection"), "Play Billing automatic reconnection missing");
assert(billingNative.includes("enablePendingPurchases"), "Play Billing pending purchase support missing");
assert(billingNative.includes("Purchase.PurchaseState.PENDING"), "pending purchase state must be represented explicitly");
assert(billingNative.includes("setObfuscatedAccountId"), "server-derived Play account binding must be passed to checkout");
assert(!billingNative.includes("acknowledgePurchase("), "Android client must never acknowledge subscriptions; backend owns acknowledgement");

const applyAndroid = read("mobile/scripts/apply-android-native.mjs");
for (const invariant of ["billing:9.1.0", "media3-exoplayer:1.11.0", "media3-session:1.11.0", "targetSdkVersion = 36"]) {
  assert(applyAndroid.includes(invariant), `Android native overlay invariant missing: ${invariant}`);
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
for (const scope of ["mobile/src", "mobile/native"]) {
  const tree = fs.readdirSync(path.join(root, scope), { recursive: true }).map(String);
  for (const relative of tree) {
    const full = path.join(root, scope, relative);
    if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) continue;
    const content = fs.readFileSync(full, "utf8");
    for (const pattern of secretPatterns) assert(!pattern.test(content), `server secret identifier found in mobile source: ${scope}/${relative}`);
  }
}

if (!process.exitCode) {
  console.log("FLOW MOBILE SOURCE VERIFY PASS");
  console.log("UI authority: app/[lang]/app/page.tsx + app/globals.css");
  console.log("App ID: com.virzyguns.flow");
  console.log("Billing authority: server verification + server acknowledgement only");
}
