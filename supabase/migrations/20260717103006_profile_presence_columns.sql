alter table public.flowstate_profiles
  add column if not exists last_seen_at timestamptz,
  add column if not exists os text,
  add column if not exists browser text,
  add column if not exists device_type text,
  add column if not exists country text,
  add column if not exists city text;

create index if not exists idx_fs_profiles_last_seen
  on public.flowstate_profiles (last_seen_at desc nulls last);;
