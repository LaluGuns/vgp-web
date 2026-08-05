begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema if not exists founder_internal;
comment on schema founder_internal is
    'Private Founder OS state. Never add this schema to PostgREST exposed schemas.';

revoke all privileges on schema founder_internal from public;

create table founder_internal.workspace_state (
    singleton boolean primary key default true,
    mode text not null default 'demo',
    demo_dataset_version text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint workspace_state_singleton check (singleton),
    constraint workspace_state_mode check (mode in ('demo', 'live'))
);

create table founder_internal.settings (
    settings_key text primary key default 'default',
    contract_version text not null,
    markets text[] not null,
    segment_priority text[] not null,
    score_threshold integer not null,
    require_approval_for_every_external_action boolean not null default true,
    allow_cold_social_dm boolean not null default false,
    allow_unverified_contacts boolean not null default false,
    trend_sources jsonb not null,
    integrations jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint settings_singleton check (settings_key = 'default'),
    constraint settings_markets_allowed check (
        cardinality(markets) between 1 and 3
        and markets <@ array['en-US', 'ja-JP', 'de-DE']::text[]
    ),
    constraint settings_segments_allowed check (
        cardinality(segment_priority) between 1 and 3
        and segment_priority <@ array['rapper', 'game-developer', 'content-creator']::text[]
    ),
    constraint settings_score_threshold check (score_threshold between 0 and 100),
    constraint settings_external_approval_locked check (require_approval_for_every_external_action),
    constraint settings_cold_social_dm_locked check (not allow_cold_social_dm),
    constraint settings_unverified_contacts_locked check (not allow_unverified_contacts),
    constraint settings_trend_sources_shape check (
        jsonb_typeof(trend_sources) = 'object'
        and trend_sources ?& array[
            'ownedAnalytics',
            'officialPlatformApis',
            'manualResearch',
            'scraping'
        ]::text[]
        and trend_sources - array[
            'ownedAnalytics',
            'officialPlatformApis',
            'manualResearch',
            'scraping'
        ]::text[] = '{}'::jsonb
        and jsonb_typeof(trend_sources -> 'ownedAnalytics') = 'boolean'
        and jsonb_typeof(trend_sources -> 'officialPlatformApis') = 'boolean'
        and jsonb_typeof(trend_sources -> 'manualResearch') = 'boolean'
        and trend_sources -> 'scraping' = 'false'::jsonb
    ),
    constraint settings_integrations_shape check (
        jsonb_typeof(integrations) = 'object'
        and integrations - array[
            'meta',
            'tiktok',
            'hostinger-email',
            'cloudflare-agent'
        ]::text[] = '{}'::jsonb
        and integrations ?& array['meta', 'tiktok', 'hostinger-email', 'cloudflare-agent']::text[]
        and integrations ->> 'meta' in ('connected', 'configured', 'not-connected', 'error')
        and integrations ->> 'tiktok' in ('connected', 'configured', 'not-connected', 'error')
        and integrations ->> 'hostinger-email' in ('connected', 'configured', 'not-connected', 'error')
        and integrations ->> 'cloudflare-agent' in ('connected', 'configured', 'not-connected', 'error')
    )
);

create table founder_internal.agent_cards (
    id text primary key,
    name text not null,
    role text not null,
    status text not null,
    current_task text not null,
    last_run_at timestamptz,
    evidence_count integer not null default 0,
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint agent_cards_id check (
        id in (
            'chief-of-staff',
            'lead-scout',
            'growth-analyst',
            'content-strategist',
            'outreach-operator'
        )
    ),
    constraint agent_cards_status check (
        status in ('idle', 'working', 'waiting-for-approval', 'blocked')
    ),
    constraint agent_cards_evidence_count check (evidence_count >= 0),
    constraint agent_cards_text_lengths check (
        char_length(name) between 1 and 160
        and char_length(role) between 1 and 2000
        and char_length(current_task) between 1 and 2000
    )
);

