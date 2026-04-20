// Three.js 3D crate rendered in the pb-site chunky-pastel style.
// Flat Lambert tints, thick painted ink outlines (achieved via a back-face
// ink shell and EdgesGeometry overlay), chunky solid drop-shadow puck on
// the floor, pastel tier glow. No PBR metalness, no gradient reflections.
//
// Animation phases (driven from parent via `phase` prop):
//   idle   — slow auto-rotate + gentle bob
//   shake  — ramp random jitter to `style.intensity`
//   crack  — lid lifts with easing
//   burst  — lid keeps spinning upward; body scales down + fades;
//            36 flat pastel spheres fire outward with gravity
//   reveal — rig hidden so HTML reward card is focal
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CRATE_TIERS, type CrateTier } from './crate-types';
import { getCrateTextures } from './crate-textures';

export type CratePhase = 'idle' | 'shake' | 'crack' | 'burst' | 'reveal';

const INK = 0x1d1a14;
const CREAM = 0xfdf6e6;

interface Crate3DProps {
  tier: CrateTier;
  phase?: CratePhase;
  autoRotate?: number;
  seed?: number;
}

export const Crate3D = ({
  tier, phase = 'idle', autoRotate = 1, seed = 0,
}: Crate3DProps) => {
  const mount = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<CratePhase>(phase);
  const phaseTRef = useRef<number>(0);
  const lidRef = useRef<THREE.Group | null>(null);
  const bodyRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Group | null>(null);
  const rigRef = useRef<THREE.Group | null>(null);

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

    // Flat, soft, cel-like lighting — hemisphere dominates so surfaces read
    // as even tone blocks. One gentle directional adds just enough face
    // separation to sell the 3D.
    scene.add(new THREE.HemisphereLight(0xfffbea, 0x332a22, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 0.35);
    key.position.set(3, 4, 4);
    scene.add(key);

    const glow = new THREE.PointLight(new THREE.Color(style.glow), 0.6, 8, 1.4);
    glow.position.set(0, 0.4, 1.4);
    scene.add(glow);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 1.8, 7.4);
    camera.lookAt(0, 0.3, 0);

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
    const bodyColor = new THREE.Color(style.body);
    const shadowColor = new THREE.Color(style.shadow);

    /* ----------------------- chunky drop shadow --------------------- */
    // Offset solid ellipse (not a blurred shadow) on the ground plane.
    const shadowPuck = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 32),
      new THREE.MeshBasicMaterial({ color: shadowColor, transparent: true, opacity: 0.35 }),
    );
    shadowPuck.rotation.x = -Math.PI / 2;
    shadowPuck.position.set(0.18, -1.1, 0.18);
    shadowPuck.scale.set(1.15, 0.9, 1);
    rig.add(shadowPuck);

    /* ------------------------------ body ---------------------------- */

    const body = new THREE.Group();
    rig.add(body);
    bodyRef.current = body;

    const mkFlat = (map: THREE.Texture) => new THREE.MeshLambertMaterial({
      color: bodyColor, map, emissive: bodyColor, emissiveIntensity: 0.22,
    });
    const bodyMats: THREE.Material[] = [
      mkFlat(tex.side), mkFlat(tex.side),
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.bodyTop }),
      new THREE.MeshLambertMaterial({ color: shadowColor }),
      mkFlat(tex.side), mkFlat(tex.side),
    ];
    const bodyGeo = new THREE.BoxGeometry(2.6, 2.0, 2.0);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMats);
    body.add(bodyMesh);
    addInkShell(body, bodyGeo);
    addInkEdges(body, bodyGeo);

    // Tier-specific chunky body accent (flat geometry, ink-outlined)
    if (tier === 'paper') addPaperTwine(body, style);
    else if (tier === 'cardboard') addTapeBand(body, style);
    else if (tier === 'wooden') addWoodenBands(body, style);
    else if (tier === 'metal') addMetalRivets(body, style);
    else if (tier === 'crystal') addCrystalPanels(body, style);

    /* ------------------------------ lid ----------------------------- */

    const lid = new THREE.Group();
    lid.position.set(0, 1.02, 0);
    rig.add(lid);
    lidRef.current = lid;

    const lidMats: THREE.Material[] = [
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.lidSide }),
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.lidSide }),
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.lidTop, emissive: bodyColor, emissiveIntensity: 0.18 }),
      new THREE.MeshLambertMaterial({ color: shadowColor }),
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.lidSide }),
      new THREE.MeshLambertMaterial({ color: bodyColor, map: tex.lidSide }),
    ];
    const lidGeo = new THREE.BoxGeometry(2.7, 0.4, 2.1);
    const lidMesh = new THREE.Mesh(lidGeo, lidMats);
    lid.add(lidMesh);
    addInkShell(lid, lidGeo);
    addInkEdges(lid, lidGeo);

    if (tier === 'paper') addPaperBow(lid, style);
    else if (tier === 'crystal') addCrystalGem(lid, style);
    else if (tier === 'metal') addMetalGem(lid, style);

    /* ---------------------------- particles ------------------------- */

    const particles = new THREE.Group();
    particles.visible = false;
    rig.add(particles);
    particlesRef.current = particles;

    const particleData: { mesh: THREE.Mesh; vel: THREE.Vector3; spin: number; life: number }[] = [];
    const particleTones = [style.glow, style.glow2 || style.accent, style.accent, '#fdf6e6'];
    const pGeo = new THREE.SphereGeometry(0.16, 10, 8);
    for (let i = 0; i < 36; i++) {
      const color = new THREE.Color(particleTones[i % particleTones.length]);
      const mat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 1,
      });
      const m = new THREE.Mesh(pGeo, mat);
      // Ink outline on each particle — same cartoon shell trick, tiny scale
      const shell = new THREE.Mesh(
        pGeo,
        new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }),
      );
      shell.scale.setScalar(1.2);
      m.add(shell);
      m.visible = false;
      particles.add(m);
      particleData.push({ mesh: m, vel: new THREE.Vector3(), spin: 0, life: 0 });
    }

    /* ----------------------------- loop ----------------------------- */

    const clock = new THREE.Clock();
    let raf = 0;
    const t0 = seed;

    const animate = () => {
      const dt = clock.getDelta();
      const t = clock.elapsedTime + t0;
      phaseTRef.current += dt;
      const p = phaseRef.current;
      const pt = phaseTRef.current;

      rig.position.y = Math.sin(t * 1.2) * 0.06;
      if (p === 'idle') {
        rig.rotation.y += dt * 0.35 * autoRotate;
        rig.rotation.x = Math.sin(t * 0.7) * 0.04;
      }

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

      if (p === 'crack' || p === 'burst') {
        const liftT = Math.min(1, pt / (p === 'crack' ? 0.45 : 1.0));
        const ease = 1 - Math.pow(1 - liftT, 2.2);
        lid.position.y = 1.02 + ease * 2.6 + (p === 'burst' ? pt * 0.6 : 0);
        lid.rotation.x = -ease * 0.9 - (p === 'burst' ? pt * 1.2 : 0);
        lid.rotation.z = ease * 0.35 + (p === 'burst' ? pt * 0.8 : 0);
        lid.rotation.y = p === 'burst' ? pt * 1.4 : 0;
      }

      if (p === 'crack') {
        const k = Math.min(1, pt / 0.45);
        body.scale.setScalar(1 + k * 0.06 - k * k * 0.03);
      }
      if (p === 'burst') {
        const k = Math.min(1, pt / 0.9);
        body.scale.setScalar(1 + 0.08 - k * 0.3);
        bodyMats.forEach((m) => {
          const lm = m as THREE.MeshLambertMaterial;
          lm.transparent = true;
          lm.opacity = 1 - k;
        });
      }

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
          (d.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
          d.mesh.scale.setScalar(1);
        });
      }
      if (particles.visible) {
        particleData.forEach((d) => {
          d.life += dt;
          d.vel.y -= dt * 5;
          d.mesh.position.addScaledVector(d.vel, dt);
          d.mesh.rotation.y += d.spin * dt;
          const fade = Math.max(0, 1 - d.life / 0.9);
          (d.mesh.material as THREE.MeshBasicMaterial).opacity = fade;
          d.mesh.scale.setScalar(0.5 + fade * 0.6);
        });
      }

      rig.visible = p !== 'reveal';

      let gi = 0.55;
      if (p === 'idle')  gi = 0.55 + Math.sin(t * 2.4) * 0.25;
      if (p === 'shake') gi = 0.6 + Math.min(1, pt / 1.4) * 2.2;
      if (p === 'crack') gi = 3.2;
      if (p === 'burst') gi = 5.0 * Math.max(0, 1 - pt / 0.8);
      glow.intensity = gi;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      pGeo.dispose();
      bodyGeo.dispose();
      lidGeo.dispose();
      bodyMats.forEach((m) => m.dispose());
      lidMats.forEach((m) => m.dispose());
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, autoRotate, seed]);

  return <div ref={mount} style={{ width: '100%', height: '100%' }}/>;
};

