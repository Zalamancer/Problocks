/**
 * Thin client wrappers around `/api/tile-objects` — uploaded standalone
 * sprite assets used by the studio's OBJECT tool. Each row is one style
 * (sprite); rows sharing a `groupId` belong to the same logical asset
 * (e.g. "house" with multiple level / damage variants).
 */

export interface CloudObject {
  /** Per-style row id. */
  id: string;
  /** Asset id — every style of the same asset shares this. */
  groupId: string;
  /** Asset name (group). All styles in a group share the same name. */
  name: string;
  /** Style label within the group (e.g. "Level 2"). May be empty. */
  label: string;
  /** Lower sortIndex appears first in style lists. */
  sortIndex: number;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveObjectInput {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  /** Omit to create a brand-new asset (single-style group). Provide an
   *  existing groupId to add another style to that asset. */
  groupId?: string;
  /** Style label. Empty string = "default" / unlabeled style. */
  label?: string;
  sortIndex?: number;
}

export async function saveTileObject(input: SaveObjectInput): Promise<CloudObject> {
  const res = await fetch('/api/tile-objects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`saveTileObject failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return json.object as CloudObject;
}

export async function listTileObjects(): Promise<CloudObject[]> {
  const res = await fetch('/api/tile-objects', { cache: 'no-store' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`listTileObjects failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return (json.objects ?? []) as CloudObject[];
}

/** Delete a single style row. */
export async function deleteTileObject(id: string): Promise<void> {
  const res = await fetch(`/api/tile-objects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`deleteTileObject failed (${res.status}): ${msg}`);
  }
}

/** Delete every style belonging to an asset (group). */
export async function deleteTileObjectGroup(groupId: string): Promise<void> {
  const res = await fetch(`/api/tile-objects?groupId=${encodeURIComponent(groupId)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`deleteTileObjectGroup failed (${res.status}): ${msg}`);
  }
}

export interface UpdateObjectInput {
  /** Either id (single row) or groupId (every row in the group) — not both. */
  id?: string;
  groupId?: string;
  /** Bulk-rename the asset (only meaningful with `groupId`). */
  name?: string;
  /** Single-row label rename (only meaningful with `id`). */
  label?: string;
  /** Single-row drag-reorder index (only meaningful with `id`). */
  sortIndex?: number;
}

/**
 * PATCH a row or every row of a group. Used for asset rename
 * (`{ groupId, name }`), style label rename (`{ id, label }`), and
 * drag-reorder of styles (`{ id, sortIndex }`).
 */
export async function updateTileObject(input: UpdateObjectInput): Promise<CloudObject[]> {
  const res = await fetch('/api/tile-objects', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`updateTileObject failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return (json.objects ?? []) as CloudObject[];
}

async function safeMsg(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j && typeof j === 'object' && 'error' in j && typeof j.error === 'string') return j.error;
    return res.statusText;
  } catch {
    return res.statusText;
  }
}
