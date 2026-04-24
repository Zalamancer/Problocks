import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidBox, kidSimpleBox, kidTriPrism, kidSphere, kidCylinder, kidCone, kidInstanced, type InstanceTransform } from '../geometry';
import { addOutline, addOutlinesToTree } from '../outlines';
import type { BuildOptions } from './types';

function buildWindow(): THREE.Object3D {
  const g = new THREE.Group();
  const w = 0.7, h = 0.6;
  const frame = new THREE.Mesh(
    kidSimpleBox({ width: w + 0.1, height: h + 0.1, depth: 0.08 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  g.add(frame);
  const glass = new THREE.Mesh(
    kidSimpleBox({ width: w, height: h, depth: 0.05 }),
    toonMaterial({ color: PALETTE.windowGlass }),
  );
  glass.position.z = 0.04;
  g.add(glass);
  const hBar = new THREE.Mesh(
    kidSimpleBox({ width: w + 0.04, height: 0.04, depth: 0.04 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  hBar.position.z = 0.07;
  g.add(hBar);
  const vBar = new THREE.Mesh(
    kidSimpleBox({ width: 0.04, height: h + 0.04, depth: 0.04 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  vBar.position.z = 0.07;
  g.add(vBar);
  return g;
}

export function house({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const W = 2.8, H = 1.9, D = 2.8;
  const ROOF_H = 1.3;

  const wallColor       = color ?? PALETTE.ivory;
  const roofColor       = (props?.roofColor as string)       ?? PALETTE.roof;
  const doorColor       = (props?.doorColor as string)       ?? PALETTE.woodDark;
  const foundationColor = (props?.foundationColor as string) ?? PALETTE.foundation;
  const trimColor       = (props?.trimColor as string)       ?? PALETTE.wallTrim;

  // Foundation / trim / ridge / chimney / chimneyTop / door are all
  // either thin slabs or small blocks where the bevel is invisible at
  // studio orbit distance. Switched to cached BoxGeometry (24v).
  const foundation = new THREE.Mesh(
    kidSimpleBox({ width: W + 0.15, height: 0.3, depth: D + 0.15 }),
    toonMaterial({ color: foundationColor }),
  );
  foundation.position.y = 0.15;
  foundation.castShadow = true; foundation.receiveShadow = true;
  g.add(foundation);

  // Walls stay rounded — this is the chunky silhouette the whole style
  // hinges on and it's the largest single mesh on the house.
  const walls = new THREE.Mesh(
    kidBox({ width: W, height: H, depth: D, radius: 0.12 }),
    toonMaterial({ color: wallColor }),
  );
  walls.position.y = 0.3 + H / 2;
  walls.castShadow = true; walls.receiveShadow = true;
  g.add(walls);

  const trim = new THREE.Mesh(
    kidSimpleBox({ width: W + 0.08, height: 0.12, depth: D + 0.08 }),
    toonMaterial({ color: trimColor }),
  );
  trim.position.y = 0.3 + H - 0.08;
  trim.castShadow = true;
  g.add(trim);

  // Pitched roof — swapped ExtrudeGeometry(bevelSegments:3, curveSegments:4)
  // for a raw cached triangular prism. 18 position verts per roof, shared
  // across every house in the plot. The old version was building a fresh
  // geometry per house with hundreds of verts on the bevels — invisible
  // under toon shading + outlines.
  const roof = new THREE.Mesh(
    kidTriPrism(W + 0.3, ROOF_H, D + 0.25),
    toonMaterial({ color: roofColor }),
  );
  roof.position.y = 0.3 + H;
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);

  const ridge = new THREE.Mesh(
    kidSimpleBox({ width: 0.12, height: 0.08, depth: D + 0.25 }),
    toonMaterial({ color: PALETTE.roofRidge }),
  );
  ridge.position.y = 0.3 + H + ROOF_H + 0.02;
  g.add(ridge);

  const chimney = new THREE.Mesh(
    kidSimpleBox({ width: 0.38, height: 1.0, depth: 0.38 }),
    toonMaterial({ color: PALETTE.chimney }),
  );
  chimney.position.set(-0.85, 0.3 + H + 0.55, -0.3);
  chimney.castShadow = true;
  g.add(chimney);
  const chimneyTop = new THREE.Mesh(
    kidSimpleBox({ width: 0.46, height: 0.1, depth: 0.46 }),
    toonMaterial({ color: PALETTE.chimneyTop }),
  );
  chimneyTop.position.set(-0.85, 0.3 + H + 1.08, -0.3);
  g.add(chimneyTop);

  const doorFrame = new THREE.Mesh(
    kidSimpleBox({ width: 0.65, height: 1.2, depth: 0.08 }),
    toonMaterial({ color: PALETTE.woodShadow }),
  );
  doorFrame.position.set(0, 0.3 + 0.6, D / 2 + 0.02);
  g.add(doorFrame);
  const door = new THREE.Mesh(
    kidSimpleBox({ width: 0.55, height: 1.1, depth: 0.08 }),
    toonMaterial({ color: doorColor }),
  );
  door.position.set(0, 0.3 + 0.55, D / 2 + 0.06);
  door.castShadow = true;
  g.add(door);
  const knob = new THREE.Mesh(
    kidSphere({ radius: 0.045, detail: 0 }),
    toonMaterial({ color: PALETTE.butter }),
  );
  knob.position.set(0.18, 0.3 + 0.55, D / 2 + 0.12);
  g.add(knob);

  const windows: Array<[number, number, number, number]> = [
    [-1.0, 0.3 + 1.2, D / 2 + 0.04, 0],
    [ 1.0, 0.3 + 1.2, D / 2 + 0.04, 0],
    [-W / 2 - 0.04, 0.3 + 1.2, 0, Math.PI / 2],
    [ W / 2 + 0.04, 0.3 + 1.2, 0, -Math.PI / 2],
  ];
  for (const [x, y, z, rotY] of windows) {
    const wnd = buildWindow();
    wnd.position.set(x, y, z);
    wnd.rotation.y = rotY;
    g.add(wnd);
  }

  addOutlinesToTree(g);
  return g;
}

/**
 * Picket fence run — length parameterized via props.length (1–12u).
 *
 * Each picket is a flat-sided cube (kidSimpleBox, ~24 position verts)
 * with a small cube rotated 45° as the pointed cap, instead of a
 * kidCone. The cone was ~15 verts per cap; a rotated cube is 24 but
 * shares its geometry across every picket in the scene via the cache,
 * so in practice a 27-picket fence costs ONE 24-vert cube + ONE cap
 * cube + two rail cubes, not 100+ unique geometries. Outlines soften
 * the edge so the pickets still read as chunky kid-style pickets.
 */
export function fence({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.fence;
  const length = Math.max(0.6, Math.min(12, (props?.length as number) ?? 3));
  const picketCount = Math.max(1, Math.round(length / 0.45));
  const spacing = length / picketCount;

  // Pickets + caps are each single InstancedMesh for the whole run:
  // one draw call for N pickets, one for N caps (+ one per matching
  // outline). A 12u fence goes from ~58 draw calls (+58 outlines) to 4
  // draw calls (2 bodies + 2 outlines) for the picketry.
  const picketXs: InstanceTransform[] = [];
  const capXs: InstanceTransform[] = [];
  for (let i = 0; i <= picketCount; i++) {
    const x = -length / 2 + i * spacing;
    picketXs.push({ position: [x, 0.4, 0] });
    capXs.push({ position: [x, 0.8, 0], rotation: [0, 0, Math.PI / 4] });
  }

  const pickets = kidInstanced(
    kidSimpleBox({ width: 0.1, height: 0.7, depth: 0.08 }),
    toonMaterial({ color: c }),
    picketXs,
  );
  pickets.castShadow = true;
  g.add(pickets);

  const caps = kidInstanced(
    kidSimpleBox({ width: 0.12, height: 0.12, depth: 0.1 }),
    toonMaterial({ color: c }),
    capXs,
  );
  caps.castShadow = true;
  g.add(caps);

  for (const y of [0.22, 0.6]) {
    const rail = new THREE.Mesh(
      kidSimpleBox({ width: length, height: 0.07, depth: 0.06 }),
      toonMaterial({ color: c }),
    );
    rail.position.set(0, y, 0);
    rail.castShadow = true;
    g.add(rail);
  }

  addOutlinesToTree(g);
  return g;
}

/**
 * Gate post — a taller decorative picket with a pink ball finial.
 * Pair two at a gate opening and run fence segments either side.
 */
export function gatePost({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.fence;

  const post = new THREE.Mesh(
    kidSimpleBox({ width: 0.22, height: 1.6, depth: 0.22 }),
    toonMaterial({ color: c }),
  );
  post.position.y = 0.8;
  post.castShadow = true; post.receiveShadow = true;
  g.add(post);

  const finial = new THREE.Mesh(
    kidSphere({ radius: 0.16, detail: 1 }),
    toonMaterial({ color: PALETTE.flowerPink }),
  );
  finial.position.y = 1.75;
  finial.castShadow = true;
  g.add(finial);

  addOutlinesToTree(g);
  return g;
}

export function pathStone({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.42, radiusBottom: 0.42, height: 0.12 }),
    toonMaterial({ color: color ?? PALETTE.stone }),
  );
  m.position.y = 0.06;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

/**
 * Dirt patch — wide flat disc for brush-painting dirt paths through
 * grass. Low profile (0.04u) and no outline so neighbouring patches
 * blend into a continuous trail when scattered by the paint-brush.
 * Casts no shadow (it *is* the shadow, effectively) but receives
 * shadows from props above it.
 */
export function dirtPatch({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.75, radiusBottom: 0.75, height: 0.04, radialSegments: 12 }),
    toonMaterial({ color: color ?? PALETTE.dirt }),
  );
  m.position.y = 0.03;
  m.castShadow = false;
  m.receiveShadow = true;
  return m;
}

export function mailbox({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const boxColor = color ?? '#7ab0d8';

  const post = new THREE.Mesh(
    kidSimpleBox({ width: 0.12, height: 1.2, depth: 0.12 }),
    toonMaterial({ color: PALETTE.woodLight }),
  );
  post.position.y = 0.6;
  post.castShadow = true;
  g.add(post);

  const box = new THREE.Mesh(
    kidBox({ width: 0.5, height: 0.36, depth: 0.75, radius: 0.12 }),
    toonMaterial({ color: boxColor }),
  );
  box.position.y = 1.3;
  box.castShadow = true;
  g.add(box);

  const flag = new THREE.Mesh(
    kidSimpleBox({ width: 0.04, height: 0.22, depth: 0.15 }),
    toonMaterial({ color: PALETTE.roof }),
  );
  flag.position.set(0.27, 1.4, 0.12);
  g.add(flag);

  addOutlinesToTree(g);
  return g;
}

/**
 * Bench — rustic Pokopia-park bench: three horizontal plank slats on
 * two fat pillared block legs. No tall backrest (the target uses
 * benches purely for seating, not for silhouette), but keeps a short
 * back slat so it reads as a proper bench from orbit.
 */
export function bench({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const wood = color ?? PALETTE.woodLight;
  const legColor = PALETTE.woodDark;

  // Three seat planks — side-by-side along Z with small gaps. Each
  // plank is a kidBox so the rounded corners read as chamfered wood.
  const plankDepth = 0.16;
  const plankGap = 0.04;
  const seatW = 1.8;
  const plankY = 0.62;
  const planks = [-1, 0, 1];
  for (const i of planks) {
    const plank = new THREE.Mesh(
      kidBox({ width: seatW, height: 0.1, depth: plankDepth, radius: 0.035 }),
      toonMaterial({ color: wood }),
    );
    plank.position.set(0, plankY, i * (plankDepth + plankGap));
    plank.castShadow = true; plank.receiveShadow = true;
    g.add(plank);
  }

  // Short back slat — a single plank sitting ~0.35 above the seat on
  // the back row. Gives the silhouette a "bench, not a table" read
  // without adding the cathedral-height backrest of the old version.
  const backSlat = new THREE.Mesh(
    kidBox({ width: seatW, height: 0.14, depth: 0.08, radius: 0.035 }),
    toonMaterial({ color: wood }),
  );
  backSlat.position.set(0, plankY + 0.32, -(plankDepth + plankGap) - 0.1);
  backSlat.castShadow = true;
  g.add(backSlat);

  // Two fat pillared legs — a squat stepped block at each end. The
  // wider base + narrower top stack reads as hand-carved garden
  // furniture rather than a floating slab.
  for (const x of [-0.72, 0.72]) {
    const legBase = new THREE.Mesh(
      kidBox({ width: 0.24, height: 0.18, depth: 0.7, radius: 0.04 }),
      toonMaterial({ color: legColor }),
    );
    legBase.position.set(x, 0.09, 0);
    legBase.castShadow = true; legBase.receiveShadow = true;
    g.add(legBase);

    const legStem = new THREE.Mesh(
      kidBox({ width: 0.16, height: 0.38, depth: 0.58, radius: 0.03 }),
      toonMaterial({ color: legColor }),
    );
    legStem.position.set(x, 0.37, 0);
    legStem.castShadow = true;
    g.add(legStem);

    // Capital — small block at the top of each leg that the planks
    // visually rest on. Reads as a joinery detail at orbit distance.
    const legCap = new THREE.Mesh(
      kidBox({ width: 0.22, height: 0.08, depth: 0.64, radius: 0.03 }),
      toonMaterial({ color: wood }),
    );
    legCap.position.set(x, 0.6, 0);
    legCap.castShadow = true;
    g.add(legCap);
  }

  addOutlinesToTree(g);
  return g;
}

/**
 * Lamppost — decorative Pokopia park lamp: stepped square plinth,
 * slim hex post, mid-post knob, scroll-neck, open-cage lantern
 * (4 thin vertical bars with an amber bulb inside), pyramid roof.
 * Taller + slimmer than a simple post so it reads as "wrought iron
 * gaslight" instead of "bollard".
 */
export function lamppost({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const stoneColor = color ?? PALETTE.blueStone;
  const light = PALETTE.blueStoneLight;
  const dark = PALETTE.blueStoneDark;

  // --- plinth: two-tier stepped base --------------------------------
  const plinth0 = new THREE.Mesh(
    kidBox({ width: 0.48, height: 0.16, depth: 0.48, radius: 0.04 }),
    toonMaterial({ color: dark }),
  );
  plinth0.position.y = 0.08;
  plinth0.castShadow = true; plinth0.receiveShadow = true;
  g.add(plinth0);

  const plinth1 = new THREE.Mesh(
    kidBox({ width: 0.38, height: 0.18, depth: 0.38, radius: 0.03 }),
    toonMaterial({ color: stoneColor }),
  );
  plinth1.position.y = 0.25;
  plinth1.castShadow = true;
  g.add(plinth1);

  // --- post: slim hex cylinder, the lamp's spine --------------------
  const post = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.06, radiusBottom: 0.08, height: 2.4, radialSegments: 6 }),
    toonMaterial({ color: stoneColor }),
  );
  post.position.y = 0.34 + 1.2;
  post.castShadow = true;
  g.add(post);

  // Mid-post knob — a small sphere break in the shaft. Target lamps
  // have this scroll/bulge detail roughly 1/3 up the pole.
  const midKnob = new THREE.Mesh(
    kidSphere({ radius: 0.12, detail: 0 }),
    toonMaterial({ color: light }),
  );
  midKnob.position.y = 1.1;
  midKnob.castShadow = true;
  g.add(midKnob);

  // --- neck: a widening scroll under the lantern --------------------
  const neckRing = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.18, radiusBottom: 0.08, height: 0.16, radialSegments: 6 }),
    toonMaterial({ color: light }),
  );
  neckRing.position.y = 2.7;
  neckRing.castShadow = true;
  g.add(neckRing);

  const neckSlab = new THREE.Mesh(
    kidBox({ width: 0.3, height: 0.08, depth: 0.3, radius: 0.03 }),
    toonMaterial({ color: dark }),
  );
  neckSlab.position.y = 2.82;
  neckSlab.castShadow = true;
  g.add(neckSlab);

  // --- lantern: open cage, 4 thin bars around an amber bulb ---------
  // Bars are skinny boxes at the 4 corners; bulb sphere shows through
  // the gaps. Reads as a 4-sided gas lantern from any orbit angle.
  const lanternY = 3.07;
  const lanternH = 0.38;
  const barX = 0.14;
  for (const x of [-barX, barX]) {
    for (const z of [-barX, barX]) {
      const bar = new THREE.Mesh(
        kidSimpleBox({ width: 0.04, height: lanternH, depth: 0.04 }),
        toonMaterial({ color: dark }),
      );
      bar.position.set(x, lanternY, z);
      bar.castShadow = true;
      g.add(bar);
    }
  }
  // Top + bottom caps of the cage — thin slabs so the bars visually
  // connect into a box silhouette.
  for (const y of [lanternY - lanternH / 2, lanternY + lanternH / 2]) {
    const cap = new THREE.Mesh(
      kidBox({ width: 0.34, height: 0.05, depth: 0.34, radius: 0.02 }),
      toonMaterial({ color: dark }),
    );
    cap.position.y = y;
    cap.castShadow = true;
    g.add(cap);
  }

  // --- bulb: the bright amber core ----------------------------------
  const bulb = new THREE.Mesh(
    kidSphere({ radius: 0.13, detail: 0 }),
    toonMaterial({ color: PALETTE.lampGlow }),
  );
  bulb.position.y = lanternY;
  g.add(bulb);

  // --- roof: pyramid on top of the lantern --------------------------
  const roof = new THREE.Mesh(
    kidCone({ radius: 0.22, height: 0.2, radialSegments: 4 }),
    toonMaterial({ color: dark }),
  );
  roof.position.y = lanternY + lanternH / 2 + 0.1;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  g.add(roof);

  const roofFinial = new THREE.Mesh(
    kidSphere({ radius: 0.05, detail: 0 }),
    toonMaterial({ color: light }),
  );
  roofFinial.position.y = lanternY + lanternH / 2 + 0.24;
  g.add(roofFinial);

  addOutlinesToTree(g);
  return g;
}

/**
 * Stone column — an ornate Pokopia pillar: stepped plinth, hexagonal
 * shaft, multi-ring capital, and a bulbous knob on top. Hex shaft
 * comes from kidCylinder with 6 radial segments; reads as classical
 * navy stone at the studio orbit distance.
 */
export function stoneColumn({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.blueStone;
  const light = PALETTE.blueStoneLight;
  const dark = PALETTE.blueStoneDark;

  // --- plinth: three stepped square tiers -------------------------
  const plinth0 = new THREE.Mesh(
    kidBox({ width: 0.85, height: 0.14, depth: 0.85, radius: 0.04 }),
    toonMaterial({ color: dark }),
  );
  plinth0.position.y = 0.07;
  plinth0.castShadow = true; plinth0.receiveShadow = true;
  g.add(plinth0);

  const plinth1 = new THREE.Mesh(
    kidBox({ width: 0.72, height: 0.12, depth: 0.72, radius: 0.04 }),
    toonMaterial({ color: c }),
  );
  plinth1.position.y = 0.2;
  plinth1.castShadow = true;
  g.add(plinth1);

  const plinth2 = new THREE.Mesh(
    kidBox({ width: 0.62, height: 0.1, depth: 0.62, radius: 0.03 }),
    toonMaterial({ color: light }),
  );
  plinth2.position.y = 0.31;
  plinth2.castShadow = true;
  g.add(plinth2);

  // --- shaft: hexagonal cylinder, the visual hero of the column ---
  const shaft = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.28, radiusBottom: 0.3, height: 2.0, radialSegments: 6 }),
    toonMaterial({ color: c }),
  );
  shaft.position.y = 0.36 + 1.0;
  shaft.castShadow = true; shaft.receiveShadow = true;
  g.add(shaft);

  // --- capital: three rings + a wider slab --------------------------
  const capRing0 = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.36, radiusBottom: 0.32, height: 0.1, radialSegments: 6 }),
    toonMaterial({ color: light }),
  );
  capRing0.position.y = 2.4;
  capRing0.castShadow = true;
  g.add(capRing0);

  const capSlab = new THREE.Mesh(
    kidBox({ width: 0.62, height: 0.16, depth: 0.62, radius: 0.04 }),
    toonMaterial({ color: c }),
  );
  capSlab.position.y = 2.53;
  capSlab.castShadow = true;
  g.add(capSlab);

  const capTop = new THREE.Mesh(
    kidBox({ width: 0.74, height: 0.12, depth: 0.74, radius: 0.04 }),
    toonMaterial({ color: dark }),
  );
  capTop.position.y = 2.67;
  capTop.castShadow = true;
  g.add(capTop);

  // --- crown: bulbous knob on a small stem --------------------------
  const neck = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.13, radiusBottom: 0.17, height: 0.14, radialSegments: 6 }),
    toonMaterial({ color: c }),
  );
  neck.position.y = 2.8;
  neck.castShadow = true;
  g.add(neck);

  const knob = new THREE.Mesh(
    kidSphere({ radius: 0.22, detail: 0 }),
    toonMaterial({ color: light }),
  );
  knob.position.y = 3.0;
  knob.castShadow = true;
  g.add(knob);

  // Tiny pointed pip on top — the little nipple-cap you see on the
  // target column. Cheap to add, huge for silhouette readability.
  const pip = new THREE.Mesh(
    kidCone({ radius: 0.08, height: 0.14, radialSegments: 6 }),
    toonMaterial({ color: dark }),
  );
  pip.position.y = 3.22;
  pip.castShadow = true;
  g.add(pip);

  addOutlinesToTree(g);
  return g;
}

