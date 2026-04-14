create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-user',
  name text not null,
  prompt text not null,
  storage_path text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.games enable row level security;
