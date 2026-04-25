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
import { Sparkles } from 'lucide-react';
import { RobloxAvatar, type AvatarOutfit } from '@/components/student/RobloxAvatar';
import { useTutorSpeech } from './useTutorSpeech';
import type { TutorMessage } from './tutor-types';

// Pulls homework focus + overlay snapshot from the window globals
// published by HomeworkDesktop / ScribbleOverlay. Returns nulls when
// either surface isn't mounted (e.g. quiz pages without homework
// context).
async function gatherTutorContext(): Promise<{
  image: string | null;
  context: {
    assignmentTitle?: string;
    partLabel?: string;
    partText?: string;
    microPrompts?: string[];
  };
}> {
  type WGlobal = Window & {
    __scribbleSnapshot?: () => Promise<string | null>;
    __homeworkContext?: () => {
      assignmentTitle: string;
      partLabel: string;
      partText: string;
      microPrompts: string[];
    } | null;
  };
  const w = window as WGlobal;
  const image = (await w.__scribbleSnapshot?.()) ?? null;
  const ctx = w.__homeworkContext?.() ?? null;
  return {
    image,
    context: ctx ?? {},
  };
}

// Default outfit mirrors the one hardcoded on the student dashboard so the
// tutor looks like the same cardboard character the student sees on their
// home screen until a real outfit store ships.
const DEFAULT_OUTFIT: AvatarOutfit = {
  shirt: '#6fbf73',
  pants: '#3a3c4a',
  face: 'happy',
  hair: 'short',
  hairColor: '#3a2a1a',
};

