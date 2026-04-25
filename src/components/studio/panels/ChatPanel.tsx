'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, Square, Layers, Box } from 'lucide-react';
import { PanelTextarea, PanelActionButton, SectionLabel } from '@/components/ui';
import { useSceneStore, type PartType, type ScenePart } from '@/store/scene-store';
import { useBuildingStore, type EdgeDir, type Facing } from '@/store/building-store';
import type { PieceKind } from '@/lib/building-kit';
import { ChatAssetPicker } from './ChatAssetPicker';
import { useAIBuildModeStore } from '@/store/ai-library-store';
import { useStudio } from '@/store/studio-store';
import { usePartStudio } from '@/store/part-studio-store';
import { useFreeform3D } from '@/store/freeform3d-store';
import type { Vec3 } from '@/lib/kid-style-3d/scene-schema';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type WallKind = 'wall' | 'wall-window' | 'wall-door';
type CornerKind = 'corner' | 'roof-corner';

type StudioAction =
  // parts
  | {
      type: 'addPart';
      name?: string;
      partType?: PartType;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
      color?: string;
      /** For partType === 'GLB', the enabled library asset name. */
      modelName?: string;
    }
  | {
      type: 'updatePart';
      id: string;
      name?: string;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
      color?: string;
    }
  | { type: 'removePart'; id: string }
  | { type: 'clearParts' }
  // building — floors
  | { type: 'placeFloor'; x: number; z: number; y?: number; asset?: string }
  | { type: 'eraseFloor'; x: number; z: number; y?: number }
  // building — walls
  | { type: 'placeWall'; x: number; z: number; y?: number; dir: EdgeDir; kind?: WallKind; asset?: string }
  | { type: 'eraseWall'; x: number; z: number; y?: number; dir: EdgeDir }
  // building — roofs
  | { type: 'placeRoof'; x: number; z: number; y?: number; asset?: string }
  | { type: 'eraseRoof'; x: number; z: number; y?: number }
  // building — corners
  | { type: 'placeCorner'; x: number; z: number; y?: number; kind?: CornerKind; asset?: string }
  | { type: 'eraseCorner'; x: number; z: number; y?: number }
  // building — stairs
  | { type: 'placeStairs'; x: number; z: number; y?: number; facing: Facing; asset?: string }
  | { type: 'eraseStairs'; x: number; z: number; y?: number; facing: Facing }
  // bulk
  | { type: 'clearBuilding' }
  // selection defaults (so later place* actions without asset inherit)
  | { type: 'setSelectedPiece'; kind: PieceKind; asset: string }
  | { type: 'setFloorAsset'; asset: string }
  | { type: 'setWallAsset'; asset: string };

/**
 * Actions emitted by the /api/freeform3d-agent route. Separate from
 * StudioAction because the two agents target different stores — the
 * freeform3d agent speaks in prefab kinds + [x,y,z] tuples, the legacy
 * studio agent speaks in grid tiles + {x,y,z} objects.
 *
 * Slice 4/6 adds the tycoon scripting layer to the action vocabulary:
 * defineVariable / addBehavior / defineUpgrade / addHUD let the agent
 * declare clickable shops, ticking pets, upgrade panels, and a HUD
 * overlay. Apply paths route to the freeform3d-store's slice-1
 * actions; the runtime (slice 3 click + slice 5 tick) reads what the
 * agent declared and binds it to live game state.
 */
