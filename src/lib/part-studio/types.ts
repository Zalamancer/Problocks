/**
 * Part Studio — low-poly primitive-composition assets.
 *
 * Claude generates a JSON array of primitives (box / cylinder / sphere /
 * wedge). Each primitive costs ~6–18 verts when rendered at low poly, so a
 * budget of ~100 verts maps to ~8–12 primitives. Shape + pos + size + color
 * is the entire vocabulary — simple enough for Haiku to emit reliably and
 * schema-validate cleanly.
 */

export type PrimitiveShape = 'box' | 'cylinder' | 'sphere' | 'wedge';

export interface Primitive {
  /** Shape kind — maps 1:1 to a Three.js geometry constructor. */
  shape: PrimitiveShape;
  /** World position [x, y, z] in metres. y=0 is the ground plane. */
  pos: [number, number, number];
  /**
   * Dimensions. Semantics vary by shape:
   *   - box: full width/height/depth
   *   - cylinder: [radius, height, radius]  (x === z = radius)
   *   - sphere: [radius, radius, radius]     (x === y === z = radius)
   *   - wedge: [width, height, depth]        (right-triangle prism)
   */
  size: [number, number, number];
  /** Hex color, e.g. "#ff6b6b". Vertex-colored — no textures. */
  color: string;
  /** Optional Euler rotation in degrees. Omitted = identity. */
  rot?: [number, number, number];
}

export interface PartModel {
  /** Human-readable asset name, e.g. "knight". */
  name: string;
  /** Ordered list of primitives. Render = union of all primitives. */
  parts: Primitive[];
}

/** One generation attempt, persisted to Supabase eventually. */
export interface PartGeneration {
  id: string;
  /** Short user prompt, e.g. "make a knight". */
  userPrompt: string;
  /** The fully-expanded prompt actually sent to Claude. */
  expandedPrompt: string;
  /** Inferred category used for template selection. */
  category: string;
  /** Generated model (null if generation failed). */
  model: PartModel | null;
  /** Approximate total vertex count. */
  vertexCount: number;
  /** 1–5 star rating, null until rated. */
  rating: number | null;
  /** Free-text feedback for "regenerate with notes". */
  feedback: string | null;
  /** Parent id when this is a regeneration-with-feedback. */
  parentId: string | null;
  /** If the generation errored, the message. */
  error: string | null;
  createdAt: number;
}

// ── Validation ────────────────────────────────────────────────────────────

const SHAPES: PrimitiveShape[] = ['box', 'cylinder', 'sphere', 'wedge'];
const HEX = /^#[0-9a-fA-F]{6}$/;

function isTriple(v: unknown): v is [number, number, number] {
  return (
    Array.isArray(v) &&
    v.length === 3 &&
    v.every((n) => typeof n === 'number' && Number.isFinite(n))
  );
}

function validatePrimitive(raw: unknown): Primitive | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  if (!SHAPES.includes(p.shape as PrimitiveShape)) return null;
  if (!isTriple(p.pos)) return null;
  if (!isTriple(p.size)) return null;
  if (typeof p.color !== 'string' || !HEX.test(p.color)) return null;
  const prim: Primitive = {
    shape: p.shape as PrimitiveShape,
    pos: p.pos,
    size: p.size,
    color: p.color,
  };
  if (p.rot !== undefined) {
    if (!isTriple(p.rot)) return null;
    prim.rot = p.rot;
  }
  return prim;
}

/** Try to parse a PartModel from raw (likely Claude) output. */
export function parsePartModel(raw: unknown): PartModel | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === 'string' && o.name ? o.name : 'part';
  if (!Array.isArray(o.parts)) return null;
  const parts: Primitive[] = [];
  for (const p of o.parts) {
    const v = validatePrimitive(p);
    if (!v) return null;
    parts.push(v);
  }
  if (parts.length === 0) return null;
  return { name, parts };
}

/** Approximate vertex count used by the low-poly renderer. */
export function vertexCountFor(model: PartModel): number {
  let total = 0;
  for (const p of model.parts) {
    switch (p.shape) {
      case 'box':      total += 8;  break;
      case 'cylinder': total += 16; break; // 8-segment cylinder = 16 verts
      case 'sphere':   total += 12; break; // icosahedron(0) = 12 verts
      case 'wedge':    total += 6;  break; // triangular prism
    }
  }
  return total;
}
