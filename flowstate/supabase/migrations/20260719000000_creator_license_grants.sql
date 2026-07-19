-- Local migration only. Apply during the coordinated production deployment.
-- Creator grants are an immutable legal audit trail. Browser clients may read
-- only their own rows; only service_role may issue or revoke grants.
create table public.flowstate_creator_license_grants (
  id uuid primary key default gen_random_uuid(),
  -- Nullable so an account-deletion request removes the user link without
  -- destroying the perpetual publication receipt or its public verifier.
  user_id uuid references auth.users(id) on delete set null,
  terms_version text not null,
  catalog_version text not null,
  eligible_genres text[] not null,
  plan_snapshot jsonb not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text,
  constraint fs_creator_grants_genres_exact check (
    eligible_genres = array['City Pop', 'Cyberpunk Jazz', 'Neo Synthwave']::text[]
  ),
  constraint fs_creator_grants_revocation_pair check (
    (revoked_at is null and revocation_reason is null)
    or (revoked_at is not null and nullif(btrim(revocation_reason), '') is not null)
  ),
  constraint fs_creator_grants_plan_snapshot_object check (
    jsonb_typeof(plan_snapshot) = 'object'
    and plan_snapshot->>'plan' in ('monthly', 'yearly', 'lifetime')
  )
);

alter table public.flowstate_creator_license_grants enable row level security;

revoke all on table public.flowstate_creator_license_grants from public, anon, authenticated;
grant select on table public.flowstate_creator_license_grants to authenticated;
grant all on table public.flowstate_creator_license_grants to service_role;

create policy "fs_creator_grants_select_own"
  on public.flowstate_creator_license_grants
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create index idx_fs_creator_grants_user_granted
  on public.flowstate_creator_license_grants(user_id, granted_at desc);

-- POST /api/license/grants is idempotent even when two requests race. Revoked
-- receipts remain immutable history and a later eligible subscription may
-- receive a new active receipt for the same terms/catalog version.
create unique index idx_fs_creator_grants_one_active_version
  on public.flowstate_creator_license_grants(user_id, terms_version, catalog_version)
  where user_id is not null and revoked_at is null;

create index idx_fs_creator_grants_public_verify
  on public.flowstate_creator_license_grants(id)
  include (terms_version, catalog_version, granted_at, revoked_at);
