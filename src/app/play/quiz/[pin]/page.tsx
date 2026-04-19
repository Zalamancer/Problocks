'use client';

import { useCallback, useEffect, useMemo, useState, use } from 'react';
import { FRQ } from '@/lib/quiz/frq-content';
import type { Micro } from '@/lib/quiz/frq-content';
import type { RoomPublic, RoomPlayer } from '@/lib/quiz/room-types';

// Public student page. Kahoot-style: big colored buttons, no question
// text (question lives on the teacher's screen). Students land here by
// clicking the Classroom link or typing the PIN from the host screen.

type Screen =
  | { kind: 'loading' }
  | { kind: 'notfound' }
  | { kind: 'joining'; room: RoomPublic }
  | { kind: 'playing'; room: RoomPublic; playerId: string; token: string };

const CHOICE_TONES = [
  { bg: '#ff5a6e', ink: '#ffffff' },
  { bg: '#3b82f6', ink: '#ffffff' },
  { bg: '#eab308', ink: '#3d2e00' },
  { bg: '#22c55e', ink: '#06331a' },
];

export default function PlayQuizPage({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = use(params);
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' });
  const [lastResult, setLastResult] = useState<
    { correct: boolean; points: number; newScore: number } | null
  >(null);
  const [answeredKey, setAnsweredKey] = useState<string | null>(null);

  // Look up room by PIN on mount. If we already have a token stored for
  // this PIN, rehydrate into the 'playing' screen without re-joining.
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/quiz/rooms?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) {
        setScreen({ kind: 'notfound' });
        return;
      }
      const data = await res.json();
      const room: RoomPublic = data.room;
      const storageKey = `pb:quiz:${pin}`;
      const cached = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (cached) {
        const parsed = JSON.parse(cached) as { token: string; playerId: string };
        if (room.players.some((p) => p.id === parsed.playerId)) {
          setScreen({ kind: 'playing', room, playerId: parsed.playerId, token: parsed.token });
          return;
        }
      }
      setScreen({ kind: 'joining', room });
    })();
  }, [pin]);

  // Poll while in 'joining' or 'playing' state.
  useEffect(() => {
    if (screen.kind !== 'joining' && screen.kind !== 'playing') return;
    const roomId = screen.room.id;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/quiz/rooms/${roomId}`);
        if (!res.ok) return;
        const data = await res.json();
        setScreen((prev) => {
          if (prev.kind === 'joining')  return { ...prev, room: data.room };
          if (prev.kind === 'playing')  return { ...prev, room: data.room };
          return prev;
        });
      } catch { /* transient */ }
    }, 1000);
    return () => clearInterval(id);
  }, [screen.kind, screen.kind === 'joining' || screen.kind === 'playing' ? screen.room.id : null]);

  // Clear "last result" as soon as the host moves to the next question.
  useEffect(() => {
    if (screen.kind !== 'playing') return;
    const key = `${screen.room.partIdx}:${screen.room.microIdx}`;
    if (screen.room.phase === 'question' && answeredKey !== key) {
      setLastResult(null);
    }
  }, [screen, answeredKey]);

  const join = useCallback(async (displayName: string) => {
    if (screen.kind !== 'joining') return;
    const res = await fetch(`/api/quiz/rooms/${screen.room.id}/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error ?? 'Could not join');
      return;
    }
    const token: string = data.token;
    const playerId: string = data.player.id;
    localStorage.setItem(`pb:quiz:${pin}`, JSON.stringify({ token, playerId }));
    setScreen({ kind: 'playing', room: data.room, playerId, token });
  }, [screen, pin]);

  const submit = useCallback(async (opts: { answerId?: string; answerValue?: number }) => {
    if (screen.kind !== 'playing') return;
    const part = FRQ.parts[screen.room.partIdx];
    const micro = part?.micros[screen.room.microIdx];
    if (!part || !micro) return;
    const key = `${screen.room.partIdx}:${screen.room.microIdx}`;
    setAnsweredKey(key);
    const res = await fetch(`/api/quiz/rooms/${screen.room.id}/answer`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: screen.token,
        partId: part.id,
        microId: micro.id,
        ...opts,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setLastResult({ correct: data.correct, points: data.points, newScore: data.newScore });
    }
  }, [screen]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0c1f',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {screen.kind === 'loading' && <CenterText>Loading…</CenterText>}
      {screen.kind === 'notfound' && (
        <CenterText>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Room not found</div>
          <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
            PIN &quot;{pin}&quot; doesn&rsquo;t match any live quiz.
          </div>
        </CenterText>
      )}
      {screen.kind === 'joining' && (
        <JoinForm room={screen.room} pin={pin} onJoin={join} />
      )}
      {screen.kind === 'playing' && (
        <PlayingScreen
          room={screen.room}
          playerId={screen.playerId}
          lastResult={lastResult}
          answeredKey={answeredKey}
          onSubmit={submit}
        />
      )}
    </div>
  );
}

