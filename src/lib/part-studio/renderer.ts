/**
 * Part Studio renderer — turns a PartModel (primitive JSON) into a
 * THREE.Group of low-poly meshes. Kept deliberately minimal so Claude's
 * vocabulary (box / cylinder / sphere / wedge) maps cleanly to a single
 * geometry constructor per shape, with segment counts pinned to the
 * smallest value that still looks intentional rather than broken.
 */
import * as THREE from 'three';
import type { PartModel, Primitive } from './types';

const DEG = Math.PI / 180;

/** Triangular right-prism — 6 vertices, 8 faces. Used for wedge shape. */
function makeWedgeGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  // Verts: 3 per end cap. Triangle rises from front-bottom to back-top.
  const verts = new Float32Array([
    // front face (z = +hd): right-triangle, hypotenuse front-top→back-bottom
    -hw, -hh,  hd,   // 0  front bottom-left
     hw, -hh,  hd,   // 1  front bottom-right
    -hw,  hh,  hd,   // 2  front top-left
    // back face (z = -hd)
    -hw, -hh, -hd,   // 3
     hw, -hh, -hd,   // 4
    -hw,  hh, -hd,   // 5
  ]);
  const idx = [
    // front triangle
    0, 1, 2,
    // back triangle (reversed winding so normal faces -z)
    3, 5, 4,
    // bottom quad (two tris)
    0, 3, 4,
    0, 4, 1,
    // left-vertical quad
    0, 2, 5,
    0, 5, 3,
    // hypotenuse quad (top slope)
    1, 4, 5,
    1, 5, 2,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function makeGeometry(p: Primitive): THREE.BufferGeometry {
  const [sx, sy, sz] = p.size;
  switch (p.shape) {
    case 'box':
      return new THREE.BoxGeometry(sx, sy, sz);
    case 'cylinder':
      // Use x as radius (size[0]), y as height, z ignored (symmetric).
      return new THREE.CylinderGeometry(sx, sx, sy, 8);
    case 'sphere':
      // IcosahedronGeometry(r, 0) = 12 verts, nicely faceted for low-poly.
      return new THREE.IcosahedronGeometry(sx, 0);
    case 'wedge':
      return makeWedgeGeometry(sx, sy, sz);
  }
}

/**
 * Build a THREE.Group from a PartModel. Flat-shaded MeshStandardMaterial
 * per primitive — one material per unique color keeps material count low
 * without forcing shared buffers.
 */
export function buildPartGroup(model: PartModel): THREE.Group {
  const group = new THREE.Group();
  group.name = model.name;
  const materialCache = new Map<string, THREE.Material>();

  for (const prim of model.parts) {
    const geo = makeGeometry(prim);
    let mat = materialCache.get(prim.color);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({
        color: prim.color,
        flatShading: true,
        roughness: 0.85,
        metalness: 0,
      });
      materialCache.set(prim.color, mat);
    }
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(prim.pos[0], prim.pos[1], prim.pos[2]);
    if (prim.rot) {
      mesh.rotation.set(prim.rot[0] * DEG, prim.rot[1] * DEG, prim.rot[2] * DEG);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  return group;
}

/** Dispose every geometry + material in a group created by buildPartGroup. */
export function disposePartGroup(group: THREE.Group): void {
  const seenMats = new Set<THREE.Material>();
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const m = mesh.material;
    if (!m) return;
    if (Array.isArray(m)) m.forEach((x) => seenMats.add(x));
    else seenMats.add(m);
  });
  for (const m of seenMats) m.dispose();
}
