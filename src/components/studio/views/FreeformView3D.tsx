'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createKidEngine,
  type KidEngine,
  applySceneToRoot,
  sceneIdForObject,
  createKidGizmo,
  type KidGizmo,
  type GizmoMode,
  createPlayController,
  type PlayController,
  applyWorld,
  collectStats,
  type SceneStats,
} from '@/lib/kid-style-3d';
import { useFreeform3D } from '@/store/freeform3d-store';
import { useSceneStore } from '@/store/scene-store';
import { useUserAvatar } from '@/store/user-avatar-store';
import { TopToolbar } from './freeform3d/TopToolbar';
import { setSelectionHighlight } from './freeform3d/selection-outline';
import { setSpawnTargetProvider } from '@/lib/kid-style-3d/spawn-target';

/** Convert a user-avatar AvatarOutfit into SceneObject.props for the
    character prefab. Kept local because the character prefab is the
    only consumer of this shape. */
function outfitToCharacterProps(outfit: ReturnType<typeof useUserAvatar.getState>['outfit']) {
  return {
    skinColor:  outfit.skin,
    pantsColor: outfit.pants,
    shoeColor:  '#2a2438',
    hair:       outfit.hair,
    hairColor:  outfit.hairColor,
    hat:        outfit.hat,
    hatColor:   outfit.hatColor,
    face:       outfit.face,
    gender:     outfit.gender,
  } as Record<string, string>;
}

/**
 * 3D Freeform viewport. Mounts a kid-style Three.js engine and keeps its
 * root in sync with the Zustand scene state. The engine never mutates the
 * store; every edit (add/remove/transform/color) flows through the store
 * and the engine reacts.
 *
 * UX for now:
 *   - Prefab placement lives in the left Assets panel (Freeform3DAssetsView);
 *     clicks spawn near the current orbit target via setSpawnTargetProvider
 *   - Top-right TopToolbar: undo/redo/duplicate/delete/clear
 *   - Click on a prefab in the scene to select it (accent outline)
 *   - Click on the ground (or empty space) to deselect
 *   - Keyboard: Delete = remove selected, Cmd/Ctrl+Z = undo, +Shift = redo
 *
 * Future stages: AI scene generation, richer prop inspector, save/load.
 */
