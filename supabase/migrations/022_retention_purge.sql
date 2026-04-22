-- Sprint 8.2: retention purge for log tables.
--
-- admin_audit_log + rate_limit_events grow without bound otherwise. This
-- migration adds a purge RPC for each; /api/admin/cron/purge calls them
-- on a schedule (external cron — Railway cron job, GitHub Actions, etc.).
--
-- We use Postgres intervals instead of days-as-integer so a caller could
-- keep, say, 90 days of audit logs without a custom conversion. The
-- defaults are tuned to "keep what's useful for an investigation, drop
-- what isn't".
--
-- Retention defaults:
--   admin_audit_log       → 365 days   (compliance trail)
--   rate_limit_events     →   1 hour   (sliding window doesn't need more)
--
-- Both RPCs return the number of rows deleted so the cron endpoint can
-- log + surface it.

create or replace function public.purge_admin_audit_log(p_older_than_days integer default 365)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  if p_older_than_days is null or p_older_than_days < 30 then
    raise exception 'refusing to purge admin_audit_log with retention < 30 days';
  end if;

  delete from public.admin_audit_log
  where created_at < now() - make_interval(days => p_older_than_days);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end
$$;

grant execute on function public.purge_admin_audit_log(integer) to anon, authenticated;

-- Play events grow with every /play/[gameId] load. Retaining them forever
-- would bloat the DB without adding creator-facing value past the first
-- few months. Default: 90 days; tune per product need.
create or replace function public.purge_play_events(p_older_than_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  if p_older_than_days is null or p_older_than_days < 7 then
    raise exception 'refusing to purge play_events with retention < 7 days';
  end if;

  delete from public.play_events
  where created_at < now() - make_interval(days => p_older_than_days);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end
$$;

grant execute on function public.purge_play_events(integer) to anon, authenticated;
