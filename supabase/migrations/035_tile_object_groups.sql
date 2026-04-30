-- 2D Tile-based editor — object groups (taxonomy folders).
--
-- A "group" is a user-defined collection of object assets (e.g. "Trees",
-- "Buildings"). The same asset can belong to multiple groups. The asset
-- ids are stored as a uuid[] alongside the group row so a single SELECT
-- gets the full membership without a join.
--
-- The asset ids reference public.tile_objects.group_id (NOT the row id),
-- because each ObjectAsset on the client is keyed by the server-side
-- group_id (one row per style, all sharing one group_id per asset).
-- We don't enforce a foreign key on a uuid[] column — clients filter out
-- stale ids on hydrate.
--
-- Ownership / RLS mirrors tile_objects exactly.

create table if not exists public.tile_object_groups (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'local-user',
  name text not null,
  asset_ids uuid[] not null default '{}',
  sort_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tile_object_groups_user_idx
  on public.tile_object_groups (user_id, sort_index, created_at);

alter table public.tile_object_groups enable row level security;

drop policy if exists tile_object_groups_select_own on public.tile_object_groups;
create policy tile_object_groups_select_own on public.tile_object_groups
  for select
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_object_groups_insert_own on public.tile_object_groups;
create policy tile_object_groups_insert_own on public.tile_object_groups
  for insert
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_object_groups_update_own on public.tile_object_groups;
create policy tile_object_groups_update_own on public.tile_object_groups
  for update
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  )
  with check (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

drop policy if exists tile_object_groups_delete_own on public.tile_object_groups;
create policy tile_object_groups_delete_own on public.tile_object_groups
  for delete
  using (
    (auth.uid() is not null and auth.uid()::text = user_id)
    or user_id = 'local-user'
  );

create or replace function public.tg_tile_object_groups_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_tile_object_groups_updated_at on public.tile_object_groups;
create trigger tr_tile_object_groups_updated_at
  before update on public.tile_object_groups
  for each row execute function public.tg_tile_object_groups_set_updated_at();
