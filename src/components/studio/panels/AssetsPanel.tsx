'use client';
import { useState } from 'react';
import { FolderOpen, Gamepad2, Trash2, FileCode, FileText, Image, ChevronRight, ChevronDown } from 'lucide-react';
import { PanelSearchInput, PanelDropZone, PanelSection } from '@/components/ui';
import { useStudio } from '@/store/studio-store';

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

interface VirtualFile {
  name: string;
  type: 'html' | 'script' | 'style' | 'asset';
  lines: number;
}

function extractFileTree(html: string): VirtualFile[] {
  const files: VirtualFile[] = [];

  files.push({ name: 'index.html', type: 'html', lines: html.split('\n').length });

  const scriptMatches = [...html.matchAll(/<script(?:\s[^>]*)?>(?![\s]*$)([\s\S]*?)<\/script>/gi)];
  const inlineScripts = scriptMatches.filter((m) => !/<script\s+src=/i.test(m[0]));
  if (inlineScripts.length > 0) {
    const jsContent = inlineScripts.map((m) => m[1].trim()).join('\n');
    files.push({ name: 'game.js', type: 'script', lines: jsContent.split('\n').length });
  }

  const styleMatches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  if (styleMatches.length > 0) {
    const cssContent = styleMatches.map((m) => m[1].trim()).join('\n');
    files.push({ name: 'styles.css', type: 'style', lines: cssContent.split('\n').length });
  }

  const cdnMatches = [...html.matchAll(/<script\s+src="([^"]*)"/gi)];
  cdnMatches.forEach((m) => {
    const name = m[1].split('/').pop()?.split('?')[0] || 'cdn-lib.js';
    files.push({ name, type: 'script', lines: 0 });
  });

  return files;
}

/** Build file tree from real multi-file game files (sorted: config.js first, then alphabetical) */
function buildMultiFileTree(files: Record<string, string>): VirtualFile[] {
  const names = Object.keys(files);
  const sorted = names.sort((a, b) => {
    if (a === 'config.js') return -1;
    if (b === 'config.js') return 1;
    return a.localeCompare(b);
  });

  return sorted.map((name) => {
    let type: VirtualFile['type'] = 'asset';
    if (name.endsWith('.js')) type = 'script';
    else if (name.endsWith('.css')) type = 'style';
    else if (name.endsWith('.html')) type = 'html';
    const lines = files[name].split('\n').length;
    return { name, type, lines };
  });
}

const FILE_ICONS = { html: FileCode, script: FileCode, style: FileText, asset: Image } as const;
const FILE_COLORS = { html: 'text-orange-400', script: 'text-yellow-400', style: 'text-blue-400', asset: 'text-purple-400' } as const;

export function AssetsPanel() {
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);
  const removeGame = useStudio((s) => s.removeGame);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);

  const filtered = games.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-3 py-2">
        <PanelSearchInput value={search} onChange={setSearch} placeholder="Search games..." />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        {sorted.length > 0 ? (
          <PanelSection title="Generated Games" icon={Gamepad2} badge={sorted.length} collapsible noBorder>
            <div className="flex flex-col gap-0.5">
              {sorted.map((game) => {
                const isActive = activeGameId === game.id;
                const isExpanded = expandedGameId === game.id;
                const hasRealFiles = game.files && Object.keys(game.files).length > 0;
                const fileTree = isExpanded
                  ? (hasRealFiles ? buildMultiFileTree(game.files!) : extractFileTree(game.html))
                  : [];

                return (
                  <div key={game.id}>
                    <button
                      onClick={() => {
                        setActiveGameId(game.id);
                        setExpandedGameId(isExpanded ? null : game.id);
                        setOpenFileName(null);
                      }}
                      className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isActive ? 'bg-accent/10 border border-accent/20' : 'bg-panel-surface hover:bg-panel-surface-hover border border-transparent'
                      }`}
                    >
                      {isExpanded
                        ? <ChevronDown size={12} className="shrink-0 text-zinc-500" />
                        : <ChevronRight size={12} className="shrink-0 text-zinc-500" />}
                      <Gamepad2 size={14} className={`shrink-0 ${isActive ? 'text-accent' : 'text-zinc-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-300 truncate">{game.name}</div>
                        <div className="text-[10px] text-zinc-600">{relativeTime(game.updatedAt)}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeGame(game.id); }}
                        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Delete game"
                      >
                        <Trash2 size={12} />
                      </button>
                    </button>

                    {isExpanded && (
                      <div className="ml-5 mt-0.5 mb-1 border-l border-white/[0.06] pl-2">
                        {fileTree.map((file, fi) => {
                          const Icon = FILE_ICONS[file.type];
                          const color = FILE_COLORS[file.type];
                          const isOpen = openFileName === file.name;
                          return (
                            <button
                              key={fi}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenFileName(isOpen ? null : file.name);
                              }}
                              className={`w-full flex items-center gap-2 py-1.5 px-2 rounded text-xs cursor-pointer transition-colors ${
                                isOpen ? 'bg-accent/10 text-zinc-200' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                              }`}
                            >
                              <Icon size={12} className={`shrink-0 ${color}`} />
                              <span className="truncate flex-1 text-left">{file.name}</span>
                              {file.lines > 0 && (
                                <span className="shrink-0 text-[10px] text-zinc-600">{file.lines}L</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PanelSection>
        ) : (
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="text-center">
              <Gamepad2 size={24} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-xs text-zinc-600">{search ? 'No matching games' : 'No games yet'}</p>
              <p className="text-[10px] text-zinc-700 mt-1">Use the Terminal to generate a game</p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3">
        <PanelDropZone
          icon={FolderOpen} label="Drop files here" sublabel="Images, audio & 3D models"
          isDragging={isDragging}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
}
