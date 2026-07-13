-- Applied to Supabase project ogkrxrpwulvgyghckree on 2026-07-12.
-- Restrict the privileged entitlement RPC to backend service-role callers.
revoke all on function public.flowstate_is_premium(uuid) from public, anon, authenticated;
grant execute on function public.flowstate_is_premium(uuid) to service_role;

-- Explicit authenticated ownership policies. UPDATE policies include WITH CHECK
-- so rows cannot be reassigned to another user.
alter policy "fs_profiles_select_own" on public.flowstate_profiles
  to authenticated using ((select auth.uid()) = id);
alter policy "fs_profiles_insert_own" on public.flowstate_profiles
  to authenticated with check ((select auth.uid()) = id);
alter policy "fs_profiles_update_own" on public.flowstate_profiles
  to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "fs_subs_select_own" on public.flowstate_subscriptions
  to authenticated using ((select auth.uid()) = user_id);

alter policy "fs_sessions_select_own" on public.flowstate_focus_sessions
  to authenticated using ((select auth.uid()) = user_id);
alter policy "fs_sessions_insert_own" on public.flowstate_focus_sessions
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "fs_sessions_update_own" on public.flowstate_focus_sessions
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "fs_sessions_delete_own" on public.flowstate_focus_sessions
  to authenticated using ((select auth.uid()) = user_id);

alter policy "fs_tasks_select_own" on public.flowstate_tasks
  to authenticated using ((select auth.uid()) = user_id);
alter policy "fs_tasks_insert_own" on public.flowstate_tasks
  to authenticated with check ((select auth.uid()) = user_id);
alter policy "fs_tasks_update_own" on public.flowstate_tasks
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "fs_tasks_delete_own" on public.flowstate_tasks
  to authenticated using ((select auth.uid()) = user_id);

alter policy "fs_presets_all_own" on public.flowstate_mixer_presets
  to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
alter policy "fs_stats_select_own" on public.flowstate_stats_daily
  to authenticated using ((select auth.uid()) = user_id);

create index if not exists idx_fs_licenses_track
  on public.flowstate_licenses(track_id);
create index if not exists idx_fs_presets_user
  on public.flowstate_mixer_presets(user_id);
create index if not exists idx_fs_playlist_tracks_track
  on public.flowstate_playlist_tracks(track_id);
