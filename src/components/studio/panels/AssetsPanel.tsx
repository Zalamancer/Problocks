'use client';
import { useState } from 'react';
import { FolderOpen, Gamepad2, Trash2 } from 'lucide-react';
import { PanelSearchInput, PanelDropZone, PanelSection } from '@/components/ui';
import { useStudio } from '@/store/studio-store';

/** Format a timestamp as a relative time string (e.g. "2m ago", "1h ago") */
function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AssetsPanel() {
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);
  const removeGame = useStudio((s) => s.removeGame);

  const filtered = games.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-3 py-2">
        <PanelSearchInput value={search} onChange={setSearch} placeholder="Search games..." />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        {sorted.length > 0 ? (
          <PanelSection
            title="Generated Games"
            icon={Gamepad2}
            badge={sorted.length}
            collapsible
            noBorder
          >
            <div className="flex flex-col gap-0.5">
              {sorted.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGameId(game.id)}
                  className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    activeGameId === game.id
                      ? 'bg-accent/10 border border-accent/20'
                      : 'bg-panel-surface hover:bg-panel-surface-hover border border-transparent'
                  }`}
                >
                  <Gamepad2
                    size={14}
                    className={`shrink-0 ${
                      activeGameId === game.id ? 'text-accent' : 'text-zinc-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-300 truncate">{game.name}</div>
                    <div className="text-[10px] text-zinc-600">{relativeTime(game.updatedAt)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGame(game.id);
                    }}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Delete game"
                  >
                    <Trash2 size={12} />
                  </button>
                </button>
              ))}
            </div>
          </PanelSection>
        ) : (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center">
              <Gamepad2 size={24} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-xs text-zinc-600">
                {search ? 'No matching games' : 'No games yet'}
              </p>
              <p className="text-[10px] text-zinc-700 mt-1">
                Use the Terminal to generate a game
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <PanelDropZone
          icon={FolderOpen}
          label="Drop files here"
          sublabel="Images, audio & 3D models"
          isDragging={isDragging}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
}
