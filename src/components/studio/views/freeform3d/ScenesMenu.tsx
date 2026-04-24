'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Upload, Plus, Trash2, Check } from 'lucide-react';
import { useFreeform3D } from '@/store/freeform3d-store';

/**
 * Scenes dropdown for the 3D Freeform studio. Lives in the TopToolbar.
 *
 *  - Shows the current scene name (click to rename — saves on blur/Enter)
 *  - "New scene" — starts an empty scene (adds to undo history)
 *  - "Save as…" — prompts for a name, adds a snapshot to savedScenes
 *  - List of saved scenes; click to load, ✕ to delete
 *  - Import JSON (file picker)
 *  - Export JSON (downloads as <name>.json or scene.json)
 */
export function ScenesMenu() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentName = useFreeform3D((s) => s.currentSceneName);
  const savedScenes = useFreeform3D((s) => s.savedScenes);
  const saveSceneAs = useFreeform3D((s) => s.saveSceneAs);
  const loadScene = useFreeform3D((s) => s.loadScene);
  const deleteSavedScene = useFreeform3D((s) => s.deleteSavedScene);
  const newScene = useFreeform3D((s) => s.newScene);
  const exportSceneJSON = useFreeform3D((s) => s.exportSceneJSON);
  const importSceneJSON = useFreeform3D((s) => s.importSceneJSON);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const names = Object.keys(savedScenes).sort();

  const handleSaveAs = () => {
    const name = window.prompt('Save scene as…', currentName ?? 'My Plot');
    if (!name) return;
    saveSceneAs(name);
    setOpen(false);
  };

  const handleNew = () => {
    const ok = window.confirm('Start a new empty scene? (unsaved changes will be lost)');
    if (!ok) return;
    newScene();
    setOpen(false);
  };

  const handleExport = () => {
    const json = exportSceneJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentName ?? 'scene'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const name = file.name.replace(/\.json$/i, '');
      const ok = importSceneJSON(String(reader.result ?? ''), name);
      if (!ok) window.alert('Import failed — file does not look like a scene JSON.');
    };
    reader.readAsText(file);
    e.target.value = '';
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="transition-colors"
        style={{
          height: 32,
          padding: '0 10px',
          display: 'flex', alignItems: 'center', gap: 6,
          background: open ? 'var(--pb-cream-2)' : 'transparent',
          color: 'var(--pb-ink)',
          border: '1.5px solid',
          borderColor: open ? 'var(--pb-ink)' : 'var(--pb-line-2)',
          borderRadius: 8,
          fontSize: 12, fontWeight: 700,
          fontFamily: 'inherit',
          cursor: 'pointer',
          maxWidth: 200,
        }}
      >
        <span
          style={{
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: currentName ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
          }}
        >
          {currentName ?? 'Unsaved scene'}
        </span>
        <ChevronDown size={12} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div
          className="z-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)', right: 0,
            minWidth: 240, maxWidth: 320,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            borderRadius: 12,
            boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.12)',
            padding: 6,
          }}
        >
          <MenuItem icon={<Plus size={13} strokeWidth={2.4} />}      label="New scene"            onClick={handleNew} />
          <MenuItem icon={<Check size={13} strokeWidth={2.4} />}     label="Save as…"             onClick={handleSaveAs} />
          <MenuItem icon={<Download size={13} strokeWidth={2.4} />}  label="Export JSON"          onClick={handleExport} />
          <MenuItem icon={<Upload size={13} strokeWidth={2.4} />}    label="Import JSON…"         onClick={handleImport} />

          {names.length > 0 && (
            <>
              <Divider />
              <div
                className="px-2 pt-2 pb-1 text-[10px]"
                style={{ color: 'var(--pb-ink-muted)', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}
              >
                Saved scenes
              </div>
              {names.map((name) => (
                <SavedSceneRow
                  key={name}
                  name={name}
                  active={name === currentName}
                  onLoad={() => { loadScene(name); setOpen(false); }}
                  onDelete={() => {
                    if (window.confirm(`Delete "${name}"?`)) deleteSavedScene(name);
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onFilePicked}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'transparent',
        color: 'var(--pb-ink)',
        border: 0,
        fontSize: 13, fontWeight: 600,
        fontFamily: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ color: 'var(--pb-ink-muted)', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{ height: 1, background: 'var(--pb-line-2)', margin: '6px 4px' }}
    />
  );
}

function SavedSceneRow({
  name, active, onLoad, onDelete,
}: {
  name: string; active: boolean; onLoad: () => void; onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        borderRadius: 8,
        background: active ? 'var(--pb-cream-2)' : 'transparent',
      }}
    >
      <button
        type="button"
        onClick={onLoad}
        style={{
          flex: 1, minWidth: 0,
          padding: '7px 10px',
          background: 'transparent', border: 0,
          fontSize: 12.5, fontWeight: active ? 700 : 500,
          color: 'var(--pb-ink)',
          fontFamily: 'inherit',
          textAlign: 'left', cursor: 'pointer',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {active ? '● ' : ''}{name}
      </button>
      <button
        type="button"
        onClick={onDelete}
        title={`Delete "${name}"`}
        style={{
          width: 26, height: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 0,
          color: '#c84a4a', cursor: 'pointer',
          borderRadius: 6, marginRight: 4,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fde7e3'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Trash2 size={12} strokeWidth={2.2} />
      </button>
    </div>
  );
}
