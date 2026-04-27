/**
 * Thin client wrappers around `/api/tile-objects` — uploaded standalone
 * sprite assets used by the studio's OBJECT tool. Mirrors `tile-cloud.ts`
 * exactly so panels can use the same try/catch + offline-fallback pattern.
 */

export interface CloudObject {
  id: string;
  name: string;
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

export async function deleteTileObject(id: string): Promise<void> {
  const res = await fetch(`/api/tile-objects?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`deleteTileObject failed (${res.status}): ${msg}`);
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
