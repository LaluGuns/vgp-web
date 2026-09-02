create index if not exists idx_flowstate_rate_limits_updated_at
  on public.flowstate_rate_limits (updated_at);

create or replace function public.flowstate_is_premium(check_user_id uuid)
returns boolean
language sql
stable
security invoker
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

revoke all on function public.flowstate_is_premium(uuid) from public, anon;
grant execute on function public.flowstate_is_premium(uuid) to authenticated, service_role;
