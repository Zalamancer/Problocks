-- Quiz Live rooms — Kahoot-style hosted quiz sessions.
-- Phase 1 uses an in-memory server singleton; this migration is ready
-- for Phase 2 when we swap the backend to Supabase + Realtime.

create table if not exists public.quiz_rooms (
  id             uuid primary key default gen_random_uuid(),
  pin            text not null unique,
  host_user_id   text,
  frq_id         text not null,
  pacing         text not null check (pacing in ('live', 'self')),
  phase          text not null default 'lobby'
                 check (phase in ('lobby', 'question', 'reveal', 'leaderboard', 'done')),
  part_idx       int  not null default 0,
  micro_idx      int  not null default 0,
  question_started_at timestamptz,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists quiz_rooms_pin_idx on public.quiz_rooms (pin);

create table if not exists public.quiz_players (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.quiz_rooms(id) on delete cascade,
  token          text not null unique,
  display_name   text not null,
  user_id        text,
  score          int not null default 0,
  streak         int not null default 0,
  joined_at      timestamptz default now()
);

create index if not exists quiz_players_room_idx on public.quiz_players (room_id);

create table if not exists public.quiz_answers (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.quiz_rooms(id) on delete cascade,
  player_id      uuid not null references public.quiz_players(id) on delete cascade,
  part_id        text not null,
  micro_id       text not null,
  answer_id      text,
  answer_value   numeric,
  correct        boolean not null,
  ms_to_answer   int not null,
  points         int not null,
  created_at     timestamptz default now()
);

create index if not exists quiz_answers_room_idx on public.quiz_answers (room_id);
create index if not exists quiz_answers_player_idx on public.quiz_answers (player_id);

alter table public.quiz_rooms   enable row level security;
alter table public.quiz_players enable row level security;
alter table public.quiz_answers enable row level security;

-- Permissive Phase-1 policies. Tighten once host auth is wired up.
create policy "public read rooms"   on public.quiz_rooms   for select using (true);
create policy "public read players" on public.quiz_players for select using (true);
create policy "public read answers" on public.quiz_answers for select using (true);
