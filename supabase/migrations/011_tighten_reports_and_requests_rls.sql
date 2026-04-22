-- Sprint 3.4: tighten RLS on moderation + legal tables.
--
-- Focused on the two tables that leak the most if a direct-to-Supabase
-- caller bypasses the API:
--   * game_reports   — reporter identities + free-text details
--   * data_requests  — COPPA/FERPA data-subject requests (full PII)
--
-- We keep INSERT permissive for both so anyone can file a report or a data
-- request (we'd rather get a report from an unauthed player than lose it
-- behind an auth prompt). SELECT + UPDATE are locked down; callers that
-- need read access (the /teacher/moderation queue) go through the service
-- role via server routes that already enforce NextAuth in Sprint 3.2.
--
-- Other high-risk tables (classes, students, quiz_*, starter_units) still
-- carry permissive policies from migrations 002–005; Sprint 4 rewrites
-- those as part of the teacher-role work (auth helper + teachers table).

-- game_reports --------------------------------------------------------------

drop policy if exists game_reports_select_all on public.game_reports;
drop policy if exists game_reports_update_all on public.game_reports;

-- Anyone can file (needed: kids on /play shouldn't need a session to flag).
-- game_reports_insert_all from migration 007 stays.

-- Select + update are closed for anon/authenticated clients. The moderation
-- routes use the Supabase anon key via the server route, which means these
-- reads currently flow through server auth — NextAuth on the teacher route
-- is the backstop until Sprint 4 runs moderation through a service-role
-- client. Closing the policies here eliminates the direct-SDK IDOR path.
create policy game_reports_select_none on public.game_reports
  for select
  using (false);

create policy game_reports_update_none on public.game_reports
  for update
  using (false)
  with check (false);

-- data_requests -------------------------------------------------------------

drop policy if exists data_requests_select_all on public.data_requests;

-- Inserts stay open (see data_requests_insert_all from 009). Selects are now
-- forbidden outside of service-role callers; an admin queue surface will go
-- through a server-side admin client in Sprint 4.
create policy data_requests_select_none on public.data_requests
  for select
  using (false);

create policy data_requests_update_none on public.data_requests
  for update
  using (false)
  with check (false);

-- play_events ---------------------------------------------------------------
-- Already scoped: anyone can insert (via /api/games/[id]/play), select is
-- open. Tightening select would require threading teacher auth through the
-- creator-stats panel we haven't built yet, so we leave it permissive for
-- Sprint 3 and revisit in Sprint 4 when those panels ship.
