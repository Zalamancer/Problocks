/**
 * Tycoon-style game logic schema layered on top of the freeform 3D scene.
 *
 * The freeform scene stores objects (prefabs) as pure visual placement.
 * Game logic adds the missing piece: declarations of state variables
 * (coins), inventory/upgrade catalogs, behaviors attached to prefabs
 * (click→buy, tick→earn), and a HUD overlay.
 *
 * All of this is JSON-serializable so it persists alongside the scene
 * via the same Zustand persist middleware. The runtime (added in
 * slice 3+) reads these and binds Three.js raycast clicks / interval
 * ticks to the declared actions, with money authoritative on the
 * server (Supabase via /api/game-state/[gameId]/buy).
 *
 * v1 keeps the action vocabulary deliberately small — buy / earn /
 * buyUpgrade / grant — to prove the loop end-to-end before expanding.
 */

// --- Behaviors attached to scene objects -----------------------------

export type BehaviorTrigger = 'click' | 'tick';

/**
 * What happens when a behavior fires.
 *
 *   buy        — deduct cost from a serverside variable, optionally add
 *                an item id to inventory or spawn a prefab. Used for
 *                shop stalls that sell pets / unlock plots.
 *   buyUpgrade — deduct cost, add upgradeId to upgrades list, apply
 *                effect declared in the GameLogic.upgrades catalog.
 *   earn       — add `amount` to a variable. If `requires` is set,
 *                only fires when the player's inventory contains that
 *                id (used for pet income that only earns once owned).
 *   grant      — unconditional add to a variable. Starter podiums use
 *                this to seed initial coins.
 */
export type BehaviorAction =
  | {
      do: 'buy';
      /** Variable to deduct from (default: 'coins'). */
      from?: string;
      cost: number;
      /** Optional inventory id to add on success (e.g. pet kind). */
      addToInventory?: string;
      /** Optional prefab kind to spawn on success at the prefab's pos. */
      spawnPrefab?: string;
      /** Optional human-readable label for the buy action (HUD). */
      label?: string;
    }
  | {
      do: 'buyUpgrade';
      upgradeId: string;
    }
  | {
      do: 'earn';
      /** Variable to credit (default: 'coins'). */
      to?: string;
      amount: number;
      /** Inventory id required for earn to fire (skip without it). */
      requires?: string;
    }
  | {
      do: 'grant';
      to?: string;
      amount: number;
      /** When true, fires once per session and remembers (e.g. starter
          bonus). When false, repeats on every click — useful for an
          arcade-style "click for coin" cube. */
      oncePerSession?: boolean;
    };

export interface Behavior {
  on: BehaviorTrigger;
  action: BehaviorAction;
  /** Seconds between ticks. tick-only; ignored on click. Default 1. */
  interval?: number;
}

// --- Top-level game state declarations -------------------------------

/**
 * A named game-state variable. v1 only really needs `coins` but the
 * shape is generic so the agent can declare wood/gems/xp later without
 * a schema change.
 */
export interface VariableDef {
  name: string;
  initial: number;
  /** When true, the runtime mirrors mutations to /api/game-state and
      treats the server's value as truth. When false, the variable is
      client-only (e.g. last-clicked-shop highlight). */
  serverside: boolean;
  /** Optional human label for the HUD (defaults to capitalized name). */
  label?: string;
}

/**
 * A purchasable upgrade. The `effect` is a small declarative DSL —
 * v1 supports a multiply on a known target. The runtime applies the
 * effect once the upgrade lands in the player's `upgrades` list.
 */
export interface UpgradeDef {
  id: string;
  label: string;
  cost: number;
  effect:
    | {
        kind: 'multiply';
        target: 'earnRate' | 'playerSpeed' | 'jumpHeight';
        factor: number;
      }
    | {
        kind: 'unlock';
        /** Flag the runtime exposes — e.g. unlocks a gated shop stall. */
        flag: string;
      };
}

// --- HUD elements (DOM overlay, not Three.js) ------------------------

export type HUDAnchor = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type HUDElement =
  | {
      id: string;
      type: 'coinCounter';
      /** Variable name to display (default 'coins'). */
      bind: string;
      anchor: HUDAnchor;
    }
  | {
      id: string;
      type: 'inventory';
      anchor: HUDAnchor;
      /** Optional title (default "Inventory"). */
      title?: string;
    }
  | {
      id: string;
      type: 'upgradePanel';
      anchor: HUDAnchor;
      title?: string;
    };

// --- Container ------------------------------------------------------

export interface GameLogic {
  variables: Record<string, VariableDef>;
  upgrades: Record<string, UpgradeDef>;
  hud: HUDElement[];
}

export const EMPTY_GAME_LOGIC: GameLogic = {
  variables: {},
  upgrades: {},
  hud: [],
};

/**
 * Return a fresh GameLogic, optionally seeded with one or more
 * starter variables. Keeps the agent + tests from each writing the
 * same boilerplate.
 */
export function makeGameLogic(
  seed?: Partial<GameLogic>,
): GameLogic {
  return {
    variables: { ...(seed?.variables ?? {}) },
    upgrades: { ...(seed?.upgrades ?? {}) },
    hud: [...(seed?.hud ?? [])],
  };
}

/**
 * Tiny id helper for HUD elements so the agent can address them.
 * Mirrors makeId() in scene-schema.ts but with an `h_` prefix to
 * make HUD ids visually distinct from prefab ids.
 */
export function makeHUDId(): string {
  return `h_${Math.random().toString(36).slice(2, 10)}`;
}
