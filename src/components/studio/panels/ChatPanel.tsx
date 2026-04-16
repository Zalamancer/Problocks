'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, Square } from 'lucide-react';
import { PanelTextarea, PanelActionButton } from '@/components/ui';
import { useSceneStore, type PartType, type ScenePart } from '@/store/scene-store';
import { useBuildingStore, type EdgeDir } from '@/store/building-store';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type StudioAction =
  | {
      type: 'addPart';
      name?: string;
      partType?: PartType;
      position?: { x: number; y: number; z: number };
      rotation?: { x: number; y: number; z: number };
      scale?: { x: number; y: number; z: number };
      color?: string;
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
  | { type: 'placeFloor'; x: number; z: number }
  | { type: 'eraseFloor'; x: number; z: number }
  | { type: 'placeWall'; x: number; z: number; dir: EdgeDir }
  | { type: 'eraseWall'; x: number; z: number; dir: EdgeDir }
  | { type: 'clearBuilding' }
  | { type: 'setFloorAsset'; asset: string }
  | { type: 'setWallAsset'; asset: string };

function shortDescribe(a: StudioAction): string {
  switch (a.type) {
    case 'addPart':
      return `➕ Part${a.name ? ` "${a.name}"` : ''}${a.color ? ` ${a.color}` : ''}`;
    case 'updatePart':
      return `✏️ Update ${a.id}`;
    case 'removePart':
      return `🗑️ Remove ${a.id}`;
    case 'clearParts':
      return '🧹 Clear parts';
    case 'placeFloor':
      return `🟫 Floor (${a.x},${a.z})`;
    case 'eraseFloor':
      return `✖️ Floor (${a.x},${a.z})`;
    case 'placeWall':
      return `🧱 Wall (${a.x},${a.z},${a.dir})`;
    case 'eraseWall':
      return `✖️ Wall (${a.x},${a.z},${a.dir})`;
    case 'clearBuilding':
      return '🧹 Clear building';
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

  // Scene/building store actions (read stably via getState inside callback)
  const addPart = useSceneStore((s) => s.addPart);
  const updateSceneObject = useSceneStore((s) => s.updateSceneObject);
  const removePart = useSceneStore((s) => s.removePart);
  const setSceneObjects = useSceneStore((s) => s.setSceneObjects);

  const placeFloor = useBuildingStore((s) => s.placeFloor);
  const eraseFloor = useBuildingStore((s) => s.eraseFloor);
  const placeWall = useBuildingStore((s) => s.placeWall);
  const eraseWall = useBuildingStore((s) => s.eraseWall);
  const clearBuilding = useBuildingStore((s) => s.clear);
  const setFloorAsset = useBuildingStore((s) => s.setFloorAsset);
  const setWallAsset = useBuildingStore((s) => s.setWallAsset);

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
          placeFloor(action.x, action.z);
          break;
        case 'eraseFloor':
          eraseFloor(action.x, action.z);
          break;
        case 'placeWall':
          placeWall(action.x, action.z, action.dir);
          break;
        case 'eraseWall':
          eraseWall(action.x, action.z, action.dir);
          break;
        case 'clearBuilding':
          clearBuilding();
          break;
        case 'setFloorAsset':
          setFloorAsset(action.asset);
          break;
        case 'setWallAsset':
          setWallAsset(action.asset);
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
      clearBuilding,
      setFloorAsset,
      setWallAsset,
    ],
  );

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    // Snapshot current scene state for the agent
    const sceneState = useSceneStore.getState();
    const buildingState = useBuildingStore.getState();
    const snapshot = {
      parts: sceneState.sceneObjects.map((p) => ({
        id: p.id,
        name: p.name,
        partType: p.partType,
        position: p.position,
        color: p.color,
        scale: p.scale,
      })),
      floors: Object.keys(buildingState.floors),
      walls: Object.keys(buildingState.walls),
      gridSize: buildingState.gridSize,
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
  }, [input, streaming, messages, applyAction]);

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
                e.g. &ldquo;place 5 red blocks in a row&rdquo; &middot; &ldquo;build a 4x4 floor&rdquo;
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
        <PanelTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder={
            streaming ? 'Generating… press cancel to stop' : 'Tell the AI what to build…'
          }
          rows={3}
          showCount
          disabled={streaming}
        />
        {streaming ? (
          <PanelActionButton onClick={cancel} variant="destructive" icon={Square} fullWidth>
            Cancel
          </PanelActionButton>
        ) : (
          <PanelActionButton
            onClick={send}
            variant="primary"
            icon={Sparkles}
            fullWidth
            disabled={!input.trim()}
          >
            Build
          </PanelActionButton>
        )}
      </div>
    </div>
  );
}
