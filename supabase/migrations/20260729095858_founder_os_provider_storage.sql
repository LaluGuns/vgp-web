begin;

create table founder_internal.provider_connections (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    provider_account_id text not null,
    display_name text not null,
    username text,
    account_type text,
    profile_url text,
    status text not null default 'pending',
    metadata jsonb not null default '{}'::jsonb,
    connected_at timestamptz,
    last_verified_at timestamptz,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_connections_provider check (provider in ('meta', 'tiktok')),
    constraint provider_connections_status check (
        status in (
            'pending',
            'connected',
            'refresh_required',
            'revoked',
            'error',
            'not_connected'
        )
    ),
    constraint provider_connections_metadata_object check (
        jsonb_typeof(metadata) = 'object'
    ),
    constraint provider_connections_lengths check (
        char_length(provider_account_id) between 1 and 500
        and char_length(display_name) between 1 and 500
        and (username is null or char_length(username) <= 500)
        and (account_type is null or char_length(account_type) <= 160)
        and (profile_url is null or char_length(profile_url) <= 2048)
        and (last_error is null or char_length(last_error) <= 10000)
    ),
    unique (provider, provider_account_id)
);

create table founder_internal.provider_grants (
    id uuid primary key default gen_random_uuid(),
    connection_id uuid not null
        references founder_internal.provider_connections(id) on delete cascade,
    grant_type text not null,
    grant_name text not null,
    status text not null,
    granted_at timestamptz,
    expires_at timestamptz,
    last_verified_at timestamptz,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_grants_type check (grant_type in ('scope', 'capability')),
    constraint provider_grants_status check (
        status in ('granted', 'declined', 'expired', 'revoked', 'unknown')
    ),
    constraint provider_grants_metadata_object check (jsonb_typeof(metadata) = 'object'),
    constraint provider_grants_name_length check (
        char_length(grant_name) between 1 and 500
    ),
    unique (connection_id, grant_type, grant_name)
);

create table founder_internal.provider_credentials (
    connection_id uuid primary key
        references founder_internal.provider_connections(id) on delete cascade,
    encryption_algorithm text not null default 'aes-256-gcm',
    encryption_version integer not null default 1,
    key_version integer not null,
    access_token_ciphertext bytea not null,
    access_token_iv bytea not null,
    access_token_auth_tag bytea not null,
    refresh_token_ciphertext bytea,
    refresh_token_iv bytea,
    refresh_token_auth_tag bytea,
    token_type text,
    access_token_expires_at timestamptz,
    refresh_token_expires_at timestamptz,
    issued_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_credentials_algorithm check (
        encryption_algorithm = 'aes-256-gcm'
    ),
    constraint provider_credentials_version check (
        encryption_version = 1 and key_version > 0
    ),
    constraint provider_credentials_access_envelope check (
        octet_length(access_token_iv) = 12
        and octet_length(access_token_auth_tag) = 16
        and octet_length(access_token_ciphertext) > 0
    ),
    constraint provider_credentials_refresh_envelope check (
        (
            refresh_token_ciphertext is null
            and refresh_token_iv is null
            and refresh_token_auth_tag is null
        )
        or (
            refresh_token_ciphertext is not null
            and refresh_token_iv is not null
            and refresh_token_auth_tag is not null
            and octet_length(refresh_token_iv) = 12
            and octet_length(refresh_token_auth_tag) = 16
            and octet_length(refresh_token_ciphertext) > 0
        )
    ),
    constraint provider_credentials_token_type_length check (
        token_type is null or char_length(token_type) <= 160
    )
);

create table founder_internal.provider_oauth_states (
    state_hash bytea primary key,
    provider text not null,
    code_verifier_ciphertext bytea not null,
    code_verifier_iv bytea not null,
    code_verifier_auth_tag bytea not null,
    encryption_version integer not null default 1,
    key_version integer not null,
    nonce_hash bytea,
    request_binding_hash bytea,
    redirect_uri text not null,
    return_to text,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null,
    consumed_at timestamptz,
    constraint provider_oauth_states_provider check (provider in ('meta', 'tiktok')),
    constraint provider_oauth_states_hashes check (
        octet_length(state_hash) = 32
        and (nonce_hash is null or octet_length(nonce_hash) = 32)
        and (
            request_binding_hash is null
            or octet_length(request_binding_hash) = 32
        )
    ),
    constraint provider_oauth_states_envelope check (
        encryption_version = 1
        and key_version > 0
        and octet_length(code_verifier_iv) = 12
        and octet_length(code_verifier_auth_tag) = 16
        and octet_length(code_verifier_ciphertext) > 0
    ),
    constraint provider_oauth_states_lifetime check (
        expires_at > created_at
        and expires_at <= created_at + interval '15 minutes'
        and (consumed_at is null or consumed_at >= created_at)
    ),
    constraint provider_oauth_states_lengths check (
        char_length(redirect_uri) between 1 and 2048
        and (return_to is null or char_length(return_to) <= 2048)
    )
);

