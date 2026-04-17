'use client';
import { useRouter } from 'next/navigation';
import { GraduationCap, Zap } from 'lucide-react';
import {
  PanelSection,
  PanelToggle,
  PanelActionButton,
  PanelSelect,
} from '@/components/ui';
import { useQualityStore, type QualityTier } from '@/store/quality-store';

const QUALITY_OPTIONS: { value: QualityTier; label: string }[] = [
  { value: 'low',    label: 'Low — Chromebooks / older laptops' },
  { value: 'medium', label: 'Medium — integrated GPUs' },
  { value: 'high',   label: 'High — gaming laptops / desktops' },
];

export function SettingsPanel() {
  const router = useRouter();
  const tier = useQualityStore((s) => s.tier);
  const userPicked = useQualityStore((s) => s.userPicked);
  const setTier = useQualityStore((s) => s.setTier);
  const resetToAutoDetected = useQualityStore((s) => s.resetToAutoDetected);

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

      <PanelSection title="Performance" collapsible>
        <div className="space-y-3">
          <PanelSelect
            label="Quality"
            value={tier}
            onChange={(v) => setTier(v as QualityTier)}
            options={QUALITY_OPTIONS}
            fullWidth
          />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {tier === 'low' && (
              <>Shadows, anti-aliasing, and panel blur are turned off. Best for
              Chromebooks and older laptops.</>
            )}
            {tier === 'medium' && (
              <>Hard shadows + reduced pixel ratio. Good for integrated graphics.</>
            )}
            {tier === 'high' && (
              <>Soft shadows, anti-aliasing, and full visual effects. Needs a
              modern GPU.</>
            )}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              {userPicked ? 'Set by you' : 'Auto-detected'}
            </span>
            {userPicked && (
              <button
                type="button"
                onClick={resetToAutoDetected}
                className="text-[11px] text-accent hover:underline"
              >
                Reset to auto
              </button>
            )}
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Integrations" noBorder>
        <PanelActionButton
          onClick={() => router.push('/classroom')}
          variant="secondary"
          icon={GraduationCap}
          fullWidth
        >
          Open Google Classroom
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
