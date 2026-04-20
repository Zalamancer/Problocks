// Three.js avatar stage for the wardrobe.
//
// - Pastel circular pedestal stage with floating decorative blocks
// - Rigged character: torso + head + per-arm + per-leg joint groups
//   (so emotes can rotate joints around shoulder/hip pivots)
// - Equipped items are reparented onto rig joints by their `name` tag
//   ('head' | 'torso' | 'armL' | 'armR' | 'legL' | 'legR' | 'footL' |
//   'footR' | 'root'). See builders/* for the convention.
// - Drag-rotate around Y, plus auto-rotate toggle and reset.
// - Face decal painted onto the head's +Z face based on selected face id.
//
'use client';

import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { ITEMS_BY_ID } from './catalog';
import { FACE_PAINTERS } from './builders/face';
import type { BodyShape, Emote, Outfit } from './types';

export interface AvatarSceneHandle {
  reset(): void;
}

interface Props {
  outfit: Outfit;
  autoRotate: boolean;
}

const STROKE = 0x1d1a14;

const SHAPE_SCALES: Record<BodyShape, { torso: THREE.Vector3; arm: THREE.Vector3; leg: THREE.Vector3; head: number }> = {
  classic: { torso: new THREE.Vector3(1, 1, 1),     arm: new THREE.Vector3(1, 1, 1),     leg: new THREE.Vector3(1, 1, 1),     head: 1 },
  stocky:  { torso: new THREE.Vector3(1.18, 0.92, 1.12), arm: new THREE.Vector3(1.1, 0.95, 1.1),  leg: new THREE.Vector3(1.1, 0.9, 1.1),  head: 1.05 },
  slim:    { torso: new THREE.Vector3(0.86, 1.06, 0.86), arm: new THREE.Vector3(0.85, 1.05, 0.85), leg: new THREE.Vector3(0.85, 1.05, 0.85), head: 0.95 },
};

function paintFace(faceId: string, skin: string, blinkAmt: number): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  // Skin background.
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, size, size);
  // Subtle paper grain so it doesn't look flat.
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const painter = FACE_PAINTERS[faceId] ?? FACE_PAINTERS['face-smile'];
  painter(ctx, size);
  // Apply blink: paint a horizontal bar over the eyes, scaled by blinkAmt.
  if (blinkAmt > 0.01) {
    ctx.fillStyle = skin;
    const h = size * 0.13 * blinkAmt;
    ctx.fillRect(size * 0.3, size * 0.4, size * 0.42, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function rounded(w: number, h: number, d: number, _r = 0.1): THREE.BufferGeometry {
  // Plain box geometry — kept the `rounded` name so callers don't change.
  // The radius arg is intentionally ignored to keep the GPU/CPU cost low
  // for Chromebook-tier integrated GPUs (UHD 600).
  void _r;
  return new THREE.BoxGeometry(w, h, d);
}

function withEdges(mesh: THREE.Mesh, opacity = 0.55): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry, 28),
    new THREE.LineBasicMaterial({ color: STROKE, transparent: true, opacity }),
  );
  mesh.add(edges);
  return g;
}

interface Rig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  footL: THREE.Group;
  footR: THREE.Group;
  pet: THREE.Group;
  /** Map mount-name → joint group (for re-parenting equipped items). */
  mounts: Record<string, THREE.Group>;
  /** Children added by the last equip pass — cleared on each refresh. */
  equipped: THREE.Object3D[];
  /** Mesh whose +Z face uses the face material — so we can swap on blink. */
  faceMat: THREE.MeshStandardMaterial;
}