create table founder_internal.provider_webhook_events (
    id uuid primary key default gen_random_uuid(),
    connection_id uuid
        references founder_internal.provider_connections(id) on delete set null,
    provider text not null,
    provider_event_id text not null,
    event_type text not null,
    payload_hash bytea not null,
    status text not null default 'received',
    signature_verified_at timestamptz not null,
    received_at timestamptz not null default now(),
    processing_started_at timestamptz,
    processed_at timestamptz,
    attempt_count integer not null default 0,
    failure_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_webhook_events_provider check (provider in ('meta', 'tiktok')),
    constraint provider_webhook_events_status check (
        status in ('received', 'processing', 'processed', 'failed', 'unknown')
    ),
    constraint provider_webhook_events_hash check (octet_length(payload_hash) = 32),
    constraint provider_webhook_events_attempts check (attempt_count >= 0),
    constraint provider_webhook_events_lengths check (
        char_length(provider_event_id) between 1 and 1000
        and char_length(event_type) between 1 and 500
        and (failure_reason is null or char_length(failure_reason) <= 10000)
    ),
    unique (provider, provider_event_id)
);

create table founder_internal.provider_inbound_events (
    id uuid primary key default gen_random_uuid(),
    webhook_event_id uuid not null unique
        references founder_internal.provider_webhook_events(id) on delete restrict,
    connection_id uuid not null
        references founder_internal.provider_connections(id) on delete restrict,
    provider text not null,
    provider_event_id text not null,
    recipient_scoped_id text not null,
    inbound_at timestamptz not null,
    reply_window_expires_at timestamptz not null,
    claimed_at timestamptz,
    claimed_approval_id text
        references founder_internal.approval_actions(id) on delete restrict,
    created_at timestamptz not null default now(),
    constraint provider_inbound_events_provider check (provider in ('meta', 'tiktok')),
    constraint provider_inbound_events_window check (
        reply_window_expires_at = inbound_at + interval '24 hours'
    ),
    constraint provider_inbound_events_claim check (
        (
            claimed_at is null
            and claimed_approval_id is null
        )
        or (
            claimed_at is not null
            and claimed_approval_id is not null
        )
    ),
    constraint provider_inbound_events_lengths check (
        char_length(provider_event_id) between 1 and 1000
        and char_length(recipient_scoped_id) between 1 and 1000
    ),
    unique (provider, provider_event_id)
);

