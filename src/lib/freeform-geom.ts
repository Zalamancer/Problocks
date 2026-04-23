import type { FreeformAnchor, FreeformCollision, FreeformImage } from '@/store/freeform-store';

/**
 * Geometry helpers for the 2D freeform editor.
 *
 * Spaces:
 *   - SCREEN: pixels inside the SVG element, origin top-left.
 *   - WORLD:  scene coords. Identical to screen at pan=(0,0) zoom=1.
 *   - LOCAL:  image-local coords. Origin = image CENTER, x right, y down,
 *             un-rotated (so a point at (-w/2, -h/2) is the top-left
 *             corner of the image regardless of its rotation).
 *
 * Why image-local: collision boundaries the user pen-draws need to follow
 * the image when it's moved, resized, or rotated. We solve that by storing
 * each anchor in the image's local frame — rendering then applies the
 * image's transform group and the boundary moves with it for free.
 */

export function screenToWorld(
  sx: number,
  sy: number,
  pan: { x: number; y: number },
  zoom: number,
): { x: number; y: number } {
  return { x: (sx - pan.x) / zoom, y: (sy - pan.y) / zoom };
}

export function worldToLocal(
  wx: number,
  wy: number,
  img: { x: number; y: number; rotation: number },
): { x: number; y: number } {
  const dx = wx - img.x;
  const dy = wy - img.y;
  const rad = (-img.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function localToWorld(
  lx: number,
  ly: number,
  img: { x: number; y: number; rotation: number },
): { x: number; y: number } {
  const rad = (img.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: img.x + lx * cos - ly * sin, y: img.y + lx * sin + ly * cos };
}

/** Build the SVG `d` attribute for a collision path, in image-local coords.
 *  Anchors with both inX/inY and outX/outY produce cubic Bezier segments;
 *  bare anchors fall back to straight L commands. */
export function collisionToPath(c: FreeformCollision): string {
  if (c.anchors.length === 0) return '';
  const a0 = c.anchors[0];
  let d = `M ${a0.x} ${a0.y}`;
  for (let i = 1; i < c.anchors.length; i++) {
    const prev = c.anchors[i - 1];
    const cur = c.anchors[i];
    d += segment(prev, cur);
  }
  if (c.closed) {
    d += segment(c.anchors[c.anchors.length - 1], a0);
    d += ' Z';
  }
  return d;
}

function segment(prev: FreeformAnchor, cur: FreeformAnchor): string {
  const hasOut = prev.outX !== undefined && prev.outY !== undefined;
  const hasIn = cur.inX !== undefined && cur.inY !== undefined;
  if (hasOut || hasIn) {
    const c1x = hasOut ? prev.x + (prev.outX as number) : prev.x;
    const c1y = hasOut ? prev.y + (prev.outY as number) : prev.y;
    const c2x = hasIn ? cur.x + (cur.inX as number) : cur.x;
    const c2y = hasIn ? cur.y + (cur.inY as number) : cur.y;
    return ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cur.x} ${cur.y}`;
  }
  return ` L ${cur.x} ${cur.y}`;
}

/** AABB hit test in world space against an axis-aligned box derived from
 *  the image's bounds (ignores rotation — good enough for selection picking
 *  on small rotations; if a rotated image is hard to click, the user can
 *  click its visible corners). */
export function hitTestImage(wx: number, wy: number, img: FreeformImage): boolean {
  const local = worldToLocal(wx, wy, img);
  return (
    local.x >= -img.width / 2 &&
    local.x <= img.width / 2 &&
    local.y >= -img.height / 2 &&
    local.y <= img.height / 2
  );
}

export interface ImageAABB {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
}

/** World-space AABB enclosing the image's actual on-screen footprint
 *  (rotation accounted for). Center is the image's anchor center, NOT the
 *  AABB center — the snapping logic relies on `cx`/`cy` matching the image
 *  store's `x`/`y`. */
export function imageAABB(
  img: { x: number; y: number; width: number; height: number; rotation: number },
): ImageAABB {
  const hw = img.width / 2;
  const hh = img.height / 2;
  if (!img.rotation) {
    return { left: img.x - hw, right: img.x + hw, top: img.y - hh, bottom: img.y + hh, cx: img.x, cy: img.y };
  }
  const rad = (img.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = [
    [-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh],
  ].map(([lx, ly]) => ({ x: img.x + lx * cos - ly * sin, y: img.y + lx * sin + ly * cos }));
  let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
  for (const c of corners) {
    if (c.x < l) l = c.x;
    if (c.x > r) r = c.x;
    if (c.y < t) t = c.y;
    if (c.y > b) b = c.y;
  }
  return { left: l, right: r, top: t, bottom: b, cx: img.x, cy: img.y };
}

export interface SnapGuide {
  /** 'v' = vertical line at constant x, 'h' = horizontal at constant y. */
  kind: 'v' | 'h';
  /** World coord of the line. */
  value: number;
  /** Endpoints in the orthogonal axis (so guides span only the two images
   *  involved, like Figma — easier to read than full-canvas crosses). */
  start: number;
  end: number;
}

export interface SnapResult {
  /** Snapped image center. Equals input when no snap fired on that axis. */
  x: number;
  y: number;
  guides: SnapGuide[];
}

/**
 * Compute snap-aligned center for a moving image given its proposed
 * (cx, cy) plus dimensions. Compares left/center/right against every
 * candidate's left/center/right (and same for top/center/bottom) and
 * snaps to the CLOSEST pair within `threshold` per axis. Returns the
 * adjusted center plus the guides to render.
 */
export function computeSnap(
  moving: { x: number; y: number; width: number; height: number; rotation: number },
  candidates: Array<{ x: number; y: number; width: number; height: number; rotation: number; id: string }>,
  threshold: number,
): SnapResult {
  if (candidates.length === 0) return { x: moving.x, y: moving.y, guides: [] };

  const guides: SnapGuide[] = [];

  // X axis: compare left/cx/right of moving with left/cx/right of each
  // candidate. We track the BEST (smallest |delta|) within threshold so
  // big scenes don't accidentally pull the moving image to a far edge.
  const movingBox = imageAABB(moving);
  const movingXs: Array<{ kind: 'left' | 'cx' | 'right'; value: number }> = [
    { kind: 'left', value: movingBox.left },
    { kind: 'cx', value: movingBox.cx },
    { kind: 'right', value: movingBox.right },
  ];
  const movingYs: Array<{ kind: 'top' | 'cy' | 'bottom'; value: number }> = [
    { kind: 'top', value: movingBox.top },
    { kind: 'cy', value: movingBox.cy },
    { kind: 'bottom', value: movingBox.bottom },
  ];

  let bestX: { delta: number; otherBox: ImageAABB; movingKind: 'left' | 'cx' | 'right'; otherKind: 'left' | 'cx' | 'right' } | null = null;
  let bestY: { delta: number; otherBox: ImageAABB; movingKind: 'top' | 'cy' | 'bottom'; otherKind: 'top' | 'cy' | 'bottom' } | null = null;

  for (const c of candidates) {
    const cb = imageAABB(c);
    const otherXs: Array<{ kind: 'left' | 'cx' | 'right'; value: number }> = [
      { kind: 'left', value: cb.left },
      { kind: 'cx', value: cb.cx },
      { kind: 'right', value: cb.right },
    ];
    const otherYs: Array<{ kind: 'top' | 'cy' | 'bottom'; value: number }> = [
      { kind: 'top', value: cb.top },
      { kind: 'cy', value: cb.cy },
      { kind: 'bottom', value: cb.bottom },
    ];
    for (const m of movingXs) {
      for (const o of otherXs) {
        const d = o.value - m.value;
        if (Math.abs(d) <= threshold && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
          bestX = { delta: d, otherBox: cb, movingKind: m.kind, otherKind: o.kind };
        }
      }
    }
    for (const m of movingYs) {
      for (const o of otherYs) {
        const d = o.value - m.value;
        if (Math.abs(d) <= threshold && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
          bestY = { delta: d, otherBox: cb, movingKind: m.kind, otherKind: o.kind };
        }
      }
    }
  }

  let snappedX = moving.x;
  let snappedY = moving.y;
  if (bestX) {
    snappedX = moving.x + bestX.delta;
    const guideX = bestX.otherBox[bestX.otherKind];
    // Vertical guide spans the union of moving (post-snap) and other Y range.
    const movingPostBox: ImageAABB = {
      ...movingBox,
      left: movingBox.left + bestX.delta,
      right: movingBox.right + bestX.delta,
      cx: movingBox.cx + bestX.delta,
    };
    const start = Math.min(movingPostBox.top, bestX.otherBox.top);
    const end = Math.max(movingPostBox.bottom, bestX.otherBox.bottom);
    guides.push({ kind: 'v', value: guideX, start, end });
  }
  if (bestY) {
    snappedY = moving.y + bestY.delta;
    const guideY = bestY.otherBox[bestY.otherKind];
    const movingPostBox: ImageAABB = {
      ...movingBox,
      top: movingBox.top + bestY.delta,
      bottom: movingBox.bottom + bestY.delta,
      cy: movingBox.cy + bestY.delta,
    };
    const start = Math.min(movingPostBox.left, bestY.otherBox.left);
    const end = Math.max(movingPostBox.right, bestY.otherBox.right);
    guides.push({ kind: 'h', value: guideY, start, end });
  }

  return { x: snappedX, y: snappedY, guides };
}

/** Pick the topmost image under (wx, wy). Topmost = highest zIndex. */
export function pickImage(wx: number, wy: number, images: FreeformImage[]): FreeformImage | null {
  let best: FreeformImage | null = null;
  for (const img of images) {
    if (!hitTestImage(wx, wy, img)) continue;
    if (!best || img.zIndex > best.zIndex) best = img;
  }
  return best;
}
