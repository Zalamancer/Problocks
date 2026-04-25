-- Slice 2 of the freeform-3D tycoon scripting layer.
--
-- One row per (game_id, player) holding the authoritative game state:
-- coins, inventory, owned upgrades. Buy/tick API routes mutate this
-- table — the client treats its local copy as optimistic and the
-- server's value as truth.
--
-- game_id is plain text on purpose. Today it's the freeform-3D saved
-- scene name (or a uuid the client mints). Once we add a server-side
-- "publish a tycoon" flow we can FK it to public.games.id, but doing
-- that now would force the user to save+publish before the agent can
-- prove the loop end-to-end.
--
-- Money is bigint (not numeric): tycoon coin values stay in plain
-- integers, and bigint is a single 8-byte column instead of the
-- variable-width numeric. Caps at ~9.2 quintillion which is fine for
-- a kid-style tycoon.
--
-- inventory / upgrades are text[] — duplicate ids are valid (owning
-- 3 of the same pet means 3× earn rate). The client and the buy/tick
-- routes both treat them as multisets.

create table if not exists public.game_player_state (
  game_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  coins bigint not null default 0 check (coins >= 0),
  inventory text[] not null default '{}',
  upgrades text[] not null default '{}',
  /* Last server-tick batch the client applied — lets the tick route
     reject replayed batches and bound how many seconds a single batch
     can claim. Plain seconds-since-epoch, so SQL math stays simple. */
  last_tick_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

-- "Show me every game I'm a player in" — the dashboard query.
create index if not exists game_player_state_user_idx
  on public.game_player_state (user_id, updated_at desc);

alter table public.game_player_state enable row level security;

-- Owners (auth.uid() = user_id) can read / insert / update / delete
-- their own row. Anyone else sees nothing. Buy and tick routes go
-- through the user's auth cookie so they hit these policies; admin
-- recovery (if it ever exists) would use the service-role key which
-- bypasses RLS.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'game_player_state' and policyname = 'gps_owner_select'
  ) then
    create policy gps_owner_select on public.game_player_state
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'game_player_state' and policyname = 'gps_owner_insert'
  ) then
    create policy gps_owner_insert on public.game_player_state
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'game_player_state' and policyname = 'gps_owner_update'
  ) then
    create policy gps_owner_update on public.game_player_state
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'game_player_state' and policyname = 'gps_owner_delete'
  ) then
    create policy gps_owner_delete on public.game_player_state
      for delete using (auth.uid() = user_id);
  end if;
end
$$;

-- updated_at trigger so /tick and /buy don't have to write it manually.
create or replace function public.touch_game_player_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_game_player_state_updated_at on public.game_player_state;
create trigger trg_game_player_state_updated_at
  before update on public.game_player_state
  for each row execute function public.touch_game_player_state_updated_at();

-- ---- Atomic buy ------------------------------------------------------
--
-- The /api/game-state/[gameId]/buy route calls this RPC instead of
-- doing read-then-write from Node. SECURITY INVOKER so RLS still
-- gates which row the caller can mutate, but inside the function we
-- can do the cost-check + deduct + grant in one statement, which
-- removes the race window between two rapid clicks.
--
-- Returns the updated row as JSONB so the route can hand it back to
-- the client without a second round-trip. Returns NULL when the user
-- can't afford it; the route turns that into a 402-ish response.
create or replace function public.buy_with_coins(
  p_game_id text,
  p_cost bigint,
  p_grant_inventory text default null,
  p_grant_upgrade text default null
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_row public.game_player_state;
begin
  if v_user is null then
    raise exception 'auth required' using errcode = '28000';
  end if;
  if p_cost < 0 then
    raise exception 'cost must be non-negative' using errcode = '22023';
  end if;

  -- Insert-or-fetch: the player's first action on this game creates
  -- their row. Coins start at 0 so a fresh player has nothing to spend
  -- until a grant/earn fires.
  insert into public.game_player_state (game_id, user_id)
  values (p_game_id, v_user)
  on conflict (game_id, user_id) do nothing;

  update public.game_player_state
     set coins = coins - p_cost,
         inventory = case
           when p_grant_inventory is null then inventory
           else array_append(inventory, p_grant_inventory)
         end,
         upgrades = case
           when p_grant_upgrade is null then upgrades
           when p_grant_upgrade = any(upgrades) then upgrades
           else array_append(upgrades, p_grant_upgrade)
         end
   where game_id = p_game_id
     and user_id = v_user
     and coins >= p_cost
   returning * into v_row;

  if v_row.user_id is null then
    return null; -- couldn't afford it (or RLS blocked us)
  end if;

  return jsonb_build_object(
    'game_id',   v_row.game_id,
    'coins',     v_row.coins,
    'inventory', v_row.inventory,
    'upgrades',  v_row.upgrades,
    'updated_at', v_row.updated_at
  );
end;
$$;

-- Lock down EXECUTE: anon can't call the function at all, authed
-- users can. Service role keeps it for back-office tooling.
revoke all on function public.buy_with_coins(text, bigint, text, text) from public;
grant execute on function public.buy_with_coins(text, bigint, text, text) to authenticated;
grant execute on function public.buy_with_coins(text, bigint, text, text) to service_role;
