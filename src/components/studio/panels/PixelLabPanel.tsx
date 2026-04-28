'use client';
import { useState } from 'react';
import { PanelCategoryTabs } from '@/components/ui/panel-controls';

type Category = 'create' | 'transform' | 'animate' | 'utility';
type Badge = 'NEW' | 'PRO' | 'EXPERIMENTAL';

interface Tool {
  id: string;
  title: string;
  desc: string;
  badge?: Badge;
}

const TOOLS: Record<Category, Tool[]> = {
  create: [
    { id: 'create-image-sxl',      title: 'Create image S-XL (new)', desc: 'New model, outline + detail controls', badge: 'NEW' },
    { id: 'create-image-mxl',      title: 'Create M-XL image',       desc: 'Best for 64px and larger' },
    { id: 'create-image-sm',       title: 'Create S-M image',        desc: 'Best for 16-64px' },
    { id: 'image-to-pixel-art',    title: 'Image to pixel art',      desc: 'Convert any image to pixel art' },
    { id: 'create-image',          title: 'Create image',            desc: 'High quality generation', badge: 'PRO' },
    { id: 'create-from-style',     title: 'Create from style reference', desc: 'Match your art style', badge: 'PRO' },
    { id: 'create-8dir-sprite',    title: 'Create 8-directional sprite', desc: 'Generate 8 directional views', badge: 'PRO' },
    { id: 'create-tiles',          title: 'Create tiles',            desc: 'Generate tile variations for games', badge: 'PRO' },
    { id: 'create-ui-elements-pro',title: 'Create UI elements',      desc: 'Create game UI components', badge: 'PRO' },
    { id: 'create-ui-elements-exp',title: 'Create UI elements',      desc: 'Generate game UI components', badge: 'EXPERIMENTAL' },
  ],
  transform: [
    { id: 'image-to-image',     title: 'Image to image', desc: 'Transform using depth guidance' },
    { id: 'edit-image',         title: 'Edit image',     desc: 'Edit parts of an existing image' },
    { id: 'edit-image-pro',     title: 'Edit image',     desc: 'Advanced AI image editing', badge: 'PRO' },
  ],
  animate: [
    { id: 'generate-8-rotations',  title: 'Generate 8 rotations',     desc: 'Create 8 directional views from reference', badge: 'NEW' },
    { id: 'animate-with-text-new', title: 'Animate with text',        desc: 'Generate animation from text', badge: 'NEW' },
    { id: 'interpolate-new',       title: 'Interpolate',              desc: 'Animate between two frames', badge: 'NEW' },
    { id: 'create-animated',       title: 'Create animated object/character', desc: 'Generate animation from text', badge: 'PRO' },
    { id: 'animate-with-text-pro', title: 'Animate with text',        desc: 'Add animation to existing image', badge: 'PRO' },
    { id: 'edit-animation',        title: 'Edit animation',           desc: 'Modify frames of an animation', badge: 'PRO' },
    { id: 'transfer-outfit',       title: 'Transfer outfit to animation', desc: 'Apply outfit to another animation', badge: 'PRO' },
    { id: 'interpolate-pro',       title: 'Interpolate',              desc: 'Smooth transitions between frames', badge: 'PRO' },
  ],
  utility: [
    { id: 'unzoom',              title: 'Unzoom',              desc: 'Detect pixel scale and downscale', badge: 'NEW' },
    { id: 'remove-background',   title: 'Remove background',   desc: 'Remove background from image', badge: 'NEW' },
    { id: 'pixel-art-correction',title: 'Pixel art correction',desc: 'Clean up and refine pixel art', badge: 'NEW' },
  ],
};

const TABS = [
  { id: 'create',    label: 'Create' },
  { id: 'transform', label: 'Transform' },
  { id: 'animate',   label: 'Animate' },
  { id: 'utility',   label: 'Utility' },
];

function BadgePill({ badge }: { badge: Badge }) {
  const styles: Record<Badge, React.CSSProperties> = {
    NEW: { background: 'var(--pb-mint-2, #c8f3df)', color: 'var(--pb-mint-ink, #0f5e44)' },
    PRO: { background: 'rgba(155,120,220,0.18)', color: '#7a5cc4' },
    EXPERIMENTAL: { background: 'rgba(220,170,90,0.18)', color: '#a06f1f' },
  };
  return (
    <span
      style={{
        ...styles[badge],
        fontSize: 9,
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 4,
        letterSpacing: 0.3,
        flexShrink: 0,
      }}
    >
      {badge}
    </span>
  );
}

function ToolCard({ tool, onSelect }: { tool: Tool; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tool.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '10px 12px',
        borderRadius: 10,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'border-color 120ms, background 120ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--pb-ink)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--pb-line-2)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)', lineHeight: 1.2 }}>
          {tool.title}
        </span>
        {tool.badge && <BadgePill badge={tool.badge} />}
      </div>
      <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.3 }}>{tool.desc}</span>
    </button>
  );
}

export function PixelLabPanel() {
  const [active, setActive] = useState<Category>('create');

  const handleSelect = (toolId: string) => {
    // TODO: wire to PixelLab tool config view / MCP call
    console.log('[pixellab] selected', toolId);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div style={{ padding: '10px 12px 0' }}>
        <PanelCategoryTabs
          tabs={TABS}
          activeTab={active}
          onChange={(id) => setActive(id as Category)}
        />
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '4px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TOOLS[active].map((tool) => (
          <ToolCard key={tool.id} tool={tool} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
