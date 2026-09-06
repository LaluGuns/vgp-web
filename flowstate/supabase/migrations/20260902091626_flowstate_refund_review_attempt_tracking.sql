alter table public.flowstate_billing_refund_reviews
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists last_error text;

alter table public.flowstate_billing_refund_reviews drop constraint if exists flowstate_billing_refund_reviews_status_check;
alter table public.flowstate_billing_refund_reviews
  add constraint flowstate_billing_refund_reviews_status_check
  check (status in ('pending', 'processing', 'responded', 'expired', 'error'));

alter table public.flowstate_billing_refund_reviews drop constraint if exists flowstate_billing_refund_reviews_last_error_length_check;
alter table public.flowstate_billing_refund_reviews
  add constraint flowstate_billing_refund_reviews_last_error_length_check
  check (last_error is null or length(last_error) <= 500);

create index if not exists idx_flowstate_billing_refund_reviews_actionable_deadline
  on public.flowstate_billing_refund_reviews (deadline_at)
  where status in ('pending', 'error');
