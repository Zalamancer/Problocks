/**
 * Unified translate + rotate + scale gizmo — vanilla Three.js port of
 * autoStudio/AutoAnimation/src/components/canvas/UnifiedGizmo3D.tsx.
 *
 * Visual design is identical to the R3F original (octant style):
 *  • Quarter arcs — CatmullRomCurve3 → TubeGeometry (XY=cyan, XZ=red, YZ=blue)
 *  • Axis arrows — CylinderGeometry shafts + ConeGeometry tips (R=Y, B=X, C=Z)
 *  • Cube nodes — BoxGeometry at axis endpoints with invisible hitboxes
 *  • Gray circle discs — CircleGeometry at plane intersection points
 *  • Ghost rings — TorusGeometry with low opacity
 *  • Gold hover highlight (0xf0c030)
 *
 * Interaction (identical to the R3F original):
 *  • tryPointerDown() checks hit-meshes; on hit, disables OrbitControls and
 *    installs window pointermove/pointerup to run the drag.
 *  • translate-x/y/z, rotate-x/y/z, scale-x/y/z, scale-uniform via center discs
 *  • onChange() fires continuously during drag (with live target transforms).
 *  • onCommit() fires once on pointerup, suitable for writing to a store.
 */
import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type GizmoHandle =
  | 'translate-x' | 'translate-y' | 'translate-z'
  | 'rotate-x' | 'rotate-y' | 'rotate-z'
  | 'scale-x' | 'scale-y' | 'scale-z'
  | 'scale-uniform'
  | null;

export interface GizmoDeps {
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  /** Gizmo size multiplier (default 1) */
  size?: number;
  /** Fired continuously during drag — target transforms are live. */
  onChange?: () => void;
  /** Fired once on pointerup — good place to write to a store. */
  onCommit?: () => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

// Octant color palette
const RED  = 0xea4050;
const BLUE = 0x3888f0;
const CYAN = 0x10d0a0;
const GRAY = 0x808080;
const GOLD = 0xf0c030;

// Dimensions
const ARC_R    = 1.45;  // Quarter arc radius
const ARC_TUBE = 0.032; // Arc tube thickness
const AXIS_LEN = 2.2;   // Arrow shaft length
const CUBE_SIZE = 0.13; // Cube visual size
const CUBE_HIT  = 0.4;  // Cube invisible hitbox size
const DISC_R   = 0.1;   // Gray disc radius
const DISC_IN  = 0.45;  // Disc inset from origin
const GHOST_R  = 1.75;  // Ghost ring radius

// ─── Axis directions ────────────────────────────────────────────────────────

const AXIS_DIR: Record<'x' | 'y' | 'z', THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

// ─── Shared materials helper ────────────────────────────────────────────────

function makeMat(color: number, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

// ─── Helper: project a world-space drag to an axis ──────────────────────────

const _plane = new THREE.Plane();
const _intersection = new THREE.Vector3();

function projectOnAxis(
  ray: THREE.Raycaster,
  origin: THREE.Vector3,
  axisDir: THREE.Vector3,
  camera: THREE.Camera,
): THREE.Vector3 | null {
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);

  const camCross = new THREE.Vector3().crossVectors(camDir, axisDir);
  const planeNormal = new THREE.Vector3().crossVectors(axisDir, camCross).normalize();

  if (planeNormal.lengthSq() < 0.0001) {
    planeNormal.copy(camDir);
  }

  _plane.setFromNormalAndCoplanarPoint(planeNormal, origin);

  if (!ray.ray.intersectPlane(_plane, _intersection)) return null;

  const t = _intersection.clone().sub(origin).dot(axisDir);
  return origin.clone().add(axisDir.clone().multiplyScalar(t));
}

function projectOnRotationPlane(
  ray: THREE.Raycaster,
  origin: THREE.Vector3,
  axisDir: THREE.Vector3,
): THREE.Vector3 | null {
  _plane.setFromNormalAndCoplanarPoint(axisDir, origin);
  if (!ray.ray.intersectPlane(_plane, _intersection)) return null;
  return _intersection.clone();
}

// ─── Quarter arc geometry builder ───────────────────────────────────────────

function buildQuarterArcPoints(plane: 'xy' | 'xz' | 'yz'): THREE.Vector3[] {
  const N = 36;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * (Math.PI / 2);
    const c = Math.cos(t);
    const s = Math.sin(t);
    if (plane === 'xy') pts.push(new THREE.Vector3(ARC_R * c, ARC_R * s, 0));
    else if (plane === 'xz') pts.push(new THREE.Vector3(ARC_R * s, 0, ARC_R * c));
    else pts.push(new THREE.Vector3(0, ARC_R * s, ARC_R * c));
  }
  return pts;
}

