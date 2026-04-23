import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeftPanelGroup = 'scene' | 'assets' | 'chat' | 'parts' | 'connectors' | 'library';
export type RightPanelGroup = 'properties' | 'workspace' | 'chat' | 'parts';
export type AssetsTab = 'models' | 'parts';
export type PartsTab = 'generate' | 'history';
export type ViewMode = 'canvas' | 'kanban' | '3d';
export type ChatMode = 'scene' | 'part';
export type Theme = 'dark' | 'light' | 'cream';
export type FlowDirection = 'LR' | 'TB';

/**
 * What kind of game world this project builds. Drives what the AssetsPanel
 * shows (GLTF models vs procedural building-kit parts vs 2D sprites), which
 * viewport is active, and which toolbars appear. Chosen in the New Game
 * dialog and cannot be mixed — a freeform 3D world and a tile-based 3D
 * world are different systems, not different views of the same scene.
 */
export type GameSystem =
  | '3d-freeform'
  | '3d-tile'
  | '3d-lego'
  | '3d-voxel'
  | '2d'
  | '2d-freeform'
  | 'topdown'
  | 'quiz';

// Which AssetsPanel view a given game system should show. '3d-freeform'
// maps to Models (GLTF kit), the two grid-based 3d systems map to Parts
// (procedural pieces), voxel uses Models as placeholder until a dedicated
// block palette panel exists. 2D/topdown use Models as a placeholder until
// their dedicated sprite/tileset browsers are built.
export function assetsTabForGameSystem(sys: GameSystem): AssetsTab {
  if (sys === '3d-tile' || sys === '3d-lego') return 'parts';
  return 'models';
}

export interface GeneratedGame {
  id: string;
  name: string;
  prompt: string;
  html: string;                          // kept for backward compat with old games
  files: Record<string, string> | null;  // multi-file games
  createdAt: number;
  updatedAt: number;
}

/** A single point-in-time snapshot of a game's content, used by the undo
 *  stack. Captured lazily — we only take a snapshot right before an
 *  overwrite (AI regeneration, file edit) so the stack stays small and we
 *  don't memory-bloat projects that never change. */
export interface GameSnapshot {
  html: string;
  files: Record<string, string> | null;
  takenAt: number;
}

const MAX_UNDO_STACK = 20;

