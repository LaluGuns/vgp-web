-- NOT yet applied — apply via Supabase SQL editor / CLI when ready.
-- Presence + device columns for flowstate_profiles, written once per page load
-- by /api/presence (server route, service-role client). Powers the founder
-- dashboard's per-user analytics (last seen, OS/browser/device, coarse geo).
--
-- All columns are nullable with no defaults: existing rows stay untouched and
-- the founder dashboard renders "—" until a user's first ping arrives.
--
-- RLS note: writes go through the service role (bypasses RLS), and the
-- existing "fs_profiles_select_own" policy already lets a user read their own
-- row, so no new policies are needed. Users cannot update these columns
-- directly only insofar as they don't try — fs_profiles_update_own would allow
-- a user to edit their own row, which is harmless here (self-reported presence
-- on their own profile; never used for entitlement).
alter table public.flowstate_profiles
  add column if not exists last_seen_at timestamptz,
  add column if not exists os text,
  add column if not exists browser text,
  add column if not exists device_type text,
  add column if not exists country text,
  add column if not exists city text;

-- Founder dashboard orders the user list by recency.
create index if not exists idx_fs_profiles_last_seen
  on public.flowstate_profiles (last_seen_at desc nulls last);
