-- Comprehensive Audit Fixes (applied 2026-06-28).

-- 1. Revoke global INSERT on flowstate_profiles and restrict to safe metadata columns to prevent plan spoofing
revoke insert on flowstate_profiles from authenticated, anon;
grant insert(id, display_name, timezone, settings) on flowstate_profiles to authenticated;

-- 2. Fix flowstate_is_premium null bypass for anonymous users
create or replace function flowstate_is_premium(check_user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin
  if auth.uid() is distinct from check_user_id and auth.role() is distinct from 'service_role' then
    raise exception 'Access Denied: Cannot query another user entitlement status.';
  end if;

  return exists (
    select 1 from flowstate_subscriptions
    where user_id = check_user_id
      and status in ('active','trialing','cancelled')
      and (plan = 'lifetime' or current_period_end > now())
  );
end; $$;

-- 3. Add database constraints on focus sessions to prevent forged telemetry data
alter table flowstate_focus_sessions
  add constraint chk_ended_after_started check (ended_at > started_at),
  add constraint chk_actual_duration_valid check (actual_duration_s <= extract(epoch from (ended_at - started_at)) + 5),
  add constraint chk_completed_status check (not (completed = true and target_duration_s is not null and actual_duration_s < target_duration_s - 5));

-- 4. Add missing foreign key indexes to speed up cascades and queries
create index if not exists idx_fs_playlist_tracks_track on flowstate_playlist_tracks(track_id);
create index if not exists idx_fs_licenses_track on flowstate_licenses(track_id);

-- 5. Add provider_updated_at tracking column to flowstate_subscriptions to protect against replay/out-of-order webhook events
alter table flowstate_subscriptions
  add column if not exists provider_updated_at timestamptz;
