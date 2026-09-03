export type FlowNativePlatform = "android" | "ios" | "web";
export type FlowReplacementMode = "DEFERRED" | "CHARGE_FULL_PRICE" | "CHARGE_PRORATED_PRICE" | "KEEP_EXISTING";

export interface NativePlatformContext {
  platform: FlowNativePlatform;
  appVersion?: string;
  buildNumber?: string;
  charging?: boolean;
}

export interface FlowNativePlugin {
  getPlatformContext?: () => Promise<NativePlatformContext>;
  openExternal?: (options: { url: string }) => Promise<void>;
  requestNotificationPermission?: () => Promise<{ granted: boolean }>;
  scheduleFocusDeadline?: (options: { id: string; deadlineEpochMs: number; title: string; body: string }) => Promise<void>;
  cancelFocusDeadline?: (options: { id: string }) => Promise<void>;
}

export interface FlowBillingPurchaseOptions {
  productId: string;
  basePlanId: string;
  offerId?: string;
  obfuscatedAccountId: string;
  oldPurchaseToken?: string;
  oldProductId?: string;
  replacementMode?: FlowReplacementMode;
}

export interface FlowBillingPlugin {
  getProducts?: (options: { productIds: string[] }) => Promise<{ products: unknown[] }>;
  purchase?: (options: FlowBillingPurchaseOptions) => Promise<{ state: string; purchaseToken?: string; productId?: string }>;
  restore?: () => Promise<{ purchases: Array<{ productId: string; purchaseToken: string; state: string }> }>;
}

export interface FlowAudioState {
  currentSeconds: number;
  durationSeconds: number;
  playing: boolean;
  ended?: boolean;
}

export interface FlowAudioPlugin {
  load?: (options: { url: string; cacheKey: string; title: string; artist: string; premium: boolean }) => Promise<void>;
  play?: () => Promise<void>;
  pause?: () => Promise<void>;
  seek?: (options: { seconds: number }) => Promise<void>;
  setVolume?: (options: { value: number }) => Promise<void>;
  getState?: () => Promise<FlowAudioState>;
  stop?: () => Promise<void>;
}

declare global {
  interface Window {
    Capacitor?: {
      getPlatform?: () => string;
      isNativePlatform?: () => boolean;
      Plugins?: {
        FlowNative?: FlowNativePlugin;
        FlowBilling?: FlowBillingPlugin;
        FlowAudio?: FlowAudioPlugin;
        [name: string]: unknown;
      };
    };
    __FLOW_MOBILE__?: boolean;
  }
}

export function isFlowMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.__FLOW_MOBILE__ === true || window.Capacitor?.isNativePlatform?.() === true;
}

export function nativePlatform(): FlowNativePlatform {
  if (typeof window === "undefined") return "web";
  const platform = window.Capacitor?.getPlatform?.();
  return platform === "android" || platform === "ios" ? platform : "web";
}

export function flowNative(): FlowNativePlugin | null {
  return window.Capacitor?.Plugins?.FlowNative ?? null;
}

export function flowBilling(): FlowBillingPlugin | null {
  return window.Capacitor?.Plugins?.FlowBilling ?? null;
}

export function flowAudio(): FlowAudioPlugin | null {
  return window.Capacitor?.Plugins?.FlowAudio ?? null;
}
