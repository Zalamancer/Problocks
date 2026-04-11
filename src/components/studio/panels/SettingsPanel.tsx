'use client';
import { GraduationCap, Zap } from 'lucide-react';
import { PanelSection, PanelToggle, PanelActionButton } from '@/components/ui';

export function SettingsPanel() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
      <PanelSection title="Project">
        <div className="space-y-2 mb-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Credits remaining</span>
            <span className="text-sm font-medium text-accent">2,450</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Classroom</span>
            <span className="text-xs text-gray-600">Not connected</span>
          </div>
        </div>
        <PanelToggle label="Auto-save" checked={true} onChange={() => {}} />
        <PanelToggle label="Show grid" checked={false} onChange={() => {}} description="on canvas" />
      </PanelSection>

      <PanelSection title="Integrations" noBorder>
        <PanelActionButton
          onClick={() => {}}
          variant="secondary"
          icon={GraduationCap}
          fullWidth
        >
          Connect Google Classroom
        </PanelActionButton>
        <div className="mt-3">
          <PanelActionButton
            onClick={() => {}}
            variant="accent"
            icon={Zap}
            fullWidth
          >
            Buy More Credits
          </PanelActionButton>
        </div>
      </PanelSection>
    </div>
  );
}