function buildRig(skin: string, body: BodyShape): Rig {
  const root = new THREE.Group();
  const skinMat = () => new THREE.MeshStandardMaterial({ color: skin, roughness: 0.92 });
  const sc = SHAPE_SCALES[body];

  // Torso group with overlay-able mount.
  const torso = new THREE.Group();
  const torsoMesh = new THREE.Mesh(rounded(2, 2, 1, 0.15), skinMat());
  torso.add(withEdges(torsoMesh, 0.4));
  torso.scale.copy(sc.torso);
  root.add(torso);

  // Head group: pivot at base of head; head cube offset up by half its height.
  const head = new THREE.Group();
  head.position.set(0, 1.0 + 0.8 + 0.05, 0); // torso top + half head + gap
  const headSize = 1.6 * sc.head;
  const faceMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.92 });
  // Head is built from 6 materials so +Z gets the face.
  const headMats: THREE.Material[] = [
    skinMat(), skinMat(), skinMat(), skinMat(), faceMat, skinMat(),
  ];
  const headMesh = new THREE.Mesh(rounded(headSize, headSize, headSize, 0.18), headMats);
  head.add(withEdges(headMesh, 0.4));
  root.add(head);

  // Arms — pivot at the shoulder, mesh hangs down from pivot.
  const armOffset = 1.05 * sc.torso.x;
  const makeArm = (side: 1 | -1): THREE.Group => {
    const grp = new THREE.Group();
    grp.position.set(side * armOffset, 0.85, 0);
    const arm = new THREE.Mesh(rounded(1, 2, 1, 0.15), skinMat());
    arm.position.y = -1; // pivot at top
    grp.add(withEdges(arm, 0.4));
    grp.scale.copy(sc.arm);
    return grp;
  };
  const armL = makeArm(-1);
  const armR = makeArm(1);
  root.add(armL, armR);

  // Legs — pivot at the hip, mesh hangs down. Foot subgroup at the bottom.
  const makeLeg = (side: 1 | -1): { leg: THREE.Group; foot: THREE.Group } => {
    const grp = new THREE.Group();
    grp.position.set(side * 0.5 * sc.torso.x, -1.05, 0);
    const leg = new THREE.Mesh(rounded(1, 2, 1, 0.15), skinMat());
    leg.position.y = -1;
    grp.add(withEdges(leg, 0.4));
    grp.scale.copy(sc.leg);
    const foot = new THREE.Group();
    foot.position.y = -2;
    grp.add(foot);
    return { leg: grp, foot };
  };
  const { leg: legL, foot: footL } = makeLeg(-1);
  const { leg: legR, foot: footR } = makeLeg(1);
  root.add(legL, legR);

  // Pet group — sits on the pedestal next to the character.
  const pet = new THREE.Group();
  root.add(pet);

  const mounts: Record<string, THREE.Group> = {
    root, torso, head, armL, armR, legL, legR, footL, footR,
    handL: armL, handR: armR, // alias
  };
  return { root, torso, head, armL, armR, legL, legR, footL, footR, pet, mounts, equipped: [], faceMat };
}

function clearEquipped(rig: Rig) {
  for (const obj of rig.equipped) {
    obj.parent?.remove(obj);
    obj.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
      else if (mat) mat.dispose();
    });
  }
  rig.equipped = [];
}

// Item builders author each part in the original RobloxAvatar coordinate
// system (`y=0` ≈ body-part center). The rig joint groups, however, have
// their origins at the joint *pivot* (head center, shoulder, hip, ankle).
// These per-mount Y offsets bring the author space onto the rig so hats
// sit on top of the head, sleeves wrap the arm, pants cover the legs, and
// shoes land on the floor instead of overlapping or floating.
const MOUNT_OFFSET_Y: Record<string, number> = {
  head: 0.8,      // head pivot is head center; items expect y=0 = top of head
  torso: 0,       // torso pivot is torso center; items already centered there
  armL: -1,       // shoulder pivot → arm center
  armR: -1,
  legL: -1,       // hip pivot → leg center
  legR: -1,
  footL: 1.15,    // ankle (leg bottom) → tuned so the shoe sole lands on the floor
  footR: 1.15,
  handL: -1.85,   // alias of armL — bring origin down to the hand
  handR: -1.85,
  root: 0,
  pet: 0,
};

function mountOnto(mount: THREE.Group, mountName: string, child: THREE.Object3D): THREE.Object3D {
  const dy = MOUNT_OFFSET_Y[mountName] ?? 0;
  if (dy === 0) {
    mount.add(child);
    return child;
  }
  // Wrap the child so we can offset it without mutating the item builder.
  const wrap = new THREE.Group();
  wrap.position.y = dy;
  wrap.add(child);
  mount.add(wrap);
  return wrap;
}