function buildQuarterArcGeometry(plane: 'xy' | 'xz' | 'yz'): THREE.TubeGeometry {
  const pts = buildQuarterArcPoints(plane);
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 36, ARC_TUBE, 8, false);
}

/** Thicker invisible tube for easier raycasting on arcs */
function buildQuarterArcHitGeometry(plane: 'xy' | 'xz' | 'yz'): THREE.TubeGeometry {
  const pts = buildQuarterArcPoints(plane);
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 36, 0.12, 8, false); // 4× thicker hit area
}

// ═══════════════════════════════════════════════════════════════════════════

type BaseColor = 'red' | 'blue' | 'cyan' | 'gray';

interface DragState {
  handle: Exclude<GizmoHandle, null>;
  startPos: THREE.Vector3;
  startQuat: THREE.Quaternion;
  startScale: THREE.Vector3;
  startAngle: number;
  startAxisPoint: THREE.Vector3;
  origin: THREE.Vector3;
  axisWorld: THREE.Vector3;
}

export class UnifiedGizmo3D {
  /** Add this to your scene. Its position/scale is managed by update(). */
  readonly group: THREE.Group;

  private target: THREE.Object3D | null = null;
  private size: number;

  private hovered: GizmoHandle = null;
  private dragging: GizmoHandle = null;
  private dragStart: DragState | null = null;

  /** Visual meshes keyed by handle — used to swap base ↔ gold on hover. */
  private visualsByHandle: Map<Exclude<GizmoHandle, null>, Array<{ mesh: THREE.Mesh; base: BaseColor }>> = new Map();
  /** All invisible hitbox meshes — the raycast set. */
  private hitMeshes: THREE.Mesh[] = [];

  private materials!: {
    red: THREE.MeshBasicMaterial;
    blue: THREE.MeshBasicMaterial;
    cyan: THREE.MeshBasicMaterial;
    gray: THREE.MeshBasicMaterial;
    gold: THREE.MeshBasicMaterial;
    ghost: THREE.MeshBasicMaterial;
    invisible: THREE.MeshBasicMaterial;
  };

  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private onChange?: () => void;
  private onCommit?: () => void;

  /** Private raycaster so we don't pollute the caller's raycaster state. */
  private raycaster = new THREE.Raycaster();

  // Reused scratch vectors
  private _worldPos = new THREE.Vector3();
  private _localPos = new THREE.Vector3();
  private _parentInv = new THREE.Matrix4();

