'use client';

import { Copy, Trash2, Undo2, Redo2, Eraser } from 'lucide-react';
import { useFreeform3D } from '@/store/freeform3d-store';

/**
 * Floating top-right toolbar for the 3D Freeform studio.
 * Undo/redo + selection actions (duplicate, delete) + clear-all.
 * Sits over the canvas so it's always visible without taking panel space.
 */
export function TopToolbar() {
  const selectedId = useFreeform3D((s) => s.selectedId);
  const undoDepth = useFreeform3D((s) => s.undoStack.length);
  const redoDepth = useFreeform3D((s) => s.redoStack.length);
  const undo = useFreeform3D((s) => s.undo);
  const redo = useFreeform3D((s) => s.redo);
  const duplicateObject = useFreeform3D((s) => s.duplicateObject);
  const removeObject = useFreeform3D((s) => s.removeObject);
  const clearScene = useFreeform3D((s) => s.clearScene);

  const hasSelection = Boolean(selectedId);

  return (
    <div className="pointer-events-none absolute top-4 right-4" style={{ zIndex: 10 }}>
      <div
        className="pointer-events-auto flex items-center gap-1"
        style={{
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 12,
          padding: 6,
          boxShadow: '0 3px 0 var(--pb-line-2)',
        }}
      >
        <ToolbarButton icon={<Undo2 size={14} strokeWidth={2.2} />} label="Undo" disabled={undoDepth === 0} onClick={undo} />
        <ToolbarButton icon={<Redo2 size={14} strokeWidth={2.2} />} label="Redo" disabled={redoDepth === 0} onClick={redo} />
        <Divider />
        <ToolbarButton
          icon={<Copy size={14} strokeWidth={2.2} />}
          label="Duplicate"
          disabled={!hasSelection}
          onClick={() => selectedId && duplicateObject(selectedId)}
        />
        <ToolbarButton
          icon={<Trash2 size={14} strokeWidth={2.2} />}
          label="Delete"
          disabled={!hasSelection}
          onClick={() => selectedId && removeObject(selectedId)}
          destructive
        />
        <Divider />
        <ToolbarButton icon={<Eraser size={14} strokeWidth={2.2} />} label="Clear all" onClick={clearScene} destructive />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="transition-colors"
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: 'transparent',
        color: disabled ? 'var(--pb-ink-faint, #bbb)' : destructive ? '#c84a4a' : 'var(--pb-ink)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = destructive ? '#fde7e3' : 'var(--pb-cream-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        height: 20,
        background: 'var(--pb-line-2)',
        margin: '0 2px',
      }}
    />
  );
}
