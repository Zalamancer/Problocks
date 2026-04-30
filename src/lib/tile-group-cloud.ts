/**
 * Client-side wrapper around /api/tile-object-groups.
 *
 * Mirrors the shape used by tile-cloud / object-cloud: each call returns
 * a typed payload, throws on non-OK status. Network failures bubble so
 * the caller can fall back to local-only mode (the studio keeps working
 * even when Supabase is unreachable).
 */

export interface CloudGroup {
  id: string;
  name: string;
  assetIds: string[];
  sortIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveGroupInput {
  name: string;
  assetIds?: string[];
  sortIndex?: number;
}

export async function saveTileGroup(input: SaveGroupInput): Promise<CloudGroup> {
  const res = await fetch('/api/tile-object-groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`saveTileGroup failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return json.group as CloudGroup;
}

export async function listTileGroups(): Promise<CloudGroup[]> {
  const res = await fetch('/api/tile-object-groups', { cache: 'no-store' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`listTileGroups failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return (json.groups ?? []) as CloudGroup[];
}

export interface UpdateGroupInput {
  id: string;
  name?: string;
  assetIds?: string[];
  sortIndex?: number;
}

export async function updateTileGroup(input: UpdateGroupInput): Promise<CloudGroup> {
  const res = await fetch('/api/tile-object-groups', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`updateTileGroup failed (${res.status}): ${msg}`);
  }
  const json = await res.json();
  return json.group as CloudGroup;
}

export async function deleteTileGroup(id: string): Promise<void> {
  const res = await fetch(`/api/tile-object-groups?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) {
    const msg = await safeMsg(res);
    throw new Error(`deleteTileGroup failed (${res.status}): ${msg}`);
  }
}

async function safeMsg(res: Response): Promise<string> {
  try {
    const json = await res.json();
    return typeof json?.error === 'string' ? json.error : res.statusText;
  } catch {
    return res.statusText;
  }
}
