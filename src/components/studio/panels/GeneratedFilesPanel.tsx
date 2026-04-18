'use client';
import {
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FileMeta {
  icon: LucideIcon;
  tone: string;
  ink: string;
  group: string;
}

function metaFor(name: string): FileMeta {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'json') {
    return { icon: FileJson, tone: '#d6f0c2', ink: '#3f6a2a', group: name.includes('level') ? 'levels/' : 'data/' };
  }
  if (ext === 'sprite' || ext === 'png' || ext === 'jpg' || ext === 'webp') {
    return { icon: ImageIcon, tone: '#f5c8d7', ink: '#8b3654', group: 'assets/' };
  }
  if (ext === 'css') {
    return { icon: FileText, tone: '#c9e0f5', ink: '#2c5c8a', group: 'styles/' };
  }
  if (ext === 'html') {
    return { icon: FileCode, tone: '#f9d7b8', ink: '#a2581e', group: '' };
  }
  return { icon: FileCode, tone: '#f5e49a', ink: '#8c6f1a', group: '' };
}

interface GeneratedFilesPanelProps {
  files: string[];
  activeFile: string | null;
  onSelectFile: (name: string) => void;
}

export function GeneratedFilesPanel({ files, activeFile, onSelectFile }: GeneratedFilesPanelProps) {
  const entries = files.length > 0 ? files : (activeFile ? [activeFile] : []);

  return (
    <aside
      className="shrink-0 flex flex-col rounded-xl overflow-hidden"
      style={{
        width: 240,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        padding: '16px 12px',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
          color: 'var(--pb-ink-muted)', padding: '0 4px 4px',
        }}
      >
        GENERATED
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {entries.map((name) => {
          const m = metaFor(name);
          const Icon = m.icon;
          const active = name === activeFile;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectFile(name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10,
                background: active ? 'var(--pb-cream-2)' : 'transparent',
                border: active ? '1.5px solid var(--pb-ink)' : '1.5px solid transparent',
                boxShadow: active ? '0 2px 0 var(--pb-ink)' : 'none',
                color: 'var(--pb-ink)', fontFamily: 'inherit', fontSize: 12.5,
                textAlign: 'left', cursor: 'pointer', minWidth: 0,
              }}
            >
              <span
                style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: m.tone,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={14} strokeWidth={2.2} style={{ color: m.ink }} />
              </span>
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontWeight: 700 }} className="truncate">{name}</span>
                {m.group && (
                  <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}>
                    {m.group}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12,
          background: '#dff3d1',
          border: '1.5px solid #a7c98a',
          boxShadow: '0 2px 0 #a7c98a',
        }}
      >
        <CheckCircle2 size={18} strokeWidth={2.2} style={{ color: '#3f6a2a', flexShrink: 0 }} />
        <div style={{ minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#2b4a1d' }}>Build passed</div>
          <div style={{ fontSize: 10.5, color: '#55744a', fontWeight: 600 }}>
            Assets in sync · 1 lint note
          </div>
        </div>
      </div>
    </aside>
  );
}
