import { ClassroomLayout } from '@/components/classroom/ClassroomLayout';

export const metadata = { title: 'Classroom — Problocks' };

export default function ClassroomPage() {
  return (
    <main className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      <ClassroomLayout />
    </main>
  );
}
