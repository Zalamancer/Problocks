-- Sprint 2: moderation trust layer.
-- Adds `game_reports` so anyone playing a game can flag it. Teachers (and,
-- eventually, a moderation team) review open reports via a queue surface.
--
-- RLS: Sprint 2 keeps the permissive policies consistent with the rest of the
-- schema. Sprint 3 ("tighten auth") will scope select to the game owner +
-- reviewer role and restrict insert with rate limits.

create table if not exists public.game_reports (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  -- Canonical reason codes. Free-form `details` column carries anything
  -- beyond these; see the Report form on /play/[gameId].
  reason text not null check (reason in ('inappropriate', 'scary', 'broken', 'copy', 'other')),
  details text,
  reporter_id text,                  -- optional — student id if known
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_id text
);

create index if not exists game_reports_game_id_idx
  on public.game_reports (game_id, created_at desc);

create index if not exists game_reports_open_idx
  on public.game_reports (status, created_at desc)
  where status = 'open';

alter table public.game_reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'game_reports' and policyname = 'game_reports_insert_all'
  ) then
    create policy game_reports_insert_all on public.game_reports for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'game_reports' and policyname = 'game_reports_select_all'
  ) then
    create policy game_reports_select_all on public.game_reports for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'game_reports' and policyname = 'game_reports_update_all'
  ) then
    create policy game_reports_update_all on public.game_reports for update using (true) with check (true);
  end if;
end
$$;

-- When a game receives an open report we also flip its moderation_status back
-- to pending so the marketplace listing (moderation_status = 'approved')
-- drops it until a teacher acts on the report. Direct /play links stay live.
create or replace function public.on_game_report_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.games
  set moderation_status = 'pending',
      updated_at = now()
  where id = new.game_id
    and moderation_status <> 'rejected';
  return new;
end
$$;

drop trigger if exists game_reports_after_insert on public.game_reports;
create trigger game_reports_after_insert
  after insert on public.game_reports
  for each row execute function public.on_game_report_inserted();
