-- Whiteboard answers store a Supabase Storage object path (in the
-- `quiz-whiteboards` bucket from migration 025) instead of a choice id
-- or a numeric value. Adding a dedicated column keeps `answer_id`
-- semantically a choice id and lets the host dashboard render thumbnails
-- without parsing tagged strings.

alter table public.quiz_answers
  add column if not exists answer_image_path text;
