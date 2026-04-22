-- Sprint 4.2: persist teacher identity so we have more than "has a Google
-- session" as our role gate.
--
-- Before this migration, teachers only existed implicitly via
-- `classes.teacher_google_sub`. Any signed-in Google account could hit
-- teacher-only routes — fine for Sprint 3's minimum bar, but short of what
-- we need for a teachers-table-aware RLS pass, per-teacher analytics, or
-- the eventual school/role columns (Sprint 5+).
--
-- The upsert happens in the NextAuth `signIn` callback; see
-- src/lib/teacher-auth.ts.

create table if not exists public.teachers (
  google_sub text primary key,               -- matches NextAuth session.googleSub
  email text,
  full_name text,
  given_name text,
  family_name text,
  picture_url text,
  -- Future-proof: when we add a schools table, set school_id as a
  -- nullable FK. For Sprint 4 we just carry the freeform label.
  school_label text,
  -- Role gate. Defaults to 'teacher'; 'admin' is for Problocks staff who
  -- need platform-wide moderation / data_request access. Setting this is
  -- a manual Supabase dashboard action until Sprint 5 adds an invite flow.
  role text not null default 'teacher' check (role in ('teacher', 'admin')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists teachers_role_idx on public.teachers (role)
  where role = 'admin';

alter table public.teachers enable row level security;

-- SELECT: closed to anon — reads go through the admin client. Sprint 5
-- will open a narrow "teacher reads own row" policy once the teacher-side
-- uses supabase-server instead of anon.
-- INSERT/UPDATE: same — done by the NextAuth signIn callback via the admin
-- client, which bypasses RLS anyway. Explicit `using (false)` keeps the
-- intent obvious.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'teachers' and policyname = 'teachers_select_none') then
    create policy teachers_select_none on public.teachers for select using (false);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'teachers' and policyname = 'teachers_modify_none') then
    create policy teachers_modify_none on public.teachers for all using (false) with check (false);
  end if;
end
$$;

-- Backfill teachers rows for every distinct teacher_google_sub that
-- already exists on classes. These placeholder rows have only the sub;
-- the NextAuth signIn callback will update them with real profile data on
-- the next sign-in. Without this step, the FK constraint below would
-- reject existing classes that reference teachers the table doesn't have.
insert into public.teachers (google_sub)
select distinct teacher_google_sub
from public.classes
where teacher_google_sub is not null
on conflict (google_sub) do nothing;

-- Classes gain a proper FK once we know teachers exist. The column already
-- stores the google_sub string; we just add the referential constraint.
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'classes_teacher_google_sub_fkey'
      and table_name = 'classes'
  ) then
    -- ON DELETE set null so admin-initiated teacher deletion doesn't
    -- cascade-destroy every class (classroom data outlives the account).
    alter table public.classes
      add constraint classes_teacher_google_sub_fkey
      foreign key (teacher_google_sub)
      references public.teachers(google_sub)
      on delete set null;
  end if;
end
$$;
