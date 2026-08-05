-- Pin search_path on flowstate functions (clears function_search_path_mutable lints).
create or replace function public.flowstate_is_premium(check_user_id uuid)
  returns boolean
  language plpgsql
  stable
  security definer
  set search_path = public, pg_temp
as $function$
begin
  return exists (
    select 1 from public.flowstate_subscriptions
    where user_id = check_user_id
      and status in ('active','trialing')
      and (plan = 'lifetime' or current_period_end > now())
  );
end; $function$;

create or replace function public.flowstate_update_updated_at()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $function$
begin new.updated_at = now(); return new; end; $function$;;
