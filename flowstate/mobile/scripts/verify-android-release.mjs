import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(scriptDir, "..");
const flowRoot = path.resolve(mobileRoot, "..");
const androidRoot = path.join(mobileRoot, "android");
const appRoot = path.join(androidRoot, "app");

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing release file: ${file}`);
  return fs.readFileSync(file, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const manifest = read(path.join(appRoot, "src", "main", "AndroidManifest.xml"));
const appGradle = read(path.join(appRoot, "build.gradle"));
const variables = read(path.join(androidRoot, "variables.gradle"));
const capacitor = read(path.join(flowRoot, "capacitor.config.ts"));
const mobileMain = read(path.join(mobileRoot, "src", "main.tsx"));
const mobileNavigation = read(path.join(mobileRoot, "src", "shims", "next-navigation.ts"));
const accountButton = read(path.join(flowRoot, "components", "auth", "account-button.tsx"));
const deletePanel = read(path.join(flowRoot, "components", "account", "delete-account-panel.tsx"));
const deleteApi = read(path.join(flowRoot, "app", "api", "account", "delete", "route.ts"));
const deleteWebPage = read(path.join(flowRoot, "app", "[lang]", "delete-account", "page.tsx"));
const privacyPage = read(path.join(flowRoot, "app", "[lang]", "legal", "privacy", "page.tsx"));

assert(appGradle.includes('applicationId "com.virzyguns.flow"'), "Release package must be com.virzyguns.flow");
assert(appGradle.includes("versionCode 1"), "Flow V1 must use versionCode 1");
assert(appGradle.includes('versionName "1.0.0"'), "Flow V1 must use versionName 1.0.0");
assert(variables.includes("minSdkVersion = 26"), "Flow minSdk must remain 26");
assert(variables.includes("compileSdkVersion = 36"), "Flow compileSdk must be 36");
assert(variables.includes("targetSdkVersion = 36"), "Flow targetSdk must be 36 for Google Play submissions after August 31, 2026");
assert(appGradle.includes("billing:9.1.0"), "Google Play Billing 9.1.0 is required");
assert(appGradle.includes("media3-session:1.11.0"), "Media3 session dependency is required");
assert(appGradle.includes("FLOW_UPLOAD_STORE_FILE"), "Release signing must be configured from environment only");
assert(appGradle.includes("FLOW_UPLOAD_STORE_PASSWORD"), "Release store password must come from environment only");
assert(appGradle.includes("FLOW_UPLOAD_KEY_ALIAS"), "Release key alias must come from environment only");
assert(appGradle.includes("FLOW_UPLOAD_KEY_PASSWORD"), "Release key password must come from environment only");
assert(!/storePassword\s+[\"'][^\"']+[\"']/.test(appGradle), "Hard-coded Android signing password detected");
assert(!/keyPassword\s+[\"'][^\"']+[\"']/.test(appGradle), "Hard-coded Android key password detected");

for (const permission of [
  "android.permission.INTERNET",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.WAKE_LOCK",
]) {
  assert(manifest.includes(permission), `Android manifest missing ${permission}`);
}

assert(manifest.includes('android:usesCleartextTraffic="false"'), "Cleartext traffic must be disabled");
assert(manifest.includes('android:allowBackup="false"'), "Android app-data backup must be disabled");
assert(manifest.includes('android:scheme="com.virzyguns.flow"'), "Flow auth callback scheme is missing");
assert(manifest.includes('android:foregroundServiceType="mediaPlayback"'), "Media playback foreground service type is missing");
assert(manifest.includes(".FlowPlaybackService"), "Flow playback service is missing");
assert(manifest.includes(".FlowNotificationReceiver"), "Flow notification receiver is missing");
assert(manifest.includes("@drawable/flow_app_icon"), "Flow launcher branding is missing");

assert(capacitor.includes('loggingBehavior: "none"'), "Capacitor release logging must be disabled");
assert(capacitor.includes("allowMixedContent: false"), "Mixed content must remain disabled");
assert(capacitor.includes("webContentsDebuggingEnabled: false"), "WebView debugging must remain disabled");
assert(capacitor.includes("cleartext: false"), "Capacitor cleartext transport must remain disabled");
assert(capacitor.includes("CapacitorHttp"), "Native HTTPS transport must remain enabled");

for (const [source, expected, message] of [
  [mobileMain, '"delete-account"', "Mobile app must render the delete-account route"],
  [mobileNavigation, '"delete-account"', "Mobile navigation must keep account deletion inside the app"],
  [accountButton, 'href="/delete-account"', "Signed-in account menu must expose account deletion"],
  [deletePanel, 'fetch("/api/account/delete"', "Delete-account UI must call the authenticated deletion endpoint"],
  [deletePanel, "acknowledgeSubscriptions", "Delete-account UI must warn that external subscriptions are separate"],
  [deleteApi, "auth.admin.deleteUser", "Deletion endpoint must delete the Supabase Auth user"],
  [deleteApi, "confirmation_mismatch", "Deletion endpoint must require destructive confirmation"],
  [deleteWebPage, "DeleteAccountPanel", "A public web account-deletion resource is required for Google Play"],
  [privacyPage, 'href="/delete-account"', "Privacy policy must link to account deletion"],
]) {
  assert(source.includes(expected), message);
}

const sourceTree = [
  path.join(mobileRoot, "src"),
  path.join(mobileRoot, "native"),
  path.join(appRoot, "src", "main"),
  path.join(flowRoot, "capacitor.config.ts"),
];
const forbidden = /SUPABASE_SERVICE_ROLE|GOOGLE_PLAY_SERVICE_ACCOUNT_JSON|PRIVATE_KEY|CRON_SECRET|LEMONSQUEEZY_WEBHOOK_SECRET/;
function walk(item) {
  if (!fs.existsSync(item)) return [];
  const stat = fs.statSync(item);
  if (stat.isFile()) return [item];
  return fs.readdirSync(item, { withFileTypes: true }).flatMap((entry) => {
    if (["build", ".gradle", "node_modules"].includes(entry.name)) return [];
    return walk(path.join(item, entry.name));
  });
}
for (const file of sourceTree.flatMap(walk)) {
  if (!/\.(?:java|kt|ts|tsx|js|mjs|json|xml|gradle|properties|html|css)$/i.test(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  if (forbidden.test(content)) {
    throw new Error(`Server secret identifier detected in packaged Android/mobile source: ${file}`);
  }
}

console.log("FLOW ANDROID PLAY RELEASE VERIFY PASS");
console.log("Package: com.virzyguns.flow");
console.log("Version: 1.0.0 (1)");
console.log("SDK: min 26 / compile 36 / target 36");
console.log("Billing: Google Play Billing 9.1.0");
console.log("Account deletion: in-app + public web path gated");
console.log("Signing: environment-only upload key");
