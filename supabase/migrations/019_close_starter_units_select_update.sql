-- Sprint 7.1: close anon SELECT + UPDATE on starter_units.
--
-- The /api/starter-units route now reads and writes via the admin / read
-- client helpers (src/lib/supabase-admin.ts), so direct-SDK callers can be
-- cut off. INSERT stays permissive — anon teachers draft + save new units
-- during the setup wizard, and the route layer rate-limits / validates.

drop policy if exists "public read starter_units" on public.starter_units;
drop policy if exists "public update starter_units" on public.starter_units;

create policy starter_units_select_none on public.starter_units
  for select
  using (false);

create policy starter_units_update_none on public.starter_units
  for update
  using (false)
  with check (false);
