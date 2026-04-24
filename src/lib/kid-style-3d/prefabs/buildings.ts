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

export function bench({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const wood = color ?? PALETTE.woodLight;

  const seat = new THREE.Mesh(
    kidBox({ width: 1.8, height: 0.14, depth: 0.55, radius: 0.06 }),
    toonMaterial({ color: wood }),
  );
  seat.position.y = 0.5;
  seat.castShadow = true; seat.receiveShadow = true;
  g.add(seat);

  const backRest = new THREE.Mesh(
    kidBox({ width: 1.8, height: 0.8, depth: 0.1, radius: 0.04 }),
    toonMaterial({ color: wood }),
  );
  backRest.position.set(0, 0.9, -0.22);
  backRest.castShadow = true;
  g.add(backRest);

  for (const x of [-0.7, 0.7]) {
    const leg = new THREE.Mesh(
      kidBox({ width: 0.1, height: 0.5, depth: 0.45, radius: 0.03 }),
      toonMaterial({ color: PALETTE.woodDark }),
    );
    leg.position.set(x, 0.25, 0);
    leg.castShadow = true;
    g.add(leg);
  }

  addOutlinesToTree(g);
  return g;
}

/**
 * Lamppost — chunky Pokopia-blue post with a boxy lantern cap and an
 * amber bulb. Shadow-casting so it throws a cute stretched silhouette
 * across painted dirt paths.
 */
export function lamppost({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const stoneColor = color ?? PALETTE.blueStone;
  const trim = PALETTE.blueStoneLight;

  const baseWide = new THREE.Mesh(
    kidBox({ width: 0.55, height: 0.22, depth: 0.55, radius: 0.05 }),
    toonMaterial({ color: PALETTE.blueStoneDark }),
  );
  baseWide.position.y = 0.11;
  baseWide.castShadow = true; baseWide.receiveShadow = true;
  g.add(baseWide);

  const baseStep = new THREE.Mesh(
    kidBox({ width: 0.4, height: 0.2, depth: 0.4, radius: 0.04 }),
    toonMaterial({ color: stoneColor }),
  );
  baseStep.position.y = 0.32;
  baseStep.castShadow = true;
  g.add(baseStep);

  const post = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.08, radiusBottom: 0.1, height: 2.2, radialSegments: 8 }),
    toonMaterial({ color: stoneColor }),
  );
  post.position.y = 0.42 + 1.1;
  post.castShadow = true;
  g.add(post);

  // Lantern cage — small box, amber bulb peeks through as a separate mesh
  // so the toon gradient gives the bulb a visible 2-step highlight.
  const lantern = new THREE.Mesh(
    kidBox({ width: 0.35, height: 0.45, depth: 0.35, radius: 0.05 }),
    toonMaterial({ color: trim }),
  );
  lantern.position.y = 2.7;
  lantern.castShadow = true;
  g.add(lantern);

  const bulb = new THREE.Mesh(
    kidSphere({ radius: 0.14, detail: 0 }),
    toonMaterial({ color: PALETTE.lampGlow }),
  );
  bulb.position.y = 2.7;
  g.add(bulb);

  // Pyramid cap — adds the Pokopia "pagoda" silhouette without needing a
  // new geometry primitive.
  const cap = new THREE.Mesh(
    kidCone({ radius: 0.28, height: 0.25, radialSegments: 4 }),
    toonMaterial({ color: PALETTE.blueStoneDark }),
  );
  cap.position.y = 3.05;
  cap.rotation.y = Math.PI / 4;
  cap.castShadow = true;
  g.add(cap);

  addOutlinesToTree(g);
  return g;
}

/**
 * Stone column — a chunky stepped pillar in Pokopia-blue. Intended for
 * decorative accents (gate markers, plaza edges, flanking props). Base /
 * shaft / capital / knob stack gives a classical silhouette without any
 * fancy geometry.
 */
export function stoneColumn({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.blueStone;

  const baseWide = new THREE.Mesh(
    kidBox({ width: 0.7, height: 0.22, depth: 0.7, radius: 0.05 }),
    toonMaterial({ color: PALETTE.blueStoneDark }),
  );
  baseWide.position.y = 0.11;
  baseWide.castShadow = true; baseWide.receiveShadow = true;
  g.add(baseWide);

  const baseInner = new THREE.Mesh(
    kidBox({ width: 0.55, height: 0.12, depth: 0.55, radius: 0.04 }),
    toonMaterial({ color: c }),
  );
  baseInner.position.y = 0.28;
  baseInner.castShadow = true;
  g.add(baseInner);

  const shaft = new THREE.Mesh(
    kidBox({ width: 0.42, height: 2.0, depth: 0.42, radius: 0.08 }),
    toonMaterial({ color: c }),
  );
  shaft.position.y = 1.34;
  shaft.castShadow = true; shaft.receiveShadow = true;
  g.add(shaft);

  const capital = new THREE.Mesh(
    kidBox({ width: 0.58, height: 0.22, depth: 0.58, radius: 0.05 }),
    toonMaterial({ color: PALETTE.blueStoneLight }),
  );
  capital.position.y = 2.45;
  capital.castShadow = true;
  g.add(capital);

  const topWide = new THREE.Mesh(
    kidBox({ width: 0.72, height: 0.18, depth: 0.72, radius: 0.05 }),
    toonMaterial({ color: PALETTE.blueStoneDark }),
  );
  topWide.position.y = 2.65;
  topWide.castShadow = true;
  g.add(topWide);

  const knob = new THREE.Mesh(
    kidSphere({ radius: 0.2, detail: 0 }),
    toonMaterial({ color: PALETTE.blueStoneLight }),
  );
  knob.position.y = 2.9;
  knob.castShadow = true;
  g.add(knob);

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