create table founder_internal.provider_jobs (
    id uuid primary key default gen_random_uuid(),
    provider text not null,
    connection_id uuid not null
        references founder_internal.provider_connections(id) on delete restrict,
    job_type text not null,
    approval_id text
        references founder_internal.approval_actions(id) on delete restrict,
    approval_content_hash text,
    inbound_event_id uuid
        references founder_internal.provider_inbound_events(id) on delete restrict,
    reconciliation_of_job_id uuid
        references founder_internal.provider_jobs(id) on delete restrict,
    idempotency_key text not null unique,
    request_payload jsonb not null default '{}'::jsonb,
    request_hash bytea not null,
    status text not null default 'PENDING',
    worker_id text,
    attempt_count integer not null default 0,
    max_attempts integer not null default 3,
    next_attempt_at timestamptz,
    locked_at timestamptz,
    completed_at timestamptz,
    remote_reference text,
    outcome jsonb,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_jobs_provider check (provider in ('meta', 'tiktok')),
    constraint provider_jobs_type check (
        job_type in (
            'token_refresh',
            'account_sync',
            'insights_sync',
            'content_publish',
            'social_reply',
            'reconcile_unknown'
        )
    ),
    constraint provider_jobs_status check (
        status in (
            'PENDING',
            'RUNNING',
            'SUCCEEDED',
            'FAILED',
            'UNKNOWN',
            'CANCELLED'
        )
    ),
    constraint provider_jobs_payload_object check (
        jsonb_typeof(request_payload) = 'object'
        and (outcome is null or jsonb_typeof(outcome) = 'object')
    ),
    constraint provider_jobs_hash check (octet_length(request_hash) = 32),
    constraint provider_jobs_attempts check (
        attempt_count >= 0
        and max_attempts between 1 and 10
        and attempt_count <= max_attempts
    ),
    constraint provider_jobs_lifecycle check (
        (
            status = 'PENDING'
            and worker_id is null
            and locked_at is null
            and completed_at is null
        )
        or (
            status = 'RUNNING'
            and worker_id is not null
            and locked_at is not null
            and completed_at is null
        )
        or (
            status in ('SUCCEEDED', 'FAILED', 'UNKNOWN', 'CANCELLED')
            and locked_at is null
            and completed_at is not null
        )
    ),
    constraint provider_jobs_outcome check (
        (
            status = 'SUCCEEDED'
            and remote_reference is not null
            and last_error is null
        )
        or (
            status in ('FAILED', 'UNKNOWN')
            and remote_reference is null
            and last_error is not null
        )
        or status in ('PENDING', 'RUNNING', 'CANCELLED')
    ),
    constraint provider_jobs_external_approval check (
        (
            job_type in ('content_publish', 'social_reply')
            and approval_id is not null
            and approval_content_hash ~ '^sha256:[0-9a-f]{64}$'
        )
        or (
            job_type not in ('content_publish', 'social_reply')
            and approval_id is null
            and approval_content_hash is null
        )
    ),
    constraint provider_jobs_inbound_reply check (
        (job_type = 'social_reply' and inbound_event_id is not null)
        or (job_type <> 'social_reply' and inbound_event_id is null)
    ),
    constraint provider_jobs_reconciliation_source check (
        (
            job_type = 'reconcile_unknown'
            and reconciliation_of_job_id is not null
        )
        or (
            job_type <> 'reconcile_unknown'
            and reconciliation_of_job_id is null
        )
    ),
    constraint provider_jobs_lengths check (
        char_length(idempotency_key) between 1 and 500
        and (worker_id is null or char_length(worker_id) <= 255)
        and (remote_reference is null or char_length(remote_reference) <= 2000)
        and (last_error is null or char_length(last_error) <= 10000)
    )
);

create table founder_internal.provider_reconciliations (
    id uuid primary key default gen_random_uuid(),
    job_id uuid not null unique
        references founder_internal.provider_jobs(id) on delete restrict,
    status text not null default 'OPEN',
    attempt_count integer not null default 0,
    next_check_at timestamptz,
    evidence jsonb not null default '{}'::jsonb,
    resolution_note text,
    resolved_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint provider_reconciliations_status check (
        status in (
            'OPEN',
            'CHECKING',
            'CONFIRMED_SUCCEEDED',
            'CONFIRMED_FAILED',
            'MANUAL_REVIEW'
        )
    ),
    constraint provider_reconciliations_attempts check (attempt_count >= 0),
    constraint provider_reconciliations_evidence_object check (
        jsonb_typeof(evidence) = 'object'
    ),
    constraint provider_reconciliations_resolution check (
        (
            status in ('OPEN', 'CHECKING', 'MANUAL_REVIEW')
            and resolved_at is null
        )
        or (
            status in ('CONFIRMED_SUCCEEDED', 'CONFIRMED_FAILED')
            and resolved_at is not null
        )
    ),
    constraint provider_reconciliations_note_length check (
        resolution_note is null or char_length(resolution_note) <= 10000
    )
);

create index provider_connections_status_idx
    on founder_internal.provider_connections (provider, status, updated_at desc);
create index provider_grants_connection_idx
    on founder_internal.provider_grants (connection_id, grant_type, status);
create index provider_oauth_states_expiry_idx
    on founder_internal.provider_oauth_states (expires_at)
    where consumed_at is null;
create index provider_webhook_dispatch_idx
    on founder_internal.provider_webhook_events (status, received_at, id)
    where status in ('received', 'failed');
create index provider_inbound_eligibility_idx
    on founder_internal.provider_inbound_events (
        provider,
        recipient_scoped_id,
        reply_window_expires_at
    )
    where claimed_at is null;