function equip(rig: Rig, outfit: Outfit) {
  clearEquipped(rig);
  const ctx = { skin: outfit.skin };
  const ids: (string | null)[] = [
    outfit.hat, outfit.hair, outfit.shirt, outfit.pants,
    outfit.shoes, outfit.backpack, outfit.accessory, outfit.pet,
  ];
  // Default mount when an item builder didn't tag any children with a joint
  // name. The matching mount-name is what `MOUNT_OFFSET_Y` looks up.
  const defaultMount: Record<string, { group: THREE.Group; name: string }> = {
    hat:       { group: rig.head,  name: 'head' },
    hair:      { group: rig.head,  name: 'head' },
    accessory: { group: rig.head,  name: 'head' },
    face:      { group: rig.head,  name: 'head' },
    shirt:     { group: rig.torso, name: 'torso' },
    backpack:  { group: rig.torso, name: 'torso' },
    pants:     { group: rig.legL,  name: 'legL' },
    shoes:     { group: rig.footL, name: 'footL' },
    pet:       { group: rig.pet,   name: 'pet' },
  };
  // Hats go on top of head; hair underneath (so a hat overrides hair on top).
  // We mount them in this order: hair first, then hat, so hat reads above.
  const order = [outfit.hair, outfit.shirt, outfit.pants, outfit.shoes,
                 outfit.backpack, outfit.accessory, outfit.hat, outfit.pet];
  for (const id of order) {
    if (!id) continue;
    const item = ITEMS_BY_ID[id];
    if (!item) continue;
    const built = item.build(THREE, ctx);
    // Distribute children by name; if no children are named, mount the whole
    // built object on its category's default mount.
    const namedChildren = built.children.filter((c) => c.name && rig.mounts[c.name]);
    if (namedChildren.length === 0) {
      const mountInfo = defaultMount[item.category] ?? { group: rig.root, name: 'root' };
      const placed = mountOnto(mountInfo.group, mountInfo.name, built);
      rig.equipped.push(placed);
    } else {
      // Move each named child onto its mount, with the per-mount Y offset.
      for (const child of [...namedChildren]) {
        const mount = rig.mounts[child.name];
        const placed = mountOnto(mount, child.name, child);
        rig.equipped.push(placed);
      }
    }
  }
  void ids;
}

function applyEmote(rig: Rig, emote: Emote, t: number) {
  // Reset every frame so emotes are stateless.
  rig.head.rotation.set(0, 0, 0);
  rig.armL.rotation.set(0, 0, 0);
  rig.armR.rotation.set(0, 0, 0);
  rig.legL.rotation.set(0, 0, 0);
  rig.legR.rotation.set(0, 0, 0);
  rig.root.position.y = 0.5;

  switch (emote) {
    case 'idle': {
      const sw = Math.sin(t * 1.6) * 0.05;
      rig.armL.rotation.x = sw;
      rig.armR.rotation.x = -sw;
      rig.root.position.y = 0.5 + Math.sin(t * 1.6) * 0.02;
      rig.head.rotation.y = Math.sin(t * 0.6) * 0.12;
      break;
    }
    case 'wave': {
      rig.armR.rotation.z = -2.4;
      rig.armR.rotation.x = -0.3 + Math.sin(t * 6) * 0.45;
      rig.head.rotation.z = Math.sin(t * 6) * 0.06;
      break;
    }
    case 'dance': {
      const beat = Math.sin(t * 4);
      rig.root.position.y = 0.5 + Math.abs(beat) * 0.18;
      rig.armL.rotation.z = 0.4 + beat * 0.6;
      rig.armR.rotation.z = -0.4 - beat * 0.6;
      rig.armL.rotation.x = -0.3;
      rig.armR.rotation.x = -0.3;
      rig.legL.rotation.z = beat * 0.18;
      rig.legR.rotation.z = beat * 0.18;
      rig.head.rotation.y = beat * 0.3;
      rig.root.rotation.z = beat * 0.06;
      break;
    }
    case 'jump': {
      const cycle = (t % 1.4) / 1.4;
      const up = Math.sin(cycle * Math.PI);
      rig.root.position.y = 0.5 + up * 1.2;
      const crouch = cycle < 0.15 || cycle > 0.85 ? 0.5 : 0;
      rig.legL.rotation.x = crouch;
      rig.legR.rotation.x = crouch;
      rig.armL.rotation.x = -up * 0.7;
      rig.armR.rotation.x = -up * 0.7;
      break;
    }
    case 'think': {
      rig.armR.rotation.z = -1.6;
      rig.armR.rotation.x = -1.4;
      rig.head.rotation.x = 0.15;
      rig.head.rotation.y = -0.25 + Math.sin(t * 1.2) * 0.05;
      rig.root.position.y = 0.5 + Math.sin(t * 1.6) * 0.015;
      break;
    }
    case 'cheer': {
      const beat = Math.abs(Math.sin(t * 3));
      rig.armL.rotation.z = 2.3;
      rig.armR.rotation.z = -2.3;
      rig.armL.rotation.x = -0.2 - beat * 0.3;
      rig.armR.rotation.x = -0.2 - beat * 0.3;
      rig.root.position.y = 0.5 + beat * 0.3;
      rig.head.rotation.x = -0.1;
      break;
    }
  }
}

