/**
 * Best-effort cloud sync glue for tile groups.
 *
 * Each helper mirrors a store mutation. They never throw — failures are
 * logged so the studio keeps working in local-only mode. The store stays
 * clean of network code; components import these wrappers and fire them
 * after the local mutation has already happened.
 */

import { useTile } from '@/store/tile-store';
import {
  saveTileGroup,
  listTileGroups,
  updateTileGroup,
  deleteTileGroup,
} from '@/lib/tile-group-cloud';

/** One-shot hydrate: fetch the user's groups and merge them into the
 *  local store. Skips any cloud row that's already represented locally
 *  (matched by cloudId), so it's safe to call repeatedly. Returns true
 *  on success, false on any network/Supabase error. */
export async function hydrateTileGroupsFromCloud(): Promise<boolean> {
  try {
    const rows = await listTileGroups();
    for (const r of rows) {
      useTile.getState().upsertTileGroupFromCloud({
        id: r.id,
        name: r.name,
        assetIds: r.assetIds,
        sortIndex: r.sortIndex,
        cloudId: r.id,
      });
    }
    return true;
  } catch (err) {
    console.warn('[group-cloud] hydrate failed; running in local-only mode', err);
    return false;
  }
}

/** POST a freshly-created local group and stamp the returned cloud id
 *  back onto the store row so subsequent renames/membership changes can
 *  PATCH the same row. */
export async function pushNewGroupToCloud(localId: string): Promise<void> {
  const g = useTile.getState().tileGroups[localId];
  if (!g || g.cloudId) return;
  try {
    const cloud = await saveTileGroup({
      name: g.name,
      assetIds: g.assetIds,
      sortIndex: g.sortIndex,
    });
    useTile.getState().setTileGroupCloudId(localId, cloud.id);
  } catch (err) {
    console.warn('[group-cloud] save failed; kept local-only', err);
  }
}

/** PATCH the cloud row's name. No-op if the group has no cloudId yet
 *  (the next pushNewGroupToCloud will carry the latest name anyway). */
export async function pushGroupRenameToCloud(localId: string, name: string): Promise<void> {
  const g = useTile.getState().tileGroups[localId];
  if (!g?.cloudId) return;
  try {
    await updateTileGroup({ id: g.cloudId, name });
  } catch (err) {
    console.warn('[group-cloud] rename failed', err);
  }
}

/** PATCH the cloud row's asset_ids array. Reads the current array from
 *  the store at call-time so back-to-back toggles coalesce naturally. */
export async function pushGroupMembersToCloud(localId: string): Promise<void> {
  const g = useTile.getState().tileGroups[localId];
  if (!g?.cloudId) return;
  try {
    await updateTileGroup({ id: g.cloudId, assetIds: g.assetIds });
  } catch (err) {
    console.warn('[group-cloud] members update failed', err);
  }
}

/** DELETE a cloud row. Pass the cloudId directly because the local
 *  group is typically already gone from the store by the time this
 *  fires (delete-then-sync ordering). */
export async function pushGroupDeleteToCloud(cloudId: string | undefined): Promise<void> {
  if (!cloudId) return;
  try {
    await deleteTileGroup(cloudId);
  } catch (err) {
    console.warn('[group-cloud] delete failed', err);
  }
}