create index provider_jobs_dispatch_idx
    on founder_internal.provider_jobs (next_attempt_at, created_at, id)
    where status = 'PENDING';
create index provider_jobs_stale_execution_idx
    on founder_internal.provider_jobs (locked_at, id)
    where
        status = 'RUNNING'
        and job_type in ('content_publish', 'social_reply');
create index provider_jobs_approval_idx
    on founder_internal.provider_jobs (approval_id, approval_content_hash);
create index provider_reconciliation_queue_idx
    on founder_internal.provider_reconciliations (status, next_check_at, id)
    where status in ('OPEN', 'CHECKING');

create or replace function founder_internal.guard_provider_job_transition()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.provider is distinct from new.provider
        or old.connection_id is distinct from new.connection_id
        or old.job_type is distinct from new.job_type
        or old.approval_id is distinct from new.approval_id
        or old.approval_content_hash is distinct from new.approval_content_hash
        or old.inbound_event_id is distinct from new.inbound_event_id
        or old.reconciliation_of_job_id is distinct from new.reconciliation_of_job_id
        or old.idempotency_key is distinct from new.idempotency_key
        or old.request_payload is distinct from new.request_payload
        or old.request_hash is distinct from new.request_hash
    then
        raise exception using
            errcode = '23514',
            message = 'Provider job identity, approval, and request payload are immutable.';
    end if;

    if old.status is distinct from new.status and not (
        (old.status = 'PENDING' and new.status in ('RUNNING', 'CANCELLED'))
        or (
            old.status = 'RUNNING'
            and new.status in ('SUCCEEDED', 'FAILED', 'UNKNOWN')
        )
        or (old.status = 'FAILED' and new.status = 'PENDING')
    ) then
        raise exception using
            errcode = '23514',
            message = format(
                'Invalid provider job transition from %s to %s.',
                old.status,
                new.status
            );
    end if;

    return null;
end;
$function$;

create or replace function founder_internal.guard_provider_webhook_transition()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.provider is distinct from new.provider
        or old.provider_event_id is distinct from new.provider_event_id
        or old.payload_hash is distinct from new.payload_hash
        or old.signature_verified_at is distinct from new.signature_verified_at
    then
        raise exception using
            errcode = '23514',
            message = 'Verified webhook identity fields are immutable.';
    end if;

    if old.status is distinct from new.status and not (
        (old.status = 'received' and new.status = 'processing')
        or (
            old.status = 'processing'
            and new.status in ('processed', 'failed', 'unknown')
        )
        or (old.status = 'failed' and new.status = 'processing')
    ) then
        raise exception using
            errcode = '23514',
            message = format(
                'Invalid provider webhook transition from %s to %s.',
                old.status,
                new.status
            );
    end if;

    return null;
end;
$function$;

create or replace function founder_internal.guard_provider_inbound_claim()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.webhook_event_id is distinct from new.webhook_event_id
        or old.connection_id is distinct from new.connection_id
        or old.provider is distinct from new.provider
        or old.provider_event_id is distinct from new.provider_event_id
        or old.recipient_scoped_id is distinct from new.recipient_scoped_id
        or old.inbound_at is distinct from new.inbound_at
        or old.reply_window_expires_at is distinct from new.reply_window_expires_at
    then
        raise exception using
            errcode = '23514',
            message = 'Inbound event identity and reply window are immutable.';
    end if;

    if old.claimed_at is not null and (
        old.claimed_at is distinct from new.claimed_at
        or old.claimed_approval_id is distinct from new.claimed_approval_id
    ) then
        raise exception using
            errcode = '23514',
            message = 'Inbound reply eligibility can only be claimed once.';
    end if;

    return null;
end;
$function$;

create or replace function founder_internal.guard_provider_reconciliation_transition()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.job_id is distinct from new.job_id then
        raise exception using
            errcode = '23514',
            message = 'Reconciliation job identity is immutable.';
    end if;

    if old.status is distinct from new.status and not (
        (old.status = 'OPEN' and new.status in ('CHECKING', 'MANUAL_REVIEW'))
        or (
            old.status = 'CHECKING'
            and new.status in (
                'OPEN',
                'CONFIRMED_SUCCEEDED',
                'CONFIRMED_FAILED',
                'MANUAL_REVIEW'
            )
        )
        or (
            old.status = 'MANUAL_REVIEW'
            and new.status in ('CONFIRMED_SUCCEEDED', 'CONFIRMED_FAILED')
        )
    ) then
        raise exception using
            errcode = '23514',
            message = format(
                'Invalid provider reconciliation transition from %s to %s.',
                old.status,
                new.status
            );
    end if;

    return null;