function buildStage(): THREE.Group {
  const group = new THREE.Group();

  // Pedestal disc.
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.8, 0.5, 36),
    new THREE.MeshStandardMaterial({ color: '#fdf6e6', roughness: 0.95 }),
  );
  disc.position.y = -3.3;
  group.add(disc);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.08, 10, 36),
    new THREE.MeshStandardMaterial({ color: '#1d1a14', roughness: 0.6 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -3.05;
  group.add(ring);

  // Floating decorative blocks around the stage.
  const palette = ['#ffd84d', '#b6f0c6', '#ffc8e0', '#b9d9ff', '#dcc7ff', '#ff8a73'];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = 5.2 + Math.random() * 1.2;
    const size = 0.35 + Math.random() * 0.45;
    const block = new THREE.Mesh(
      rounded(size, size, size, 0.06),
      new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        roughness: 0.7,
        transparent: true,
        opacity: 0.85,
      }),
    );
    block.position.set(
      Math.cos(a) * r,
      -1.5 + Math.random() * 5,
      Math.sin(a) * r * 0.7 - 1.5,
    );
    block.rotation.set(Math.random(), Math.random(), Math.random());
    block.userData.float = {
      base: block.position.y,
      speed: 0.4 + Math.random() * 0.6,
      amp: 0.15 + Math.random() * 0.2,
      offset: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.4,
    };
    group.add(block);
  }
  return group;
}

