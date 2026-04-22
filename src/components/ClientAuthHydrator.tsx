'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

// Invisible component mounted from layout.tsx that subscribes to Supabase
// auth state changes once per document. Everything else in the tree reads
// the resulting state via useCurrentUserId() / useAuthStore without needing
// its own subscription.

export function ClientAuthHydrator() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void useAuthStore.getState().initializeAuth().then((u) => { unsubscribe = u; });
    return () => { unsubscribe?.(); };
  }, []);
  return null;
}
