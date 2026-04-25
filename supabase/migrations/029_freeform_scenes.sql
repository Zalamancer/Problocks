-- 2D Freeform scene persistence.
--
-- Each row is one user's named scene. The `data` jsonb mirrors the
-- partialize() slice of `useFreeform`: images / characters / background /
-- showGrid + a `version` discriminator so we can evolve the format
-- safely. Image src values stay as data URLs in jsonb — Postgres handles
-- the size fine, and we avoid needing a parallel object-storage bucket
-- for what is effectively an editor save.
--
-- Ownership follows the same pattern as `public.games` (see
-- 010_tighten_games_rls.sql): RLS gates rows on auth.uid(), with a
-- temporary 'local-user' escape hatch so anonymous dev studio sessions
-- keep working. Drop the local-user branch once we require sign-in for
-- save (Sprint 4.x).

create table if not exists public.freeform_scenes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-user',
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists freeform_scenes_user_idx
  on public.freeform_scenes (user_id, updated_at desc);

alter table public.freeform_scenes enable row level security;

drop policy if exists freeform_scenes_select_own on public.freeform_scenes;
create policy freeform_scenes_select_own on public.freeform_scenes
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists freeform_scenes_insert_own on public.freeform_scenes;
create policy freeform_scenes_insert_own on public.freeform_scenes
  for insert
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists freeform_scenes_update_own on public.freeform_scenes;
create policy freeform_scenes_update_own on public.freeform_scenes
  for update
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists freeform_scenes_delete_own on public.freeform_scenes;
create policy freeform_scenes_delete_own on public.freeform_scenes
  for delete
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- Auto-bump updated_at on every UPDATE so the order-by-updated index
-- gives the user a real "recently edited first" list.
create or replace function public.tg_freeform_scenes_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_freeform_scenes_updated_at on public.freeform_scenes;
create trigger tr_freeform_scenes_updated_at
  before update on public.freeform_scenes
  for each row execute function public.tg_freeform_scenes_set_updated_at();