function filesEqual(
  a: Record<string, string> | null,
  b: Record<string, string> | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export interface StudioStore {
  leftPanelCollapsed: boolean;
  leftPanelActiveGroup: LeftPanelGroup;
  rightPanelActiveGroup: RightPanelGroup;
  assetsActiveTab: AssetsTab;
  partsActiveTab: PartsTab;
  toggleLeftPanel: () => void;
  setLeftPanelGroup: (group: LeftPanelGroup) => void;
  setRightPanelGroup: (group: RightPanelGroup) => void;
  setAssetsActiveTab: (tab: AssetsTab) => void;
  setPartsActiveTab: (tab: PartsTab) => void;

  /** The active game system. Picked in the New Game dialog. */
  gameSystem: GameSystem;
  setGameSystem: (sys: GameSystem) => void;

  /** Whether the New Game dialog is open. */
  newGameDialogOpen: boolean;
  openNewGameDialog: () => void;
  closeNewGameDialog: () => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  /**
   * Which intent the left-panel chat is in. "scene" routes to the existing
   * studio-agent (builds the 3D scene); "part" opens the full-screen Part
   * Studio for low-poly asset generation.
   */
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;

  projectName: string;
  setProjectName: (name: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  flowDirection: FlowDirection;
  setFlowDirection: (dir: FlowDirection) => void;
  toggleFlowDirection: () => void;

  games: GeneratedGame[];
  activeGameId: string | null;
  addGame: (game: { name: string; prompt: string; html: string; files?: Record<string, string> }) => void;
  updateGame: (id: string, html: string) => void;
  updateGameFiles: (id: string, files: Record<string, string>) => void;
  updateGameFile: (gameId: string, fileName: string, content: string) => void;
  removeGame: (id: string) => void;
  setActiveGameId: (id: string | null) => void;

  /** Per-game undo stack — keyed by game id. NOT persisted: undo history is
   *  session-scoped so a refresh still gives you a clean slate (and doesn't
   *  resurrect snapshots of games the user has since published). */
  gameHistory: Record<string, GameSnapshot[]>;
  /** Capture the current (html, files) for a game before you overwrite them.
   *  Callers own the "before" read — the store just stores what you give it. */
  pushGameSnapshot: (gameId: string, snapshot: Omit<GameSnapshot, 'takenAt'>) => void;
  /** Pop the most recent snapshot for a game and apply it (sets html + files
   *  + updatedAt). Returns the snapshot that was applied, or null if the
   *  stack was empty. */
  undoGame: (gameId: string) => GameSnapshot | null;

  /** Which virtual file is open in the center code viewer (null = game preview) */
  openFileName: string | null;
  setOpenFileName: (name: string | null) => void;
}

export const useStudio = create<StudioStore>()(persist((set) => ({
  leftPanelCollapsed: false,
  leftPanelActiveGroup: 'assets',
  rightPanelActiveGroup: 'properties',
  assetsActiveTab: 'models',
  partsActiveTab: 'generate',
  toggleLeftPanel: () => set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed })),
  setLeftPanelGroup: (group) => set({ leftPanelActiveGroup: group }),
  setRightPanelGroup: (group) => set({ rightPanelActiveGroup: group }),
  setAssetsActiveTab: (tab) => set({ assetsActiveTab: tab }),
  setPartsActiveTab: (tab) => set({ partsActiveTab: tab }),

  // Default game system matches the old "Models" tab so projects that were
  // created before the system concept existed keep showing the GLTF kit.
  gameSystem: '3d-freeform',
  setGameSystem: (sys) => set({
    gameSystem: sys,
    // Keep the legacy assetsActiveTab in sync so code that still reads it
    // (e.g. WorkspaceView's toolbar gate) reacts to game-system changes.
    assetsActiveTab: assetsTabForGameSystem(sys),
  }),

  newGameDialogOpen: false,
  openNewGameDialog: () => set({ newGameDialogOpen: true }),
  closeNewGameDialog: () => set({ newGameDialogOpen: false }),

  viewMode: '3d',
  setViewMode: (mode) => set({ viewMode: mode }),

  chatMode: 'scene',
  setChatMode: (mode) => set({ chatMode: mode }),

  projectName: 'Untitled Game',
  setProjectName: (name) => set({ projectName: name }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => {
    const order: Theme[] = ['dark', 'light', 'cream'];
    const i = order.indexOf(s.theme);
    return { theme: order[(i + 1) % order.length] };
  }),

  flowDirection: 'LR',
  setFlowDirection: (dir) => set({ flowDirection: dir }),
  toggleFlowDirection: () => set((s) => ({ flowDirection: s.flowDirection === 'LR' ? 'TB' : 'LR' })),

  games: [] as GeneratedGame[],
  activeGameId: null as string | null,
  addGame: (game) => {
    const id = crypto.randomUUID();
    const now = Date.now();
    const files = game.files ?? null;
    const html = files ? '' : game.html;
    set((s) => ({
      games: [...s.games, { name: game.name, prompt: game.prompt, html, files, id, createdAt: now, updatedAt: now }],
      activeGameId: id,
    }));
  },
  updateGame: (id, html) => set((s) => ({
    games: s.games.map((g) => g.id === id ? { ...g, html, updatedAt: Date.now() } : g),
  })),
  updateGameFiles: (id, files) => set((s) => ({
    games: s.games.map((g) => g.id === id ? { ...g, files, updatedAt: Date.now() } : g),
  })),
  updateGameFile: (gameId, fileName, content) => set((s) => ({
    games: s.games.map((g) => {
      if (g.id !== gameId || !g.files) return g;
      return { ...g, files: { ...g.files, [fileName]: content }, updatedAt: Date.now() };
    }),
  })),
  removeGame: (id) => set((s) => ({
    games: s.games.filter((g) => g.id !== id),
    activeGameId: s.activeGameId === id ? null : s.activeGameId,
  })),
  setActiveGameId: (id) => set({ activeGameId: id }),

  gameHistory: {} as Record<string, GameSnapshot[]>,
  pushGameSnapshot: (gameId, snapshot) => set((s) => {
    // Skip no-op snapshots so mashing Save doesn't flood the stack with
    // identical entries.
    const stack = s.gameHistory[gameId] ?? [];
    const last = stack[stack.length - 1];
    if (last && last.html === snapshot.html && filesEqual(last.files, snapshot.files)) {
      return {};
    }
    const next = [...stack, { ...snapshot, takenAt: Date.now() }];
    // Cap the stack so a long editing session doesn't eat memory. Oldest
    // entries fall off first.
    const trimmed = next.length > MAX_UNDO_STACK ? next.slice(next.length - MAX_UNDO_STACK) : next;
    return { gameHistory: { ...s.gameHistory, [gameId]: trimmed } };
  }),
  undoGame: (gameId: string): GameSnapshot | null => {
    // Read the latest state synchronously; can't use `set((s) => …)` here
    // because we also need to return the applied snapshot to the caller.
    const state = useStudio.getState();
    const stack = state.gameHistory[gameId];
    if (!stack || stack.length === 0) return null;
    const snap: GameSnapshot = stack[stack.length - 1];
    const remaining = stack.slice(0, -1);
    set((s) => ({
      gameHistory: { ...s.gameHistory, [gameId]: remaining },
      games: s.games.map((g) => g.id === gameId
        ? { ...g, html: snap.html, files: snap.files, updatedAt: Date.now() }
        : g
      ),
    }));
    return snap;
  },

  openFileName: null as string | null,
  setOpenFileName: (name: string | null) => set({ openFileName: name }),
}), {
  name: 'problocks-studio-v2',
  partialize: (state) => ({
    projectName: state.projectName,
    flowDirection: state.flowDirection,
    chatMode: state.chatMode,
    games: state.games,
    theme: state.theme,
    gameSystem: state.gameSystem,
    // Intentionally NOT persisting activeGameId — otherwise a refresh would
    // auto-open the last previewed game, forcing the GamePreview panel on
    // users who didn't ask for it.
  }),
}));
