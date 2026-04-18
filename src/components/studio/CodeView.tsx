'use client';
import { useMemo, useState, useEffect, useRef, Fragment } from 'react';
import {
  Copy,
  Check,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CodeViewProps {
  html: string;
  fileName: string;
  /** If provided, use this content directly instead of extracting from HTML. */
  fileContent?: string;
  /** Full file map for the active game — drives the right file list. */
  files?: Record<string, string> | null;
  onClose: () => void;
  onSwitchToPreview: () => void;
  onSelectFile?: (name: string) => void;
}

/* --------------------------- file extraction --------------------------- */

function extractFileContent(html: string, fileName: string): string {
  if (!html) return '';
  if (fileName === 'index.html') return html;

  if (fileName === 'game.js') {
    const matches = [...html.matchAll(/<script(?:\s[^>]*)?>(?![\s]*$)([\s\S]*?)<\/script>/gi)];
    const inline = matches.filter((m) => !/<script\s+src=/i.test(m[0]));
    return inline.map((m) => m[1].trim()).join('\n\n// ── next block ──\n\n') || '// No inline scripts found';
  }
  if (fileName === 'styles.css') {
    const matches = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    return matches.map((m) => m[1].trim()).join('\n\n/* ── next block ── */\n\n') || '/* No inline styles found */';
  }
  if (fileName.endsWith('.js')) {
    const match = html.match(new RegExp(`src="([^"]*${fileName.replace('.', '\\.')}[^"]*)"`));
    return match ? `// CDN source:\n// ${match[1]}` : `// ${fileName}`;
  }
  return `// ${fileName}`;
}

/* ------------------------------- file meta ------------------------------ */

interface FileMeta {
  icon: LucideIcon;
  tone: string;
  ink: string;
  group: string;
  language: string;
}

function metaFor(name: string): FileMeta {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'json') {
    return { icon: FileJson, tone: '#d6f0c2', ink: '#3f6a2a', group: name.includes('level') ? 'levels/' : 'data/', language: 'JSON' };
  }
  if (ext === 'sprite' || ext === 'png' || ext === 'jpg' || ext === 'webp') {
    return { icon: ImageIcon, tone: '#f5c8d7', ink: '#8b3654', group: 'assets/', language: 'Sprite' };
  }
  if (ext === 'css') {
    return { icon: FileText, tone: '#c9e0f5', ink: '#2c5c8a', group: 'styles/', language: 'CSS' };
  }
  if (ext === 'html') {
    return { icon: FileCode, tone: '#f9d7b8', ink: '#a2581e', group: '', language: 'HTML' };
  }
  return { icon: FileCode, tone: '#f5e49a', ink: '#8c6f1a', group: '', language: 'JavaScript' };
}

/* -------------------------- syntax highlighting ------------------------- */

type Tok = { t: string; c: 'kw' | 'str' | 'num' | 'com' | 'fn' | 'pun' | 'dflt' };

const KEYWORDS = new Set([
  'const','let','var','function','return','if','else','for','while','do','switch','case','break',
  'continue','new','import','export','from','as','class','extends','super','this','typeof','in','of',
  'true','false','null','undefined','async','await','try','catch','finally','throw','default',
]);

function tokenize(line: string, lang: string): Tok[] {
  const isJson = lang === 'JSON';
  const out: Tok[] = [];
  let i = 0;
  const push = (t: string, c: Tok['c']) => { if (t) out.push({ t, c }); };

  while (i < line.length) {
    const ch = line[i];

    if (!isJson && ch === '/' && line[i + 1] === '/') {
      push(line.slice(i), 'com');
      return out;
    }

    if (ch === '"' || ch === '\'' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j += 2; else j++;
      }
      push(line.slice(i, Math.min(j + 1, line.length)), 'str');
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(line[i + 1] ?? ''))) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      push(line.slice(i, j), 'num');
      i = j;
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (!isJson && KEYWORDS.has(word)) push(word, 'kw');
      else if (!isJson && line[j] === '(') push(word, 'fn');
      else push(word, 'dflt');
      i = j;
      continue;
    }

    if (/[{}()[\];,:.=+\-*/<>!&|?]/.test(ch)) {
      push(ch, 'pun');
      i++;
      continue;
    }

    push(ch, 'dflt');
    i++;
  }
  return out;
}

const TOKEN_COLOR: Record<Tok['c'], string> = {
  kw:   '#7a4fbf',
  str:  '#3f7a3a',
  num:  '#b3621e',
  com:  '#9a8a5a',
  fn:   '#3a5ea8',
  pun:  '#5a544a',
  dflt: 'var(--pb-ink)',
};

/* -------------------------------- view --------------------------------- */

