-- 2D Tile-based editor — uploaded standalone object sprites.
--
-- Each row is one user-uploaded sprite that the studio places as a free
-- object on the canvas (the OBJECT tool). These are NOT sliced from a
-- Wang sheet — they are whole images uploaded as-is. Same data-URL-in-jsonb
-- pattern as tile_sheets (030) and freeform_scenes (029): the raw PNG/WebP
-- lives in `data_url` so we don't need a parallel storage bucket.
--
-- Width/height are recorded at upload time (the natural pixel size of the
-- image) so the placed object's default footprint matches the source. The
-- user can still resize per-instance after placement.
--
-- Ownership / RLS mirrors tile_sheets exactly — auth.uid() if signed-in,
-- with a 'local-user' escape hatch for anonymous dev sessions.

create table if not exists public.tile_objects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-user',
  name text not null,
  data_url text not null,
  width int not null check (width > 0),
  height int not null check (height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists tile_objects_user_idx
  on public.tile_objects (user_id, created_at desc);

alter table public.tile_objects enable row level security;

drop policy if exists tile_objects_select_own on public.tile_objects;
create policy tile_objects_select_own on public.tile_objects
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_objects_insert_own on public.tile_objects;
create policy tile_objects_insert_own on public.tile_objects
  for insert
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_objects_update_own on public.tile_objects;
create policy tile_objects_update_own on public.tile_objects
  for update
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_objects_delete_own on public.tile_objects;
create policy tile_objects_delete_own on public.tile_objects
  for delete
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- Auto-bump updated_at on every UPDATE so re-uploaded sprites surface to
-- the top of "recently uploaded" lists.
create or replace function public.tg_tile_objects_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_tile_objects_updated_at on public.tile_objects;
create trigger tr_tile_objects_updated_at
  before update on public.tile_objects
  for each row execute function public.tg_tile_objects_set_updated_at();
