-- Slice 5 of the freeform-3D tycoon scripting layer.
--
-- earn_coins() is the server side of the client's tick batcher. The
-- viewport accumulates pet/grant earnings locally for ~5 seconds, then
-- POSTs the batch to /api/game-state/[gameId]/tick which calls this
-- function. The function validates that the total doesn't exceed an
-- absurd rate (anti-fast-forward), credits the variable atomically,
-- and stamps last_tick_at so the next batch's rate window starts now.
--
-- v1 anti-cheat is deliberately loose — a generous coins/sec ceiling
-- catches obvious tampering (a million coins in one batch) without
-- forcing the client to upload a precise breakdown of every pet.
-- Slice 7+ should layer in a per-pet income lookup against a
-- server-stored scene definition; today we trust the client's total.

create or replace function public.earn_coins(
  p_game_id text,
  p_amount bigint
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_row public.game_player_state;
  v_elapsed numeric;
  -- Max sustainable rate. 1000 coins/sec is comfortably above any
  -- legit kid-mode tycoon (100 pets at 10 coins each is 1000/s) but
  -- well below "1M instantly". Tunable in slice 7+.
  v_max_rate constant numeric := 1000;
  -- Sanity ceiling on a single batch's elapsed window. A client that
  -- slept the tab for an hour shouldn't bank an hour of earnings —
  -- cap at 60 seconds so AFK farming doesn't pay.
  v_max_elapsed constant numeric := 60;
begin
  if v_user is null then
    raise exception 'auth required' using errcode = '28000';
  end if;
  if p_amount < 0 then
    raise exception 'amount must be non-negative' using errcode = '22023';
  end if;

  -- Make sure the row exists. Coins start at 0 and last_tick_at is
  -- now(), so the very first earn after init grants nothing because
  -- elapsed=0 → rate cap = 0; that's fine — pets only start earning
  -- on the SECOND batch, and the first batch is usually empty anyway
  -- (no pets owned yet on a freshly-entered tycoon).
  insert into public.game_player_state (game_id, user_id)
  values (p_game_id, v_user)
  on conflict (game_id, user_id) do nothing;

  -- Compute the elapsed window. Capping at v_max_elapsed prevents the
  -- "long-AFK" payout: if the user closes the tab for 30 minutes, the
  -- server credits at most 60 seconds × max_rate even if the client
  -- claims a huge batch.
  select least(extract(epoch from (now() - last_tick_at)), v_max_elapsed)
    into v_elapsed
    from public.game_player_state
   where game_id = p_game_id and user_id = v_user;

  -- Atomic update gated on the rate ceiling. Rejecting via the WHERE
  -- (no row returned) keeps us in a single statement — no read-then-
  -- write race. ceil() so a 1-second gap can absorb a fractional
  -- earn from the very first tick.
  update public.game_player_state
     set coins = coins + p_amount,
         last_tick_at = now()
   where game_id = p_game_id
     and user_id = v_user
     and p_amount::numeric <= ceil(v_elapsed * v_max_rate)
  returning * into v_row;

  if v_row.user_id is null then
    -- Rate cap blew out. Return NULL; route maps to 429.
    return null;
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

revoke all on function public.earn_coins(text, bigint) from public;
grant execute on function public.earn_coins(text, bigint) to authenticated;
grant execute on function public.earn_coins(text, bigint) to service_role;
