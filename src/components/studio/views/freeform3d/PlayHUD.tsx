/**
 * Slice 6/6 of the freeform-3D tycoon scripting layer.
 *
 * DOM overlay rendered above the Three.js canvas during play mode.
 * Reads:
 *   - useFreeform3D().scene.gameLogic.hud  → which elements to render
 *   - useFreeform3D().scene.objects        → click:buy labels for inv ids
 *   - useGameState()                        → live coins / inventory
 *
 * v1 (slice 3) painted only the coinCounter; slice 6 fills in the
 * remaining two element types:
 *
 *   inventory     — ownership multiset, label×count from click:buy
 *                   labels (e.g. "Red Pet ×3")
 *   upgradePanel  — full catalog, click-to-buy with affordability and
 *                   ownership states reflected in the button styling
 *
 * Auth gate behaviour from slice 3 is unchanged: scenes declaring any
 * serverside variable replace the HUD with a sign-in card when no
 * Supabase session exists. Decoration scenes render nothing.
 */

'use client';

import { useFreeform3D } from '@/store/freeform3d-store';
import { useAuthStore } from '@/store/auth-store';
import { useToastStore } from '@/store/toast-store';
import { useGameState } from '@/hooks/use-game-state';
import type {
  HUDAnchor,
  HUDElement,
  UpgradeDef,
} from '@/lib/kid-style-3d/game-logic-schema';
import type { SceneObject } from '@/lib/kid-style-3d/scene-schema';

const ANCHOR_CLASS: Record<HUDAnchor, string> = {
  'top-left':     'top-3 left-3 items-start',
  'top-right':    'top-3 right-3 items-end',
  'bottom-left':  'bottom-3 left-3 items-start',
  'bottom-right': 'bottom-3 right-3 items-end',
};

function groupByAnchor(elements: HUDElement[]): Record<HUDAnchor, HUDElement[]> {
  const out: Record<HUDAnchor, HUDElement[]> = {
    'top-left': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-right': [],
  };
  for (const el of elements) out[el.anchor].push(el);
  return out;
}

/** Walk every prefab's click:buy behaviors to build a label map for
    inventory ids. The agent emits `addToInventory: 'pet_red'` along
    with `label: 'Red Pet'`; this gives the HUD a human-readable name
    without forcing the agent to declare a separate label registry. */
function buildInventoryLabels(objects: SceneObject[]): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const o of objects) {
    for (const b of o.behaviors ?? []) {
      if (b.on === 'click' && b.action.do === 'buy' && b.action.addToInventory) {
        const id = b.action.addToInventory;
        if (b.action.label && !labels[id]) labels[id] = b.action.label;
      }
    }
  }
  return labels;
}

/** Inventory as a stable [id, count] list. Sorted by count desc then
    id so the panel doesn't reshuffle on each tick. */
