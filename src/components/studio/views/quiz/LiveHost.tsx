'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Play, ArrowRight, Users, Trophy } from 'lucide-react';
import { FRQ } from '@/lib/quiz/frq-content';
import type { RoomPublic } from '@/lib/quiz/room-types';
import { useRoom } from '@/lib/quiz/use-room';
import { Pill } from './QuizAtoms';

// LiveHost — teacher's host screen. Lives inside the studio workspace
// (not a separate route) so the teacher can see their class join + drive
// the quiz without leaving Problocks. Students are on their phones at
// /play/quiz/[pin]. Phase 1 polls every 1s; Phase 2 swaps to Realtime.

type HostScreen = 'creating' | 'live' | 'error';

export function LiveHost({
  onExit,
  pacing,
}: {
  onExit: () => void;
  pacing: 'live' | 'self';
}) {
  const [screen, setScreen] = useState<HostScreen>('creating');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { room, refresh } = useRoom(roomId);

  // One-shot room creation on mount. After we have an id, `useRoom`
  // keeps the snapshot fresh via realtime (or polling fallback).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/quiz/rooms', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ frqId: 'cart-on-incline', pacing }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'failed');
        if (cancelled) return;
        setRoomId(data.roomId);
        setScreen('live');
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : 'failed');
        setScreen('error');
      }
    })();
    return () => { cancelled = true; };
  }, [pacing]);

  const advance = useCallback(async () => {
    if (!roomId) return;
    try {
      await fetch(`/api/quiz/rooms/${roomId}/advance`, { method: 'POST' });
      // Kick the hook immediately — don't wait for realtime tick.
      refresh();
    } catch { /* ignore */ }
  }, [roomId, refresh]);

  if (screen === 'creating') {
    return <HostFrame onExit={onExit}><Center>Opening room…</Center></HostFrame>;
  }
  if (screen === 'error' || !room) {
    return (
      <HostFrame onExit={onExit}>
        <Center>
          <div style={{ color: 'var(--pb-coral-ink)', fontWeight: 700 }}>
            Couldn&rsquo;t open room
          </div>
          <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', marginTop: 6 }}>
            {err ?? 'Unknown error'}
          </div>
        </Center>
      </HostFrame>
    );
  }

  // Self-paced rooms don't have a phase machine — they're just a shared
  // scoreboard with a join URL. Render a dedicated layout.
  if (room.pacing === 'self') {
    return (
      <HostFrame onExit={onExit} variant="self">
        <SelfPacedPanel room={room} />
      </HostFrame>
    );
  }

  return (
    <HostFrame onExit={onExit} variant="live">
      {room.phase === 'lobby'       && <LobbyPanel  room={room} onStart={advance} />}
      {room.phase === 'question'    && <QuestionPanel room={room} onNext={advance} />}
      {room.phase === 'reveal'      && <RevealPanel   room={room} onNext={advance} />}
      {room.phase === 'leaderboard' && <Leaderboard   room={room} onNext={advance} label="Leaderboard" cta="Next question" />}
      {room.phase === 'done'        && <Leaderboard   room={room} onNext={onExit}   label="Final scores" cta="Done" final />}
    </HostFrame>
  );
}

function HostFrame({
  children,
  onExit,
  variant = 'live',
}: {
  children: React.ReactNode;
  onExit: () => void;
  variant?: 'live' | 'self';
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--pb-cream, var(--pb-paper))',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1.5px solid var(--pb-line-2)',
          background: 'var(--pb-paper)',
        }}
      >
        <button
          type="button"
          onClick={onExit}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: '1.5px solid var(--pb-line-2)',
            background: 'var(--pb-cream-2)',
            color: 'var(--pb-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <Pill tone={variant === 'self' ? 'sky' : 'coral'}>
          {variant === 'self' ? 'Self-paced · Host' : 'LIVE · Host'}
        </Pill>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)' }}>
          {FRQ.source.exam} · {FRQ.source.title}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'var(--pb-ink-soft)',
      }}
    >
      {children}
    </div>
  );
}

// ---------- Lobby ----------

