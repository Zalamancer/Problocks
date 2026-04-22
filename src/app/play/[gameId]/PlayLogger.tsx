'use client';
import { useEffect, useRef } from 'react';

// Fires one POST /api/games/[id]/play on mount so the server can log the
// event and bump plays_count. Uses a ref + session-storage guard so that a
// React 18 strict-mode double-render or a quick refresh loop doesn't triple
// the count for one real play.

interface Props {
  gameId: string;
}

export function PlayLogger({ gameId }: Props) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    const sessionKey = `pb:play:${gameId}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, String(Date.now()));
    } catch {
      // private-mode browsers may throw — ignore and log anyway.
    }

    fetch(`/api/games/${gameId}/play`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(() => {
      // Silent — play telemetry is best-effort.
    });
  }, [gameId]);

  return null;
}
