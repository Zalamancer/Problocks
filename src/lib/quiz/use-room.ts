'use client';

// Client hook that keeps a RoomPublic snapshot in sync with the server.
// When Supabase is configured the hook subscribes to postgres_changes on
// the three quiz tables and refetches on any change. When it isn't
// configured the hook falls back to a 1-second polling loop. Both paths
// return the same `{ room, loading, error }` shape so components don't
// care which backend is live.

import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { RoomPublic } from './room-types';

export interface UseRoomOptions {
  // Polling interval used only when Supabase isn't configured. Tuned
  // low enough to feel live on the host screen without hammering the
  // server during a whole class period.
  pollMs?: number;
}

export interface UseRoomResult {
  room: RoomPublic | null;
  loading: boolean;
  error: string | null;
  // Manual refresh — host uses this after mutations to avoid waiting
  // for the next realtime tick.
  refresh: () => Promise<void>;
}

export function useRoom(
  roomId: string | null,
  { pollMs = 1000 }: UseRoomOptions = {},
): UseRoomResult {
  const [room, setRoom] = useState<RoomPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef(false);

  // Keep the latest fetcher in a ref so the realtime subscriber (which
  // only mounts once) always hits the current roomId.
  const fetcherRef = useRef<() => Promise<void>>(async () => {});
  fetcherRef.current = async () => {
    if (!roomId || inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch(`/api/quiz/rooms/${roomId}`);
      if (!res.ok) {
        setError('not-found');
        setRoom(null);
        return;
      }
      const data = await res.json();
      setRoom(data.room as RoomPublic);
      setError(null);
    } catch {
      setError('fetch-failed');
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  };

  // Initial fetch whenever the roomId flips.
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetcherRef.current();
  }, [roomId]);

  // Realtime OR polling — never both.
  useEffect(() => {
    if (!roomId) return;

    // Client-side check: if Supabase is configured we get a non-null
    // singleton. If not, fall back to polling.
    if (!supabase) {
      const iv = setInterval(() => { fetcherRef.current(); }, pollMs);
      return () => clearInterval(iv);
    }

    const channel: RealtimeChannel = supabase
      .channel(`quiz:${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_rooms', filter: `id=eq.${roomId}` },
        () => { fetcherRef.current(); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_players', filter: `room_id=eq.${roomId}` },
        () => { fetcherRef.current(); },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_answers', filter: `room_id=eq.${roomId}` },
        () => { fetcherRef.current(); },
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [roomId, pollMs]);

  return {
    room,
    loading,
    error,
    refresh: () => fetcherRef.current(),
  };
}