export function CodeView({
  html,
  fileName,
  fileContent,
  files,
  onClose: _onClose,
  onSwitchToPreview: _onSwitchToPreview,
  onSelectFile: _onSelectFile,
}: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoWrapRef = useRef<HTMLDivElement>(null);

  const fileEntries: [string, string][] = useMemo(() => {
    if (files && Object.keys(files).length > 0) return Object.entries(files);
    if (html) return [['game.js', extractFileContent(html, 'game.js')]];
    return [[fileName, fileContent ?? '']];
  }, [files, html, fileName, fileContent]);

  const activeMeta = metaFor(fileName);

  const content = useMemo(() => {
    if (fileContent !== undefined) return fileContent;
    if (files && files[fileName] != null) return files[fileName];
    return extractFileContent(html, fileName);
  }, [html, fileName, fileContent, files]);

  const lines = useMemo(() => content.split('\n'), [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Close info popup on outside click / escape
  useEffect(() => {
    if (!infoOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (infoWrapRef.current && !infoWrapRef.current.contains(e.target as Node)) setInfoOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setInfoOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [infoOpen]);

  return (
    <div className="flex-1 min-h-0 flex" style={{ background: 'var(--pb-paper)' }}>
      {/* ── Center: code pane ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* File header row */}
        <div
          className="shrink-0 flex items-center gap-3"
          style={{ padding: '12px 18px', borderBottom: '1.5px solid var(--pb-line-2)' }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>{fileName}</div>

          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 999,
              fontSize: 11, fontWeight: 700,
              color: '#2b4a1d', background: '#dff3d1', border: '1.5px solid #a7c98a',
            }}
          >
            <Sparkles size={11} strokeWidth={2.4} />
            Generated by Claude
          </span>

          <div style={{ flex: 1 }} />

          {/* Info popup trigger */}
          <div ref={infoWrapRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setInfoOpen((v) => !v)}
              aria-label="File info"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8,
                background: infoOpen ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
                color: 'var(--pb-ink)', border: '1.5px solid var(--pb-ink)',
                boxShadow: '0 2px 0 var(--pb-ink)',
                cursor: 'pointer',
              }}
            >
              <Info size={14} strokeWidth={2.4} />
            </button>

            {infoOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 260, padding: 14, borderRadius: 12,
                  background: 'var(--pb-paper)',
                  border: '1.5px solid var(--pb-ink)',
                  boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.15)',
                  zIndex: 60,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--pb-ink)' }}>Generated</div>
                    <div style={{ fontSize: 11.5, color: 'var(--pb-ink-soft)', marginTop: 2, lineHeight: 1.35 }}>
                      Everything here comes from your graph.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInfoOpen(false)}
                    aria-label="Close"
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: 'transparent', color: 'var(--pb-ink-muted)',
                      border: 0, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>
                </div>

                <InspectorCard label="LANGUAGE" value={activeMeta.language + (activeMeta.language === 'JavaScript' ? ' + JSON' : '')} />
                <InspectorCard label="ENGINE" value="ProBlocks Engine 1.4" />
                <InspectorCard label="FILES" value={String(fileEntries.length)} />
                <InspectorCard label="LAST BUILD" value="Just now · 182 ms" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 8,
              background: 'var(--pb-paper)', color: 'var(--pb-ink)',
              border: '1.5px solid var(--pb-ink)', boxShadow: '0 2px 0 var(--pb-ink)',
              fontSize: 12, fontFamily: 'inherit', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} strokeWidth={2.6} /> : <Copy size={12} strokeWidth={2.4} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Code body */}
        <div
          className="flex-1 min-h-0 overflow-auto select-text"
          style={{
            background: 'var(--pb-paper)',
            fontFamily: "'JetBrains Mono', 'Menlo', ui-monospace, monospace",
            fontSize: 12.5, lineHeight: 1.7,
            color: 'var(--pb-ink)',
          }}
        >
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              {lines.map((line, i) => {
                const toks = tokenize(line, activeMeta.language);
                return (
                  <tr key={i}>
                    <td
                      style={{
                        width: 44, minWidth: 44,
                        textAlign: 'right', paddingRight: 14, paddingLeft: 14,
                        color: 'var(--pb-ink-muted)',
                        userSelect: 'none',
                        fontVariantNumeric: 'tabular-nums',
                        verticalAlign: 'top',
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ paddingLeft: 4, paddingRight: 18, whiteSpace: 'pre' }}>
                      {toks.length === 0 ? '\u00A0' : (
                        toks.map((tk, k) => (
                          <Fragment key={k}>
                            <span style={{ color: TOKEN_COLOR[tk.c] }}>{tk.t}</span>
                          </Fragment>
                        ))
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function InspectorCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '8px 10px', borderRadius: 9,
        background: 'var(--pb-cream-2)', border: '1.5px solid var(--pb-line-2)',
      }}
    >
      <div
        style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          color: 'var(--pb-ink-muted)', marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pb-ink)' }}>{value}</div>
    </div>
  );
}
