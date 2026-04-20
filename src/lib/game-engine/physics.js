/**
 * Problocks Physics System
 * Simple AABB collision detection and basic movement helpers.
 */
export function createPhysics() {
  let gravity = 0;
  const collisionPairs = []; // [{typeA, typeB}] — which types to check

  return {
    /** Set gravity (pixels/sec^2, applied to vy) */
    setGravity(g) { gravity = g; },

    /** Register a collision pair to check each frame */
    addCollisionPair(typeA, typeB) {
      collisionPairs.push({ typeA, typeB });
    },

    /** Distance between two entities (2D or 3D) */
    distance(a, b) {
      const dx = a.x - b.x, dy = a.y - b.y, dz = (a.z || 0) - (b.z || 0);
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    /** AABB overlap check (2D) */
    overlap(a, b) {
      return (
        a.x - a.width / 2 < b.x + b.width / 2 &&
        a.x + a.width / 2 > b.x - b.width / 2 &&
        a.y - a.height / 2 < b.y + b.height / 2 &&
        a.y + a.height / 2 > b.y - b.height / 2
      );
    },

    /** Sphere overlap check (3D) */
    overlapSphere(a, b, radiusA, radiusB) {
      return this.distance(a, b) < radiusA + radiusB;
    },

    /** Move entities by velocity * dt, apply gravity — called by engine */
    _update(entities, dt) {
      for (const e of entities) {
        if (gravity) e.vy += gravity * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.z += (e.vz || 0) * dt;
      }
    },

    /** Check registered collision pairs — called by engine */
    _checkCollisions(entitySystem, game) {
      for (const { typeA, typeB } of collisionPairs) {
        const listA = entitySystem.query(typeA);
        const listB = typeA === typeB ? listA : entitySystem.query(typeB);

        for (const a of listA) {
          for (const b of listB) {
            if (a === b || !a._alive || !b._alive) continue;
            if (this.overlap(a, b)) {
              if (a._def.onCollide) a._def.onCollide(a, b, game);
              if (b._def.onCollide) b._def.onCollide(b, a, game);
            }
          }
        }
      }
    },
  };
}
