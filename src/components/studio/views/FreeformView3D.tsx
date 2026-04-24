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
import { TopToolbar } from './freeform3d/TopToolbar';
import { setSelectionHighlight } from './freeform3d/selection-outline';
import { setSpawnTargetProvider } from '@/lib/kid-style-3d/spawn-target';

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
  const select = useFreeform3D((s) => s.select);
  const addPrefab = useFreeform3D((s) => s.addPrefab);
  const removeObject = useFreeform3D((s) => s.removeObject);
  const updateObject = useFreeform3D((s) => s.updateObject);
  const undo = useFreeform3D((s) => s.undo);
  const redo = useFreeform3D((s) => s.redo);

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
    addPrefab('character', [2.5, 0, 3.5]);
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
    if (isPlaying) return;   // play-mode has its own input handling

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
  }, [select, isPlaying]);

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
