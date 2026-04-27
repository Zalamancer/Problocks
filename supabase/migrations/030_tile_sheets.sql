-- 2D Tile-based editor — Wang sheet persistence.
--
-- Each row is one user's uploaded 4×4 (or NxM) Wang tileset sheet. The
-- raw PNG is stored as a base-64 data URL in `sheet_data_url` so we don't
-- need a parallel storage bucket — same shape as freeform_scenes (029)
-- which already stashes image data URLs in jsonb. Slicing into individual
-- tiles happens client-side every load (cheap: it's a single canvas blit
-- per tile), so we don't persist the 16 derived tile PNGs.
--
-- Ownership follows the freeform_scenes pattern: RLS on auth.uid() with
-- a 'local-user' escape hatch for anonymous dev sessions, dropped once
-- sign-in is mandatory.

create table if not exists public.tile_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-user',
  name text not null,
  sheet_data_url text not null,
  cols int not null check (cols > 0 and cols <= 32),
  rows int not null check (rows > 0 and rows <= 32),
  tile_width int not null check (tile_width > 0),
  tile_height int not null check (tile_height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists tile_sheets_user_idx
  on public.tile_sheets (user_id, created_at desc);

alter table public.tile_sheets enable row level security;

drop policy if exists tile_sheets_select_own on public.tile_sheets;
create policy tile_sheets_select_own on public.tile_sheets
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_sheets_insert_own on public.tile_sheets;
create policy tile_sheets_insert_own on public.tile_sheets
  for insert
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_sheets_update_own on public.tile_sheets;
create policy tile_sheets_update_own on public.tile_sheets
  for update
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_sheets_delete_own on public.tile_sheets;
create policy tile_sheets_delete_own on public.tile_sheets
  for delete
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

-- Auto-bump updated_at on every UPDATE so re-uploaded sheets surface to
-- the top of "recently uploaded" lists.
create or replace function public.tg_tile_sheets_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_tile_sheets_updated_at on public.tile_sheets;
create trigger tr_tile_sheets_updated_at
  before update on public.tile_sheets
  for each row execute function public.tg_tile_sheets_set_updated_at();