end;
$function$;

create trigger provider_connections_touch_updated_at
before update on founder_internal.provider_connections
for each row execute function founder_internal.touch_updated_at();

create trigger provider_grants_touch_updated_at
before update on founder_internal.provider_grants
for each row execute function founder_internal.touch_updated_at();

create trigger provider_credentials_touch_updated_at
before update on founder_internal.provider_credentials
for each row execute function founder_internal.touch_updated_at();

create trigger provider_webhook_events_touch_updated_at
before update on founder_internal.provider_webhook_events
for each row execute function founder_internal.touch_updated_at();

create trigger provider_webhook_events_guard_transition
after update on founder_internal.provider_webhook_events
for each row execute function founder_internal.guard_provider_webhook_transition();

create trigger provider_inbound_events_guard_claim
after update on founder_internal.provider_inbound_events
for each row execute function founder_internal.guard_provider_inbound_claim();

create trigger provider_jobs_touch_updated_at
before update on founder_internal.provider_jobs
for each row execute function founder_internal.touch_updated_at();

create trigger provider_jobs_guard_transition
after update on founder_internal.provider_jobs
for each row execute function founder_internal.guard_provider_job_transition();

create trigger provider_reconciliations_touch_updated_at
before update on founder_internal.provider_reconciliations
for each row execute function founder_internal.touch_updated_at();

create trigger provider_reconciliations_guard_transition
after update on founder_internal.provider_reconciliations
for each row execute function founder_internal.guard_provider_reconciliation_transition();

alter table founder_internal.provider_connections enable row level security;
alter table founder_internal.provider_grants enable row level security;
alter table founder_internal.provider_credentials enable row level security;
alter table founder_internal.provider_oauth_states enable row level security;
alter table founder_internal.provider_webhook_events enable row level security;
alter table founder_internal.provider_inbound_events enable row level security;
alter table founder_internal.provider_jobs enable row level security;
alter table founder_internal.provider_reconciliations enable row level security;

revoke all privileges
    on founder_internal.provider_connections,
       founder_internal.provider_grants,
       founder_internal.provider_credentials,
       founder_internal.provider_oauth_states,
       founder_internal.provider_webhook_events,
       founder_internal.provider_inbound_events,
       founder_internal.provider_jobs,
       founder_internal.provider_reconciliations
    from public;

revoke all privileges
    on function founder_internal.guard_provider_job_transition(),
                founder_internal.guard_provider_webhook_transition(),
                founder_internal.guard_provider_inbound_claim(),
                founder_internal.guard_provider_reconciliation_transition()
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
            'revoke all privileges on table founder_internal.provider_connections, founder_internal.provider_grants, founder_internal.provider_credentials, founder_internal.provider_oauth_states, founder_internal.provider_webhook_events, founder_internal.provider_inbound_events, founder_internal.provider_jobs, founder_internal.provider_reconciliations from %I',
            role_name
        );
        execute format(
            'revoke all privileges on function founder_internal.guard_provider_job_transition(), founder_internal.guard_provider_webhook_transition(), founder_internal.guard_provider_inbound_claim(), founder_internal.guard_provider_reconciliation_transition() from %I',
            role_name
        );
    end loop;

    if exists (select 1 from pg_roles where rolname = 'service_role') then
        grant usage on schema founder_internal to service_role;
        grant select, insert, update, delete
            on founder_internal.provider_connections,
               founder_internal.provider_grants,
               founder_internal.provider_credentials,
               founder_internal.provider_oauth_states,
               founder_internal.provider_webhook_events,
               founder_internal.provider_inbound_events,
               founder_internal.provider_jobs,
               founder_internal.provider_reconciliations
            to service_role;
        grant execute
            on function founder_internal.guard_provider_job_transition(),
                        founder_internal.guard_provider_webhook_transition(),
                        founder_internal.guard_provider_inbound_claim(),
                        founder_internal.guard_provider_reconciliation_transition()
            to service_role;
    end if;
end;
$permissions$;

commit;
