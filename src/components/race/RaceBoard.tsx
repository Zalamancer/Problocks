'use client';

// Shared checkerboard renderer for the Race mode — used by both the
// teacher dashboard (big board, all players visible) and the student
// screen (same board, but highlights "you" with a chunky ring).
//
// Pure render: takes a RacePublic + optional "me" playerId and paints
// tiles. All interaction (movement) lives in the parent page.

import type { RacePublic } from '@/lib/race/race-types';
import { isDoorTile } from '@/lib/race/race-logic';

// Pastel palette picked so player pawns pop against the
// chunky-pastel checkerboard without clashing with trophy yellow or
// door green. Repeats past 8 players.
const PAWN_COLORS = [
  '#ff7aa6', '#78b4ff', '#ffb347', '#7ee2a3',
  '#c792ff', '#ff9472', '#4fd9d9', '#f2d24b',
];

function pawnColor(idx: number): string {
  return PAWN_COLORS[idx % PAWN_COLORS.length];
}

function initials(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? '';
  return (first[0] ?? '?').toUpperCase();
}

export interface RaceBoardProps {
  race: RacePublic;
  meId?: string | null;
  tileSize?: number;
  // Small boards on the student side. On the teacher board we'd rather
  // scale to screen width than cap at a fixed size.
  maxWidth?: number | null;
}

export function RaceBoard({ race, meId = null, tileSize, maxWidth = null }: RaceBoardProps) {
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < race.rows; r++) {
    for (let c = 0; c < race.cols; c++) {
      const dark = (r + c) % 2 === 1;
      const door = isDoorTile(race, c, r);
      tiles.push(
        <div
          key={`${c}:${r}`}
          style={{
            gridColumn: c + 1,
            gridRow: r + 1,
            background: door
              ? 'linear-gradient(180deg, #9af6b0 0%, #3fbc65 100%)'
              : dark
                ? 'var(--pb-cream-2, rgba(0,0,0,0.06))'
                : 'var(--pb-paper)',
            borderRadius: 8,
            border: door
              ? '2px solid #1f8a40'
              : '1.5px solid var(--pb-line-2)',
            boxShadow: door ? '0 2px 0 #1f8a40 inset' : undefined,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {door && (
            <div
              style={{
                fontSize: Math.round((tileSize ?? 56) * 0.45),
                color: '#0e4a22',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                textShadow: '0 1px 0 rgba(255,255,255,0.5)',
              }}
              aria-label="Door"
            >
              🚪
            </div>
          )}
        </div>,
      );
    }
  }

  // Pawns: one absolute-positioned chip per player, layered over the
  // grid so they can slide between tiles later without re-rendering
  // the whole grid. For now they snap; adding CSS transitions here is
  // the cheapest way to get "slide" animation if we want it.
  const pawns = race.players.map((p, idx) => {
    const isMe = !!meId && p.id === meId;
    const finished = p.finishRank != null;
    return (
      <div
        key={p.id}
        style={{
          gridColumn: p.col + 1,
          gridRow: p.row + 1,
          alignSelf: 'center',
          justifySelf: 'center',
          zIndex: isMe ? 3 : 2,
          width: '70%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: pawnColor(idx),
          color: '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: Math.max(11, Math.round((tileSize ?? 56) * 0.38)),
          border: isMe ? '3px solid #1d1a14' : '2px solid rgba(0,0,0,0.35)',
          boxShadow: isMe
            ? '0 0 0 3px rgba(34,197,94,0.6), 0 3px 0 rgba(0,0,0,0.18)'
            : '0 3px 0 rgba(0,0,0,0.18)',
          opacity: finished ? 0.6 : 1,
          transition: 'transform 140ms ease, box-shadow 140ms ease',
        }}
        title={`${p.displayName}${finished ? ` · #${p.finishRank}` : ''}`}
      >
        {finished && p.finishRank === 1 ? '🏆' : initials(p.displayName)}
      </div>
    );
  });

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${race.cols}, 1fr)`,
    gridTemplateRows: `repeat(${race.rows}, 1fr)`,
    gap: 4,
    aspectRatio: `${race.cols} / ${race.rows}`,
    width: '100%',
    maxWidth: maxWidth ?? undefined,
    padding: 8,
    background: 'var(--pb-paper)',
    border: '1.5px solid var(--pb-line-2)',
    borderRadius: 14,
    boxShadow: '0 4px 0 var(--pb-line-2)',
  };

  return (
    <div style={gridStyle}>
      {tiles}
      {pawns}
    </div>
  );
}
