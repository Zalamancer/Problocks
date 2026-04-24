'use client';

import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createKidEngine,
  type KidEngine,
  applySceneToRoot,
  sceneIdForObject,
} from '@/lib/kid-style-3d';
import { useFreeform3D } from '@/store/freeform3d-store';
import { PrefabPalette } from './freeform3d/PrefabPalette';
import { TopToolbar } from './freeform3d/TopToolbar';
import { setSelectionHighlight } from './freeform3d/selection-outline';

/**
 * 3D Freeform viewport. Mounts a kid-style Three.js engine and keeps its
 * root in sync with the Zustand scene state. The engine never mutates the
 * store; every edit (add/remove/transform/color) flows through the store
 * and the engine reacts.
 *
 * UX for now:
 *   - Bottom-centre PrefabPalette: click a tile to add a prefab at origin
 *   - Top-right TopToolbar: undo/redo/duplicate/delete/clear
 *   - Click on a prefab in the scene to select it (accent outline)
 *   - Click on the ground (or empty space) to deselect
 *   - Keyboard: Delete = remove selected, Cmd/Ctrl+Z = undo, +Shift = redo
 *
 * Future stages: transform gizmo, property inspector, save/load, AI
 * scene generation from Claude.
 */
export function FreeformView3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<KidEngine | null>(null);

  const objects = useFreeform3D((s) => s.scene.objects);
  const selectedId = useFreeform3D((s) => s.selectedId);
  const select = useFreeform3D((s) => s.select);
  const addPrefab = useFreeform3D((s) => s.addPrefab);
  const removeObject = useFreeform3D((s) => s.removeObject);
  const undo = useFreeform3D((s) => s.undo);
  const redo = useFreeform3D((s) => s.redo);

  /* ---- boot engine once ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = createKidEngine({ canvas });
    engine.start();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  /* ---- seed scene once if empty ---- */
  useEffect(() => {
    if (useFreeform3D.getState().scene.objects.length > 0) return;
    // Three-object starter scene so the viewport doesn't look empty on first
    // open; users can delete or replace at will. Positions mirror the old
    // hardcoded seedStarterScene we removed from engine.ts.
    addPrefab('rounded-box', [-2, 0, 0]);
    addPrefab('sphere', [0, 0, 0]);
    addPrefab('cylinder', [2.2, 0, 0]);
    // Clear the "post-seeding" selection so the three outlines are the same.
    useFreeform3D.getState().select(null);
  }, [addPrefab]);

  /* ---- spawn helper: adds a prefab near the orbit target with a small
         random offset so successive clicks don't stack at the origin ---- */
  const spawnAtTarget = useCallback(
    (kind: string) => {
      const engine = engineRef.current;
      const target = engine?.controls.target ?? new THREE.Vector3(0, 0, 0);
      const jitter = 1.5;
      const pos: [number, number, number] = [
        target.x + (Math.random() - 0.5) * jitter,
        0,
        target.z + (Math.random() - 0.5) * jitter,
      ];
      addPrefab(kind, pos);
    },
    [addPrefab],
  );

  /* ---- sync store → engine ---- */
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    applySceneToRoot(engine.root, objects);
    setSelectionHighlight(engine.root, selectedId);
  }, [objects, selectedId]);

  /* ---- click picking on the canvas ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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
  }, [select]);

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
      <PrefabPalette onAdd={spawnAtTarget} />
      <TopToolbar />
      <HintBadge />
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
