-- Applied to Supabase project ogkrxrpwulvgyghckree on 2026-07-08.
-- Backfills the repo with the outbox idempotency column that was applied live
-- ahead of this file, so a rebuilt-from-repo environment matches production.
--
-- The client outbox (lib/optimizer/persist.ts) tags every enqueued session with
-- a client-generated UUID and relies on this partial unique index to make
-- retried inserts idempotent (a duplicate raises 23505, which the client treats
-- as "already delivered"). Without the column, every insert returns PGRST204
-- and the client drops the session as undeliverable -> silent 100% data loss.
alter table public.flowstate_focus_sessions
  add column if not exists client_id uuid;

create unique index if not exists fs_sessions_client_id_unique
  on public.flowstate_focus_sessions (user_id, client_id)
  where client_id is not null;
