'use client';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { BuildingToolbar } from '@/components/building/BuildingToolbar';

export default function BuildPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 p-1.5 gap-1.5 overflow-hidden">
      <div className="flex-1 min-h-0 flex gap-1.5">
        <BuildingToolbar />
        <main className="flex-1 min-w-0 relative bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          <BuildingCanvas />
        </main>
      </div>
    </div>
  );
}
