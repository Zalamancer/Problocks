'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { PBButton } from '@/components/ui/pb-atoms';
import { TopMenuBar } from './TopMenuBar';
import { StudioTerminal } from './Terminal';
import { GamePreview, type GamePreviewHandle, type GameObjectInfo } from './GamePreview';
import { GameToolbar } from './GameToolbar';
import { LeftPanel, LeftPanelToggle } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { OnboardingWizard } from './modals/OnboardingWizard';
import { NewGameDialog } from './modals/NewGameDialog';
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
import { GeneratedFilesPanel } from './panels/GeneratedFilesPanel';
import { Freeform3DPropertiesPanel } from './panels/Freeform3DPropertiesPanel';
import { useFreeform3D } from '@/store/freeform3d-store';
import { ExpandedFieldEditor } from './panels/task-sections';
import { useProjectBoard as useBoardStore } from '@/store/project-board-store';
import { resolveEffectiveTask } from '@/lib/templates/types';
import type { TemplateId } from '@/lib/templates/types';
import { useSceneStore, type ScenePart } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
import { useQualityStore } from '@/store/quality-store';
// Canonical world scale — shared with BuildingCanvas's grid math so
// floor/wall default transforms here never drift.
import { TILE as B_TILE, WALL_HEIGHT as B_WALL_HEIGHT, FLOOR_THICK as B_FLOOR_THICK } from '@/lib/building-kit';

