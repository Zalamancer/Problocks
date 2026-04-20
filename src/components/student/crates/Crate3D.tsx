// Three.js 3D crate, painted with the same hand-textured approach as the
// cardboard avatar skin. Renders a chunky box + separate lid + tier-specific
// accent geometry (twine band, packing tape, iron bands, metal trim, glass
// panels). The `phase` prop drives the open animation inside the rAF loop:
//
//   idle   — slow auto-rotate + gentle bob, soft aura (via outer HTML glow)
//   shake  — ease-in random jitter on position + rotation
//   crack  — lid lifts and rotates off; body pops outward slightly
//   burst  — lid continues upward spin; body fades; particle cloud fires
//   reveal — whole rig hidden so the HTML reward card is focal
//
// Textures are memoized per tier in crate-textures.ts so stacking 5 cards
// worth of instances doesn't cost 5× GPU uploads.
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CRATE_TIERS, type CrateTier } from './crate-types';
import { getCrateTextures } from './crate-textures';

export type CratePhase = 'idle' | 'shake' | 'crack' | 'burst' | 'reveal';

interface Crate3DProps {
  tier: CrateTier;
  /** idle = default. Parent unboxing modal drives through the sequence. */
  phase?: CratePhase;
  /** 0 = stop auto-rotation in idle. Default 1. */
  autoRotate?: number;
  /** Optional seed time offset so multiple cards don't bob in lockstep. */
  seed?: number;
}

