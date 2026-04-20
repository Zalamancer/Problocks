// Roblox-style 3D avatar, rendered with Three.js (WebGL). Real 3D boxes for
// head / torso / arms / legs / hair / hat, with lighting + slow auto-orbit.
// Outfit-driven so a future wardrobe UI can dress the character live.
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AvatarFace = 'smile' | 'happy' | 'cool' | 'wink' | 'neutral';
export type AvatarHat = 'none' | 'cap' | 'beanie' | 'tophat';
export type AvatarHair = 'none' | 'short' | 'spike' | 'long';
export type AvatarGender = 'boy' | 'girl';

export interface AvatarOutfit {
  skin?: string;
  shirt?: string;
  pants?: string;
  face?: AvatarFace;
  hat?: AvatarHat;
  hatColor?: string;
  hair?: AvatarHair;
  hairColor?: string;
  gender?: AvatarGender;
}

const DEFAULT_OUTFIT: Required<AvatarOutfit> = {
  skin: '#c9a173',      // kraft-cardboard tan
  shirt: '#6fbf73',
  pants: '#3a3c4a',
  face: 'smile',
  hat: 'none',
  hatColor: '#c24949',
  hair: 'short',
  hairColor: '#3a2a1a',
  gender: 'boy',
};

// Boy / girl proportions. Heads stay the same size so hats / hair / face
// keep their existing offsets — only torso width + shoulder spacing change,
// which gives a clearly slimmer silhouette without breaking any item placement.
interface Proportions { torsoW: number; armX: number }
const PROPORTIONS: Record<AvatarGender, Proportions> = {
  boy:  { torsoW: 2.0, armX: 1.5 },
  girl: { torsoW: 1.7, armX: 1.35 }, // torsoW/2 (0.85) + armW/2 (0.5) = 1.35 → arms flush with torso
};

const STROKE = '#1d1a14';

// Paint a cardboard *luminance* pattern: near-white base with a subtle
// vertical lightness gradient, semi-transparent black corrugation ridges,
// neutral paper grain, and dark fibers. The point is that this canvas is
// applied as `material.map` and tinted by `material.color = skin`, so
// kraft tan looks like kraft cardboard AND any other skin tone shows the
// same corrugation/grain pattern instead of being a flat colour.
function paintCardboard(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#f5f5f5');
  grad.addColorStop(1, '#e6e6e6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Horizontal corrugation ridges — neutral highlight then darker shadow.
  const ridge = Math.max(8, Math.round(size / 26));
  for (let y = 0; y < size; y += ridge) {
    const g = ctx.createLinearGradient(0, y, 0, y + ridge);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, size, ridge);
  }

  // Paper grain — neutral so it doesn't push the hue around when tinted.
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i]     = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  // Darker fibers — pure black at low alpha, lets the skin tint show through.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  const fibers = Math.round(size / 6);
  for (let i = 0; i < fibers; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 4 + Math.random() * 10;
    ctx.fillRect(x, y, len, 1);
  }
}

function makeCardboardTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  paintCardboard(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Paint a 256x256 face onto a canvas and return it as a CanvasTexture.
// Drawn on the +Z face of the head so the character "looks out" of the screen.
// The background is always the same neutral cardboard luminance pattern; the
// head face material multiplies it by the skin colour so the front of the
// head matches the rest of the head regardless of which skin tone is picked.
function makeFaceTexture(face: AvatarFace): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  paintCardboard(ctx, size);

  ctx.fillStyle = STROKE;
  ctx.strokeStyle = STROKE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Scale factor vs the previous 128px face (all the decal constants were
  // authored against a 128 canvas — just double them for 256).
  const s = size / 128;
  const cx = size / 2;
  const eyeY = size * 0.44;
  const mouthY = size * 0.7;

  const drawEye = (x: number, y: number, w = 10 * s, h = 16 * s) => {
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  };

  switch (face) {
    case 'happy':
      ctx.lineWidth = 6 * s;
      ctx.beginPath();
      ctx.arc(cx - 18 * s, eyeY, 9 * s, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 18 * s, eyeY, 9 * s, Math.PI, 0, false);
      ctx.stroke();
      ctx.lineWidth = 7 * s;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2 * s, 16 * s, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'cool':
      ctx.fillRect(cx - 32 * s, eyeY - 10 * s, 64 * s, 16 * s);
      ctx.fillStyle = '#9ad7ff';
      ctx.fillRect(cx - 26 * s, eyeY - 6 * s, 16 * s, 8 * s);
      ctx.fillRect(cx + 10 * s, eyeY - 6 * s, 16 * s, 8 * s);
      ctx.fillStyle = STROKE;
      ctx.lineWidth = 6 * s;
      ctx.beginPath();
      ctx.arc(cx, mouthY, 12 * s, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'wink':
      drawEye(cx - 18 * s, eyeY);
      ctx.lineWidth = 5 * s;
      ctx.beginPath();
      ctx.arc(cx + 18 * s, eyeY, 8 * s, Math.PI, 0, false);
      ctx.stroke();
      ctx.lineWidth = 6 * s;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2 * s, 14 * s, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'neutral':
      drawEye(cx - 18 * s, eyeY);
      drawEye(cx + 18 * s, eyeY);
      ctx.fillRect(cx - 14 * s, mouthY, 28 * s, 5 * s);
      break;
    case 'smile':
    default:
      drawEye(cx - 18 * s, eyeY);
      drawEye(cx + 18 * s, eyeY);
      ctx.lineWidth = 6 * s;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2 * s, 14 * s, 0, Math.PI, false);
      ctx.stroke();
      break;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

// Build a 6-material cube where the +Z face uses `faceMat` and the others
// use `bodyMat`. This is how we pin the smile onto the head front only.
function makeHeadMaterials(bodyMat: THREE.Material, faceMat: THREE.Material): THREE.Material[] {
  // Order: +x, -x, +y, -y, +z, -z
  return [bodyMat, bodyMat, bodyMat, bodyMat, faceMat, bodyMat];
}

// Add a thin black edge around a BoxGeometry (Roblox studs feel chunky).
function withEdges(mesh: THREE.Mesh, color = 0x1d1a14): THREE.Group {
  const group = new THREE.Group();
  group.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry),
    new THREE.LineBasicMaterial({ color, linewidth: 1 }),
  );
  mesh.add(edges);
  return group;
}

export const RobloxAvatar = ({
  size = 'fill',
  outfit,
  framed = true,
  autoRotate = true,
}: {
  /** `'fill'` = match container (width/height). Pass a number for fixed px. */
  size?: number | 'fill';
  outfit?: AvatarOutfit;
  framed?: boolean;
  autoRotate?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; yaw: number; dragging: boolean }>({ x: 0, yaw: 0, dragging: false });
  // Persistent zoom factor applied on top of the auto-fit distance. Lower
  // values = closer, higher = farther. Clamped in the button handlers.
  const zoomRef = useRef<number>(1.0);
  // Handle back into the effect so the +/- buttons can trigger a re-fit.
  const refitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const o = { ...DEFAULT_OUTFIT, ...(outfit || {}) };

    const scene = new THREE.Scene();
    scene.background = null; // transparent

    // Lighting: soft sky + directional key for clear face shading.
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb09060, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe8c8, 0.35);
    fill.position.set(-3, 2, 3);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.4, 15);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Forward-declared so applySize can call it once the character is built.
    let fitCameraToCharacter: (() => void) | null = null;

    const applySize = () => {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (fitCameraToCharacter) fitCameraToCharacter();
    };
    applySize();
    el.appendChild(renderer.domElement);

    // Track parent resizes (card width changes, font-size changes, etc.).
    const ro = new ResizeObserver(applySize);
    ro.observe(el);

    // Cardboard texture is always created and applied as the base luminance
    // map on the skin. The chosen skin colour multiplies that texture so the
    // corrugation/grain pattern reads with any tone (kraft tan, peach, brown,
    // etc.) instead of disappearing into a flat fill.
    const cardboardTex = makeCardboardTexture();

    // Materials. `color = skin` tints the near-white cardboard map so picking
    // a different skin in the wardrobe just retints the same pattern.
    const skinMat = new THREE.MeshStandardMaterial({
      color: o.skin,
      map: cardboardTex,
      roughness: 0.95,
      metalness: 0.0,
    });
    const shirtMat = new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: o.pants, roughness: 0.85 });
    const hairMat = new THREE.MeshStandardMaterial({ color: o.hairColor, roughness: 0.9 });
    const hatMat = new THREE.MeshStandardMaterial({ color: o.hatColor, roughness: 0.7 });

    // Face is now always painted on the cardboard background; the head face
    // material also takes `color = skin` so the background tints to match the
    // surrounding skin material (otherwise the face would read as plain white).
    const faceTex = makeFaceTexture(o.face);
    const faceMat = new THREE.MeshStandardMaterial({ color: o.skin, map: faceTex, roughness: 0.9 });

    const character = new THREE.Group();
    const prop = PROPORTIONS[o.gender];

    // Torso: width = boy 2.0 / girl 1.7, height 2, depth 1.
    const torso = new THREE.Mesh(new THREE.BoxGeometry(prop.torsoW, 2, 1), shirtMat);
    torso.position.set(0, 0, 0);
    character.add(withEdges(torso));

    // Head: 1.6 cube sitting on top of torso (same size for both genders so
    // hats / hair / face decals keep their tuned offsets).
    const headGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const head = new THREE.Mesh(headGeo, makeHeadMaterials(skinMat, faceMat));
    head.position.set(0, 1 + 0.8 + 0.05, 0); // torso half + head half + gap
    character.add(withEdges(head));

    // Arms: 1 x 2 x 1; shoulders shift in for the slimmer girl silhouette.
    const armGeoL = new THREE.BoxGeometry(1, 2, 1);
    const armL = new THREE.Mesh(armGeoL, skinMat);
    armL.position.set(-prop.armX, 0, 0);
    character.add(withEdges(armL));
    const armR = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), skinMat);
    armR.position.set(prop.armX, 0, 0);
    character.add(withEdges(armR));

    // Legs: 1 x 2 x 1
    const legL = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), pantsMat);
    legL.position.set(-0.5, -2, 0);
    character.add(withEdges(legL));
    const legR = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), pantsMat);
    legR.position.set(0.5, -2, 0);
    character.add(withEdges(legR));

    // Hair
    if (o.hair !== 'none') {
      const hairGroup = new THREE.Group();
      if (o.hair === 'short') {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.7), hairMat);
        top.position.y = 0.9;
        hairGroup.add(withEdges(top));
      } else if (o.hair === 'spike') {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.7), hairMat);
        cap.position.y = 0.85;
        hairGroup.add(withEdges(cap));
        for (let i = 0; i < 4; i++) {
          const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.22, 0.5, 4),
            hairMat,
          );
          spike.position.set(-0.55 + i * 0.38, 1.25, 0.1);
          spike.rotation.y = Math.PI / 4;
          hairGroup.add(spike);
        }
      } else if (o.hair === 'long') {
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.5, 1.75), hairMat);
        top.position.y = 0.9;
        hairGroup.add(withEdges(top));
        const backDrop = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.4, 0.3), hairMat);
        backDrop.position.set(0, 0.15, -0.7);
        hairGroup.add(withEdges(backDrop));
        const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 1.7), hairMat);
        sideL.position.set(-0.75, 0.1, 0);
        hairGroup.add(withEdges(sideL));
        const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 1.7), hairMat);
        sideR.position.set(0.75, 0.1, 0);
        hairGroup.add(withEdges(sideR));
      }
      hairGroup.position.copy(head.position);
      character.add(hairGroup);
    }

    // Hat
    if (o.hat !== 'none') {
      const hatGroup = new THREE.Group();
      if (o.hat === 'cap') {
        const crown = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 1.75), hatMat);
        crown.position.y = 1.05;
        hatGroup.add(withEdges(crown));
        const brim = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.1), hatMat);
        brim.position.set(0, 0.85, 0.85);
        hatGroup.add(withEdges(brim));
      } else if (o.hat === 'beanie') {
        const crown = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.75, 1.75), hatMat);
        crown.position.y = 1.15;
        hatGroup.add(withEdges(crown));
        const pom = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 10, 8),
          hatMat,
        );
        pom.position.y = 1.65;
        hatGroup.add(pom);
      } else if (o.hat === 'tophat') {
        const brim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), hatMat);
        brim.position.y = 0.88;
        hatGroup.add(withEdges(brim));
        const crown = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.4), hatMat);
        crown.position.y = 1.65;
        hatGroup.add(withEdges(crown));
      }
      hatGroup.position.copy(head.position);
      character.add(hatGroup);
    }

    // Faint ground shadow disc so it doesn't look like it's floating.
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000, transparent: true, opacity: 0.18,
    });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.0, 24), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -3.02;
    // Tagged so fitCameraToCharacter can exclude the shadow disc — the disc
    // is 2u radius on XZ and would inflate the horizontal fit, pushing the
    // camera too far back and leaving the legs clipped at the bottom.
    shadow.userData.isShadow = true;
    character.add(shadow);

    // Slight overall lift so the mid-torso sits at y≈0 in the viewport.
    character.position.y = 0.5;
    // Start angled a touch so 3D reads immediately even without rotation.
    character.rotation.y = Math.PI * 0.12;
    scene.add(character);

    // Fit the camera to the fully-assembled character (head + any hat/hair)
    // with a small margin, so tall hats like the top-hat don't clip off the
    // top of the frame. Uses vertical FOV at current aspect and picks the
    // tighter of vertical/horizontal fits so narrow containers still work.
    fitCameraToCharacter = () => {
      // Make sure transforms (character.position/rotation, hair/hat groups
      // copied after their parent was positioned) are flushed — otherwise
      // Box3.setFromObject reads stale matrixWorlds and the fit misaligns.
      character.updateMatrixWorld(true);
      // Manual bbox that skips the shadow disc and the edge-outline
      // LineSegments (edges extend slightly past the box geometry in world
      // space). This gives a tight bound on the actual body silhouette.
      const box = new THREE.Box3();
      let hasAny = false;
      character.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        if (obj.userData && obj.userData.isShadow) return;
        const mesh = obj as THREE.Mesh;
        const geom = mesh.geometry as THREE.BufferGeometry;
        if (!geom.boundingBox) geom.computeBoundingBox();
        const meshBox = geom.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
        if (hasAny) box.union(meshBox);
        else { box.copy(meshBox); hasAny = true; }
      });
      if (!hasAny) return;
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const margin = 1.2; // 20% padding — keeps arms/legs off the edge
      const vFov = (camera.fov * Math.PI) / 180;
      const aspect = Math.max(0.0001, camera.aspect);
      const distV = (size.y * margin) / (2 * Math.tan(vFov / 2));
      const distH = (size.x * margin) / (2 * Math.tan(vFov / 2) * aspect);
      const baseDist = Math.max(distV, distH) + size.z / 2 + 0.5;
      const dist = baseDist * zoomRef.current;
      camera.position.set(0, center.y, dist);
      camera.lookAt(0, center.y, 0);
      camera.updateProjectionMatrix();
    };
    fitCameraToCharacter();
    refitRef.current = fitCameraToCharacter;

    // Mouse drag to spin.
    const onPointerDown = (e: PointerEvent) => {
      dragRef.current.dragging = true;
      dragRef.current.x = e.clientX;
      dragRef.current.yaw = character.rotation.y;
      el.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.x;
      character.rotation.y = dragRef.current.yaw + dx * 0.01;
    };
    const onPointerUp = (e: PointerEvent) => {
      dragRef.current.dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    let raf = 0;
    const animate = () => {
      if (autoRotate && !dragRef.current.dragging) {
        character.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      faceTex.dispose();
      cardboardTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      refitRef.current = null;
    };
  // Scene is rebuilt only when the outfit or autoRotate flag changes. Size
  // changes are handled live by the ResizeObserver above, so we don't want
  // `size` in the dep array. `JSON.stringify(outfit)` covers gender too.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotate, JSON.stringify(outfit)]);

  const sizeStyle: React.CSSProperties = size === 'fill'
    ? { width: '100%', aspectRatio: '1 / 1' }
    : { width: size, height: size };

  // Zoom buttons nudge the persistent zoom factor and ask the scene to
  // re-fit. Clamp so the user can't zoom so far out they lose the character
  // or zoom so far in the camera flips through the head.
  const adjustZoom = (factor: number) => {
    const next = Math.max(0.4, Math.min(2.5, zoomRef.current * factor));
    zoomRef.current = next;
    refitRef.current?.();
  };

  const zoomBtnStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: 10,
    border: `2px solid var(--pbs-butter-ink)`,
    background: 'var(--pbs-butter)',
    color: 'var(--pbs-butter-ink)',
    font: '700 16px/1 system-ui, sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 0 var(--pbs-butter-ink)',
    padding: 0,
  };

  const zoomButtons = (
    <div
      style={{
        position: 'absolute',
        right: 8,
        bottom: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 2,
        // Don't block pointer drags on the canvas area itself.
        pointerEvents: 'none',
      }}
    >
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => adjustZoom(0.85)}
        style={{ ...zoomBtnStyle, pointerEvents: 'auto' }}
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => adjustZoom(1 / 0.85)}
        style={{ ...zoomBtnStyle, pointerEvents: 'auto' }}
      >
        −
      </button>
    </div>
  );

  const inner = (
    <div
      ref={containerRef}
      style={{
        ...sizeStyle,
        cursor: 'grab',
        touchAction: 'none',
      }}
    />
  );

  if (!framed) {
    return (
      <div style={{ ...sizeStyle, position: 'relative' }}>
        {inner}
        {zoomButtons}
      </div>
    );
  }

  // Chunky butter-yellow frame — matches the "Chunky" button treatment used
  // across the student app (butter face + butter-ink outline + offset
  // shadow). Reads as a highlighted, playful tile on the dark user card.
  return (
    <div style={{
      ...sizeStyle,
      borderRadius: 22,
      background: 'linear-gradient(180deg, var(--pbs-cream) 0%, var(--pbs-cream-2) 100%)',
      border: `4px solid var(--pbs-butter)`,
      outline: `2px solid var(--pbs-butter-ink)`,
      outlineOffset: 0,
      boxShadow: `0 6px 0 var(--pbs-butter-ink), 0 14px 28px -10px rgba(107,79,0,0.5)`,
      overflow: 'hidden', position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {inner}
      {zoomButtons}
    </div>
  );
};
