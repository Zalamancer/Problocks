'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, Square, Layers, Box } from 'lucide-react';
import { PanelTextarea, PanelActionButton } from '@/components/ui';
import { useSceneStore, type PartType, type ScenePart } from '@/store/scene-store';
import { useBuildingStore, type EdgeDir, type Facing } from '@/store/building-store';
import type { PieceKind } from '@/lib/building-kit';
import { ChatAssetPicker } from './ChatAssetPicker';
import { useAIBuildModeStore } from '@/store/ai-library-store';
import { useStudio } from '@/store/studio-store';
import { usePartStudio } from '@/store/part-studio-store';

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
  const setLeftPanelGroup = useStudio((s) => s.setLeftPanelGroup);
  const setPartsActiveTab = useStudio((s) => s.setPartsActiveTab);
  const setDraftPrompt = usePartStudio((s) => s.setDraftPrompt);

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
      setLeftPanelGroup('parts');
      setPartsActiveTab('generate');
      return;
    }

    // Snapshot current scene + building state + build-mode for the agent
    const sceneState = useSceneStore.getState();
    const b = useBuildingStore.getState();
    const mode = useAIBuildModeStore.getState().mode;
    const snapshot = {
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

    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    setStatuses([]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/studio-agent', {
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
              const action = parsed.action as StudioAction;
              applyAction(action);
              setStatuses((prev) => [...prev, shortDescribe(action)]);
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
  }, [input, streaming, messages, applyAction, chatMode, setDraftPrompt, setLeftPanelGroup, setPartsActiveTab]);

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
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={28} className="mx-auto text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">Studio Chat</p>
              <p className="text-xs text-gray-600 mt-1">
                Tell the AI what to build in your workspace
              </p>
              <p className="text-[10px] text-gray-700 mt-2">
                e.g. &ldquo;build a red brick house with a gable roof&rdquo; &middot;
                &ldquo;place a spiral staircase at 0,0&rdquo;
              </p>
            </div>
          </div>
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
                  className={
                    msg.role === 'user'
                      ? 'ml-auto max-w-[90%] rounded-xl bg-accent/15 border border-accent/25 px-3 py-2 text-sm text-zinc-100 whitespace-pre-wrap break-words'
                      : 'mr-auto max-w-[95%] rounded-xl bg-panel-surface border border-panel-border px-3 py-2 text-sm text-zinc-200 whitespace-pre-wrap break-words'
                  }
                >
                  {isEmptyStreaming ? (
                    <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse align-text-bottom" />
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
                    className="text-[11px] text-emerald-400/80 font-mono whitespace-pre-wrap"
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
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-panel-border space-y-2">
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
            className={`inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[11px] font-medium border transition-colors ${
              active
                ? 'bg-accent/15 border-accent/40 text-accent'
                : 'bg-panel-surface border-panel-border text-zinc-400 hover:bg-panel-surface-hover hover:text-zinc-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon size={12} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
