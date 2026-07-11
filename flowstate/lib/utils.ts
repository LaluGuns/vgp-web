import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Resolve an audio asset path to its serving URL.
 * When NEXT_PUBLIC_AUDIO_CDN_BASE_URL is set (R2 / CloudFront), assets are served
 * from the CDN; otherwise they fall back to the local /public path (dev).
 * Absolute URLs (e.g. pre-signed) are returned untouched.
 */
export function audioUrl(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_AUDIO_CDN_BASE_URL;
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}
