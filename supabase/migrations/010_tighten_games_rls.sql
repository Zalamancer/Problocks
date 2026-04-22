-- Sprint 3: tighten games RLS.
--
-- Migration 006 shipped with permissive `games_*_all` policies (`using
-- (true) with check (true)`) to match the pattern used by 002-005. Sprint
-- 3's auth wiring means we can now gate rows by `auth.uid()` at the
-- database level, so even a caller that bypasses the API routes can't
-- overwrite someone else's games.
--
-- Transition strategy: we keep a narrow escape hatch for the legacy
-- 'local-user' namespace. The studio doesn't yet pass a real user id into
-- its save calls (Sprint 3.3), so writes against the literal string
-- 'local-user' stay allowed. Once Sprint 3.3 lands we drop that branch and
-- require auth outright.

-- Drop the all-permission policies from migration 006. The policy names are
-- stable so this is safe; guarded with DROP POLICY IF EXISTS anyway.
drop policy if exists games_select_all on public.games;
drop policy if exists games_insert_all on public.games;
drop policy if exists games_update_all on public.games;
drop policy if exists games_delete_all on public.games;

-- SELECT: owner reads everything; anyone reads is_published rows. The
-- playable /play/[gameId] route depends on the is_published branch so
-- unauth visitors can load published games.
create policy games_select_published on public.games
  for select
  using (is_published = true);

create policy games_select_own on public.games
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- INSERT: owner writes rows to their own user_id, OR the legacy
-- 'local-user' bucket (temporary). Anon inserts into 'local-user' are
-- accepted so the existing dev-mode studio keeps working.
create policy games_insert_own on public.games
  for insert
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- UPDATE / DELETE: same ownership rule, both USING and WITH CHECK.
create policy games_update_own on public.games
  for update
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

create policy games_delete_own on public.games
  for delete
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- user_credits: owner + 'local-user' bucket.
drop policy if exists user_credits_all on public.user_credits;
create policy user_credits_select on public.user_credits
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );
create policy user_credits_modify on public.user_credits
  for all
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- credit_events: same ownership rule on select; inserts are driven by the
-- security-definer RPC `spend_credits` / `grant_credits` so the RPC
-- bypasses RLS anyway.
drop policy if exists credit_events_all on public.credit_events;
create policy credit_events_select on public.credit_events
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );
-- No insert/update/delete policies — callers must go through the RPCs.
