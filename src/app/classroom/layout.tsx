import type { ReactNode } from 'react';
import { ClassroomProviders } from './Providers';

export default function ClassroomRootLayout({ children }: { children: ReactNode }) {
  return <ClassroomProviders>{children}</ClassroomProviders>;
}
