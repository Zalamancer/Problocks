'use client';
import { useState } from 'react';
import { PanelCategoryTabs } from '@/components/ui/panel-controls';
import {
  TOOLS_BY_CATEGORY,
  findTool,
  type Category,
  type Badge,
  type ToolSchema,
} from '@/lib/pixellab-tools';
import { PixelLabToolForm } from './PixelLabToolForm';

const TABS: { id: Category; label: string }[] = [
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

function ToolCard({ tool, onSelect }: { tool: ToolSchema; onSelect: (id: string) => void }) {
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

function EmptyCategory({ category }: { category: Category }) {
  return (
    <div
      style={{
        padding: '24px 12px',
        textAlign: 'center',
        color: 'var(--pb-ink-muted)',
        fontSize: 12,
        lineHeight: 1.5,
      }}
    >
      <p style={{ fontWeight: 600, color: 'var(--pb-ink)', marginBottom: 4 }}>
        No {category} tools yet
      </p>
      <p>
        PixelLab&apos;s MCP server hasn&apos;t exposed {category}-class tools yet.
        Add them here once the MCP catalog includes them, or wire PixelLab&apos;s
        REST API directly.
      </p>
    </div>
  );
}

export function PixelLabPanel() {
  const [active, setActive] = useState<Category>('create');
  const [openToolId, setOpenToolId] = useState<string | null>(null);

  const openTool = openToolId ? findTool(openToolId) : null;

  if (openTool) {
    return <PixelLabToolForm tool={openTool} onBack={() => setOpenToolId(null)} />;
  }

  const tools = TOOLS_BY_CATEGORY[active];

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
        {tools.length === 0 ? (
          <EmptyCategory category={active} />
        ) : (
          tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={setOpenToolId} />
          ))
        )}
      </div>
    </div>
  );
}
