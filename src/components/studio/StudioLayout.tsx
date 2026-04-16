'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, ArrowDown, Terminal, Gamepad2, Box } from 'lucide-react';
import { TopMenuBar } from './TopMenuBar';
import { StudioTerminal } from './Terminal';
import { GamePreview, type GamePreviewHandle, type GameObjectInfo } from './GamePreview';
import { GameToolbar } from './GameToolbar';
import { LeftPanel, LeftPanelToggle } from './LeftPanel';
import { OnboardingWizard } from './modals/OnboardingWizard';
import { TimelineBar } from './views/TimelineBar';
import { KanbanView } from './views/KanbanView';
import { FlowchartView } from './views/FlowchartView';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { useHotkeys } from '@/hooks/useHotkeys';
import { LivePreview } from './views/LivePreview';
import { useStudio } from '@/store/studio-store';
import { CodeView } from './CodeView';
import { useProjectBoard } from '@/store/project-board-store';
import { getTemplate } from '@/lib/templates';
import { getGameHtml } from '@/lib/game-engine';
import { TaskDetailPanel } from './panels/TaskDetailPanel';
import { PartPropertiesPanel } from './panels/PartPropertiesPanel';
import { ExpandedFieldEditor } from './panels/task-sections';
import { useProjectBoard as useBoardStore } from '@/store/project-board-store';
import { resolveEffectiveTask } from '@/lib/templates/types';
import type { TemplateId } from '@/lib/templates/types';
import { useSceneStore, type ScenePart } from '@/store/scene-store';

type ViewMode = 'canvas' | 'kanban' | '3d';

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
        <Sparkles size={24} className="text-accent" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Start a new game project</h2>
        <p className="text-sm text-zinc-500 max-w-xs">
          Pick a workflow template and we'll set up your milestones, tasks, and AI tools automatically.
        </p>
      </div>
      <button
        onClick={onStart}
        className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Choose a template
      </button>
    </div>
  );
}

