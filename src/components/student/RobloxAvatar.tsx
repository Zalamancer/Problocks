// Roblox-style 3D avatar, rendered with Three.js (WebGL). Real 3D boxes for
// head / torso / arms / legs / hair / hat, with lighting + slow auto-orbit.
// Outfit-driven so a future wardrobe UI can dress the character live.
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AvatarFace = 'smile' | 'happy' | 'cool' | 'wink' | 'neutral';
export type AvatarHat = 'none' | 'cap' | 'beanie' | 'tophat';
export type AvatarHair = 'none' | 'short' | 'spike' | 'long';

export interface AvatarOutfit {
  skin?: string;
  shirt?: string;
  pants?: string;
  face?: AvatarFace;
  hat?: AvatarHat;
  hatColor?: string;
  hair?: AvatarHair;
  hairColor?: string;
}

const DEFAULT_OUTFIT: Required<AvatarOutfit> = {
  skin: '#ffd84d',
  shirt: '#6fbf73',
  pants: '#3a3c4a',
  face: 'smile',
  hat: 'none',
  hatColor: '#c24949',
  hair: 'short',
  hairColor: '#3a2a1a',
};

const STROKE = '#1d1a14';

// Paint a 128x128 face onto a canvas and return it as a CanvasTexture.
// Drawn on the +Z face of the head so the character "looks out" of the screen.
function makeFaceTexture(face: AvatarFace, skin: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Fill background with skin so head front blends seamlessly.
  ctx.fillStyle = skin;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = STROKE;
  ctx.strokeStyle = STROKE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = size / 2;
  const eyeY = size * 0.44;
  const mouthY = size * 0.7;

  const drawEye = (x: number, y: number, w = 10, h = 16) => {
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  };

  switch (face) {
    case 'happy':
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx - 18, eyeY, 9, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 18, eyeY, 9, Math.PI, 0, false);
      ctx.stroke();
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2, 16, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'cool':
      ctx.fillRect(cx - 32, eyeY - 10, 64, 16);
      ctx.fillStyle = '#9ad7ff';
      ctx.fillRect(cx - 26, eyeY - 6, 16, 8);
      ctx.fillRect(cx + 10, eyeY - 6, 16, 8);
      ctx.fillStyle = STROKE;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, mouthY, 12, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'wink':
      drawEye(cx - 18, eyeY);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx + 18, eyeY, 8, Math.PI, 0, false);
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2, 14, 0, Math.PI, false);
      ctx.stroke();
      break;
    case 'neutral':
      drawEye(cx - 18, eyeY);
      drawEye(cx + 18, eyeY);
      ctx.fillRect(cx - 14, mouthY, 28, 5);
      break;
    case 'smile':
    default:
      drawEye(cx - 18, eyeY);
      drawEye(cx + 18, eyeY);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, mouthY - 2, 14, 0, Math.PI, false);
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
  size = 120,
  outfit,
  framed = true,
  autoRotate = true,
}: {
  size?: number;
  outfit?: AvatarOutfit;
  framed?: boolean;
  autoRotate?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; yaw: number; dragging: boolean }>({ x: 0, yaw: 0, dragging: false });

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
    camera.position.set(0, 0.4, 11);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.7, metalness: 0.0 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: o.pants, roughness: 0.85 });
    const hairMat = new THREE.MeshStandardMaterial({ color: o.hairColor, roughness: 0.9 });
    const hatMat = new THREE.MeshStandardMaterial({ color: o.hatColor, roughness: 0.7 });

    const faceTex = makeFaceTexture(o.face, o.skin);
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.75 });

    const character = new THREE.Group();

    // Torso: 2w x 2h x 1d
    const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), shirtMat);
    torso.position.set(0, 0, 0);
    character.add(withEdges(torso));

    // Head: 1.6 cube sitting on top of torso
    const headGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const head = new THREE.Mesh(headGeo, makeHeadMaterials(skinMat, faceMat));
    head.position.set(0, 1 + 0.8 + 0.05, 0); // torso half + head half + gap
    character.add(withEdges(head));

    // Arms: 1 x 2 x 1 on each side
    const armGeoL = new THREE.BoxGeometry(1, 2, 1);
    const armL = new THREE.Mesh(armGeoL, skinMat);
    armL.position.set(-1.5, 0, 0);
    character.add(withEdges(armL));
    const armR = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), skinMat);
    armR.position.set(1.5, 0, 0);
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
    character.add(shadow);

    // Slight overall lift so the mid-torso sits at y≈0 in the viewport.
    character.position.y = 0.5;
    // Start angled a touch so 3D reads immediately even without rotation.
    character.rotation.y = Math.PI * 0.12;
    scene.add(character);

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
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      faceTex.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  // Rebuild when outfit or size changes — cheap for a 12-box scene.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, autoRotate, JSON.stringify(outfit)]);

  const inner = (
    <div
      ref={containerRef}
      style={{
        width: size, height: size,
        cursor: 'grab', touchAction: 'none',
      }}
    />
  );

  if (!framed) return inner;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.2,
      background: 'linear-gradient(180deg, var(--pbs-cream) 0%, var(--pbs-cream-2) 100%)',
      border: `1.5px solid ${STROKE}`,
      boxShadow: `0 2px 0 ${STROKE}`,
      overflow: 'hidden', position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {inner}
    </div>
  );
};
