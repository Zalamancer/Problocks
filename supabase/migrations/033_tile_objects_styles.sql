-- 2D Tile-based editor — multi-style objects.
--
-- An "object" used to be a single sprite. Now an object is a *group* of
-- sprite styles (e.g. "house" with level-1 / level-2 / level-3 looks)
-- that the user can swap on placed instances. Each row in tile_objects
-- is still ONE sprite — the new `group_id` ties styles together, and
-- `label` distinguishes them within a group ("Level 1", "Damaged", etc.).
--
-- Backwards compat: every existing row gets `group_id = id` and
-- `label = ''`, which means each existing sprite becomes a single-style
-- group of one. Clients see no behaviour change for those.
--
-- The old unique(user_id, name) constraint is dropped because multiple
-- styles in the same group naturally share the group's name. Replaced
-- with a unique(user_id, group_id, label) constraint to prevent
-- duplicate labels within a group on upsert.

alter table public.tile_objects
  drop constraint if exists tile_objects_user_id_name_key;

alter table public.tile_objects
  add column if not exists group_id uuid;

alter table public.tile_objects
  add column if not exists label text not null default '';

alter table public.tile_objects
  add column if not exists sort_index int not null default 0;

-- Backfill: every pre-existing row becomes its own single-style group.
update public.tile_objects
set group_id = id
where group_id is null;

alter table public.tile_objects
  alter column group_id set not null,
  alter column group_id set default gen_random_uuid();

create unique index if not exists tile_objects_group_label_uidx
  on public.tile_objects (user_id, group_id, label);

create index if not exists tile_objects_user_group_idx
  on public.tile_objects (user_id, group_id);
