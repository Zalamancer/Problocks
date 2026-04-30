/**
 * Deferred cloud-side commit for object-asset deletes, with Cmd+Z safety.
 *
 * The local store removes the asset immediately and pushes an undo
 * snapshot. We delay the actual `deleteTileObjectGroup` cloud call by
 * `GRACE_MS` so that an undo within the window simply cancels the cloud
 * delete (no API call ever fires).
 *
 * If undo happens AFTER the timer already fired (cloud row is gone),
 * we re-save every style to the same group_id so reload preserves the
 * restore. Without this, an undo would visually bring the asset back
 * but it would silently disappear on next page load.
 *
 * This module subscribes to the tile store once at first use; the
 * subscriber survives for the SPA lifetime which is fine because
 * `useTile.subscribe` is dirt cheap and only acts when the trash map
 * is non-empty.
 */

import { useTile, type ObjectAsset } from '@/store/tile-store';
import { saveTileObject, deleteTileObjectGroup } from '@/lib/object-cloud';

interface TrashEntry {
  asset: ObjectAsset;
  /** null once the timer has fired and the cloud row was attempted. */
  timerId: ReturnType<typeof setTimeout> | null;
  /** True after the deleteTileObjectGroup promise settles (success OR
   *  error). If undo happens after this, we re-save. */
  cloudGone: boolean;
}

const trash = new Map<string, TrashEntry>();
const GRACE_MS = 8000;

let subscribed = false;

function ensureSubscription() {
  if (subscribed) return;
  subscribed = true;
  let prev = useTile.getState().objectAssets;
  useTile.subscribe((s) => {
    const curr = s.objectAssets;
    if (curr === prev) return;
    prev = curr;
    if (trash.size === 0) return;
    for (const [id, entry] of Array.from(trash.entries())) {
      if (!curr[id]) continue;
      // Asset is back in the store — undo (or re-add) restored it.
      if (entry.timerId != null) {
        clearTimeout(entry.timerId);
        trash.delete(id);
      } else if (entry.cloudGone) {
        const restored = curr[id];
        trash.delete(id);
        void restoreAssetCloud(id, restored);
      } else {
        // Timer already fired but the cloud promise is still in flight.
        // Wait — the resolve handler will set cloudGone and the next
        // store change (or this one if the timing aligns) will re-fire
        // this branch.
      }
    }
  });
}

async function restoreAssetCloud(assetId: string, asset: ObjectAsset) {
  for (let i = 0; i < asset.styles.length; i++) {
    const st = asset.styles[i];
    try {
      const cloud = await saveTileObject({
        name: asset.name,
        dataUrl: st.dataUrl,
        width: st.width,
        height: st.height,
        groupId: assetId,
        label: st.label ?? '',
        sortIndex: i,
      });
      useTile.getState().setStyleCloudId(assetId, st.id, cloud.id);
    } catch (err) {
      console.warn('[object-cloud] restore after undo failed', err);
    }
  }
}

/** Schedule a cloud-side group delete. Local state should already have
 *  been mutated by the caller (so undo records the right snapshot). */
export function scheduleAssetCloudDelete(asset: ObjectAsset) {
  ensureSubscription();
  const hasCloud = asset.styles.some((s) => s.cloudId);
  if (!hasCloud) return;
  // Re-deleting an already-pending id: cancel the old timer first.
  const existing = trash.get(asset.id);
  if (existing?.timerId != null) clearTimeout(existing.timerId);
  const entry: TrashEntry = { asset, timerId: null, cloudGone: false };
  entry.timerId = setTimeout(() => {
    entry.timerId = null;
    deleteTileObjectGroup(asset.id)
      .catch((err) => console.warn('[object-cloud] delete group failed', err))
      .finally(() => {
        entry.cloudGone = true;
        // If the asset is no longer in the trash (i.e. undone before the
        // cloud delete settled), re-save now so the restore persists.
        if (!trash.has(asset.id)) {
          const live = useTile.getState().objectAssets[asset.id];
          if (live) void restoreAssetCloud(asset.id, live);
          return;
        }
        // Otherwise leave the entry — the store subscriber will pick up
        // any subsequent restore.
      });
  }, GRACE_MS);
  trash.set(asset.id, entry);
}
