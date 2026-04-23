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

/** Pick the topmost image under (wx, wy). Topmost = highest zIndex. */
export function pickImage(wx: number, wy: number, images: FreeformImage[]): FreeformImage | null {
  let best: FreeformImage | null = null;
  for (const img of images) {
    if (!hitTestImage(wx, wy, img)) continue;
    if (!best || img.zIndex > best.zIndex) best = img;
  }
  return best;
}
