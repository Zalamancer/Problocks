// Right-rail tutor chatbot for the homework page.
//
// Expanded: 340px-wide column with the student's character on top (bust
// framing, ~220px tall), chat log, and an input. Collapsed: a 64px round
// avatar button pinned to the bottom-right.
//
// The tutor reply is stubbed — a canned response fires ~350ms after the
// student sends. Wire this to an /api/* endpoint when the backend lands;
// the `useTutorSpeech` hook already drives viseme cycling while the tutor
// talks, so the swap is purely a text-source change.

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TutorAvatar } from './TutorAvatar';
import { useTutorSpeech } from './useTutorSpeech';
import type { CharacterRig, TutorMessage } from './tutor-types';

type TutorChatbotProps = {
  rig?: CharacterRig;
  // Optional greeting. Defaults to a canned hint; pass empty string to skip.
  greeting?: string;
  // Stub reply generator. Return a string (sync or async). Defaults to a
  // canned response — replace with a fetch('/api/tutor', …) when ready.
  onAsk?: (question: string) => string | Promise<string>;
};

const DEFAULT_GREETING =
  'Hey! I\'m your physics tutor. Tap any micro-question you\'re stuck on and I\'ll walk you through it — partial credit still counts.';

const DEFAULT_REPLY = (q: string) =>
  `Good question. Let\'s break \"${q.trim().slice(0, 40)}…\" into smaller steps — start by identifying which forces act along the incline.`;

export function TutorChatbot({ rig, greeting = DEFAULT_GREETING, onAsk }: TutorChatbotProps) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<TutorMessage[]>(() =>
    greeting
      ? [{ id: 'greet', role: 'tutor', text: greeting, ts: Date.now() }]
      : [],
  );
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const { viseme, speaking, speak, stop } = useTutorSpeech();
  const logRef = useRef<HTMLDivElement | null>(null);

  // Auto-speak the greeting on first mount.
  useEffect(() => {
    if (greeting) speak(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autoscroll chat log.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const send = useCallback(async () => {
    const q = draft.trim();
    if (!q || pending) return;
    setDraft('');
    const studentMsg: TutorMessage = {
      id: `s-${Date.now()}`,
      role: 'student',
      text: q,
      ts: Date.now(),
    };
    setMessages((m) => [...m, studentMsg]);
    setPending(true);
    try {
      const reply = onAsk ? await onAsk(q) : DEFAULT_REPLY(q);
      const tutorMsg: TutorMessage = {
        id: `t-${Date.now()}`,
        role: 'tutor',
        text: reply,
        ts: Date.now(),
      };
      setMessages((m) => [...m, tutorMsg]);
      speak(reply);
    } finally {
      setPending(false);
    }
  }, [draft, pending, onAsk, speak]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open tutor"
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: 'var(--pb-paper, #fffaf0)',
          border: '2px solid var(--pb-ink, #1d1a14)',
          boxShadow: '0 4px 0 var(--pb-ink, #1d1a14)',
          cursor: 'pointer',
          padding: 6,
          zIndex: 40,
        }}
      >
        <TutorAvatar rig={rig} viseme={viseme} idle={false} speaking={false} />
      </button>
    );
  }

  return (
    <aside
      style={{
        position: 'fixed',
        right: 18,
        top: 18,
        bottom: 18,
        width: 340,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--pb-paper, #fffaf0)',
        border: '2px solid var(--pb-ink, #1d1a14)',
        boxShadow: '0 4px 0 var(--pb-ink, #1d1a14)',
        borderRadius: 20,
        overflow: 'hidden',
        zIndex: 40,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderBottom: '1.5px solid var(--pb-line-2, #d6c896)',
          background: 'var(--pb-cream-2, #f7edd4)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: speaking ? 'var(--pb-mint-ink, #0f5b2e)' : 'var(--pb-line-2, #d6c896)',
            boxShadow: speaking ? '0 0 6px var(--pb-mint-ink, #0f5b2e)' : undefined,
            transition: 'all 0.2s',
          }}
        />
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink, #1d1a14)' }}>
          Tutor {speaking ? '· Talking' : pending ? '· Thinking…' : '· Online'}
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => {
            stop();
            setOpen(false);
          }}
          aria-label="Close tutor"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: '1.5px solid var(--pb-line-2, #d6c896)',
            background: 'var(--pb-paper, #fffaf0)',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
            color: 'var(--pb-ink, #1d1a14)',
          }}
        >
          ×
        </button>
      </header>

      <div
        style={{
          padding: '10px 14px 4px',
          background:
            'radial-gradient(140% 80% at 50% 0%, var(--pb-butter, #ffd84d) 0%, var(--pb-cream, #fdf6e6) 60%)',
          borderBottom: '1.5px solid var(--pb-line-2, #d6c896)',
        }}
      >
        <div style={{ margin: '0 auto', width: 180 }}>
          <TutorAvatar rig={rig} viseme={viseme} idle speaking={speaking} />
        </div>
      </div>

      <div
        ref={logRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'var(--pb-cream, #fdf6e6)',
        }}
      >
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {pending && <Typing />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{
          display: 'flex',
          gap: 8,
          padding: 10,
          borderTop: '1.5px solid var(--pb-line-2, #d6c896)',
          background: 'var(--pb-paper, #fffaf0)',
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask your tutor…"
          disabled={pending}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 10,
            border: '1.5px solid var(--pb-line-2, #d6c896)',
            background: 'var(--pb-cream, #fdf6e6)',
            fontSize: 13,
            outline: 'none',
            color: 'var(--pb-ink, #1d1a14)',
          }}
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: draft.trim() ? 'var(--pb-ink, #1d1a14)' : 'var(--pb-cream-2, #f7edd4)',
            color: draft.trim() ? 'var(--pb-paper, #fffaf0)' : 'var(--pb-ink-muted, #8a8478)',
            border: '1.5px solid var(--pb-ink, #1d1a14)',
            boxShadow: draft.trim() ? '0 2px 0 var(--pb-ink, #1d1a14)' : 'none',
            fontSize: 12,
            fontWeight: 800,
            cursor: draft.trim() && !pending ? 'pointer' : 'default',
          }}
        >
          Send
        </button>
      </form>
    </aside>
  );
}

function Bubble({ msg }: { msg: TutorMessage }) {
  const isTutor = msg.role === 'tutor';
  return (
    <div
      style={{
        alignSelf: isTutor ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
        padding: '8px 12px',
        borderRadius: 14,
        background: isTutor ? 'var(--pb-paper, #fffaf0)' : 'var(--pb-butter, #ffd84d)',
        border: `1.5px solid ${isTutor ? 'var(--pb-line-2, #d6c896)' : 'var(--pb-butter-ink, #6b4f00)'}`,
        boxShadow: `0 2px 0 ${isTutor ? 'var(--pb-line-2, #d6c896)' : 'var(--pb-butter-ink, #6b4f00)'}`,
        fontSize: 13,
        lineHeight: 1.4,
        color: isTutor ? 'var(--pb-ink, #1d1a14)' : 'var(--pb-butter-ink, #6b4f00)',
      }}
    >
      {msg.text}
    </div>
  );
}

function Typing() {
  return (
    <div
      style={{
        alignSelf: 'flex-start',
        padding: '8px 14px',
        borderRadius: 14,
        background: 'var(--pb-paper, #fffaf0)',
        border: '1.5px solid var(--pb-line-2, #d6c896)',
        fontSize: 13,
        color: 'var(--pb-ink-muted, #8a8478)',
        display: 'flex',
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--pb-ink-muted, #8a8478)',
            animation: `tutor-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes tutor-dot {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40%          { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
