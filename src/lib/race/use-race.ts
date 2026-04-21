'use client';

// Client hook that keeps a RacePublic snapshot in sync via polling.
// Mirrors the quiz's useRoom shape so both surfaces look the same to
// callers. The Race store is memory-only today, so there's no
// Supabase Realtime path — if/when we back it with Postgres we can
// add a channel subscription here the same way useRoom does.

import { useEffect, useRef, useState } from 'react';
import type { RacePublic } from './race-types';

export interface UseRaceOptions {
  // Polling is the pacing knob for the whole race feel. 500ms is tight
  // enough for students to see the leader's avatar "jump" in near-
  // real-time without hammering /api/race during class.
  pollMs?: number;
}

export interface UseRaceResult {
  race: RacePublic | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRace(
  raceId: string | null,
  { pollMs = 500 }: UseRaceOptions = {},
): UseRaceResult {
  const [race, setRace] = useState<RacePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef(false);

  const fetcherRef = useRef<() => Promise<void>>(async () => {});
  fetcherRef.current = async () => {
    if (!raceId || inflight.current) return;
    inflight.current = true;
    try {
      const res = await fetch(`/api/race/rooms/${raceId}`);
      if (!res.ok) {
        setError('not-found');
        setRace(null);
        return;
      }
      const data = await res.json();
      setRace(data.race as RacePublic);
      setError(null);
    } catch {
      setError('fetch-failed');
    } finally {
      inflight.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!raceId) return;
    setLoading(true);
    fetcherRef.current();
  }, [raceId]);

  useEffect(() => {
    if (!raceId) return;
    const iv = setInterval(() => { fetcherRef.current(); }, pollMs);
    return () => clearInterval(iv);
  }, [raceId, pollMs]);

  return {
    race,
    loading,
    error,
    refresh: () => fetcherRef.current(),
  };
}