export function StudioLayout() {
  useThemeEffect();
  const { board } = useProjectBoard();
  const [wizardOpen, setWizardOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const previewRef = useRef<GamePreviewHandle | null>(null);

  // Scene store
  const { selectedPart, setSelectedPart, updateSelectedPart, setSceneObjects } = useSceneStore();

  // Keyboard shortcuts
  useHotkeys({
    'mod+1': () => setViewMode('kanban'),
    'mod+2': () => setViewMode('canvas'),
    'mod+3': () => setViewMode('3d'),
    'mod+j': () => setTerminalOpen((o) => !o),
  });

  const flowDirection = useStudio((s) => s.flowDirection);
  const toggleFlowDirection = useStudio((s) => s.toggleFlowDirection);
  const addGame = useStudio((s) => s.addGame);
  const updateGame = useStudio((s) => s.updateGame);
  const activeGameId = useStudio((s) => s.activeGameId);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);
  const games = useStudio((s) => s.games);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);

  const setTaskOverride = useBoardStore((s) => s.setTaskOverride);
  const updateTaskDescriptionBlocks = useBoardStore((s) => s.updateTaskDescriptionBlocks);
  const updateTaskDeliverableBlocks = useBoardStore((s) => s.updateTaskDeliverableBlocks);
  const addComment = useBoardStore((s) => s.addComment);
  const deleteComment = useBoardStore((s) => s.deleteComment);
  const teamMembers = useBoardStore((s) => s.teamMembers);

  const CURRENT_USER_ID = 'local-user';

  const template = board ? getTemplate(board.templateId) : null;

  function handleWizardComplete(_templateId: TemplateId) {
    setWizardOpen(false);
    setViewMode('kanban');
  }

  const updateGameFiles = useStudio((s) => s.updateGameFiles);

  /** When a game is generated from Terminal, save/update it in the store */
  function handleGameGenerated(html: string, files?: Record<string, string>) {
    if (files) {
      // Multi-file game — store files, generate HTML from bundler for preview
      const bundledHtml = getGameHtml({ files });
      setGameHtml(bundledHtml);
      if (activeGameId) {
        updateGame(activeGameId, bundledHtml);
        updateGameFiles(activeGameId, files);
      } else {
        const titleMatch = bundledHtml.match(/<title>(.*?)<\/title>/i);
        const name = titleMatch?.[1]?.slice(0, 30) || `Game ${games.length + 1}`;
        addGame({ name, prompt: '', html: bundledHtml, files });
      }
    } else {
      // Legacy single-file game
      setGameHtml(html);
      if (activeGameId) {
        updateGame(activeGameId, html);
      } else {
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const name = titleMatch?.[1]?.slice(0, 30) || `Game ${games.length + 1}`;
        addGame({ name, prompt: '', html });
      }
    }
  }

  // Game message handlers
  const handleObjectSelected = useCallback((info: GameObjectInfo & Record<string, unknown>) => {
    setSelectedPart(info as unknown as ScenePart);
  }, [setSelectedPart]);

  const handleObjectDeselected = useCallback(() => {
    setSelectedPart(null);
  }, [setSelectedPart]);

  const handleObjectTransformed = useCallback((info: Omit<GameObjectInfo, 'name' | 'index'> & Record<string, unknown>) => {
    updateSelectedPart(info as unknown as Partial<ScenePart>);
  }, [updateSelectedPart]);

  const handleSceneModels = useCallback((models: GameObjectInfo[]) => {
    setSceneObjects(models as unknown as ScenePart[]);
  }, [setSceneObjects]);

  // Part property update: update store + send to game live
  const handlePartUpdate = useCallback((changes: Partial<ScenePart>) => {
    updateSelectedPart(changes);
    if (selectedPart) {
      previewRef.current?.sendToGame({ type: 'updatePart', id: selectedPart.id, ...changes });
    }
  }, [selectedPart, updateSelectedPart]);

  // Scene hierarchy part select
  const handleSceneSelect = useCallback((id: string) => {
    previewRef.current?.sendToGame({ type: 'selectModel', id });
  }, []);

  // Part delete
  const handlePartDelete = useCallback(() => {
    if (!selectedPart) return;
    previewRef.current?.sendToGame({ type: 'removePart', id: selectedPart.id });
    setSelectedPart(null);
  }, [selectedPart, setSelectedPart]);

  // On first load, if no active game, load the game engine as default
  useEffect(() => {
    if (!activeGameId && games.length === 0) {
      fetch('/game-engine.html')
        .then(r => r.text())
        .then(html => {
          addGame({ name: 'Blocky Village', prompt: 'roblox blocky village', html });
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When activeGameId changes, load game into preview or clear it
  useEffect(() => {
    if (activeGameId) {
      const active = games.find((g) => g.id === activeGameId);
      if (active) {
        if (active.files && Object.keys(active.files).length > 0) {
          setGameHtml(getGameHtml({ files: active.files }));
        } else {
          setGameHtml(active.html);
        }
      }
    } else {
      // New game — clear preview and file viewer
      setGameHtml(null);
      setOpenFileName(null);
    }
  }, [activeGameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clicking the same task again deselects it — matches AutoAnimation's
  // implicit-selection pattern (no close button; you "close" by clicking
  // elsewhere or re-clicking the selected item).
  function handleTaskClick(templateTaskId: string) {
    setSelectedTaskId((prev) => (prev === templateTaskId ? null : templateTaskId));
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden text-zinc-100 font-sans p-1.5 gap-1.5">
      <TopMenuBar />

      <div className="flex-1 relative min-h-0">
        <div className="h-full flex overflow-hidden gap-1.5">
          <LeftPanel onSceneSelect={handleSceneSelect} />

          {/* Center — relative container so the task panel can overlay */}
          <div className="flex-1 relative flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden min-w-0">

            {/* Terminal + Game toggle — always available */}
            {!board && (
              <div className="shrink-0 flex items-center justify-end gap-1 px-3 py-2 border-b border-white/[0.05]">
                <button
                  onClick={() => setViewMode(viewMode === '3d' ? 'kanban' : '3d')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === '3d' ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                  title="Toggle 3D Preview"
                >
                  <Box size={12} />
                  3D
                </button>
                {gameHtml && (
                  <button
                    onClick={() => setGameHtml(gameHtml ? null : gameHtml)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      gameHtml ? 'bg-green-500/10 text-green-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
                    }`}
                    title="Toggle Game Preview"
                  >
                    <Gamepad2 size={12} />
                    Game
                  </button>
                )}
                <button
                  onClick={() => setTerminalOpen(!terminalOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    terminalOpen ? 'bg-green-500/10 text-green-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
                  }`}
                  title="Toggle AI Terminal"
                >
                  <Terminal size={12} />
                  Terminal
                </button>
              </div>
            )}

            {/* View toggle — only when board exists */}
            {board && (
              <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.05] shrink-0">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'kanban' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'canvas' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Graph
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    viewMode === '3d' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Box size={12} />
                  3D
                </button>

                {viewMode === 'canvas' && (
                  <>
                    <div className="w-px h-4 bg-white/[0.08] mx-1" />
                    <button
                      onClick={toggleFlowDirection}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                      title={flowDirection === 'LR' ? 'Switch to vertical layout' : 'Switch to horizontal layout'}
                    >
                      {flowDirection === 'LR' ? <ArrowRight size={12} /> : <ArrowDown size={12} />}
                      {flowDirection === 'LR' ? 'Horizontal' : 'Vertical'}
                    </button>
                  </>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-zinc-600">{template?.name}</span>
                  <div className="w-px h-4 bg-white/[0.08]" />
                  <button
                    onClick={() => setTerminalOpen(!terminalOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      terminalOpen ? 'bg-green-500/10 text-green-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
                    }`}
                    title="Toggle AI Terminal"
                  >
                    <Terminal size={12} />
                    Terminal
                  </button>
                </div>
              </div>
            )}

            {/* Main view */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Code view — opened from file tree */}
              {openFileName && gameHtml && !terminalMaximized ? (() => {
                const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;
                const directContent = activeGame?.files?.[openFileName] ?? undefined;
                return (
                  <CodeView
                    html={gameHtml}
                    fileName={openFileName}
                    fileContent={directContent}
                    onClose={() => setOpenFileName(null)}
                    onSwitchToPreview={() => setOpenFileName(null)}
                  />
                );
              })() : gameHtml && !terminalMaximized ? (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <GameToolbar previewRef={previewRef} />
                  <GamePreview
                    html={gameHtml}
                    onClose={() => { setGameHtml(null); setSelectedPart(null); }}
                    previewRef={previewRef}
                    onObjectSelected={handleObjectSelected as (info: GameObjectInfo) => void}
                    onObjectDeselected={handleObjectDeselected}
                    onObjectTransformed={handleObjectTransformed as (info: Omit<GameObjectInfo, 'name' | 'index'>) => void}
                    onSceneModels={handleSceneModels as (models: GameObjectInfo[]) => void}
                  />
                </div>
              ) : viewMode === '3d' ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <LivePreview />
                </div>
              ) : !board ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <EmptyState onStart={() => setWizardOpen(true)} />
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden">
                  {viewMode === 'canvas' ? (
                    <FlowchartView template={template!} board={board} onTaskClick={handleTaskClick} />
                  ) : (
                    <KanbanView template={template!} board={board} onTaskClick={handleTaskClick} />
                  )}
                </div>
              )}
            </div>

            {/* Terminal panel */}
            {terminalOpen && (
              <StudioTerminal
                onClose={() => { setTerminalOpen(false); setTerminalMaximized(false); }}
                isMaximized={terminalMaximized}
                onToggleMaximize={() => setTerminalMaximized(!terminalMaximized)}
                onGameGenerated={handleGameGenerated}
                activeGameName={activeGameId ? games.find((g) => g.id === activeGameId)?.name ?? null : null}
              />
            )}

            {/* Timeline bar */}
            {board && template && (
              <TimelineBar
                template={template}
                board={board}
                activeMilestoneId={board.activeMilestoneId}
                onMilestoneClick={setActiveMilestoneId}
              />
            )}

            {/* Document editor — title + description covering the canvas */}
            {selectedTaskId && board && template && (() => {
              const tt = template.milestones.flatMap((m) => m.tasks).find((t) => t.id === selectedTaskId);
              const ti = board.milestones.flatMap((m) => m.tasks).find((t) => t.templateTaskId === selectedTaskId);
              if (!tt || !ti) return null;
              const eff = resolveEffectiveTask(tt, ti.overrides);
              return (
                <ExpandedFieldEditor
                  title={eff.title}
                  deliverable={eff.deliverable}
                  deliverableBlocks={ti.deliverableBlocks}
                  onDeliverableBlocksChange={(blocks) => updateTaskDeliverableBlocks(ti.id, blocks)}
                  descriptionBlocks={ti.descriptionBlocks}
                  onTitleChange={(v) => setTaskOverride(ti.id, { title: v })}
                  onDescriptionBlocksChange={(blocks) => updateTaskDescriptionBlocks(ti.id, blocks)}
                  onClose={() => setSelectedTaskId(null)}
                  comments={ti.comments ?? []}
                  activityLog={ti.activityLog ?? []}
                  currentUserId={CURRENT_USER_ID}
                  teamMembers={teamMembers}
                  onAddComment={(body, parentId) => {
                    addComment(ti.id, {
                      id: crypto.randomUUID().slice(0, 12),
                      authorId: CURRENT_USER_ID,
                      body,
                      createdAt: new Date().toISOString(),
                      parentId,
                    });
                  }}
                  onDeleteComment={(cId) => deleteComment(ti.id, cId)}
                />
              );
            })()}

          </div>

          {/* Right panel — part properties when game active, task detail otherwise */}
          {gameHtml && selectedPart ? (
            <PartPropertiesPanel
              part={selectedPart}
              onUpdate={handlePartUpdate}
              onDelete={handlePartDelete}
            />
          ) : board && template && selectedTaskId ? (
            <TaskDetailPanel
              templateTaskId={selectedTaskId}
              template={template}
              board={board}
            />
          ) : null}
        </div>

        <LeftPanelToggle />
      </div>

      <OnboardingWizard
        open={wizardOpen && !board}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
