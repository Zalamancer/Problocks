-- Classes + students — teacher-owned classrooms with student roster populated
-- via student self-sign-in (/join/:classId) instead of Google Classroom's
-- restricted classroom.rosters scope.
--
-- Matching to Google Classroom is via Google `sub` (OAuth subject claim) which
-- equals Classroom API's `userId` field. That lets grades/submissions sync
-- without ever pulling the restricted roster scope.

create table if not exists public.classes (
  id                    uuid primary key default gen_random_uuid(),
  teacher_google_sub    text not null,
  name                  text not null,
  subject               text,
  grade                 text,
  color                 text,
  classroom_course_id   text,  -- Google Classroom course this class mirrors, if any
  join_code             text unique,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists classes_teacher_idx on public.classes (teacher_google_sub);
create index if not exists classes_join_code_idx on public.classes (join_code);
create index if not exists classes_course_id_idx on public.classes (classroom_course_id);

create table if not exists public.students (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes(id) on delete cascade,
  google_sub        text not null,          -- same value as Classroom API userId
  email             text,
  full_name         text not null,
  given_name        text,
  family_name       text,
  picture_url       text,
  joined_at         timestamptz default now(),
  unique (class_id, google_sub)
);

create index if not exists students_class_idx on public.students (class_id);
create index if not exists students_sub_idx   on public.students (google_sub);

alter table public.classes  enable row level security;
alter table public.students enable row level security;

-- Phase-1 permissive policies — mirrors the quiz_rooms pattern (migration 003).
-- Writes go through Next.js /api/* server routes using the anon client, so we
-- allow anon insert/update for now and tighten once we wire per-request auth.
create policy "public read classes"    on public.classes   for select using (true);
create policy "public insert classes"  on public.classes   for insert with check (true);
create policy "public update classes"  on public.classes   for update using (true);

create policy "public read students"   on public.students  for select using (true);
create policy "public insert students" on public.students  for insert with check (true);
create policy "public update students" on public.students  for update using (true);