type Freeform3DAction =
  | {
      type: 'addPrefab';
      /** Optional agent-assigned id. When set + not already taken, the
          store uses it as the object's id so behaviors emitted later
          in the same response can reference it by name. Rejected +
          auto-minted if it collides or fails the safe-chars check. */
      id?: string;
      kind: string;
      position?: Vec3;
      rotation?: Vec3;
      scale?: Vec3;
      color?: string;
      props?: Record<string, unknown>;
    }
  | {
      type: 'updatePrefab';
      id: string;
      position?: Vec3;
      rotation?: Vec3;
      scale?: Vec3;
      color?: string;
      props?: Record<string, unknown>;
    }
  | { type: 'removePrefab'; id: string }
  | { type: 'clearScene' }
  // --- Tycoon scripting (slice 4/6) ---
  | {
      type: 'defineVariable';
      name: string;
      initial: number;
      serverside: boolean;
      label?: string;
    }
  | { type: 'removeVariable'; name: string }
  | {
      /** Attach a click/tick behavior to a prefab. The action body
          mirrors BehaviorAction; the wire format keeps it nested
          rather than flattened so it stays a 1:1 shape with the
          schema in game-logic-schema.ts. */
      type: 'addBehavior';
      prefabId: string;
      on: 'click' | 'tick';
      action: Record<string, unknown>;
      interval?: number;
    }
  | { type: 'clearBehaviors'; prefabId: string }
  | {
      type: 'defineUpgrade';
      id: string;
      label: string;
      cost: number;
      effect: Record<string, unknown>;
    }
  | { type: 'removeUpgrade'; id: string }
  | {
      /** hudType is renamed to dodge the action `type` field. */
      type: 'addHUD';
      id: string;
      hudType: 'coinCounter' | 'inventory' | 'upgradePanel';
      anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      bind?: string;
      title?: string;
    }
  | { type: 'removeHUD'; id: string }
  | {
      /** Set the scene-wide JavaScript script. The runtime evaluates
          this on play start with a sandboxed API (player / coins /
          inventory / onStart / onTick / onClick / toast). See
          lib/kid-style-3d/script-runtime.ts. */
      type: 'setScript';
      source: string;
    };

function shortDescribeFreeform3D(a: Freeform3DAction): string {
  switch (a.type) {
    case 'addPrefab':
      return `➕ ${a.kind}${a.color ? ` ${a.color}` : ''}`;
    case 'updatePrefab':
      return `✏️ Update ${a.id}`;
    case 'removePrefab':
      return `🗑️ Remove ${a.id}`;
    case 'clearScene':
      return '🧹 Clear scene';
    case 'defineVariable':
      return `🔢 ${a.name} = ${a.initial}${a.serverside ? ' [server]' : ''}`;
    case 'removeVariable':
      return `🔢 Remove var ${a.name}`;
    case 'addBehavior': {
      const doStr = (a.action as { do?: string }).do ?? '?';
      return `⚡ ${a.on}:${doStr} on ${a.prefabId}`;
    }
    case 'clearBehaviors':
      return `⚡ Clear behaviors on ${a.prefabId}`;
    case 'defineUpgrade':
      return `⬆️ ${a.label} (${a.cost})`;
    case 'removeUpgrade':
      return `⬆️ Remove upgrade ${a.id}`;
    case 'addHUD':
      return `🖼️ HUD ${a.hudType} ${a.anchor}`;
    case 'removeHUD':
      return `🖼️ Remove HUD ${a.id}`;
    case 'setScript':
      return `📜 Script (${a.source.split('\n').length} lines)`;
  }
}

