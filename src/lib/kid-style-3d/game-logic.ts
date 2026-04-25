/**
 * Pure mutator helpers for GameLogic and per-prefab Behavior arrays.
 *
 * Kept separate from the Zustand store so:
 *   - The agent route (server-side) can validate + normalize ACTION
 *     payloads using the same code the client store uses.
 *   - Tests can mutate plain JSON without touching React.
 *   - The store stays a thin wrapper that only handles history /
 *     persistence, not domain logic.
 *
 * Every function returns NEW data — callers stay immutable-friendly.
 */

import type { SceneObject } from './scene-schema';
import type {
  Behavior,
  GameLogic,
  HUDElement,
  UpgradeDef,
  VariableDef,
} from './game-logic-schema';
import { EMPTY_GAME_LOGIC } from './game-logic-schema';

// --- Behaviors on prefabs --------------------------------------------

/**
 * Append a behavior to the named prefab's behavior list. Silent no-op
 * if the prefab id isn't found — the agent occasionally references
 * stale ids and we'd rather drop the action than crash the scene.
 */
export function attachBehavior(
  objects: SceneObject[],
  prefabId: string,
  behavior: Behavior,
): SceneObject[] {
  return objects.map((o) =>
    o.id === prefabId
      ? { ...o, behaviors: [...(o.behaviors ?? []), behavior] }
      : o,
  );
}

/**
 * Remove the behavior at `index` from a prefab. Out-of-range index is
 * a silent no-op (same reasoning as attachBehavior).
 */
export function detachBehavior(
  objects: SceneObject[],
  prefabId: string,
  index: number,
): SceneObject[] {
  return objects.map((o) => {
    if (o.id !== prefabId) return o;
    const list = o.behaviors ?? [];
    if (index < 0 || index >= list.length) return o;
    const next = list.filter((_, i) => i !== index);
    return { ...o, behaviors: next.length ? next : undefined };
  });
}

/** Strip every behavior from one prefab. */
export function clearBehaviors(
  objects: SceneObject[],
  prefabId: string,
): SceneObject[] {
  return objects.map((o) =>
    o.id === prefabId ? { ...o, behaviors: undefined } : o,
  );
}

// --- Variables --------------------------------------------------------

/** Add or replace a variable definition. Existing initial value lost
    on overwrite — that's intentional: re-defining is how the agent
    "resets" a variable. */
export function defineVariable(logic: GameLogic, def: VariableDef): GameLogic {
  return { ...logic, variables: { ...logic.variables, [def.name]: def } };
}

export function removeVariable(logic: GameLogic, name: string): GameLogic {
  if (!(name in logic.variables)) return logic;
  const next = { ...logic.variables };
  delete next[name];
  return { ...logic, variables: next };
}

// --- Upgrades --------------------------------------------------------

export function defineUpgrade(logic: GameLogic, def: UpgradeDef): GameLogic {
  return { ...logic, upgrades: { ...logic.upgrades, [def.id]: def } };
}

export function removeUpgrade(logic: GameLogic, id: string): GameLogic {
  if (!(id in logic.upgrades)) return logic;
  const next = { ...logic.upgrades };
  delete next[id];
  return { ...logic, upgrades: next };
}

// --- HUD --------------------------------------------------------------

export function addHUDElement(logic: GameLogic, el: HUDElement): GameLogic {
  // Replace by id if it already exists — keeps the agent idempotent
  // when it re-emits the same HUD declaration.
  const without = logic.hud.filter((h) => h.id !== el.id);
  return { ...logic, hud: [...without, el] };
}

export function removeHUDElement(logic: GameLogic, id: string): GameLogic {
  const next = logic.hud.filter((h) => h.id !== id);
  if (next.length === logic.hud.length) return logic;
  return { ...logic, hud: next };
}

// --- Hydration --------------------------------------------------------

/** Fill in missing structure on a partially-loaded GameLogic so
    consumers can rely on every field being non-null. Used by the
    persist rehydrate path and importSceneJSON. */
export function normalizeGameLogic(input: GameLogic | undefined): GameLogic {
  if (!input) return { ...EMPTY_GAME_LOGIC };
  return {
    variables: { ...(input.variables ?? {}) },
    upgrades: { ...(input.upgrades ?? {}) },
    hud: Array.isArray(input.hud) ? [...input.hud] : [],
  };
}
