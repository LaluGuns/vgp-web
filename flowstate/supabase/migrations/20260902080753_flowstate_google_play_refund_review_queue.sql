create table if not exists public.flowstate_billing_refund_reviews (
  provider text not null,
  provider_review_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  provider_order_id text not null,
  pending_refund_token text not null,
  refund_reason integer not null,
  received_at timestamptz not null,
  deadline_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'responded', 'expired', 'error')),
  response_preference text
    check (response_preference is null or response_preference in ('APPROVE', 'DECLINE', 'NEUTRAL')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider, provider_review_id)
);

alter table public.flowstate_billing_refund_reviews enable row level security;

revoke all on table public.flowstate_billing_refund_reviews from public, anon, authenticated;
grant select, insert, update, delete on table public.flowstate_billing_refund_reviews to service_role;

create index if not exists idx_flowstate_billing_refund_reviews_order
  on public.flowstate_billing_refund_reviews (provider_order_id);

create index if not exists idx_flowstate_billing_refund_reviews_pending_deadline
  on public.flowstate_billing_refund_reviews (deadline_at)
  where status = 'pending';

create index if not exists idx_flowstate_billing_refund_reviews_user
  on public.flowstate_billing_refund_reviews (user_id, received_at desc);

comment on table public.flowstate_billing_refund_reviews is
  'Server-only Google Play pending refund review queue. Contains sensitive pending refund tokens and must never be exposed to anon/authenticated clients.';
