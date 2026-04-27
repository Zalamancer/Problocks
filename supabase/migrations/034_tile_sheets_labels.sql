-- 2D Tile-based — explicit terrain labels for Wang sheets.
--
-- The auto-tile resolver has always supported terrain labels: two sheets
-- whose `upper_label` (or `lower_label`) match collapse to one terrain at
-- paint and render time, even when their texture ids differ. Until 034
-- the labels lived only in the persisted Zustand store, so anything the
-- user typed in the panel's "upper name" / "lower name" fields was lost
-- on reload (the studio rehydrates tilesets from Supabase, not local
-- storage). This migration persists them so labels survive a refresh.
--
-- Both columns are nullable — clients still derive labels from the sheet
-- name via parseSheetName when these are null, matching the legacy path.

alter table public.tile_sheets
  add column if not exists upper_label text,
  add column if not exists lower_label text;