create table founder_internal.source_evidence (
    id text primary key,
    label text not null,
    url text,
    source_type text not null,
    observed_at timestamptz,
    freshness text not null,
    note text,
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint source_evidence_source_type check (
        source_type in ('owned-data', 'official-api', 'manual-research', 'repository', 'founder-input')
    ),
    constraint source_evidence_freshness check (freshness in ('fresh', 'stale', 'unknown')),
    constraint source_evidence_lengths check (
        char_length(id) between 1 and 160
        and char_length(label) between 1 and 500
        and (url is null or char_length(url) <= 2048)
        and (note is null or char_length(note) <= 10000)
    )
);

create table founder_internal.prospects (
    id text primary key,
    display_name text not null,
    handle text,
    segment text not null,
    market text not null,
    platform text not null,
    profile_url text,
    business_email text,
    contact_permission text not null,
    score integer not null,
    score_breakdown jsonb not null,
    matched_beat_ids text[] not null default '{}'::text[],
    signals text[] not null default '{}'::text[],
    gaps text[] not null default '{}'::text[],
    last_observed_at timestamptz,
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint prospects_segment check (segment in ('rapper', 'game-developer', 'content-creator')),
    constraint prospects_market check (market in ('en-US', 'ja-JP', 'de-DE')),
    constraint prospects_platform check (
        platform in ('instagram', 'tiktok', 'youtube', 'website', 'other')
    ),
    constraint prospects_contact_permission check (
        contact_permission in ('verified-opt-in', 'public-business-email', 'manual-only', 'blocked')
    ),
    constraint prospects_score check (score between 0 and 100),
    constraint prospects_score_breakdown check (
        jsonb_typeof(score_breakdown) = 'object'
        and score_breakdown ?& array[
            'audienceFit',
            'styleFit',
            'purchaseIntent',
            'contactability',
            'freshness'
        ]::text[]
        and jsonb_typeof(score_breakdown -> 'audienceFit') = 'number'
        and score_breakdown - array[
            'audienceFit',
            'styleFit',
            'purchaseIntent',
            'contactability',
            'freshness'
        ]::text[] = '{}'::jsonb
        and jsonb_typeof(score_breakdown -> 'styleFit') = 'number'
        and jsonb_typeof(score_breakdown -> 'purchaseIntent') = 'number'
        and jsonb_typeof(score_breakdown -> 'contactability') = 'number'
        and jsonb_typeof(score_breakdown -> 'freshness') = 'number'
    ),
    constraint prospects_lengths check (
        char_length(id) between 1 and 160
        and char_length(display_name) between 1 and 500
        and (handle is null or char_length(handle) <= 255)
        and (profile_url is null or char_length(profile_url) <= 2048)
        and (business_email is null or char_length(business_email) <= 320)
    )
);

create table founder_internal.prospect_evidence (
    prospect_id text not null references founder_internal.prospects(id) on delete cascade,
    evidence_id text not null references founder_internal.source_evidence(id) on delete restrict,
    position integer not null default 0,
    created_at timestamptz not null default now(),
    primary key (prospect_id, evidence_id),
    constraint prospect_evidence_position check (position >= 0)
);

