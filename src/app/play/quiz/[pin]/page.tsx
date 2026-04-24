'use client';

import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import { FRQ } from '@/lib/quiz/frq-content';
import type { Micro } from '@/lib/quiz/frq-content';
import type { RoomPublic, RoomPlayer } from '@/lib/quiz/room-types';
import { useRoom } from '@/lib/quiz/use-room';
import {
  WhiteboardCanvas,
  type WhiteboardHandle,
} from '@/components/quiz/WhiteboardCanvas';

// Public student page. Kahoot-style: big colored buttons, no question
// text (question lives on the teacher's screen). Students land here by
// clicking the Classroom link or typing the PIN from the host screen.

const CHOICE_TONES = [
  { bg: '#ff5a6e', ink: '#ffffff' },
  { bg: '#3b82f6', ink: '#ffffff' },
  { bg: '#eab308', ink: '#3d2e00' },
  { bg: '#22c55e', ink: '#06331a' },
];

interface StoredSeat {
  token: string;
  playerId: string;
  roomId: string;
}

export default function PlayQuizPage({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = use(params);

  // Phase A: resolve PIN → roomId. One-shot lookup; subsequent state
  // comes from useRoom which is realtime-capable when Supabase is set up.
  const [roomId, setRoomId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [seat, setSeat] = useState<StoredSeat | null>(null);
  const [lastResult, setLastResult] = useState<
    { correct: boolean; points: number; newScore: number } | null
  >(null);
  const [answeredKey, setAnsweredKey] = useState<string | null>(null);

  const { room } = useRoom(roomId);

  // PIN lookup + rehydrate from localStorage if we've joined this room before.
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/quiz/rooms?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      const r: RoomPublic = data.room;
      setRoomId(r.id);

      const cached = typeof window !== 'undefined'
        ? localStorage.getItem(`pb:quiz:${pin}`)
        : null;
      if (cached) {
        const parsed = JSON.parse(cached) as StoredSeat;
        // Only trust the cache if the player still exists in the room
        // (Supabase could have been wiped, etc).
        if (r.players.some((p) => p.id === parsed.playerId)) {
          setSeat(parsed);
        }
      }
    })();
  }, [pin]);

  // Clear "last result" whenever the host moves to the next question.
  useEffect(() => {
    if (!room || !seat) return;
    const key = `${room.partIdx}:${room.microIdx}`;
    if (room.phase === 'question' && answeredKey !== key) {
      setLastResult(null);
    }
  }, [room?.phase, room?.partIdx, room?.microIdx, seat, answeredKey]);

  const join = useCallback(async (displayName: string) => {
    if (!room) return;
    const res = await fetch(`/api/quiz/rooms/${room.id}/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error ?? 'Could not join');
      return;
    }
    const next: StoredSeat = { token: data.token, playerId: data.player.id, roomId: room.id };
    localStorage.setItem(`pb:quiz:${pin}`, JSON.stringify(next));
    setSeat(next);
  }, [room, pin]);

  const submit = useCallback(async (opts: {
    answerId?: string;
    answerValue?: number;
    answerImagePath?: string;
  }) => {
    if (!room || !seat) return;
    const part = FRQ.parts[room.partIdx];
    const micro = part?.micros[room.microIdx];
    if (!part || !micro) return;
    const key = `${room.partIdx}:${room.microIdx}`;
    setAnsweredKey(key);
    const res = await fetch(`/api/quiz/rooms/${room.id}/answer`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: seat.token,
        partId: part.id,
        microId: micro.id,
        ...opts,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setLastResult({ correct: data.correct, points: data.points, newScore: data.newScore });
    }
  }, [room, seat]);

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
      {notFound && (
        <CenterText>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Room not found</div>
          <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
            PIN &quot;{pin}&quot; doesn&rsquo;t match any live quiz.
          </div>
        </CenterText>
      )}
      {!notFound && !room && <CenterText>Loading…</CenterText>}
      {!notFound && room && !seat && (
        <JoinForm room={room} pin={pin} onJoin={join} />
      )}
      {!notFound && room && seat && room.pacing === 'self' && (
        <SelfPacedScreen
          room={room}
          playerId={seat.playerId}
          token={seat.token}
          roomId={room.id}
        />
      )}
      {!notFound && room && seat && room.pacing !== 'self' && (
        <PlayingScreen
          room={room}
          playerId={seat.playerId}
          token={seat.token}
          roomId={room.id}
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
  // Self-paced rooms accept joiners at any time; live rooms only during lobby.
  const joinable = room.pacing === 'self' || room.phase === 'lobby';
  const canJoin = name.trim().length > 0 && joinable;
  return (
    <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
        {room.pacing === 'self' ? 'Self-paced quiz' : 'Join quiz'} · PIN {pin}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
        {FRQ.source.title}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
        {FRQ.source.exam} · {FRQ.source.year}
      </div>

      {!joinable && (
        <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: 'rgba(255,90,110,0.18)', border: '1px solid rgba(255,90,110,0.5)', fontSize: 13 }}>
          This quiz has already started — you can&rsquo;t join now.
        </div>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your nickname"
        disabled={!joinable}
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
  token,
  roomId,
  lastResult,
  answeredKey,
  onSubmit,
}: {
  room: RoomPublic;
  playerId: string;
  token: string;
  roomId: string;
  lastResult: { correct: boolean; points: number; newScore: number } | null;
  answeredKey: string | null;
  onSubmit: (opts: {
    answerId?: string;
    answerValue?: number;
    answerImagePath?: string;
  }) => void;
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
          <QuestionInput
            micro={micro}
            roomId={roomId}
            token={token}
            partId={part.id}
            onSubmit={onSubmit}
          />
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
  roomId,
  token,
  partId,
  onSubmit,
}: {
  micro: Micro;
  roomId: string;
  token: string;
  partId: string;
  onSubmit: (opts: {
    answerId?: string;
    answerValue?: number;
    answerImagePath?: string;
  }) => void;
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
  if (micro.kind === 'whiteboard') {
    return (
      <WhiteboardQuestion
        micro={micro}
        roomId={roomId}
        token={token}
        partId={partId}
        onSubmit={onSubmit}
      />
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

function WhiteboardQuestion({
  micro,
  roomId,
  token,
  partId,
  onSubmit,
}: {
  micro: Extract<Micro, { kind: 'whiteboard' }>;
  roomId: string;
  token: string;
  partId: string;
  onSubmit: (opts: { answerImagePath?: string }) => void;
}) {
  const ref = useRef<WhiteboardHandle | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitWhiteboard = useCallback(async () => {
    if (!ref.current) return;
    if (!ref.current.hasContent()) {
      setError('Draw something before submitting.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await ref.current.getPngBlob();
      if (!blob) {
        setError('Could not snapshot the canvas.');
        return;
      }
      const form = new FormData();
      form.append('token', token);
      form.append('partId', partId);
      form.append('microId', micro.id);
      form.append('file', blob, `${partId}-${micro.id}.png`);
      const res = await fetch(`/api/quiz/rooms/${roomId}/answer/image`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Upload failed.');
        return;
      }
      onSubmit({ answerImagePath: data.path });
    } finally {
      setBusy(false);
    }
  }, [micro.id, partId, roomId, token, onSubmit]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {micro.hint && (
        <div style={{ fontSize: 12, opacity: 0.75, textAlign: 'center', lineHeight: 1.5 }}>
          {micro.hint}
        </div>
      )}
      <WhiteboardCanvas ref={ref} width={320} height={360} disabled={busy} />
      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(255,90,110,0.18)',
            border: '1px solid rgba(255,90,110,0.5)',
            color: '#fecaca',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={submitWhiteboard}
        style={{
          padding: 16,
          borderRadius: 14,
          border: 0,
          background: busy ? 'rgba(255,255,255,0.14)' : '#22c55e',
          color: busy ? 'rgba(255,255,255,0.6)' : '#06331a',
          fontSize: 16,
          fontWeight: 800,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy ? 'Submitting…' : 'Submit drawing'}
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

// ---------- Self-paced student flow ----------
//
// Live rooms get their progression from the host's phase machine. Self-
// paced rooms don't have one — each student walks the whole FRQ at
// their own speed. We keep the step state locally, POST each answer
// to /answer (server grades + updates score), show a small reveal
// card with the explanation, then let the student tap "Next".

function SelfPacedScreen({
  room,
  playerId,
  token,
  roomId,
}: {
  room: RoomPublic;
  playerId: string;
  token: string;
  roomId: string;
}) {
  // Flatten the FRQ into a single ordered list of (partIdx, microIdx)
  // so "next" is just i++.
  const steps = useMemo(() => {
    const out: { partIdx: number; microIdx: number }[] = [];
    FRQ.parts.forEach((p, pi) => p.micros.forEach((_m, mi) => out.push({ partIdx: pi, microIdx: mi })));
    return out;
  }, []);

  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState<'answering' | 'reveal' | 'done'>('answering');
  const [lastResult, setLastResult] = useState<
    { correct: boolean; points: number; newScore: number } | null
  >(null);
  const [busy, setBusy] = useState(false);

  const me = room.players.find((p) => p.id === playerId);
  const step = steps[stepIdx];
  const part = step ? FRQ.parts[step.partIdx] : null;
  const micro = part && step ? part.micros[step.microIdx] : null;

  const submit = useCallback(
    async (opts: {
      answerId?: string;
      answerValue?: number;
      answerImagePath?: string;
    }) => {
      if (!part || !micro || busy) return;
      setBusy(true);
      try {
        const res = await fetch(`/api/quiz/rooms/${roomId}/answer`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            token,
            partId: part.id,
            microId: micro.id,
            ...opts,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setLastResult({
            correct: data.correct,
            points: data.points,
            newScore: data.newScore,
          });
          setPhase('reveal');
        } else {
          // already-answered means we resumed an earlier session — just
          // advance past this step without showing a reveal.
          if (data?.error === 'already-answered') {
            setStepIdx((i) => Math.min(i + 1, steps.length));
            setPhase(stepIdx + 1 >= steps.length ? 'done' : 'answering');
          } else {
            alert(data?.error ?? 'Could not submit');
          }
        }
      } finally {
        setBusy(false);
      }
    },
    [part, micro, busy, roomId, token, stepIdx, steps.length],
  );

  const next = useCallback(() => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= steps.length) {
      setPhase('done');
      return;
    }
    setStepIdx(nextIdx);
    setPhase('answering');
    setLastResult(null);
  }, [stepIdx, steps.length]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <StudentHeader name={me?.displayName ?? '—'} score={me?.score ?? 0} phase={room.phase} />

      {phase === 'answering' && part && micro && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
          <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            {part.label} · Step {step.microIdx + 1}/{part.micros.length} · {stepIdx + 1}/{steps.length}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 14 }}>
            {micro.prompt}
          </div>
          <QuestionInput
            micro={micro}
            roomId={roomId}
            token={token}
            partId={part.id}
            onSubmit={submit}
          />
        </div>
      )}

      {phase === 'reveal' && lastResult && micro && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
          <div
            style={{
              padding: 18,
              borderRadius: 16,
              background: lastResult.correct ? 'rgba(34,197,94,0.2)' : 'rgba(255,90,110,0.2)',
              border: `1.5px solid ${lastResult.correct ? 'rgba(34,197,94,0.5)' : 'rgba(255,90,110,0.5)'}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800 }}>
              {lastResult.correct ? 'Correct!' : 'Not quite'}
            </div>
            {lastResult.correct && (
              <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>
                +{lastResult.points} points
              </div>
            )}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Total: {lastResult.newScore}
            </div>
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {micro.explain}
          </div>
          <button
            type="button"
            onClick={next}
            style={{
              marginTop: 'auto',
              padding: 16,
              borderRadius: 14,
              border: 0,
              background: '#22c55e',
              color: '#06331a',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {stepIdx + 1 >= steps.length ? 'Finish' : 'Next question'}
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>
            Done
          </div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>{me?.score ?? 0}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>points total</div>
          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7, textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
            Your teacher can see everyone&rsquo;s scores on their dashboard.
          </div>
        </div>
      )}
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