function shortDescribe(a: StudioAction): string {
  switch (a.type) {
    case 'addPart':
      return a.partType === 'GLB' && a.modelName
        ? `➕ GLB ${a.modelName}`
        : `➕ Part${a.name ? ` "${a.name}"` : ''}${a.color ? ` ${a.color}` : ''}`;
    case 'updatePart':
      return `✏️ Update ${a.id}`;
    case 'removePart':
      return `🗑️ Remove ${a.id}`;
    case 'clearParts':
      return '🧹 Clear parts';
    case 'placeFloor':
      return `🟫 Floor (${a.x},${a.z}${a.y ? `,L${a.y}` : ''})${a.asset ? ` ${a.asset}` : ''}`;
    case 'eraseFloor':
      return `✖️ Floor (${a.x},${a.z})`;
    case 'placeWall':
      return `🧱 Wall (${a.x},${a.z},${a.dir})${a.kind && a.kind !== 'wall' ? ` ${a.kind}` : ''}${a.asset ? ` ${a.asset}` : ''}`;
    case 'eraseWall':
      return `✖️ Wall (${a.x},${a.z},${a.dir})`;
    case 'placeRoof':
      return `🏠 Roof (${a.x},${a.z}${a.y ? `,L${a.y}` : ''})${a.asset ? ` ${a.asset}` : ''}`;
    case 'eraseRoof':
      return `✖️ Roof (${a.x},${a.z})`;
    case 'placeCorner':
      return `◧ Corner (${a.x},${a.z})${a.asset ? ` ${a.asset}` : ''}`;
    case 'eraseCorner':
      return `✖️ Corner (${a.x},${a.z})`;
    case 'placeStairs':
      return `🪜 Stairs (${a.x},${a.z},${a.facing})${a.asset ? ` ${a.asset}` : ''}`;
    case 'eraseStairs':
      return `✖️ Stairs (${a.x},${a.z},${a.facing})`;
    case 'clearBuilding':
      return '🧹 Clear building';
    case 'setSelectedPiece':
      return `🎨 ${a.kind} → ${a.asset}`;
    case 'setFloorAsset':
      return `🎨 Floor asset → ${a.asset}`;
    case 'setWallAsset':
      return `🎨 Wall asset → ${a.asset}`;
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Chat intent pill — "scene" talks to the studio-agent (builds the 3D
  // world); "part" routes to Part Studio where low-poly assets are
  // generated, rated, and refined. The pill stays visible on the input
  // row so the user always sees what "Build" is going to do.
  const chatMode = useStudio((s) => s.chatMode);
  const setChatMode = useStudio((s) => s.setChatMode);
  const setRightPanelGroup = useStudio((s) => s.setRightPanelGroup);
  const setPartsActiveTab = useStudio((s) => s.setPartsActiveTab);
  const setDraftPrompt = usePartStudio((s) => s.setDraftPrompt);

  // 3D Freeform chat routes to /api/freeform3d-agent instead of
  // /api/studio-agent so the model speaks in prefab kinds rather than
  // grid tiles. The routing decision is a simple equality check below.
  const gameSystem = useStudio((s) => s.gameSystem);

  // Scene/building store actions (stable references)
  const addPart = useSceneStore((s) => s.addPart);
  const updateSceneObject = useSceneStore((s) => s.updateSceneObject);
  const removePart = useSceneStore((s) => s.removePart);
  const setSceneObjects = useSceneStore((s) => s.setSceneObjects);

  const placeFloor = useBuildingStore((s) => s.placeFloor);
  const eraseFloor = useBuildingStore((s) => s.eraseFloor);
  const placeWall = useBuildingStore((s) => s.placeWall);
  const eraseWall = useBuildingStore((s) => s.eraseWall);
  const placeRoof = useBuildingStore((s) => s.placeRoof);
  const eraseRoof = useBuildingStore((s) => s.eraseRoof);
  const placeCorner = useBuildingStore((s) => s.placeCorner);
  const eraseCorner = useBuildingStore((s) => s.eraseCorner);
  const placeStairs = useBuildingStore((s) => s.placeStairs);
  const eraseStairs = useBuildingStore((s) => s.eraseStairs);
  const clearBuilding = useBuildingStore((s) => s.clear);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, statuses, streaming]);

  const applyAction = useCallback(
    (action: StudioAction) => {
      switch (action.type) {
        case 'addPart':
          addPart({
            name: action.name,
            partType: action.partType,
            position: action.position,
            rotation: action.rotation,
            scale: action.scale,
            color: action.color,
            modelName: action.modelName,
          });
          break;
        case 'updatePart': {
          const changes: Partial<ScenePart> = {};
          if (action.name !== undefined) changes.name = action.name;
          if (action.position) changes.position = action.position;
          if (action.rotation) changes.rotation = action.rotation;
          if (action.scale) changes.scale = action.scale;
          if (action.color) changes.color = action.color;
          updateSceneObject(action.id, changes);
          break;
        }
        case 'removePart':
          removePart(action.id);
          break;
        case 'clearParts':
          setSceneObjects([]);
          break;

        case 'placeFloor':
          placeFloor(action.x, action.y ?? 0, action.z, action.asset);
          break;
        case 'eraseFloor':
          eraseFloor(action.x, action.y ?? 0, action.z);
          break;

        case 'placeWall':
          placeWall(action.x, action.y ?? 0, action.z, action.dir, action.kind, action.asset);
          break;
        case 'eraseWall':
          eraseWall(action.x, action.y ?? 0, action.z, action.dir);
          break;

        case 'placeRoof':
          placeRoof(action.x, action.y ?? 0, action.z, action.asset);
          break;
        case 'eraseRoof':
          eraseRoof(action.x, action.y ?? 0, action.z);
          break;

        case 'placeCorner':
          placeCorner(action.x, action.y ?? 0, action.z, action.kind, action.asset);
          break;
        case 'eraseCorner':
          eraseCorner(action.x, action.y ?? 0, action.z);
          break;

        case 'placeStairs':
          placeStairs(action.x, action.y ?? 0, action.z, action.facing, action.asset);
          break;
        case 'eraseStairs':
          eraseStairs(action.x, action.y ?? 0, action.z, action.facing);
          break;

        case 'clearBuilding':
          clearBuilding();
          break;

        case 'setSelectedPiece':
          setSelectedPiece(action.kind, action.asset);
          break;
        case 'setFloorAsset':
          setSelectedPiece('floor', action.asset);
          break;
        case 'setWallAsset':
          setSelectedPiece('wall', action.asset);
          break;
      }
    },
    [
      addPart,
      updateSceneObject,
      removePart,
      setSceneObjects,
      placeFloor,
      eraseFloor,
      placeWall,
      eraseWall,
      placeRoof,
      eraseRoof,
      placeCorner,
      eraseCorner,
      placeStairs,
      eraseStairs,
      clearBuilding,
      setSelectedPiece,
    ],
  );

  /**
   * Apply one action from the /api/freeform3d-agent stream. Reads the
   * freeform3d-store at call time instead of subscribing so this
   * callback never re-renders the chat when the 3D scene changes.
   */
  const applyFreeform3DAction = useCallback((action: Freeform3DAction) => {
    const s = useFreeform3D.getState();
    switch (action.type) {
      case 'addPrefab': {
        // Accept the agent's id only if it passes a tight safe-chars
        // check AND isn't already taken. The store double-guards by
        // minting a fresh id on collision, so this is UX polish
        // (avoids silently losing an id the agent counts on).
        const safeId = /^[a-zA-Z0-9_-]{1,40}$/.test(action.id ?? '')
          ? action.id
          : undefined;
        const existing = useFreeform3D.getState().scene.objects;
        const finalId = safeId && !existing.some((o) => o.id === safeId) ? safeId : undefined;
        s.addPrefabFull(action.kind, {
          id: finalId,
          position: action.position,
          rotation: action.rotation,
          scale: action.scale,
          color: action.color,
          props: action.props,
        });
        break;
      }
      case 'updatePrefab': {
        const patch: Record<string, unknown> = {};
        if (action.position) patch.position = action.position;
        if (action.rotation) patch.rotation = action.rotation;
        if (action.scale) patch.scale = action.scale;
        if (action.color) patch.color = action.color;
        if (action.props) patch.props = action.props;
        s.updateObject(action.id, patch as never);
        break;
      }
      case 'removePrefab':
        s.removeObject(action.id);
        break;
      case 'clearScene':
        s.clearScene();
        break;

      // --- Tycoon scripting (slice 4/6) ---
      case 'defineVariable':
        s.defineVariable({
          name: action.name,
          initial: action.initial,
          serverside: action.serverside,
          label: action.label,
        });
        break;
      case 'removeVariable':
        s.removeVariable(action.name);
        break;
      case 'addBehavior':
        // The store's attachBehavior rejects unknown prefabIds silently
        // (see game-logic.ts) — that's intentional so a stale agent ref
        // doesn't crash the apply loop. We pass the action through as-is;
        // the runtime is the single source of validation.
        s.attachBehavior(action.prefabId, {
          on: action.on,
          action: action.action as never,
          interval: action.interval,
        });
        break;
      case 'clearBehaviors':
        s.clearBehaviors(action.prefabId);
        break;
      case 'defineUpgrade':
        s.defineUpgrade({
          id: action.id,
          label: action.label,
          cost: action.cost,
          effect: action.effect as never,
        });
        break;
      case 'removeUpgrade':
        s.removeUpgrade(action.id);
        break;
      case 'addHUD':
        // Map the wire format's hudType back into the store's `type`
        // discriminator. Only the three known shapes get through;
        // anything else is dropped.
        if (action.hudType === 'coinCounter') {
          s.addHUDElement({
            id: action.id,
            type: 'coinCounter',
            bind: action.bind ?? 'coins',
            anchor: action.anchor,
          });
        } else if (action.hudType === 'inventory') {
          s.addHUDElement({
            id: action.id,
            type: 'inventory',
            anchor: action.anchor,
            title: action.title,
          });
        } else if (action.hudType === 'upgradePanel') {
          s.addHUDElement({
            id: action.id,
            type: 'upgradePanel',
            anchor: action.anchor,
            title: action.title,
          });
        }
        break;
      case 'removeHUD':
        s.removeHUDElement(action.id);
        break;
      case 'setScript':
        if (typeof action.source === 'string') s.setScript(action.source);
        break;
    }
  }, []);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    // Part mode: don't stream actions — hand the prompt to Part Studio
    // which runs its own generation + rating loop. Switch the left panel
    // to the Part Studio tab with the prompt pre-filled on its Generate
    // sub-tab so the user can just hit Generate.
    if (chatMode === 'part') {
      setDraftPrompt(trimmed);
      setInput('');
      // Part Studio now lives on the right-panel dropdown.
      setRightPanelGroup('parts');
      setPartsActiveTab('generate');
      return;
    }

    // Two back-ends: the 3D Freeform agent (prefab scene) and the legacy
    // studio agent (free parts + grid tiles). Both emit line-delimited
    // ACTION events over the same SSE shape, so only the endpoint, the
    // snapshot payload, and the apply function differ.
    const isFreeform3D = gameSystem === '3d-freeform';

    let endpoint: string;
    let snapshot: unknown;

    if (isFreeform3D) {
      const f3d = useFreeform3D.getState();
      snapshot = {
        activeStyle: f3d.activeStyle,
        objects: f3d.scene.objects.map((o) => ({
          id: o.id,
          kind: o.kind,
          position: o.position,
          rotation: o.rotation,
          scale: o.scale,
          color: o.color,
          props: o.props,
          // Slice 4 — surface attached behaviors so the agent can edit
          // (clearBehaviors before re-attaching) instead of duplicating.
          behaviors: o.behaviors,
        })),
        // Slice 4 — variables/upgrades/hud declared so far so the agent
        // doesn't re-define what's already in place.
        gameLogic: f3d.scene.gameLogic ?? { variables: {}, upgrades: {}, hud: [] },
      };
      endpoint = '/api/freeform3d-agent';
    } else {
      const sceneState = useSceneStore.getState();
      const b = useBuildingStore.getState();
      const mode = useAIBuildModeStore.getState().mode;
      snapshot = {
        parts: sceneState.sceneObjects.map((p) => ({
          id: p.id,
          name: p.name,
          partType: p.partType,
          position: p.position,
          color: p.color,
          scale: p.scale,
        })),
        floors: Object.keys(b.floors),
        walls: Object.keys(b.walls),
        roofs: Object.keys(b.roofs),
        corners: Object.keys(b.corners),
        stairs: Object.keys(b.stairs),
        gridSize: b.gridSize,
        selectedPiece: b.selectedPiece,
        buildMode: mode,
      };
      endpoint = '/api/studio-agent';
    }

    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    setStatuses([]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, scene: snapshot }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${res.status} — ${errText.slice(0, 200)}`,
          };
          return updated;
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const dataLines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of dataLines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.status) {
              setStatuses((prev) => [...prev, parsed.status]);
            }

            if (parsed.action) {
              if (isFreeform3D) {
                const action = parsed.action as Freeform3DAction;
                applyFreeform3DAction(action);
                setStatuses((prev) => [...prev, shortDescribeFreeform3D(action)]);
              } else {
                const action = parsed.action as StudioAction;
                applyAction(action);
                setStatuses((prev) => [...prev, shortDescribe(action)]);
              }
            }

            if (parsed.text) {
              assistantText += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantText.trim(),
                };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatuses((prev) => [...prev, '(cancelled)']);
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [
    input,
    streaming,
    messages,
    applyAction,
    applyFreeform3DAction,
    chatMode,
    gameSystem,
    setDraftPrompt,
    setRightPanelGroup,
    setPartsActiveTab,
  ]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const showEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message history */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 select-text">
        {showEmpty ? (
          <EmptyChatHint chatMode={chatMode} onPick={(p) => setInput(p)} />
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const isEmptyStreaming =
                streaming && isLast && msg.role === 'assistant' && !msg.content;
              // Hide trailing empty assistant bubble when we're only getting actions (no text yet)
              if (msg.role === 'assistant' && !msg.content && !isEmptyStreaming) return null;
              return (
                <div
                  key={i}
                  className="whitespace-pre-wrap break-words"
                  style={
                    msg.role === 'user'
                      ? {
                          marginLeft: 'auto',
                          maxWidth: '90%',
                          borderRadius: 12,
                          background: 'var(--pb-mint)',
                          border: '1.5px solid var(--pb-mint-ink)',
                          boxShadow: '0 2px 0 var(--pb-mint-ink)',
                          padding: '8px 11px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'var(--pb-mint-ink)',
                        }
                      : {
                          marginRight: 'auto',
                          maxWidth: '95%',
                          borderRadius: 12,
                          background: 'var(--pb-paper)',
                          border: '1.5px solid var(--pb-line-2)',
                          padding: '8px 11px',
                          fontSize: 13,
                          color: 'var(--pb-ink)',
                          lineHeight: 1.45,
                        }
                  }
                >
                  {isEmptyStreaming ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 14,
                        background: 'var(--pb-grape-ink)',
                        verticalAlign: 'text-bottom',
                      }}
                      className="animate-pulse"
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              );
            })}
            {statuses.length > 0 && (
              <div className="space-y-0.5 pt-1">
                {statuses.map((s, i) => (
                  <div
                    key={i}
                    className="whitespace-pre-wrap"
                    style={{
                      fontSize: 11,
                      color: 'var(--pb-mint-ink)',
                      fontFamily: 'DM Mono, monospace',
                    }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div
        className="shrink-0 px-3 pb-3 pt-2 space-y-2"
        style={{ borderTop: '1.5px solid var(--pb-line-2)' }}
      >
        {/* Intent pill row — selects whether "Build" routes to the scene
            agent or opens the full-screen Part Studio. */}
        <ChatIntentPill value={chatMode} onChange={setChatMode} disabled={streaming} />

        <PanelTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder={
            streaming
              ? 'Generating… press cancel to stop'
              : chatMode === 'part'
                ? 'Describe a low-poly asset… (e.g. "a knight with a red cape")'
                : 'Tell the AI what to build…'
          }
          rows={3}
          showCount
          disabled={streaming}
        />
        <div className="flex items-stretch gap-2">
          <ChatAssetPicker />
          <div className="flex-1">
            {streaming ? (
              <PanelActionButton onClick={cancel} variant="destructive" icon={Square} fullWidth>
                Cancel
              </PanelActionButton>
            ) : (
              <PanelActionButton
                onClick={send}
                variant="primary"
                icon={chatMode === 'part' ? Box : Sparkles}
                fullWidth
                disabled={!input.trim()}
              >
                {chatMode === 'part' ? 'Generate Part' : 'Build'}
              </PanelActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MiniChatHint — ported from design bundle's leftpanel.jsx. Shows quick-start
// prompt chips so users don't stare at a blank box on first open. Clicking
// a chip drops it into the input (not auto-send) so they can tweak first.
const SCENE_PROMPTS = [
  'build a red brick house with a gable roof',
  'place a spiral staircase at 0,0',
  'add a second-floor window above the door',
  'fill the room with medieval furniture',
];

const PART_PROMPTS = [
  'a knight with a red cape',
  'a glowing lantern',
  'a stone well with moss',
  'a wooden treasure chest',
];

function EmptyChatHint({
  chatMode,
  onPick,
}: {
  chatMode: 'scene' | 'part';
  onPick: (prompt: string) => void;
}) {
  const prompts = chatMode === 'part' ? PART_PROMPTS : SCENE_PROMPTS;
  const heading = chatMode === 'part' ? 'Generate a part' : 'Jump into Claude';
  const sub =
    chatMode === 'part'
      ? 'Describe a low-poly asset and Claude will generate it. Try one to get started:'
      : 'Ask Claude to change anything about your scene. Try one of these to get started:';

  return (
    <div style={{ padding: '4px 4px 0' }}>
      <SectionLabel>{heading}</SectionLabel>
      <div
        style={{
          fontSize: 12,
          color: 'var(--pb-ink-soft)',
          lineHeight: 1.45,
          marginBottom: 12,
        }}
      >
        {sub}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {prompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            style={{
              textAlign: 'left',
              padding: '9px 11px',
              borderRadius: 10,
              background: 'var(--pb-cream-2)',
              border: '1.5px solid var(--pb-line-2)',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--pb-ink)',
              lineHeight: 1.3,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Sparkles
              size={10}
              style={{ marginRight: 6, color: 'var(--pb-grape-ink)', verticalAlign: '-1px' }}
            />
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatIntentPill({
  value,
  onChange,
  disabled,
}: {
  value: 'scene' | 'part';
  onChange: (v: 'scene' | 'part') => void;
  disabled?: boolean;
}) {
  const options: { id: 'scene' | 'part'; label: string; icon: typeof Layers }[] = [
    { id: 'scene', label: 'Scene', icon: Layers },
    { id: 'part',  label: 'Generate Part', icon: Box },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {options.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className="inline-flex items-center gap-1.5"
            style={{
              padding: '4px 11px',
              height: 28,
              borderRadius: 999,
              fontSize: 11.5,
              fontWeight: 700,
              fontFamily: 'inherit',
              background: active ? 'var(--pb-mint)' : 'var(--pb-paper)',
              border: `1.5px solid ${active ? 'var(--pb-mint-ink)' : 'var(--pb-line-2)'}`,
              color: active ? 'var(--pb-mint-ink)' : 'var(--pb-ink-soft)',
              boxShadow: active ? '0 2px 0 var(--pb-mint-ink)' : 'none',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 120ms ease, border-color 120ms ease',
            }}
          >
            <Icon size={12} strokeWidth={2.4} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
