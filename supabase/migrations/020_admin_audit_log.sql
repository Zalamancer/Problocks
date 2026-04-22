-- Sprint 7.2: admin audit log.
--
-- Every mutation performed via an admin-gated surface (promote/demote
-- teacher, transition a data_request, approve/reject a flagged game)
-- writes a row here. Helps answer "who did what, when" for compliance
-- reviews and accidental-action postmortems. Console logs stay in place
-- as the belt to this row's suspenders.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_sub text not null,          -- actor's google_sub (NextAuth session)
  actor_email text,                 -- denormalized for easy human scanning
  action text not null,             -- e.g. 'role_grant', 'data_request.fulfilled'
  target_type text not null,        -- 'teacher' | 'data_request' | 'game' | 'report'
  target_id text not null,
  metadata jsonb,                   -- action-specific (old/new role, reason, etc.)
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_sub, created_at desc);
create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id, created_at desc);
create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- Anon can never touch this table. Admin surfaces read/write via the
-- service-role client, which bypasses RLS.
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'admin_audit_log' and policyname = 'audit_select_none') then
    create policy audit_select_none on public.admin_audit_log for select using (false);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'admin_audit_log' and policyname = 'audit_modify_none') then
    create policy audit_modify_none on public.admin_audit_log for all using (false) with check (false);
  end if;
end
$$;
