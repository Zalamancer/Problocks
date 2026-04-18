'use client';
import { Sparkles, Image as ImageIcon, Box, Music, Mic, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Ported from /tmp/design_bundle/problocks/project/studio/leftpanel.jsx → ConnectorsTab.
// Keeps the same roster + tones, rebuilt against Problocks panel tokens so the
// cream/light/dark theme switcher picks up the palette automatically.

interface Connector {
  id: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  // Tailwind util class set per tone — chosen so the existing theme overrides
  // (see src/styles/themes/*) can recolor them without forking this component.
  tone: 'grape' | 'pink' | 'sky' | 'mint' | 'butter';
  connected: boolean;
}

const CONNECTORS: Connector[] = [
  { id: 'claude',   icon: Sparkles,  label: 'Claude',     sub: 'AI · Logic & code', tone: 'grape',  connected: true },
  { id: 'pixellab', icon: ImageIcon, label: 'PixelLab',   sub: 'AI · Pixel art',    tone: 'pink',   connected: true },
  { id: 'meshy',    icon: Box,       label: 'Meshy',      sub: 'AI · 3D models',    tone: 'sky',    connected: true },
  { id: 'suno',     icon: Music,     label: 'Suno',       sub: 'AI · Music',        tone: 'mint',   connected: true },
  { id: 'eleven',   icon: Mic,       label: 'ElevenLabs', sub: 'AI · Voice',        tone: 'butter', connected: false },
];

// Tone → Tailwind colour utilities. Dark-theme defaults; cream/light themes
// recolour via the global `.light`/`.cream` overrides.
const TONE_CLASSES: Record<Connector['tone'], { bg: string; text: string; ring: string }> = {
  grape:  { bg: 'bg-purple-500/15', text: 'text-purple-300', ring: 'ring-purple-500/40' },
  pink:   { bg: 'bg-pink-500/15',   text: 'text-pink-300',   ring: 'ring-pink-500/40'   },
  sky:    { bg: 'bg-sky-500/15',    text: 'text-sky-300',    ring: 'ring-sky-500/40'    },
  mint:   { bg: 'bg-emerald-500/15',text: 'text-emerald-300',ring: 'ring-emerald-500/40'},
  butter: { bg: 'bg-amber-500/15',  text: 'text-amber-300',  ring: 'ring-amber-500/40'  },
};

function ConnectorRow({ c }: { c: Connector }) {
  const Icon = c.icon;
  const t = TONE_CLASSES[c.tone];
  return (
    <div
      draggable
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-panel-surface border border-panel-border hover:bg-panel-surface-hover cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ring-1 ${t.bg} ${t.text} ${t.ring}`}>
        <Icon size={16} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-zinc-100 truncate">{c.label}</div>
        <div className="text-xs text-zinc-500 truncate">{c.sub}</div>
      </div>
      {c.connected ? (
        <span
          className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"
          aria-label="Connected"
          title="Connected"
        />
      ) : (
        <button
          type="button"
          className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
}

export function ConnectorsPanel() {
  const connectedCount = CONNECTORS.filter((c) => c.connected).length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-3">
        {/* Section label */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
            AI Connectors
          </span>
          <span className="text-[11px] font-medium text-emerald-400">
            {connectedCount} connected
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {CONNECTORS.map((c) => (
            <ConnectorRow key={c.id} c={c} />
          ))}
        </div>

        {/* Add more */}
        <div className="mt-5 mb-2 px-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
            Add more
          </span>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-panel-border text-xs font-semibold text-zinc-500 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
        >
          <Plus size={13} />
          Browse marketplace
        </button>
      </div>
    </div>
  );
}