function CenterText({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>{children}</div>
    </div>
  );
}

function JoinForm({
  room,
  pin,
  onJoin,
}: {
  room: RoomPublic;
  pin: string;
  onJoin: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const canJoin = name.trim().length > 0 && room.phase === 'lobby';
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
        Join quiz · PIN {pin}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
        {FRQ.source.title}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
        {FRQ.source.exam} · {FRQ.source.year}
      </div>

      {room.phase !== 'lobby' && (
        <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: 'rgba(255,90,110,0.18)', border: '1px solid rgba(255,90,110,0.5)', fontSize: 13 }}>
          This quiz has already started — you can&rsquo;t join now.
        </div>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your nickname"
        disabled={room.phase !== 'lobby'}
        maxLength={24}
        onKeyDown={(e) => { if (e.key === 'Enter' && canJoin) onJoin(name.trim()); }}
        style={{
          marginTop: 18,
          padding: '14px 16px',
          borderRadius: 12,
          border: '1.5px solid rgba(255,255,255,0.14)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: 18,
          fontWeight: 700,
          outline: 'none',
        }}
      />
      <button
        type="button"
        onClick={() => onJoin(name.trim())}
        disabled={!canJoin}
        style={{
          marginTop: 12,
          padding: '14px',
          borderRadius: 12,
          border: 0,
          background: canJoin ? '#22c55e' : 'rgba(255,255,255,0.14)',
          color: canJoin ? '#06331a' : 'rgba(255,255,255,0.5)',
          fontSize: 16,
          fontWeight: 800,
          cursor: canJoin ? 'pointer' : 'not-allowed',
        }}
      >
        Join
      </button>
    </div>
  );
}

function PlayingScreen({
  room,
  playerId,
  lastResult,
  answeredKey,
  onSubmit,
}: {
  room: RoomPublic;
  playerId: string;
  lastResult: { correct: boolean; points: number; newScore: number } | null;
  answeredKey: string | null;
  onSubmit: (opts: { answerId?: string; answerValue?: number }) => void;
}) {
  const me = room.players.find((p) => p.id === playerId);
  const part = FRQ.parts[room.partIdx];
  const micro = part?.micros[room.microIdx];
  const qKey = `${room.partIdx}:${room.microIdx}`;
  const answeredThis = answeredKey === qKey;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <StudentHeader name={me?.displayName ?? '—'} score={me?.score ?? 0} phase={room.phase} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
        {room.phase === 'lobby' && <WaitingCard text="Hang tight — waiting for the teacher to start." />}

        {room.phase === 'question' && part && micro && !answeredThis && (
          <QuestionInput micro={micro} onSubmit={onSubmit} />
        )}
        {room.phase === 'question' && answeredThis && (
          <WaitingCard text="Answer locked in. Waiting for others…" />
        )}

        {room.phase === 'reveal' && lastResult && (
          <ResultCard result={lastResult} />
        )}
        {room.phase === 'reveal' && !lastResult && (
          <WaitingCard text="Didn't answer in time." />
        )}

        {room.phase === 'leaderboard' && me && (
          <LeaderboardSelf room={room} playerId={playerId} />
        )}

        {room.phase === 'done' && me && (
          <FinalCard room={room} playerId={playerId} />
        )}
      </div>
    </div>
  );
}

