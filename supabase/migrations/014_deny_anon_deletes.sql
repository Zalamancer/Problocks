-- Sprint 4.4: deny anon/authenticated DELETE on the core tables.
--
-- The original migrations (002–005, 007, 009) granted INSERT + UPDATE +
-- SELECT policies but never created DELETE policies, which means DELETE is
-- already denied for anon by Supabase's default (RLS enabled + no matching
-- policy = no access). This migration makes that intent explicit by
-- installing `using (false)` policies — the net effect is the same today,
-- but an explicit policy removes the risk that a future migration
-- accidentally opens DELETE up and nobody notices.
--
-- Service-role callers (admin client) bypass RLS entirely, so admin
-- deletions continue to work when we need them.
--
-- Tables covered: classes, students, quiz_rooms, quiz_players,
-- quiz_answers, starter_units. The games + credit tables are already
-- owner-scoped (migration 010). game_reports + data_requests already have
-- `using (false)` on select/update (migrations 011–013); deletes follow
-- the same intent here.

do $$
declare
  t text;
begin
  foreach t in array array[
    'classes', 'students', 'quiz_rooms', 'quiz_players', 'quiz_answers',
    'starter_units', 'game_reports', 'data_requests'
  ]
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      t || '_delete_none', t
    );
    execute format(
      'create policy %I on public.%I for delete using (false)',
      t || '_delete_none', t
    );
  end loop;
end
$$;
