-- Sprint 4.1: re-close game_reports SELECT + UPDATE.
--
-- Migration 012 restored permissive policies on game_reports because the
-- moderation routes used the anon Supabase client and needed to read /
-- update this table. Sprint 4 introduces a service-role admin client
-- (src/lib/supabase-admin.ts) that the moderation routes now prefer, and
-- the service role bypasses RLS. So we can finally close these to anon.
--
-- INSERT stays permissive (see migration 007): any player on /play must be
-- able to file a report without a Supabase session. SELECT + UPDATE are
-- admin-only.
--
-- NOTE: production must have SUPABASE_SERVICE_ROLE_KEY set for the
-- moderation queue to work after this migration. Local dev has a fallback
-- to the anon client, which WILL silently return empty reads here — dev
-- environments should set the env var too.

drop policy if exists game_reports_select_all on public.game_reports;
drop policy if exists game_reports_update_all on public.game_reports;

create policy game_reports_select_none on public.game_reports
  for select
  using (false);

create policy game_reports_update_none on public.game_reports
  for update
  using (false)
  with check (false);
