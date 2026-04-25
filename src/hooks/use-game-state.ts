/**
 * Slice 3/6 of the freeform-3D tycoon scripting layer.
 *
 * Reads + mutates the player's row in public.game_player_state via the
 * /api/game-state/[gameId] routes. The freeform-3D viewport mounts this
 * hook when play mode is on and uses the returned `buy()` callback from
 * raycast click handlers + (slice 6) the upgrade panel.
 *
 * Design choices:
 *
 * - gameId fallback to '__draft__' so unsaved scenes can still play —
 *   the agent may declare a tycoon before the user saves the scene by
 *   name, and we don't want play mode to be hostage to a save dialog.
 *   Each authenticated user has exactly one draft state, namespaced by
 *   auth.uid() inside the table.
 *
 * - Server is truth: every successful buy() replaces local state with
 *   the server's row. No optimistic update in v1 — buy latency on a
 *   same-region Supabase RPC is ~50ms which beats juggling rollback
 *   logic on insufficient-funds. (Optimistic ticks are a slice 5
 *   problem.)
 *
 * - Anonymous users get a no-op surface: `state` stays null, buy()
 *   returns 'auth' so callers can show a sign-in prompt instead of a
 *   generic error toast.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFreeform3D } from '@/store/freeform3d-store';
import { useAuthStore } from '@/store/auth-store';
import type { UpgradeDef } from '@/lib/kid-style-3d/game-logic-schema';

export interface PlayerState {
  game_id: string;
  coins: number;
  inventory: string[];
  upgrades: string[];
  updated_at: string;
}

export type BuyOutcome =
  | { ok: true; state: PlayerState }
  | { ok: false; reason: 'auth' | 'insufficient' | 'network' | 'bad-request' };

export interface BuyItemArgs {
  kind: 'item';
  cost: number;
  grants: string;
  label?: string;
}

export interface BuyUpgradeArgs {
  kind: 'upgrade';
  upgradeId: string;
  /** The current upgrades catalog from gameLogic — server reads cost
      from it. Passed every call so the hook stays stateless on the
      catalog (avoids stale closures when the agent edits an upgrade). */
  catalog: Record<string, UpgradeDef>;
}

export type BuyArgs = BuyItemArgs | BuyUpgradeArgs;

export interface UseGameStateResult {
  /** Stable gameId derived from currentSceneName (or '__draft__'). */
  gameId: string;
  /** Null while loading, anonymous, or before first fetch. */
  state: PlayerState | null;
  /** True between mount/refresh and the first response. */
  loading: boolean;
  /** True iff the active user has a real Supabase auth row. */
  isAuthed: boolean;
  /** Refetch from /api/game-state/[gameId]. */
  refresh: () => Promise<void>;
  /** Atomic deduct + grant via /api/game-state/[gameId]/buy. */
  buy: (args: BuyArgs) => Promise<BuyOutcome>;
  /** Imperative override of local state — used by slice 5's tick batcher
      after a successful POST /tick to swap in the server's truth. */
  setState: (next: PlayerState) => void;
}

/** Stable gameId derivation. Saved scenes get their saved name; an
    unsaved scene gets the literal '__draft__' so the per-player draft
    row is always reachable without forcing a save dialog. */
function deriveGameId(currentSceneName: string | null): string {
  if (currentSceneName && currentSceneName.trim()) return currentSceneName.trim();
  return '__draft__';
}

export function useGameState(): UseGameStateResult {
  const currentSceneName = useFreeform3D((s) => s.currentSceneName);
  const user = useAuthStore((s) => s.user);
  const isAuthed = !!user;

  const [state, setLocalState] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const gameId = deriveGameId(currentSceneName);

  // Track the in-flight fetch so a fast scene-rename doesn't write back
  // a stale response.
  const requestRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!isAuthed) {
      setLocalState(null);
      return;
    }
    const tag = ++requestRef.current;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/game-state/${encodeURIComponent(gameId)}`,
        { method: 'GET', cache: 'no-store' },
      );
      if (tag !== requestRef.current) return;
      if (!res.ok) {
        // 401 most likely. Silent — the auth gate UI handles it.
        setLocalState(null);
        return;
      }
      const data = (await res.json()) as PlayerState;
      setLocalState(data);
    } catch {
      // Network error — leave the previous state visible so the HUD
      // doesn't blank out on a flaky cellular connection.
    } finally {
      if (tag === requestRef.current) setLoading(false);
    }
  }, [gameId, isAuthed]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const buy = useCallback(
    async (args: BuyArgs): Promise<BuyOutcome> => {
      if (!isAuthed) return { ok: false, reason: 'auth' };
      try {
        const body =
          args.kind === 'item'
            ? { kind: 'item', cost: args.cost, grants: args.grants, label: args.label }
            : { kind: 'upgrade', upgradeId: args.upgradeId, catalog: args.catalog };
        const res = await fetch(
          `/api/game-state/${encodeURIComponent(gameId)}/buy`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        if (res.status === 402) return { ok: false, reason: 'insufficient' };
        if (res.status === 401) return { ok: false, reason: 'auth' };
        if (!res.ok) return { ok: false, reason: 'bad-request' };
        const next = (await res.json()) as PlayerState;
        setLocalState(next);
        return { ok: true, state: next };
      } catch {
        return { ok: false, reason: 'network' };
      }
    },
    [gameId, isAuthed],
  );

  return {
    gameId,
    state,
    loading,
    isAuthed,
    refresh,
    buy,
    setState: setLocalState,
  };
}