export function FreeformView3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<KidEngine | null>(null);
  const gizmoRef = useRef<KidGizmo | null>(null);
  const playRef = useRef<PlayController | null>(null);

  const objects = useFreeform3D((s) => s.scene.objects);
  const selectedId = useFreeform3D((s) => s.selectedId);
  const cameraMode = useFreeform3D((s) => s.cameraMode);
  const world = useFreeform3D((s) => s.world);
  const geomRev = useFreeform3D((s) => s.geomRev);
  const brushEnabled = useFreeform3D((s) => s.brush.enabled);
  const brushRadius = useFreeform3D((s) => s.brush.radius);
  const select = useFreeform3D((s) => s.select);
  const addPrefab = useFreeform3D((s) => s.addPrefab);
  const removeObject = useFreeform3D((s) => s.removeObject);
  const updateObject = useFreeform3D((s) => s.updateObject);
  const undo = useFreeform3D((s) => s.undo);
  const redo = useFreeform3D((s) => s.redo);
  const userOutfit = useUserAvatar((s) => s.outfit);

  const [stats, setStats] = useState<SceneStats>({ vertices: 0, triangles: 0, meshes: 0 });
  // Silence "declared but unused" — addPrefab is retained as a store
  // action for the left-panel Assets view; the viewport doesn't spawn
  // directly anymore but other features (drag-drop, paste) will.
  void addPrefab;

  // Studio-wide Play toggle lives in scene-store. We react to it here to
  // enter/exit freeform 3D play mode (WASD + follow camera).
  const isPlaying = useSceneStore((s) => s.isPlaying);

  /* ---- boot engine once + gizmo ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createKidEngine({ canvas });
    engine.start();
    engineRef.current = engine;
    // Apply persisted world on mount so brightness/time/etc. aren't
    // reset to the engine defaults after a refresh.
    applyWorld(engine, useFreeform3D.getState().world);

    // Gizmo lives for the lifetime of the engine; detached by default.
    const gizmo = createKidGizmo({
      camera: engine.camera,
      domElement: canvas,
      scene: engine.scene,
      orbit: engine.controls,
      onChange: (obj) => {
        const id = obj.userData.__sceneId as string | undefined;
        if (!id) return;
        // Read transform from the object and push to the store. The
        // hydrator will see "no change" on the next tick and skip any
        // rebuild, so this is cheap even at 60Hz during a drag.
        updateObject(id, {
          position: [obj.position.x, obj.position.y, obj.position.z],
          rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
          scale: [obj.scale.x, obj.scale.y, obj.scale.z],
        });
      },
    });
    gizmo.detach();
    gizmoRef.current = gizmo;

    return () => {
      gizmo.dispose();
      engine.dispose();
      engineRef.current = null;
      gizmoRef.current = null;
    };
  }, [updateObject]);

  /* ---- expose orbit target so Assets panel can spawn near camera ---- */
  useEffect(() => {
    setSpawnTargetProvider(() => {
      const t = engineRef.current?.controls.target;
      if (!t) return [0, 0, 0];
      return [t.x, t.y, t.z];
    });
    return () => setSpawnTargetProvider(null);
  }, []);

  /* ---- seed scene once if empty ---- */
  useEffect(() => {
    if (useFreeform3D.getState().scene.objects.length > 0) return;
    // Adopt-Me starter plot: house in back, character out front, two
    // corner trees, a mailbox at the gate, a balloon, and a bench off to
    // the side. Reads as "a plot you own" the instant the viewport loads,
    // instead of three abstract primitives floating in a field.
    addPrefab('house',     [0, 0, -5]);
    addPrefab('tree-oak',  [-7, 0, 5]);
    addPrefab('tree-pine', [7, 0, -7]);
    // Character gets the student's current avatar outfit — hair style,
    // hat, face, colours, gender — so it matches the profile card.
    const outfit = useUserAvatar.getState().outfit;
    useFreeform3D.getState().addPrefabFull('character', {
      position: [2.5, 0, 3.5],
      color: outfit.shirt,
      props: outfitToCharacterProps(outfit),
    });
    addPrefab('mailbox',   [-4, 0, 8]);
    addPrefab('balloon',   [-3.4, 0, 8]);
    addPrefab('bench',     [5.5, 0, 4.5]);
    addPrefab('flower',    [-1.4, 0, 6]);
    addPrefab('flower',    [ 1.4, 0, 6]);
    addPrefab('flower',    [-1.4, 0, 4]);
    addPrefab('flower',    [ 1.4, 0, 4]);
    // Clear the post-seeding selection so the starter scene reads as a
    // neutral plot, not "one thing highlighted".
    useFreeform3D.getState().select(null);
  }, [addPrefab]);

  /* ---- live-sync every scene character to the user's current outfit ----
      Updates each character's shirt color + outfit props when the
      wardrobe changes. The hydrator rebuilds characters on props change
      (see hydrate.ts), so the mesh hair / hat / face all refresh
      without a scene-wide reload. */
  useEffect(() => {
    const chars = useFreeform3D.getState().scene.objects.filter((o) => o.kind === 'character');
    if (chars.length === 0) return;
    const patchProps = outfitToCharacterProps(userOutfit);
    for (const c of chars) {
      updateObject(c.id, {
        color: userOutfit.shirt,
        props: { ...(c.props ?? {}), ...patchProps },
      });
    }
  }, [userOutfit, updateObject]);

  /* ---- sync store → engine ---- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    // Don't thrash the gizmo during a drag — applySceneToRoot would
    // briefly re-parent/re-transform the attached object and cancel the
    // user's manipulation.
    if (gizmoRef.current?.isDragging()) return;
    applySceneToRoot(engine.root, objects);
    setSelectionHighlight(engine.root, selectedId);
    // Re-apply world so newly-hydrated meshes pick up wireframe / vertex
    // overlay toggles. Cheap: applyWorld is idempotent.
    applyWorld(engine, world);
    setStats(collectStats(engine.root));
  }, [objects, selectedId, world]);

  /* ---- perf mode flip: force every hydrated object to rebuild ---- */
  useEffect(() => {
    // geomRev starts at 0 and only bumps on user action, so we can use
    // it as the dependency directly. On first mount (rev 0) there are
    // no children yet so the loop is a no-op anyway.
    if (geomRev === 0) return;
    const engine = engineRef.current;
    if (!engine) return;
    // Marking __sceneKind as stale makes applySceneToRoot treat every
    // existing child as kind-changed and rebuild them against the new
    // geometry. disposeTree in hydrate.ts skips cached geometries, so
    // the old (already-invalidated) cache entries stay alive long
    // enough for GC to reclaim them after the last reference drops.
    for (const child of engine.root.children) {
      child.userData.__sceneKind = '__stale__';
    }
    applySceneToRoot(engine.root, useFreeform3D.getState().scene.objects);
    setSelectionHighlight(engine.root, useFreeform3D.getState().selectedId);
    applyWorld(engine, useFreeform3D.getState().world);
    setStats(collectStats(engine.root));
  }, [geomRev]);

  /* ---- sync world settings (brightness/time/etc) without depending on scene ---- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    applyWorld(engine, world);
  }, [world]);

  /* ---- attach gizmo to selected object ---- */
  useEffect(() => {
    const engine = engineRef.current;
    const gizmo = gizmoRef.current;
    if (!engine || !gizmo) return;
    // No gizmo while playing — the viewport becomes the game view.
    if (isPlaying) { gizmo.detach(); return; }
    if (!selectedId) {
      gizmo.detach();
      return;
    }
    // Find the top-level hydrated object with this scene id.
    const match = engine.root.children.find(
      (c) => c.userData.__sceneId === selectedId,
    );
    if (match) gizmo.attach(match);
    else gizmo.detach();
  }, [selectedId, objects, isPlaying]);

  /* ---- play mode: attach controller when isPlaying flips true ---- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!isPlaying) {
      if (playRef.current) {
        playRef.current.stop();
        playRef.current.dispose();
        playRef.current = null;
      }
      engine.setPerFrame(null);
      return;
    }
    // Find a character in the scene. First one wins — users can put the
    // starter character back in front of the house if the pick feels wrong.
    const characterObj = engine.root.children.find(
      (c) => c.userData.__sceneKind === 'character',
    );
    if (!characterObj) {
      // No character — fall through gracefully. The isPlaying state will
      // flip back when the user hits Stop.
      engine.setPerFrame((dt) => { engine.controls.update(); void dt; });
      return;
    }
    // Deselect so the gizmo doesn't flash on the character mesh.
    useFreeform3D.getState().select(null);

    const controller = createPlayController({
      camera: engine.camera,
      character: characterObj,
      domElement: engine.renderer.domElement,
      orbit: engine.controls,
      root: engine.root,
      mode: cameraMode,
    });
    controller.start();
    playRef.current = controller;
    engine.setPerFrame((dt) => controller.update(dt));

    return () => {
      controller.stop();
      controller.dispose();
      playRef.current = null;
      engine.setPerFrame(null);
    };
  }, [isPlaying, cameraMode]);

  /* ---- camera mode live-switch (while playing) ---- */
  useEffect(() => {
    if (isPlaying && playRef.current) playRef.current.setMode(cameraMode);
  }, [cameraMode, isPlaying]);

  /* ---- click picking on the canvas (edit mode only) ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isPlaying) return;    // play-mode has its own input handling
    if (brushEnabled) return; // brush owns left-click while painting

    let downX = 0;
    let downY = 0;
    let isDown = false;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      // Ignore drags so picking doesn't fight OrbitControls.
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 4) return;
      const engine = engineRef.current;
      if (!engine) return;
      const rect = canvas.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      const hit = engine.raycastRoot(ndc);
      if (hit) {
        const id = sceneIdForObject(hit.object);
        select(id);
      } else {
        select(null);
      }
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [select, isPlaying, brushEnabled]);

  /* ---- brush paint handler ---- */
  useEffect(() => {
    if (!brushEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isPlaying) return;
    const engine = engineRef.current;
    if (!engine) return;

    // Gizmo is noisy while painting — detach for the session.
    gizmoRef.current?.detach();

    // Take over left-mouse from OrbitControls so drag-paints don't also
    // rotate the camera. Middle/right still work, so the user can still
    // reframe during a paint session. Restored on cleanup.
    const origMouseButtons = { ...engine.controls.mouseButtons };
    (engine.controls.mouseButtons as { LEFT: number | null }).LEFT = null;

    // Build a brush-cursor ring on the ground that tracks the pointer.
    const ringGeo = new THREE.RingGeometry(0.95, 1.0, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd97757,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.renderOrder = 999;
    ring.visible = false;
    engine.scene.add(ring);

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    let isDown = false;
    let lastPaint: THREE.Vector3 | null = null;
    // Track the previous paint position during a stroke so path mode
    // can compute the drag direction and lay tiles perpendicular to it.
    let prevPathPos: THREE.Vector3 | null = null;

    function pointToWorld(e: PointerEvent): THREE.Vector3 | null {
      const rect = canvas!.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, engine!.camera);
      const hit = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(groundPlane, hit)) return null;
      return hit;
    }

    function paintAt(center: THREE.Vector3): void {
      const state = useFreeform3D.getState();
      const b = state.brush;
      if (!b.kind) return;
      const placed: THREE.Vector3[] = [];

      // In path mode, build `density` candidates on a line perpendicular
      // to the drag direction. Width = radius * 2. This gives a wide
      // continuous trail when the user drags, instead of radial scatter.
      const pathCandidates: THREE.Vector3[] = [];
      if (b.mode === 'path') {
        // Default direction: +X until we have a real drag vector.
        let dx = 1, dz = 0;
        if (prevPathPos) {
          dx = center.x - prevPathPos.x;
          dz = center.z - prevPathPos.z;
          const len = Math.hypot(dx, dz);
          if (len > 0.0001) { dx /= len; dz /= len; }
          else { dx = 1; dz = 0; }
        }
        // Perpendicular to drag direction (rotate 90° in XZ plane).
        const px = -dz, pz = dx;
        const n = Math.max(1, b.density);
        const totalWidth = b.radius * 2;
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0 : (i / (n - 1)) - 0.5; // -0.5..0.5
          const offset = t * totalWidth;
          pathCandidates.push(new THREE.Vector3(
            center.x + px * offset,
            0,
            center.z + pz * offset,
          ));
        }
        prevPathPos = center.clone();
      }

      const iterations = b.mode === 'path' ? pathCandidates.length : b.density;
      for (let i = 0; i < iterations; i++) {
        let candidate: THREE.Vector3 | null = null;
        if (b.mode === 'path') {
          candidate = pathCandidates[i];
        } else {
          // Scatter mode — try several candidate positions so min-spacing
          // can reject heavy clumps without starving the brush stroke.
          for (let tries = 0; tries < 8; tries++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * b.radius;
            const c = new THREE.Vector3(
              center.x + Math.cos(angle) * dist,
              0,
              center.z + Math.sin(angle) * dist,
            );
            if (b.minSpacing > 0 && placed.some((p) => p.distanceTo(c) < b.minSpacing)) continue;
            candidate = c;
            break;
          }
        }
        if (!candidate) continue;
        placed.push(candidate);

        const rotY = b.randomRotY ? Math.random() * Math.PI * 2 : 0;
        const rotX = b.randomRotX ? (Math.random() - 0.5) * 2 * b.rotationTilt : 0;
        const rotZ = b.randomRotZ ? (Math.random() - 0.5) * 2 * b.rotationTilt : 0;
        const span = Math.max(0, b.scaleMax - b.scaleMin);
        const rollScale = () => b.scaleMin + Math.random() * span;
        const sx = rollScale();
        const sy = b.uniformScale ? sx : rollScale();
        const sz = b.uniformScale ? sx : rollScale();
        const flip = b.randomFlip && Math.random() < 0.5 ? -1 : 1;

        const patch: {
          position: [number, number, number];
          rotation: [number, number, number];
          scale:    [number, number, number];
          props?: Record<string, unknown>;
        } = {
          position: [candidate.x, 0, candidate.z],
          rotation: [rotX, rotY, rotZ],
          scale: [sx * flip, sy, sz],
        };
        // Random trees each get their own seed so a painted forest has
        // visually distinct trees instead of 20 identical ones.
        if (b.kind === 'tree-random') {
          patch.props = { seed: Math.floor(Math.random() * 1_000_000_000) };
        }
        state.addPrefabFull(b.kind, patch);
      }
    }

    function tryPaint(point: THREE.Vector3): void {
      const b = useFreeform3D.getState().brush;
      // Scatter: step = half-radius so strokes don't over-stack the
      // radial scatter. Path: step = minSpacing (or a small default) so
      // tiles butt up along the trail for a continuous trail read.
      const step = b.mode === 'path'
        ? Math.max(0.25, b.minSpacing || 0.5)
        : Math.max(0.1, b.radius * 0.5);
      if (lastPaint && lastPaint.distanceTo(point) < step) return;
      lastPaint = point.clone();
      paintAt(point);
    }

    const onPointerMove = (e: PointerEvent) => {
      const pt = pointToWorld(e);
      if (pt) {
        ring.position.set(pt.x, 0.02, pt.z);
        ring.scale.set(useFreeform3D.getState().brush.radius, useFreeform3D.getState().brush.radius, 1);
        ring.visible = true;
      } else {
        ring.visible = false;
      }
      if (isDown && pt) tryPaint(pt);
    };
    function splineClick(pt: THREE.Vector3): void {
      const state = useFreeform3D.getState();
      const b = state.brush;
      const activeId = b.activePathId;
      const active = activeId
        ? state.scene.objects.find((o) => o.id === activeId && o.kind === 'path-spline')
        : null;
      if (!active) {
        // Start a fresh path. Store the new id so subsequent clicks
        // extend it instead of spawning another one.
        const id = state.addPrefabFull('path-spline', {
          position: [0, 0, 0],
          props: {
            points: [[pt.x, pt.z]],
            width: b.pathWidth,
          },
        });
        state.setBrushField('activePathId', id);
        return;
      }
      // Extend the existing path with a new waypoint.
      const oldPoints =
        (active.props?.points as Array<[number, number]> | undefined) ?? [];
      const nextPoints: Array<[number, number]> = [...oldPoints, [pt.x, pt.z]];
      state.updateObject(active.id, {
        props: { ...(active.props ?? {}), points: nextPoints, width: b.pathWidth },
      });
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 2) {
        // Right-click in spline mode = finalize the active path so the
        // next left-click starts a fresh one. Swallow the event so the
        // browser context menu doesn't open over the canvas.
        const mode = useFreeform3D.getState().brush.mode;
        if (mode === 'spline') {
          useFreeform3D.getState().setBrushField('activePathId', null);
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }
      if (e.button !== 0) return; // only left mouse paints
      const pt = pointToWorld(e);
      if (!pt) return;
      const mode = useFreeform3D.getState().brush.mode;
      if (mode === 'spline') {
        splineClick(pt);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      isDown = true;
      lastPaint = null;
      prevPathPos = null;
      tryPaint(pt);
      e.preventDefault();
      e.stopPropagation();
    };
    // Block the native context menu so right-click works as "finalize
    // path" without popping the browser menu over the canvas.
    const onContextMenu = (e: MouseEvent) => {
      const mode = useFreeform3D.getState().brush.mode;
      if (mode === 'spline') e.preventDefault();
    };
    canvas.addEventListener('contextmenu', onContextMenu);
    const onPointerUp = () => {
      isDown = false;
      lastPaint = null;
      prevPathPos = null;
    };
    const onPointerLeave = () => {
      ring.visible = false;
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);

    return () => {
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      engine.scene.remove(ring);
      ringGeo.dispose();
      ringMat.dispose();
      engine.controls.mouseButtons = origMouseButtons;
    };
  }, [brushEnabled, isPlaying, brushRadius]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't steal typing in an input / textarea elsewhere on the page.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      const meta = e.metaKey || e.ctrlKey;
      const currentId = useFreeform3D.getState().selectedId;

      if ((e.key === 'Delete' || e.key === 'Backspace') && currentId) {
        removeObject(currentId);
        e.preventDefault();
        return;
      }
      // W/E/R — standard gizmo mode switch (translate/rotate/scale).
      // Matches Blender, Unity, Three.js editor.
      if (!meta && !e.shiftKey && !e.altKey) {
        const modeMap: Record<string, GizmoMode> = {
          w: 'translate', W: 'translate',
          e: 'rotate',    E: 'rotate',
          r: 'scale',     R: 'scale',
        };
        const mode = modeMap[e.key];
        if (mode && gizmoRef.current) {
          gizmoRef.current.setMode(mode);
          e.preventDefault();
          return;
        }
      }
      if (meta && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
        return;
      }
      if (meta && (e.key === 'y' || e.key === 'Y')) {
        redo();
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        useFreeform3D.getState().select(null);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [removeObject, undo, redo]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ outline: 'none', cursor: 'default', touchAction: 'none' }}
      />
      {!isPlaying && <TopToolbar />}
      {!isPlaying && world.showStats && <StatsBadge stats={stats} />}
      {isPlaying ? <PlayHud cameraMode={cameraMode} /> : <HintBadge />}
    </div>
  );
}

function StatsBadge({ stats }: { stats: SceneStats }) {
  const fmt = (n: number) => n.toLocaleString();
  return (
    <div
      className="pointer-events-none absolute top-14 right-4 px-3 py-2 rounded-lg text-[11px] font-semibold leading-tight"
      style={{
        background: 'rgba(0,0,0,0.6)',
        color: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: 0.3,
      }}
    >
      <div>Verts: {fmt(stats.vertices)}</div>
      <div>Tris:  {fmt(stats.triangles)}</div>
      <div>Meshes: {fmt(stats.meshes)}</div>
    </div>
  );
}

function HintBadge() {
  return (
    <div
      className="pointer-events-none absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{
        background: 'rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        letterSpacing: 0.2,
      }}
    >
      Drag · scroll · right-drag · click to select · Del to remove
    </div>
  );
}

function PlayHud({ cameraMode }: { cameraMode: 'third' | 'first' }) {
  const hint = cameraMode === 'first'
    ? 'WASD · mouse to look · click to lock pointer · Space to jump · Shift to sprint'
    : 'WASD · drag mouse to orbit · Space to jump · Shift to sprint';
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{
        background: 'rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        letterSpacing: 0.2,
      }}
    >
      {hint}
    </div>
  );
}
