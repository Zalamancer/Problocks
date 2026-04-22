-- Sprint 6.1: close SELECT on classes + students to anon.
--
-- Every server reader of these tables now goes through
-- getServerReadClient() (src/lib/supabase-admin.ts), which prefers the
-- service-role admin client and falls back to the anon client only when
-- the admin key isn't configured. With SUPABASE_SERVICE_ROLE_KEY set in
-- production, the admin client bypasses RLS, so we can flip SELECT to
-- `using (false)` without breaking any legitimate flow.
--
-- Direct-SDK callers with only the NEXT_PUBLIC_SUPABASE_ANON_KEY can no
-- longer enumerate classes or dump rosters. This is the last major IDOR
-- surface flagged by the pre-prod audit.
--
-- INSERT stays permissive (signup + enrol flows still need it; route-layer
-- auth enforces intent). UPDATE + DELETE were closed in migrations 014 +
-- 017.
--
-- BREAKING: environments WITHOUT SUPABASE_SERVICE_ROLE_KEY will start
-- getting empty reads from anything that reads classes or students. Local
-- dev must set the key from Supabase Dashboard → Settings → API →
-- service_role.

-- classes --------------------------------------------------------------------
drop policy if exists "public read classes" on public.classes;

create policy classes_select_none on public.classes
  for select
  using (false);

-- students -------------------------------------------------------------------
drop policy if exists "public read students" on public.students;

create policy students_select_none on public.students
  for select
  using (false);
