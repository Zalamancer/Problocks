'use client';
import { useState } from 'react';
import { FolderOpen, LayoutGrid, Image, Volume2, Box } from 'lucide-react';
import { PanelSearchInput, PanelDropZone, PanelIconTabs } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';

type AssetTab = 'all' | 'images' | 'audio' | 'models';

const TABS: { id: AssetTab; label: string; icon: LucideIcon }[] = [
  { id: 'all',    label: 'All',    icon: LayoutGrid },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'audio',  label: 'Audio',  icon: Volume2 },
  { id: 'models', label: '3D',     icon: Box },
];

export function AssetsPanel() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<AssetTab>('all');
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PanelIconTabs tabs={TABS} activeTab={tab} onChange={(id) => setTab(id as AssetTab)} />
      <div className="shrink-0 px-3 py-2">
        <PanelSearchInput value={search} onChange={setSearch} placeholder="Search assets..." />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <PanelDropZone
          icon={FolderOpen}
          label="Drop files here"
          sublabel="Images, audio & 3D models"
          isDragging={isDragging}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={() => setIsDragging(false)}
        />
      </div>
    </div>
  );
}