type TutorChatbotProps = {
  // Student's cardboard-character outfit. Falls back to the dashboard default.
  outfit?: AvatarOutfit;
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

export function TutorChatbot({
  outfit,
  greeting = DEFAULT_GREETING,
  onAsk,
}: TutorChatbotProps) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<TutorMessage[]>(() =>
    greeting
      ? [{ id: 'greet', role: 'tutor', text: greeting, ts: Date.now() }]
      : [],
  );
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  // Id of the tutor message currently being "spoken" — its body is rendered
  // as `revealedText` so letters appear in sync with the viseme-driven
  // mouth movements instead of the whole reply dropping at once.
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const { speaking, revealedText, speak, stop } = useTutorSpeech();
  const avatarOutfit = outfit ?? DEFAULT_OUTFIT;
  const logRef = useRef<HTMLDivElement | null>(null);

  // Auto-speak the greeting on first mount.
  useEffect(() => {
    if (greeting) {
      setSpeakingId('greet');
      speak(greeting, { onDone: () => setSpeakingId(null) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // External callers (e.g. WhiteboardAnswer's auto-review on submit)
  // can push a tutor message into this chat by dispatching a
  // CustomEvent('tutor:push', { detail: { text: string } }) on the
  // window. Keeps coupling loose — the chat doesn't have to know which
  // surfaces ask it to talk.
  useEffect(() => {
    const onPush = (e: Event) => {
      const detail = (e as CustomEvent<{ text?: string; role?: 'tutor' | 'student' }>).detail;
      const text = detail?.text;
      if (!text) return;
      const role = detail?.role ?? 'tutor';
      const id = `${role[0]}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setMessages((m) => [...m, { id, role, text, ts: Date.now() }]);
      setOpen(true);
      if (role === 'tutor') {
        setSpeakingId(id);
        speak(text, { onDone: () => setSpeakingId(null) });
      }
    };
    window.addEventListener('tutor:push', onPush);
    return () => window.removeEventListener('tutor:push', onPush);
  }, [speak]);

  // Autoscroll chat log.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, revealedText]);

  const askTutor = useCallback(
    async (questionText: string) => {
      const studentMsg: TutorMessage = {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'student',
        text: questionText,
        ts: Date.now(),
      };
      const updated: TutorMessage[] = [...messages, studentMsg];
      setMessages(updated);
      setPending(true);

      let reply: string;
      try {
        if (onAsk) {
          // Caller-supplied stub takes precedence — keeps the chatbot
          // generic for surfaces that don't want the Gemini call.
          reply = await onAsk(questionText);
        } else {
          // Default homework path: ship overlay snapshot + current
          // part context + recent history to the Gemini-backed
          // tutor-help route.
          const { image, context } = await gatherTutorContext();
          // Trim history to the last 10 turns so the prompt stays
          // small. Drop the just-added student message so the API
          // can re-add it as the final turn.
          const history = updated.slice(-11, -1).map((m) => ({
            role: m.role,
            text: m.text,
          }));
          const res = await fetch('/api/tutor-help', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              image,
              ...context,
              message: questionText,
              history,
            }),
          });
          const data = (await res.json()) as { text?: string; error?: string };
          reply =
            (res.ok && data.text) ||
            `I couldn't reach the tutor (${data.error ?? 'unknown'}).`;
        }
        const tutorMsg: TutorMessage = {
          id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'tutor',
          text: reply,
          ts: Date.now(),
        };
        setMessages((m) => [...m, tutorMsg]);
        setSpeakingId(tutorMsg.id);
        speak(reply, { onDone: () => setSpeakingId(null) });
      } finally {
        setPending(false);
      }
    },
    [messages, onAsk, speak],
  );

  const send = useCallback(async () => {
    const q = draft.trim();
    if (!q || pending) return;
    setDraft('');
    await askTutor(q);
  }, [draft, pending, askTutor]);

  const askForHelp = useCallback(async () => {
    if (pending) return;
    setOpen(true);
    await askTutor('Help me with this question.');
  }, [pending, askTutor]);

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
          padding: 0,
          zIndex: 40,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
          {/* Collapsed button also uses bust framing so the button face
              is clearly a head-and-shoulders portrait, not a tiny
              full-body figure lost inside a 64px circle. */}
          <RobloxAvatar
            size="fill"
            framed={false}
            outfit={avatarOutfit}
            autoRotate={false}
            showControls={false}
            yaw={-0.3}
            focus="bust"
          />
        </div>
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
        <div
          style={{
            margin: '0 auto',
            width: 220,
            aspectRatio: '1 / 1',
            filter: speaking ? 'drop-shadow(0 0 14px rgba(255,216,77,0.55))' : undefined,
            transition: 'filter 0.2s',
          }}
        >
          {/* No auto-rotate — the tutor is a person, not a product on a
              turntable. Yaw slightly negative so the body angles toward the
              homework on the left. `focus="bust"` frames chest + head only
              (legs excluded) with extra top margin so hair/hat never clip. */}
          <RobloxAvatar
            size="fill"
            framed={false}
            outfit={avatarOutfit}
            autoRotate={false}
            showControls={false}
            yaw={-0.42}
            focus="bust"
          />
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
        {messages.map((m) => {
          const isSpeaking = speakingId === m.id && m.role === 'tutor';
          return (
            <Bubble
              key={m.id}
              msg={m}
              // While this message is being spoken, show only the portion
              // that's been "voiced" so far. Letters appear synced with
              // the viseme-driven mouth animation instead of all at once.
              shownText={isSpeaking ? revealedText : m.text}
              speaking={isSpeaking}
            />
          );
        })}
        {pending && <Typing />}
      </div>

      <div
        style={{
          padding: '8px 10px 0',
          borderTop: '1.5px solid var(--pb-line-2, #d6c896)',
          background: 'var(--pb-paper, #fffaf0)',
        }}
      >
        <button
          type="button"
          onClick={askForHelp}
          disabled={pending}
          aria-label="Ask the tutor to look at my work and help"
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 10,
            background: 'var(--pb-grape, #dcc7ff)',
            color: 'var(--pb-grape-ink, #4d2a8a)',
            border: '1.5px solid var(--pb-grape-ink, #4d2a8a)',
            boxShadow: '0 2px 0 var(--pb-grape-ink, #4d2a8a)',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: pending ? 'wait' : 'pointer',
            opacity: pending ? 0.55 : 1,
          }}
        >
          <Sparkles size={13} strokeWidth={2.4} />
          Help me — see my work
        </button>
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

function Bubble({
  msg,
  shownText,
  speaking = false,
}: {
  msg: TutorMessage;
  shownText?: string;
  speaking?: boolean;
}) {
  const isTutor = msg.role === 'tutor';
  const text = shownText ?? msg.text;
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
      {text}
      {speaking && <BlinkingCaret />}
    </div>
  );
}

function BlinkingCaret() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 2,
        height: '1em',
        verticalAlign: '-0.15em',
        marginLeft: 2,
        background: 'currentColor',
        animation: 'tutor-caret 0.9s steps(1, end) infinite',
      }}
    >
      <style>{`
        @keyframes tutor-caret {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
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
