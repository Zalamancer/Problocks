import { create } from 'zustand';

// Lightweight credits store. The studio header mounts on to this so the
// balance pill updates instantly when an AI call debits (we call
// `refreshBalance()` from Terminal / ChatPanel right after a generation
// completes) without needing to poll aggressively.

interface CreditsStore {
  balance: number | null;
  loading: boolean;
  lastFetchedAt: number;
  refreshBalance: (userId?: string) => Promise<void>;
  setBalance: (n: number | null) => void;
}

const REFRESH_THROTTLE_MS = 1500;

export const useCreditsStore = create<CreditsStore>((set, get) => ({
  balance: null,
  loading: false,
  lastFetchedAt: 0,
  setBalance: (n) => set({ balance: n, lastFetchedAt: Date.now() }),
  refreshBalance: async (userId = 'local-user') => {
    const { loading, lastFetchedAt } = get();
    if (loading) return;
    // Avoid hammering the endpoint if a burst of callers all hit
    // refresh() back-to-back.
    if (Date.now() - lastFetchedAt < REFRESH_THROTTLE_MS) return;
    set({ loading: true });
    try {
      const res = await fetch(`/api/credits?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
      const json = await res.json() as { balance?: number | null };
      set({ balance: json.balance ?? null, loading: false, lastFetchedAt: Date.now() });
    } catch {
      set({ loading: false });
    }
  },
}));
