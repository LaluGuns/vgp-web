-- Focus Optimizer metrics on focus sessions (applied 2026-06-27).
alter table flowstate_focus_sessions
  add column if not exists fidget_count integer not null default 0,
  add column if not exists fidget_timeline jsonb,
  add column if not exists defection_seconds integer not null default 0,
  add column if not exists context_bookmark text,
  add column if not exists real_focus_ratio numeric;
