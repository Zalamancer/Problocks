'use client';
import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export function ClassroomProviders({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
