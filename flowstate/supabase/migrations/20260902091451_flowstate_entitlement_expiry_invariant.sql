create or replace function public.flowstate_recompute_profile_plan(p_user_id uuid)
returns public.flowstate_subscription_plan
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_plan public.flowstate_subscription_plan := 'free'::public.flowstate_subscription_plan;
begin
  select s.plan into v_plan
  from public.flowstate_subscriptions s
  where s.user_id = p_user_id
    and (
      (s.plan = 'lifetime'::public.flowstate_subscription_plan and s.status in ('active'::public.flowstate_subscription_status, 'trialing'::public.flowstate_subscription_status, 'cancelled'::public.flowstate_subscription_status))
      or
      (s.current_period_end is not null and s.current_period_end > now() and s.status in ('active'::public.flowstate_subscription_status, 'trialing'::public.flowstate_subscription_status, 'cancelled'::public.flowstate_subscription_status))
    )
  order by case s.plan when 'lifetime'::public.flowstate_subscription_plan then 3 when 'yearly'::public.flowstate_subscription_plan then 2 when 'monthly'::public.flowstate_subscription_plan then 1 else 0 end desc,
           s.current_period_end desc nulls first
  limit 1;

  v_plan := coalesce(v_plan, 'free'::public.flowstate_subscription_plan);
  insert into public.flowstate_profiles (id, plan) values (p_user_id, v_plan)
  on conflict (id) do update set plan = excluded.plan, updated_at = now();
  return v_plan;
end;
$function$;

revoke all on function public.flowstate_recompute_profile_plan(uuid) from public, anon, authenticated;
grant execute on function public.flowstate_recompute_profile_plan(uuid) to service_role;

create or replace function public.flowstate_is_premium(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from public.flowstate_subscriptions s
    where s.user_id = check_user_id
      and (
        (s.plan = 'lifetime'::public.flowstate_subscription_plan and s.status in ('active'::public.flowstate_subscription_status, 'trialing'::public.flowstate_subscription_status, 'cancelled'::public.flowstate_subscription_status))
        or
        (s.current_period_end is not null and s.current_period_end > now() and s.status in ('active'::public.flowstate_subscription_status, 'trialing'::public.flowstate_subscription_status, 'cancelled'::public.flowstate_subscription_status))
      )
  );
$function$;

revoke all on function public.flowstate_is_premium(uuid) from public;
grant execute on function public.flowstate_is_premium(uuid) to authenticated, service_role;
