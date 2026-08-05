import { DurableObject } from "cloudflare:workers";

export interface ClaimNonceInput {
  keyId: string;
  nonce: string;
  timestampSeconds: number;
  expiresAtSeconds: number;
}

export class ReplayNonceGuard extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS replay_nonces (
          key_id TEXT NOT NULL,
          nonce TEXT NOT NULL,
          timestamp_seconds INTEGER NOT NULL,
          expires_at_seconds INTEGER NOT NULL,
          created_at_seconds INTEGER NOT NULL,
          PRIMARY KEY (key_id, nonce)
        );
        CREATE INDEX IF NOT EXISTS replay_nonces_expiry_idx
          ON replay_nonces(expires_at_seconds);
      `);
    });
  }

  claimNonce(input: ClaimNonceInput): boolean {
    const nowSeconds = Math.floor(Date.now() / 1_000);
    this.ctx.storage.sql.exec(
      "DELETE FROM replay_nonces WHERE expires_at_seconds < ?",
      nowSeconds,
    );
    this.ctx.storage.sql.exec(
      `INSERT OR IGNORE INTO replay_nonces
        (key_id, nonce, timestamp_seconds, expires_at_seconds, created_at_seconds)
       VALUES (?, ?, ?, ?, ?)`,
      input.keyId,
      input.nonce,
      input.timestampSeconds,
      input.expiresAtSeconds,
      nowSeconds,
    );
    const result = this.ctx.storage.sql
      .exec<{ inserted: number }>("SELECT changes() AS inserted")
      .one();
    return result.inserted === 1;
  }
}