function floorDefaultPos(key: string) {
  const [xs, ys, zs] = key.split(',');
  const x = parseInt(xs, 10);
  const y = parseInt(ys, 10);
  const z = parseInt(zs, 10);
  return { x: x * B_TILE, y: y * B_WALL_HEIGHT + B_FLOOR_THICK / 2, z: z * B_TILE };
}
function wallDefaultPos(key: string) {
  const [xs, ys, zs, dir] = key.split(',');
  const x = parseInt(xs, 10);
  const y = parseInt(ys, 10);
  const z = parseInt(zs, 10);
  const baseY = y * B_WALL_HEIGHT + B_WALL_HEIGHT / 2;
  if (dir === 'N') return { x: x * B_TILE, y: baseY, z: z * B_TILE - B_TILE / 2 };
  return { x: x * B_TILE + B_TILE / 2, y: baseY, z: z * B_TILE };
}
function roofDefaultPos(key: string) {
  // Roofs share floor's tile-center indexing but sit on top of the wall band.
  const [xs, ys, zs] = key.split(',');
  const x = parseInt(xs, 10);
  const y = parseInt(ys, 10);
  const z = parseInt(zs, 10);
  return { x: x * B_TILE, y: y * B_WALL_HEIGHT + B_WALL_HEIGHT, z: z * B_TILE };
}
function cornerDefaultPos(key: string) {
  // Corners are keyed on tile-corner vertices, so x/z are multiplied by TILE
  // with a half-tile offset to land on the vertex between tiles.
  const [xs, ys, zs] = key.split(',');
  const x = parseInt(xs, 10);
  const y = parseInt(ys, 10);
  const z = parseInt(zs, 10);
  return {
    x: x * B_TILE - B_TILE / 2,
    y: y * B_WALL_HEIGHT + B_WALL_HEIGHT / 2,
    z: z * B_TILE - B_TILE / 2,
  };
}
function stairsDefaultPos(key: string) {
  const [xs, ys, zs] = key.split(',');
  const x = parseInt(xs, 10);
  const y = parseInt(ys, 10);
  const z = parseInt(zs, 10);
  return { x: x * B_TILE, y: y * B_WALL_HEIGHT + B_WALL_HEIGHT / 2, z: z * B_TILE };
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-8">
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--pb-butter)',
          border: '1.5px solid var(--pb-butter-ink)',
          boxShadow: '0 2px 0 var(--pb-butter-ink)',
        }}
      >
        <Sparkles size={24} strokeWidth={2.2} style={{ color: 'var(--pb-butter-ink)' }} />
      </div>
      <div>
        <h2
          className="mb-1"
          style={{ fontSize: 18, fontWeight: 800, color: 'var(--pb-ink)' }}
        >
          Start a new game project
        </h2>
        <p
          className="max-w-xs"
          style={{ fontSize: 13, color: 'var(--pb-ink-muted)', fontWeight: 500 }}
        >
          Pick a workflow template and we&apos;ll set up your milestones, tasks, and AI tools automatically.
        </p>
      </div>
      <PBButton onClick={onStart} variant="primary" size="lg">
        Choose a template
      </PBButton>
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
  const gameSystem = useStudio((s) => s.gameSystem);
  const freeform3dSelectedId = useFreeform3D((s) => s.selectedId);
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

  // Building store — every kind of selection (floor/wall/roof/corner/
  // stairs) opens the right panel. place* auto-selects the new piece, so
  // the right panel also pops open on insertion.
  const buildingSelection = useBuildingStore((s) => s.selection);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const roofs = useBuildingStore((s) => s.roofs);
  const cornersRec = useBuildingStore((s) => s.corners);
  const stairsRec = useBuildingStore((s) => s.stairs);
  const setBuildingSelection = useBuildingStore((s) => s.setSelection);
  const updateFloor = useBuildingStore((s) => s.updateFloor);
  const updateWall = useBuildingStore((s) => s.updateWall);
  const updateRoof = useBuildingStore((s) => s.updateRoof);
  const updateCorner = useBuildingStore((s) => s.updateCorner);
  const updateStairs = useBuildingStore((s) => s.updateStairs);
  const eraseFloor = useBuildingStore((s) => s.eraseFloor);
  const eraseWall = useBuildingStore((s) => s.eraseWall);
  const eraseRoof = useBuildingStore((s) => s.eraseRoof);
  const eraseCorner = useBuildingStore((s) => s.eraseCorner);
  const eraseStairs = useBuildingStore((s) => s.eraseStairs);

  // Synthesize a ScenePart-shaped object for whichever building piece is
  // selected so we can reuse PartPropertiesPanel. Unsupported fields stay
  // inert; their onUpdate writes route to the matching update* method.
  const buildingPart: ScenePart | null = (() => {
    if (!buildingSelection) return null;
    let record: { asset?: string; position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number }; color?: string; roughness?: number; metalness?: number; emissiveColor?: string; emissiveIntensity?: number; castShadow?: boolean; visible?: boolean } | undefined;
    let defaultPos: { x: number; y: number; z: number };
    let defaultColor = '#c0c0c0';
    let defaultRough = 0.5;
    switch (buildingSelection.kind) {
      case 'floor':
        record = floors[buildingSelection.key];
        defaultPos = floorDefaultPos(buildingSelection.key);
        defaultColor = '#f0a93a'; defaultRough = 0.35;
        break;
      case 'wall':
        record = walls[buildingSelection.key];
        defaultPos = wallDefaultPos(buildingSelection.key);
        defaultColor = '#ed2b2b'; defaultRough = 0.3;
        break;
      case 'roof':
        record = roofs[buildingSelection.key];
        defaultPos = roofDefaultPos(buildingSelection.key);
        defaultColor = '#a14c2a'; defaultRough = 0.6;
        break;
      case 'corner':
        record = cornersRec[buildingSelection.key];
        defaultPos = cornerDefaultPos(buildingSelection.key);
        defaultColor = '#8a6e3c'; defaultRough = 0.4;
        break;
      case 'stairs':
        record = stairsRec[buildingSelection.key];
        defaultPos = stairsDefaultPos(buildingSelection.key);
        defaultColor = '#9aa0a6'; defaultRough = 0.5;
        break;
      default:
        return null;
    }
    if (!record) return null;
    return {
      id: `${buildingSelection.kind}:${buildingSelection.key}`,
      name: record.asset || buildingSelection.kind,
      partType: 'Block',
      position: record.position ?? defaultPos,
      rotation: record.rotation ?? { x: 0, y: 0, z: 0 },
      scale: record.scale ?? { x: 1, y: 1, z: 1 },
      color: record.color ?? defaultColor,
      roughness: record.roughness ?? defaultRough,
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
    if (Object.keys(patch).length === 0) return;
    switch (buildingSelection.kind) {
      case 'floor':  updateFloor(buildingSelection.key, patch); break;
      case 'wall':   updateWall(buildingSelection.key, patch); break;
      case 'roof':   updateRoof(buildingSelection.key, patch); break;
      case 'corner': updateCorner(buildingSelection.key, patch); break;
      case 'stairs': updateStairs(buildingSelection.key, patch); break;
    }
  }

  function handleBuildingPartDelete() {
    if (!buildingSelection) return;
    const parts = buildingSelection.key.split(',');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    const z = parseInt(parts[2], 10);
    switch (buildingSelection.kind) {
      case 'floor':  eraseFloor(x, y, z); break;
      case 'wall':   eraseWall(x, y, z, parts[3] as 'N' | 'E'); break;
      case 'roof':   eraseRoof(x, y, z); break;
      case 'corner': eraseCorner(x, y, z); break;
      case 'stairs': eraseStairs(x, y, z, parts[3] as 'N' | 'S' | 'E' | 'W'); break;
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
  const undoGame = useStudio((s) => s.undoGame);

  // Mod+Z undoes the last AI-regeneration of the active game. Registered as a
  // second useHotkeys call so the map stays a stable object per render (we
  // want the callback to close over the latest activeGameId).
  useHotkeys({
    'mod+z': () => {
      if (!activeGameId) return;
      undoGame(activeGameId);
    },
  });

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
  const pushGameSnapshot = useStudio((s) => s.pushGameSnapshot);

  /** When a game is generated from Terminal, save/update it in the store */
  function handleGameGenerated(html: string, files?: Record<string, string>) {
    // Snapshot the active game BEFORE we overwrite it so the Undo button can
    // roll back. Skipped when there's no active game (the addGame branch —
    // nothing to undo yet) or when we're creating a fresh one from scratch.
    if (activeGameId) {
      const prev = games.find((g) => g.id === activeGameId);
      if (prev) {
        pushGameSnapshot(activeGameId, {
          html: prev.html,
          files: prev.files,
        });
      }
    }

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

  // First-visit empty state: if the user arrives at /studio with no games
  // and no active game, prompt them to pick a starter. We guard with a
  // session-storage flag so dismissing the dialog doesn't trigger a reopen
  // loop across re-renders, but a hard refresh still gets the picker back
  // until they actually create something.
  const newGameDialogOpen = useStudio((s) => s.newGameDialogOpen);
  const openNewGameDialog = useStudio((s) => s.openNewGameDialog);
  const autoPromptRef = useRef(false);
  useEffect(() => {
    if (autoPromptRef.current) return;
    if (activeGameId) return;
    if (games.length > 0) return;
    if (newGameDialogOpen) return;
    try {
      if (sessionStorage.getItem('pb:studio:auto-prompt-seen')) return;
      sessionStorage.setItem('pb:studio:auto-prompt-seen', '1');
    } catch {
      // sessionStorage unavailable — fall through and still prompt.
    }
    autoPromptRef.current = true;
    openNewGameDialog();
  }, [activeGameId, games.length, newGameDialogOpen, openNewGameDialog]);

  // Clicking the same task again deselects it — matches AutoAnimation's
  // implicit-selection pattern (no close button; you "close" by clicking
  // elsewhere or re-clicking the selected item).
  function handleTaskClick(templateTaskId: string) {
    setSelectedTaskId((prev) => (prev === templateTaskId ? null : templateTaskId));
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden font-sans p-1.5 gap-1.5"
      style={{ background: 'var(--panel-bg)', color: 'var(--pb-ink)' }}
    >
      <TopMenuBar />

      <div className="flex-1 relative min-h-0">
        <div className="h-full flex overflow-hidden gap-1.5">
          <LeftPanel onSceneSelect={handleSceneSelect} />

          {/* Center — relative container so the task panel can overlay */}
          <div
            className="flex-1 relative flex flex-col rounded-xl overflow-hidden min-w-0"
            style={{
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
            }}
          >

            {/* Main view */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {/* Code view — opened from file tree or Code tab */}
              {openFileName && !terminalMaximized ? (() => {
                const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;
                const directContent = activeGame?.files?.[openFileName];
                // When there's no game/file yet, show an empty file instead of nothing.
                const content = directContent ?? (gameHtml ? undefined : '');
                return (
                  <CodeView
                    html={gameHtml ?? ''}
                    fileName={openFileName}
                    fileContent={content}
                    files={activeGame?.files ?? null}
                    onClose={() => setOpenFileName(null)}
                    onSwitchToPreview={() => setOpenFileName(null)}
                    onSelectFile={(name) => setOpenFileName(name)}
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
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  {/* Native Roblox-Studio-style editor toolbar. Operates on
                      the scene store directly (no iframe needed); the Part
                      button spawns primitives you can Move/Rotate/Scale with
                      the gizmo below. */}
                  <GameToolbar />
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <WorkspaceView />
                  </div>
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

            {/* Timeline bar — flowchart view only */}
            {viewMode === 'canvas' && board && template && (
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

          {/* Right panel — shared aside shell with dropdown tabs
              (Properties / Chat / Part Studio). The "Properties" tab is
              context-aware: shows Code-view file list when a file is open,
              part properties when a part is selected, workspace lighting
              when "Workspace" is selected in the scene hierarchy, or task
              detail when a flowchart task is selected. */}
          <RightPanel
            propertiesContent={(() => {
              // 3D Freeform has its own Properties panel: selection-aware and
              // backed by the freeform3d store (not the BuildingCanvas part
              // selection which is irrelevant for this viewport).
              if (gameSystem === '3d-freeform') {
                return <Freeform3DPropertiesPanel headless />;
              }
              if (openFileName) {
                const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;
                const fileList = activeGame?.files ? Object.keys(activeGame.files) : [];
                return (
                  <GeneratedFilesPanel
                    files={fileList}
                    activeFile={openFileName}
                    onSelectFile={(name) => setOpenFileName(name)}
                    headless
                  />
                );
              }
              if (selectedPart) {
                return (
                  <PartPropertiesPanel
                    part={selectedPart}
                    onUpdate={handlePartUpdate}
                    onDelete={handlePartDelete}
                    headless
                  />
                );
              }
              if (buildingPart) {
                return (
                  <PartPropertiesPanel
                    part={buildingPart}
                    onUpdate={handleBuildingPartUpdate}
                    onDelete={handleBuildingPartDelete}
                    showBuilding
                    headless
                  />
                );
              }
              // NOTE: Workspace lighting lives on its own right-panel tab
              // now ("Workspace"), no longer under the Properties branch.
              if (board && template && selectedTaskId) {
                return (
                  <TaskDetailPanel
                    templateTaskId={selectedTaskId}
                    template={template}
                    board={board}
                    headless
                  />
                );
              }
              return null;
            })()}
          />
        </div>

        <LeftPanelToggle />
      </div>

      <OnboardingWizard
        open={wizardOpen && !board}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
      <NewGameDialog />
    </div>
  );
}