create table founder_internal.approval_actions (
    id text primary key,
    prospect_id text references founder_internal.prospects(id) on delete set null,
    action_type text not null,
    channel text not null,
    status text not null default 'DRAFT',
    target_label text not null,
    payload_summary text not null,
    payload jsonb not null,
    content_hash text generated always as (
        'sha256:' || encode(
            extensions.digest(payload::text, 'sha256'),
            'hex'
        )
    ) stored,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    approved_at timestamptz,
    executed_at timestamptz,
    provider_reference text,
    failure_reason text,
    is_demo boolean not null default false,
    constraint approval_actions_action_type check (
        action_type in ('outreach-send', 'social-reply', 'social-publish', 'settings-change')
    ),
    constraint approval_actions_channel check (
        channel in ('email', 'instagram', 'tiktok', 'internal')
    ),
    constraint approval_actions_internal_channel check (
        (action_type = 'settings-change' and channel = 'internal')
        or (action_type <> 'settings-change' and channel <> 'internal')
    ),
    constraint approval_actions_status check (
        status in (
            'DRAFT',
            'READY_FOR_APPROVAL',
            'APPROVED',
            'EXECUTING',
            'SUCCEEDED',
            'FAILED',
            'UNKNOWN'
        )
    ),
    constraint approval_actions_payload_object check (jsonb_typeof(payload) = 'object'),
    constraint approval_actions_lengths check (
        char_length(id) between 1 and 160
        and char_length(target_label) between 1 and 1000
        and char_length(payload_summary) between 1 and 10000
        and (provider_reference is null or char_length(provider_reference) <= 2000)
        and (failure_reason is null or char_length(failure_reason) <= 10000)
    ),
    constraint approval_actions_lifecycle_timestamps check (
        (
            status in ('DRAFT', 'READY_FOR_APPROVAL')
            and approved_at is null
            and executed_at is null
            and provider_reference is null
            and failure_reason is null
        )
        or (
            status in ('APPROVED', 'EXECUTING')
            and approved_at is not null
            and executed_at is null
            and provider_reference is null
            and failure_reason is null
        )
        or (
            status in ('SUCCEEDED', 'FAILED', 'UNKNOWN')
            and approved_at is not null
            and executed_at is not null
        )
    ),
    constraint approval_actions_success_reference check (
        status <> 'SUCCEEDED' or provider_reference is not null
    ),
    constraint approval_actions_failure_reason check (
        status not in ('FAILED', 'UNKNOWN') or failure_reason is not null
    )
);

create table founder_internal.outbox (
    id bigint generated always as identity primary key,
    approval_id text not null references founder_internal.approval_actions(id) on delete restrict,
    idempotency_key text not null unique,
    event_type text not null default 'approval.authorized',
    channel text not null,
    payload jsonb not null,
    content_hash text not null,
    status text not null default 'held',
    attempt_count integer not null default 0,
    available_at timestamptz,
    locked_at timestamptz,
    completed_at timestamptz,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint outbox_event_type check (event_type = 'approval.authorized'),
    constraint outbox_channel check (channel in ('email', 'instagram', 'tiktok', 'internal')),
    constraint outbox_payload_object check (jsonb_typeof(payload) = 'object'),
    constraint outbox_content_hash check (content_hash ~ '^sha256:[0-9a-f]{64}$'),
    constraint outbox_status check (
        status in ('held', 'processing', 'succeeded', 'failed', 'unknown', 'superseded')
    ),
    constraint outbox_attempt_count check (attempt_count >= 0),
    constraint outbox_lengths check (
        char_length(idempotency_key) between 1 and 500
        and (last_error is null or char_length(last_error) <= 10000)
    ),
    unique (approval_id, content_hash, event_type)
);

create table founder_internal.data_gaps (
    id text primary key,
    description text not null,
    position integer not null default 0,
    is_demo boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint data_gaps_position check (position >= 0),
    constraint data_gaps_lengths check (
        char_length(id) between 1 and 160
        and char_length(description) between 1 and 5000
    )
);

create table founder_internal.demo_bootstrap_runs (
    dataset_version text primary key,
    seed_hash text not null,
    record_counts jsonb not null,
    bootstrapped_at timestamptz not null default now(),
    constraint demo_bootstrap_seed_hash check (seed_hash ~ '^sha256:[0-9a-f]{64}$'),
    constraint demo_bootstrap_counts_object check (jsonb_typeof(record_counts) = 'object')
);

create table founder_internal.audit_log (
    id bigint generated always as identity primary key,
    actor_type text not null,
    actor_id text,
    action text not null,
    entity_type text not null,
    entity_id text,
    request_id text not null,
    before_state jsonb,
    after_state jsonb,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint audit_log_actor_type check (actor_type in ('founder', 'system', 'bootstrap')),
    constraint audit_log_metadata_object check (jsonb_typeof(metadata) = 'object'),
    constraint audit_log_lengths check (
        char_length(action) between 1 and 255
        and char_length(entity_type) between 1 and 160
        and char_length(request_id) between 1 and 255
        and (actor_id is null or char_length(actor_id) <= 255)
        and (entity_id is null or char_length(entity_id) <= 255)
    )
);