export const AvatarScene = React.forwardRef<AvatarSceneHandle, Props>(
  function AvatarScene({ outfit, autoRotate }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<{
      yaw: number; targetYaw: number; dragX: number; dragYaw: number; dragging: boolean;
    }>({ yaw: 0.4, targetYaw: 0.4, dragX: 0, dragYaw: 0, dragging: false });
    // Live refs so the animation loop reads the latest props without restart.
    const outfitRef = useRef(outfit);
    const autoRef = useRef(autoRotate);
    outfitRef.current = outfit;
    autoRef.current = autoRotate;

    useImperativeHandle(ref, () => ({
      reset() { stateRef.current.targetYaw = 0.4; },
    }), []);

    useEffect(() => {
      const el = containerRef.current!;
      const scene = new THREE.Scene();
      scene.background = null;

      // Soft three-point-ish lighting.
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb09060, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 0.95);
      key.position.set(4, 6, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffe8c8, 0.3);
      fill.position.set(-4, 2, 3);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xb9d9ff, 0.25);
      rim.position.set(0, 3, -5);
      scene.add(rim);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
      camera.position.set(0, 1.2, 13);
      camera.lookAt(0, 0.2, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const applySize = () => {
        const w = Math.max(1, el.clientWidth);
        const h = Math.max(1, el.clientHeight);
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      applySize();
      const ro = new ResizeObserver(applySize);
      ro.observe(el);

      const stage = buildStage();
      scene.add(stage);

      let rig = buildRig(outfit.skin, outfit.bodyShape);
      scene.add(rig.root);
      equip(rig, outfit);

      let lastFaceKey = `${outfit.face}|${outfit.skin}|0`;
      let faceTex = paintFace(outfit.face, outfit.skin, 0);
      rig.faceMat.map = faceTex;
      rig.faceMat.needsUpdate = true;

      let lastSig = signature(outfit);

      // Pointer drag handling.
      const onDown = (e: PointerEvent) => {
        stateRef.current.dragging = true;
        stateRef.current.dragX = e.clientX;
        stateRef.current.dragYaw = stateRef.current.yaw;
        el.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!stateRef.current.dragging) return;
        const dx = e.clientX - stateRef.current.dragX;
        const next = stateRef.current.dragYaw + dx * 0.01;
        stateRef.current.yaw = next;
        stateRef.current.targetYaw = next;
      };
      const onUp = (e: PointerEvent) => {
        stateRef.current.dragging = false;
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      };
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);

      const t0 = performance.now();
      let raf = 0;
      const loop = () => {
        const t = (performance.now() - t0) / 1000;
        const cur = outfitRef.current;

        // Rebuild rig if skin or body shape changed (geometry is per-shape);
        // otherwise just re-equip when any equipped slot changed.
        const sig = signature(cur);
        if (sig !== lastSig) {
          const needRebuild = sig.split('|')[0] !== lastSig.split('|')[0]
                           || sig.split('|')[1] !== lastSig.split('|')[1];
          if (needRebuild) {
            scene.remove(rig.root);
            rig.root.traverse((o) => {
              const m = o as THREE.Mesh;
              if (m.geometry) m.geometry.dispose();
            });
            rig = buildRig(cur.skin, cur.bodyShape);
            scene.add(rig.root);
            lastFaceKey = ''; // force face repaint on the new head material
          }
          equip(rig, cur);
          lastSig = sig;
        }

        // Blink pattern: closed for 80ms every ~3.5s, slightly randomized.
        const blinkPhase = (t % 3.5);
        const blinkAmt = blinkPhase < 0.08 ? 1 - Math.abs(blinkPhase - 0.04) / 0.04 : 0;
        const faceKey = `${cur.face}|${cur.skin}|${blinkAmt > 0.1 ? 1 : 0}`;
        if (faceKey !== lastFaceKey) {
          faceTex.dispose();
          faceTex = paintFace(cur.face, cur.skin, blinkAmt);
          rig.faceMat.map = faceTex;
          rig.faceMat.needsUpdate = true;
          lastFaceKey = faceKey;
        }

        applyEmote(rig, cur.emote, t);

        // Camera yaw — driven by drag + (optional) auto-rotate.
        if (autoRef.current && !stateRef.current.dragging) {
          stateRef.current.targetYaw += 0.005;
        }
        // Smooth ease toward target.
        stateRef.current.yaw += (stateRef.current.targetYaw - stateRef.current.yaw) * 0.18;
        rig.root.rotation.y = stateRef.current.yaw;

        // Float decorative blocks.
        for (const child of stage.children) {
          const f = (child.userData as { float?: { base: number; speed: number; amp: number; offset: number; spin: number } }).float;
          if (!f) continue;
          child.position.y = f.base + Math.sin(t * f.speed + f.offset) * f.amp;
          child.rotation.y += f.spin * 0.01;
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      loop();

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        el.removeEventListener('pointerdown', onDown);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        renderer.dispose();
        faceTex.dispose();
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose());
          else if (mat) mat.dispose();
        });
        if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      };
    // We intentionally only initialize once — outfit/autoRotate are read via
    // refs so changes are picked up by the loop without rebuilding the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%', height: '100%',
          minHeight: 380,
          cursor: 'grab',
          touchAction: 'none',
        }}
      />
    );
  }
);

function signature(o: Outfit): string {
  // skin and bodyShape go first; rebuild keys on those.
  return [
    o.skin, o.bodyShape,
    o.hat, o.hair, o.face, o.shirt, o.pants, o.shoes,
    o.backpack, o.accessory, o.pet, o.emote,
  ].join('|');
}
