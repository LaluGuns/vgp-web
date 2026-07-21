-- Creator license certificates are immutable track-specific receipts tied to a grant.
-- Browser clients may read only their own rows; only service_role may issue or revoke certificates.
create table public.flowstate_creator_license_certificates (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.flowstate_creator_license_grants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  track_id text not null,
  track_title text not null,
  track_artist text not null,
  track_genre text not null,
  catalog_version text not null,
  terms_version text not null,
  terms_document_version text not null,
  terms_document_sha256 text not null,
  licensee_name text not null,
  licensee_organization text,
  attribution_text text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text,
  constraint fs_creator_certs_terms_doc_version check (
    terms_document_version = terms_version
  ),
  constraint fs_creator_certs_terms_doc_sha256 check (
    terms_document_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint fs_creator_certs_revocation_pair check (
    (revoked_at is null and revocation_reason is null)
    or (revoked_at is not null and nullif(btrim(revocation_reason), '') is not null)
  )
);

alter table public.flowstate_creator_license_certificates enable row level security;

revoke all on table public.flowstate_creator_license_certificates
  from public, anon, authenticated, service_role;
grant select on table public.flowstate_creator_license_certificates to authenticated;
grant select, insert on table public.flowstate_creator_license_certificates to service_role;
grant update (revoked_at, revocation_reason)
  on table public.flowstate_creator_license_certificates to service_role;

create policy "fs_creator_certs_select_own"
  on public.flowstate_creator_license_certificates
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Idempotency: Exactly one certificate per grant and track_id
create unique index idx_fs_creator_certs_grant_track
  on public.flowstate_creator_license_certificates(grant_id, track_id);

create index idx_fs_creator_certs_user_issued
  on public.flowstate_creator_license_certificates(user_id, issued_at desc);

create index idx_fs_creator_certs_public_verify
  on public.flowstate_creator_license_certificates(id)
  include (
    grant_id,
    track_id,
    track_title,
    track_artist,
    track_genre,
    catalog_version,
    terms_version,
    terms_document_version,
    terms_document_sha256,
    issued_at,
    revoked_at
  );
