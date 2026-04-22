-- Sprint 3.4 follow-up: 011 closed SELECT + UPDATE on game_reports to
-- reduce the direct-SDK IDOR surface. The moderation API routes still read
-- + update this table through the standard anon client (src/lib/supabase.ts
-- is a browser-context client with no session cookie; NextAuth is the gate,
-- not Supabase Auth). With `using (false)` in place those routes silently
-- returned empty sets / no-op updates.
--
-- Correct long-term fix is a service-role Supabase client in
-- src/lib/supabase-admin.ts that moderation routes use. That's queued for
-- Sprint 4 alongside the teachers-table / role work. Until then we restore
-- permissive SELECT + UPDATE so the queue and approve/reject buttons work.
-- The NextAuth gate at the route layer remains in place (Sprint 3.2).
--
-- Data_requests stays locked: no route reads or updates it yet, so keeping
-- SELECT + UPDATE as `using (false)` costs nothing and protects full PII
-- from the anon SDK.

drop policy if exists game_reports_select_none on public.game_reports;
drop policy if exists game_reports_update_none on public.game_reports;

create policy game_reports_select_all on public.game_reports
  for select
  using (true);

create policy game_reports_update_all on public.game_reports
  for update
  using (true)
  with check (true);
