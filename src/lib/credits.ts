import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Server-side helpers for the credits ledger (migration 008).
//
// The `costFor` table below is the single source of truth for how much each
// generator-style route debits per call. Keeping it here (rather than per
// route) lets us slice usage across endpoints later and adjust pricing
// without touching the routes themselves.
//
// Sprint 2 keeps spending permissive when Supabase is offline — the helpers
// return a "free pass" so local development + CI don't silently 402.

export type GeneratorRoute =
  | 'agent'
  | 'studio-agent'
  | 'chat'
  | 'generate-part'
  | 'starter-unit';

const COST_TABLE: Record<GeneratorRoute, number> = {
  'agent': 10,
  'studio-agent': 3,
  'chat': 1,
  'generate-part': 5,
  'starter-unit': 5,
};

export function costFor(route: GeneratorRoute): number {
  return COST_TABLE[route];
}

interface SpendResult {
  ok: boolean;
  balance: number | null;
  cost: number;
  reason?: 'insufficient' | 'supabase-unavailable';
}

/** Atomically debit a user's balance by `costFor(route)`. Returns ok:false +
 *  reason:'insufficient' when the balance is too low; callers should 402 in
 *  that case. When Supabase is unconfigured (local dev / test) this succeeds
 *  with a free pass so we don't block development. */
export async function spendCreditsFor(
  userId: string,
  route: GeneratorRoute,
  refId: string | null = null
): Promise<SpendResult> {
  const cost = costFor(route);

  if (!isSupabaseConfigured() || !supabase) {
    return { ok: true, balance: null, cost, reason: 'supabase-unavailable' };
  }

  const { data, error } = await supabase.rpc('spend_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_reason: `generate:${route}`,
    p_ref_id: refId,
  });

  if (error) {
    console.error(`spend_credits (${route}) error:`, error);
    // Fail-open: a DB blip shouldn't brick generation. The event just won't
    // be recorded. Sprint 3 will harden this with a retry queue.
    return { ok: true, balance: null, cost, reason: 'supabase-unavailable' };
  }

  if (data === null) {
    return { ok: false, balance: 0, cost, reason: 'insufficient' };
  }

  return { ok: true, balance: data as number, cost };
}

/** Refund a failed generation. Called from the error path of a generator
 *  route after spendCreditsFor already debited. Always positive. */
export async function refundCreditsFor(
  userId: string,
  route: GeneratorRoute,
  refId: string | null = null
): Promise<void> {
  const cost = costFor(route);
  if (!isSupabaseConfigured() || !supabase) return;
  const { error } = await supabase.rpc('grant_credits', {
    p_user_id: userId,
    p_amount: cost,
    p_reason: `refund:${route}`,
    p_ref_id: refId,
  });
  if (error) console.error(`grant_credits (refund ${route}) error:`, error);
}

export async function getBalance(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  // ensure_user_credits seeds first-time users (100 credits) and returns the
  // balance. Idempotent for everyone else.
  const { data, error } = await supabase.rpc('ensure_user_credits', {
    p_user_id: userId,
    p_default: 100,
  });
  if (error) {
    console.error('ensure_user_credits error:', error);
    return null;
  }
  return (data as number | null) ?? 0;
}
