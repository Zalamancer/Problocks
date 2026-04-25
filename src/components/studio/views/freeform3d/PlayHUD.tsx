/**
 * Slice 3/6 of the freeform-3D tycoon scripting layer.
 *
 * DOM overlay rendered above the Three.js canvas during play mode.
 * Reads:
 *   - useFreeform3D().scene.gameLogic.hud  → which elements to render
 *   - useGameState()                        → live coins / inventory
 *
 * v1 only paints the coinCounter type fully. inventory + upgradePanel
 * are stubbed as labelled placeholders so slice 6 can fill them in
 * without re-shuffling layout.
 *
 * Auth gate — when the scene declares any serverside variable AND the
 * active user isn't signed in, we replace the HUD with a sign-in
 * prompt and the click-to-buy handler exits early. Decoration scenes
 * (no gameLogic) skip the gate so existing freeform play still works.
 */

'use client';

import { useFreeform3D } from '@/store/freeform3d-store';
import { useAuthStore } from '@/store/auth-store';
import { useGameState } from '@/hooks/use-game-state';
import type { HUDAnchor, HUDElement } from '@/lib/kid-style-3d/game-logic-schema';

const ANCHOR_CLASS: Record<HUDAnchor, string> = {
  'top-left':     'top-3 left-3 items-start',
  'top-right':    'top-3 right-3 items-end',
  'bottom-left':  'bottom-3 left-3 items-start',
  'bottom-right': 'bottom-3 right-3 items-end',
};

/** Group HUD elements by anchor so each cluster gets one absolutely-
    positioned column instead of N stacked layers. */
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

function HUDPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-zinc-900/85 backdrop-blur-md border border-white/10 px-3 py-2 text-zinc-100 shadow-lg shadow-black/30">
      {children}
    </div>
  );
}

export function PlayHUD() {
  const gameLogic = useFreeform3D((s) => s.scene.gameLogic);
  const user = useAuthStore((s) => s.user);
  const { state, loading } = useGameState();

  // Decoration-only scene — no HUD, no auth gate. Lets existing freeform
  // play (no money loop) keep working.
  if (!gameLogic || (gameLogic.hud.length === 0 && Object.keys(gameLogic.variables).length === 0)) {
    return null;
  }

  const hasServerside = Object.values(gameLogic.variables).some((v) => v.serverside);

  // Auth gate — only kicks in when the scene actually declares serverside
  // state. A scene that only uses client variables (e.g. a counter) plays
  // without forcing sign-in.
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
                inventoryCount={state?.inventory.length ?? 0}
                upgradeCount={state?.upgrades.length ?? 0}
                loading={loading && !state}
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
  inventoryCount,
  upgradeCount,
  loading,
}: {
  el: HUDElement;
  coins: number;
  inventoryCount: number;
  upgradeCount: number;
  loading: boolean;
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
        <HUDPill>
          <div className="text-xs text-zinc-300">
            {el.title ?? 'Inventory'}{' '}
            <span className="text-zinc-500">({inventoryCount})</span>
          </div>
        </HUDPill>
      );
    case 'upgradePanel':
      return (
        <HUDPill>
          <div className="text-xs text-zinc-300">
            {el.title ?? 'Upgrades'}{' '}
            <span className="text-zinc-500">({upgradeCount})</span>
          </div>
        </HUDPill>
      );
  }
}