create index prospects_rank_idx
    on founder_internal.prospects (score desc, last_observed_at desc nulls last);
create index prospects_segment_market_idx
    on founder_internal.prospects (segment, market, score desc);
create index source_evidence_observed_idx
    on founder_internal.source_evidence (observed_at desc nulls last);
create index approval_actions_status_idx
    on founder_internal.approval_actions (status, updated_at desc);
create index outbox_dispatch_idx
    on founder_internal.outbox (status, available_at, id)
    where status in ('held', 'failed');
create index audit_log_entity_idx
    on founder_internal.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_created_idx
    on founder_internal.audit_log (created_at desc);

create or replace function founder_internal.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    new.updated_at := clock_timestamp();
    return new;
end;
$function$;

create or replace function founder_internal.guard_approval_transition()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.content_hash is distinct from new.content_hash then
        if old.status in ('EXECUTING', 'SUCCEEDED', 'FAILED', 'UNKNOWN') then
            raise exception using
                errcode = '23514',
                message = 'Approval payload is immutable after execution starts.';
        end if;

        if old.status <> 'DRAFT' and new.status <> 'DRAFT' then
            raise exception using
                errcode = '23514',
                message = 'Changed approval content must invalidate the action back to DRAFT.';
        end if;
    end if;

    if old.status is distinct from new.status then
        if not (
            (old.status = 'DRAFT' and new.status = 'READY_FOR_APPROVAL')
            or (old.status = 'READY_FOR_APPROVAL' and new.status = 'APPROVED')
            or (old.status = 'APPROVED' and new.status = 'EXECUTING')
            or (
                old.status = 'EXECUTING'
                and new.status in ('SUCCEEDED', 'FAILED', 'UNKNOWN')
            )
            or (
                old.status in ('READY_FOR_APPROVAL', 'APPROVED')
                and new.status = 'DRAFT'
                and old.content_hash is distinct from new.content_hash
            )
        ) then
            raise exception using
                errcode = '23514',
                message = format(
                    'Invalid approval transition from %s to %s.',
                    old.status,
                    new.status
                );
        end if;
    end if;

    return null;
end;
$function$;

create or replace function founder_internal.guard_outbox_update()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    if old.approval_id is distinct from new.approval_id
        or old.idempotency_key is distinct from new.idempotency_key
        or old.event_type is distinct from new.event_type
        or old.channel is distinct from new.channel
        or old.payload is distinct from new.payload
        or old.content_hash is distinct from new.content_hash
    then
        raise exception using
            errcode = '23514',
            message = 'Outbox identity and payload fields are immutable.';
    end if;

    if old.status is distinct from new.status and not (
        (old.status = 'held' and new.status in ('processing', 'superseded'))
        or (old.status = 'processing' and new.status in ('succeeded', 'failed', 'unknown'))
        or (old.status = 'failed' and new.status = 'processing')
    ) then
        raise exception using
            errcode = '23514',
            message = format('Invalid outbox transition from %s to %s.', old.status, new.status);
    end if;

    return null;
end;
$function$;

create or replace function founder_internal.protect_audit_log()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, founder_internal
as $function$
begin
    raise exception using
        errcode = '55000',
        message = 'Founder OS audit_log is append-only.';
end;
$function$;

create trigger workspace_state_touch_updated_at
before update on founder_internal.workspace_state
for each row execute function founder_internal.touch_updated_at();

create trigger settings_touch_updated_at
before update on founder_internal.settings
for each row execute function founder_internal.touch_updated_at();

create trigger agent_cards_touch_updated_at
before update on founder_internal.agent_cards
for each row execute function founder_internal.touch_updated_at();

create trigger source_evidence_touch_updated_at
before update on founder_internal.source_evidence
for each row execute function founder_internal.touch_updated_at();

create trigger prospects_touch_updated_at
before update on founder_internal.prospects
for each row execute function founder_internal.touch_updated_at();

create trigger approval_actions_touch_updated_at
before update on founder_internal.approval_actions
for each row execute function founder_internal.touch_updated_at();

create trigger approval_actions_guard_transition
after update of status, payload on founder_internal.approval_actions
for each row execute function founder_internal.guard_approval_transition();

