'use client';
import { Sparkles, Image as ImageIcon, Box, Music, Mic, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Pill, SectionLabel, ToneBadge, type PBTone } from '@/components/ui';

// Ported 1:1 from design bundle:
//   /tmp/design_bundle/problocks/project/studio/leftpanel.jsx → ConnectorsTab
// Uses the chunky pastel/stacked-shadow atoms (Pill, ToneBadge, SectionLabel)
// so the look matches the design's `box-shadow: 0 1px 0 var(--line-2)` paper
// cards with 1.5px ink borders and bright pastel icon tiles.

interface Connector {
  id: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  tone: Exclude<PBTone, 'paper' | 'ink'>;
  connected: boolean;
}

const CONNECTORS: Connector[] = [
  { id: 'claude',   icon: Sparkles,  label: 'Claude',     sub: 'AI · Logic & code', tone: 'grape',  connected: true  },
  { id: 'pixellab', icon: ImageIcon, label: 'PixelLab',   sub: 'AI · Pixel art',    tone: 'pink',   connected: true  },
  { id: 'meshy',    icon: Box,       label: 'Meshy',      sub: 'AI · 3D models',    tone: 'sky',    connected: true  },
  { id: 'suno',     icon: Music,     label: 'Suno',       sub: 'AI · Music',        tone: 'mint',   connected: true  },
  { id: 'eleven',   icon: Mic,       label: 'ElevenLabs', sub: 'AI · Voice',        tone: 'butter', connected: false },
];

function ConnectorRow({ c }: { c: Connector }) {
  return (
    <div
      draggable
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        boxShadow: '0 1px 0 var(--pb-line-2)',
        cursor: 'grab',
      }}
    >
      <ToneBadge tone={c.tone} icon={c.icon} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>
          {c.label}
        </div>
        <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
          {c.sub}
        </div>
      </div>
      {c.connected ? (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--pb-mint-ink)',
            flexShrink: 0,
          }}
          aria-label="Connected"
          title="Connected"
        />
      ) : (
        <Pill tone="butter">Connect</Pill>
      )}
    </div>
  );
}

export function ConnectorsPanel() {
  const connectedCount = CONNECTORS.filter((c) => c.connected).length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: 14 }}>
        <SectionLabel
          trailing={
            <span style={{ color: 'var(--pb-mint-ink)', fontWeight: 700 }}>
              {connectedCount} connected
            </span>
          }
        >
          AI Connectors
        </SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CONNECTORS.map((c) => (
            <ConnectorRow key={c.id} c={c} />
          ))}
        </div>

        <div style={{ height: 20 }} />
        <SectionLabel>Add more</SectionLabel>
        <button
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: 10,
            borderRadius: 12,
            border: '1.5px dashed var(--pb-line-2)',
            background: 'transparent',
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--pb-ink-muted)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Plus size={13} />
          Browse marketplace
        </button>
      </div>
    </div>
  );
}
