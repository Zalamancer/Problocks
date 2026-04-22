-- Sprint 2: COPPA / FERPA data-subject requests.
-- A family or school admin can request deletion or export of a child's data
-- via /privacy/data-request. We log the request here; a human handles the
-- actual deletion (Sprint 3 will add an admin queue + automated export
-- packaging). Log-first is the important legal step: we can prove we
-- received the request and when, and it lands in our review queue.

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('delete', 'export', 'opt-out', 'correction')),
  -- Who is asking. 'self' for the student, 'parent' for guardian, 'school'
  -- for admin. Affects verification flow but doesn't gate the insert.
  requester_role text not null check (requester_role in ('self', 'parent', 'school')),
  requester_email text not null,
  requester_name text,
  -- The subject — may differ from the requester for parent/school paths.
  student_name text,
  student_email text,
  student_user_id text,
  details text,                               -- free-form, capped at 2000 chars by the API
  status text not null default 'open' check (status in ('open', 'in_progress', 'fulfilled', 'denied')),
  ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists data_requests_status_idx
  on public.data_requests (status, created_at desc);

alter table public.data_requests enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'data_requests' and policyname = 'data_requests_insert_all'
  ) then
    create policy data_requests_insert_all on public.data_requests for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'data_requests' and policyname = 'data_requests_select_all'
  ) then
    -- Sprint 2 permissive; Sprint 3 limits select to admins.
    create policy data_requests_select_all on public.data_requests for select using (true);
  end if;
end
$$;