  constructor(deps: GizmoDeps) {
    this.camera = deps.camera;
    this.renderer = deps.renderer;
    this.controls = deps.controls;
    this.size = deps.size ?? 1;
    this.onChange = deps.onChange;
    this.onCommit = deps.onCommit;

    this.group = new THREE.Group();
    this.group.name = 'UnifiedGizmo3D';
    this.group.renderOrder = 999;
    this.group.visible = false;

    this.buildMaterials();
    this.buildScene();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  attach(target: THREE.Object3D): void {
    this.target = target;
    this.group.visible = true;
    this.update();
  }

  detach(): void {
    this.target = null;
    this.group.visible = false;
    this.setHover(null);
  }

  getTarget(): THREE.Object3D | null {
    return this.target;
  }

  /** Keep gizmo at target position; scale by camera distance for constant screen size. */
  update(): void {
    if (!this.target || !this.group.visible) return;

    this.target.getWorldPosition(this._worldPos);

    if (this.group.parent) {
      this._parentInv.copy(this.group.parent.matrixWorld).invert();
      this._localPos.copy(this._worldPos).applyMatrix4(this._parentInv);
      this.group.position.copy(this._localPos);
    } else {
      this.group.position.copy(this._worldPos);
    }

    const dist = this.camera.position.distanceTo(this._worldPos);
    const s = dist * 0.18 * this.size;
    this.group.scale.setScalar(s);
  }

  /**
   * Raycast with this NDC pointer. Returns true when a handle was hit and a
   * drag has been initiated. Caller should suppress its own click handling.
   */
  tryPointerDown(pointerNDC: THREE.Vector2): boolean {
    if (!this.target || !this.group.visible) return false;

    this.raycaster.setFromCamera(pointerNDC, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);
    if (!hits.length) return false;

    const handle = (hits[0].object.userData.gizmoHandle as GizmoHandle) ?? null;
    if (!handle) return false;

    this.startDrag(handle);
    return true;
  }

  /** Update hover highlight based on pointer position. Cheap if not hovering. */
  updateHover(pointerNDC: THREE.Vector2): void {
    if (!this.target || !this.group.visible || this.dragging) return;

    this.raycaster.setFromCamera(pointerNDC, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitMeshes, false);

    if (hits.length) {
      const handle = (hits[0].object.userData.gizmoHandle as GizmoHandle) ?? null;
      this.setHover(handle);
      this.renderer.domElement.style.cursor = handle ? 'pointer' : 'auto';
    } else {
      this.setHover(null);
      this.renderer.domElement.style.cursor = 'auto';
    }
  }

  isDragging(): boolean {
    return this.dragging !== null;
  }

  dispose(): void {
    if (this.dragging) {
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
    }
    this.group.parent?.remove(this.group);
    // Materials/geometries will be GC'd with the group; explicit disposal for cleanliness.
    this.group.traverse((obj) => {
      const m = obj as THREE.Mesh;
      m.geometry?.dispose?.();
    });
    Object.values(this.materials).forEach((mat) => mat.dispose());
  }

  // ── Build phase ─────────────────────────────────────────────────────────

  private buildMaterials(): void {
    this.materials = {
      red:       makeMat(RED),
      blue:      makeMat(BLUE),
      cyan:      makeMat(CYAN),
      gray:      makeMat(GRAY),
      gold:      makeMat(GOLD),
      ghost:     makeMat(0x505058, 0.12),
      invisible: new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    };
  }

  private addVisual(handle: Exclude<GizmoHandle, null>, mesh: THREE.Mesh, base: BaseColor): void {
    const list = this.visualsByHandle.get(handle) ?? [];
    list.push({ mesh, base });
    this.visualsByHandle.set(handle, list);
  }

  private addHitbox(handle: Exclude<GizmoHandle, null>, mesh: THREE.Mesh): void {
    mesh.userData.gizmoHandle = handle;
    mesh.material = this.materials.invisible;
    this.hitMeshes.push(mesh);
  }

  private buildScene(): void {
    const g = this.group;
    const m = this.materials;

    // ─ Quarter arcs (rotation handles) ─
    const arcXY = buildQuarterArcGeometry('xy');
    const arcXZ = buildQuarterArcGeometry('xz');
    const arcYZ = buildQuarterArcGeometry('yz');
    const arcHitXY = buildQuarterArcHitGeometry('xy');
    const arcHitXZ = buildQuarterArcHitGeometry('xz');
    const arcHitYZ = buildQuarterArcHitGeometry('yz');

    // XY arc — cyan — rotate around Z
    {
      const vis = new THREE.Mesh(arcXY, m.cyan);
      vis.renderOrder = 999;
      g.add(vis);
      this.addVisual('rotate-z', vis, 'cyan');

      const hit = new THREE.Mesh(arcHitXY);
      hit.renderOrder = 999;
      this.addHitbox('rotate-z', hit);
      g.add(hit);
    }
    // XZ arc — red — rotate around Y
    {
      const vis = new THREE.Mesh(arcXZ, m.red);
      vis.renderOrder = 999;
      g.add(vis);
      this.addVisual('rotate-y', vis, 'red');

      const hit = new THREE.Mesh(arcHitXZ);
      hit.renderOrder = 999;
      this.addHitbox('rotate-y', hit);
      g.add(hit);
    }
    // YZ arc — blue — rotate around X
    {
      const vis = new THREE.Mesh(arcYZ, m.blue);
      vis.renderOrder = 999;
      g.add(vis);
      this.addVisual('rotate-x', vis, 'blue');

      const hit = new THREE.Mesh(arcHitYZ);
      hit.renderOrder = 999;
      this.addHitbox('rotate-x', hit);
      g.add(hit);
    }

    // ─ Axis arrows (translate handles) ─
    const shaft = new THREE.CylinderGeometry(0.018, 0.018, AXIS_LEN, 6);
    const shaftHit = new THREE.CylinderGeometry(0.08, 0.08, AXIS_LEN, 6);
    const cone = new THREE.ConeGeometry(0.07, 0.22, 6);

    // Y axis — RED — translate-y
    {
      const shaftMesh = new THREE.Mesh(shaft, m.red);
      shaftMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftMesh.renderOrder = 1000;
      g.add(shaftMesh);
      this.addVisual('translate-y', shaftMesh, 'red');

      const coneMesh = new THREE.Mesh(cone, m.red);
      coneMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneMesh.renderOrder = 1000;
      g.add(coneMesh);
      this.addVisual('translate-y', coneMesh, 'red');

      const shaftHitMesh = new THREE.Mesh(shaftHit);
      shaftHitMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftHitMesh.renderOrder = 1000;
      this.addHitbox('translate-y', shaftHitMesh);
      g.add(shaftHitMesh);

      const coneHitMesh = new THREE.Mesh(cone);
      coneHitMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneHitMesh.renderOrder = 1000;
      this.addHitbox('translate-y', coneHitMesh);
      g.add(coneHitMesh);
    }

    // X axis — BLUE — translate-x
    {
      const qx = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0, 0),
      );
      const axisGroup = new THREE.Group();
      axisGroup.quaternion.copy(qx);
      g.add(axisGroup);

      const shaftMesh = new THREE.Mesh(shaft, m.blue);
      shaftMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftMesh.renderOrder = 1000;
      axisGroup.add(shaftMesh);
      this.addVisual('translate-x', shaftMesh, 'blue');

      const coneMesh = new THREE.Mesh(cone, m.blue);
      coneMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneMesh.renderOrder = 1000;
      axisGroup.add(coneMesh);
      this.addVisual('translate-x', coneMesh, 'blue');

      const shaftHitMesh = new THREE.Mesh(shaftHit);
      shaftHitMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftHitMesh.renderOrder = 1000;
      this.addHitbox('translate-x', shaftHitMesh);
      axisGroup.add(shaftHitMesh);

      const coneHitMesh = new THREE.Mesh(cone);
      coneHitMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneHitMesh.renderOrder = 1000;
      this.addHitbox('translate-x', coneHitMesh);
      axisGroup.add(coneHitMesh);
    }

