/**
 * Slice 2/6 of the freeform-3D tycoon scripting layer.
 *
 * POST /api/game-state/[gameId]/buy
 *
 * Body (one of):
 *   { kind: 'item',     cost: number, grants: string }            // shop stall
 *   { kind: 'upgrade',  upgradeId: string }                       // upgrade panel
 *
 * For the 'upgrade' variant the route must know the upgrade's cost —
 * the client passes the gameLogic catalog so the route can look it up.
 * We trust the catalog only enough to read costs from it; the actual
 * deduct + grant happens server-side via the buy_with_coins() RPC,
 * which is what makes the call atomic / race-free.
 *
 * Returns:
 *   200 { coins, inventory[], upgrades[], updated_at }
 *   401 { error: 'auth required' }   — no Supabase session
 *   402 { error: 'insufficient'  }   — coins < cost
 *   400 { error: 'bad request'   }   — malformed body
 *   500 { error: 'rpc failed'    }   — Supabase / network blew up
 *
 * Why a route AND an RPC: the route owns auth + body validation +
 * upgrade-cost lookup; the RPC owns the atomic mutation. Splitting
 * lets us keep the SQL small and lets the route swap its catalog
 * source later (today: client-supplied, tomorrow: server-stored
 * scene definition) without rewriting the SQL.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase, requireServerUser, ServerAuthError } from '@/lib/supabase-server';
import type { UpgradeDef } from '@/lib/kid-style-3d/game-logic-schema';

interface BuyItemBody {
  kind: 'item';
  cost: number;
  /** Inventory id to add. Multiple of the same id stack — owning
      three of the same pet means 3× earn rate downstream. */
  grants: string;
  /** Optional analytics breadcrumb — not validated. */
  label?: string;
}

interface BuyUpgradeBody {
  kind: 'upgrade';
  upgradeId: string;
  /** The client's view of the upgrade catalog, used to look up the
      cost for `upgradeId`. v1: trust on read. Slice 7+ should move
      this to a server-stored scene definition. */
  catalog: Record<string, UpgradeDef>;
}

type BuyBody = BuyItemBody | BuyUpgradeBody;

function isItemBody(b: BuyBody): b is BuyItemBody {
  return b.kind === 'item';
}
function isUpgradeBody(b: BuyBody): b is BuyUpgradeBody {
  return b.kind === 'upgrade';
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ gameId: string }> },
) {
  let user;
  try {
    user = await requireServerUser();
  } catch (err) {
    if (err instanceof ServerAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { gameId } = await ctx.params;
  if (!gameId || gameId.length > 200) {
    return NextResponse.json({ error: 'bad gameId' }, { status: 400 });
  }

  let body: BuyBody | null;
  try {
    body = (await req.json()) as BuyBody;
  } catch {
    return NextResponse.json({ error: 'bad JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || !('kind' in body)) {
    return NextResponse.json({ error: 'bad body' }, { status: 400 });
  }

  let cost: number;
  let grantInventory: string | null = null;
  let grantUpgrade: string | null = null;

  if (isItemBody(body)) {
    if (typeof body.cost !== 'number' || body.cost < 0 || !Number.isFinite(body.cost)) {
      return NextResponse.json({ error: 'bad cost' }, { status: 400 });
    }
    if (typeof body.grants !== 'string' || !body.grants.length || body.grants.length > 80) {
      return NextResponse.json({ error: 'bad grants' }, { status: 400 });
    }
    cost = Math.floor(body.cost);
    grantInventory = body.grants;
  } else if (isUpgradeBody(body)) {
    if (typeof body.upgradeId !== 'string' || !body.upgradeId.length) {
      return NextResponse.json({ error: 'bad upgradeId' }, { status: 400 });
    }
    const def = body.catalog?.[body.upgradeId];
    if (!def || typeof def.cost !== 'number' || def.cost < 0) {
      return NextResponse.json({ error: 'unknown upgrade' }, { status: 400 });
    }
    cost = Math.floor(def.cost);
    grantUpgrade = body.upgradeId;
  } else {
    return NextResponse.json({ error: 'bad kind' }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc('buy_with_coins', {
    p_game_id: gameId,
    p_cost: cost,
    p_grant_inventory: grantInventory,
    p_grant_upgrade: grantUpgrade,
  });

  if (error) {
    console.error('[game-state/buy] rpc failed', { gameId, userId: user.id, error });
    return NextResponse.json({ error: 'rpc failed' }, { status: 500 });
  }

  // RPC returns NULL when the user couldn't afford the buy. Surface as
  // 402 (Payment Required) so the client can show a "not enough coins"
  // toast distinctly from a generic 500.
  if (!data) {
    return NextResponse.json({ error: 'insufficient' }, { status: 402 });
  }

  return NextResponse.json(data);
}
