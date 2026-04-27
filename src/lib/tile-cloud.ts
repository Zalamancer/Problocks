/**
 * Thin client wrappers around `/api/tile-sheets`. Keeps the panel free of
 * `fetch` boilerplate and makes the success / error shape explicit.
 *
 * All errors are thrown — callers decide whether to swallow (offline /
 * Supabase-not-configured = warn, stay local) or surface (user-initiated
 * delete = show a toast).
 */

export interface CloudSheet {
  id: string;
  name: string;
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  sheetDataUrl: string;
  upperTextureId: string;
  lowerTextureId: string;
  /** Persisted terrain labels — undefined when the user hasn't set one
   *  on either side and the row predates migration 034. */
  upperLabel?: string;
  lowerLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSheetInput {
  name: string;
  sheetDataUrl: string;
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  /** Optional shared-texture ids — supply one or both when this sheet is
   *  meant to chain to an existing tileset. Omit to let the server assign
   *  fresh ids (a stand-alone sheet). */
  upperTextureId?: string;
  lowerTextureId?: string;
  /** Optional terrain labels (e.g. "grass", "dirt"). Pass `null` to clear
   *  a previously-set override; pass `undefined` (or omit) to leave the
   *  cloud value untouched on this upsert. */
  upperLabel?: string | null;
  lowerLabel?: string | null;
}

export async function saveTileSheet(input: SaveSheetInput): Promise<CloudSheet> {
  const res = await fetch('/api/tile-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`saveTileSheet failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return json.sheet as CloudSheet;
}

export async function listTileSheets(): Promise<CloudSheet[]> {
  const res = await fetch('/api/tile-sheets', { cache: 'no-store' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`listTileSheets failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return (json.sheets ?? []) as CloudSheet[];
}

export async function deleteTileSheet(id: string): Promise<void> {
  const res = await fetch(`/api/tile-sheets?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`deleteTileSheet failed (${res.status}): ${msg}`);
  }
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
