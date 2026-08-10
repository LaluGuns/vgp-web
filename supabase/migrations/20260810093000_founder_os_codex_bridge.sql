begin;

create table founder_internal.bridge_rate_limits (
    principal_id text not null,
    rate_class text not null,
    window_start timestamptz not null,
    request_count integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (principal_id, rate_class, window_start),
    constraint bridge_rate_limits_principal_length check (
        char_length(principal_id) between 1 and 160
    ),
    constraint bridge_rate_limits_class check (
        rate_class in ('read', 'draft', 'request-review')
    ),
    constraint bridge_rate_limits_window check (
        window_start = date_trunc('minute', window_start)
    ),
    constraint bridge_rate_limits_count check (
        request_count between 1 and 100000
    )
);

comment on table founder_internal.bridge_rate_limits is
    'Persistent fixed-window safety limiter for authenticated Founder OS Bridge principals. Contains no bearer secrets or request bodies.';

create index bridge_rate_limits_cleanup_idx
    on founder_internal.bridge_rate_limits (window_start);

alter table founder_internal.bridge_rate_limits enable row level security;

revoke all privileges
    on founder_internal.bridge_rate_limits
    from public;

do $permissions$
declare
    role_name text;
begin
    for role_name in
        select rolname
        from pg_roles
        where rolname in ('anon', 'authenticated', 'service_role')
    loop
        execute format(
            'revoke all privileges on table founder_internal.bridge_rate_limits from %I',
            role_name
        );
    end loop;

    if exists (select 1 from pg_roles where rolname = 'service_role') then
        grant select, insert, update, delete
            on founder_internal.bridge_rate_limits
            to service_role;
    end if;
end;
$permissions$;

commit;
