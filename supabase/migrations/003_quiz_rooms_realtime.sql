-- Phase-2 additions to the quiz rooms schema:
--   1. Permissive write policies so the anon client (our Next server
--      routes) can insert/update rooms, players, and answers.  These
--      will be tightened in a later phase once we have host auth.
--   2. Realtime publication + full replica identity so the browser
--      can subscribe to postgres_changes on each table and retire the
--      1-second polling loop.

-- ---------- write policies ----------

create policy "public insert rooms"   on public.quiz_rooms   for insert with check (true);
create policy "public update rooms"   on public.quiz_rooms   for update using (true);

create policy "public insert players" on public.quiz_players for insert with check (true);
create policy "public update players" on public.quiz_players for update using (true);

create policy "public insert answers" on public.quiz_answers for insert with check (true);

-- ---------- realtime ----------

alter table public.quiz_rooms   replica identity full;
alter table public.quiz_players replica identity full;
alter table public.quiz_answers replica identity full;

-- Safe to re-run: supabase_realtime publication is created by Supabase.
alter publication supabase_realtime add table public.quiz_rooms;
alter publication supabase_realtime add table public.quiz_players;
alter publication supabase_realtime add table public.quiz_answers;
