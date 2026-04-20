// Mesh-building helpers for wardrobe items. All builders return a group
// placed at the origin — the AvatarScene moves each group to its mount
// (head top, torso back, etc.).
import * as THREE from 'three';

const STROKE = 0x1d1a14;

export function mat(color: string | number, opts: { rough?: number; metal?: number } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.rough ?? 0.8,
    metalness: opts.metal ?? 0.0,
  });
}

export function rbox(w: number, h: number, d: number, _r = 0.08): THREE.BufferGeometry {
  // Plain BoxGeometry — name kept for compat with builders. Radius ignored
  // to keep vert counts Chromebook-friendly.
  void _r;
  return new THREE.BoxGeometry(w, h, d);
}

/** Wrap a mesh in a group and add dark edge lines for chunky readability. */
export function edged(mesh: THREE.Mesh, color: number = STROKE): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry, 28),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 }),
  );
  mesh.add(edges);
  return g;
}

/** Make a rounded-box mesh with edges, positioned at (x,y,z). */
export function block(
  w: number, h: number, d: number,
  color: string | number,
  x = 0, y = 0, z = 0,
  r = 0.1,
): THREE.Group {
  const m = new THREE.Mesh(rbox(w, h, d, r), mat(color));
  m.position.set(x, y, z);
  return edged(m);
}

/** Sphere mesh with edges-like outline. Used for blush, poms, pet eyes. */
export function sphere(
  radius: number, color: string | number,
  x = 0, y = 0, z = 0,
  segments = 12,
): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, Math.max(6, segments - 2)),
    mat(color, { rough: 0.7 }),
  );
  m.position.set(x, y, z);
  return m;
}
