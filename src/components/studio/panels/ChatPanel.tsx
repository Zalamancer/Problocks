'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, Square } from 'lucide-react';
import { PanelTextarea, PanelActionButton } from '@/components/ui';
import { getGameHtml } from '@/lib/game-engine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  onGameGenerated?: (html: string, files?: Record<string, string>) => void;
  activeGameName?: string | null;
}

export function ChatPanel({ onGameGenerated, activeGameName }: ChatPanelProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const receivedGameEventRef = useRef(false);

  // Auto-scroll on updates
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, statuses, streaming]);

  // When the active game changes, reset chat so we start a fresh conversation
  useEffect(() => {
    setMessages([]);
    setStatuses([]);
  }, [activeGameName]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);
    setStatuses([]);
    receivedGameEventRef.current = false;

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${res.status} — ${errText.slice(0, 200)}`,
          };
          return updated;
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = '';

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

            if (parsed.status) {
              setStatuses((prev) => [...prev, parsed.status]);
            }

            if (parsed.fileStart) {
              setStatuses((prev) => [...prev, `📝 Writing ${parsed.fileStart}...`]);
            }

            if (parsed.fileDone) {
              setStatuses((prev) => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                  if (updated[i].includes(`Writing ${parsed.fileDone}`)) {
                    updated[i] = `✅ ${parsed.fileDone} (${parsed.lines}L)`;
                    break;
                  }
                }
                return updated;
              });
            }

            if (parsed.game) {
              const { title, files } = parsed.game as {
                title: string;
                files: Record<string, string>;
              };
              const html = getGameHtml({ files });
              receivedGameEventRef.current = true;
              onGameGenerated?.(html, files);
              setStatuses((prev) => [
                ...prev,
                `🎮 ${title} loaded! (${Object.keys(files).length} modules)`,
              ]);
            }

            if (parsed.text) {
              assistantText += parsed.text;
              // Strip code fences from what we show in chat bubble
              const visible = assistantText.replace(/```[\w]*\s*[\s\S]*?```/g, '').trim();
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: visible };
                return updated;
              });
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Legacy fallback — extract HTML game code if no typed game event arrived
      if (!receivedGameEventRef.current) {
        const htmlMatch = assistantText.match(/```html\s*([\s\S]*?)```/);
        if (htmlMatch && onGameGenerated) {
          onGameGenerated(htmlMatch[1].trim());
          setStatuses((prev) => [...prev, '🎮 Game loaded in preview!']);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setStatuses((prev) => [...prev, '(cancelled)']);
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, onGameGenerated]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  const showEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Message history */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 select-text"
      >
        {showEmpty ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={28} className="mx-auto text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">AI Chat</p>
              <p className="text-xs text-gray-600 mt-1">
                {activeGameName
                  ? `Continue working on: ${activeGameName}`
                  : 'Describe a game to build it instantly'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isLast = i === messages.length - 1;
              const isEmptyStreaming = streaming && isLast && msg.role === 'assistant' && !msg.content;
              return (
                <div
                  key={i}
                  className={
                    msg.role === 'user'
                      ? 'ml-auto max-w-[90%] rounded-xl bg-accent/15 border border-accent/25 px-3 py-2 text-sm text-zinc-100 whitespace-pre-wrap break-words'
                      : 'mr-auto max-w-[95%] rounded-xl bg-panel-surface border border-panel-border px-3 py-2 text-sm text-zinc-200 whitespace-pre-wrap break-words'
                  }
                >
                  {isEmptyStreaming ? (
                    <span className="inline-block w-1.5 h-4 bg-green-400 animate-pulse align-text-bottom" />
                  ) : (
                    msg.content || '\u00A0'
                  )}
                </div>
              );
            })}
            {statuses.length > 0 && (
              <div className="space-y-0.5 pt-1">
                {statuses.map((s, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-emerald-400/80 font-mono whitespace-pre-wrap"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 px-3 pb-3 pt-2 border-t border-panel-border space-y-2">
        <PanelTextarea
          value={input}
          onChange={setInput}
          onKeyDown={handleKeyDown}
          placeholder={
            streaming ? 'Generating… press cancel to stop' : 'Describe your game or changes…'
          }
          rows={3}
          showCount
          disabled={streaming}
        />
        {streaming ? (
          <PanelActionButton
            onClick={cancel}
            variant="destructive"
            icon={Square}
            fullWidth
          >
            Cancel
          </PanelActionButton>
        ) : (
          <PanelActionButton
            onClick={send}
            variant="primary"
            icon={Sparkles}
            fullWidth
            disabled={!input.trim()}
          >
            Generate
          </PanelActionButton>
        )}
      </div>
    </div>
  );
}
