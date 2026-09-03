import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const mobileRoot = path.dirname(fileURLToPath(import.meta.url));
const flowRoot = path.resolve(mobileRoot, "..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, flowRoot, "");
  const publicEnv = {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_POSTHOG_KEY: env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
    NEXT_PUBLIC_POSTHOG_HOST: env.NEXT_PUBLIC_POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  };

  return {
    root: mobileRoot,
    base: "./",
    plugins: [react()],
    resolve: {
      alias: {
        "@": flowRoot,
        "next/link": path.resolve(mobileRoot, "src/shims/next-link.tsx"),
        "next/navigation": path.resolve(mobileRoot, "src/shims/next-navigation.ts"),
        "next/image": path.resolve(mobileRoot, "src/shims/next-image.tsx"),
      },
    },
    define: {
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(publicEnv.NEXT_PUBLIC_SUPABASE_URL),
      "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      "process.env.NEXT_PUBLIC_POSTHOG_KEY": JSON.stringify(publicEnv.NEXT_PUBLIC_POSTHOG_KEY),
      "process.env.NEXT_PUBLIC_POSTHOG_HOST": JSON.stringify(publicEnv.NEXT_PUBLIC_POSTHOG_HOST),
    },
    build: {
      outDir: path.resolve(mobileRoot, "dist"),
      emptyOutDir: true,
      sourcemap: false,
      target: "es2022",
    },
  };
});