create trigger outbox_touch_updated_at
before update on founder_internal.outbox
for each row execute function founder_internal.touch_updated_at();

create trigger outbox_guard_update
after update on founder_internal.outbox
for each row execute function founder_internal.guard_outbox_update();

create trigger data_gaps_touch_updated_at
before update on founder_internal.data_gaps
for each row execute function founder_internal.touch_updated_at();

create trigger audit_log_append_only
before update or delete on founder_internal.audit_log
for each row execute function founder_internal.protect_audit_log();

insert into founder_internal.workspace_state (singleton, mode)
values (true, 'demo')
on conflict (singleton) do nothing;

insert into founder_internal.settings (
    settings_key,
    contract_version,
    markets,
    segment_priority,
    score_threshold,
    require_approval_for_every_external_action,
    allow_cold_social_dm,
    allow_unverified_contacts,
    trend_sources,
    integrations
)
values (
    'default',
    '2026-07-29.1',
    array['en-US', 'ja-JP', 'de-DE']::text[],
    array['rapper', 'game-developer', 'content-creator']::text[],
    70,
    true,
    false,
    false,
    jsonb_build_object(
        'ownedAnalytics', true,
        'officialPlatformApis', true,
        'manualResearch', true,
        'scraping', false
    ),
    jsonb_build_object(
        'meta', 'not-connected',
        'tiktok', 'not-connected',
        'hostinger-email', 'configured',
        'cloudflare-agent', 'not-connected'
    )
)
on conflict (settings_key) do nothing;

alter table founder_internal.workspace_state enable row level security;
alter table founder_internal.settings enable row level security;
alter table founder_internal.agent_cards enable row level security;
alter table founder_internal.source_evidence enable row level security;
alter table founder_internal.prospects enable row level security;
alter table founder_internal.prospect_evidence enable row level security;
alter table founder_internal.approval_actions enable row level security;
alter table founder_internal.outbox enable row level security;
alter table founder_internal.data_gaps enable row level security;
alter table founder_internal.demo_bootstrap_runs enable row level security;
alter table founder_internal.audit_log enable row level security;

revoke all privileges on all tables in schema founder_internal from public;
revoke all privileges on all sequences in schema founder_internal from public;
revoke all privileges on all functions in schema founder_internal from public;

alter default privileges in schema founder_internal
    revoke all privileges on tables from public;
alter default privileges in schema founder_internal
    revoke all privileges on sequences from public;
alter default privileges in schema founder_internal
    revoke all privileges on functions from public;

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
            'revoke all privileges on schema founder_internal from %I',
            role_name
        );
        execute format(
            'revoke all privileges on all tables in schema founder_internal from %I',
            role_name
        );
        execute format(
            'revoke all privileges on all sequences in schema founder_internal from %I',
            role_name
        );
        execute format(
            'revoke all privileges on all functions in schema founder_internal from %I',
            role_name
        );
        execute format(
            'alter default privileges in schema founder_internal revoke all privileges on tables from %I',
            role_name
        );
        execute format(
            'alter default privileges in schema founder_internal revoke all privileges on sequences from %I',
            role_name
        );
        execute format(
            'alter default privileges in schema founder_internal revoke all privileges on functions from %I',
            role_name
        );
    end loop;

    if exists (select 1 from pg_roles where rolname = 'service_role') then
        grant usage on schema founder_internal to service_role;

        grant select, insert, update, delete
            on founder_internal.workspace_state,
               founder_internal.settings,
               founder_internal.agent_cards,
               founder_internal.source_evidence,
               founder_internal.prospects,
               founder_internal.prospect_evidence,
               founder_internal.approval_actions,
               founder_internal.outbox,
               founder_internal.data_gaps,
               founder_internal.demo_bootstrap_runs
            to service_role;

        grant select, insert
            on founder_internal.audit_log
            to service_role;

        grant usage, select
            on all sequences in schema founder_internal
            to service_role;

        grant execute
            on all functions in schema founder_internal
            to service_role;
    end if;
end;
$permissions$;

commit;
