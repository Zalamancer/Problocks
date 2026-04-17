import { makeBox, makeGlass, type BuildOpts, type PieceDef } from './types';

/**
 * Wall pieces. All walls author-centered in X/Z, bottom at Y=0.
 *   width = TILE, height = WALL_HEIGHT, thickness = WALL_THICK.
 *
 * Compositing strategy (to avoid CSG):
 *   - Solid wall variants: a single tinted box.
 *   - Window walls: top strip + bottom strip (sill) + two jambs around
 *     a rectangular hole; the hole contains a thin translucent glass
 *     pane and a frame crossbar for visual interest.
 *   - Door walls: top strip + two jambs, NO bottom. Glass transom
 *     optional. A thin door slab hangs inside the opening.
 */

/* ────────────────────────── 10 STRAIGHT WALLS ────────────────────────── */

function solidWall(color: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: wallHeight, z: wallThick }, color, { y: wallHeight / 2 }));
    return g;
  };
}

function plasterWallWithTrim(baseColor: string, trimColor: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: wallHeight, z: wallThick }, baseColor, { y: wallHeight / 2 }));
    // baseboard
    g.add(makeBox(THREE, { x: tile, y: 0.2, z: wallThick * 1.35 }, trimColor, { y: 0.1 }));
    // cornice
    g.add(makeBox(THREE, { x: tile, y: 0.15, z: wallThick * 1.35 }, trimColor, { y: wallHeight - 0.08 }));
    return g;
  };
}

function timberFrameWall(plaster: string, beam: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: wallHeight, z: wallThick }, plaster, { y: wallHeight / 2 }));
    const t = wallThick * 1.3;
    // horizontals
    g.add(makeBox(THREE, { x: tile, y: 0.18, z: t }, beam, { y: 0.09 }));
    g.add(makeBox(THREE, { x: tile, y: 0.18, z: t }, beam, { y: wallHeight - 0.09 }));
    g.add(makeBox(THREE, { x: tile, y: 0.14, z: t }, beam, { y: wallHeight * 0.55 }));
    // verticals
    g.add(makeBox(THREE, { x: 0.16, y: wallHeight, z: t }, beam, { x: -tile / 2 + 0.08 }).translateY(wallHeight / 2));
    g.add(makeBox(THREE, { x: 0.16, y: wallHeight, z: t }, beam, { x:  tile / 2 - 0.08 }).translateY(wallHeight / 2));
    // center diagonal (approximate with short segments)
    return g;
  };
}

function stoneWall(a: string, b: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: wallHeight, z: wallThick }, a, { y: wallHeight / 2 }));
    // stagger a handful of lighter stones for a rubble look
    const stones: [number, number, number, number, number][] = [
      [-0.6, 0.35, 0.55, 0.35, 0.03],
      [ 0.2, 0.55, 0.7,  0.55, 0.03],
      [-0.3, 1.1,  0.9,  0.5,  0.03],
      [ 0.55, 1.65,0.65, 0.4,  0.03],
      [-0.5, 2.2, 0.8,  0.45, 0.03],
      [ 0.3, 2.55,0.6,  0.3,  0.03],
    ];
    for (const [cx, cy, sx, sy, dz] of stones) {
      g.add(makeBox(THREE, { x: sx, y: sy, z: wallThick + dz }, b, { x: cx, y: cy }));
    }
    return g;
  };
}