/* -------------------- cartoon outline + accents -------------------- */

type Style = typeof CRATE_TIERS[CrateTier];

/** Classic cartoon outline: render a slightly-larger back-face ink copy
 *  behind the mesh. Reads as a thick, uniform painted stroke. */
function addInkShell(parent: THREE.Object3D, geo: THREE.BufferGeometry) {
  const shell = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }),
  );
  shell.scale.setScalar(1.035);
  parent.add(shell);
}

/** Sharp corner lines on top of the outline shell for extra crispness. */
function addInkEdges(parent: THREE.Object3D, geo: THREE.BufferGeometry) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: INK }),
  );
  parent.add(edges);
}

function addPaperTwine(body: THREE.Group, style: Style) {
  const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(style.accent) });
  const vert = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.1, 2.12), mat);
  body.add(vert);
  addInkShell(vert, vert.geometry);
  addInkEdges(vert, vert.geometry);
  const horiz = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.2, 2.12), mat);
  body.add(horiz);
  addInkShell(horiz, horiz.geometry);
  addInkEdges(horiz, horiz.geometry);
}

function addTapeBand(body: THREE.Group, _style: Style) {
  const mat = new THREE.MeshLambertMaterial({ color: CREAM });
  const tape = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.1, 2.12), mat);
  body.add(tape);
  addInkShell(tape, tape.geometry);
  addInkEdges(tape, tape.geometry);
}

