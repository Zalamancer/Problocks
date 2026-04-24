/**
 * Small module-level handoff so the Assets panel (which has no direct
 * reference to the Three.js camera/OrbitControls) can still spawn
 * prefabs near what the user is currently looking at.
 *
 * `FreeformView3D` registers a provider on mount that reads its orbit
 * target. The Assets panel calls `getSpawnTarget()` when a tile is
 * clicked. When no provider is registered (e.g. during SSR or before
 * the viewport mounts) the getter returns [0, 0, 0] so callers can
 * still spawn safely.
 *
 * A small random jitter is applied on top of the target so repeated
 * clicks don't stack the same prefab at the identical point.
 */

import type { Vec3 } from './scene-schema';

type Provider = () => Vec3;

let provider: Provider | null = null;

export function setSpawnTargetProvider(fn: Provider | null): void {
  provider = fn;
}

export function getSpawnTarget(): Vec3 {
  return provider ? provider() : [0, 0, 0];
}

/** Spawn position = current target + small xz jitter, y clamped to 0 so
    prefabs always land on the ground plane. */
export function getSpawnPosition(jitter: number = 1.5): Vec3 {
  const [x, , z] = getSpawnTarget();
  const jx = (Math.random() - 0.5) * jitter;
  const jz = (Math.random() - 0.5) * jitter;
  return [x + jx, 0, z + jz];
}
