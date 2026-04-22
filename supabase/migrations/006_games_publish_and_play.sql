-- Sprint 1: close the creator loop.
-- Extends the `games` table with the columns needed to:
--   * store a game's HTML inline (skip the storage bucket round-trip for the
--     common case of small single-file games)
--   * mark a game as published / pick a visibility
--   * track play counts + moderation status for the marketplace (Sprint 2)
--   * attach a cover thumbnail for listings
-- Also adds a `play_events` table so /play/[gameId] can log plays for
-- creator-facing stats later.
--
-- RLS: policies here are permissive (anon has full CRUD) to match the
-- convention used by migrations 002–005. The pre-production security audit
-- flagged every table's `using (true)` policy; Sprint 2 ("trust + money")
-- will tighten all of them together once auth is wired into the studio.

-- 1. Extend the games table ---------------------------------------------------

alter table public.games
  add column if not exists html_content text,
  add column if not exists is_published boolean not null default false,
  add column if not exists visibility text not null default 'private',
  add column if not exists plays_count integer not null default 0,
  add column if not exists cover_url text,
  add column if not exists moderation_status text not null default 'pending',
  add column if not exists published_at timestamptz;

-- storage_path was required in v1 (every save uploaded to the bucket). Games
-- created via Sprint 1 store HTML inline in html_content, so the column has
-- to tolerate rows that never visited storage.
alter table public.games
  alter column storage_path drop not null;

-- Sanity constraints on the enum-ish text columns.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'games_visibility_check'
  ) then
    alter table public.games
      add constraint games_visibility_check
      check (visibility in ('private', 'unlisted', 'public'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'games_moderation_status_check'
  ) then
    alter table public.games
      add constraint games_moderation_status_check
      check (moderation_status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;

-- Indexes for the two hot queries: "my games" (by user_id) + public marketplace.
create index if not exists games_user_id_idx on public.games (user_id);
create index if not exists games_published_idx
  on public.games (is_published, created_at desc)
  where is_published = true;

-- RLS policies: permissive for Sprint 1. See header comment.
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'games' and policyname = 'games_select_all'
  ) then
    create policy games_select_all on public.games for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'games' and policyname = 'games_insert_all'
  ) then
    create policy games_insert_all on public.games for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'games' and policyname = 'games_update_all'
  ) then
    create policy games_update_all on public.games for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'games' and policyname = 'games_delete_all'
  ) then
    create policy games_delete_all on public.games for delete using (true);
  end if;
end
$$;

-- 2. Play events --------------------------------------------------------------
-- One row per /play/[gameId] load. Kept minimal — just enough to increment
-- plays_count and, later, show a creator "who's played your game" surface.

create table if not exists public.play_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id text,                -- optional: student's user id if known
  created_at timestamptz not null default now()
);

create index if not exists play_events_game_id_idx
  on public.play_events (game_id, created_at desc);

alter table public.play_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'play_events' and policyname = 'play_events_insert_all'
  ) then
    create policy play_events_insert_all on public.play_events for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'play_events' and policyname = 'play_events_select_all'
  ) then
    create policy play_events_select_all on public.play_events for select using (true);
  end if;
end
$$;

-- 3. Atomic play-count increment ---------------------------------------------
-- Called by /api/games/[id]/play after we insert a play_events row. Kept as an
-- RPC so we don't have to read-modify-write in the route.

create or replace function public.increment_game_plays(p_game_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.games
  set plays_count = plays_count + 1,
      updated_at = now()
  where id = p_game_id;
$$;

grant execute on function public.increment_game_plays(uuid) to anon, authenticated;
