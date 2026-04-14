'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Send, Copy, Check } from 'lucide-react';
import { getGameHtml } from '@/lib/game-engine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error' | 'status';
  text: string;
}

export function StudioTerminal({
  onClose,
  isMaximized,
  onToggleMaximize,
  onGameGenerated,
  activeGameName,
}: {
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onGameGenerated?: (html: string, files?: Record<string, string>) => void;
  activeGameName?: string | null;
}) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', text: '  Problocks Game Engine' },
    { type: 'system', text: '  Describe a game and I\'ll build it instantly.' },
    { type: 'system', text: '  Example: "make a space shooter with power-ups"' },
    { type: 'system', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inCodeFenceRef = useRef<boolean>(false);
  const lastResponseRef = useRef<string>('');
  const hasShownResume = useRef(false);
  const receivedGameEventRef = useRef(false);

  // Show "continue working on" message once store hydrates and activeGameName arrives
  useEffect(() => {
    if (activeGameName && !hasShownResume.current && !isStreaming) {
      hasShownResume.current = true;
      setLines([
        { type: 'system', text: '  Problocks Game Engine' },
        { type: 'status', text: `  🎮 Continue working on: ${activeGameName}` },
        { type: 'system', text: '  Describe changes to update your game.' },
        { type: 'system', text: '' },
      ]);
    }
  }, [activeGameName, isStreaming]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    // Handle /clear command
    if (trimmed === '/clear') {
      setLines([
        { type: 'system', text: '  Terminal cleared.' },
        { type: 'system', text: '' },
      ]);
      setMessages([]);
      setInput('');
      return;
    }

    // Handle /help command
    if (trimmed === '/help') {
      setLines((prev) => [
        ...prev,
        { type: 'input', text: `> ${trimmed}` },
        { type: 'system', text: '' },
        { type: 'system', text: '  Commands:' },
        { type: 'system', text: '  /clear    — Clear terminal and conversation' },
        { type: 'system', text: '  /help     — Show this help' },
        { type: 'system', text: '  /model    — Show current model' },
        { type: 'system', text: '' },
        { type: 'system', text: '  Describe a game to generate it. Follow up to iterate.' },
        { type: 'system', text: '  Examples:' },
        { type: 'system', text: '    "make a flappy bird clone"' },
        { type: 'system', text: '    "make the bird faster and add pipes"' },
        { type: 'system', text: '' },
      ]);
      setInput('');
      return;
    }

    if (trimmed === '/model') {
      setLines((prev) => [
        ...prev,
        { type: 'input', text: `> ${trimmed}` },
        { type: 'system', text: '  Model: claude-sonnet-4-20250514' },
        { type: 'system', text: '' },
      ]);
      setInput('');
      return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLines((prev) => [...prev, { type: 'input', text: `> ${trimmed}` }]);
    setIsStreaming(true);

    // Streaming region tracking
    const streamLineIndex = { current: -1 };
    receivedGameEventRef.current = false;

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        setLines((prev) => [
          ...prev,
          { type: 'error', text: `  Error: ${res.status} — ${errorText.slice(0, 200)}` },
          { type: 'system', text: '' },
        ]);
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = ''; // Full response (for message history + HTML extraction)
      let displayText = ''; // Current streaming block (resets between tool rounds)

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const dataLines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of dataLines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);

            // Status events — freeze current text block, show status line
            if (parsed.status) {
              if (streamLineIndex.current !== -1) {
                // Freeze the current streaming text (it stays as-is in lines)
                streamLineIndex.current = -1;
                displayText = '';
              }
              setLines((prev) => [
                ...prev,
                { type: 'status', text: `  ${parsed.status}` },
              ]);
            }

            // Multi-file game event — bundle files into HTML
            if (parsed.game) {
              const { title, files } = parsed.game as { title: string; files: Record<string, string> };
              const html = getGameHtml({ files });
              receivedGameEventRef.current = true;

              if (onGameGenerated) {
                onGameGenerated(html, files);
              }

              setLines(prev => [
                ...prev,
                { type: 'status', text: `  🎮 ${title} loaded! (${Object.keys(files).length} modules)` },
                { type: 'status', text: `  📁 ${Object.keys(files).join(', ')}` },
                { type: 'system', text: '' },
              ]);
            }

            // Text events — stream into current display block
            // Split each chunk on ``` boundaries so we handle cases where
            // both the opening and closing fence arrive in a single event.
            if (parsed.text) {
              assistantText += parsed.text;

              const segments = parsed.text.split('```');
              for (let si = 0; si < segments.length; si++) {
                // Each split boundary means we crossed a ``` marker
                if (si > 0) {
                  inCodeFenceRef.current = !inCodeFenceRef.current;
                  streamLineIndex.current = -1;
                  displayText = '';
                  if (inCodeFenceRef.current) {
                    setLines((prev) => [
                      ...prev,
                      { type: 'status', text: '  📝 Writing game code...' },
                    ]);
                  } else {
                    setLines((prev) => [
                      ...prev,
                      { type: 'status', text: '  ✅ Game code ready' },
                    ]);
                  }
                }

                const seg = segments[si];
                if (!seg || inCodeFenceRef.current) continue;

                // Outside fence — display text normally
                displayText += seg;
                if (streamLineIndex.current === -1) {
                  setLines((prev) => {
                    streamLineIndex.current = prev.length;
                    return [...prev, ...formatOutput(displayText)];
                  });
                } else {
                  setLines((prev) => {
                    const updated = [...prev];
                    const formatted = formatOutput(displayText);
                    updated.splice(
                      streamLineIndex.current,
                      updated.length - streamLineIndex.current,
                      ...formatted,
                    );
                    return updated;
                  });
                }
              }
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Finalize
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      // Store the response text without code fences for the copy button
      lastResponseRef.current = assistantText.replace(/```[\w]*\s*[\s\S]*?```/g, '').trim();
      inCodeFenceRef.current = false;
      setLines((prev) => [...prev, { type: 'system', text: '' }]);

      // Extract HTML game code and send to preview (legacy fallback)
      if (!receivedGameEventRef.current) {
        const htmlMatch = assistantText.match(/```html\s*([\s\S]*?)```/);
        if (htmlMatch && onGameGenerated) {
          onGameGenerated(htmlMatch[1].trim());
          setLines((prev) => [
            ...prev,
            { type: 'status', text: '  🎮 Game loaded in preview! Type changes to iterate.' },
            { type: 'system', text: '' },
          ]);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setLines((prev) => [
          ...prev,
          { type: 'system', text: '  (cancelled)' },
          { type: 'system', text: '' },
        ]);
      } else {
        setLines((prev) => [
          ...prev,
          { type: 'error', text: `  Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
          { type: 'system', text: '' },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, onGameGenerated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'c' && e.ctrlKey && isStreaming) {
      abortRef.current?.abort();
    }
  };

  return (
    <div
      className={`flex flex-col bg-panel-bg border-t border-panel-border ${isMaximized ? 'h-full' : 'h-[280px]'}`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-panel-surface border-b border-panel-border shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={13} className="text-green-400" />
          <span className="text-xs font-medium text-zinc-300">Terminal</span>
          {isStreaming && (
            <span className="text-[10px] text-yellow-400/80 animate-pulse">
              generating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              if (!lastResponseRef.current) return;
              navigator.clipboard.writeText(lastResponseRef.current);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Copy last response"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <button
            onClick={onToggleMaximize}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={() => {
              setLines([]);
              onClose();
            }}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[13px] leading-relaxed select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className={getLineClass(line.type)}>
            {line.text || '\u00A0'}
          </div>
        ))}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 flex items-end gap-2 px-3 py-2 border-t border-panel-border bg-panel-surface">
        <span className="text-green-400 font-mono text-sm mt-1.5">{'>'}</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Ctrl+C to cancel...' : 'Describe a game...'}
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-transparent text-zinc-200 font-mono text-[13px] placeholder:text-zinc-600 outline-none resize-none min-h-[24px] max-h-[120px] leading-relaxed disabled:opacity-50"
          style={{ height: 'auto', overflow: 'hidden' }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          className="p-1.5 rounded-md text-zinc-500 hover:text-green-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function formatOutput(text: string): TerminalLine[] {
  return text.split('\n').map((line) => ({
    type: 'output' as const,
    text: `  ${line}`,
  }));
}

function getLineClass(type: TerminalLine['type']): string {
  switch (type) {
    case 'input':
      return 'text-green-400 whitespace-pre-wrap';
    case 'output':
      return 'text-zinc-300 whitespace-pre-wrap';
    case 'system':
      return 'text-zinc-500 whitespace-pre-wrap';
    case 'error':
      return 'text-red-400 whitespace-pre-wrap';
    case 'status':
      return 'text-emerald-400/90 whitespace-pre-wrap';
  }
}
