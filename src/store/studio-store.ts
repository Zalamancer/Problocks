import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeftPanelGroup = 'assets' | 'chat' | 'settings';
export type Theme = 'dark' | 'light';
export type FlowDirection = 'LR' | 'TB';

export interface GeneratedGame {
  id: string;
  name: string;
  prompt: string;
  html: string;                          // kept for backward compat with old games
  files: Record<string, string> | null;  // multi-file games
  createdAt: number;
  updatedAt: number;
}

export interface StudioStore {
  leftPanelCollapsed: boolean;
  leftPanelActiveGroup: LeftPanelGroup;
  toggleLeftPanel: () => void;
  setLeftPanelGroup: (group: LeftPanelGroup) => void;

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

  /** Which virtual file is open in the center code viewer (null = game preview) */
  openFileName: string | null;
  setOpenFileName: (name: string | null) => void;
}

export const useStudio = create<StudioStore>()(persist((set) => ({
  leftPanelCollapsed: false,
  leftPanelActiveGroup: 'assets',
  toggleLeftPanel: () => set((s) => ({ leftPanelCollapsed: !s.leftPanelCollapsed })),
  setLeftPanelGroup: (group) => set({ leftPanelActiveGroup: group }),

  projectName: 'Untitled Game',
  setProjectName: (name) => set({ projectName: name }),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  flowDirection: 'LR',
  setFlowDirection: (dir) => set({ flowDirection: dir }),
  toggleFlowDirection: () => set((s) => ({ flowDirection: s.flowDirection === 'LR' ? 'TB' : 'LR' })),

  games: [],
  activeGameId: null,
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

  openFileName: null,
  setOpenFileName: (name) => set({ openFileName: name }),
}), {
  name: 'problocks-studio-v2',
  partialize: (state) => ({
    projectName: state.projectName,
    flowDirection: state.flowDirection,
    games: state.games,
    activeGameId: state.activeGameId,
  }),
}));
