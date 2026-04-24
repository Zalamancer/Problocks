/**
 * Inverted-hull outline — the Pokopia/BOTW/Adopt-Me trick.
 *
 * Duplicate a mesh, push its vertices along their normals, render only
 * back faces, colour it dark. Cheap (just extra draw calls, no post-
 * process), per-object opt-in, composes with any camera. The single
 * biggest "kid-style" upgrade after switching to MeshToonMaterial.
 *
 * See docs/three-kid-style/03-outlines.md for the three alternative
 * methods (OutlineEffect addon, post-process edge-detection) and
 * why this one wins on Chromebook hardware.
 */

import * as THREE from 'three';
import { outlineColorFor } from './materials';

export interface OutlineOptions {
  /**
   * Outline color. If omitted, auto-derived from the mesh's base material
   * color (darkened in HSL) so each object gets a harmonized outline
   * instead of every mesh in the scene sharing the same pure black.
   */
  color?: THREE.ColorRepresentation;
  /** Push distance in world units. 0.02–0.04 for characters; 0.01 for tiny props. */
  thickness?: number;
  /**
   * Screen-space thickness. When true, far objects keep the same outline
   * thickness in pixels instead of shrinking with distance — the modern
   * Roblox / Pokopia look. Slightly more expensive.
   */
  screenSpace?: boolean;
  /** Draw order for the outline pass (default -1, i.e. before the main mesh). */
  renderOrder?: number;
}

const OUTLINE_USER_DATA_KEY = '__kidOutline';

/**
 * Build a shader material that pushes each vertex along its local normal.
 * Produces constant-thickness outlines regardless of mesh shape, unlike the
 * naïve "scale by a constant" approach which distorts on non-uniform meshes.
 */
function buildOutlineMaterial(opts: OutlineOptions, baseColor?: THREE.ColorRepresentation): THREE.ShaderMaterial {
  const color = new THREE.Color(
    opts.color ?? outlineColorFor(baseColor ?? '#999999'),
  );
  const thickness = opts.thickness ?? 0.03;

  // NOTE: InstancedMesh support requires applying `instanceMatrix` in
  // the shader. Without it, every outline instance collapses onto the
  // parent's origin, painting ghost outlines on the ground at the base
  // of every tree / bush / cloud / flower. THREE sets USE_INSTANCING
  // automatically for ShaderMaterial when the renderer sees an
  // InstancedMesh, so guarding the transform with `#ifdef` keeps the
  // non-instanced path identical.
  const vertex = opts.screenSpace
    ? `
      uniform float thickness;
      void main() {
        #ifdef USE_INSTANCING
          vec4 viewPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          float depth = -viewPos.z;
          vec4 pushed = instanceMatrix * vec4(position + normal * thickness * depth, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * pushed;
        #else
          vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
          float depth = -viewPos.z;
          vec3 pushed = position + normal * thickness * depth;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pushed, 1.0);
        #endif
      }
    `
    : `
      uniform float thickness;
      void main() {
        vec4 pushed = vec4(position + normal * thickness, 1.0);
        #ifdef USE_INSTANCING
          pushed = instanceMatrix * pushed;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * pushed;
      }
    `;

  return new THREE.ShaderMaterial({
    uniforms: {
      thickness: { value: thickness },
      outlineColor: { value: color },
    },
    vertexShader: vertex,
    fragmentShader: `
      uniform vec3 outlineColor;
      void main() { gl_FragColor = vec4(outlineColor, 1.0); }
    `,
    side: THREE.BackSide,
    // We don't want outlines to blend into fog — the silhouette should stay
    // crisp even on distant props.
    fog: false,
  });
}

/**
 * Attach an inverted-hull outline to a mesh. The outline is parented to
 * the source mesh so it inherits position/rotation/scale automatically —
 * you never have to re-sync it when animating.
 *
 * Also handles THREE.InstancedMesh: the outline is itself an
 * InstancedMesh that shares the same geometry AND the same instanceMatrix
 * buffer, so updating instance transforms on the source automatically
 * updates the outline too. Both the source and outline draw in a single
 * draw call each (not per-instance), keeping the performance win of
 * instancing intact.
 */
export function addOutline(mesh: THREE.Mesh, opts: OutlineOptions = {}): THREE.Mesh {
  // Idempotent: calling twice doesn't stack outlines.
  const existing = mesh.userData[OUTLINE_USER_DATA_KEY] as THREE.Mesh | undefined;
  if (existing) return existing;

  const baseColor =
    (mesh.material as THREE.MeshStandardMaterial | undefined)?.color?.getHex?.() ??
    undefined;
  const outlineMat = buildOutlineMaterial(opts, baseColor);

  // InstancedMesh needs its own InstancedMesh outline; regular mesh gets
  // a Mesh outline. Both share the source geometry.
  const inst = mesh as THREE.InstancedMesh;
  const outline: THREE.Mesh = inst.isInstancedMesh
    ? (() => {
        const om = new THREE.InstancedMesh(mesh.geometry, outlineMat, inst.count);
        // Share the matrix buffer so instance transforms only need to be
        // written once. The source already holds the canonical copy.
        om.instanceMatrix = inst.instanceMatrix;
        om.count = inst.count;
        return om;
      })()
    : new THREE.Mesh(mesh.geometry, outlineMat);

  outline.renderOrder = opts.renderOrder ?? -1;
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.frustumCulled = mesh.frustumCulled;
  outline.name = `${mesh.name || 'mesh'}__outline`;

  mesh.add(outline);
  mesh.userData[OUTLINE_USER_DATA_KEY] = outline;
  return outline;
}

/** Walk a subtree adding outlines to every Mesh found. Skips already-outlined ones. */
export function addOutlinesToTree(root: THREE.Object3D, opts: OutlineOptions = {}): void {
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    // Don't re-outline the outline itself.
    if (obj.name.endsWith('__outline')) return;
    addOutline(obj as THREE.Mesh, opts);
  });
}

export function removeOutline(mesh: THREE.Mesh): void {
  const outline = mesh.userData[OUTLINE_USER_DATA_KEY] as THREE.Mesh | undefined;
  if (!outline) return;
  mesh.remove(outline);
  (outline.material as THREE.Material).dispose?.();
  delete mesh.userData[OUTLINE_USER_DATA_KEY];
}
