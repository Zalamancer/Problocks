import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeftPanelGroup = 'assets' | 'chat' | 'settings';
export type Theme = 'dark' | 'light';
export type FlowDirection = 'LR' | 'TB';

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
}), {
  name: 'problocks-studio-v2',
  partialize: (state) => ({ projectName: state.projectName, flowDirection: state.flowDirection }),
}));