/**
 * Fountain — tiered circular basin with a bright water puck in the
 * middle. Outer basin + water pool + center pillar + upper bowl + tiny
 * water spout. Kept modest (~2u footprint) so a single one reads as a
 * plaza centerpiece without eating the whole plot.
 */
export function fountain({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const stone = color ?? PALETTE.blueStone;

  const basin = new THREE.Mesh(
    kidCylinder({ radiusTop: 1.5, radiusBottom: 1.5, height: 0.55, radialSegments: 24 }),
    toonMaterial({ color: stone }),
  );
  basin.position.y = 0.275;
  basin.castShadow = true; basin.receiveShadow = true;
  g.add(basin);

  // Water surface sits slightly below the basin rim so the rim reads as
  // a lip from every orbit angle.
  const water = new THREE.Mesh(
    kidCylinder({ radiusTop: 1.35, radiusBottom: 1.35, height: 0.12, radialSegments: 20 }),
    toonMaterial({ color: PALETTE.water }),
  );
  water.position.y = 0.5;
  water.receiveShadow = true;
  g.add(water);

  const centerPost = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.22, radiusBottom: 0.28, height: 0.9, radialSegments: 12 }),
    toonMaterial({ color: stone }),
  );
  centerPost.position.y = 0.95;
  centerPost.castShadow = true;
  g.add(centerPost);

  const upperBowl = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.55, radiusBottom: 0.4, height: 0.22, radialSegments: 18 }),
    toonMaterial({ color: PALETTE.blueStoneLight }),
  );
  upperBowl.position.y = 1.5;
  upperBowl.castShadow = true;
  g.add(upperBowl);

  const upperWater = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.42, radiusBottom: 0.42, height: 0.06, radialSegments: 14 }),
    toonMaterial({ color: PALETTE.water }),
  );
  upperWater.position.y = 1.64;
  g.add(upperWater);

  // Tiny water spout — a skinny stretched ellipsoid reads as a jet
  // without needing a shader or particle sim.
  const spout = new THREE.Mesh(
    kidSphere({ radius: 0.1, detail: 0 }),
    toonMaterial({ color: PALETTE.water }),
  );
  spout.position.y = 1.95;
  spout.scale.set(0.6, 2.4, 0.6);
  g.add(spout);

  addOutlinesToTree(g);
  return g;
}

