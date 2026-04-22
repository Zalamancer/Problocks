import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Client-side mirror of the Supabase auth session for the studio + student
// surfaces. Wiring: the root <ClientAuthHydrator /> (mounted in layout.tsx)
// calls `initializeAuth()` once on mount to subscribe to
// supabase.auth.onAuthStateChange. Any client component can then read the
// current user's id synchronously, without every page re-fetching the user.
//
// The id fallback is 'local-user' so Sprint 2 dev flows that didn't have a
// session keep working; Sprint 3.4 / 4 will drop the fallback once the
// studio enforces login before first save.

interface AuthStore {
  user: User | null;
  loading: boolean;
  /** Real user id if authenticated, otherwise 'local-user'. Always a string
   *  so callers can drop it straight into API bodies. */
  userId: string;
  initialized: boolean;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<() => void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  userId: 'local-user',
  initialized: false,
  setUser: (user) => set({
    user,
    userId: user?.id ?? 'local-user',
    loading: false,
  }),
  initializeAuth: async () => {
    if (get().initialized) {
      return () => {};
    }
    set({ initialized: true });

    if (!supabase) {
      set({ user: null, userId: 'local-user', loading: false });
      return () => {};
    }

    // Seed from the existing session (if any) before subscribing — prevents
    // a flash of 'local-user' on every page load.
    const { data: { session } } = await supabase.auth.getSession();
    set({
      user: session?.user ?? null,
      userId: session?.user?.id ?? 'local-user',
      loading: false,
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      set({
        user: nextSession?.user ?? null,
        userId: nextSession?.user?.id ?? 'local-user',
        loading: false,
      });
    });

    return () => subscription.subscription.unsubscribe();
  },
}));

/** Convenience hook — returns just the userId string. Use this in API
 *  callers so the component re-renders when sign-in / sign-out changes
 *  the id. */
export function useCurrentUserId(): string {
  return useAuthStore((s) => s.userId);
}
