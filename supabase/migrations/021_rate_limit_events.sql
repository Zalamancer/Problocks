-- Sprint 8.1: durable rate limiting.
--
-- Replaces the per-instance in-memory Map()s used across /api/*:
--   * /api/classes/lookup
--   * /api/games/[id]/report
--   * /api/coppa/data-request
--   * /api/quiz/rooms (pin lookup, Sprint 7.4)
-- Those caps silently reset on every serverless cold start and scale
-- horizontally with instance count — a quiet, known-bad situation the
-- pre-prod audit flagged as P1. This migration + the enforceRateLimit()
-- helper in src/lib/rate-limit.ts lift the counter into Postgres so
-- limits are global across the fleet.

create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  -- Logical bucket: e.g. 'classes.lookup', 'quiz.pin-lookup'. Lets us
  -- share the table across features without one caller eating another's
  -- counter.
  bucket text not null,
  -- Who the counter belongs to — typically the caller's IP, but the
  -- helper accepts anything stringifiable so Sprint 9 can key on a
  -- student's auth.uid() once we want per-user limits.
  actor text not null,
  created_at timestamptz not null default now()
);

-- Composite index that powers the "events in window" count. Descending
-- on created_at so the common range scan runs fast even when the table
-- has a lot of stale rows waiting for the purge.
create index if not exists rate_limit_events_bucket_actor_created_idx
  on public.rate_limit_events (bucket, actor, created_at desc);

alter table public.rate_limit_events enable row level security;

-- Closed to anon. The helper uses the service-role client (Sprint 4.1) so
-- RLS never fires. No policy = no anon access (default deny), which is
-- exactly what we want.

-- Atomic "count + insert" check. Returns true when under the limit (and
-- registers the new event) or false when rate-limited (no insert).
create or replace function public.check_rate_limit(
  p_bucket text,
  p_actor text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_bucket is null or p_actor is null or p_max <= 0 or p_window_seconds <= 0 then
    raise exception 'bucket, actor, max, window all required and positive';
  end if;

  select count(*)
    into v_count
    from public.rate_limit_events
    where bucket = p_bucket
      and actor = p_actor
      and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limit_events (bucket, actor)
  values (p_bucket, p_actor);
  return true;
end
$$;

grant execute on function public.check_rate_limit(text, text, integer, integer) to anon, authenticated;

-- Purge stale rows. Called from a Sprint 8.2 scheduled job; also safe to
-- call manually during dev. Returns number of rows deleted.
create or replace function public.purge_rate_limit_events(p_older_than_seconds integer default 3600)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limit_events
  where created_at < now() - make_interval(secs => p_older_than_seconds);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end
$$;

grant execute on function public.purge_rate_limit_events(integer) to anon, authenticated;
