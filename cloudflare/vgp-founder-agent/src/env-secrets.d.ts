interface Env {
  /**
   * Wrangler secret. This is intentionally absent from wrangler.jsonc and is
   * the only binding that cannot be generated from non-secret configuration.
   */
  INTERNAL_HMAC_SECRET: string;
}
