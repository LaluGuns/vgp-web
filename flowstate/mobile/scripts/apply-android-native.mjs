import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(scriptDir, "..");
const androidRoot = path.join(mobileRoot, "android");
const appRoot = path.join(androidRoot, "app");
const overlayRoot = path.join(mobileRoot, "native", "android");
const javaRoot = path.join(appRoot, "src", "main", "java", "com", "virzyguns", "flow");

function mustExist(file) {
  if (!fs.existsSync(file)) throw new Error(`Required Android bootstrap file missing: ${file}`);
}

function replaceOrThrow(content, pattern, replacement, label) {
  if (!pattern.test(content)) throw new Error(`Unable to patch ${label}`);
  return content.replace(pattern, replacement);
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
for (const expected of ["billing:9.1.0", "media3-exoplayer:1.11.0", "media3-session:1.11.0"]) {
  if (!generatedGradle.includes(expected)) throw new Error(`Android Gradle missing ${expected}`);
}
for (const expected of ["FlowPlaybackService", "FlowNotificationReceiver", "com.virzyguns.flow"]) {
  if (!generatedManifest.includes(expected)) throw new Error(`Android manifest missing ${expected}`);
}

console.log("FLOW ANDROID NATIVE OVERLAY APPLY PASS");
console.log("SDK: min 26 / compile 36 / target 36");
console.log("Billing: Google Play Billing 9.1.0");
console.log("Audio: Media3 1.11.0");
