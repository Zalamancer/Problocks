/**
 * Slice 7 — visual ball-kick arc. No physics. The ball is a small
 * sphere that tweens along a parabolic curve for `duration` seconds
 * and lands at a target distance along world +X (with a configurable
 * forward direction). When the tween finishes, the sphere is removed
 * from the scene and `onLand(distance)` is called with the final
 * ground distance in world units.
 *
 * Why kept local (not a SceneObject): adding every kick ball as a
 * permanent scene object would pollute the save file and the agent's
 * snapshot. This helper bypasses the store entirely — adds a plain
 * THREE.Mesh to the engine root for the tween's lifetime and removes
 * it when done.
 *
 * Called from FreeformView3D's play-mode click handler when it
 * encounters a `kickBall` behavior.
 */

import * as THREE from 'three';

export interface KickBallOptions {
  /** Engine scene root; the ball is added here so it follows the
      world transform + picks up lighting/fog. */
  root: THREE.Object3D;
  /** Ball launch point in world coords. Usually the kick-pad's
      position + a small forward offset. */
  start: THREE.Vector3;
  /** Unit-vector forward direction the ball travels. Defaults to +X. */
  forward?: THREE.Vector3;
  /** Base distance-per-second. Typical 6–15 for a feel-good arc. */
  baseSpeed: number;
  /** Flight time in seconds. Typical 1.0–1.8. */
  duration: number;
  /** Multiplier applied to baseSpeed from owned kickRange upgrades. */
  speedMul: number;
  /** Arc height at apex, world units. Defaults to a modest pop. */
  arcHeight?: number;
  /** Ball radius in world units. Defaults to soccer-ball-ish. */
  radius?: number;
  /** CSS hex color. Defaults to white. */
  color?: string;
  /** Fired once when the tween finishes. `distance` is world units
      along the forward vector. */
  onLand: (distance: number) => void;
}

/**
 * Spawn a ball, tween its position, despawn on complete. Returns a
 * cancel function so the caller (e.g. entering edit mode mid-kick)
 * can abort the animation + clean up.
 */
export function spawnKickBall(opts: KickBallOptions): () => void {
  const {
    root,
    start,
    forward = new THREE.Vector3(1, 0, 0),
    baseSpeed,
    duration,
    speedMul,
    arcHeight = 2.4,
    radius = 0.22,
    color = '#ffffff',
    onLand,
  } = opts;

  // Normalize forward so `distance` is meaningful regardless of the
  // caller's vector magnitude.
  const dir = forward.clone();
  if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
  else dir.normalize();

  const totalDistance = baseSpeed * duration * Math.max(0.1, speedMul);

  // Geometry is tiny + cheap; no reason to pool for the single ball
  // at a time the viewer fires. If we ever support multi-ball, share
  // a cached geometry + material through the engine's kid-style cache.
  const geo = new THREE.SphereGeometry(radius, 12, 10);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.45,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(start);
  mesh.castShadow = true;
  root.add(mesh);

  const startTs = performance.now();
  let frame = 0;
  let cancelled = false;

  function tick() {
    if (cancelled) return;
    const now = performance.now();
    const t = Math.min(1, (now - startTs) / (duration * 1000));

    // Parabolic arc: y = 4h t (1 - t). Hits 0 at t=0 and t=1, peaks h at t=0.5.
    const y = 4 * arcHeight * t * (1 - t);
    const travel = totalDistance * t;
    mesh.position.set(
      start.x + dir.x * travel,
      start.y + y,
      start.z + dir.z * travel,
    );
    // Spin the ball so it reads as kicked, not levitated.
    mesh.rotation.x = t * Math.PI * 4;
    mesh.rotation.z = t * Math.PI * 2;

    if (t >= 1) {
      // Clean up geometry/material — these are per-kick and disposing
      // avoids a memory bump when the user kicks many times per minute.
      root.remove(mesh);
      geo.dispose();
      mat.dispose();
      onLand(totalDistance);
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    if (mesh.parent) mesh.parent.remove(mesh);
    geo.dispose();
    mat.dispose();
  };
}