/**
 * Gift box — small colorful cube with a contrasting cross-ribbon and a
 * bow on top. Scatter a few around a cottage or quest giver and the
 * scene immediately reads "Adopt-Me egg event".
 */
export function giftBox({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const wrap = color ?? PALETTE.roof;
  const ribbon = PALETTE.butter;

  const box = new THREE.Mesh(
    kidBox({ width: 0.6, height: 0.5, depth: 0.6, radius: 0.06 }),
    toonMaterial({ color: wrap }),
  );
  box.position.y = 0.25;
  box.castShadow = true; box.receiveShadow = true;
  g.add(box);

  // Ribbon — two thin slabs crossed on top of the box. Slight overshoot
  // past the box sides so they read as wrapping, not decals.
  const ribbonA = new THREE.Mesh(
    kidSimpleBox({ width: 0.63, height: 0.51, depth: 0.12 }),
    toonMaterial({ color: ribbon }),
  );
  ribbonA.position.y = 0.25;
  g.add(ribbonA);

  const ribbonB = new THREE.Mesh(
    kidSimpleBox({ width: 0.12, height: 0.51, depth: 0.63 }),
    toonMaterial({ color: ribbon }),
  );
  ribbonB.position.y = 0.25;
  g.add(ribbonB);

  // Bow — two overlapping ellipsoids give a cartoon "loops" silhouette.
  for (const x of [-0.11, 0.11]) {
    const loop = new THREE.Mesh(
      kidSphere({ radius: 0.11, detail: 0 }),
      toonMaterial({ color: ribbon }),
    );
    loop.position.set(x, 0.58, 0);
    loop.scale.set(1.1, 0.7, 0.8);
    g.add(loop);
  }

  const bowKnot = new THREE.Mesh(
    kidSphere({ radius: 0.06, detail: 0 }),
    toonMaterial({ color: ribbon }),
  );
  bowKnot.position.y = 0.58;
  g.add(bowKnot);

  addOutlinesToTree(g);
  return g;
}

export function balloon({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.balloonPink;

  const string = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.008, radiusBottom: 0.008, height: 1.5, radialSegments: 6 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  string.position.y = 0.75;
  g.add(string);

  const body = new THREE.Mesh(
    kidSphere({ radius: 0.32, detail: 1 }),
    toonMaterial({ color: c }),
  );
  body.position.y = 1.7;
  body.scale.set(1, 1.15, 1);
  body.castShadow = true;
  g.add(body);

  const knot = new THREE.Mesh(
    kidCone({ radius: 0.05, height: 0.08, radialSegments: 8 }),
    toonMaterial({ color: c }),
  );
  knot.position.y = 1.4;
  knot.rotation.x = Math.PI;
  g.add(knot);

  addOutlinesToTree(g, { thickness: 0.02 });
  return g;
}
