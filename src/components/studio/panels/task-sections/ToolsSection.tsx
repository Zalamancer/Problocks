'use client';
import { PanelSection, PanelMultiSelect } from '@/components/ui/panel-controls';
import type { PBTone } from '@/components/ui';
import type { AITool } from '@/lib/templates/types';

type ToolInfo = { name: string; desc: string; tone: Exclude<PBTone, 'paper' | 'ink'> };

const AI_TOOL_INFO: Record<AITool, ToolInfo> = {
  claude:     { name: 'Claude',     desc: 'AI code, logic & narrative', tone: 'grape'  },
  pixellab:   { name: 'PixelLab',   desc: 'Pixel art & sprites',        tone: 'pink'   },
  meshy:      { name: 'Meshy',      desc: '3D model generation',        tone: 'sky'    },
  suno:       { name: 'Suno',       desc: 'Background music',           tone: 'mint'   },
  elevenlabs: { name: 'ElevenLabs', desc: 'Voice & sound effects',      tone: 'butter' },
  freepik:    { name: 'Freepik',    desc: 'Stock art & textures',       tone: 'coral'  },
};

const AI_TOOL_OPTIONS: { value: AITool; label: string }[] = [
  { value: 'claude',     label: 'Claude' },
  { value: 'pixellab',   label: 'PixelLab' },
  { value: 'meshy',      label: 'Meshy' },
  { value: 'suno',       label: 'Suno' },
  { value: 'elevenlabs', label: 'ElevenLabs' },
  { value: 'freepik',    label: 'Freepik' },
];

interface ToolsSectionProps {
  tools: AITool[];
  onToolsChange: (next: AITool[]) => void;
}

export function ToolsSection({ tools, onToolsChange }: ToolsSectionProps) {
  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="AI Tools" badge={tools.length} collapsible>
        <PanelMultiSelect
          options={AI_TOOL_OPTIONS}
          value={tools}
          onChange={(ids) => onToolsChange(ids as AITool[])}
          placeholder="No tools selected"
          emptyMessage="No tools available"
        />
      </PanelSection>

      {tools.length > 0 && (
        <PanelSection title="Preview" collapsible noBorder>
          <div className="space-y-2">
            {tools.map((tool) => {
              const info = AI_TOOL_INFO[tool];
              return (
                <div
                  key={tool}
                  className="flex items-center gap-3"
                  style={{
                    padding: '9px 11px',
                    borderRadius: 10,
                    background: `var(--pb-${info.tone})`,
                    border: `1.5px solid var(--pb-${info.tone}-ink)`,
                  }}
                >
                  <span
                    className="w-20 shrink-0"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: `var(--pb-${info.tone}-ink)`,
                    }}
                  >
                    {info.name}
                  </span>
                  <span
                    className="leading-tight"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: `var(--pb-${info.tone}-ink)`,
                      opacity: 0.8,
                    }}
                  >
                    {info.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </PanelSection>
      )}
    </div>
  );
}
