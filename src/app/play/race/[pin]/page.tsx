'use client';

// Student Race page. Kahoot-style flow: PIN lookup → join with a
// nickname → land on your starting tile → build a block sequence
// (Scratch-flavoured "move up/down/left/right" + "run") → watch your
// pawn race the door. The "Scratch" vibe here is the block-based
// program editor, not the full Scratch VM — the VM bridge is overkill
// for a one-screen race and adds a hard dependency on the blocks-only
// iframe's hat blocks, which don't exist for this mode yet.

import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Play as PlayIcon,
  RotateCcw,
  Trash2,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRace } from '@/lib/race/use-race';
import { rankPlayers } from '@/lib/race/race-logic';
import type { MoveDir, RacePublic } from '@/lib/race/race-types';
import { RaceBoard } from '@/components/race/RaceBoard';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';

interface StoredSeat {
  token: string;
  playerId: string;
  raceId: string;
}

export default function PlayRacePage({
  params,
}: {
  params: Promise<{ pin: string }>;
}) {
  const { pin } = use(params);
  const [raceId, setRaceId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [seat, setSeat] = useState<StoredSeat | null>(null);

  const { race, refresh } = useRace(raceId);

  // PIN → raceId lookup, rehydrate seat from localStorage if the
  // student reloads mid-race.
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/race/rooms?pin=${encodeURIComponent(pin)}`);
      if (!res.ok) { setNotFound(true); return; }
      const data = await res.json();
      const r: RacePublic = data.race;
      setRaceId(r.id);
      const cached = typeof window !== 'undefined'
        ? localStorage.getItem(`pb:race:${pin}`)
        : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as StoredSeat;
          if (r.players.some((p) => p.id === parsed.playerId)) {
            setSeat(parsed);
          }
        } catch { /* ignore */ }
      }
    })();
  }, [pin]);

  const join = useCallback(async (displayName: string) => {
    if (!raceId) return;
    const res = await fetch(`/api/race/rooms/${raceId}/join`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data?.error ?? 'Could not join'); return; }
    const next: StoredSeat = { token: data.token, playerId: data.player.id, raceId };
    localStorage.setItem(`pb:race:${pin}`, JSON.stringify(next));
    setSeat(next);
  }, [raceId, pin]);

  const sendMove = useCallback(async (dir: MoveDir) => {
    if (!raceId || !seat) return false;
    const res = await fetch(`/api/race/rooms/${raceId}/move`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: seat.token, dir }),
    });
    await refresh();
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.won);
  }, [raceId, seat, refresh]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--pb-cream, var(--pb-paper))',
        color: 'var(--pb-ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TopBar pin={pin} />
      {notFound && <Centered>Room not found. Double-check the PIN.</Centered>}
      {!notFound && !race && <Centered>Loading race…</Centered>}
      {!notFound && race && !seat && (
        <JoinScreen race={race} pin={pin} onJoin={join} />
      )}
      {!notFound && race && seat && (
        <RaceScreen
          race={race}
          seat={seat}
          onMove={sendMove}
        />
      )}
    </div>
  );
}

function TopBar({ pin }: { pin: string }) {
  return (
    <header
      style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1.5px solid var(--pb-line-2)',
        background: 'var(--pb-paper)',
      }}
    >
      <Link
        href="/"
        style={{ color: 'var(--pb-ink-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Home
      </Link>
      <div style={{ width: 1, height: 14, background: 'var(--pb-line-2)' }} />
      <div style={{ fontSize: 12, fontWeight: 800 }}>Race · PIN {pin}</div>
    </header>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontSize: 14, opacity: 0.8 }}>
      {children}
    </div>
  );
}

function JoinScreen({
  race,
  pin,
  onJoin,
}: {
  race: RacePublic;
  pin: string;
  onJoin: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const joinable = race.phase === 'lobby';
  const canJoin = name.trim().length > 0 && joinable;
  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--pb-ink-muted)' }}>
        Join race · PIN {pin}
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, textAlign: 'center' }}>
        Race to the door. First one in wins a 🏆.
      </div>
      {!joinable && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,90,110,0.18)', border: '1px solid rgba(255,90,110,0.5)', fontSize: 13, textAlign: 'center' }}>
          This race has already started — you can&rsquo;t join now. Ask your teacher for a new heat.
        </div>
      )}
      <input
        type="text"
        value={name}
        disabled={!joinable}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && canJoin) onJoin(name.trim()); }}
        placeholder="Your nickname"
        maxLength={24}
        style={{
          width: '100%',
          padding: '14px 16px',
          borderRadius: 12,
          border: '1.5px solid var(--pb-line-2)',
          background: 'var(--pb-paper)',
          color: 'var(--pb-ink)',
          fontSize: 18,
          fontWeight: 800,
          outline: 'none',
        }}
      />
      <PanelActionButton
        variant="primary"
        size="md"
        disabled={!canJoin}
        onClick={() => onJoin(name.trim())}
      >
        Join race
      </PanelActionButton>
      <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', textAlign: 'center' }}>
        {race.players.length} {race.players.length === 1 ? 'student' : 'students'} already joined
      </div>
    </div>
  );
}

// ---- Race screen --------------------------------------------------
//
// Layout echoes the three-column studio shell: left is the block
// program editor (Scratch-style move/run blocks), center is the
// shared board with every pawn, right is the live leaderboard.

function RaceScreen({
  race,
  seat,
  onMove,
}: {
  race: RacePublic;
  seat: StoredSeat;
  onMove: (dir: MoveDir) => Promise<boolean>;
}) {
  const me = race.players.find((p) => p.id === seat.playerId);
  const ranked = useMemo(() => rankPlayers(race), [race]);
  const running = race.phase === 'running';
  const finished = me?.finishRank != null;

  // Program editor state. Students assemble a sequence of move blocks
  // then hit Run — each step posts a single-cell move to the server
  // and waits ~180ms so the board pans smoothly instead of teleporting.
  const [program, setProgram] = useState<MoveDir[]>([]);
  const [playing, setPlaying] = useState(false);
  const abortRef = useRef(false);

  const addStep = useCallback((dir: MoveDir) => {
    if (playing) return;
    setProgram((p) => (p.length >= 40 ? p : [...p, dir]));
  }, [playing]);

  const clearProgram = useCallback(() => {
    if (playing) return;
    setProgram([]);
  }, [playing]);

  const popStep = useCallback(() => {
    if (playing) return;
    setProgram((p) => p.slice(0, -1));
  }, [playing]);

  const run = useCallback(async () => {
    if (playing || !running || finished) return;
    setPlaying(true);
    abortRef.current = false;
    try {
      for (const step of program) {
        if (abortRef.current) break;
        const won = await onMove(step);
        if (won) break;
        await new Promise((r) => setTimeout(r, 180));
      }
    } finally {
      setPlaying(false);
    }
  }, [playing, program, onMove, running, finished]);

  // Arrow-key fallback — keeps the race playable for students who just
  // want to hammer the keyboard instead of building a program. Disabled
  // while the block program is running so presses don't race the loop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running || finished || playing) return;
      if (e.key === 'ArrowUp')    { void onMove('up');    e.preventDefault(); }
      if (e.key === 'ArrowDown')  { void onMove('down');  e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { void onMove('left');  e.preventDefault(); }
      if (e.key === 'ArrowRight') { void onMove('right'); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, finished, playing, onMove]);

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 300px) minmax(0, 1fr) minmax(220px, 280px)',
        gap: 12,
        padding: 12,
        minHeight: 0,
      }}
    >
      <aside style={columnStyle}>
        <PanelSection collapsible defaultOpen title="Blocks">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '4px 2px' }}>
            <BlockChip label="Up"    icon={ArrowUp}    color="#78b4ff" onClick={() => addStep('up')} />
            <BlockChip label="Down"  icon={ArrowDown}  color="#c792ff" onClick={() => addStep('down')} />
            <BlockChip label="Left"  icon={ArrowLeft}  color="#ff7aa6" onClick={() => addStep('left')} />
            <BlockChip label="Right" icon={ArrowRight} color="#ffb347" onClick={() => addStep('right')} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)', marginTop: 6, padding: '0 2px', lineHeight: 1.5 }}>
            Tap a block to append it to your program. Up to 40 steps. Arrow keys also work.
          </div>
        </PanelSection>

        <PanelSection collapsible defaultOpen title={`Program (${program.length})`}>
          <div style={{ minHeight: 40, display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6, background: 'var(--pb-cream-2)', border: '1.5px solid var(--pb-line-2)', borderRadius: 10 }}>
            {program.length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--pb-ink-muted)', fontStyle: 'italic', padding: 4 }}>
                No blocks yet — tap above.
              </span>
            )}
            {program.map((d, i) => (
              <span
                key={`${i}:${d}`}
                style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  background: 'var(--pb-paper)',
                  border: '1.5px solid var(--pb-line-2)',
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: 'DM Mono, monospace',
                }}
              >
                {d.toUpperCase()}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <PanelActionButton variant="secondary" size="sm" onClick={popStep} disabled={playing || program.length === 0} icon={RotateCcw}>
              Undo
            </PanelActionButton>
            <PanelActionButton variant="secondary" size="sm" onClick={clearProgram} disabled={playing || program.length === 0} icon={Trash2}>
              Clear
            </PanelActionButton>
          </div>
        </PanelSection>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <PanelActionButton
            variant="primary"
            size="md"
            icon={PlayIcon}
            onClick={run}
            disabled={!running || finished || playing || program.length === 0}
            fullWidth
          >
            {playing ? 'Running…' : finished ? 'Finished' : running ? 'Run program' : 'Waiting for teacher'}
          </PanelActionButton>
        </div>
      </aside>

      <main style={{ ...columnStyle, alignItems: 'center', justifyContent: 'flex-start' }}>
        <StatusStrip race={race} me={me} />
        <div style={{ width: '100%', maxWidth: 640, marginTop: 4 }}>
          <RaceBoard race={race} meId={seat.playerId} />
        </div>
        <DPad
          disabled={!running || finished || playing}
          onMove={(d) => { void onMove(d); }}
        />
      </main>

      <aside style={columnStyle}>
        <PanelSection collapsible defaultOpen title="Leaderboard">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ranked.map((p, i) => {
              const first = p.finishRank === 1;
              const isMe = p.id === seat.playerId;
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: first
                      ? 'rgba(234,179,8,0.25)'
                      : isMe
                        ? 'rgba(34,197,94,0.18)'
                        : 'var(--pb-paper)',
                    border: first
                      ? '1.5px solid #eab308'
                      : isMe
                        ? '1.5px solid #22c55e'
                        : '1px solid var(--pb-line-2)',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      background: 'var(--pb-cream-2)',
                      border: '1px solid var(--pb-line-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    {p.finishRank ?? i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>
                    {p.displayName}{isMe ? ' (you)' : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800 }}>
                    <Trophy size={12} /> {p.trophies}
                  </div>
                </div>
              );
            })}
          </div>
        </PanelSection>
      </aside>
    </div>
  );
}

function BlockChip({
  label,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 12px',
        borderRadius: 12,
        background: color,
        color: '#111',
        border: '1.5px solid #111',
        boxShadow: '0 3px 0 #111',
        fontWeight: 900,
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      <Icon size={16} strokeWidth={2.4} /> {label}
    </button>
  );
}

function StatusStrip({ race, me }: { race: RacePublic; me: RacePublic['players'][number] | undefined }) {
  const label = race.phase === 'lobby'
    ? 'Waiting for teacher to start…'
    : me?.finishRank === 1
      ? 'You won! 🏆'
      : me?.finishRank != null
        ? `Finished #${me.finishRank}`
        : race.phase === 'done'
          ? 'Heat complete'
          : 'Race is live — move!';

  const tone = race.phase === 'lobby'
    ? 'rgba(120,180,255,0.18)'
    : me?.finishRank === 1
      ? 'rgba(234,179,8,0.28)'
      : me?.finishRank != null
        ? 'rgba(34,197,94,0.22)'
        : race.phase === 'done'
          ? 'rgba(201,146,255,0.22)'
          : 'rgba(34,197,94,0.22)';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 640,
        padding: '10px 14px',
        background: tone,
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      <span>{label}</span>
      {me && (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, opacity: 0.8 }}>
          ({me.col},{me.row}) · {me.moves}m · 🏆 {me.trophies}
        </span>
      )}
    </div>
  );
}

function DPad({
  disabled,
  onMove,
}: {
  disabled: boolean;
  onMove: (dir: MoveDir) => void;
}) {
  const btn = (dir: MoveDir, Icon: LucideIcon) => (
    <button
      type="button"
      onClick={() => !disabled && onMove(dir)}
      disabled={disabled}
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        border: '1.5px solid var(--pb-ink)',
        background: disabled ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
        boxShadow: disabled ? 'none' : '0 3px 0 var(--pb-ink)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Icon size={20} strokeWidth={2.6} />
    </button>
  );
  return (
    <div
      style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 48px)',
        gridTemplateRows: 'repeat(3, 48px)',
        gap: 6,
      }}
    >
      <div />
      {btn('up', ArrowUp)}
      <div />
      {btn('left', ArrowLeft)}
      <div />
      {btn('right', ArrowRight)}
      <div />
      {btn('down', ArrowDown)}
      <div />
    </div>
  );
}

const columnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  background: 'var(--pb-paper)',
  border: '1.5px solid var(--pb-line-2)',
  borderRadius: 14,
  padding: 12,
  minHeight: 0,
  overflow: 'auto',
};
