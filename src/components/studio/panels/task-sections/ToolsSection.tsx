'use client';
import { cn } from '@/lib/utils';
import { PanelSection, PanelMultiSelect } from '@/components/ui/panel-controls';
import type { AITool } from '@/lib/templates/types';

const AI_TOOL_INFO: Record<AITool, { name: string; desc: string; iconColor: string; bgColor: string }> = {
  claude:     { name: 'Claude',     desc: 'AI code, logic & narrative', iconColor: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  pixellab:   { name: 'PixelLab',   desc: 'Pixel art & sprites',        iconColor: 'text-pink-400',   bgColor: 'bg-pink-500/10'   },
  meshy:      { name: 'Meshy',      desc: '3D model generation',        iconColor: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  suno:       { name: 'Suno',       desc: 'Background music',           iconColor: 'text-green-400',  bgColor: 'bg-green-500/10'  },
  elevenlabs: { name: 'ElevenLabs', desc: 'Voice & sound effects',      iconColor: 'text-blue-400',   bgColor: 'bg-blue-500/10'   },
  freepik:    { name: 'Freepik',    desc: 'Stock art & textures',       iconColor: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
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
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg', info.bgColor)}
                >
                  <span className={cn('text-xs font-semibold w-20 shrink-0', info.iconColor)}>
                    {info.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 leading-tight">{info.desc}</span>
                </div>
              );
            })}
          </div>
        </PanelSection>
      )}
    </div>
  );
}
