'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { BuildingToolbar } from '@/components/building/BuildingToolbar';

export default function BuildPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 p-1.5 gap-1.5 overflow-hidden">
      <header className="shrink-0 h-9 flex items-center px-3 gap-3 bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] rounded-xl">
        <Link
          href="/marketplace"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={14} />
          Marketplace
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-xs font-semibold text-zinc-200">Tile Builder</span>
      </header>
      <div className="flex-1 min-h-0 flex gap-1.5">
        <BuildingToolbar />
        <main className="flex-1 min-w-0 relative bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
          <BuildingCanvas />
        </main>
      </div>
    </div>
  );
}