export const STRAIGHT_WALLS: PieceDef[] = [
  { id: 'wall.plaster_white',  kind: 'wall', label: 'Plaster White', swatch: '#f5efe0', build: plasterWallWithTrim('#f5efe0', '#d7cdb2') },
  { id: 'wall.plaster_cream',  kind: 'wall', label: 'Plaster Cream', swatch: '#ffe9c2', build: plasterWallWithTrim('#ffe9c2', '#b88a4a') },
  { id: 'wall.brick_red',      kind: 'wall', label: 'Red Brick',     swatch: '#b33c2b', build: stoneWall('#b33c2b', '#d45a45') },
  { id: 'wall.brick_tan',      kind: 'wall', label: 'Tan Brick',     swatch: '#c68450', build: stoneWall('#c68450', '#e0a070') },
  { id: 'wall.stone_gray',     kind: 'wall', label: 'Gray Stone',    swatch: '#9aa0a4', build: stoneWall('#9aa0a4', '#c1c6cb') },
  { id: 'wall.wood_dark',      kind: 'wall', label: 'Dark Wood',     swatch: '#5b3a1e', build: solidWall('#5b3a1e') },
  { id: 'wall.wood_light',     kind: 'wall', label: 'Light Wood',    swatch: '#c98b55', build: solidWall('#c98b55') },
  { id: 'wall.concrete',       kind: 'wall', label: 'Concrete',      swatch: '#b5b2a7', build: solidWall('#b5b2a7') },
  { id: 'wall.timber_frame',   kind: 'wall', label: 'Timber Frame',  swatch: '#f3e4c2', build: timberFrameWall('#f3e4c2', '#3a2514') },
  { id: 'wall.stucco_yellow',  kind: 'wall', label: 'Stucco Yellow', swatch: '#f4c75b', build: plasterWallWithTrim('#f4c75b', '#a67326') },
];

/* ────────────────────────── 10 WINDOW WALLS ────────────────────────── */

interface WindowSpec {
  openings: { cx: number; cy: number; w: number; h: number; arch?: boolean; circle?: boolean; mullions?: 'cross' | 'h' | 'v' | 'none' }[];
  baseColor: string;
  frameColor: string;
  sillColor: string;
}

function buildWindowWall(spec: WindowSpec): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    const t = wallThick;
    const frameT = t * 1.15;

    // Build the wall as strips around each opening.
    // For simplicity: per opening, emit jambs + top/bottom strips clipped
    // to a TILE × WALL_HEIGHT boundary. Multiple openings → stacked strips
    // that slightly overlap — harmless, all same color.
    for (const op of spec.openings) {
      const leftEdge  = op.cx - op.w / 2;
      const rightEdge = op.cx + op.w / 2;
      const topEdge   = op.cy + op.h / 2;
      const botEdge   = op.cy - op.h / 2;

      // top strip (above opening)
      const topH = wallHeight - topEdge;
      if (topH > 0.01) {
        g.add(makeBox(THREE, { x: op.w, y: topH, z: t }, spec.baseColor, {
          x: op.cx, y: topEdge + topH / 2,
        }));
      }
      // bottom strip (below opening — sill zone)
      if (botEdge > 0.01) {
        g.add(makeBox(THREE, { x: op.w, y: botEdge, z: t }, spec.baseColor, {
          x: op.cx, y: botEdge / 2,
        }));
      }
      // left jamb (from wall edge to opening left)
      const leftW = leftEdge - (-tile / 2);
      if (leftW > 0.01) {
        g.add(makeBox(THREE, { x: leftW, y: op.h, z: t }, spec.baseColor, {
          x: -tile / 2 + leftW / 2, y: op.cy,
        }));
      }
      // right jamb
      const rightW = tile / 2 - rightEdge;
      if (rightW > 0.01) {
        g.add(makeBox(THREE, { x: rightW, y: op.h, z: t }, spec.baseColor, {
          x: tile / 2 - rightW / 2, y: op.cy,
        }));
      }
      // sill ledge
      g.add(makeBox(THREE, { x: op.w + 0.15, y: 0.1, z: frameT * 1.2 }, spec.sillColor, {
        x: op.cx, y: botEdge - 0.05,
      }));
      // lintel (decorative top frame)
      g.add(makeBox(THREE, { x: op.w + 0.15, y: 0.08, z: frameT * 1.2 }, spec.sillColor, {
        x: op.cx, y: topEdge + 0.04,
      }));
      // arch cap
      if (op.arch) {
        const steps = 6;
        for (let i = 0; i < steps; i++) {
          const r = i / (steps - 1);
          const y = topEdge + 0.04 + r * op.w * 0.35;
          const w = op.w * (1 - r * 0.9);
          g.add(makeBox(THREE, { x: w, y: 0.12, z: frameT * 1.1 }, spec.frameColor, {
            x: op.cx, y,
          }));
        }
      }
      // circle-window filled frame (approximation via stepped rings)
      if (op.circle) {
        const r0 = Math.min(op.w, op.h) / 2;
        const ringCount = 10;
        for (let i = 0; i < ringCount; i++) {
          const a = (i / ringCount) * Math.PI * 2;
          const x = op.cx + Math.cos(a) * r0;
          const y = op.cy + Math.sin(a) * r0;
          g.add(makeBox(THREE, { x: 0.12, y: 0.12, z: frameT * 1.1 }, spec.frameColor, { x, y }));
        }
      }

      // glass pane
      g.add(makeGlass(THREE, { x: op.w - 0.1, y: op.h - 0.1, z: 0.05 }, { x: op.cx, y: op.cy, z: 0 }));

      // mullions
      const m = op.mullions ?? 'none';
      if (m === 'cross' || m === 'h') {
        g.add(makeBox(THREE, { x: op.w - 0.1, y: 0.06, z: 0.08 }, spec.frameColor, { x: op.cx, y: op.cy }));
      }
      if (m === 'cross' || m === 'v') {
        g.add(makeBox(THREE, { x: 0.06, y: op.h - 0.1, z: 0.08 }, spec.frameColor, { x: op.cx, y: op.cy }));
      }
    }
    return g;
  };
}

