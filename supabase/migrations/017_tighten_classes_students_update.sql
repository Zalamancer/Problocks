-- Sprint 5.3: lock down UPDATE on classes + students.
--
-- Rationale: anon SDK callers with the NEXT_PUBLIC_SUPABASE_ANON_KEY could
-- previously rewrite any class (rename, switch join_code, re-parent to
-- another teacher) or tamper with student records. The API routes that
-- legitimately update these tables all run server-side and will be
-- migrated to the service-role admin client (which bypasses RLS) in the
-- same sprint / the next one; this migration cuts off the direct-SDK
-- mutation path immediately.
--
-- SELECT stays permissive because:
--   * /join/[classId] preview + /api/classes/lookup must work unauthed
--   * the admin-client rollout across all readers is a bigger change
--     (Sprint 6). For now the route-layer auth gates shipped in Sprint 4.3
--     do most of the heavy lifting.
--
-- INSERT stays permissive so the existing signup / enrol flows keep
-- working. Classes INSERT is gated at the route layer (teacher session);
-- students INSERT is gated at /api/students/join by the NextAuth session.
--
-- DELETE was already closed in migration 014.

-- classes --------------------------------------------------------------------
drop policy if exists "public update classes" on public.classes;

create policy classes_update_none on public.classes
  for update
  using (false)
  with check (false);

-- students -------------------------------------------------------------------
drop policy if exists "public update students" on public.students;

create policy students_update_none on public.students
  for update
  using (false)
  with check (false);
