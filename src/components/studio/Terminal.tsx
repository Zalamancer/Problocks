'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2, Minimize2, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
}

export function StudioTerminal({
  onClose,
  isMaximized,
  onToggleMaximize,
  onGameGenerated,
}: {
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onGameGenerated?: (html: string) => void;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

    // Add empty output line that we'll append to
    const streamLineIndex = { current: -1 };

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
      let assistantText = '';

      // Add initial output line
      setLines((prev) => {
        streamLineIndex.current = prev.length;
        return [...prev, { type: 'output', text: '' }];
      });

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
            if (parsed.text) {
              assistantText += parsed.text;
              // Update the streaming line
              setLines((prev) => {
                const updated = [...prev];
                // Replace all output lines from this stream with the full formatted text
                const startIdx = streamLineIndex.current;
                const formatted = formatOutput(assistantText);
                updated.splice(startIdx, updated.length - startIdx, ...formatted);
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Finalize: add trailing blank line
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      setLines((prev) => [...prev, { type: 'system', text: '' }]);

      // Extract HTML game code and send to preview
      const htmlMatch = assistantText.match(/```html\s*([\s\S]*?)```/);
      if (htmlMatch && onGameGenerated) {
        onGameGenerated(htmlMatch[1].trim());
        setLines((prev) => [
          ...prev,
          { type: 'system', text: '  Game loaded in preview. Type changes to iterate.' },
          { type: 'system', text: '' },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setLines((prev) => [...prev, { type: 'system', text: '  (cancelled)' }, { type: 'system', text: '' }]);
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
  }, [input, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Ctrl+C to cancel
    if (e.key === 'c' && e.ctrlKey && isStreaming) {
      abortRef.current?.abort();
    }
  };

  return (
    <div className={`flex flex-col bg-[#0d0d0d] border-t border-white/[0.06] ${isMaximized ? 'h-full' : 'h-[280px]'}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161616] border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon size={13} className="text-green-400" />
          <span className="text-xs font-medium text-zinc-300">Terminal</span>
          {isStreaming && (
            <span className="text-[10px] text-yellow-400/80 animate-pulse">streaming...</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onToggleMaximize}
            className="p-1 rounded hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={() => { setLines([]); onClose(); }}
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
      <div className="shrink-0 flex items-end gap-2 px-3 py-2 border-t border-white/[0.08] bg-[#111]">
        <span className="text-green-400 font-mono text-sm mt-1.5">{'>'}</span>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Ctrl+C to cancel...' : 'Message Claude...'}
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
  }
}
