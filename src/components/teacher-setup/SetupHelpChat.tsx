// Floating help chat that pops out of the "Need help?" button in SetupNav.
// Friendly teacher character ("Mrs. Bloom") rendered as a 3D Roblox-style
// avatar sits at the top of the card; messages below stream from /api/chat
// with a hidden primer turn that locks the persona to classroom setup.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RobloxAvatar, type AvatarOutfit } from '@/components/student/RobloxAvatar';
import { Icon } from '@/components/landing/pb-site/primitives';

type Msg = { role: 'user' | 'assistant'; content: string };

// Warm, "first-day-of-school" teacher look — kraft cardboard skin tone from
// the avatar defaults, mint teacher shirt, long brown hair so she reads
// clearly as a person and not a generic blocky figure.
const TEACHER_OUTFIT: AvatarOutfit = {
  gender: 'girl',
  hair: 'long',
  hairColor: '#8b5a2b',
  shirt: '#7fc295',
  pants: '#4a3828',
  face: 'happy',
  hat: 'none',
};

// These two messages are prepended to every request but NOT shown in the
// visible transcript. They steer the base chat endpoint (which has a
// general "Playdemy studio assistant" system prompt) toward the specific
// setup-helper persona and topic set.
const PRIMER_USER: Msg = {
  role: 'user',
  content:
    "[System: You are Mrs. Bloom, a friendly, encouraging teacher character inside Playdemy, helping another teacher set up their first classroom. Keep replies short (2–4 sentences), warm, and practical. Speak in first person as Mrs. Bloom. The setup has 5 steps: 1) About you — first name + display name (what parents and students see). 2) Class basics — name, subject, grade, accent color. 3) Roster — add students manually, upload a CSV, connect Google Classroom, or share the class join code. 4) Starter unit — pick a template or start blank. 5) Review & open the room. Never mention that you are Claude, an AI model, or a language model. If asked about something off-topic, gently steer back to classroom setup.]",
};
const PRIMER_ACK: Msg = { role: 'assistant', content: 'Got it.' };

const GREETING: Msg = {
  role: 'assistant',
  content:
    "Hi, I'm Mrs. Bloom! I help teachers get their first Playdemy classroom set up. What step are you on — or what's giving you trouble?",
};

const SUGGESTIONS = [
  'What goes in Display name?',
  'How do I add students?',
  'Do I need Google Classroom?',
];

export function SetupHelpChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, busy]);

  useEffect(() => {
    if (open && inputRef.current) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput('');
    const next: Msg[] = [...msgs, { role: 'user', content: trimmed }];
    setMsgs([...next, { role: 'assistant', content: '' }]);
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [PRIMER_USER, PRIMER_ACK, ...next] }),
      });
      if (!res.body) throw new Error('no body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]' || !data) continue;
          try {
            const parsed = JSON.parse(data);
            const chunk: string | undefined = parsed.text;
            if (!chunk) continue;
            setMsgs((m) => {
              const copy = [...m];
              const last = copy[copy.length - 1];
              copy[copy.length - 1] = { role: 'assistant', content: last.content + chunk };
              return copy;
            });
          } catch {
            /* malformed line — skip */
          }
        }
      }
    } catch {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: "Oh shoot — I dropped my chalk. Give me a second and try again?",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const lastMsg = msgs[msgs.length - 1];
  const showThinking = busy && lastMsg?.role === 'assistant' && lastMsg.content.length === 0;

  return (
    <>
      <style>{`
        @keyframes pbHelpPop {
          0% { transform: translateY(16px) scale(0.94); opacity: 0; }
          100% { transform: none; opacity: 1; }
        }
        @keyframes pbHelpDot { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }
        .pb-help-dot { display: inline-block; padding: 0 2px; font-weight: 900; animation: pbHelpDot 1.2s infinite; }
        .pb-help-dot:nth-child(2) { animation-delay: .2s; }
        .pb-help-dot:nth-child(3) { animation-delay: .4s; }
      `}</style>

      <div
        role="dialog"
        aria-label="Setup help chat with Mrs. Bloom"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 380,
          height: 560,
          maxHeight: 'calc(100vh - 40px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--pbs-paper)',
          borderRadius: 24,
          border: '2px solid var(--pbs-ink)',
          boxShadow:
            '0 6px 0 var(--pbs-ink), 0 30px 60px -20px rgba(0,0,0,0.45)',
          overflow: 'hidden',
          animation: 'pbHelpPop 280ms cubic-bezier(.2,.8,.2,1)',
          fontFamily: 'inherit',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: 'var(--pbs-mint)',
            borderBottom: '2px solid var(--pbs-ink)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              flexShrink: 0,
              borderRadius: 16,
              overflow: 'hidden',
              border: '1.5px solid var(--pbs-mint-ink)',
              background: 'var(--pbs-cream)',
              boxShadow: '0 2px 0 var(--pbs-mint-ink)',
            }}
          >
            <RobloxAvatar
              outfit={TEACHER_OUTFIT}
              framed={false}
              showControls={false}
              autoRotate={false}
              yaw={-0.28}
              zoom={0.85}
              focus="bust"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: 'var(--pbs-mint-ink)',
                letterSpacing: '-0.01em',
              }}
            >
              Mrs. Bloom
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--pbs-mint-ink)',
                opacity: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: '#2ba84a',
                  display: 'inline-block',
                }}
              />
              Setup helper · online
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--pbs-paper)',
              border: '1.5px solid var(--pbs-ink)',
              boxShadow: '0 2px 0 var(--pbs-ink)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontFamily: 'inherit',
              color: 'var(--pbs-ink)',
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'var(--pbs-cream-2)',
          }}
        >
          {msgs.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                padding: '9px 12px',
                background: m.role === 'user' ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
                color: m.role === 'user' ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
                border: `1.5px solid ${m.role === 'user' ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
                borderRadius: 14,
                borderBottomRightRadius: m.role === 'user' ? 4 : 14,
                borderBottomLeftRadius: m.role === 'user' ? 14 : 4,
                fontSize: 13.5,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {i === msgs.length - 1 && showThinking ? (
                <span aria-label="Thinking">
                  <span className="pb-help-dot">·</span>
                  <span className="pb-help-dot">·</span>
                  <span className="pb-help-dot">·</span>
                </span>
              ) : (
                m.content
              )}
            </div>
          ))}

          {msgs.length === 1 && !busy && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '7px 12px',
                    background: 'var(--pbs-paper)',
                    color: 'var(--pbs-ink)',
                    border: '1.5px dashed var(--pbs-line-2)',
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          style={{
            display: 'flex',
            gap: 8,
            padding: 12,
            borderTop: '1.5px solid var(--pbs-line-2)',
            background: 'var(--pbs-paper)',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mrs. Bloom…"
            disabled={busy}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'var(--pbs-cream)',
              border: '1.5px solid var(--pbs-line-2)',
              borderRadius: 12,
              fontSize: 13.5,
              fontFamily: 'inherit',
              color: 'var(--pbs-ink)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background:
                busy || !input.trim() ? 'var(--pbs-line-2)' : 'var(--pbs-butter)',
              border: '1.5px solid var(--pbs-butter-ink)',
              boxShadow: '0 2px 0 var(--pbs-butter-ink)',
              color: 'var(--pbs-butter-ink)',
              cursor: busy || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            <Icon name="send" size={16} stroke={2.4} />
          </button>
        </form>
      </div>
    </>
  );
}
