import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(scriptDir, "..");
const flowRoot = path.resolve(mobileRoot, "..");
const androidRoot = path.join(mobileRoot, "android");
const appRoot = path.join(androidRoot, "app");
const overlayRoot = path.join(mobileRoot, "native", "android");
const javaRoot = path.join(appRoot, "src", "main", "java", "com", "virzyguns", "flow");
const resRoot = path.join(appRoot, "src", "main", "res");

function mustExist(file) {
  if (!fs.existsSync(file)) throw new Error(`Required Android bootstrap file missing: ${file}`);
}

function replaceOrThrow(content, pattern, replacement, label) {
  if (!pattern.test(content)) throw new Error(`Unable to patch ${label}`);
  return content.replace(pattern, replacement);
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

mustExist(androidRoot);
mustExist(path.join(appRoot, "build.gradle"));
mustExist(path.join(androidRoot, "variables.gradle"));
mustExist(path.join(appRoot, "src", "main", "AndroidManifest.xml"));

fs.mkdirSync(javaRoot, { recursive: true });
for (const file of [
  "MainActivity.java",
  "FlowNativePlugin.java",
  "FlowBillingPlugin.java",
  "FlowAudioPlugin.java",
  "FlowPlaybackService.java",
  "FlowNotificationReceiver.java",
]) {
  const from = path.join(overlayRoot, file);
  mustExist(from);
  fs.copyFileSync(from, path.join(javaRoot, file));
}

const variablesPath = path.join(androidRoot, "variables.gradle");
let variables = fs.readFileSync(variablesPath, "utf8");
variables = replaceOrThrow(variables, /minSdkVersion\s*=\s*\d+/, "minSdkVersion = 26", "minSdkVersion");
variables = replaceOrThrow(variables, /compileSdkVersion\s*=\s*\d+/, "compileSdkVersion = 36", "compileSdkVersion");
variables = replaceOrThrow(variables, /targetSdkVersion\s*=\s*\d+/, "targetSdkVersion = 36", "targetSdkVersion");
fs.writeFileSync(variablesPath, variables);

const buildGradlePath = path.join(appRoot, "build.gradle");
let buildGradle = fs.readFileSync(buildGradlePath, "utf8");
buildGradle = replaceOrThrow(buildGradle, /versionCode\s+\d+/, "versionCode 1", "versionCode");
buildGradle = replaceOrThrow(buildGradle, /versionName\s+"[^"]+"/, 'versionName "1.0.0"', "versionName");

const signingMarker = "// FLOW RELEASE SIGNING";
if (!buildGradle.includes(signingMarker)) {
  buildGradle = replaceOrThrow(
    buildGradle,
    /apply plugin: 'com\.android\.application'\n/,
    `apply plugin: 'com.android.application'\n\n${signingMarker}\ndef flowUploadStoreFile = System.getenv('FLOW_UPLOAD_STORE_FILE')\ndef flowUploadStorePassword = System.getenv('FLOW_UPLOAD_STORE_PASSWORD')\ndef flowUploadKeyAlias = System.getenv('FLOW_UPLOAD_KEY_ALIAS')\ndef flowUploadKeyPassword = System.getenv('FLOW_UPLOAD_KEY_PASSWORD')\ndef flowSigningConfigured = [flowUploadStoreFile, flowUploadStorePassword, flowUploadKeyAlias, flowUploadKeyPassword].every { value -> value != null && !value.trim().isEmpty() }\n`,
    "release signing environment",
  );

  buildGradle = replaceOrThrow(
    buildGradle,
    /\n    buildTypes \{/,
    `\n    if (flowSigningConfigured) {\n        signingConfigs {\n            release {\n                storeFile file(flowUploadStoreFile)\n                storePassword flowUploadStorePassword\n                keyAlias flowUploadKeyAlias\n                keyPassword flowUploadKeyPassword\n            }\n        }\n    }\n\n    buildTypes {`,
    "release signing config",
  );

  buildGradle = replaceOrThrow(
    buildGradle,
    /release \{\n            minifyEnabled false/,
    `release {\n            debuggable false\n            if (flowSigningConfigured) signingConfig signingConfigs.release\n            minifyEnabled false`,
    "release build type signing",
  );
}

const dependencyMarker = "// FLOW HYBRID NATIVE DEPENDENCIES";
if (!buildGradle.includes(dependencyMarker)) {
  buildGradle = replaceOrThrow(
    buildGradle,
    /dependencies\s*\{/,
    `dependencies {\n    ${dependencyMarker}\n    implementation 'com.android.billingclient:billing:9.1.0'\n    implementation 'androidx.media3:media3-exoplayer:1.11.0'\n    implementation 'androidx.media3:media3-exoplayer-hls:1.11.0'\n    implementation 'androidx.media3:media3-session:1.11.0'`,
    "app dependencies"
  );
}
fs.writeFileSync(buildGradlePath, buildGradle);

const flowIconSource = path.join(flowRoot, "public", "icons", "icon-512.png");
mustExist(flowIconSource);
const drawableNoDpi = path.join(resRoot, "drawable-nodpi");
fs.mkdirSync(drawableNoDpi, { recursive: true });
fs.copyFileSync(flowIconSource, path.join(drawableNoDpi, "flow_app_icon.png"));

for (const file of walk(resRoot)) {
  if (path.basename(file) === "splash.png") fs.rmSync(file);
}
const drawableRoot = path.join(resRoot, "drawable");
fs.mkdirSync(drawableRoot, { recursive: true });
fs.writeFileSync(
  path.join(drawableRoot, "splash.xml"),
  `<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n    <item>\n        <shape android:shape="rectangle">\n            <solid android:color="#07040d" />\n        </shape>\n    </item>\n    <item android:width="160dp" android:height="160dp" android:gravity="center">\n        <bitmap android:src="@drawable/flow_app_icon" android:gravity="fill" />\n    </item>\n</layer-list>\n`,
);

const manifestPath = path.join(appRoot, "src", "main", "AndroidManifest.xml");
let manifest = fs.readFileSync(manifestPath, "utf8");
const permissions = [
  "android.permission.INTERNET",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
  "android.permission.WAKE_LOCK",
];
for (const permission of permissions) {
  if (!manifest.includes(`android:name=\"${permission}\"`)) {
    manifest = manifest.replace(
      /<application\b/,
      `    <uses-permission android:name=\"${permission}\" />\n\n    <application`
    );
  }
}

manifest = replaceOrThrow(manifest, /android:allowBackup="[^"]+"/, 'android:allowBackup="false"', "Android backup policy");
manifest = replaceOrThrow(manifest, /android:icon="[^"]+"/, 'android:icon="@drawable/flow_app_icon"', "Flow launcher icon");
manifest = replaceOrThrow(manifest, /android:roundIcon="[^"]+"/, 'android:roundIcon="@drawable/flow_app_icon"', "Flow round launcher icon");

if (!manifest.includes('android:scheme="com.virzyguns.flow"')) {
  manifest = manifest.replace(
    /<\/activity>/,
    `            <intent-filter>\n                <action android:name=\"android.intent.action.VIEW\" />\n                <category android:name=\"android.intent.category.DEFAULT\" />\n                <category android:name=\"android.intent.category.BROWSABLE\" />\n                <data android:scheme=\"com.virzyguns.flow\" android:host=\"auth\" android:path=\"/callback\" />\n            </intent-filter>\n        </activity>`
  );
}

if (!manifest.includes(".FlowPlaybackService")) {
  manifest = manifest.replace(
    /<\/application>/,
    `        <service\n            android:name=\".FlowPlaybackService\"\n            android:foregroundServiceType=\"mediaPlayback\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"androidx.media3.session.MediaSessionService\" />\n            </intent-filter>\n        </service>\n\n        <receiver\n            android:name=\".FlowNotificationReceiver\"\n            android:exported=\"false\" />\n    </application>`
  );
}

if (!manifest.includes('android:usesCleartextTraffic="false"')) {
  manifest = manifest.replace(/<application\b/, '<application android:usesCleartextTraffic="false"');
}
fs.writeFileSync(manifestPath, manifest);

const generatedMain = path.join(javaRoot, "MainActivity.java");
const generatedManifest = fs.readFileSync(manifestPath, "utf8");
const generatedGradle = fs.readFileSync(buildGradlePath, "utf8");
for (const expected of ["FlowNativePlugin.class", "FlowBillingPlugin.class", "FlowAudioPlugin.class"]) {
  if (!fs.readFileSync(generatedMain, "utf8").includes(expected)) throw new Error(`MainActivity missing ${expected}`);
}
for (const expected of ["billing:9.1.0", "media3-exoplayer:1.11.0", "media3-session:1.11.0", 'versionName "1.0.0"', "FLOW_UPLOAD_STORE_FILE"]) {
  if (!generatedGradle.includes(expected)) throw new Error(`Android Gradle missing ${expected}`);
}
for (const expected of ["FlowPlaybackService", "FlowNotificationReceiver", "com.virzyguns.flow", "@drawable/flow_app_icon", 'android:allowBackup="false"']) {
  if (!generatedManifest.includes(expected)) throw new Error(`Android manifest missing ${expected}`);
}
for (const brandedAsset of [path.join(drawableNoDpi, "flow_app_icon.png"), path.join(drawableRoot, "splash.xml")]) {
  mustExist(brandedAsset);
}

console.log("FLOW ANDROID NATIVE OVERLAY APPLY PASS");
console.log("Version: 1.0.0 (1)");
console.log("SDK: min 26 / compile 36 / target 36");
console.log("Billing: Google Play Billing 9.1.0");
console.log("Audio: Media3 1.11.0");
console.log("Branding: shared Flow icon + dark Flow splash");
console.log("Security: app data backup disabled, release signing from environment only");
