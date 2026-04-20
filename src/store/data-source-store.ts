// Global toggle between mock data (sample-data.ts seeds) and real Supabase data.
//
// Most dashboards (Student, Teacher, Marketplace) are currently seeded from
// hand-written sample arrays in src/components/{student,teacher}/sample-data.ts.
// Flipping this to "real" routes those same screens through Supabase queries
// (or shows an honest empty state where the backend schema isn't provisioned
// yet — classes / students / assignments tables are not built yet, so "real"
// mode shows empty-state UIs for those pages today).
//
// Quiz rooms already auto-detect Supabase via isSupabaseConfigured() in
// src/lib/quiz/room-store.ts, so that path is unaffected by this toggle.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataSourceStore {
  /** true = fetch from Supabase, false = use hard-coded sample-data.ts seeds. */
  useRealData: boolean;
  setUseRealData: (next: boolean) => void;
  toggle: () => void;
}

export const useDataSourceStore = create<DataSourceStore>()(
  persist(
    (set) => ({
      useRealData: false,
      setUseRealData: (next) => set({ useRealData: next }),
      toggle: () => set((s) => ({ useRealData: !s.useRealData })),
    }),
    { name: 'problocks-data-source-v1' },
  ),
);