export const Crate3D = ({
  tier, phase = 'idle', autoRotate = 1, seed = 0,
}: Crate3DProps) => {
  const mount = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<CratePhase>(phase);
  const phaseTRef = useRef<number>(0);            // seconds since phase entered
  const rigRef = useRef<THREE.Group | null>(null);
  const lidRef = useRef<THREE.Group | null>(null);
  const bodyRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Group | null>(null);
  const glowRef = useRef<THREE.PointLight | null>(null);

  // On phase change, reset phase timer and, if re-opening an idle, snap
  // lid/body back to their rest state.
  useEffect(() => {
    phaseTRef.current = 0;
    phaseRef.current = phase;
    if (phase === 'idle' && lidRef.current && bodyRef.current) {
      lidRef.current.position.set(0, 1.02, 0);
      lidRef.current.rotation.set(0, 0, 0);
      lidRef.current.visible = true;
      bodyRef.current.visible = true;
      bodyRef.current.scale.setScalar(1);
      if (particlesRef.current) particlesRef.current.visible = false;
    }
  }, [phase]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    const style = CRATE_TIERS[tier];

    const scene = new THREE.Scene();
    scene.background = null;

    // Lighting: hemi + directional key + tier-colored rim light that pulses.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x404060, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe8c8, 0.35);
    fill.position.set(-3, 2, 3);
    scene.add(fill);
    const glow = new THREE.PointLight(new THREE.Color(style.glow), 0.9, 8, 1.6);
    glow.position.set(0, 0.4, 1.2);
    scene.add(glow);
    glowRef.current = glow;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.6, 7.2);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

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
    el.appendChild(renderer.domElement);
    const ro = new ResizeObserver(applySize);
    ro.observe(el);

    const rig = new THREE.Group();
    scene.add(rig);
    rigRef.current = rig;

    const tex = getCrateTextures(tier);

    /* ---------- body ---------- */

    const body = new THREE.Group();
    rig.add(body);
    bodyRef.current = body;

    // Box face material array: [px, nx, py, ny, pz, nz]
    // We want `side` on ±x / ±z, `bodyTop` on top (+y), darker on bottom.
    const bodyBaseColor = new THREE.Color(style.body);
    const mkSide = () => new THREE.MeshStandardMaterial({
      color: bodyBaseColor, map: tex.side, roughness: 0.85, metalness: tier === 'metal' ? 0.6 : 0.1,
    });
    const bodyMats = [
      mkSide(), mkSide(),                                                       // ±x
      new THREE.MeshStandardMaterial({ color: bodyBaseColor, map: tex.bodyTop, roughness: 0.9, metalness: tier === 'metal' ? 0.5 : 0.1 }),   // +y (top rim / inside)
      new THREE.MeshStandardMaterial({ color: new THREE.Color(style.shadow), roughness: 0.95 }),                                              // -y
      mkSide(), mkSide(),                                                       // ±z
    ];
    const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 2.0), bodyMats);
    bodyMesh.position.y = 0;
    body.add(bodyMesh);
    addEdges(body, bodyMesh, style.shadow);

    // Tier-specific body accents
    if (tier === 'paper') addPaperTwine(body, style);
    else if (tier === 'cardboard') addCardboardTape(body, style);
    else if (tier === 'wooden') addIronBands(body, style);
    else if (tier === 'metal') addMetalTrim(body, style);
    else if (tier === 'crystal') addCrystalPanels(body, style);

    /* ---------- lid ---------- */

    const lid = new THREE.Group();
    lid.position.set(0, 1.02, 0);
    rig.add(lid);
    lidRef.current = lid;

    const lidBaseColor = new THREE.Color(lightenHex(style.body, 0.08));
    const lidMats = [
      new THREE.MeshStandardMaterial({ color: lidBaseColor, map: tex.lidSide, roughness: 0.85, metalness: tier === 'metal' ? 0.55 : 0.1 }),
      new THREE.MeshStandardMaterial({ color: lidBaseColor, map: tex.lidSide, roughness: 0.85, metalness: tier === 'metal' ? 0.55 : 0.1 }),
      new THREE.MeshStandardMaterial({ color: lidBaseColor, map: tex.lidTop,  roughness: 0.78, metalness: tier === 'metal' ? 0.75 : 0.1 }),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(style.shadow), roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: lidBaseColor, map: tex.lidSide, roughness: 0.85, metalness: tier === 'metal' ? 0.55 : 0.1 }),
      new THREE.MeshStandardMaterial({ color: lidBaseColor, map: tex.lidSide, roughness: 0.85, metalness: tier === 'metal' ? 0.55 : 0.1 }),
    ];
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.38, 2.1), lidMats);
    lid.add(lidMesh);
    addEdges(lid, lidMesh, style.shadow);

    if (tier === 'paper') addPaperBow(lid, style);
    else if (tier === 'wooden') addWoodenLidBands(lid, style);
    else if (tier === 'metal') addMetalLidPad(lid, style);
    else if (tier === 'crystal') addCrystalGem(lid, style);

    /* ---------- particles ---------- */

    const particles = new THREE.Group();
    particles.visible = false;
    rig.add(particles);
    particlesRef.current = particles;

    const particleData: { mesh: THREE.Mesh; vel: THREE.Vector3; spin: number; life: number }[] = [];
    const pGeo = new THREE.SphereGeometry(0.12, 8, 6);
    for (let i = 0; i < 36; i++) {
      const colorHex = i % 3 === 0 && style.glow2 ? style.glow2 : style.glow;
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 1,
        roughness: 0.4,
      });
      const m = new THREE.Mesh(pGeo, mat);
      m.visible = false;
      particles.add(m);
      particleData.push({ mesh: m, vel: new THREE.Vector3(), spin: 0, life: 0 });
    }

    /* ---------- animation loop ---------- */

    const clock = new THREE.Clock();
    let raf = 0;
    const t0 = seed;

    const animate = () => {
      const dt = clock.getDelta();
      const t = clock.elapsedTime + t0;
      phaseTRef.current += dt;
      const p = phaseRef.current;
      const pt = phaseTRef.current;

      // Base idle bob + slow auto-rotate.
      rig.position.y = Math.sin(t * 1.2) * 0.06;
      if (p === 'idle') {
        rig.rotation.y += dt * 0.35 * autoRotate;
        rig.rotation.x = Math.sin(t * 0.7) * 0.04;
      }

      // Shake: ramp intensity from 0 → full over 1.4s.
      if (p === 'shake') {
        const k = Math.min(1, pt / 1.4) * style.intensity;
        rig.rotation.z = Math.sin(t * 45) * 0.12 * k;
        rig.rotation.x = Math.sin(t * 37 + 1.2) * 0.08 * k;
        rig.position.x = Math.sin(t * 55) * 0.06 * k;
        rig.position.y += Math.sin(t * 42) * 0.04 * k;
      } else if (p === 'crack' || p === 'burst') {
        rig.rotation.z *= 0.86;
        rig.rotation.x *= 0.86;
        rig.position.x *= 0.86;
      }

      // Lid lifts + rotates during crack/burst.
      if (p === 'crack' || p === 'burst') {
        const liftT = Math.min(1, pt / (p === 'crack' ? 0.45 : 1.0));
        const ease = 1 - Math.pow(1 - liftT, 2.2);
        lid.position.y = 1.02 + ease * 2.6 + (p === 'burst' ? pt * 0.6 : 0);
        lid.rotation.x = -ease * 0.9 - (p === 'burst' ? pt * 1.2 : 0);
        lid.rotation.z = ease * 0.35 + (p === 'burst' ? pt * 0.8 : 0);
        lid.rotation.y = p === 'burst' ? pt * 1.4 : 0;
      }

      // Body pops out then shrinks on burst.
      if (p === 'crack') {
        const k = Math.min(1, pt / 0.45);
        body.scale.setScalar(1 + k * 0.06 - k * k * 0.03);
      }
      if (p === 'burst') {
        const k = Math.min(1, pt / 0.9);
        body.scale.setScalar(1 + 0.08 - k * 0.3);
        bodyMats.forEach((m) => { (m as THREE.MeshStandardMaterial).opacity = 1 - k; (m as THREE.MeshStandardMaterial).transparent = true; });
      }

      // Particle burst starts at burst entry.
      if (p === 'burst' && particles.visible === false) {
        particles.visible = true;
        particleData.forEach((d) => {
          d.mesh.visible = true;
          d.mesh.position.set(0, 0.4, 0);
          const theta = Math.random() * Math.PI * 2;
          const phi = (Math.random() - 0.5) * 1.1;
          const speed = 3 + Math.random() * 4;
          d.vel.set(
            Math.cos(theta) * Math.cos(phi) * speed,
            0.5 + Math.sin(phi) * speed + Math.random() * 2,
            Math.sin(theta) * Math.cos(phi) * speed,
          );
          d.spin = (Math.random() - 0.5) * 10;
          d.life = 0;
          (d.mesh.material as THREE.MeshStandardMaterial).opacity = 1;
          d.mesh.scale.setScalar(1);
        });
      }
      if (particles.visible) {
        particleData.forEach((d) => {
          d.life += dt;
          d.vel.y -= dt * 5; // gravity
          d.mesh.position.addScaledVector(d.vel, dt);
          d.mesh.rotation.y += d.spin * dt;
          const fade = Math.max(0, 1 - d.life / 0.9);
          (d.mesh.material as THREE.MeshStandardMaterial).opacity = fade;
          d.mesh.scale.setScalar(0.4 + fade * 0.6);
        });
      }

      // Hide everything on reveal so HTML card is the focal point.
      rig.visible = p !== 'reveal';

      // Glow light pulses on idle, ramps on shake, flashes on burst.
      if (glowRef.current) {
        let i = 0.9;
        if (p === 'idle')  i = 0.9 + Math.sin(t * 2.4) * 0.3;
        if (p === 'shake') i = 1.0 + Math.min(1, pt / 1.4) * 2.5;
        if (p === 'crack') i = 3.5;
        if (p === 'burst') i = 5.5 * Math.max(0, 1 - pt / 0.8);
        glowRef.current.intensity = i;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      pGeo.dispose();
      bodyMats.forEach((m) => m.dispose());
      lidMats.forEach((m) => m.dispose());
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  // Intentionally NOT reacting to phase here — the rAF loop reads phaseRef.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, autoRotate, seed]);

  return <div ref={mount} style={{ width: '100%', height: '100%' }}/>;
};

/* --------------------------- accents / helpers --------------------------- */

type Style = typeof CRATE_TIERS[CrateTier];

function addEdges(parent: THREE.Object3D, mesh: THREE.Mesh, hex: string) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: new THREE.Color(hex), linewidth: 1 }),
  );
  edges.position.copy(mesh.position);
  parent.add(edges);
}

