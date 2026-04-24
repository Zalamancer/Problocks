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

  scene.background = new THREE.Color(w.skyColor);

  if (scene.fog) {
    const fog = scene.fog as THREE.Fog;
    // Default fog is 30..85 at density 1. Lower density pushes far out.
    const density = Math.max(0, Math.min(1, w.fogDensity));
    fog.near = 30 + (1 - density) * 60;
    fog.far = 85 + (1 - density) * 120;
    fog.color.set(w.skyColor).lerp(new THREE.Color(0xffffff), 0.2);
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
  // root. We tag our overlays with `userData.__vertexOverlay` so reapplying
  // doesn't duplicate them.
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
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
    }
  });
}

export interface SceneStats {
  vertices: number;
  triangles: number;
  meshes: number;
}

/** Walk root children and sum geometry vertex / triangle counts. Skips
    outlines and vertex-overlay Points so the count reflects the user's
    actual scene. */
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
    vertices += pos.count;
    if (geo.index) triangles += geo.index.count / 3;
    else triangles += pos.count / 3;
    meshes += 1;
  });
  return { vertices: Math.round(vertices), triangles: Math.round(triangles), meshes };
}
