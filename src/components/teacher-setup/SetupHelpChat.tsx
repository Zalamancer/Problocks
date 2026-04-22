// Floating help chat anchored to the bottom-right of the setup page.
//
// Closed state: a round bubble button is always visible.
// Open state: a chat card with a Roblox-style teacher avatar, a live
//   transcript, and an input.
//
// The chat personalizes to the teacher who is setting up. It reads
// `data.teacherName` / `data.teacherHandle` from sessionStorage (where
// ClassroomSetupApp persists the setup draft on every change) so the
// header label, the greeting, and the primer turn all address the
// teacher by their own name. Until a name has been entered the header
// falls back to a neutral "Setup helper" so we never render "Mrs. Bloom"
// or any other hardcoded person name.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RobloxAvatar, type AvatarOutfit } from '@/components/student/RobloxAvatar';
import { Icon } from '@/components/landing/pb-site/primitives';

type Msg = { role: 'user' | 'assistant'; content: string };

const TEACHER_OUTFIT: AvatarOutfit = {
  gender: 'girl',
  hair: 'long',
  hairColor: '#8b5a2b',
  shirt: '#7fc295',
  pants: '#4a3828',
  face: 'happy',
  hat: 'none',
};

// Session key kept in sync with ClassroomSetupApp's SETUP_STORAGE_KEY.
// Duplicated as a constant here so we don't need to refactor the setup
// state flow just to label the chat — the draft is already persisted on
// every keystroke, so a one-time read on open is always current.
const SETUP_STORAGE_KEY = 'pb:teacher-setup:v1';

type TeacherIdent = { name: string; handle: string };

function readTeacher(): TeacherIdent {
  if (typeof window === 'undefined') return { name: '', handle: '' };
  try {
    const raw = sessionStorage.getItem(SETUP_STORAGE_KEY);
    if (!raw) return { name: '', handle: '' };
    const parsed = JSON.parse(raw) as { data?: { teacherName?: string; teacherHandle?: string } };
    return {
      name: (parsed.data?.teacherName ?? '').trim(),
      handle: (parsed.data?.teacherHandle ?? '').trim(),
    };
  } catch {
    return { name: '', handle: '' };
  }
}

function firstNameOf(full: string): string {
  return full.split(/\s+/).filter(Boolean)[0] ?? '';
}

function buildGreeting(firstName: string): Msg {
  return {
    role: 'assistant',
    content: firstName
      ? `Hi ${firstName}! I'll walk you through getting your first classroom set up. Which step are you on — or what's giving you trouble?`
      : "Hi! I'm your setup helper. I can walk you through each step — what's giving you trouble?",
  };
}

function buildPrimer(firstName: string): Msg {
  const nameClause = firstName
    ? ` The teacher's first name is ${firstName}; address them by it when it feels natural, but don't overdo it.`
    : '';
  return {
    role: 'user',
    content:
      `[System: You are a friendly, encouraging setup helper inside Playdemy, talking directly to a teacher who is setting up their first classroom.${nameClause} Do NOT give yourself a name — speak as a neutral helper in first person ("I"). Keep replies short (2–4 sentences), warm, and practical. The setup has 5 steps: 1) About you — first name + display name (what parents and students see). 2) Class basics — name, subject, grade, accent color. 3) Roster — add students manually, upload a CSV, connect Google Classroom, or share the class join code. 4) Starter unit — pick a template or start blank. 5) Review & open the room. Never mention that you are Claude, an AI model, or a language model. If asked about something off-topic, gently steer back to classroom setup.]`,
  };
}
const PRIMER_ACK: Msg = { role: 'assistant', content: 'Got it.' };

const SUGGESTIONS = [
  'What goes in Display name?',
  'How do I add students?',
  'Do I need Google Classroom?',
];

export function SetupHelpChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [teacher, setTeacher] = useState<TeacherIdent>({ name: '', handle: '' });
  const [msgs, setMsgs] = useState<Msg[]>([buildGreeting('')]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-read the teacher's name each time the card opens. If the conversation
  // hasn't started yet (still just the greeting), swap the greeting for one
  // that uses the freshly-read name so the transcript isn't stuck on a stale
  // "Hi!" after the teacher typed their name.
  useEffect(() => {
    if (!open) return;
    const t = readTeacher();
    setTeacher(t);
    setMsgs((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [buildGreeting(firstNameOf(t.name))];
      }
      return prev;
    });
  }, [open]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, busy]);

  useEffect(() => {
    if (open && inputRef.current) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 200);
      return () => window.clearTimeout(id);
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

    const firstName = firstNameOf(teacher.name);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [buildPrimer(firstName), PRIMER_ACK, ...next],
        }),
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
          content: 'Sorry — I lost my chalk for a second. Mind trying again?',
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
  const headerName = teacher.name || 'Setup helper';
  const handleLabel = teacher.handle ? `@${teacher.handle}` : 'teacher';

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
        aria-label="Setup help chat"
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
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={headerName}
            >
              {headerName}
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
              {teacher.handle ? `${handleLabel} · online` : 'Setup helper · online'}
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
            placeholder="Type a question…"
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

// Persistent floating button anchored bottom-right. Renders whenever the
// chat is closed so teachers can always summon the helper from any step.
export function SetupHelpBubble({ onClick }: { onClick: () => void }) {
  return (
    <>
      <style>{`
        @keyframes pbHelpBubbleIn {
          0% { transform: translateY(8px) scale(0.9); opacity: 0; }
          100% { transform: none; opacity: 1; }
        }
        @keyframes pbHelpBubbleNudge {
          0%, 92%, 100% { transform: translateY(0); }
          96% { transform: translateY(-4px); }
        }
      `}</style>
      <button
        type="button"
        onClick={onClick}
        aria-label="Open setup help chat"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 90,
          width: 60,
          height: 60,
          borderRadius: 999,
          background: 'var(--pbs-mint)',
          color: 'var(--pbs-mint-ink)',
          border: '2px solid var(--pbs-mint-ink)',
          boxShadow:
            '0 6px 0 var(--pbs-mint-ink), 0 24px 40px -18px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          fontFamily: 'inherit',
          animation: 'pbHelpBubbleIn 260ms cubic-bezier(.2,.8,.2,1), pbHelpBubbleNudge 6s ease-in-out infinite',
        }}
      >
        <Icon name="smile" size={28} stroke={2.4} />
      </button>
    </>
  );
}
