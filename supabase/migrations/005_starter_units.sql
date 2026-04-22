-- Starter units — AI-drafted unit templates that accumulate as teachers
-- generate them. The first teacher for a given (subject, grade) combo drafts
-- from scratch; every subsequent teacher with the same filter sees previous
-- units as pickable cards in step 4 of the classroom setup flow.
--
-- We intentionally do NOT seed this table with hardcoded examples — the
-- original "Fraction Friends / Tiny Ecosystem / Choose-Your-Own Story" set
-- lived in code and felt canned. This way the catalogue grows organically
-- from real teacher intent.

create table if not exists public.starter_units (
  id                uuid primary key default gen_random_uuid(),
  subject           text not null,         -- matches SetupData.classSubject keys (math, ela, …)
  grade             text not null,         -- matches SetupData.grade keys (k2, 3, 4, …)
  title             text not null,
  weeks             text not null,         -- human label, e.g. "4 weeks"
  blurb             text not null,         -- 1-2 sentence description
  bullets           jsonb not null default '[]'::jsonb,  -- array of 3 short strings
  tone              text not null,         -- 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink'
  icon              text not null,         -- matches Icon primitive names (coin, book, spark, cube, …)
  prompt            text,                  -- the teacher's original description, for future retraining / moderation
  created_by_sub    text,                  -- Google sub of the teacher who drafted it (nullable for system-seeded rows)
  usage_count       int  not null default 1,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Primary query pattern: "give me units that match this teacher's subject+grade"
create index if not exists starter_units_subject_grade_idx
  on public.starter_units (subject, grade, usage_count desc);

create index if not exists starter_units_created_idx
  on public.starter_units (created_at desc);

alter table public.starter_units enable row level security;

-- Permissive policies matching the rest of phase-1 — writes go through the
-- Next.js /api/* server routes using the anon client. Tighten once per-request
-- auth is wired everywhere.
create policy "public read starter_units"   on public.starter_units for select using (true);
create policy "public insert starter_units" on public.starter_units for insert with check (true);
create policy "public update starter_units" on public.starter_units for update using (true);
