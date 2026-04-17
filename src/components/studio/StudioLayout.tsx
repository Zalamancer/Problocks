'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { TopMenuBar } from './TopMenuBar';
import { StudioTerminal } from './Terminal';
import { GamePreview, type GamePreviewHandle, type GameObjectInfo } from './GamePreview';
import { GameToolbar } from './GameToolbar';
import { LeftPanel, LeftPanelToggle } from './LeftPanel';
import { BottomTabBar } from './BottomTabBar';
import { SettingsPanel } from './panels/SettingsPanel';
import { OnboardingWizard } from './modals/OnboardingWizard';
import { TimelineBar } from './views/TimelineBar';
import { KanbanView } from './views/KanbanView';
import { FlowchartView } from './views/FlowchartView';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import { useHotkeys } from '@/hooks/useHotkeys';
import { WorkspaceView } from './views/WorkspaceView';
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
import { useBuildingStore } from '@/store/building-store';
import { useQualityStore } from '@/store/quality-store';

// Keep in sync with BuildingCanvas.tsx — used to reconstruct default
// transforms for floor/wall meshes that haven't been gizmo-moved yet.
const B_TILE = 2;
const B_FLOOR_THICK = 0.1;
const B_WALL_HEIGHT = 3;

function floorDefaultPos(key: string) {
  const [xs, zs] = key.split(',');
  const x = parseInt(xs, 10);
  const z = parseInt(zs, 10);
  return { x: x * B_TILE, y: B_FLOOR_THICK / 2, z: z * B_TILE };
}
function wallDefaultPos(key: string) {
  const [xs, zs, dir] = key.split(',');
  const x = parseInt(xs, 10);
  const z = parseInt(zs, 10);
  if (dir === 'N') return { x: x * B_TILE, y: B_WALL_HEIGHT / 2, z: z * B_TILE - B_TILE / 2 };
  return { x: x * B_TILE + B_TILE / 2, y: B_WALL_HEIGHT / 2, z: z * B_TILE };
}

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
  // Wizard does NOT auto-open in studio. Game creation starts on the landing
  // page ("Create game" CTA); by the time the user reaches /studio the
  // project-board store has already been initialised and persisted.
  const [wizardOpen, setWizardOpen] = useState(false);
  const viewMode = useStudio((s) => s.viewMode);
  const setViewMode = useStudio((s) => s.setViewMode);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const previewRef = useRef<GamePreviewHandle | null>(null);

  // Scene store
  const { selectedPart, setSelectedPart, updateSelectedPart, setSceneObjects } = useSceneStore();

  // Quality tier — forwarded to the game bundler so generated iframes honor
  // the same shadow/antialias/pixelRatio settings as the studio.
  const gameQuality = useQualityStore((s) => s.settings);

  // Building store — selection of a floor or wall opens the right panel too.
  const buildingSelection = useBuildingStore((s) => s.selection);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const setBuildingSelection = useBuildingStore((s) => s.setSelection);
  const updateFloor = useBuildingStore((s) => s.updateFloor);
  const updateWall = useBuildingStore((s) => s.updateWall);
  const eraseFloor = useBuildingStore((s) => s.eraseFloor);
  const eraseWall = useBuildingStore((s) => s.eraseWall);

  // Synthesize a ScenePart-shaped object for the selected floor/wall so we
  // can reuse PartPropertiesPanel. Unsupported fields (color, texture, etc.)
  // get inert defaults and their onUpdate writes are ignored.
  const buildingPart: ScenePart | null = (() => {
    if (!buildingSelection) return null;
    const record =
      buildingSelection.kind === 'floor'
        ? floors[buildingSelection.key]
        : walls[buildingSelection.key];
    if (!record) return null;
    const defaultPos =
      buildingSelection.kind === 'floor'
        ? floorDefaultPos(buildingSelection.key)
        : wallDefaultPos(buildingSelection.key);
    const isFloor = buildingSelection.kind === 'floor';
    return {
      id: `${buildingSelection.kind}:${buildingSelection.key}`,
      name: record.asset || buildingSelection.kind,
      partType: 'Block',
      position: record.position ?? defaultPos,
      rotation: record.rotation ?? { x: 0, y: 0, z: 0 },
      scale: record.scale ?? { x: 1, y: 1, z: 1 },
      color: record.color ?? (isFloor ? '#f0a93a' : '#ed2b2b'),
      roughness: record.roughness ?? (isFloor ? 0.35 : 0.3),
      metalness: record.metalness ?? 0,
      emissiveColor: record.emissiveColor ?? '#000000',
      emissiveIntensity: record.emissiveIntensity ?? 0,
      texture: 'None',
      castShadow: record.castShadow ?? true,
      anchored: true,
      visible: record.visible ?? true,
    };
  })();

  function handleBuildingPartUpdate(changes: Partial<ScenePart>) {
    if (!buildingSelection) return;
    const patch: Record<string, unknown> = {};
    // Transform
    if (changes.position) patch.position = changes.position;
    if (changes.rotation) patch.rotation = changes.rotation;
    if (changes.scale) patch.scale = changes.scale;
    // Appearance
    if (changes.color !== undefined) patch.color = changes.color;
    if (changes.roughness !== undefined) patch.roughness = changes.roughness;
    if (changes.metalness !== undefined) patch.metalness = changes.metalness;
    if (changes.emissiveColor !== undefined) patch.emissiveColor = changes.emissiveColor;
    if (changes.emissiveIntensity !== undefined) patch.emissiveIntensity = changes.emissiveIntensity;
    if (changes.castShadow !== undefined) patch.castShadow = changes.castShadow;
    if (changes.visible !== undefined) patch.visible = changes.visible;
    // `texture` just drives roughness/metalness in PartPropertiesPanel —
    // those are already forwarded as separate fields, so we can ignore it.
    if (Object.keys(patch).length === 0) return;
    if (buildingSelection.kind === 'floor') updateFloor(buildingSelection.key, patch);
    else updateWall(buildingSelection.key, patch);
  }

  function handleBuildingPartDelete() {
    if (!buildingSelection) return;
    if (buildingSelection.kind === 'floor') {
      const [xs, zs] = buildingSelection.key.split(',');
      eraseFloor(parseInt(xs, 10), parseInt(zs, 10));
    } else {
      const [xs, zs, dir] = buildingSelection.key.split(',') as [string, string, 'N' | 'E'];
      eraseWall(parseInt(xs, 10), parseInt(zs, 10), dir);
    }
    setBuildingSelection(null);
  }

  // Keyboard shortcuts
  useHotkeys({
    'mod+1': () => setViewMode('kanban'),
    'mod+2': () => setViewMode('canvas'),
    'mod+3': () => setViewMode('3d'),
    'mod+j': () => setTerminalOpen((o) => !o),
  });

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
      const bundledHtml = getGameHtml({ files }, { quality: gameQuality });
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

  // Part delete — remove from native scene store AND notify any running
  // iframe game. The postMessage is a no-op if there's no iframe.
  const removePartFromStore = useSceneStore((s) => s.removePart);
  const handlePartDelete = useCallback(() => {
    if (!selectedPart) return;
    previewRef.current?.sendToGame({ type: 'removePart', id: selectedPart.id });
    removePartFromStore(selectedPart.id);
    setSelectedPart(null);
  }, [selectedPart, setSelectedPart, removePartFromStore]);

  // Blocky Village auto-load was an iframe-based game demo that covered the
  // native 3D workspace. Removed — the studio now boots straight into the
  // native WorkspaceView where users build directly.

  // When activeGameId changes, load game into preview or clear it
  useEffect(() => {
    if (activeGameId) {
      const active = games.find((g) => g.id === activeGameId);
      if (active) {
        if (active.files && Object.keys(active.files).length > 0) {
          setGameHtml(getGameHtml({ files: active.files }, { quality: gameQuality }));
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
              })() : viewMode === 'settings' ? (
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                  <SettingsPanel />
                </div>
              ) : gameHtml && !terminalMaximized ? (
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
                  <WorkspaceView />
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

            <BottomTabBar />

          </div>

          {/* Right panel — part properties when a part is selected (native
              workspace OR running iframe game); task detail otherwise. */}
          {selectedPart ? (
            <PartPropertiesPanel
              part={selectedPart}
              onUpdate={handlePartUpdate}
              onDelete={handlePartDelete}
            />
          ) : buildingPart ? (
            <PartPropertiesPanel
              part={buildingPart}
              onUpdate={handleBuildingPartUpdate}
              onDelete={handleBuildingPartDelete}
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
