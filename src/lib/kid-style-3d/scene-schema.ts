/**
 * Scene JSON schema for the 3D Freeform studio.
 *
 * Every object in the scene is described by a small record — position,
 * rotation, scale, a prefab kind, and an optional per-instance color.
 * The hydrator (`hydrate.ts`) turns an array of these into a Three.js
 * scene graph, and the reverse serializes the graph back to JSON for
 * save/load.
 *
 * Storing scenes as JSON (not as Three.js objects) is the whole trick
 * behind the kid-style studio: AI generation or save/load work on ~5–20
 * bytes per object instead of hundreds of lines of Three.js setup. See
 * pxEngine.js in the repo for the 2D precedent.
 */

export type Vec3 = [number, number, number];

export interface SceneObject {
  /** Stable identifier across save/load and undo/redo. */
  id: string;

  /**
   * Which prefab builder constructed this object — maps to a key in
   * PREFABS. Both primitives (rounded-box, sphere, cylinder, cone) and
   * compound prefabs (tree, house, fence, character) share this field.
   */
  kind: string;

  /** World-space position of the object's origin. */
  position: Vec3;

  /** Euler rotation in radians (XYZ intrinsic). */
  rotation: Vec3;

  /** Uniform or per-axis scale. */
  scale: Vec3;

  /**
   * Per-instance color override. Prefabs that accept a color use this;
   * others ignore it. Stored as a CSS hex string so JSON stays readable.
   */
  color?: string;

  /**
   * Free-form per-prefab options — e.g. tree species, house roof color,
   * fence length. Kept as Record<string, unknown> so each prefab defines
   * its own shape without polluting the shared schema.
   */
  props?: Record<string, unknown>;
}

export interface SceneJson {
  /** Schema version — bump when making a breaking change to the shape. */
  version: 1;
  objects: SceneObject[];
  meta?: {
    name?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const EMPTY_SCENE: SceneJson = {
  version: 1,
  objects: [],
};

/** Tiny id generator; avoids bringing uuid in for this. */
export function makeId(): string {
  return `o_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeSceneObject(kind: string, patch?: Partial<SceneObject>): SceneObject {
  return {
    id: makeId(),
    kind,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    ...patch,
  };
}