export const WINDOW_WALLS: PieceDef[] = [
  {
    id: 'wallwin.square_plaster', kind: 'wall-window', label: 'Square · Plaster', swatch: '#f5efe0',
    build: buildWindowWall({ baseColor: '#f5efe0', frameColor: '#6b4a22', sillColor: '#c9b181',
      openings: [{ cx: 0, cy: 1.6, w: 1.0, h: 1.0, mullions: 'cross' }] }),
  },
  {
    id: 'wallwin.tall_plaster', kind: 'wall-window', label: 'Tall · Plaster', swatch: '#f5efe0',
    build: buildWindowWall({ baseColor: '#f5efe0', frameColor: '#6b4a22', sillColor: '#c9b181',
      openings: [{ cx: 0, cy: 1.7, w: 0.55, h: 1.5, mullions: 'h' }] }),
  },
  {
    id: 'wallwin.wide_brick', kind: 'wall-window', label: 'Wide · Brick', swatch: '#b33c2b',
    build: buildWindowWall({ baseColor: '#b33c2b', frameColor: '#3b2316', sillColor: '#d4a47a',
      openings: [{ cx: 0, cy: 1.6, w: 1.5, h: 0.8, mullions: 'v' }] }),
  },
  {
    id: 'wallwin.arched_plaster', kind: 'wall-window', label: 'Arched', swatch: '#f5efe0',
    build: buildWindowWall({ baseColor: '#f5efe0', frameColor: '#6b4a22', sillColor: '#c9b181',
      openings: [{ cx: 0, cy: 1.5, w: 1.0, h: 1.3, arch: true, mullions: 'v' }] }),
  },
  {
    id: 'wallwin.round_wood', kind: 'wall-window', label: 'Porthole', swatch: '#5b3a1e',
    build: buildWindowWall({ baseColor: '#5b3a1e', frameColor: '#c9a45a', sillColor: '#c9a45a',
      openings: [{ cx: 0, cy: 1.8, w: 0.8, h: 0.8, circle: true }] }),
  },
  {
    id: 'wallwin.double_brick', kind: 'wall-window', label: 'Two Panes', swatch: '#b33c2b',
    build: buildWindowWall({ baseColor: '#b33c2b', frameColor: '#3b2316', sillColor: '#d4a47a',
      openings: [
        { cx: -0.5, cy: 1.6, w: 0.7, h: 0.9, mullions: 'cross' },
        { cx:  0.5, cy: 1.6, w: 0.7, h: 0.9, mullions: 'cross' },
      ] }),
  },
  {
    id: 'wallwin.cross_plaster', kind: 'wall-window', label: 'Cross-Pane', swatch: '#f5efe0',
    build: buildWindowWall({ baseColor: '#f5efe0', frameColor: '#6b4a22', sillColor: '#c9b181',
      openings: [{ cx: 0, cy: 1.6, w: 1.2, h: 1.2, mullions: 'cross' }] }),
  },
  {
    id: 'wallwin.clerestory', kind: 'wall-window', label: 'Clerestory', swatch: '#f5efe0',
    build: buildWindowWall({ baseColor: '#f5efe0', frameColor: '#6b4a22', sillColor: '#c9b181',
      openings: [{ cx: 0, cy: 2.4, w: 1.4, h: 0.4, mullions: 'v' }] }),
  },
  {
    id: 'wallwin.triple_stone', kind: 'wall-window', label: 'Triple · Stone', swatch: '#9aa0a4',
    build: buildWindowWall({ baseColor: '#9aa0a4', frameColor: '#2b2b2b', sillColor: '#d1d4d8',
      openings: [
        { cx: -0.6, cy: 1.6, w: 0.45, h: 1.2 },
        { cx:  0.0, cy: 1.6, w: 0.45, h: 1.2 },
        { cx:  0.6, cy: 1.6, w: 0.45, h: 1.2 },
      ] }),
  },
  {
    id: 'wallwin.diamond_brick', kind: 'wall-window', label: 'Diamond', swatch: '#b33c2b',
    build: ({ THREE, tile, wallHeight, wallThick }) => {
      // Render as a small square opening and rotate the glass + a frame cross
      // for a diamond impression.
      const g = new THREE.Group();
      const baseColor = '#b33c2b';
      const frameColor = '#3b2316';
      const op = { cx: 0, cy: 1.7, w: 0.9, h: 0.9 };
      // build via the same window-wall emitter for the surrounding wall
      const sub = buildWindowWall({ baseColor, frameColor, sillColor: '#d4a47a',
        openings: [op] })({ THREE, tile, wallHeight, wallThick, floorThick: 0.1 });
      // remove default square glass & mullions — we'll overlay a rotated cross
      g.add(sub);
      const glass = makeGlass(THREE, { x: op.w * 0.8, y: op.h * 0.8, z: 0.06 }, { x: op.cx, y: op.cy });
      glass.rotation.z = Math.PI / 4;
      g.add(glass);
      const barH = makeBox(THREE, { x: op.w * 0.9, y: 0.06, z: 0.08 }, frameColor, { x: op.cx, y: op.cy });
      barH.rotation.z = Math.PI / 4;
      g.add(barH);
      const barV = makeBox(THREE, { x: 0.06, y: op.h * 0.9, z: 0.08 }, frameColor, { x: op.cx, y: op.cy });
      barV.rotation.z = Math.PI / 4;
      g.add(barV);
      return g;
    },
  },
];

