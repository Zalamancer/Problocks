/**
 * Slice 8 — tiny JS runtime for freeform-3D scene scripts.
 *
 * The agent (or eventually the user) writes a script that reads
 * like Roblox-Studio-lite: tweak the player, wire onClick handlers,
 * react to ticks, show toasts. The script is serialized on scene.script,
 * shown in the Code tab, and evaluated here once when Play starts.
 *
 * API surface (kept deliberately small for v1):
 *
 *   onStart(fn)              — fires once immediately after the script
 *                              loads. Use for player.setSpeed etc.
 *   onTick(fn)               — fires every second while play runs.
 *                              Receives dtSeconds (always ~1).
 *   onClick(prefabId, fn)    — fires when the player clicks the prefab
 *                              with that id in play mode.
 *
 *   player.setSpeed(n)       — base walk speed (world units / sec).
 *   player.setJumpHeight(n)  — approximate peak jump height in units.
 *                              Under the hood sets velocity such that
 *                              apex ≈ n with the current gravity.
 *   player.enableDoubleJump()— allow a second jump mid-air.
 *   player.setMaxJumps(n)    — set exactly to n (1 = no double jump,
 *                              2 = double, 3 = triple — capped at 5).
 *
 *   coins.get()              — current server coin balance (number).
 *   inventory.has(id)        — true iff player owns `id` at least once.
 *   inventory.count(id)      — ownership count.
 *
 *   toast(msg)               — show an info toast.
 *   log(...args)             — console.log proxy (tagged [scene-script]).
 *
 * Safety: evaluated via new Function() in the user's own browser with
 * an explicit `with` block over the sandbox — no access to window /
 * document / import / fetch unless they reach out via closure. This
 * is appropriate for v1 ("the user is editing their own game"); it is
 * NOT sufficient for running scripts from other users. When public
 * sharing lands, re-evaluate this with a real sandbox (Worker or
 * iframe + postMessage).
 */

import type { PlayController } from './play-controller';

export interface ScriptHooks {
  /** Called once after the script finishes its top-level eval. */
  onStart: Array<() => void>;
  /** Called every second with dtSeconds (~1). */
  onTick: Array<(dt: number) => void>;
  /** prefabId → click handlers. Slice 3's click path walks this. */
  onClick: Map<string, Array<() => void>>;
}

export interface ScriptContext {
  /** Current controller so player.* can mutate speed / jump. */
  player: PlayController | null;
  /** Fresh coin balance each read — closure over useGameState. */
  getCoins: () => number;
  /** Inventory list — closure so `has` always reads latest state. */
  getInventory: () => string[];
  /** Toast dispatcher. */
  toast: (msg: string, kind?: 'info' | 'warning' | 'error') => void;
}

export interface ScriptHandle {
  hooks: ScriptHooks;
  /** Call when play starts after the script evaluates. Runs onStart. */
  fireStart: () => void;
  /** Call every second. */
  fireTick: (dtSeconds: number) => void;
  /** Call when a prefab is clicked in play mode. Returns true if any
      handler ran (so the caller can skip the default behavior-chain
      when a script handled it). */
  fireClick: (prefabId: string) => boolean;
  /** Tear down — no-op today but reserved if the API grows event
      listeners that would need cleanup. */
  dispose: () => void;
}

/**
 * Evaluate `source` and return a handle. Errors inside the script are
 * caught + reported via toast; they do not prevent play from starting.
 */
export function loadScript(
  source: string,
  ctx: ScriptContext,
): ScriptHandle {
  const hooks: ScriptHooks = {
    onStart: [],
    onTick: [],
    onClick: new Map(),
  };

  if (!source || !source.trim()) {
    return {
      hooks,
      fireStart: () => {},
      fireTick: () => {},
      fireClick: () => false,
      dispose: () => {},
    };
  }

  // Build the sandbox. `api` is the only "globals" surface the script
  // sees (modulo JS built-ins which new Function can't hide).
  const api = {
    onStart(fn: () => void) {
      if (typeof fn === 'function') hooks.onStart.push(fn);
    },
    onTick(fn: (dt: number) => void) {
      if (typeof fn === 'function') hooks.onTick.push(fn);
    },
    onClick(prefabId: string, fn: () => void) {
      if (typeof prefabId !== 'string' || typeof fn !== 'function') return;
      const list = hooks.onClick.get(prefabId) ?? [];
      list.push(fn);
      hooks.onClick.set(prefabId, list);
    },
    player: {
      setSpeed(n: number) {
        if (!ctx.player || typeof n !== 'number' || !Number.isFinite(n)) return;
        // PlayController exposes setSpeedMultiplier (relative to the
        // base WALK). Convert absolute n into a multiplier; the base
        // walk speed is 5 world units/sec (lib/kid-style-3d/play-controller.ts).
        ctx.player.setSpeedMultiplier(n / 5);
      },
      setJumpHeight(n: number) {
        if (!ctx.player || typeof n !== 'number' || n < 0) return;
        ctx.player.setJumpHeight(n);
      },
      enableDoubleJump() {
        if (!ctx.player) return;
        ctx.player.setMaxJumps(2);
      },
      setMaxJumps(n: number) {
        if (!ctx.player || typeof n !== 'number') return;
        ctx.player.setMaxJumps(Math.max(1, Math.min(5, Math.floor(n))));
      },
    },
    coins: {
      get: () => ctx.getCoins(),
    },
    inventory: {
      has: (id: string) => ctx.getInventory().includes(id),
      count: (id: string) => ctx.getInventory().filter((x) => x === id).length,
    },
    toast: (msg: string, kind: 'info' | 'warning' | 'error' = 'info') => {
      if (typeof msg === 'string' && msg.length <= 400) ctx.toast(msg, kind);
    },
    log: (...args: unknown[]) => {
      // eslint-disable-next-line no-console
      console.log('[scene-script]', ...args);
    },
  };

  // Compile once. Destructure the api so the script looks like it has
  // globals: `player.setSpeed(8)` vs `api.player.setSpeed(8)`.
  try {
    const body = `
      "use strict";
      const { onStart, onTick, onClick, player, coins, inventory, toast, log } = __api;
      ${source}
    `;
    const fn = new Function('__api', body) as (apiArg: unknown) => void;
    fn(api);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[scene-script] eval error', err);
    ctx.toast(`Script error: ${message}`, 'error');
  }

  return {
    hooks,
    fireStart() {
      for (const fn of hooks.onStart) {
        try { fn(); } catch (err) { console.error('[scene-script] onStart', err); }
      }
    },
    fireTick(dt: number) {
      for (const fn of hooks.onTick) {
        try { fn(dt); } catch (err) { console.error('[scene-script] onTick', err); }
      }
    },
    fireClick(prefabId: string) {
      const list = hooks.onClick.get(prefabId);
      if (!list || list.length === 0) return false;
      for (const fn of list) {
        try { fn(); } catch (err) { console.error('[scene-script] onClick', err); }
      }
      return true;
    },
    dispose() {
      hooks.onStart.length = 0;
      hooks.onTick.length = 0;
      hooks.onClick.clear();
    },
  };
}