function addWoodenBands(body: THREE.Group, _style: Style) {
  const mat = new THREE.MeshLambertMaterial({ color: INK });
  const mkBand = (y: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.18, 2.12), mat);
    b.position.y = y;
    body.add(b);
    addInkEdges(b, b.geometry);
  };
  mkBand(0.65);
  mkBand(-0.65);
  // cream bolt dots on each band
  const boltMat = new THREE.MeshLambertMaterial({ color: CREAM });
  const boltGeo = new THREE.SphereGeometry(0.1, 12, 10);
  for (const x of [-1.1, -0.4, 0.4, 1.1]) {
    for (const y of [0.65, -0.65]) {
      for (const z of [1.07, -1.07]) {
        const bolt = new THREE.Mesh(boltGeo, boltMat);
        bolt.position.set(x, y, z);
        body.add(bolt);
        addInkShell(bolt, boltGeo);
      }
    }
  }
}

function addMetalRivets(body: THREE.Group, _style: Style) {
  const mat = new THREE.MeshLambertMaterial({ color: CREAM });
  const geo = new THREE.SphereGeometry(0.15, 14, 12);
  const positions: [number, number, number][] = [
    [-1.0, 0.7, 1.02], [0, 0.7, 1.02], [1.0, 0.7, 1.02],
    [-1.0, -0.7, 1.02], [0, -0.7, 1.02], [1.0, -0.7, 1.02],
    [-1.0, 0.7, -1.02], [0, 0.7, -1.02], [1.0, 0.7, -1.02],
    [-1.0, -0.7, -1.02], [0, -0.7, -1.02], [1.0, -0.7, -1.02],
  ];
  for (const [x, y, z] of positions) {
    const r = new THREE.Mesh(geo, mat);
    r.position.set(x, y, z);
    body.add(r);
    addInkShell(r, geo);
  }
}

function addCrystalPanels(body: THREE.Group, style: Style) {
  const tones = [style.glow, style.glow2 || style.accent, style.accent, '#b9d9ff'];
  const sides: [number, number, number, THREE.BoxGeometry][] = [
    [0, 0, 1.03, new THREE.BoxGeometry(1.6, 1.2, 0.08)],
    [0, 0, -1.03, new THREE.BoxGeometry(1.6, 1.2, 0.08)],
  ];
  const sideGeo2 = new THREE.BoxGeometry(0.08, 1.2, 1.6);
  sides.push([-1.31, 0, 0, sideGeo2]);
  sides.push([1.31, 0, 0, sideGeo2]);
  sides.forEach(([x, y, z, geo], i) => {
    const mat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(tones[i % tones.length]),
      emissive: new THREE.Color(tones[i % tones.length]),
      emissiveIntensity: 0.4,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    body.add(m);
    addInkShell(m, geo);
    addInkEdges(m, geo);
  });
}

function addPaperBow(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(style.accent) });
  const band = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.18, 0.38), mat);
  band.position.y = 0.22;
  lid.add(band);
  addInkShell(band, band.geometry);
  addInkEdges(band, band.geometry);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 10, 18), mat);
  bow.position.set(0, 0.28, 0);
  bow.rotation.x = Math.PI / 2;
  lid.add(bow);
}

function addCrystalGem(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(style.glow2 || style.glow),
    emissive: new THREE.Color(style.glow2 || style.glow),
    emissiveIntensity: 0.55,
  });
  const geo = new THREE.OctahedronGeometry(0.34, 0);
  const gem = new THREE.Mesh(geo, mat);
  gem.position.y = 0.42;
  lid.add(gem);
  addInkShell(gem, geo);
  addInkEdges(gem, geo);
  // butter cap under the gem
  const capMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(style.accent) });
  const capGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.12, 8);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.2;
  lid.add(cap);
  addInkShell(cap, capGeo);
  addInkEdges(cap, capGeo);
}

function addMetalGem(lid: THREE.Group, style: Style) {
  const mat = new THREE.MeshLambertMaterial({
    color: new THREE.Color(style.glow),
    emissive: new THREE.Color(style.glow),
    emissiveIntensity: 0.4,
  });
  const geo = new THREE.OctahedronGeometry(0.16, 0);
  const gem = new THREE.Mesh(geo, mat);
  gem.position.y = 0.34;
  lid.add(gem);
  addInkShell(gem, geo);
  addInkEdges(gem, geo);
}
