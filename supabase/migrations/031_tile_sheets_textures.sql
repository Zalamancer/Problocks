-- 2D Tile-based — texture identity for chained Wang tilesets.
--
-- Each Wang sheet has two base textures (the upper and the lower). When
-- the user uploads a "connecting" sheet — e.g., dirt→grass on top of an
-- existing water→dirt sheet — the new sheet's lower texture is the same
-- *concept* as the older sheet's upper texture. We track that with a
-- shared text id on the corresponding column.
--
-- The connection is purely identity (matching strings) — there is no
-- separate textures table. Two sheets are "connected" iff one of their
-- texture columns equals one of the other's (in any orientation).
--
-- Existing rows get fresh ids from the gen_random_uuid() default so
-- nothing pre-031 is implicitly part of any chain.

alter table public.tile_sheets
  add column if not exists upper_texture_id text not null default gen_random_uuid()::text,
  add column if not exists lower_texture_id text not null default gen_random_uuid()::text;

-- Indexes scoped per user — the panel only ever queries within one
-- user_id, and this is what the "find chains" lookups will hit.
create index if not exists tile_sheets_upper_tex_idx
  on public.tile_sheets (user_id, upper_texture_id);
create index if not exists tile_sheets_lower_tex_idx
  on public.tile_sheets (user_id, lower_texture_id);
