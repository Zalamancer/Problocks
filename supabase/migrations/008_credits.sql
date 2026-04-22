-- Sprint 2: credits ledger.
-- Gates AI generation behind a per-user balance so a single classroom can't
-- drain the owner's Anthropic / PixelLab bill. Every generate-style endpoint
-- debits this ledger; the studio header surfaces the remaining balance; a
-- 402 response triggers the "out of credits" modal on the client.
--
-- Two tables:
--   user_credits  — one row per user, cached balance + updated_at
--   credit_events — append-only ledger: delta, reason, ref_id, created_at
--
-- user_credits.balance is a denormalized sum of credit_events.delta; the
-- RPCs below keep them in sync atomically. Sum-on-read also works and is
-- what Sprint 3 can fall back to if the denormalized column ever drifts.

create table if not exists public.user_credits (
  user_id text primary key,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  -- Signed int: positive for grants/refills/refunds, negative for spends.
  delta integer not null,
  -- Free-form reason code so we can slice usage later without a schema
  -- change. Canonical values: 'grant', 'refill', 'refund', 'generate:agent',
  -- 'generate:part', 'generate:studio-agent', 'generate:chat',
  -- 'generate:starter-unit'.
  reason text not null,
  ref_id text,                            -- e.g. game id, prompt id
  created_at timestamptz not null default now()
);

create index if not exists credit_events_user_idx
  on public.credit_events (user_id, created_at desc);

alter table public.user_credits enable row level security;
alter table public.credit_events enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'user_credits' and policyname = 'user_credits_all') then
    create policy user_credits_all on public.user_credits for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'credit_events' and policyname = 'credit_events_all') then
    create policy credit_events_all on public.credit_events for all using (true) with check (true);
  end if;
end
$$;

-- Ensure a user has a credits row, seeding with p_default credits on first
-- sight. Idempotent — subsequent calls no-op. Returns the current balance.
create or replace function public.ensure_user_credits(p_user_id text, p_default integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  insert into public.user_credits (user_id, balance)
  values (p_user_id, p_default)
  on conflict (user_id) do nothing;

  if found then
    insert into public.credit_events (user_id, delta, reason, ref_id)
    values (p_user_id, p_default, 'grant:signup', null);
  end if;

  select balance into v_balance from public.user_credits where user_id = p_user_id;
  return v_balance;
end
$$;

grant execute on function public.ensure_user_credits(text, integer) to anon, authenticated;

-- Atomically spend credits. Returns the new balance if the spend succeeded,
-- or NULL if the balance was insufficient (callers map NULL to 402).
create or replace function public.spend_credits(
  p_user_id text,
  p_amount integer,
  p_reason text,
  p_ref_id text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'spend amount must be positive';
  end if;

  -- ensure_user_credits also returns the current balance, but we use it
  -- here purely for its side-effect of seeding new users.
  perform public.ensure_user_credits(p_user_id, 100);

  update public.user_credits
  set balance = balance - p_amount,
      updated_at = now()
  where user_id = p_user_id
    and balance >= p_amount
  returning balance into v_new_balance;

  if v_new_balance is null then
    return null;
  end if;

  insert into public.credit_events (user_id, delta, reason, ref_id)
  values (p_user_id, -p_amount, p_reason, p_ref_id);

  return v_new_balance;
end
$$;

grant execute on function public.spend_credits(text, integer, text, text) to anon, authenticated;

-- Grant credits (refund on failure, teacher top-up, admin grant, Stripe
-- webhook, etc.). Always positive; callers pass the reason.
create or replace function public.grant_credits(
  p_user_id text,
  p_amount integer,
  p_reason text,
  p_ref_id text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  if p_amount <= 0 then
    raise exception 'grant amount must be positive';
  end if;

  perform public.ensure_user_credits(p_user_id, 0);

  update public.user_credits
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_new_balance;

  insert into public.credit_events (user_id, delta, reason, ref_id)
  values (p_user_id, p_amount, p_reason, p_ref_id);

  return v_new_balance;
end
$$;

grant execute on function public.grant_credits(text, integer, text, text) to anon, authenticated;
