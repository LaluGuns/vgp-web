import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.jsonc",
      },
      miniflare: {
        bindings: {
          ENVIRONMENT: "test",
          INTERNAL_HMAC_KEY_ID: "test-v1",
          INTERNAL_HMAC_SECRET: "test-secret-with-at-least-32-characters",
          PROPOSAL_MODE: "mock-dry-run",
          MAX_BODY_BYTES: "32768",
        },
      },
    }),
  ],
});
