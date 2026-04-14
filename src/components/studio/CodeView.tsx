'use client';
import { useMemo, useState } from 'react';
import { X, Copy, Check, FileCode, FileText, Gamepad2 } from 'lucide-react';

interface CodeViewProps {
  html: string;
  fileName: string;
  /** If provided, use this content directly instead of extracting from HTML */
  fileContent?: string;
  onClose: () => void;
  onSwitchToPreview: () => void;
}

/** Extract the content for a virtual file name from the full game HTML */
function extractFileContent(html: string, fileName: string): string {
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

  // CDN reference
  if (fileName.endsWith('.js')) {
    const match = html.match(new RegExp(`src="([^"]*${fileName.replace('.', '\\.')}[^"]*)"`));
    return match ? `// CDN source:\n// ${match[1]}` : `// ${fileName}`;
  }

  return '// Unknown file';
}

function getFileIcon(name: string) {
  if (name.endsWith('.css')) return FileText;
  return FileCode;
}

function getFileColor(name: string) {
  if (name === 'index.html') return 'text-orange-400';
  if (name.endsWith('.css')) return 'text-blue-400';
  return 'text-yellow-400';
}

export function CodeView({ html, fileName, fileContent, onClose, onSwitchToPreview }: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const content = useMemo(
    () => fileContent ?? extractFileContent(html, fileName),
    [html, fileName, fileContent],
  );
  const lines = useMemo(() => content.split('\n'), [content]);
  const Icon = getFileIcon(fileName);
  const color = getFileColor(fileName);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-0 border-b border-white/[0.06] bg-panel-surface/50">
        {/* Preview tab */}
        <button
          onClick={onSwitchToPreview}
          className="flex items-center gap-1.5 px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent transition-colors"
        >
          <Gamepad2 size={12} />
          Preview
        </button>
        {/* Active file tab */}
        <div className="flex items-center gap-1.5 px-4 py-2 text-xs text-zinc-200 border-b-2 border-accent bg-white/[0.03]">
          <Icon size={12} className={color} />
          {fileName}
          <button
            onClick={onClose}
            className="ml-1 p-0.5 rounded hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
        {/* Copy button */}
        <div className="ml-auto pr-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
          >
            {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 min-h-0 overflow-auto bg-[#0d0d0d] font-mono text-[12px] leading-[1.6] select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="sticky left-0 w-12 text-right pr-4 pl-4 text-zinc-700 select-none bg-[#0d0d0d] border-r border-white/[0.04]">
                  {i + 1}
                </td>
                <td className="pl-4 pr-4 whitespace-pre text-zinc-300">
                  {line || '\u00A0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
