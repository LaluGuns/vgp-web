import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.virzyguns.flow",
  appName: "Flow",
  webDir: "dist",
  loggingBehavior: "debug",
  backgroundColor: "#07040d",
  zoomEnabled: false,
  android: {
    path: "android",
    backgroundColor: "#07040d",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    useLegacyBridge: false,
    resolveServiceWorkerRequests: true,
  },
  server: {
    androidScheme: "https",
    cleartext: false,
    errorPath: "offline.html",
  },
};

export default config;
