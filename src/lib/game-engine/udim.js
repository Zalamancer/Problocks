/**
 * Problocks UDim2 — responsive positioning primitives.
 *
 * Ported from Roblox's UDim / UDim2 model. Each axis is scale*parent + offset.
 * Lets AI-generated games position HUD elements that stay correct at any
 * canvas size (phone, Chromebook, full monitor) without hand-coded math.
 *
 * Usage inside game scripts:
 *   game.ui.text('Score: ' + s, UDim(0, 20), UDim(0, 20));           // top-left + 20px
 *   game.ui.text('FPS', UDim(1, -20), UDim(0, 20), {anchor: ANCHOR.TopRight});
 *   game.ui.bar(UDim(0.5, -50), UDim(1, -30),
 *               UDim(0, 100),   UDim(0, 10),
 *               hp, hpMax, '#e74c3c', '#333', {anchor: ANCHOR.Bottom});
 *
 * Numbers still work (full backward compat): ui.text('Hi', 20, 20).
 */

export function UDim(scale = 0, offset = 0) {
  return { _udim: true, scale, offset };
}

export function UDim2(xScale = 0, xOffset = 0, yScale = 0, yOffset = 0) {
  return {
    _udim2: true,
    x: UDim(xScale, xOffset),
    y: UDim(yScale, yOffset),
  };
}

/** Resolve a UDim (or raw number) against a parent extent. */
export function resolveUDim(v, parent) {
  if (typeof v === 'number') return v;
  if (v && v._udim) return v.scale * parent + v.offset;
  return 0;
}

/** Resolve a UDim2 to { x, y } against parent width/height. */
export function resolveUDim2(pos, pw, ph) {
  if (!pos) return { x: 0, y: 0 };
  return { x: resolveUDim(pos.x, pw), y: resolveUDim(pos.y, ph) };
}

/** Anchor = [ax, ay] in 0..1 on each axis. Subtracts anchor*size from pos. */
export function applyAnchor(x, y, w, h, anchor) {
  if (!anchor) return { x, y };
  const ax = anchor[0] || 0;
  const ay = anchor[1] || 0;
  return { x: x - ax * w, y: y - ay * h };
}

/** Preset anchor points — mirror Roblox's 9-point grid. */
export const ANCHOR = {
  TopLeft: [0, 0], Top: [0.5, 0], TopRight: [1, 0],
  Left: [0, 0.5], Center: [0.5, 0.5], Right: [1, 0.5],
  BottomLeft: [0, 1], Bottom: [0.5, 1], BottomRight: [1, 1],
};