function StudentHeader({
  name,
  score,
  phase,
}: {
  name: string;
  score: number;
  phase: RoomPublic['phase'];
}) {
  return (
    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div
        style={{
          padding: '3px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.08)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}
      >
        {phase}
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{name}</div>
      <div style={{ fontFamily: 'DM Mono, ui-monospace, monospace', fontWeight: 800, fontSize: 16 }}>
        {score}
      </div>
    </div>
  );
}

function WaitingCard({ text }: { text: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, opacity: 0.8, textAlign: 'center', padding: 24 }}>
      {text}
    </div>
  );
}

function QuestionInput({
  micro,
  onSubmit,
}: {
  micro: Micro;
  onSubmit: (opts: { answerId?: string; answerValue?: number }) => void;
}) {
  const [num, setNum] = useState('');
  if (micro.kind === 'choice') {
    return (
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {micro.options.map((o, i) => {
          const tone = CHOICE_TONES[i % CHOICE_TONES.length];
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSubmit({ answerId: o.id })}
              style={{
                border: 0,
                borderRadius: 18,
                background: tone.bg,
                color: tone.ink,
                fontSize: 20,
                fontWeight: 800,
                cursor: 'pointer',
                padding: 20,
                minHeight: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {o.id}
            </button>
          );
        })}
      </div>
    );
  }
  const parsed = parseFloat(num);
  const valid = !isNaN(parsed);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
        Type a number{micro.unit ? ` (in ${micro.unit})` : ''}
      </div>
      <input
        type="text"
        inputMode="decimal"
        autoFocus
        value={num}
        onChange={(e) => setNum(e.target.value)}
        placeholder="0"
        onKeyDown={(e) => { if (e.key === 'Enter' && valid) onSubmit({ answerValue: parsed }); }}
        style={{
          padding: '18px 20px',
          borderRadius: 14,
          border: '1.5px solid rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: 30,
          fontWeight: 800,
          textAlign: 'center',
          outline: 'none',
          fontFamily: 'DM Mono, ui-monospace, monospace',
        }}
      />
      <button
        type="button"
        disabled={!valid}
        onClick={() => onSubmit({ answerValue: parsed })}
        style={{
          padding: '16px',
          borderRadius: 14,
          border: 0,
          background: valid ? '#22c55e' : 'rgba(255,255,255,0.14)',
          color: valid ? '#06331a' : 'rgba(255,255,255,0.5)',
          fontSize: 16,
          fontWeight: 800,
          cursor: valid ? 'pointer' : 'not-allowed',
        }}
      >
        Submit
      </button>
    </div>
  );
}

function ResultCard({ result }: { result: { correct: boolean; points: number; newScore: number } }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 10,
        background: result.correct ? 'rgba(34,197,94,0.2)' : 'rgba(255,90,110,0.2)',
        border: `1.5px solid ${result.correct ? 'rgba(34,197,94,0.5)' : 'rgba(255,90,110,0.5)'}`,
        borderRadius: 18,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 800 }}>
        {result.correct ? 'Correct!' : 'Not quite'}
      </div>
      {result.correct && (
        <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.9 }}>
          +{result.points} points
        </div>
      )}
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
        Total: {result.newScore}
      </div>
    </div>
  );
}

function LeaderboardSelf({ room, playerId }: { room: RoomPublic; playerId: string }) {
  const ranked = useMemo(() => [...room.players].sort((a, b) => b.score - a.score), [room.players]);
  const mine = ranked.findIndex((p) => p.id === playerId);
  const me = ranked[mine];
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, opacity: 0.7 }}>Your rank</div>
      <div style={{ fontSize: 48, fontWeight: 800 }}>#{mine + 1}</div>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{me?.displayName} · {me?.score} pts</div>
    </div>
  );
}

function FinalCard({ room, playerId }: { room: RoomPublic; playerId: string }) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const mine = ranked.findIndex((p) => p.id === playerId);
  const top3 = ranked.slice(0, 3) as RoomPlayer[];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
        Final
      </div>
      <div style={{ fontSize: 40, fontWeight: 800 }}>#{mine + 1}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        {top3.map((p, i) => (
          <div
            key={p.id}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: ['#eab308', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)'][i],
              color: i === 0 ? '#3d2e00' : '#fff',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {i + 1}. {p.displayName} · {p.score}
          </div>
        ))}
      </div>
    </div>
  );
}

