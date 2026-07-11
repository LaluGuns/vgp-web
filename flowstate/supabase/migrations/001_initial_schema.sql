-- Flowstate schema — applied to the shared `vgp-founder-staging` Supabase project.
-- All objects are namespaced with the `flowstate_` prefix to coexist safely with
-- the founder app's `vgp_*` tables. No trigger on auth.users (shared resource) —
-- profiles are created lazily by the app on login (see app/auth/callback/route.ts).

-- Enums
create type flowstate_subscription_status as enum ('active','past_due','cancelled','expired','trialing');
create type flowstate_subscription_plan as enum ('free','monthly','yearly','lifetime');
create type flowstate_track_source as enum ('original','ai_assisted','ai_generated');
create type flowstate_timer_mode as enum ('pomodoro','deep_work','custom','stopwatch');

-- Profiles
create table flowstate_profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone text default 'UTC',
  plan flowstate_subscription_plan not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table flowstate_profiles enable row level security;
create policy "fs_profiles_select_own" on flowstate_profiles for select using (auth.uid() = id);
create policy "fs_profiles_update_own" on flowstate_profiles for update using (auth.uid() = id);
create policy "fs_profiles_insert_own" on flowstate_profiles for insert with check (auth.uid() = id);

-- Subscriptions (synced from Lemon Squeezy webhooks via service role)
create table flowstate_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references flowstate_profiles(id) on delete cascade,
  provider text not null default 'lemonsqueezy',
  provider_subscription_id text unique,
  provider_customer_id text,
  status flowstate_subscription_status not null default 'active',
  plan flowstate_subscription_plan not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table flowstate_subscriptions enable row level security;
create policy "fs_subs_select_own" on flowstate_subscriptions for select using (auth.uid() = user_id);
create index idx_fs_subs_user on flowstate_subscriptions(user_id);

-- Tracks
create table flowstate_tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null default 'Virzy Guns',
  genre text not null,
  mood text,
  duration_s integer not null,
  hls_url text not null,
  cover_url text,
  is_premium boolean not null default false,
  source flowstate_track_source not null default 'original',
  license_id uuid,
  sort_order integer default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table flowstate_tracks enable row level security;
create policy "fs_tracks_read" on flowstate_tracks for select using (true);

-- Ambient sounds
create table flowstate_ambient_sounds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  file_url text not null,
  icon text not null default 'cloud-rain',
  category text not null default 'nature',
  is_premium boolean not null default false,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table flowstate_ambient_sounds enable row level security;
create policy "fs_ambient_read" on flowstate_ambient_sounds for select using (true);

-- Playlists + junction
create table flowstate_playlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  genre text,
  is_premium boolean not null default false,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table flowstate_playlists enable row level security;
create policy "fs_playlists_read" on flowstate_playlists for select using (true);

create table flowstate_playlist_tracks (
  playlist_id uuid not null references flowstate_playlists(id) on delete cascade,
  track_id uuid not null references flowstate_tracks(id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, track_id)
);
alter table flowstate_playlist_tracks enable row level security;
create policy "fs_playlist_tracks_read" on flowstate_playlist_tracks for select using (true);

-- Scenes
create table flowstate_scenes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  asset_url text,
  asset_type text not null default 'css',
  thumbnail_url text,
  is_premium boolean not null default false,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table flowstate_scenes enable row level security;
create policy "fs_scenes_read" on flowstate_scenes for select using (true);

-- Licenses (service role only — legal audit trail)
create table flowstate_licenses (
  id uuid primary key default gen_random_uuid(),
  track_id uuid references flowstate_tracks(id) on delete set null,
  source text not null,
  tool text,
  tier text,
  evidence_url text,
  acquired_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);
alter table flowstate_licenses enable row level security;
create policy "fs_licenses_none" on flowstate_licenses for all using (false);

-- Focus sessions
create table flowstate_focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references flowstate_profiles(id) on delete cascade,
  mode flowstate_timer_mode not null default 'pomodoro',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  target_duration_s integer not null,
  actual_duration_s integer,
  completed boolean not null default false,
  task_id uuid,
  created_at timestamptz not null default now()
);
alter table flowstate_focus_sessions enable row level security;
create policy "fs_sessions_select_own" on flowstate_focus_sessions for select using (auth.uid() = user_id);
create policy "fs_sessions_insert_own" on flowstate_focus_sessions for insert with check (auth.uid() = user_id);
create policy "fs_sessions_update_own" on flowstate_focus_sessions for update using (auth.uid() = user_id);
create index idx_fs_sessions_user_date on flowstate_focus_sessions(user_id, started_at desc);

-- Tasks
create table flowstate_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references flowstate_profiles(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  pomodoros_estimated integer default 1,
  pomodoros_done integer default 0,
  position integer default 0,
  created_at timestamptz not null default now()
);
alter table flowstate_tasks enable row level security;
create policy "fs_tasks_select_own" on flowstate_tasks for select using (auth.uid() = user_id);
create policy "fs_tasks_insert_own" on flowstate_tasks for insert with check (auth.uid() = user_id);
create policy "fs_tasks_update_own" on flowstate_tasks for update using (auth.uid() = user_id);
create policy "fs_tasks_delete_own" on flowstate_tasks for delete using (auth.uid() = user_id);
create index idx_fs_tasks_user on flowstate_tasks(user_id, position);

-- Mixer presets
create table flowstate_mixer_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references flowstate_profiles(id) on delete cascade,
  name text not null,
  config jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table flowstate_mixer_presets enable row level security;
create policy "fs_presets_all_own" on flowstate_mixer_presets for all using (auth.uid() = user_id);

-- Daily stats
create table flowstate_stats_daily (
  user_id uuid not null references flowstate_profiles(id) on delete cascade,
  date date not null,
  focus_minutes integer not null default 0,
  sessions_completed integer not null default 0,
  streak integer not null default 0,
  primary key (user_id, date)
);
alter table flowstate_stats_daily enable row level security;
create policy "fs_stats_select_own" on flowstate_stats_daily for select using (auth.uid() = user_id);

-- Helpers
create or replace function flowstate_is_premium(check_user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin
  return exists (
    select 1 from flowstate_subscriptions
    where user_id = check_user_id
      and status in ('active','trialing')
      and (plan = 'lifetime' or current_period_end > now())
  );
end; $$;

create or replace function flowstate_update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger set_fs_profiles_updated_at before update on flowstate_profiles
  for each row execute function flowstate_update_updated_at();
create trigger set_fs_subscriptions_updated_at before update on flowstate_subscriptions
  for each row execute function flowstate_update_updated_at();
