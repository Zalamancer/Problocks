-- Whiteboard answer storage. Students who answer a `whiteboard`-kind
-- micro draw on a canvas; we serialize the canvas to PNG and upload
-- it here from the server route (service-role), keyed by
-- {roomId}/{playerId}/{partId}-{microId}.png. Bucket is private —
-- the host dashboard reads via signed URL.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quiz-whiteboards',
  'quiz-whiteboards',
  false,                       -- private; signed URLs only
  2 * 1024 * 1024,             -- 2 MB hard cap per drawing
  array['image/png']::text[]
)
on conflict (id) do nothing;