function addPaperTwine(body: THREE.Group, style: Style) {
  // vertical + horizontal twine bands as thin boxes
  const color = new THREE.Color(style.accent);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const vert = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.02, 2.02), mat);
  body.add(vert);
  const horiz = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.16, 2.02), mat);
  body.add(horiz);
}

function addCardboardTape(body: THREE.Group, _style: Style) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xd4a25e, roughness: 0.7, transparent: true, opacity: 0.9 });
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.02, 2.04), mat);
  body.add(tape);
}

function addIronBands(body: THREE.Group, style: Style) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.shadow), roughness: 0.7, metalness: 0.7,
  });
  const band1 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.14, 2.04), mat);
  band1.position.y = 0.6;
  body.add(band1);
  const band2 = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.14, 2.04), mat);
  band2.position.y = -0.6;
  body.add(band2);
  // rivets
  const rivMat = new THREE.MeshStandardMaterial({ color: 0xc9a173, metalness: 0.6, roughness: 0.4 });
  const rivGeo = new THREE.SphereGeometry(0.06, 10, 8);
  for (const x of [-1.1, -0.4, 0.4, 1.1]) {
    for (const y of [0.6, -0.6]) {
      const r = new THREE.Mesh(rivGeo, rivMat);
      r.position.set(x, y, 1.02);
      body.add(r);
      const r2 = new THREE.Mesh(rivGeo, rivMat);
      r2.position.set(x, y, -1.02);
      body.add(r2);
    }
  }
}

