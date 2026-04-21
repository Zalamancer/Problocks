'use client';

// /teach/race — teacher dashboard for the multiplayer Race challenge.
// Flow: land → "New Race" → PIN + QR (future) + share link → watch
// the board fill with pawns as students join → "Start heat" flips to
// running → live leaderboard as the door fills up → "New heat" keeps
// the class + trophies and re-rolls spawns.

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flag, RotateCcw, Trophy, Users } from 'lucide-react';
import { useRace } from '@/lib/race/use-race';
import { rankPlayers } from '@/lib/race/race-logic';
import type { RacePublic } from '@/lib/race/race-types';
import { RaceBoard } from '@/components/race/RaceBoard';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';

export default function TeachRacePage() {
  const [raceId, setRaceId] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { race, refresh } = useRace(raceId);

  const createRoom = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/race/rooms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setRaceId(data.raceId);
        setPin(data.pin);
      } else {
        alert(data?.error ?? 'Could not create race');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  const startHeat = useCallback(async () => {
    if (!raceId) return;
    setBusy(true);
    try {
      await fetch(`/api/race/rooms/${raceId}/start`, { method: 'POST' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [raceId, refresh]);

  const newHeat = useCallback(async () => {
    if (!raceId) return;
    setBusy(true);
    try {
      await fetch(`/api/race/rooms/${raceId}/reset`, { method: 'POST' });
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [raceId, refresh]);

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
      <TopBar />
      {!raceId && <PickerCard busy={busy} onCreate={createRoom} />}
      {raceId && race && (
        <HostStage
          race={race}
          pin={pin}
          busy={busy}
          onStartHeat={startHeat}
          onNewHeat={newHeat}
        />
      )}
      {raceId && !race && <Centered>Opening race room…</Centered>}
    </div>
  );
}

function TopBar() {
  return (
    <header
      style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderBottom: '1.5px solid var(--pb-line-2)',
        background: 'var(--pb-paper)',
      }}
    >
      <Link
        href="/teach"
        style={{ color: 'var(--pb-ink-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Teacher hub
      </Link>
      <div style={{ width: 1, height: 16, background: 'var(--pb-line-2)' }} />
      <div style={{ fontSize: 13, fontWeight: 800 }}>Race Challenge</div>
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

function PickerCard({ busy, onCreate }: { busy: boolean; onCreate: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, color: 'var(--pb-ink-muted)' }}>
        Teacher · new race room
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', maxWidth: 560, lineHeight: 1.2 }}>
        Everyone races the same chessboard — different starting tiles, one door, first one through wins a trophy.
      </div>
      <div style={{ fontSize: 13, color: 'var(--pb-ink-muted)', maxWidth: 540, textAlign: 'center', lineHeight: 1.5 }}>
        Open a room, share the PIN, students join and each get a different starting square on the bottom row. Hit <b>Start heat</b> when the class is ready.
      </div>
      <div style={{ marginTop: 6 }}>
        <PanelActionButton
          variant="primary"
          size="md"
          disabled={busy}
          onClick={onCreate}
        >
          {busy ? 'Opening…' : 'Open race room'}
        </PanelActionButton>
      </div>
    </div>
  );
}

function HostStage({
  race,
  pin,
  busy,
  onStartHeat,
  onNewHeat,
}: {
  race: RacePublic;
  pin: string | null;
  busy: boolean;
  onStartHeat: () => void;
  onNewHeat: () => void;
}) {
  const ranked = useMemo(() => rankPlayers(race), [race]);
  const joinUrl = useMemo(() => {
    if (typeof window === 'undefined' || !pin) return '';
    return `${window.location.origin}/play/race/${pin}`;
  }, [pin]);

  return (
    <div
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr) minmax(260px, 320px)',
        gap: 16,
        padding: 20,
        minHeight: 0,
      }}
    >
      <aside style={columnStyle}>
        <PanelSection collapsible defaultOpen title="Join PIN">
          <div style={{ padding: '6px 2px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontFamily: 'DM Mono, ui-monospace, monospace',
                fontSize: 52,
                fontWeight: 900,
                letterSpacing: '0.12em',
                textAlign: 'center',
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 14,
                padding: '14px 10px',
              }}
            >
              {pin ?? '——————'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)', textAlign: 'center' }}>
              Students open
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', wordBreak: 'break-all', background: 'var(--pb-cream-2)', padding: '8px 10px', borderRadius: 10, border: '1px solid var(--pb-line-2)' }}>
              {joinUrl || `/play/race/${pin}`}
            </div>
          </div>
        </PanelSection>

        <PanelSection collapsible defaultOpen title="Players">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 10px' }}>
            <Users size={14} color="var(--pb-ink-muted)" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {race.players.length} joined · heat {race.heat}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {race.players.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', fontStyle: 'italic' }}>
                Waiting for students to scan the PIN…
              </div>
            )}
            {race.players.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: 'var(--pb-paper)',
                  border: '1px solid var(--pb-line-2)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.displayName}
                </span>
                <span style={{ color: 'var(--pb-ink-muted)', fontFamily: 'DM Mono, monospace' }}>
                  ({p.startCol},{p.startRow})
                </span>
              </div>
            ))}
          </div>
        </PanelSection>
      </aside>

      <main style={{ ...columnStyle, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 720 }}>
          <RaceBoard race={race} />
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <PhasePill phase={race.phase} />
          {race.phase === 'lobby' && (
            <PanelActionButton
              variant="primary"
              size="md"
              icon={Flag}
              onClick={onStartHeat}
              disabled={busy || race.players.length === 0}
            >
              Start heat
            </PanelActionButton>
          )}
          {race.phase !== 'lobby' && (
            <PanelActionButton
              variant="secondary"
              size="md"
              icon={RotateCcw}
              onClick={onNewHeat}
              disabled={busy}
            >
              New heat
            </PanelActionButton>
          )}
        </div>
      </main>

      <aside style={columnStyle}>
        <PanelSection collapsible defaultOpen title="Leaderboard">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ranked.map((p, i) => {
              const finished = p.finishRank != null;
              const first = p.finishRank === 1;
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: first ? 'rgba(234,179,8,0.25)' : 'var(--pb-paper)',
                    border: first ? '1.5px solid #eab308' : '1px solid var(--pb-line-2)',
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
                    {finished ? p.finishRank : i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{p.displayName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800 }}>
                    <Trophy size={12} /> {p.trophies}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontFamily: 'DM Mono, monospace' }}>
                    {p.moves}m
                  </div>
                </div>
              );
            })}
            {race.players.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', fontStyle: 'italic' }}>
                No finishers yet.
              </div>
            )}
          </div>
        </PanelSection>
      </aside>
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

function PhasePill({ phase }: { phase: 'lobby' | 'running' | 'done' }) {
  const map: Record<'lobby' | 'running' | 'done', { bg: string; ink: string; label: string }> = {
    lobby:   { bg: 'rgba(120,180,255,0.18)', ink: '#0d3566', label: 'Lobby' },
    running: { bg: 'rgba(34,197,94,0.18)',   ink: '#0d4a22', label: 'Running' },
    done:    { bg: 'rgba(234,179,8,0.22)',   ink: '#4a3800', label: 'Heat complete' },
  };
  const s = map[phase];
  return (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        background: s.bg,
        color: s.ink,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        border: '1.5px solid rgba(0,0,0,0.08)',
      }}
    >
      {s.label}
    </span>
  );
}
