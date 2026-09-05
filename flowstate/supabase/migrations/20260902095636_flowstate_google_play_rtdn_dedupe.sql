create table if not exists public.flowstate_google_play_rtdn_messages (
  message_id text primary key,
  kind text not null,
  status text not null default 'processing',
  attempt_count integer not null default 1,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lease_until timestamptz,
  processed_at timestamptz,
  last_error text,
  constraint flowstate_google_play_rtdn_message_id_len check (length(message_id) between 1 and 256),
  constraint flowstate_google_play_rtdn_kind_len check (length(kind) between 1 and 64),
  constraint flowstate_google_play_rtdn_status_check check (status in ('processing','processed','error')),
  constraint flowstate_google_play_rtdn_error_len check (last_error is null or length(last_error) <= 500)
);

alter table public.flowstate_google_play_rtdn_messages enable row level security;
revoke all on table public.flowstate_google_play_rtdn_messages from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.flowstate_google_play_rtdn_messages to service_role;

create index if not exists idx_flowstate_google_play_rtdn_cleanup
  on public.flowstate_google_play_rtdn_messages (updated_at);

create or replace function public.flowstate_claim_google_play_rtdn(
  p_message_id text,
  p_kind text,
  p_lease_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_claimed text;
  v_now timestamptz := clock_timestamp();
begin
  if p_message_id is null or length(trim(p_message_id)) < 1 or length(p_message_id) > 256 then
    raise exception 'invalid RTDN message id' using errcode = '22023';
  end if;
  if p_kind is null or length(trim(p_kind)) < 1 or length(p_kind) > 64 then
    raise exception 'invalid RTDN kind' using errcode = '22023';
  end if;
  if p_lease_seconds < 15 or p_lease_seconds > 300 then
    raise exception 'invalid RTDN lease' using errcode = '22023';
  end if;

  insert into public.flowstate_google_play_rtdn_messages as m (
    message_id, kind, status, attempt_count, received_at, updated_at, lease_until
  ) values (
    trim(p_message_id), trim(p_kind), 'processing', 1, v_now, v_now,
    v_now + make_interval(secs => p_lease_seconds)
  )
  on conflict (message_id) do update
  set kind = excluded.kind,
      status = 'processing',
      attempt_count = m.attempt_count + 1,
      updated_at = v_now,
      lease_until = v_now + make_interval(secs => p_lease_seconds),
      last_error = null
  where m.status = 'error'
     or (m.status = 'processing' and coalesce(m.lease_until, '-infinity'::timestamptz) <= v_now)
  returning message_id into v_claimed;

  return v_claimed is not null;
end;
$function$;

revoke all on function public.flowstate_claim_google_play_rtdn(text,text,integer) from public, anon, authenticated;
grant execute on function public.flowstate_claim_google_play_rtdn(text,text,integer) to service_role;
