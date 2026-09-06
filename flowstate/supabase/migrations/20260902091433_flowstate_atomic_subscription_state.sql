create or replace function public.flowstate_apply_subscription_state(
  p_user_id uuid,
  p_provider text,
  p_provider_subscription_id text,
  p_provider_customer_id text,
  p_status text,
  p_plan text,
  p_current_period_start timestamptz,
  p_current_period_end timestamptz,
  p_provider_updated_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_status public.flowstate_subscription_status;
  v_plan public.flowstate_subscription_plan;
  v_applied_id uuid;
  v_existing_user_id uuid;
  v_existing_provider text;
  v_existing_provider_updated_at timestamptz;
begin
  if p_user_id is null then raise exception 'user id is required' using errcode = '22023'; end if;
  if p_provider is null or length(trim(p_provider)) < 1 or length(p_provider) > 64 then raise exception 'provider is invalid' using errcode = '22023'; end if;
  if p_provider_subscription_id is null or length(trim(p_provider_subscription_id)) < 1 or length(p_provider_subscription_id) > 512 then raise exception 'provider subscription id is invalid' using errcode = '22023'; end if;
  if p_provider_updated_at is null then raise exception 'provider updated at is required' using errcode = '22023'; end if;

  begin
    v_status := p_status::public.flowstate_subscription_status;
    v_plan := p_plan::public.flowstate_subscription_plan;
  exception when invalid_text_representation then
    raise exception 'invalid subscription status or plan' using errcode = '22023';
  end;

  if v_plan = 'free'::public.flowstate_subscription_plan then raise exception 'free is not a persisted subscription plan' using errcode = '22023'; end if;

  insert into public.flowstate_subscriptions as s (
    user_id, provider, provider_subscription_id, provider_customer_id, status, plan,
    current_period_start, current_period_end, provider_updated_at, updated_at
  ) values (
    p_user_id, trim(p_provider), trim(p_provider_subscription_id), nullif(trim(coalesce(p_provider_customer_id, '')), ''),
    v_status, v_plan, p_current_period_start, p_current_period_end, p_provider_updated_at, clock_timestamp()
  )
  on conflict (provider_subscription_id) do update
  set provider_customer_id = excluded.provider_customer_id,
      status = excluded.status,
      plan = excluded.plan,
      current_period_start = excluded.current_period_start,
      current_period_end = excluded.current_period_end,
      provider_updated_at = excluded.provider_updated_at,
      updated_at = clock_timestamp()
  where s.user_id = excluded.user_id
    and s.provider = excluded.provider
    and (s.provider_updated_at is null or excluded.provider_updated_at > s.provider_updated_at)
  returning s.id into v_applied_id;

  if v_applied_id is not null then return 'applied'; end if;

  select s.user_id, s.provider, s.provider_updated_at
  into v_existing_user_id, v_existing_provider, v_existing_provider_updated_at
  from public.flowstate_subscriptions s
  where s.provider_subscription_id = trim(p_provider_subscription_id);

  if not found then return 'retry'; end if;
  if v_existing_user_id is distinct from p_user_id or v_existing_provider is distinct from trim(p_provider) then return 'owner_conflict'; end if;
  if v_existing_provider_updated_at is not null and p_provider_updated_at <= v_existing_provider_updated_at then return 'stale'; end if;
  return 'retry';
end;
$function$;

revoke all on function public.flowstate_apply_subscription_state(uuid, text, text, text, text, text, timestamptz, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.flowstate_apply_subscription_state(uuid, text, text, text, text, text, timestamptz, timestamptz, timestamptz) to service_role;