function addMetalTrim(body: THREE.Group, style: Style) {
  // corner beveled trim strips (top and bottom)
  const trimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.accent), metalness: 0.9, roughness: 0.3,
  });
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.08, 2.04), trimMat);
  topTrim.position.y = 0.98;
  body.add(topTrim);
  const botTrim = topTrim.clone();
  botTrim.position.y = -0.98;
  body.add(botTrim);
  // rivets scattered
  const rivMat = new THREE.MeshStandardMaterial({ color: 0xe2ecf4, metalness: 0.8, roughness: 0.25 });
  const rivGeo = new THREE.SphereGeometry(0.055, 10, 8);
  for (const x of [-1.1, 0, 1.1]) {
    for (const y of [0.55, -0.55]) {
      const r = new THREE.Mesh(rivGeo, rivMat);
      r.position.set(x, y, 1.02);
      body.add(r);
      const r2 = new THREE.Mesh(rivGeo, rivMat);
      r2.position.set(x, y, -1.02);
      body.add(r2);
    }
  }
}

function addCrystalPanels(body: THREE.Group, style: Style) {
  const panelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.glow),
    emissive: new THREE.Color(style.glow),
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.55,
    roughness: 0.15,
    metalness: 0.1,
  });
  const panelMat2 = panelMat.clone();
  if (style.glow2) {
    panelMat2.color = new THREE.Color(style.glow2);
    panelMat2.emissive = new THREE.Color(style.glow2);
  }
  // four sides
  const sideGeo = new THREE.BoxGeometry(1.6, 1.2, 0.06);
  const pF = new THREE.Mesh(sideGeo, panelMat);  pF.position.set(0, 0, 1.03);  body.add(pF);
  const pB = new THREE.Mesh(sideGeo, panelMat2); pB.position.set(0, 0, -1.03); body.add(pB);
  const sideGeo2 = new THREE.BoxGeometry(0.06, 1.2, 1.6);
  const pL = new THREE.Mesh(sideGeo2, panelMat2); pL.position.set(-1.31, 0, 0); body.add(pL);
  const pR = new THREE.Mesh(sideGeo2, panelMat);  pR.position.set(1.31, 0, 0); body.add(pR);
  // inner shimmer core
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.glow),
    emissive: new THREE.Color(style.glow),
    emissiveIntensity: 2.2,
    transparent: true,
    opacity: 0.85,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), coreMat);
  body.add(core);
}

function addPaperBow(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(style.accent), roughness: 0.85 });
  const band = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.12, 0.28), mat);
  band.position.y = 0.2;
  lid.add(band);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 10, 18), mat);
  bow.position.set(0, 0.26, 0);
  bow.rotation.x = Math.PI / 2;
  lid.add(bow);
}

function addWoodenLidBands(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.shadow), metalness: 0.6, roughness: 0.6,
  });
  const band = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.06, 2.12), mat);
  band.position.y = 0.22;
  lid.add(band);
}

function addMetalLidPad(lid: THREE.Group, style: Style) {
  const padMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.shadow), metalness: 0.6, roughness: 0.5,
  });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), padMat);
  pad.position.y = 0.24;
  lid.add(pad);
  const gemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.glow),
    emissive: new THREE.Color(style.glow),
    emissiveIntensity: 1.4,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), gemMat);
  gem.position.y = 0.32;
  lid.add(gem);
}

function addCrystalGem(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.glow2 || style.glow),
    emissive: new THREE.Color(style.glow2 || style.glow),
    emissiveIntensity: 1.8,
    metalness: 0.2,
    roughness: 0.2,
    transparent: true,
    opacity: 0.95,
  });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), mat);
  gem.position.y = 0.36;
  lid.add(gem);
  // little golden cap
  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(style.accent), metalness: 0.9, roughness: 0.25,
  });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.08, 12), capMat);
  cap.position.y = 0.22;
  lid.add(cap);
}

function lightenHex(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const nr = Math.round(r + (255 - r) * amt);
  const ng = Math.round(g + (255 - g) * amt);
  const nb = Math.round(b + (255 - b) * amt);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
