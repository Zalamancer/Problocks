'use client';
import { useRef, useState } from 'react';
import { Box, Circle, Cylinder, Triangle, Search } from 'lucide-react';
import { useSceneStore, type ScenePart, type PartType } from '@/store/scene-store';

const TYPE_ICON: Record<PartType, React.ReactNode> = {
  Block:    <Box size={12} />,
  Sphere:   <Circle size={12} />,
  Cylinder: <Cylinder size={12} />,
  Wedge:    <Triangle size={12} />,
};

interface Props {
  onSelect: (id: string) => void;
}

export function ScenePanel({ onSelect }: Props) {
  const { sceneObjects, selectedPart } = useSceneStore();
  const [query, setQuery] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? sceneObjects.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
    : sceneObjects;

  function startRename(part: ScenePart) {
    setRenameId(part.id);
    setRenameVal(part.name);
    setTimeout(() => renameRef.current?.focus(), 50);
  }

  function commitRename(id: string) {
    if (renameVal.trim()) {
      useSceneStore.getState().updateSceneObject(id, { name: renameVal.trim() });
    }
    setRenameId(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="shrink-0 px-3 py-2">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-800/60 rounded-lg border border-white/[0.06]">
          <Search size={12} className="text-zinc-500 shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter parts…"
            className="flex-1 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-zinc-300 text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="shrink-0 px-3 pb-1 flex items-center justify-between">
        <span className="text-zinc-600 text-xs">{filtered.length} part{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 && (
          <div className="text-center py-8 text-zinc-600 text-xs">No parts yet</div>
        )}
        {filtered.map(part => (
          <div
            key={part.id}
            onClick={() => onSelect(part.id)}
            onDoubleClick={() => startRename(part)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 cursor-pointer transition-all ${
              selectedPart?.id === part.id
                ? 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-300'
                : 'hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {/* Color dot */}
            <span
              className="w-3 h-3 rounded-sm shrink-0 ring-1 ring-white/10"
              style={{ background: part.color }}
            />

            {/* Type icon */}
            <span className="shrink-0 opacity-50">{TYPE_ICON[part.partType]}</span>

            {/* Name or rename input */}
            {renameId === part.id ? (
              <input
                ref={renameRef}
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onBlur={() => commitRename(part.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename(part.id);
                  if (e.key === 'Escape') setRenameId(null);
                }}
                onClick={e => e.stopPropagation()}
                className="flex-1 min-w-0 bg-zinc-800 border border-accent/50 rounded px-1 text-xs text-zinc-100 outline-none"
              />
            ) : (
              <span className="flex-1 min-w-0 text-xs truncate">{part.name}</span>
            )}

            {/* Part type badge */}
            <span className="text-zinc-700 text-[10px] shrink-0 group-hover:text-zinc-500 transition-colors">
              {part.partType}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