    // Z axis — CYAN — translate-z
    {
      const qz = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1),
      );
      const axisGroup = new THREE.Group();
      axisGroup.quaternion.copy(qz);
      g.add(axisGroup);

      const shaftMesh = new THREE.Mesh(shaft, m.cyan);
      shaftMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftMesh.renderOrder = 1000;
      axisGroup.add(shaftMesh);
      this.addVisual('translate-z', shaftMesh, 'cyan');

      const coneMesh = new THREE.Mesh(cone, m.cyan);
      coneMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneMesh.renderOrder = 1000;
      axisGroup.add(coneMesh);
      this.addVisual('translate-z', coneMesh, 'cyan');

      const shaftHitMesh = new THREE.Mesh(shaftHit);
      shaftHitMesh.position.set(0, AXIS_LEN / 2, 0);
      shaftHitMesh.renderOrder = 1000;
      this.addHitbox('translate-z', shaftHitMesh);
      axisGroup.add(shaftHitMesh);

      const coneHitMesh = new THREE.Mesh(cone);
      coneHitMesh.position.set(0, AXIS_LEN + 0.09, 0);
      coneHitMesh.renderOrder = 1000;
      this.addHitbox('translate-z', coneHitMesh);
      axisGroup.add(coneHitMesh);
    }

    // ─ Cube nodes (scale handles at axis endpoints) ─
    const cube = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    const cubeHit = new THREE.BoxGeometry(CUBE_HIT, CUBE_HIT, CUBE_HIT);

    // Y cube — RED — scale-y
    {
      const vis = new THREE.Mesh(cube, m.red);
      vis.position.set(0, ARC_R, 0);
      vis.renderOrder = 1001;
      vis.userData.gizmoHandle = 'scale-y'; // visual also clickable (matches AA)
      this.hitMeshes.push(vis);
      g.add(vis);
      this.addVisual('scale-y', vis, 'red');

      const hit = new THREE.Mesh(cubeHit);
      hit.position.set(0, ARC_R, 0);
      hit.renderOrder = 1001;
      this.addHitbox('scale-y', hit);
      g.add(hit);
    }
    // X cube — BLUE — scale-x
    {
      const vis = new THREE.Mesh(cube, m.blue);
      vis.position.set(ARC_R, 0, 0);
      vis.renderOrder = 1001;
      vis.userData.gizmoHandle = 'scale-x';
      this.hitMeshes.push(vis);
      g.add(vis);
      this.addVisual('scale-x', vis, 'blue');

      const hit = new THREE.Mesh(cubeHit);
      hit.position.set(ARC_R, 0, 0);
      hit.renderOrder = 1001;
      this.addHitbox('scale-x', hit);
      g.add(hit);
    }
    // Z cube — CYAN — scale-z
    {
      const vis = new THREE.Mesh(cube, m.cyan);
      vis.position.set(0, 0, ARC_R);
      vis.renderOrder = 1001;
      vis.userData.gizmoHandle = 'scale-z';
      this.hitMeshes.push(vis);
      g.add(vis);
      this.addVisual('scale-z', vis, 'cyan');

      const hit = new THREE.Mesh(cubeHit);
      hit.position.set(0, 0, ARC_R);
      hit.renderOrder = 1001;
      this.addHitbox('scale-z', hit);
      g.add(hit);
    }

    // ─ Gray circle discs (uniform scale / plane handles) ─
    const disc = new THREE.CircleGeometry(DISC_R, 16);
    const discHit = new THREE.CircleGeometry(DISC_R * 2, 16);

    // XY disc
    {
      const vis = new THREE.Mesh(disc, m.gray);
      vis.position.set(DISC_IN, DISC_IN, 0);
      vis.renderOrder = 1001;
      g.add(vis);
      this.addVisual('scale-uniform', vis, 'gray');

      const hit = new THREE.Mesh(discHit);
      hit.position.set(DISC_IN, DISC_IN, 0);
      hit.renderOrder = 1001;
      this.addHitbox('scale-uniform', hit);
      g.add(hit);
    }
    // XZ disc
    {
      const vis = new THREE.Mesh(disc, m.gray);
      vis.position.set(DISC_IN, 0, DISC_IN);
      vis.rotation.set(-Math.PI / 2, 0, 0);
      vis.renderOrder = 1001;
      g.add(vis);
      this.addVisual('scale-uniform', vis, 'gray');

      const hit = new THREE.Mesh(discHit);
      hit.position.set(DISC_IN, 0, DISC_IN);
      hit.rotation.set(-Math.PI / 2, 0, 0);
      hit.renderOrder = 1001;
      this.addHitbox('scale-uniform', hit);
      g.add(hit);
    }
    // YZ disc
    {
      const vis = new THREE.Mesh(disc, m.gray);
      vis.position.set(0, DISC_IN, DISC_IN);
      vis.rotation.set(0, Math.PI / 2, 0);
      vis.renderOrder = 1001;
      g.add(vis);
      this.addVisual('scale-uniform', vis, 'gray');

      const hit = new THREE.Mesh(discHit);
      hit.position.set(0, DISC_IN, DISC_IN);
      hit.rotation.set(0, Math.PI / 2, 0);
      hit.renderOrder = 1001;
      this.addHitbox('scale-uniform', hit);
      g.add(hit);
    }

    // ─ Ghost rings (visual reference) ─
    const ghostRing = new THREE.TorusGeometry(GHOST_R, 0.005, 4, 80);
    {
      const xy = new THREE.Mesh(ghostRing, m.ghost);
      xy.renderOrder = 998;
      g.add(xy);

      const xz = new THREE.Mesh(ghostRing, m.ghost);
      xz.rotation.set(Math.PI / 2, 0, 0);
      xz.renderOrder = 998;
      g.add(xz);

      const yz = new THREE.Mesh(ghostRing, m.ghost);
      yz.rotation.set(0, Math.PI / 2, 0);
      yz.renderOrder = 998;
      g.add(yz);
    }
  }

  // ── Hover ───────────────────────────────────────────────────────────────

  private setHover(handle: GizmoHandle): void {
    if (handle === this.hovered) return;
    this.hovered = handle;
    this.refreshMaterials();
  }

  private refreshMaterials(): void {
    const active = this.dragging ?? this.hovered;
    for (const [handle, list] of this.visualsByHandle) {
      const isActive = handle === active;
      for (const { mesh, base } of list) {
        mesh.material = isActive ? this.materials.gold : this.materials[base];
      }
    }
  }

  // ── Drag ────────────────────────────────────────────────────────────────

  private startDrag(handle: Exclude<GizmoHandle, null>): void {
    if (!this.target) return;

    this.dragging = handle;
    this.renderer.domElement.style.cursor = 'grabbing';
    this.refreshMaterials();

    const origin = new THREE.Vector3();
    this.target.getWorldPosition(origin);

    const axisKey = handle.split('-')[1] as 'x' | 'y' | 'z' | 'uniform';
    let axisWorld = new THREE.Vector3(0, 1, 0);

    if (axisKey !== 'uniform') {
      // Global coordinate space — axis directions are world-aligned, not target-local
      axisWorld = AXIS_DIR[axisKey].clone();
    }

    // Disable orbit controls while dragging gizmo
    (this.controls as unknown as { enabled: boolean }).enabled = false;

    let startAxisPoint = origin.clone();
    const type = handle.split('-')[0] as 'translate' | 'rotate' | 'scale';

    if (type === 'rotate') {
      const pt = projectOnRotationPlane(this.raycaster, origin, axisWorld);
      if (pt) startAxisPoint = pt;
    } else if (type === 'translate' || type === 'scale') {
      const pt = projectOnAxis(this.raycaster, origin, axisWorld, this.camera);
      if (pt) startAxisPoint = pt;
    }

    let startAngle = 0;
    if (type === 'rotate') {
      const fromCenter = startAxisPoint.clone().sub(origin);
      startAngle = Math.atan2(
        fromCenter.dot(
          new THREE.Vector3()
            .crossVectors(axisWorld, fromCenter.clone().normalize())
            .normalize(),
        ),
        fromCenter.length(),
      );
    }

    this.dragStart = {
      handle,
      startPos: this.target.position.clone(),
      startQuat: this.target.quaternion.clone(),
      startScale: this.target.scale.clone(),
      startAngle,
      startAxisPoint,
      origin,
      axisWorld,
    };

    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.dragStart || !this.target) return;

    const { handle, startPos, startQuat, startScale, startAxisPoint, origin, axisWorld } = this.dragStart;
    const type = handle.split('-')[0] as 'translate' | 'rotate' | 'scale';
    const axisKey = handle.split('-')[1] as 'x' | 'y' | 'z' | 'uniform';

    const domElement = this.renderer.domElement;
    const rect = domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(mouse, this.camera);

    if (type === 'translate') {
      const currentPoint = projectOnAxis(this.raycaster, origin, axisWorld, this.camera);
      if (!currentPoint) return;

      const delta = currentPoint.clone().sub(startAxisPoint);

      // Convert world-space delta to target-local space.
      // Must account for the full parent transform (rotation + scale)
      // so that scaled parents (e.g. cm→m autoScale) move correctly.
      if (this.target.parent) {
        const parentInv = new THREE.Matrix4().copy(this.target.parent.matrixWorld).invert();
        parentInv.setPosition(0, 0, 0);
        delta.applyMatrix4(parentInv);
      }

      this.target.position.copy(startPos).add(delta);
      this.onChange?.();
    } else if (type === 'rotate') {
      const currentPoint = projectOnRotationPlane(this.raycaster, origin, axisWorld);
      if (!currentPoint) return;

      const startVec = startAxisPoint.clone().sub(origin).normalize();
      const currentVec = currentPoint.clone().sub(origin).normalize();

      let angle = Math.acos(THREE.MathUtils.clamp(startVec.dot(currentVec), -1, 1));
      const cross = new THREE.Vector3().crossVectors(startVec, currentVec);
      if (cross.dot(axisWorld) < 0) angle = -angle;

      const worldQuat = new THREE.Quaternion();
      if (this.target.parent) {
        this.target.parent.getWorldQuaternion(worldQuat);
      }
      const localAxis = axisWorld.clone().applyQuaternion(worldQuat.clone().invert());

      const rotDelta = new THREE.Quaternion().setFromAxisAngle(localAxis, angle);
      this.target.quaternion.copy(rotDelta).multiply(startQuat);
      this.onChange?.();
    } else if (type === 'scale') {
      if (axisKey === 'uniform') {
        const currentPoint = projectOnAxis(
          this.raycaster,
          origin,
          new THREE.Vector3(0, 1, 0),
          this.camera,
        );
        if (!currentPoint) return;
        const delta = currentPoint.y - startAxisPoint.y;
        const factor = 1 + delta * 2;
        this.target.scale.copy(startScale).multiplyScalar(Math.max(0.01, factor));
        this.onChange?.();
      } else {
        const currentPoint = projectOnAxis(this.raycaster, origin, axisWorld, this.camera);
        if (!currentPoint) return;

        const startDist = startAxisPoint.clone().sub(origin).dot(axisWorld);
        const currentDist = currentPoint.clone().sub(origin).dot(axisWorld);
        const factor = startDist !== 0 ? currentDist / startDist : 1;

        const newScale = startScale.clone();
        if (axisKey === 'x') newScale.x *= Math.max(0.01, factor);
        else if (axisKey === 'y') newScale.y *= Math.max(0.01, factor);
        else if (axisKey === 'z') newScale.z *= Math.max(0.01, factor);
        this.target.scale.copy(newScale);
        this.onChange?.();
      }
    }
  };

  private onPointerUp = (): void => {
    if (!this.dragStart) return;
    this.dragStart = null;
    this.dragging = null;
    this.renderer.domElement.style.cursor = this.hovered ? 'pointer' : 'auto';
    (this.controls as unknown as { enabled: boolean }).enabled = true;

    this.refreshMaterials();

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    this.onCommit?.();
  };
}
