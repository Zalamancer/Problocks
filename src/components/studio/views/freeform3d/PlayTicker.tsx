/**
 * Slice 5/6 of the freeform-3D tycoon scripting layer.
 *
 * Headless component (renders nothing) that drives the per-second
 * earnings loop while play mode is on. Walks every prefab's tick
 * behaviors, multiplies by inventory ownership and the player's
 * earnRate upgrades, optimistically credits the local coin counter,
 * and flushes the accumulated amount to /api/game-state/[gameId]/tick
 * every 5 seconds.
 *
 * Optimistic UX rationale: tycoon coins must tick up visibly every
 * second, not jump every 5. The server is still authoritative on
 * money (rate cap / 60-second elapsed cap live in earn_coins RPC),
 * but between flushes the HUD shows the optimistic running total.
 * On flush success, the server's response replaces local state —
 * usually a no-op since the optimistic add matches; on 429 (rate
 * cap exceeded) the local count drifts above the server's, which
 * a refresh corrects. The drift is acceptable: 1000 coins/sec is
 * far above any honest gameplay rate.
 *
 * Once-per-session grant behaviors fire on the first tick after the
 * component mounts and are remembered in a ref keyed by
 * `${prefabId}:${behaviorIndex}` — resets when play stops + restarts.
 *
 * v1 simplification: per-behavior `interval` is ignored. Every tick
 * behavior fires at 1 Hz. Slice 7+ should respect interval (a 5s
 * spawner is different from a 1s pet earner).
 */

'use client';

import { useEffect, useRef } from 'react';
import { useFreeform3D } from '@/store/freeform3d-store';
import { useSceneStore } from '@/store/scene-store';
import { useGameState } from '@/hooks/use-game-state';
import type { Behavior, UpgradeDef } from '@/lib/kid-style-3d/game-logic-schema';

const TICK_HZ = 1;
const FLUSH_EVERY_SECONDS = 5;

/** Count occurrences of an inventory id (multiset semantics). */
function countOwned(inventory: string[], id: string): number {
  let n = 0;
  for (const i of inventory) if (i === id) n++;
  return n;
}

/** Aggregate every "multiply earnRate" upgrade the player owns into
    a single multiplier. Two of the same upgrade only count once
    because the buy API treats upgrade ids as a set. */
function earnMultiplier(
  upgrades: string[],
  catalog: Record<string, UpgradeDef>,
): number {
  let m = 1;
  const seen = new Set<string>();
  for (const id of upgrades) {
    if (seen.has(id)) continue;
    seen.add(id);
    const def = catalog[id];
    if (!def) continue;
    if (def.effect.kind === 'multiply' && def.effect.target === 'earnRate') {
      m *= def.effect.factor;
    }
  }
  return m;
}

/**
 * Read once per tick: walk all on:'tick' behaviors and compute the
 * per-second earnings + any once-per-session grants that haven't
 * fired yet.
 */
function computeTickEarnings(
  scene: ReturnType<typeof useFreeform3D.getState>['scene'],
  inventory: string[],
  upgrades: string[],
  firedOnce: Set<string>,
): number {
  const catalog = scene.gameLogic?.upgrades ?? {};
  const mult = earnMultiplier(upgrades, catalog);

  let total = 0;
  for (const obj of scene.objects) {
    const behaviors = obj.behaviors ?? [];
    for (let i = 0; i < behaviors.length; i++) {
      const b: Behavior = behaviors[i];
      if (b.on !== 'tick') continue;
      const a = b.action;

      if (a.do === 'earn') {
        // Multiplied by inventory count — owning 3 pets means 3x earn.
        // No `requires` means it always fires (rare; usually pets gate
        // earn behind their inventory id).
        const count = a.requires ? countOwned(inventory, a.requires) : 1;
        if (count > 0) total += a.amount * count * mult;
      } else if (a.do === 'grant') {
        const key = `${obj.id}:${i}`;
        if (a.oncePerSession) {
          if (firedOnce.has(key)) continue;
          firedOnce.add(key);
        }
        total += a.amount;
      }
      // do:'buy' / 'buyUpgrade' don't make sense as tick behaviors —
      // skip silently rather than spam the console; the agent's prompt
      // already discourages it.
    }
  }
  return total;
}

export function PlayTicker() {
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const { state, isAuthed, earn, setState } = useGameState();

  // Refs so the interval body always reads the latest values without
  // re-creating the timer (which would reset the flush window).
  const stateRef = useRef(state);
  stateRef.current = state;
  const isAuthedRef = useRef(isAuthed);
  isAuthedRef.current = isAuthed;
  const earnRef = useRef(earn);
  earnRef.current = earn;
  const setStateRef = useRef(setState);
  setStateRef.current = setState;

  useEffect(() => {
    if (!isPlaying) return;
    const firedOnce = new Set<string>();
    let pending = 0;
    let secondsSinceFlush = 0;

    const id = window.setInterval(async () => {
      const cur = stateRef.current;
      if (!isAuthedRef.current || !cur) return;

      const scene = useFreeform3D.getState().scene;
      const earned = computeTickEarnings(scene, cur.inventory, cur.upgrades, firedOnce);
      if (earned > 0) {
        // Optimistic local update so the HUD ticks up every second.
        // On flush, server response replaces this anyway.
        setStateRef.current({ ...cur, coins: cur.coins + earned });
        pending += earned;
      }

      secondsSinceFlush += 1;
      if (secondsSinceFlush >= FLUSH_EVERY_SECONDS) {
        secondsSinceFlush = 0;
        if (pending > 0) {
          const toSend = pending;
          pending = 0;
          // Fire-and-forget: the response reconciles state, but a
          // failed flush means the optimistic credits stay and we'll
          // try to push them next batch (combined with the next 5s).
          // The 60-second elapsed cap on the server prevents runaway
          // accumulation if the player went AFK.
          earnRef.current(toSend).catch(() => {
            // Network error — re-add to pending so the next flush
            // tries again.
            pending += toSend;
          });
        }
      }
    }, 1000 / TICK_HZ);

    return () => {
      window.clearInterval(id);
      // Best-effort flush on stop. If the browser is closing this
      // races against navigation; we accept the data loss because the
      // alternative (sendBeacon) requires reshaping the API.
      if (pending > 0 && isAuthedRef.current) {
        void earnRef.current(pending).catch(() => {});
      }
    };
  }, [isPlaying]);

  return null;
}
