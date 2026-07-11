-- Revision security and grace period fixes (applied 2026-06-28).

-- 1. Restrict client-side updates on flowstate_profiles to only safe metadata columns (prevents plan privilege escalation)
revoke update on flowstate_profiles from authenticated, anon;
grant update(display_name, timezone, settings) on flowstate_profiles to authenticated;

-- 2. Remove unnecessary and unsafe update policy on flowstate_focus_sessions
drop policy if exists "fs_sessions_update_own" on flowstate_focus_sessions;

-- 3. Restrict flowstate_is_premium function to prevent horizontal scanning of other user subscriptions
create or replace function flowstate_is_premium(check_user_id uuid)
returns boolean language plpgsql security definer stable as $$
begin
  if auth.uid() <> check_user_id and auth.role() <> 'service_role' then
    raise exception 'Access Denied: Cannot query another user entitlement status.';
  end if;

  return exists (
    select 1 from flowstate_subscriptions
    where user_id = check_user_id
      and status in ('active','trialing','cancelled')
      and (plan = 'lifetime' or current_period_end > now())
  );
end; $$;
