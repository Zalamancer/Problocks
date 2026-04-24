/**
 * Apply WorldSettings onto a running KidEngine. Kept separate from the
 * engine boot so the engine stays framework-free and the store can be
 * swapped / extended without retouching engine.ts.
 *
 * - `applyWorld` mutates lights, fog, sky color, and materials in place.
 *   Idempotent — safe to call on every store change.
 * - `collectStats` walks the scene root and sums vertex/triangle counts
 *   for the stats HUD.
 */

import * as THREE from 'three';
import type { KidEngine } from './engine';

export interface WorldLike {
  skyColor: string;
  brightness: number;
  ambient: number;
  timeOfDay: number;
  fogDensity: number;
  wireframe: boolean;
  showVertices: boolean;
}

interface EngineLightRefs {
  key: THREE.DirectionalLight | null;
  hemi: THREE.HemisphereLight | null;
  fill: THREE.DirectionalLight | null;
}

function findLights(scene: THREE.Scene): EngineLightRefs {
  let key: THREE.DirectionalLight | null = null;
  let hemi: THREE.HemisphereLight | null = null;
  let fill: THREE.DirectionalLight | null = null;
  scene.traverse((o) => {
    if ((o as THREE.DirectionalLight).isDirectionalLight) {
      const d = o as THREE.DirectionalLight;
      if (!key) key = d;
      else if (!fill) fill = d;
    } else if ((o as THREE.HemisphereLight).isHemisphereLight) {
      hemi = o as THREE.HemisphereLight;
    }
  });
  return { key, hemi, fill };
}

/** World → engine. Pure mutation; call once per change. */
export function applyWorld(engine: KidEngine, w: WorldLike): void {
  const { scene, renderer, root } = engine;

  // Sky background is owned by the engine's theme system (CanvasTexture
  // gradient) — intentionally NOT overridden here so swapping a theme
  // reads correctly. The legacy `skyColor` field is kept for agent /
  // /api/agent consumers but ignored on the freeform3d viewport.

  if (scene.fog) {
    const fog = scene.fog as THREE.Fog;
    // Default fog is 45..110 at density 1. Lower density pushes far out.
    const density = Math.max(0, Math.min(1, w.fogDensity));
    fog.near = 45 + (1 - density) * 60;
    fog.far = 110 + (1 - density) * 120;
    // Fog color is also theme-driven (see engine's onThemeChange).
  }

  const { key, hemi } = findLights(scene);
  if (key) {
    key.intensity = w.brightness;
    // timeOfDay — sweep a half-dome. 6h = sunrise (east low), 12h overhead,
    // 18h sunset (west low), 0h/24h = night (below horizon, clamp to 0.1
    // so the scene never goes totally black).
    const t = ((w.timeOfDay % 24) + 24) % 24; // 0..24
    const theta = ((t - 6) / 12) * Math.PI; // 0..π across the day
    const nightK = t < 5 || t > 19 ? 0.15 : 1;
    const radius = 18;
    key.position.set(
      radius * Math.cos(theta),
      Math.max(2, radius * Math.sin(theta)),
      radius * 0.4 * Math.sin(theta + 0.6),
    );
    key.intensity = w.brightness * nightK;
    key.color.set(t < 6 || t > 18 ? 0xffd0a0 : 0xfff4d0);
  }
  if (hemi) {
    hemi.intensity = w.ambient;
  }

  // Exposure stays around 1.15 but scales gently with ambient for a
  // "brighter world" feel without blowing out toon bands.
  renderer.toneMappingExposure = 1.0 + w.ambient * 0.15;

  // Wireframe / vertex display walk user objects only (leave ground
  // planes alone — they turn into a giant checkerboard and hide the
  // plot).
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.Material | THREE.Material[];
    const setWire = (m: THREE.Material) => {
      // MeshToonMaterial / Lambert / Standard all share the `wireframe`
      // flag. Guard via `in` to keep types clean.
      if ('wireframe' in m) (m as THREE.MeshBasicMaterial).wireframe = w.wireframe;
    };
    if (Array.isArray(mat)) mat.forEach(setWire);
    else setWire(mat);
  });

  // Vertex dots overlay — attach/detach a Points child per mesh under
  // root. Skip InstancedMesh: a Points child would only show the base
  // geometry's verts (not transformed by instanceMatrix), which is
  // misleading. Tag our overlays with `userData.__vertexOverlay` so
  // reapplying doesn't duplicate them.
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if ((mesh as THREE.InstancedMesh).isInstancedMesh) return;
    const existing = mesh.children.find(
      (c) => (c as THREE.Object3D).userData.__vertexOverlay,
    ) as THREE.Points | undefined;
    if (w.showVertices) {
      if (!existing) {
        const geo = mesh.geometry;
        const mat = new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.06,
          sizeAttenuation: true,
          depthTest: false,
          transparent: true,
          opacity: 0.95,
        });
        const pts = new THREE.Points(geo, mat);
        pts.userData.__vertexOverlay = true;
        pts.renderOrder = 999;
        mesh.add(pts);
      }
    } else if (existing) {
      mesh.remove(existing);
      (existing.material as THREE.Material).dispose();
    }
  });
}

export interface SceneStats {
  vertices: number;
  triangles: number;
  meshes: number;
}

/** Walk root children and sum per-frame vertex / triangle work. For an
    InstancedMesh with N instances, the GPU processes geometry.verts × N
    per frame — we scale by count so the number reflects what the GPU is
    actually doing, not the unique-geometry size. Skips outlines (their
    geometry is shared with a visible source mesh already counted) and
    vertex-overlay Points. */
export function collectStats(root: THREE.Object3D): SceneStats {
  let vertices = 0;
  let triangles = 0;
  let meshes = 0;
  root.traverse((obj) => {
    if (obj.userData.__vertexOverlay) return;
    if (obj.name?.endsWith('__outline')) return;
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry;
    if (!geo) return;
    const pos = geo.attributes.position;
    if (!pos) return;
    const inst = mesh as THREE.InstancedMesh;
    const instances = inst.isInstancedMesh ? inst.count : 1;
    vertices += pos.count * instances;
    const trisPerInstance = geo.index ? geo.index.count / 3 : pos.count / 3;
    triangles += trisPerInstance * instances;
    meshes += 1;
  });
  return { vertices: Math.round(vertices), triangles: Math.round(triangles), meshes };
}
