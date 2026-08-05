-- Close anon-key exposure of founder tables now that the public-facing Flowstate app
-- ships NEXT_PUBLIC_SUPABASE_ANON_KEY. Enabling RLS with no policies = deny-all for
-- anon/authenticated via PostgREST. The founder app connects via DATABASE_URL (postgres
-- role) which bypasses RLS, so its server-side queries are unaffected.
alter table public.vgp_subscribers        enable row level security;
alter table public.vgp_subscribers_trash  enable row level security;
alter table public.vgp_campaigns          enable row level security;
alter table public.vgp_recipient_logs     enable row level security;
alter table public.vgp_metric_snapshots   enable row level security;
alter table public.vgp_daily_report_logs  enable row level security;
alter table public.vgp_login_attempts     enable row level security;;
