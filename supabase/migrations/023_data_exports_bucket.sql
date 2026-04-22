-- Sprint 9.1: private Storage bucket for COPPA / FERPA export bundles.
--
-- When an admin transitions a data_request to 'fulfilled', we package
-- every matching row into a JSON file, upload it here, and email the
-- requester a 7-day signed URL. Bucket is private — only authenticated
-- service-role callers (or signed-URL holders) can read objects.
--
-- The RLS policies on storage.objects ship closed by default, so we
-- don't need per-bucket policies here — the admin Supabase client uses
-- the service role key which bypasses those. If we later want a
-- "download your own exports" flow we'd add a targeted policy.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'data-exports',
  'data-exports',
  false,                         -- private
  50 * 1024 * 1024,              -- 50 MB hard cap per bundle
  array['application/json']::text[]
)
on conflict (id) do nothing;
