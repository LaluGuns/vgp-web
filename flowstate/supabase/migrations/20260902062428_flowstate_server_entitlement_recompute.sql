create or replace function public.flowstate_recompute_profile_plan(p_user_id uuid)
returns public.flowstate_subscription_plan
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan public.flowstate_subscription_plan := 'free'::public.flowstate_subscription_plan;
begin
  select s.plan
  into v_plan
  from public.flowstate_subscriptions s
  where s.user_id = p_user_id
    and (
      s.status in ('active'::public.flowstate_subscription_status, 'trialing'::public.flowstate_subscription_status)
      or (
        s.status = 'cancelled'::public.flowstate_subscription_status
        and s.current_period_end is not null
        and s.current_period_end > now()
      )
    )
  order by case s.plan
    when 'lifetime'::public.flowstate_subscription_plan then 3
    when 'yearly'::public.flowstate_subscription_plan then 2
    when 'monthly'::public.flowstate_subscription_plan then 1
    else 0
  end desc,
  s.current_period_end desc nulls first
  limit 1;

  v_plan := coalesce(v_plan, 'free'::public.flowstate_subscription_plan);

  insert into public.flowstate_profiles (id, plan)
  values (p_user_id, v_plan)
  on conflict (id) do update
    set plan = excluded.plan,
        updated_at = now();

  return v_plan;
end;
$$;

revoke all on function public.flowstate_recompute_profile_plan(uuid) from public, anon, authenticated;
grant execute on function public.flowstate_recompute_profile_plan(uuid) to service_role;

comment on function public.flowstate_recompute_profile_plan(uuid) is
  'Server-only entitlement convergence across billing providers. Profiles.plan is derived from canonical subscription rows.';
