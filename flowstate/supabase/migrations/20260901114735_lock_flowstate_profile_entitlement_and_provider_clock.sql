alter table public.flowstate_subscriptions
  add column if not exists provider_updated_at timestamptz;

create or replace function public.flowstate_guard_profile_entitlement()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  jwt_role text := coalesce(auth.role(), '');
begin
  if current_user in ('postgres', 'service_role') or jwt_role = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.plan is distinct from 'free'::public.flowstate_subscription_plan then
      raise exception 'flowstate_profiles.plan is server-managed' using errcode = '42501';
    end if;
  elsif new.plan is distinct from old.plan then
    raise exception 'flowstate_profiles.plan is server-managed' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.flowstate_guard_profile_entitlement() from public, anon, authenticated;

drop trigger if exists flowstate_guard_profile_entitlement on public.flowstate_profiles;
create trigger flowstate_guard_profile_entitlement
before insert or update on public.flowstate_profiles
for each row execute function public.flowstate_guard_profile_entitlement();
