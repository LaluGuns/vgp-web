-- Non-destructive catalog identity annotations for new grants and certificates.
-- Historical rows remain immutable: nullable fields are only populated for new v2
-- records and external DSP identity is never inferred by this migration.
alter table public.flowstate_creator_license_grants
  add column if not exists recording_artist text,
  add column if not exists display_credit text,
  add column if not exists label_licensor text,
  add column if not exists external_title text,
  add column if not exists isrc text;

alter table public.flowstate_creator_license_certificates
  add column if not exists recording_artist text,
  add column if not exists display_credit text,
  add column if not exists label_licensor text,
  add column if not exists external_title text,
  add column if not exists isrc text;

create index if not exists idx_fs_creator_certs_isrc
  on public.flowstate_creator_license_certificates(isrc)
  where isrc is not null;
