-- Outbox idempotency: client-generated id so retried inserts can't duplicate.
alter table public.flowstate_focus_sessions
  add column if not exists client_id uuid;

create unique index if not exists fs_sessions_client_id_unique
  on public.flowstate_focus_sessions (user_id, client_id)
  where client_id is not null;

-- Missing DELETE policy: the insights page has per-session delete, which was
-- silently failing under RLS (0 rows affected, row reappears on refresh).
drop policy if exists fs_sessions_delete_own on public.flowstate_focus_sessions;
create policy fs_sessions_delete_own on public.flowstate_focus_sessions
  for delete using (auth.uid() = user_id);;