function LobbyPanel({ room, onStart }: { room: RoomPublic; onStart: () => void }) {
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const joinUrl = origin ? `${origin}/play/quiz/${room.pin}` : `/play/quiz/${room.pin}`;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            boxShadow: '0 4px 0 var(--pb-ink)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)' }}>
            Join at
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--pb-ink)',
              marginTop: 6,
              fontFamily: 'DM Mono, ui-monospace, monospace',
              wordBreak: 'break-all',
            }}
          >
            {joinUrl.replace(/^https?:\/\//, '')}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)', marginTop: 24 }}>
            Or enter PIN
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'var(--pb-ink)',
              marginTop: 4,
              fontFamily: 'DM Mono, ui-monospace, monospace',
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            {room.pin}
          </div>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 4px 0 var(--pb-line-2)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 280,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} strokeWidth={2.4} style={{ color: 'var(--pb-ink)' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
              Players ({room.players.length})
            </span>
          </div>
          <div
            style={{
              flex: 1,
              marginTop: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              alignContent: 'flex-start',
              overflow: 'auto',
            }}
          >
            {room.players.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)' }}>
                Waiting for players to join…
              </div>
            )}
            {room.players.map((p) => (
              <Pill key={p.id} tone="butter">{p.displayName}</Pill>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onStart}
          disabled={room.players.length === 0}
          style={{
            padding: '14px 24px',
            borderRadius: 14,
            background: room.players.length === 0 ? 'var(--pb-cream-2)' : 'var(--pb-ink)',
            color: room.players.length === 0 ? 'var(--pb-ink-muted)' : 'var(--pb-paper)',
            border: `1.5px solid ${room.players.length === 0 ? 'var(--pb-line-2)' : 'var(--pb-ink)'}`,
            boxShadow: room.players.length === 0 ? 'none' : '0 3px 0 #000',
            fontSize: 15,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: room.players.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Play size={13} strokeWidth={2.4} />
          Start quiz
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// ---------- Question ----------

function QuestionPanel({ room, onNext }: { room: RoomPublic; onNext: () => void }) {
  const part = FRQ.parts[room.partIdx];
  const micro = part?.micros[room.microIdx];
  const answersHere = useMemo(
    () => room.answers.filter((a) => a.partId === part?.id && a.microId === micro?.id),
    [room.answers, part?.id, micro?.id],
  );
  const answerCount = answersHere.length;
  const total = room.players.length;

  if (!part || !micro) return null;
  return (
    <div style={{ padding: '28px 28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill tone="sky">{part.label} · Step {room.microIdx + 1}/{part.micros.length}</Pill>
        <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 700 }}>
          {answerCount} / {total} answered
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 22,
          lineHeight: 1.3,
          fontWeight: 700,
          color: 'var(--pb-ink)',
        }}
      >
        {micro.prompt}
      </div>

      {micro.kind === 'choice' && (
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {micro.options.map((o) => (
            <div
              key={o.id}
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                boxShadow: '0 3px 0 var(--pb-line-2)',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--pb-ink)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--pb-cream-2)',
                  border: '1.5px solid var(--pb-line-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}
              >
                {o.id}
              </span>
              {o.text}
            </div>
          ))}
        </div>
      )}

      {micro.kind === 'number' && (
        <div style={{ marginTop: 20, fontSize: 13, color: 'var(--pb-ink-muted)' }}>
          Numeric answer — students type on their device.
        </div>
      )}

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onNext}
          style={hostPrimaryBtn()}
        >
          Lock in &amp; reveal
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// ---------- Reveal ----------

function RevealPanel({ room, onNext }: { room: RoomPublic; onNext: () => void }) {
  const part = FRQ.parts[room.partIdx];
  const micro = part?.micros[room.microIdx];
  const answersHere = useMemo(
    () => room.answers.filter((a) => a.partId === part?.id && a.microId === micro?.id),
    [room.answers, part?.id, micro?.id],
  );

  if (!part || !micro) return null;

  let buckets: { label: string; count: number; correct: boolean }[] = [];
  if (micro.kind === 'choice') {
    buckets = micro.options.map((o) => ({
      label: `${o.id}. ${o.text}`,
      correct: o.correct,
      count: answersHere.filter((a) => a.answerId === o.id).length,
    }));
  } else {
    buckets = [
      { label: `Correct (±${micro.tol})`, correct: true,  count: answersHere.filter((a) => a.correct).length },
      { label: 'Other',                   correct: false, count: answersHere.filter((a) => !a.correct).length },
    ];
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div style={{ padding: '28px 28px 24px', maxWidth: 900, margin: '0 auto' }}>
      <Pill tone="mint">Answer revealed</Pill>
      <div style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: 'var(--pb-ink)' }}>
        {micro.prompt}
      </div>

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {buckets.map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 220, fontSize: 13, fontWeight: 700, color: b.correct ? 'var(--pb-mint-ink)' : 'var(--pb-ink)' }}>
              {b.label}
            </div>
            <div style={{ flex: 1, height: 18, borderRadius: 999, background: 'var(--pb-cream-2)', border: '1.5px solid var(--pb-line-2)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(b.count / max) * 100}%`,
                  background: b.correct ? 'var(--pb-mint)' : 'var(--pb-paper)',
                  borderRight: b.count > 0 ? `1.5px solid ${b.correct ? 'var(--pb-mint-ink)' : 'var(--pb-line-2)'}` : 'none',
                  transition: 'width 0.4s cubic-bezier(.4,1.4,.6,1)',
                }}
              />
            </div>
            <div style={{ width: 40, textAlign: 'right', fontWeight: 800, color: 'var(--pb-ink)' }}>
              {b.count}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 12,
          borderRadius: 12,
          background: 'var(--pb-mint)',
          border: '1.5px solid var(--pb-mint-ink)',
          color: 'var(--pb-mint-ink)',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {micro.explain}
      </div>

      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
        <button type="button" onClick={onNext} style={hostPrimaryBtn()}>
          Show leaderboard
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// ---------- Leaderboard ----------

function Leaderboard({
  room,
  onNext,
  label,
  cta,
  final,
}: {
  room: RoomPublic;
  onNext: () => void;
  label: string;
  cta: string;
  final?: boolean;
}) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  return (
    <div style={{ padding: '28px 28px 24px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Trophy size={16} strokeWidth={2.4} style={{ color: 'var(--pb-butter-ink)' }} />
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)' }}>
          {label}
        </span>
      </div>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ranked.map((p, i) => (
          <div
            key={p.id}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: i === 0 && final ? 'var(--pb-butter)' : 'var(--pb-paper)',
              border: `1.5px solid ${i === 0 && final ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: i === 0 && final ? '0 3px 0 var(--pb-butter-ink)' : '0 2px 0 var(--pb-line-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 28, textAlign: 'center', fontWeight: 800, color: 'var(--pb-ink-muted)' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--pb-ink)' }}>
              {p.displayName}
            </div>
            <div style={{ fontFamily: 'DM Mono, ui-monospace, monospace', fontWeight: 800, color: 'var(--pb-ink)' }}>
              {p.score}
            </div>
          </div>
        ))}
        {ranked.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)' }}>No players.</div>
        )}
      </div>
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
        <button type="button" onClick={onNext} style={hostPrimaryBtn()}>
          {cta}
          <ArrowRight size={13} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

// ---------- Self-paced panel (host view) ----------
//
// Self-paced rooms don't have a phase machine — there's no "start",
// no "next question", no shared clock. The host just watches a live
// scoreboard and can share the join URL. Students iterate through the
// whole FRQ on their own device.

function SelfPacedPanel({ room }: { room: RoomPublic }) {
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const joinUrl = origin ? `${origin}/play/quiz/${room.pin}` : `/play/quiz/${room.pin}`;

  const ranked = useMemo(
    () => [...room.players].sort((a, b) => b.score - a.score),
    [room.players],
  );

  // One "slot" per (part, micro) so the host can see per-question
  // participation. Each row: how many students have answered and
  // how many got it right.
  const slots = useMemo(() => {
    const rows: { partLabel: string; microIdx: number; answered: number; correct: number }[] = [];
    FRQ.parts.forEach((part) => {
      part.micros.forEach((micro, mi) => {
        const here = room.answers.filter((a) => a.partId === part.id && a.microId === micro.id);
        rows.push({
          partLabel: part.label,
          microIdx: mi,
          answered: here.length,
          correct: here.filter((a) => a.correct).length,
        });
      });
    });
    return rows;
  }, [room.answers]);

  return (
    <div style={{ padding: '32px 28px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div
          style={{
            padding: 24,
            borderRadius: 20,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            boxShadow: '0 4px 0 var(--pb-ink)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)' }}>
            Self-paced · Join at
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--pb-ink)',
              marginTop: 6,
              fontFamily: 'DM Mono, ui-monospace, monospace',
              wordBreak: 'break-all',
            }}
          >
            {joinUrl.replace(/^https?:\/\//, '')}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)', marginTop: 24 }}>
            Or enter PIN
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'var(--pb-ink)',
              marginTop: 4,
              fontFamily: 'DM Mono, ui-monospace, monospace',
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            {room.pin}
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
            Students work at their own pace. No start button — results
            update live as they submit.
          </div>
        </div>

        <div
          style={{
            padding: 20,
            borderRadius: 20,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 4px 0 var(--pb-line-2)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 320,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trophy size={14} strokeWidth={2.4} style={{ color: 'var(--pb-butter-ink)' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
              Leaderboard ({ranked.length})
            </span>
          </div>
          <div
            style={{
              flex: 1,
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              overflow: 'auto',
            }}
          >
            {ranked.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)' }}>
                Waiting for players to join…
              </div>
            )}
            {ranked.map((p, i) => (
              <div
                key={p.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: i === 0 ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
                  border: `1.5px solid ${i === 0 ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 22, textAlign: 'center', fontWeight: 800, color: 'var(--pb-ink-muted)', fontSize: 12 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>
                  {p.displayName}
                </div>
                <div style={{ fontFamily: 'DM Mono, ui-monospace, monospace', fontWeight: 800, color: 'var(--pb-ink)', fontSize: 13 }}>
                  {p.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 22,
          padding: 16,
          borderRadius: 16,
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Users size={13} strokeWidth={2.4} style={{ color: 'var(--pb-ink)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
            Per-question progress
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {slots.map((s, i) => (
            <div
              key={i}
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                fontSize: 11,
                color: 'var(--pb-ink)',
              }}
            >
              <div style={{ fontWeight: 800, letterSpacing: '0.04em' }}>
                {s.partLabel} · Q{s.microIdx + 1}
              </div>
              <div style={{ marginTop: 4, color: 'var(--pb-ink-muted)' }}>
                {s.answered} answered · {s.correct} correct
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function hostPrimaryBtn(): React.CSSProperties {
  return {
    padding: '12px 18px',
    borderRadius: 12,
    background: 'var(--pb-ink)',
    color: 'var(--pb-paper)',
    border: '1.5px solid var(--pb-ink)',
    boxShadow: '0 3px 0 #000',
    fontSize: 14,
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  };
}