/* ────────────────────────── 10 DOOR WALLS ────────────────────────── */

interface DoorSpec {
  baseColor: string;
  doorColor: string;
  frameColor: string;
  /** door width in meters (0.9 = single, 1.5 = double) */
  doorWidth: number;
  /** door height in meters */
  doorHeight: number;
  /** add transom glass strip above door */
  transom?: boolean;
  /** add narrow glass sidelights */
  sidelights?: boolean;
  /** round-top door */
  arched?: boolean;
  /** half-door (lower half shown, upper open) — saloon */
  saloon?: boolean;
}

function buildDoorWall(spec: DoorSpec): PieceDef['build'] {
  return ({ THREE, tile, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    const t = wallThick;
    const { baseColor, frameColor, doorColor, doorWidth: dw, doorHeight: dh } = spec;

    const leftEdge  = -dw / 2;
    const rightEdge =  dw / 2;
    const topEdge   = dh;

    // top strip
    const topH = wallHeight - topEdge;
    if (topH > 0.01) {
      g.add(makeBox(THREE, { x: dw, y: topH, z: t }, baseColor, {
        x: 0, y: topEdge + topH / 2,
      }));
    }
    // jambs
    const leftW  = leftEdge - (-tile / 2);
    const rightW = tile / 2 - rightEdge;
    if (leftW > 0.01) {
      g.add(makeBox(THREE, { x: leftW, y: wallHeight, z: t }, baseColor, {
        x: -tile / 2 + leftW / 2, y: wallHeight / 2,
      }));
    }
    if (rightW > 0.01) {
      g.add(makeBox(THREE, { x: rightW, y: wallHeight, z: t }, baseColor, {
        x: tile / 2 - rightW / 2, y: wallHeight / 2,
      }));
    }

    // door frame trim
    g.add(makeBox(THREE, { x: dw + 0.2, y: 0.12, z: t * 1.25 }, frameColor, { x: 0, y: topEdge + 0.06 }));
    g.add(makeBox(THREE, { x: 0.12, y: dh, z: t * 1.25 }, frameColor, { x: leftEdge - 0.06, y: dh / 2 }));
    g.add(makeBox(THREE, { x: 0.12, y: dh, z: t * 1.25 }, frameColor, { x: rightEdge + 0.06, y: dh / 2 }));

    if (spec.arched) {
      const steps = 8;
      for (let i = 0; i < steps; i++) {
        const r = i / (steps - 1);
        const y = topEdge + 0.06 + r * dw * 0.3;
        const w = dw * (1 - r * 0.85);
        g.add(makeBox(THREE, { x: w, y: 0.12, z: t * 1.2 }, frameColor, { x: 0, y }));
      }
    }

    // door slab(s)
    if (spec.saloon) {
      // lower half only
      const slabH = dh * 0.55;
      g.add(makeBox(THREE, { x: dw * 0.48, y: slabH, z: 0.05 }, doorColor, { x: -dw * 0.25, y: slabH / 2 + 0.05, z: 0 }));
      g.add(makeBox(THREE, { x: dw * 0.48, y: slabH, z: 0.05 }, doorColor, { x:  dw * 0.25, y: slabH / 2 + 0.05, z: 0 }));
    } else if (dw > 1.3) {
      // double door
      g.add(makeBox(THREE, { x: dw * 0.48, y: dh - 0.05, z: 0.05 }, doorColor, { x: -dw * 0.25, y: (dh - 0.05) / 2, z: 0 }));
      g.add(makeBox(THREE, { x: dw * 0.48, y: dh - 0.05, z: 0.05 }, doorColor, { x:  dw * 0.25, y: (dh - 0.05) / 2, z: 0 }));
      // handles
      g.add(makeBox(THREE, { x: 0.06, y: 0.06, z: 0.08 }, '#f2c94c', { x: -0.08, y: dh * 0.5, z: 0.04 }));
      g.add(makeBox(THREE, { x: 0.06, y: 0.06, z: 0.08 }, '#f2c94c', { x:  0.08, y: dh * 0.5, z: 0.04 }));
    } else {
      g.add(makeBox(THREE, { x: dw - 0.1, y: dh - 0.05, z: 0.05 }, doorColor, { x: 0, y: (dh - 0.05) / 2, z: 0 }));
      // handle
      g.add(makeBox(THREE, { x: 0.07, y: 0.07, z: 0.08 }, '#f2c94c', { x: dw * 0.35, y: dh * 0.5, z: 0.04 }));
    }

    // transom
    if (spec.transom && topH > 0.35) {
      const tH = Math.min(0.5, topH - 0.1);
      g.add(makeGlass(THREE, { x: dw - 0.2, y: tH, z: 0.04 }, { x: 0, y: topEdge + tH / 2 + 0.05 }));
      // mullion
      g.add(makeBox(THREE, { x: 0.06, y: tH, z: 0.06 }, frameColor, { x: 0, y: topEdge + tH / 2 + 0.05 }));
    }

    // sidelights (narrow glass strips to left/right of door)
    if (spec.sidelights) {
      const slW = 0.25;
      const leftPad = leftW - slW - 0.08;
      const rightPad = rightW - slW - 0.08;
      if (leftPad > 0) {
        g.add(makeGlass(THREE, { x: slW, y: dh - 0.2, z: 0.04 }, {
          x: leftEdge - 0.08 - slW / 2, y: (dh - 0.2) / 2 + 0.1,
        }));
      }
      if (rightPad > 0) {
        g.add(makeGlass(THREE, { x: slW, y: dh - 0.2, z: 0.04 }, {
          x: rightEdge + 0.08 + slW / 2, y: (dh - 0.2) / 2 + 0.1,
        }));
      }
    }

    // threshold
    g.add(makeBox(THREE, { x: dw + 0.1, y: 0.06, z: t * 1.3 }, frameColor, { x: 0, y: 0.03 }));
    return g;
  };
}

export const DOOR_WALLS: PieceDef[] = [
  { id: 'walldoor.simple_plaster', kind: 'wall-door', label: 'Simple',        swatch: '#f5efe0',
    build: buildDoorWall({ baseColor: '#f5efe0', doorColor: '#5a3a1a', frameColor: '#3a2413', doorWidth: 0.95, doorHeight: 2.15 }) },
  { id: 'walldoor.arched_plaster', kind: 'wall-door', label: 'Arched',        swatch: '#f5efe0',
    build: buildDoorWall({ baseColor: '#f5efe0', doorColor: '#5a3a1a', frameColor: '#3a2413', doorWidth: 1.0, doorHeight: 2.2, arched: true }) },
  { id: 'walldoor.double_wood',    kind: 'wall-door', label: 'Double',        swatch: '#c98b55',
    build: buildDoorWall({ baseColor: '#c98b55', doorColor: '#3d2415', frameColor: '#2a1609', doorWidth: 1.6, doorHeight: 2.3 }) },
  { id: 'walldoor.round_brick',    kind: 'wall-door', label: 'Round Top',     swatch: '#b33c2b',
    build: buildDoorWall({ baseColor: '#b33c2b', doorColor: '#2b1a0c', frameColor: '#3a2413', doorWidth: 1.1, doorHeight: 2.25, arched: true }) },
  { id: 'walldoor.transom_plaster',kind: 'wall-door', label: 'With Transom',  swatch: '#f5efe0',
    build: buildDoorWall({ baseColor: '#f5efe0', doorColor: '#3d2415', frameColor: '#2a1609', doorWidth: 1.0, doorHeight: 2.1, transom: true }) },
  { id: 'walldoor.sidelight_wood', kind: 'wall-door', label: 'Sidelights',    swatch: '#c98b55',
    build: buildDoorWall({ baseColor: '#c98b55', doorColor: '#3d2415', frameColor: '#2a1609', doorWidth: 1.0, doorHeight: 2.2, sidelights: true, transom: true }) },
  { id: 'walldoor.barn_wood',      kind: 'wall-door', label: 'Barn',          swatch: '#5b3a1e',
    build: buildDoorWall({ baseColor: '#5b3a1e', doorColor: '#8c5f2e', frameColor: '#2a1609', doorWidth: 1.8, doorHeight: 2.6 }) },
  { id: 'walldoor.garage_concrete',kind: 'wall-door', label: 'Garage',        swatch: '#b5b2a7',
    build: buildDoorWall({ baseColor: '#b5b2a7', doorColor: '#7a7a74', frameColor: '#3a3a36', doorWidth: 1.9, doorHeight: 2.75 }) },
  { id: 'walldoor.saloon_wood',    kind: 'wall-door', label: 'Saloon',        swatch: '#c98b55',
    build: buildDoorWall({ baseColor: '#c98b55', doorColor: '#3d2415', frameColor: '#2a1609', doorWidth: 1.1, doorHeight: 2.1, saloon: true }) },
  { id: 'walldoor.fancy_stone',    kind: 'wall-door', label: 'Fancy · Stone', swatch: '#9aa0a4',
    build: buildDoorWall({ baseColor: '#9aa0a4', doorColor: '#2b1a0c', frameColor: '#d7c69a', doorWidth: 1.1, doorHeight: 2.3, transom: true, sidelights: true, arched: true }) },
];

export const WALL_PIECES: PieceDef[] = [...STRAIGHT_WALLS, ...WINDOW_WALLS, ...DOOR_WALLS];
