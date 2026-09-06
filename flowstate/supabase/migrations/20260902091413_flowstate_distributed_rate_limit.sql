create table if not exists public.flowstate_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

alter table public.flowstate_rate_limits enable row level security;
revoke all on table public.flowstate_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.flowstate_rate_limits to service_role;

create or replace function public.flowstate_consume_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_ms integer
)
returns table (success boolean, limit_count integer, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
  v_window interval;
begin
  if p_bucket_key is null or length(p_bucket_key) < 16 or length(p_bucket_key) > 128 then
    raise exception 'invalid rate limit bucket key' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 100000 then
    raise exception 'invalid rate limit limit' using errcode = '22023';
  end if;
  if p_window_ms is null or p_window_ms < 1000 or p_window_ms > 86400000 then
    raise exception 'invalid rate limit window' using errcode = '22023';
  end if;

  v_window := p_window_ms * interval '1 millisecond';

  insert into public.flowstate_rate_limits as rl (bucket_key, window_started_at, request_count, updated_at)
  values (p_bucket_key, v_now, 1, v_now)
  on conflict (bucket_key) do update
  set
    window_started_at = case when rl.window_started_at + v_window <= v_now then v_now else rl.window_started_at end,
    request_count = case when rl.window_started_at + v_window <= v_now then 1 else rl.request_count + 1 end,
    updated_at = v_now
  returning rl.window_started_at, rl.request_count
  into v_window_started_at, v_request_count;

  success := v_request_count <= p_limit;
  limit_count := p_limit;
  remaining := greatest(0, p_limit - v_request_count);
  reset_at := v_window_started_at + v_window;

  if random() < 0.01 then
    delete from public.flowstate_rate_limits where updated_at < v_now - interval '2 days';
  end if;

  return next;
end;
$function$;

revoke all on function public.flowstate_consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.flowstate_consume_rate_limit(text, integer, integer) to service_role;
