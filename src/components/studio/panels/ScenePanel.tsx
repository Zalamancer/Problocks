'use client';
import { useRef, useState } from 'react';
import { Box, Circle, Cylinder, Triangle, Search, ChevronDown, ChevronRight, Folder, FileCode } from 'lucide-react';
import { useSceneStore, type ScenePart, type PartType } from '@/store/scene-store';
import { useStudio } from '@/store/studio-store';

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
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [scriptsOpen, setScriptsOpen] = useState(true);
  const renameRef = useRef<HTMLInputElement>(null);

  // Scripts live in the active game (Problocks Game Engine modular files).
  // These are conceptually the equivalent of ServerScriptService in Roblox
  // — runtime code that belongs to the scene, not the asset marketplace.
  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;

  const q = query.trim().toLowerCase();
  const filteredParts = q
    ? sceneObjects.filter((o) => o.name.toLowerCase().includes(q))
    : sceneObjects;

  const allScripts = activeGame?.files
    ? Object.keys(activeGame.files).sort((a, b) => {
        if (a === 'config.js') return -1;
        if (b === 'config.js') return 1;
        return a.localeCompare(b);
      })
    : [];
  const filteredScripts = q ? allScripts.filter((n) => n.toLowerCase().includes(q)) : allScripts;

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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter scene…"
            className="flex-1 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-600 hover:text-zinc-300 text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-3">
        {/* Workspace (parts) */}
        <SectionHeader
          icon={<Folder size={12} className="text-blue-400" />}
          label="Workspace"
          count={filteredParts.length}
          open={workspaceOpen}
          onToggle={() => setWorkspaceOpen(!workspaceOpen)}
        />
        {workspaceOpen && (
          <div className="pl-3">
            {filteredParts.length === 0 ? (
              <div className="text-center py-3 text-zinc-600 text-xs">No parts</div>
            ) : (
              filteredParts.map((part) => (
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
                  <span
                    className="w-3 h-3 rounded-sm shrink-0 ring-1 ring-white/10"
                    style={{ background: part.color }}
                  />
                  <span className="shrink-0 opacity-50">{TYPE_ICON[part.partType]}</span>
                  {renameId === part.id ? (
                    <input
                      ref={renameRef}
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={() => commitRename(part.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(part.id);
                        if (e.key === 'Escape') setRenameId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-zinc-800 border border-accent/50 rounded px-1 text-xs text-zinc-100 outline-none"
                    />
                  ) : (
                    <span className="flex-1 min-w-0 text-xs truncate">{part.name}</span>
                  )}
                  <span className="text-zinc-700 text-[10px] shrink-0 group-hover:text-zinc-500 transition-colors">
                    {part.partType}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ServerScriptService-style Scripts */}
        {allScripts.length > 0 && (
          <>
            <SectionHeader
              icon={<FileCode size={12} className="text-emerald-400" />}
              label="Scripts"
              count={filteredScripts.length}
              open={scriptsOpen}
              onToggle={() => setScriptsOpen(!scriptsOpen)}
            />
            {scriptsOpen && (
              <div className="pl-3">
                {filteredScripts.length === 0 ? (
                  <div className="text-center py-3 text-zinc-600 text-xs">No matches</div>
                ) : (
                  filteredScripts.map((name) => (
                    <div
                      key={name}
                      onClick={() => setOpenFileName(openFileName === name ? null : name)}
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 cursor-pointer transition-all ${
                        openFileName === name
                          ? 'bg-accent/15 border border-accent/25 text-accent'
                          : 'hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <FileCode size={12} className="shrink-0 opacity-60" />
                      <span className="flex-1 min-w-0 text-xs truncate font-mono">{name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  open: boolean;
  onToggle: () => void;
}

function SectionHeader({ icon, label, count, open, onToggle }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1.5 px-2 py-1.5 text-zinc-300 hover:text-zinc-100 transition-colors"
    >
      {open ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronRight size={12} className="text-zinc-500" />}
      {icon}
      <span className="flex-1 text-left text-xs font-medium">{label}</span>
      <span className="text-zinc-600 text-[10px] font-mono">{count}</span>
    </button>
  );
}
