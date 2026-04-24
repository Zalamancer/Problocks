'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { useFreeform3D } from '@/store/freeform3d-store';

/**
 * Settings dropdown for the 3D Freeform viewport. Lives in the TopToolbar
 * next to the Scenes menu. Today it hosts the play-mode camera mode
 * toggle; future options (grid toggle, snap grain, theme overrides) can
 * slot in under additional labels below the divider.
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cameraMode = useFreeform3D((s) => s.cameraMode);
  const setCameraMode = useFreeform3D((s) => s.setCameraMode);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Viewport settings"
        aria-label="Viewport settings"
        className="transition-colors"
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8,
          background: open ? 'var(--pb-cream-2)' : 'transparent',
          color: 'var(--pb-ink)',
          border: 0, cursor: 'pointer',
        }}
      >
        <Settings size={14} strokeWidth={2.2} />
      </button>

      {open && (
        <div
          className="z-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)', right: 0,
            minWidth: 220,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            borderRadius: 12,
            boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.12)',
            padding: 8,
          }}
        >
          <div
            className="px-2 py-1 text-[10px]"
            style={{ color: 'var(--pb-ink-muted)', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}
          >
            Play camera
          </div>
          <ModeRow active={cameraMode === 'third'} label="Third-person (follow)" onClick={() => setCameraMode('third')} />
          <ModeRow active={cameraMode === 'first'} label="First-person"          onClick={() => setCameraMode('first')} />
        </div>
      )}
    </div>
  );
}

function ModeRow({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px',
        borderRadius: 8,
        background: active ? 'var(--pb-cream-2)' : 'transparent',
        color: 'var(--pb-ink)',
        border: 0,
        fontSize: 12.5, fontWeight: active ? 700 : 500,
        fontFamily: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ width: 14, display: 'flex', justifyContent: 'center', color: active ? 'var(--pb-ink)' : 'transparent' }}>
        <Check size={12} strokeWidth={2.6} />
      </span>
      {label}
    </button>
  );
}
