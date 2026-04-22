-- Sprint 5.2: bridge the two student identities.
--
-- Historically a student could end up with two separate identity anchors:
--   * google_sub (when they joined a class via NextAuth at /join/:classId)
--   * Supabase auth.uid() (when they signed up in /student via AuthScreen)
-- Games are keyed on the latter; the students table is keyed on the former.
-- Moderation scoping ("a teacher only sees games whose creator is in one of
-- their classes") needs to know both.
--
-- This migration adds `supabase_user_id` to students so we can record the
-- mapping the next time each student enrols, then use it to join games →
-- students → classes when a teacher queries the moderation queue.

alter table public.students
  add column if not exists supabase_user_id text;

-- One class-local row per Supabase user. NULLs are fine — they just don't
-- participate in the join yet.
create unique index if not exists students_class_supabase_uniq
  on public.students (class_id, supabase_user_id)
  where supabase_user_id is not null;

-- Lookup index for "which classes is this Supabase user in?"
create index if not exists students_supabase_user_idx
  on public.students (supabase_user_id)
  where supabase_user_id is not null;
