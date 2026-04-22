-- Sprint 10.2: track purge runs precisely.
--
-- Sprint 9.2 used "most recent admin_audit_log entry" as a proxy for
-- "when did the retention purge last run". That's noisy and gives false
-- green when admins are clicking around. This table logs every actual
-- invocation of /api/admin/cron/purge with per-bucket counts + any
-- errors, so /admin/status can show a precise "last purge at … deleted
-- N / M / K / L" tile.

create table if not exists public.purge_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  -- Per-bucket result. Store as jsonb so we can evolve the set of buckets
  -- without a schema change.
  results jsonb not null default '{}'::jsonb,
  error text
);

create index if not exists purge_runs_started_idx
  on public.purge_runs (started_at desc);

alter table public.purge_runs enable row level security;

-- Closed to anon. Admin surfaces read via service role.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'purge_runs' and policyname = 'purge_runs_select_none') then
    create policy purge_runs_select_none on public.purge_runs for select using (false);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'purge_runs' and policyname = 'purge_runs_modify_none') then
    create policy purge_runs_modify_none on public.purge_runs for all using (false) with check (false);
  end if;
end
$$;
