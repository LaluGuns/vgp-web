create table if not exists public.flowstate_billing_accounts (
  provider text not null,
  provider_account_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider, provider_account_id),
  unique (provider, user_id)
);

alter table public.flowstate_billing_accounts enable row level security;

revoke all on table public.flowstate_billing_accounts from anon, authenticated;
grant select, insert, update, delete on table public.flowstate_billing_accounts to service_role;

create index if not exists idx_flowstate_billing_accounts_user
  on public.flowstate_billing_accounts (user_id);

comment on table public.flowstate_billing_accounts is
  'Server-only mapping of pseudonymous provider account identifiers to Flow users. Never store raw purchase tokens or PII here.';