function summarizeInventory(inventory: string[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const id of inventory) counts.set(id, (counts.get(id) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
}

function HUDPill({
  children,
  interactive = false,
}: {
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-zinc-900/85 backdrop-blur-md border border-white/10 px-3 py-2 text-zinc-100 shadow-lg shadow-black/30 ${
        interactive ? 'pointer-events-auto' : ''
      }`}
    >
      {children}
    </div>
  );
}

export function PlayHUD() {
  const gameLogic = useFreeform3D((s) => s.scene.gameLogic);
  const objects = useFreeform3D((s) => s.scene.objects);
  const user = useAuthStore((s) => s.user);
  const { state, loading, buy } = useGameState();
  const addToast = useToastStore((s) => s.addToast);

  if (!gameLogic || (gameLogic.hud.length === 0 && Object.keys(gameLogic.variables).length === 0)) {
    return null;
  }

  const hasServerside = Object.values(gameLogic.variables).some((v) => v.serverside);

  if (hasServerside && !user) {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="pointer-events-auto rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-white/10 px-6 py-5 max-w-sm text-center shadow-xl shadow-black/40">
          <div className="text-zinc-100 text-lg font-semibold mb-1">Sign in to play</div>
          <div className="text-zinc-400 text-sm mb-4">
            This world tracks your coins, inventory, and upgrades. Sign in
            so your progress saves across sessions.
          </div>
          <a
            href="/auth"
            className="inline-block rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-4 py-2 text-sm transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const grouped = groupByAnchor(gameLogic.hud);
  const labels = buildInventoryLabels(objects);
  const upgradeCatalog = gameLogic.upgrades;

  async function handleBuyUpgrade(def: UpgradeDef) {
    const result = await buy({
      kind: 'upgrade',
      upgradeId: def.id,
      catalog: upgradeCatalog,
    });
    if (!result.ok) {
      if (result.reason === 'insufficient') addToast('warning', `Need ${def.cost} coins for ${def.label}`);
      else if (result.reason === 'auth')    addToast('warning', 'Sign in to play this world');
      else                                  addToast('error',   'Upgrade failed — try again');
    } else {
      addToast('info', `Unlocked ${def.label}`);
    }
  }

  return (
    <>
      {(Object.keys(grouped) as HUDAnchor[]).map((anchor) => {
        const elements = grouped[anchor];
        if (elements.length === 0) return null;
        return (
          <div
            key={anchor}
            className={`pointer-events-none absolute z-10 flex flex-col gap-2 ${ANCHOR_CLASS[anchor]}`}
          >
            {elements.map((el) => (
              <HUDElementView
                key={el.id}
                el={el}
                coins={state?.coins ?? 0}
                inventory={state?.inventory ?? []}
                ownedUpgrades={state?.upgrades ?? []}
                upgradeCatalog={upgradeCatalog}
                inventoryLabels={labels}
                loading={loading && !state}
                onBuyUpgrade={handleBuyUpgrade}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

function HUDElementView({
  el,
  coins,
  inventory,
  ownedUpgrades,
  upgradeCatalog,
  inventoryLabels,
  loading,
  onBuyUpgrade,
}: {
  el: HUDElement;
  coins: number;
  inventory: string[];
  ownedUpgrades: string[];
  upgradeCatalog: Record<string, UpgradeDef>;
  inventoryLabels: Record<string, string>;
  loading: boolean;
  onBuyUpgrade: (def: UpgradeDef) => Promise<void>;
}) {
  switch (el.type) {
    case 'coinCounter':
      return (
        <HUDPill>
          <div className="flex items-center gap-2">
            <span className="text-amber-300 text-lg leading-none">●</span>
            <span className="font-mono tabular-nums text-base">
              {loading ? '—' : coins.toLocaleString()}
            </span>
          </div>
        </HUDPill>
      );
    case 'inventory':
      return (
        <InventoryPanel
          title={el.title ?? 'Inventory'}
          inventory={inventory}
          labels={inventoryLabels}
        />
      );
    case 'upgradePanel':
      return (
        <UpgradesPanel
          title={el.title ?? 'Upgrades'}
          coins={coins}
          ownedUpgrades={ownedUpgrades}
          catalog={upgradeCatalog}
          onBuy={onBuyUpgrade}
        />
      );
  }
}

function InventoryPanel({
  title,
  inventory,
  labels,
}: {
  title: string;
  inventory: string[];
  labels: Record<string, string>;
}) {
  const summary = summarizeInventory(inventory);
  return (
    <HUDPill>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">{title}</div>
      {summary.length === 0 ? (
        <div className="text-xs text-zinc-500 italic">empty</div>
      ) : (
        <div className="flex flex-col gap-1 min-w-[140px]">
          {summary.map(([id, count]) => (
            <div key={id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-200">{labels[id] ?? id}</span>
              <span className="font-mono tabular-nums text-zinc-400 text-xs">×{count}</span>
            </div>
          ))}
        </div>
      )}
    </HUDPill>
  );
}

function UpgradesPanel({
  title,
  coins,
  ownedUpgrades,
  catalog,
  onBuy,
}: {
  title: string;
  coins: number;
  ownedUpgrades: string[];
  catalog: Record<string, UpgradeDef>;
  onBuy: (def: UpgradeDef) => Promise<void>;
}) {
  const owned = new Set(ownedUpgrades);
  const list = Object.values(catalog).sort((a, b) => a.cost - b.cost);
  return (
    <HUDPill interactive>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1.5">{title}</div>
      {list.length === 0 ? (
        <div className="text-xs text-zinc-500 italic">none yet</div>
      ) : (
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          {list.map((def) => {
            const isOwned = owned.has(def.id);
            const canAfford = coins >= def.cost;
            const variantClass = isOwned
              ? 'bg-zinc-800/80 text-zinc-400 cursor-not-allowed'
              : canAfford
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30'
                : 'bg-zinc-800/60 text-zinc-500 cursor-not-allowed';
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => {
                  if (isOwned || !canAfford) return;
                  void onBuy(def);
                }}
                disabled={isOwned || !canAfford}
                className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${variantClass}`}
              >
                <span className="font-medium">{def.label}</span>
                <span className="font-mono tabular-nums text-xs">
                  {isOwned ? 'OWNED' : `${def.cost.toLocaleString()}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </HUDPill>
  );
}
